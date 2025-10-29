package main

import (
	"os"

	"sunburn.co/backend/hooks"
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

	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./svelteOut"), false))

		return se.Next()
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{})

	// soft delete
	app.OnRecordDelete().BindFunc(hooks.OnRecordDelete)
	app.Cron().Add("cleanSoftDelete", "0 0 * * *", func() {
		hooks.CronCleanSoftDeletes(app)
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
	app.OnRecordUpdate("serverRoles").BindFunc(hooks.LockedColumns_ServerRoles)

	app.OnRecordUpdate("messages").BindFunc(hooks.SetMessageEdited)

	app.OnRecordAfterCreateSuccess("users").BindFunc(hooks.SetServerQuota)
	app.OnRecordValidate("users").BindFunc(hooks.LowercaseHandle)
	app.OnRecordValidate("channelRoleAssignments").BindFunc(hooks.ChannelRoles_MatchingServerID)
	app.OnRecordValidate("messages").BindFunc(hooks.Messages_MutuallyExclusiveDestinations)

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.BindFunc(hooks.SendVersionHeader)

		return se.Next()
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/lkwebhook", livekit.LiveKitWebhook)
		se.Router.POST("/lk/{channel}/token", livekit.LiveKitToken)

		return se.Next()
	})

	if err := app.Start(); err != nil {
		app.Logger().Error("Pocketbase error", "err", err)
	}
}
