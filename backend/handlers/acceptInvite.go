package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func AcceptInvite(e *core.RequestEvent) error {
	// adds the ordinal-0 role to the user
	slug := e.Request.PathValue("slug")

	inviteRecord, err := e.App.FindFirstRecordByData("invites", "slug", slug)
	if err != nil {
		return e.NotFoundError("", err)
	}

	info, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("", err)
	}

	userID := info.Auth.Id

	canAccess, err := e.App.CanAccessRecord(inviteRecord, info, inviteRecord.Collection().ViewRule)
	if !canAccess {
		// 404 to prevent listing attempts
		return e.NotFoundError("", err)
	}

	serverID := inviteRecord.Get("server").(string)
	if serverID == "" {
		return e.InternalServerError("", nil)
	}

	roleRecord, err := e.App.FindFirstRecordByFilter(
		"serverRoles",
		"server={:serverID} && ordinal=0",
		dbx.Params{"serverID": serverID})
	if err != nil {
		return e.InternalServerError("", err)
	}

	roleID := roleRecord.Get("id").(string)

	if _, err := e.App.FindFirstRecordByFilter(
		"serverRoleAssignments",
		"role={:roleID} && user={:userID}",
		dbx.Params{"roleID": roleID, "userID": userID}); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// user already has role with ordinal 0
			return e.JSON(http.StatusOK, map[string]any{})
		}
	}

	if _, err := e.App.DB().Insert("serverRoleAssignments", dbx.Params{
		"role": roleID,
		"user": userID,
	}).Execute(); err != nil {
		return e.InternalServerError("", err)
	}

	return e.JSON(http.StatusOK, map[string]any{})
}
