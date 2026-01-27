package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

func makeRole(roleName string, roleOrdinal float32) func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
	makePerms := assignPermissions([]string{"MANAGE_ROLES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
		if _, err := app.DB().Insert("serverRoles", dbx.Params{
			"id":      DUMMY_IDA,
			"name":    roleName,
			"ordinal": roleOrdinal,
			"server":  SERVER_MAIN,
		}).Execute(); err != nil {
			t.Fatal(err)
		}

		makePerms(t, app, e)
	}
}

func cleanRole() func(t testing.TB, app *tests.TestApp, r *http.Response) {
	cleanPerms := cleanupPermissions()

	return func(t testing.TB, app *tests.TestApp, r *http.Response) {
		if _, err := app.DB().Delete("serverRoles", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
			t.Fatal(err)
		}

		cleanPerms(t, app, r)
	}
}

func TestServersRolesAndAssignments(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}

	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatuses := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_404, _404, _200, _200, _200, _404, _404, _404},
		{_404, _404, _204, _204, _204, _404, _404, _404},
		{_400, _400, _400, _200, _200, _400, _400, _400},
		{_404, _404, _404, _200, _200, _404, _404, _404},
		{_404, _404, _404, _204, _204, _404, _404, _404},
		{_400, _400, _400, _400, _200, _400, _400, _400},
		{_404, _404, _404, _404, _200, _404, _404, _404},
		{_404, _404, _404, _404, _204, _404, _404, _404},
	}

	expectedContents := [][][]string{
		{{`"totalItems":0`}, {`"totalItems":7`}, {`"totalItems":7`}, {`"totalItems":7`}, {`"totalItems":7`}, {`"totalItems":7`}, {`"totalItems":7`}, {`"totalItems":7`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
	}

	scenarios := []func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario{
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d See roles for server", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records?filter=(server='%s')", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create the \"deleteme\" role (ordinal 1.5)", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRoles/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"server": "%s",
					"name": "deleteme",
					"ordinal": 1.5
				}`, SERVER_MAIN),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Change the color on the \"deleteme\" role", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
				  "color": "#ff0000"
				}`),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("deleteme", 1.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete the \"deleteme\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("deleteme", 1.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create the \"modplus\" role (ordinal 3.5)", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRoles/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"server": "%s",
					"name": "modplus",
					"ordinal": 3.5
				}`, SERVER_MAIN),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Change the color on the \"modplus\" role", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
				  "color": "#ff0000"
				}`),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("modplus", 3.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete the \"modplus\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("modplus", 3.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create the \"adminplus\" role (ordinal 5.5)", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRoles/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"server": "%s",
					"name": "adminplus",
					"ordinal": 5.5
				}`, SERVER_MAIN),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Change the color on the \"adminplus\" role", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
				  "color": "#ff0000"
				}`),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("adminplus", 5.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete the \"adminplus\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRoles/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeRole("adminplus", 5.5),
				AfterTestFunc:   cleanRole(),
				TestAppFactory:  makeFactory,
			}
		},
	}

	for i, scenario := range scenarios {
		for j, token := range tokens {
			scenario(i, j, token, userArray[j]).Test(t)
		}
	}
}
