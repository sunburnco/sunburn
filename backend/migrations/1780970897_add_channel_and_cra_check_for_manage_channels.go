package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		cra, err := app.FindCollectionByNameOrId("channelRoleAssignments")
		if err != nil {
			return err
		}
		cra.ListRule = new(`(
  // is owner
  channel.server.owner = @request.auth.id
)
||
(
  // user has "server member" and "channel read"
  @request.auth.cumulativeChannelPermissions_via_user.channel ?= channel.id &&
  @request.auth.cumulativeChannelPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "CHANNEL_READ"
)
||
(
  // also need to check server permissions since a CCP row will not exist in certain situations
  @request.auth.cumulativeServerPermissions_via_user.server ?= channel.server &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  (
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_CHANNELS" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  )
)
  `)
		cra.ViewRule = new(*cra.ListRule)
		if err := app.Save(cra); err != nil {
			return err
		}

		channels, err := app.FindCollectionByNameOrId("channels")
		if err != nil {
			return err
		}
		channels.ListRule = new(`(
  // is owner
  server.owner = @request.auth.id
)
||
(
  // user has "server member" and "channel read"
  @request.auth.cumulativeChannelPermissions_via_user.channel ?= id &&
  @request.auth.cumulativeChannelPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "CHANNEL_READ"
)
||
(
  // also need to check server permissions since a CCP row will not exist in certain situations
  @request.auth.cumulativeServerPermissions_via_user.server ?= server &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  (
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_CHANNELS" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  )
)
  `)
		channels.ViewRule = new(*channels.ListRule)

		return app.Save(channels)
	}, func(app core.App) error {
		cra, err := app.FindCollectionByNameOrId("channelRoleAssignments")
		if err != nil {
			return err
		}
		cra.ListRule = new(`(
  // is owner
  channel.server.owner = @request.auth.id
)
||
(
  // user has "server member"
  @request.auth.cumulativeChannelPermissions_via_user.channel ?= channel.id &&
  @request.auth.cumulativeChannelPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  // and "admin" or "channel read"
  (
    @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "CHANNEL_READ" ||
    @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  )
)`)
		cra.ViewRule = new(*cra.ListRule)
		if err := app.Save(cra); err != nil {
			return err
		}

		channels, err := app.FindCollectionByNameOrId("channels")
		if err != nil {
			return err
		}
		channels.ListRule = new(`(
  // is owner
  server.owner = @request.auth.id
)
||
(
  // user has "server member"
  @request.auth.cumulativeChannelPermissions_via_user.channel ?= id &&
  @request.auth.cumulativeChannelPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  // and "admin" or "channel read"
  (
    @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "CHANNEL_READ" ||
    @request.auth.cumulativeChannelPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  )
)`)
		channels.ViewRule = new(*channels.ListRule)

		return app.Save(channels)
	})
}
