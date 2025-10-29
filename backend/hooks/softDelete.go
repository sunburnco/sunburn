package hooks

import (
	"slices"

	"github.com/pocketbase/pocketbase/core"
)

// https://github.com/pocketbase/pocketbase/discussions/2694#discussioncomment-11842680
func OnRecordDelete(e *core.RecordEvent) error {
	l := e.App.Logger()

	const (
		DeletedCollectionName = "deleted"
	)

	// Add other collection names here where you don't want to keep a copy of the deleted record
	excludedCollections := []string{
		DeletedCollectionName,
		"pinnedDMs",
		"pinnedServers",
		"voiceParticipants",
	}

	recordCollection := e.Record.Collection().Name

	// Skip if the record is already deleted or in excluded collections
	if slices.Contains(excludedCollections, recordCollection) {
		l.Debug("Skipping soft delete", "record", e.Record, "collection", recordCollection)
		return e.Next()
	}

	deleteCollection, err := e.App.FindCollectionByNameOrId(DeletedCollectionName)
	if err != nil {
		l.Error("Failed to find collection", "collection", DeletedCollectionName, "error", err)
		return err
	}

	newDeletedRecord := core.NewRecord(deleteCollection)

	newDeletedRecord.Set("collection", recordCollection)
	newDeletedRecord.Set("record", e.Record)

	if err := e.App.Save(newDeletedRecord); err != nil {
		l.Error("Failed to soft delete record", "record", e.Record, "collection", recordCollection, "error", err)
		return err
	}

	return e.Next()
}
