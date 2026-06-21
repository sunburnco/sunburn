package main

import (
	"fmt"
	"os"

	"sunburn.co/backend/handlers"
	"sunburn.co/backend/hooks"
	"sunburn.co/backend/lib"
	"sunburn.co/backend/livekit"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "sunburn.co/backend/migrations"
)

func main() {
	godotenv.Load(".env")

	fmt.Printf(`

  .d88888b                    dP
  88.    "'                   88
  'Y88888b. no    no .od888b. 88.d88b. no    no .od888b. .od888b.
        '8b 88    88 88'  '88 88'  '88 88    88 88'  'dP 88'  '88
  d8'   .8P 88.  .88 88    88 88.  .88 88.  .88 88       88    88
   Y88888P  '88888P' dB    dB '8Y8888' '88888P' dB       dB    dB

                                                  Version %s

  .--------------------------------------------------------------.
  |                                                              |
  |  Your feedback inspires the developer to keep building new   |
  |  features! Please consider sending your setup experience,    |
  |  use case, feature requests, pain points, or a quick hello.  |
  |                                                              |
  |               >>>    hello@sunburn.co    <<<                 |
  |                                                              |
  '--------------------------------------------------------------'

`, lib.VERSION)

	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pwa"), true))
		return se.Next()
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{})

	// plugin := proxyPlugin.MustRegister(app, &proxyPlugin.Options{
	// 	Enabled: true,
	// 	Url:     "http://localhost:4000",
	// })
	// plugin.SetSkipper(func(c *core.RequestEvent) bool {
	// 	return strings.HasPrefix(c.Request.URL.Path, "/_/") ||
	// 		strings.HasPrefix(c.Request.URL.Path, "/api/") ||
	// 		strings.HasPrefix(c.Request.URL.Path, "/lk/") ||
	// 		c.Request.URL.Path == "/lkwebhook"
	// })

	// soft delete
	app.OnRecordDelete().BindFunc(hooks.OnRecordDelete)
	app.Cron().Add("cleanSoftDelete", "0 0 * * *", func() {
		hooks.CronCleanSoftDeletes(app)
	})
	app.Cron().Add("checkForUpdates", "0 2 * * *", func() {
		hooks.CronCheckVersion(app)
	})

	// require auth
	app.OnRecordsListRequest().BindFunc(hooks.RequireAuthForListRequestEvent)
	app.OnRecordViewRequest().BindFunc(hooks.RequireAuthForRequestEvent)
	app.OnRecordCreateRequest().BindFunc(hooks.RequireAuthForRequestEvent)
	app.OnRecordUpdateRequest().BindFunc(hooks.RequireAuthForRequestEvent)
	app.OnRecordDeleteRequest().BindFunc(hooks.RequireAuthForRequestEvent)

	// locked columns
	app.OnRecordUpdate("channelRoleAssignments").BindFunc(hooks.LockedColumns_ChannelRoleAssignments)
	app.OnRecordUpdate("channels").BindFunc(hooks.LockedColumns_Channels)
	app.OnRecordUpdate("messages").BindFunc(hooks.LockedColumns_Messages)
	app.OnRecordUpdate("serverRoleAssignments").BindFunc(hooks.LockedColumns_ServerRoleAssignments)
	app.OnRecordUpdate("serverRolePermissions").BindFunc(hooks.LockedColumns_ServerRolePermissions)
	app.OnRecordUpdate("serverRoles").BindFunc(hooks.LockedColumns_ServerRoles)
	app.OnRecordUpdate("voiceParticipants").BindFunc(hooks.LockedColumns_VoiceParticipants)

	app.OnRecordUpdate("messages").BindFunc(hooks.SetMessageEdited)

	app.OnRecordAfterCreateSuccess("users").BindFunc(hooks.SetServerQuota)
	app.OnRecordValidate("users").BindFunc(hooks.LowercaseHandle)
	app.OnRecordValidate("channelRoleAssignments").BindFunc(hooks.ChannelRoles_MatchingServerID)
	app.OnRecordValidate("messages").BindFunc(hooks.Messages_MutuallyExclusiveDestinations)
	app.OnRecordValidate("channels").BindFunc(hooks.Channels_ValidTypes)
	app.OnRecordAfterCreateSuccess("serverRoles").BindFunc(hooks.AdjustRoleOrdinals)
	app.OnRecordAfterUpdateSuccess("serverRoles").BindFunc(hooks.AdjustRoleOrdinals)
	app.OnRecordAfterDeleteSuccess("serverRoles").BindFunc(hooks.AdjustRoleOrdinals)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.BindFunc(hooks.SendVersionHeader)

		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// TODO deprecate these first two
		se.Router.POST("/lkwebhook", livekit.LiveKitWebhook)
		se.Router.POST("/lk/{channel}/token", livekit.LiveKitToken)

		se.Router.POST("/api/sb/lkwebhook", livekit.LiveKitWebhook)
		se.Router.POST("/api/sb/lk/{channel}/token", livekit.LiveKitToken)

		se.Router.POST("/api/sb/acceptInvite/{slug}", handlers.AcceptInvite)
		se.Router.POST("/api/sb/servers/{serverID}/leave", handlers.LeaveServer)

		return se.Next()
	})

	if err := app.Start(); err != nil {
		app.Logger().Error("Pocketbase error", "err", err)
	}
}
