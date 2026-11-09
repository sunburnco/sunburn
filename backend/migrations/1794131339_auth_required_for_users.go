package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		collection.ViewRule = new(`@request.auth.id != ""`)
		collection.ListRule = new(`@request.auth.id != ""`)

		return app.Save(collection)
	}, func(app core.App) error {
		// before this patch, the default rule was empty (`""`),
		// however, I'm not going to revert to that rule

		return nil
	})
}
