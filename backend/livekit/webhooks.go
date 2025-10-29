package livekit

import (
	"net/http"
	"os"

	lkauth "github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/webhook"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func LiveKitWebhook(e *core.RequestEvent) error {
	authProvider := lkauth.NewSimpleKeyProvider(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))

	event, err := webhook.ReceiveWebhookEvent(e.Request, authProvider)
	if err != nil {
		// invalid signing
		return e.ForbiddenError("", err)
	}

	switch event.Event {
	case "participant_joined":
		user := event.Participant.Identity
		channel := event.Room.Name // ID

		collection, err := e.App.FindCollectionByNameOrId("voiceParticipants")
		if err != nil {
			return e.InternalServerError("", err)
		}

		record := core.NewRecord(collection)

		record.Set("user", user)
		record.Set("channel", channel)

		if err := e.App.Save(record); err != nil {
			return e.InternalServerError("", err)
		}

	case "participant_left":
		user := event.Participant.Identity
		channel := event.Room.Name // ID

		records, err := e.App.FindRecordsByFilter("voiceParticipants",
			"user = {:user} && channel = {:channel}",
			"",
			10,
			0,
			dbx.Params{"user": user, "channel": channel},
		)
		if err != nil {
			return e.InternalServerError("", err)
		}

		for _, record := range records {
			if err := e.App.Delete(record); err != nil {
				return e.InternalServerError("", err)
			}
		}
	}

	return e.String(http.StatusOK, "")
}
