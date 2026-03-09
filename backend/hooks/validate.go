package hooks

import (
	"errors"
	"fmt"
	"slices"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

func LowercaseHandle(e *core.RecordEvent) error {
	lowercase := strings.ToLower(e.Record.GetString("handle"))
	e.Record.Set("handle_lowercase", lowercase)

	return e.Next()
}

func ChannelRoles_MatchingServerID(e *core.RecordEvent) error {
	roleID := e.Record.GetString("role")
	channelID := e.Record.GetString("channel")

	role, err := e.App.FindRecordById("serverRoles", roleID)
	if err != nil {
		return errors.New("could not find role")
	}
	roleServerID := role.GetString("server")

	channel, err := e.App.FindRecordById("channels", channelID)
	if err != nil {
		return errors.New("could not find channel")
	}
	channelServerID := channel.GetString("server")

	if channelServerID != roleServerID {
		return errors.New("role and channel are not in the same server")
	}

	return e.Next()
}

func Messages_MutuallyExclusiveDestinations(e *core.RecordEvent) error {
	// xor
	if (e.Record.GetString("to") != "") == (e.Record.GetString("channel") != "") {
		return errors.New("message must be to exactly one recipient or channel")
	}

	return e.Next()
}

func Channels_ValidTypes(e *core.RecordEvent) error {
	validChannelTypes := []string{"text", "voice"}
	channelType := e.Record.GetString("type")

	if slices.Index(validChannelTypes, channelType) == -1 {
		return fmt.Errorf("invalid channel type (valid types are %q)", validChannelTypes)
	}

	return e.Next()
}
