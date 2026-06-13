package migrations

import (
	"database/sql"
	"errors"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// add up queries...
		collection := core.NewViewCollection("serverMembers")
		collection.ViewQuery = `SELECT
  (ROW_NUMBER() OVER(
    ORDER BY
    CASE
      WHEN u.name IS NULL OR u.name = "" THEN u.handle
      ELSE u.name
      END
    ASC
  )) AS id,
  u.id user,
  u.name name,
  u.handle handle,
  csp.server,
  csp.permissions
FROM
	cumulativeServerPermissions csp
	LEFT JOIN users u ON u.id = csp.user;`

		accessRule := `(
  // owner
  @request.auth.id = server.owner
)
||
(
  // user has "server member" permission
  @request.auth.cumulativeServerPermissions_via_user.server ?= server.id &&
  @request.auth.cumulativeServerPermissions_via_user.user = @request.auth.id &&
  @request.auth.cumulativeServerPermissions_via_user.permissions ?~ "SERVER_MEMBER"
)`
		collection.ViewRule = new(accessRule)
		collection.ListRule = new(accessRule)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("serverMembers")
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil
			}
			return err
		}

		return app.Delete(collection)
	})
}
