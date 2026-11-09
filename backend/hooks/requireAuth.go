package hooks

import "github.com/pocketbase/pocketbase/core"

// TODO these aren't doing anything (should be e.Auth == nil || e.Auth.Id == "")
// TODO regardless, they shouldn't exist; use API rules instead (the "invites" table needs guest access)
func RequireAuthForRequestEvent(e *core.RecordRequestEvent) error {
	if e.Auth != nil && e.Auth.Id == "" {
		return e.ForbiddenError("Authorization required", nil)
	}

	return e.Next()
}

func RequireAuthForListRequestEvent(e *core.RecordsListRequestEvent) error {
	if e.Auth != nil && e.Auth.Id == "" {
		return e.ForbiddenError("Authorization required", nil)
	}

	return e.Next()
}
