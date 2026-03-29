package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("invites")
		if err != nil {
			return err
		}

		field := collection.Fields.GetByName("id").(*core.TextField)
		field.Min = 1
		field.Max = 100

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("invites")
		if err != nil {
			return err
		}

		field := collection.Fields.GetByName("id").(*core.TextField)
		field.Min = 15
		field.Max = 15

		return app.Save(collection)
	})
}
