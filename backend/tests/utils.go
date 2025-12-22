package tests

import (
	"fmt"
	"strings"

	"github.com/pocketbase/pocketbase/tests"
)

const (
	BOB = iota
	ALICE
	MOD
	ADMIN
	OWNER
	CHARLIE_MOD
	CHARLIE_ADMIN
	CHARLIE
)

const testDataDir = "../test_data"

func generateToken(collectionNameOrId string, email string) (string, error) {
	app, err := tests.NewTestApp(testDataDir)
	if err != nil {
		return "", err
	}
	defer app.Cleanup()

	record, err := app.FindAuthRecordByEmail(collectionNameOrId, email)
	if err != nil {
		return "", err
	}

	return record.NewAuthToken()
}

func generateTokens() ([]string, error) {
	users := []string{"bob", "alice", "mod", "admin", "owner", "charlieMod", "charlieAdmin", "charlie"}
	tokens := make([]string, len(users))

	for i, user := range users {
		token, err := generateToken("users", fmt.Sprintf("%s@s.b", user))
		if err != nil {
			return nil, err
		}
		tokens[i] = token
	}

	return tokens, nil
}

func rprintf(format string, a ...any) *strings.Reader {
	return strings.NewReader(fmt.Sprintf(format, a...))
}
