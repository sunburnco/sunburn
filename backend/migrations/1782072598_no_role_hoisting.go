package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("serverRoles")
		if err != nil {
			return err
		}

		collection.UpdateRule = new(`(
  // owner
  @request.auth.id = server.owner
)
||
(
  // user has "manage roles" permission
  @request.auth.cumulativeServerPermissions_via_user.server ?= server.id &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  (
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_ROLES" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  ) &&
  // and ordinal is lower than max ordinal
  (
    @request.auth.maxOrdinal_via_user.server ?= server.id &&
    @request.auth.maxOrdinal_via_user.user = @request.auth.id &&
    ordinal ?< @request.auth.maxOrdinal_via_user.maxOrdinal &&
    @request.body.ordinal ?< @request.auth.maxOrdinal_via_user.maxOrdinal
  )
)`)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("serverRoles")
		if err != nil {
			return err
		}

		collection.UpdateRule = new(`(
  // owner
  @request.auth.id = server.owner
)
||
(
  // user has "manage roles" permission
  @request.auth.cumulativeServerPermissions_via_user.server ?= server.id &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  (
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_ROLES" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  ) &&
  // and ordinal is lower than max ordinal
  (
    @request.auth.maxOrdinal_via_user.server ?= server.id &&
    @request.auth.maxOrdinal_via_user.user = @request.auth.id &&
    ordinal ?< @request.auth.maxOrdinal_via_user.maxOrdinal &&
  )
)`)

		return app.Save(collection)
	})
}
