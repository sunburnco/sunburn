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

		collection.Fields.Add(&core.TextField{
			Name: "presence",
			// although the allowed values should be something like `online`, `away`, `offline`, etc,
			// it's easier to allow any value and just make the UI react appropriately
			Required: false,
		})
		// no need to add a "presenceUntil" field.
		// - when the realtime connection ends, the hook will set presence appropriately
		// - there won't be an option to reset status after x minutes

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		collection.Fields.RemoveByName("presence")

		return app.Save(collection)
	})
}
