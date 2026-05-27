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

		handleField := collection.Fields.GetByName("handle_lowercase").(*core.TextField)
		handleField.Presentable = true

		avatarField := collection.Fields.GetByName("avatar").(*core.FileField)
		avatarField.Presentable = true

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		handleField := collection.Fields.GetByName("handle_lowercase").(*core.TextField)
		handleField.Presentable = false

		avatarField := collection.Fields.GetByName("avatar").(*core.FileField)
		avatarField.Presentable = false

		return app.Save(collection)
	})
}
