package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

type Permission struct {
	id                 string
	shift              int
	isServerPermission bool
}

func init() {
	m.Register(func(app core.App) error {
		perms := []Permission{
			{"SERVER_MEMBER", 0, true},
			{"CHANNEL_READ", 1, false},
			{"CHANNEL_SEND", 2, false},
			{"CALL_VIDEO", 3, false},
			{"ADD_REACTIONS", 4, false},
			{"USE_ATTACHMENTS", 5, false},
			{"EXTERNAL_EMOJI", 6, false},
			{"MANAGE_MESSAGES", 7, false},
			{"MANAGE_CALL_PARTICIPANTS", 8, false},
			{"MANAGE_WEBHOOKS", 9, false},
			{"CHANNEL_MUTED", 10, false},
			{"MANAGE_ROLE_PERMISSIONS", 44, true},
			{"MANAGE_ROLES", 45, true},
			{"SERVER_MUTED", 46, true},
			{"MENTION_EVERYONE", 47, true},
			{"CREATE_INVITES", 48, true},
			{"MANAGE_MEMBERS", 49, true},
			{"MANAGE_CHANNELS", 50, true},
			{"MANAGE_SERVER", 51, true},
			{"ADMINISTRATOR", 52, true},
		}

		collection, err := app.FindCollectionByNameOrId("_permissions")
		if err != nil {
			app.Logger().Warn("could not make _permissions", "error", err)
			return nil
		}

		for _, perm := range perms {
			rec, _ := app.FindRecordById("_permissions", perm.id)
			if rec != nil {
				continue
			}

			record := core.NewRecord(collection)
			record.Set("id", perm.id)
			record.Set("shift", perm.shift)
			record.Set("isServerPermission", perm.isServerPermission)

			if err := app.Save(record); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		return nil
	})
}
