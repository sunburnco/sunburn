package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/tests"
)

func TestServersMessages(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}
	userArray := []string{USER_BOB, USER_ALICE, USER_MOD, USER_ADMIN, USER_OWNER, USER_CHARLIE_MOD, USER_CHARLIE_ADMIN, USER_CHARLIE}

	expectedStatuses := [][]int{
		// each column is the same as the user const (e.g. BOB, ALICE, etc)
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _200, _200, _200, _200, _200, _200, _200},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _400, _200, _200, _400, _400, _400},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _200, _200, _200, _400, _400, _400},
		{_200, _200, _200, _200, _200, _200, _200, _200},
		{_400, _400, _400, _400, _200, _400, _400, _400},
		{_404, _202, _202, _202, _202, _404, _404, _404},
		{_404, _202, _404, _202, _202, _404, _404, _404},
		{_404, _200, _404, _404, _404, _404, _404, _404},
	}
	expectedContents := [][][]string{
		{{`"totalItems":0`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{`"totalItems":0`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":2`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":1`}, {`"totalItems":0`}, {`"totalItems":0`}, {`"totalItems":0`}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
		{{``}, {``}, {``}, {``}, {``}, {``}, {``}, {``}},
	}

	scenarios := []func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario{
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Read 2 messages in #general", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/messages/records?filter=(channel='%s')", CHANNEL_GENERAL),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Send messages in #general", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/messages/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"from": "%s",
					"channel": "%s",
					"content": "test"
				}`, args[0], CHANNEL_GENERAL),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Read 2 messages in #muted", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/messages/records?filter=(channel='%s')", CHANNEL_MUTED),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Send messages in #muted", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/messages/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"from": "%s",
					"channel": "%s",
					"content": "test"
				}`, args[0], CHANNEL_MUTED),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Read 2 messages in #modOnly", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/messages/records?filter=(channel='%s')", CHANNEL_MOD_ONLY),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Send messages in #modOnly", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/messages/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"from": "%s",
					"channel": "%s",
					"content": "test"
				}`, args[0], CHANNEL_MOD_ONLY),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Read 1 message in #ownerOnly", testID+1, testColumn+1),
				Method: http.MethodGet,
				URL:    fmt.Sprintf("/api/collections/messages/records?filter=(channel='%s')", CHANNEL_OWNER_ONLY),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Send messages in #ownerOnly", testID+1, testColumn+1),
				Method: http.MethodPost,
				URL:    "/api/collections/messages/records",
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"from": "%s",
					"channel": "%s",
					"content": "test"
				}`, args[0], CHANNEL_OWNER_ONLY),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete a message from Alice in #general", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/messages/records/%s", ALICE_MESSAGE_IN_GENERAL),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Delete a message from Alice in #muted", testID+1, testColumn+1),
				Method: http.MethodDelete,
				URL:    fmt.Sprintf("/api/collections/messages/records/%s", ALICE_MESSAGE_IN_MUTED),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
				AfterTestFunc:   cleanupPermissions(),
				TestAppFactory:  makeFactory,
			}
		},
		func(testID, testColumn int, authToken string, args ...any) *tests.ApiScenario {
			return &tests.ApiScenario{
				Name:   fmt.Sprintf("%d.%d Edit a message from Alice in #general", testID+1, testColumn+1),
				Method: http.MethodPatch,
				URL:    fmt.Sprintf("/api/collections/messages/records/%s", ALICE_MESSAGE_IN_GENERAL),
				Headers: map[string]string{
					"Authorization": authToken,
				},
				Body: rprintf(`{
					"content": "edited"
				}`),
				ExpectedStatus:  expectedStatuses[testID][testColumn],
				ExpectedContent: expectedContents[testID][testColumn],
				BeforeTestFunc:  assignPermissions([]string{"MANAGE_MESSAGES"}, []string{ROLE_MOD, ROLE_CHARLIE_MOD}),
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
