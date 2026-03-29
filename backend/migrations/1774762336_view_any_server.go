package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("servers")
		if err != nil {
			return err
		}

		collection.ViewRule = types.Pointer("")

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("servers")
		if err != nil {
			return err
		}

		collection.ViewRule = types.Pointer(`(
  // owner
  @request.auth.id = owner
)
||
(
  // user has "server member" permission
  @request.auth.cumulativeServerPermissions_via_user.server ?= id &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER"
)`)

		return app.Save(collection)
	})
}
