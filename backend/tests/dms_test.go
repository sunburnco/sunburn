package tests

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/pocketbase/pocketbase/tests"
)

func TestDMs(t *testing.T) {
	tokens, err := generateTokens()
	if err != nil {
		t.Fatal(err)
	}

	factory := func(t testing.TB) *tests.TestApp {
		testApp, err := tests.NewTestApp(testDataDir)
		if err != nil {
			t.Fatal(err)
		}

		return testApp
	}

	scenarios := []tests.ApiScenario{
		{
			Name:   "1 Alice can DM Bob",
			Method: http.MethodPost,
			URL:    "/api/collections/messages/records",
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			Body: rprintf(`{
				"from": "%s",
				"to": "%s",
				"content": "test"
			}`, USER_ALICE, USER_BOB),
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "2 Alice cannot make a DM from Bob",
			Method: http.MethodPost,
			URL:    "/api/collections/messages/records",
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			Body: rprintf(`{
				"from": "%s",
				"to": "%s",
				"content": "test"
			}`, USER_BOB, USER_ALICE),
			ExpectedStatus:  http.StatusBadRequest,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "3 Alice can see her DM to Bob",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/messages/records/%s", DM_FROM_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "4 Alice can see her DM from Bob",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/messages/records/%s", DM_FROM_BOB),
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "5 Charlie cannot see a DM from Alice to Bob",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/messages/records/%s", DM_FROM_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[CHARLIE],
			},
			ExpectedStatus:  http.StatusNotFound,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "6 Alice can see her row in `dmListFrom`",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/dmListFrom/records/%s", USER_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "7 Alice can see her row in `dmListTo`",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/dmListTo/records/%s", USER_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[ALICE],
			},
			ExpectedStatus:  http.StatusOK,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "8 Charlie cannot see Alice's row in `dmListFrom`",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/dmListFrom/records/%s", USER_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[CHARLIE],
			},
			ExpectedStatus:  http.StatusNotFound,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
		{
			Name:   "9 Charlie cannot see Alice's row in `dmListTo`",
			Method: http.MethodGet,
			URL:    fmt.Sprintf("/api/collections/dmListTo/records/%s", USER_ALICE),
			Headers: map[string]string{
				"Authorization": tokens[CHARLIE],
			},
			ExpectedStatus:  http.StatusNotFound,
			ExpectedContent: []string{""},
			TestAppFactory:  factory,
		},
	}

	for _, scenario := range scenarios {
		scenario.Test(t)
	}
}
