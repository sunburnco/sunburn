package hooks

import "github.com/pocketbase/pocketbase/core"

func RequireAuthForRequestEvent(e *core.RecordRequestEvent) error {
	if e.Auth.Id == "" {
		return e.ForbiddenError("Authorization required", nil)
	}

	return e.Next()
}

func RequireAuthForListRequestEvent(e *core.RecordsListRequestEvent) error {
	if e.Auth.Id == "" {
		return e.ForbiddenError("Authorization required", nil)
	}

	return e.Next()
}
