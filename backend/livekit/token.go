package livekit

import (
	"net/http"
	"os"
	"time"

	lkauth "github.com/livekit/protocol/auth"
	"github.com/pocketbase/pocketbase/core"
)

const tokenDuration = 8 * time.Hour

func LiveKitToken(e *core.RequestEvent) error {
	slug := e.Request.PathValue("channel")

	record, err := e.App.FindFirstRecordByData("channels", "id", slug)
	if err != nil {
		return e.NotFoundError("", err)
	}

	info, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("", err)
	}

	canAccess, err := e.App.CanAccessRecord(record, info, record.Collection().ViewRule)
	if !canAccess {
		return e.ForbiddenError("", err)
	}

	// TODO use info.Auth.Id to check for CHANNEL_SEND and update the Publish grant accordingly

	baseURL := os.Getenv("LIVEKIT_BASE_URL")
	if baseURL == "" {
		return e.InternalServerError("missing livekit base url", nil)
	}

	token := lkauth.NewAccessToken(os.Getenv("LIVEKIT_API_KEY"), os.Getenv("LIVEKIT_API_SECRET"))
	grant := &lkauth.VideoGrant{
		RoomJoin: true,
		Room:     slug,
	}
	token.SetVideoGrant(grant).SetValidFor(tokenDuration).SetIdentity(e.Auth.Id)
	expiry := time.Now().Add(tokenDuration)

	jwt, err := token.ToJWT()
	if err != nil {
		return e.InternalServerError("", err)
	}

	return e.JSON(http.StatusOK, map[string]any{
		"token":          jwt,
		"expirationUnix": expiry.Unix(),
		"baseURL":        baseURL,
	})
}
