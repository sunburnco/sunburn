package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tests"
)

func makeDeleteMe() func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
	makePerms := assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
		if _, err := app.DB().Insert("channels", dbx.Params{
			"id":     DUMMY_IDA,
			"name":   "deleteme",
			"server": SERVER_MAIN,
			"voice":  false,
		}).Execute(); err != nil {
			t.Fatal(err)
		}

		makePerms(t, app, e)
	}
}

func cleanupDeleteMe() func(t testing.TB, app *tests.TestApp, r *http.Response) {
	cleanPerms := cleanupPermissions()

	return func(t testing.TB, app *tests.TestApp, r *http.Response) {
		if _, err := app.DB().Delete("channels", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
			t.Fatal(err)
		}

		cleanPerms(t, app, r)
	}
}

func makeDummyAssignment() func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
	makePerms := assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
		if _, err := app.DB().Insert("channelRoleAssignments", dbx.Params{
			"id":      DUMMY_IDA,
			"channel": CHANNEL_GENERAL,
			"role":    ROLE_DUMMY,
		}).Execute(); err != nil {
			t.Fatal(err)
		}

		makePerms(t, app, e)
	}
}

func cleanupDummyAssignment() func(t testing.TB, app *tests.TestApp, r *http.Response) {
	cleanPerms := cleanupPermissions()

	return func(t testing.TB, app *tests.TestApp, r *http.Response) {
		if _, err := app.DB().Delete("channelRoleAssignments", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
			t.Fatal(err)
		}

		cleanPerms(t, app, r)
	}
}

func TestServersChannels(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}
	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatus := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_404, _404, _200, _200, _200, _404, _404, _404},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_404, _404, _204, _204, _204, _404, _404, _404},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_404, _404, _204, _204, _204, _404, _404, _404},
	}
	expectedContents := [][][]string{
		{{`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
	}

	scenarios := []func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario{
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d See #general", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/channels/records?filter=(id='%s')", CHANNEL_GENERAL),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d See #modOnly", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/channels/records?filter=(id='%s')", CHANNEL_MOD_ONLY),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d See #ownerOnly", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/channels/records?filter=(id='%s')", CHANNEL_OWNER_ONLY),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Rename #general", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/channels/records/%s", CHANNEL_GENERAL),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
				  "name": "renamed"
				}`),
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Create #deleteme", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/channels/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"id": "%s",
				  "name": "deleteme",
					"server": "%s",
					"voice": false
				}`, DUMMY_IDA, SERVER_MAIN),
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete #deleteme", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/channels/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeDeleteMe(),
				AfterTestFunc:   cleanupDeleteMe(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Assign \"dummy\" role to #general", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/channelRoleAssignments/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"id": "%s",
				  "channel": "%s",
					"role": "%s"
				}`, DUMMY_IDA, CHANNEL_GENERAL, ROLE_DUMMY),
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_CHANNELS"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Remove \"dummy\" role from #general", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/channelRoleAssignments/records/%s", DUMMY_IDA),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatus[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  makeDummyAssignment(),
				AfterTestFunc:   cleanupDummyAssignment(),
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
