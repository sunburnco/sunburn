package hooks

import (
	"github.com/pocketbase/pocketbase/core"
)

func SetMessageEdited(e *core.RecordEvent) error {
	e.Record.Set("edited", true)
	return e.Next()
}
