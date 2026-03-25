package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/tests"
)

// func makeInviteA() func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
// 	makePerms := assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

// 	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
// 		if _, err := app.DB().Insert("invites", dbx.Params{
// 			"id":     DUMMY_IDA,
// 			"slug":   "deletemeA",
// 			"server": SERVER_MAIN,
// 		}).Execute(); err != nil {
// 			t.Fatal(err)
// 		}

// 		makePerms(t, app, e)
// 	}
// }

// func makeInviteB() func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
// 	makePerms := assignPermissions([]string{"CREATE_INVITES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD})

// 	return func(t testing.TB, app *tests.TestApp, e *core.ServeEvent) {
// 		if _, err := app.DB().Insert("invites", dbx.Params{
// 			"id":     DUMMY_IDB,
// 			"slug":   "deletemeB",
// 			"server": SERVER_MAIN,
// 		}).Execute(); err != nil {
// 			t.Fatal(err)
// 		}

// 		makePerms(t, app, e)
// 	}
// }

// func cleanupInvites() func(t testing.TB, app *tests.TestApp, r *http.Response) {
// 	cleanPerms := cleanupPermissions()

// 	return func(t testing.TB, app *tests.TestApp, r *http.Response) {
// 		if _, err := app.DB().Delete("invites", dbx.Like("id", DUMMY_ID_WILDCARD)).Execute(); err != nil {
// 			t.Fatal(err)
// 		}

// 		cleanPerms(t, app, r)
// 	}
// }

func TestServersInvites(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}
	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatuses := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_404, _404, _204, _204, _204, _404, _404, _404},
		{_404, _404, _404, _204, _204, _404, _404, _404},
		{_200, _200, _200, _200, _200, _400, _400, _400},
	}

	expectedContents := [][][]string{
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":1`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
	}

	scenarios := []func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario{
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d View an invite", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/invites/records?filter=(slug='%s')", INVITE_MAIN_SLUG),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				// no roles needed
				TestAppFactory: makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%da Create an invite", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/invites/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"id": "%s",
					"slug": "deleteme",
					"server": "%s"
				}`, DUMMY_IDA, SERVER_MAIN),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%db Create an invite", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/invites/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
							"id": "%s",
							"slug": "deleteme",
							"server": "%s"
						}`, DUMMY_IDA, SERVER_MAIN),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"CREATE_INVITES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%da List invites", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/invites/records?filter=(server='%s')", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%db List invites", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/invites/records?filter=(server='%s')", SERVER_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"CREATE_INVITES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%da Delete an invite", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/invites/records/%s", INVITE_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_SERVER"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%db Delete an invite", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/invites/records/%s", INVITE_MAIN),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"CREATE_INVITES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID int, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Accept the `charlie` invite", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    fmt.Sprintf("/api/sb/acceptInvite/%s", INVITE_CHARLIE_SLUG),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				// no roles needed
				TestAppFactory: makeFactory,
			}
		},
	}

	for i, scenario := range scenarios {
		for j, token := range tokens {
			scenario(i, j, token, userArray[j]).Test(t)
		}
	}
}
