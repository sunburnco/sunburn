package tests

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
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

const _200 = http.StatusOK
const _202 = http.StatusNoContent
const _400 = http.StatusBadRequest
const _404 = http.StatusNotFound

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

func makeFactory(t testing.TB) *tests.TestApp {
	testApp, err := tests.NewTestApp(testDataDir)
	if err != nil {
		t.Fatal(err)
	}

	return testApp
}

func assignPermissions(permissions []string, roles []string) func(t testing.TB, app *tests.TestApp, _ *core.ServeEvent) {
	ids := []string{DUMMY_ID1, DUMMY_ID2, DUMMY_ID3, DUMMY_ID4, DUMMY_ID5, DUMMY_ID6, DUMMY_ID7, DUMMY_ID8, DUMMY_ID9, DUMMY_IDA, DUMMY_IDB, DUMMY_IDC, DUMMY_IDD, DUMMY_IDE, DUMMY_IDF}
	return func(t testing.TB, app *tests.TestApp, _ *core.ServeEvent) {
		for i, permission := range permissions {
			for j, role := range roles {
				if _, err := app.DB().Insert("serverRolePermissions", dbx.Params{
					"id":         ids[i*j+j],
					"role":       role,
					"permission": permission,
				}).Execute(); err != nil {
					t.Fatal(err)
				}
			}
		}
	}
}

func cleanupPermissions() func(t testing.TB, app *tests.TestApp, _ *http.Response) {
	return func(t testing.TB, app *tests.TestApp, _ *http.Response) {
		if _, err := app.DB().Delete("serverRolePermissions", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
			t.Fatal(err)
		}
	}
}
