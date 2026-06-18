package hooks

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/pocketbase/pocketbase"
	"sunburn.co/backend/lib"
)

type versionResponse_t struct {
	Version string `json:"version"`
}

func CronCheckVersion(app *pocketbase.PocketBase) {
	skipCheck := strings.ToLower(os.Getenv("SKIP_VERSION_CHECK"))
	switch skipCheck {
	case "y", "yes", "t", "true", "1":
		return
	}

	resp, err := http.Get("https://on.sb/api/sb/version")
	if err != nil {
		app.Logger().Warn("unable to check for updates", "err", err)
		return
	}

	versionResponse := &versionResponse_t{}
	if err := json.NewDecoder(resp.Body).Decode(versionResponse); err != nil {
		app.Logger().Warn("unable to check for updates", "err", err)
		return
	}

	if versionResponse.Version == "" {
		app.Logger().Warn("got blank version string when checking for updates")
		return
	}

	if lib.VERSION != versionResponse.Version {
		app.Logger().Warn("a new version of Sunburn is available", "v", versionResponse.Version)
	}
}
