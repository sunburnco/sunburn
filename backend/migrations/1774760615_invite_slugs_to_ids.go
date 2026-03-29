package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		if _, err := app.DB().NewQuery("UPDATE invites SET id = slug").Execute(); err != nil {
			return err
		}

		collection, err := app.FindCollectionByNameOrId("invites")
		if err != nil {
			return err
		}

		collection.Fields.RemoveByName("slug")
		collection.RemoveIndex("idx_IpYALKDa1T")

		if err := app.Save(collection); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		collection, err := app.FindCachedCollectionByNameOrId("invites")
		if err != nil {
			return err
		}

		collection.Fields.Add(&core.TextField{
			Name:                "slug",
			Required:            true,
			AutogeneratePattern: "[a-z0-9]{6}",
		})

		collection.AddIndex("idx_IpYALKDa1T", true, "slug", "")

		if err := app.Save(collection); err != nil {
			return err
		}

		if _, err := app.DB().NewQuery("UPDATE invites SET slug = id").Execute(); err != nil {
			return err
		}

		return nil
	})
}
