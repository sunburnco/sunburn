package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		settings := app.Settings()
		settings.Meta.AccentColor = "#f82d19"

		return app.Save(settings)
	}, func(app core.App) error {
		return nil
	})
}
