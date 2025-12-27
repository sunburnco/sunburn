package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/tests"
)

func TestServersMeta(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}

	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatuses := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_400, _400, _400, _400, _200, _400, _400, _400},
		{_400, _400, _400, _400, _400, _400, _400, _400},
		{_404, _200, _200, _200, _200, _200, _200, _200},
		{_404, _404, _200, _200, _200, _404, _404, _404},
		{_404, _404, _404, _404, _200, _404, _404, _404},
		{_404, _404, _404, _404, _202, _404, _404, _404},
	}

	scenarios := []func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario{
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create a server", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/servers/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"name": "test",
					"owner": "%s"
				}`, args[0]),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create a server with a different owner", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/servers/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"name": "test",
					"owner": "%s"
				}`, USER_BOB),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d See server", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/servers/records/%s", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Rename server", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/servers/records/%s", SERVER_MAIN),
				Body: rprintf(`{
					"name": "renamed"
				}`),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Change server owner", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/servers/records/%s", SERVER_MAIN),
				Body: rprintf(`{
					"owner": "%s"
				}`, USER_CHARLIE),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete server", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/servers/records/%s", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: []string{""},
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
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
