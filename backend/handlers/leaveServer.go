package handlers

import (
	"errors"
	"net/http"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

func LeaveServer(e *core.RequestEvent) error {
	info, err := e.RequestInfo()
	if err != nil {
		return e.BadRequestError("", err)
	}

	userID := info.Auth.Id
	serverID := e.Request.PathValue("serverID")

	// owners cannot leave the server
	// TODO or, if they do, it'll delete the server
	server, err := e.App.FindRecordById("servers", serverID)
	if err != nil {
		return e.NotFoundError("", err)
	}
	if userID == server.GetString("owner") {
		return e.ForbiddenError("You are not allowed to leave a server you own", errors.New("you cannot leave a server you own"))
	}

	serverRolesFilter := dbx.NewExp("server={:serverID}", dbx.Params{"serverID": serverID})
	serverRoles, err := e.App.FindAllRecords("serverRoles", serverRolesFilter)
	if err != nil {
		return e.InternalServerError("", err)
	}
	serverRoleIDs := []any{}
	for _, serverRole := range serverRoles {
		serverRoleIDs = append(serverRoleIDs, serverRole.Id)
	}

	filter := dbx.NewExp("user={:userID}", dbx.Params{"userID": userID})
	filter2 := dbx.In("role", serverRoleIDs...)
	recs, err := e.App.FindAllRecords("serverRoleAssignments", filter, filter2)
	if err != nil {
		return e.NotFoundError("", err)
	}

	for _, rec := range recs {
		if err := e.App.Delete(rec); err != nil {
			return e.InternalServerError("", err)
		}
	}

	return e.JSON(http.StatusOK, map[string]any{})
}
