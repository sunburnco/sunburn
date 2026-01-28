package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

func makeAssignment(role, permission string) func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
	makePerms := assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
		if _, err := app.DB().Insert("serverRolePermissions", dbx.Params{
			"id":         DUMMY_IDA,
			"role":       role,
			"permission": permission,
		}).Execute(); err != nil {
			t.Fatal(err)
		}

		makePerms(t, app, e)
	}
}

func cleanAssignment() func(t testing.TB, app *tests.TestApp, r *http.Response) {
	cleanPerms := cleanupPermissions()

	return func(t testing.TB, app *tests.TestApp, r *http.Response) {
		if _, err := app.DB().Delete("serverRolePermissions", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
			t.Fatal(err)
		}

		cleanPerms(t, app, r)
	}
}

func TestServerRolePermissions(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}

	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatuses := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_404, _404, _204, _204, _204, _404, _404, _404},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_404, _404, _204, _204, _204, _404, _404, _404},
		{_400, _400, _400, _200, _200, _400, _400, _400},
		{_404, _404, _404, _204, _204, _404, _404, _404},
		{_400, _400, _400, _400, _200, _400, _400, _400},
		{_404, _404, _404, _404, _204, _404, _404, _404},
	}

	expectedContents := [][][]string{
		{{`"totalItems":0`}, {`"totalItems":9`}, {`"totalItems":9`}, {`"totalItems":9`}, {`"totalItems":9`}, {`"totalItems":9`}, {`"totalItems":9`}, {`"totalItems":9`}},
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
				Name:   fmt.Sprintf("%d.%d See role permission assignments for server", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/serverRolePermissions/records?filter=(role.server='%s')", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Give `MANAGE_ROLE_PERMISSIONS` to the \"dummy\" role", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRolePermissions/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"role": "%s",
					"permission": "%s"
				}`, ROLE_DUMMY, "MANAGE_ROLE_PERMISSIONS"),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Remove `MANAGE_ROLE_PERMISSIONS` from the \"dummy\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRolePermissions/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeAssignment(ROLE_DUMMY, "MANAGE_ROLE_PERMISSIONS"),
				AfterTestFunc:   cleanAssignment(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Give `MENTION_EVERYONE` to the \"dummy\" role", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRolePermissions/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"role": "%s",
					"permission": "%s"
				}`, ROLE_DUMMY, "MENTION_EVERYONE"),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Remove `MENTION_EVERYONE` from the \"dummy\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRolePermissions/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeAssignment(ROLE_DUMMY, "MENTION_EVERYONE"),
				AfterTestFunc:   cleanAssignment(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Give `MANAGE_ROLE_PERMISSIONS` to the \"dummyplus\" role", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRolePermissions/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"role": "%s",
					"permission": "%s"
				}`, ROLE_DUMMYPLUS, "MANAGE_ROLE_PERMISSIONS"),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Remove `MANAGE_ROLE_PERMISSIONS` from the \"dummyplus\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRolePermissions/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeAssignment(ROLE_DUMMYPLUS, "MANAGE_ROLE_PERMISSIONS"),
				AfterTestFunc:   cleanAssignment(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Give `MANAGE_ROLE_PERMISSIONS` to the \"dummymax\" role", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/serverRolePermissions/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"role": "%s",
					"permission": "%s"
				}`, ROLE_DUMMYMAX, "MANAGE_ROLE_PERMISSIONS"),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_ROLE_PERMISSIONS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Remove `MANAGE_ROLE_PERMISSIONS` from the \"dummymax\" role", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/serverRolePermissions/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeAssignment(ROLE_DUMMYMAX, "MANAGE_ROLE_PERMISSIONS"),
				AfterTestFunc:   cleanAssignment(),
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
