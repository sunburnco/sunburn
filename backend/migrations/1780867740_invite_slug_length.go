package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCachedCollectionByNameOrId("invites")
		if err != nil {
			return err
		}
		idField := collection.Fields.GetByName("id").(*core.TextField)
		idField.AutogeneratePattern = "[a-z0-9]{6}"

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCachedCollectionByNameOrId("invites")
		if err != nil {
			return err
		}
		idField := collection.Fields.GetByName("id").(*core.TextField)
		idField.AutogeneratePattern = "[a-z0-9]{15}"

		return app.Save(collection)
	})
}
