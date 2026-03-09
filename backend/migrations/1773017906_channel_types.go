package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("channels")
		if err != nil {
			return err
		}
		collection.Fields.Add(&core.TextField{
			Name:                "type",
			Required:            true,
			AutogeneratePattern: "text",
		})

		if err := app.Save(collection); err != nil {
			return err
		}

		if _, err := app.DB().NewQuery("UPDATE channels SET type = 'text'").Execute(); err != nil {
			return err
		}
		if _, err := app.DB().NewQuery("UPDATE channels SET type = 'voice' WHERE voice IS TRUE").Execute(); err != nil {
			return err
		}

		collection, err = app.FindCollectionByNameOrId("channels")
		collection.Fields.RemoveByName("voice")

		return app.Save(collection)
	}, nil)
}
