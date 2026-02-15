package hooks

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
)

func checkLockedColumns(lockedColumns []string, e *core.RecordEvent) error {
	for _, col := range append(lockedColumns, "id") {
		if e.Record.Original().Get(col) != e.Record.Get(col) {
			return fmt.Errorf("%s cannot be updated", col)
		}
	}
	return nil
}

func LockedColumns_ChannelRoleAssignments(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"channel", "role", "server"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_Channels(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"server"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_Messages(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"from", "to", "channel"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_ServerRoleAssignments(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"user", "role"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_ServerRolePermissions(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"role", "permission"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_ServerRoles(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"server"}, e); err != nil {
		return err
	}
	return e.Next()
}

func LockedColumns_VoiceParticipants(e *core.RecordEvent) error {
	if err := checkLockedColumns([]string{"user", "channel"}, e); err != nil {
		return err
	}
	return e.Next()
}
