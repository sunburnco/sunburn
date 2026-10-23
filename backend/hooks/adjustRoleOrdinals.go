package hooks

import (
	"math"
	"slices"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func AdjustRoleOrdinals(e *core.RecordEvent) error {
	server := e.Record.GetString("server")

	txErr := e.App.RunInTransaction(func(txApp core.App) error {
		collection, err := txApp.FindCollectionByNameOrId("serverRoles")
		if err != nil {
			return err
		}

		roles, err := txApp.FindAllRecords(collection,
			dbx.NewExp("server = {:server}", dbx.Params{"server": server}))
		if err != nil {
			return err
		}

		slices.SortFunc(roles, func(a *core.Record, b *core.Record) int {
			res := b.GetFloat("ordinal") - a.GetFloat("ordinal")
			if res < 0 {
				return -1
			} else if res > 0 {
				return 0
			} else {
				return 0
			}
		})
		if len(roles) == 0 {
			return nil
		}

		maxOrdinal := len(roles) - 1
		offset := int(math.Ceil(math.Abs(roles[0].GetFloat("ordinal")) + float64(maxOrdinal) + 99))
		// set ordinals twice -- once to the correct order but ridiculously high, then once to bring it back to the correct range
		// this results in 2n UPDATE triggers when this trigger exits, where n is the number of roles in the server
		// using raw SQL could probably cut the number down to n
		// however, role reordering is a rare operation, and the resulting triggers exit very quickly
		//
		// technically, this trigger is O(mn), where m is the number of updates and n is the number of rows
		// again though, most triggers will exit quickly if the roles are already in order
		for i, role := range roles {
			if role.GetFloat("ordinal") == float64(maxOrdinal-i) {
				continue
			}
			role.Set("ordinal", maxOrdinal-i+offset)
			if err := txApp.Save(role); err != nil {
				return err
			}
		}

		for i, role := range roles {
			if role.GetFloat("ordinal") == float64(maxOrdinal-i) {
				continue
			}
			role.Set("ordinal", maxOrdinal-i)
			if err := txApp.Save(role); err != nil {
				return err
			}
		}

		return nil
	})
	if txErr != nil {
		return txErr
	}

	return e.Next()
}
