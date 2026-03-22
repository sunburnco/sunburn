package migrations

import (
	"database/sql"
	"errors"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		serversCollection, err := app.FindCollectionByNameOrId("servers")
		if err != nil {
			return err
		}

		collection := core.NewBaseCollection("invites")

		collection.ViewRule = types.Pointer("")
		collection.CreateRule = types.Pointer(`(
  // is owner
  server.owner = @request.auth.id
)
||
(
  // user has "server member"
  @request.auth.cumulativeServerPermissions_via_user.server ?= server.id &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
  // and "admin" or "manage server" or "create invites"
  (
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "CREATE_INVITES" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_SERVER" ||
    @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
  )
)`)
		collection.DeleteRule = types.Pointer(`(
	// is owner
	server.owner = @request.auth.id
)
||
(
	// user has "server member"
	@request.auth.cumulativeServerPermissions_via_user.server ?= server.id &&
	@request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
	@request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER" &&
	// and "admin" or "manage server"
	(
	  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "MANAGE_SERVER" ||
	  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "ADMINISTRATOR"
	)
)`)

		collection.Fields.Add(&core.TextField{
			Name:                "slug",
			Required:            true,
			AutogeneratePattern: "[a-z0-9]{6}",
		}, &core.RelationField{
			Name:          "server",
			CollectionId:  serversCollection.Id,
			Required:      true,
			CascadeDelete: true,
			MinSelect:     1,
			MaxSelect:     1,
		}, &core.AutodateField{
			Name:     "created",
			OnCreate: true,
		}, &core.AutodateField{
			Name:     "updated",
			OnCreate: true,
			OnUpdate: true,
		})

		collection.AddIndex("idx_IpYALKDa1T", true, "slug", "")

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("invites")
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil
			}
			return err
		}

		return app.Delete(collection)
	})
}
