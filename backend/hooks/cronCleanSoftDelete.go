package hooks

import (
	"os"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
)

func CronCleanSoftDeletes(app *pocketbase.PocketBase) {
	days := os.Getenv("CLEAN_SOFT_DELETES_AFTER")
	if days == "" {
		days = "0"
	}

	if _, err := app.DB().
		Delete("deleted", dbx.NewExp(
			"unixepoch(created) < unixepoch('now', '-{:days} days', '+1 minute')",
			dbx.Params{days: days}),
		).
		Execute(); err != nil {
		app.Logger().Error("error cleaning soft deletes", "error", err)
	}
}
