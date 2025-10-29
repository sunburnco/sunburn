package hooks

import (
	"os"
	"strconv"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func SetServerQuota(e *core.RecordEvent) error {
	maxServers := os.Getenv("USER_DEFAULT_MAX_SERVERS")
	if maxServers == "" {
		maxServers = "0"
	}
	maxServers64, err := strconv.ParseInt(maxServers, 10, 64)
	if err != nil {
		return err
	}

	_, err = e.App.DB().Insert("serverQuotas", dbx.Params{
		"created":    time.Now(),
		"user":       e.Record.Id,
		"maxServers": maxServers64,
	}).Execute()
	if err != nil {
		return err
	}

	return e.Next()
}
