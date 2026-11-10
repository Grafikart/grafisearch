package search

import (
	"context"
	"testing"
)

func TestSearchEngines(t *testing.T) {

	tests := []struct {
		name       string
		searchFunc func(context.Context, string) ([]SearchResult, error)
		funcName   string
	}{
		{"Google", GetGoogleResults, "GetGoogleResults"},
		{"DuckduckGo", GetDDGResults, "GetDDGResults"},
		{"Brave", GetBraveResults, "GetBraveResults"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			q := "Grafikart"
			res, err := tt.searchFunc(t.Context(), q)
			if err != nil {
				t.Fatalf(`%s("%s") %v`, tt.funcName, q, err)
			}

			if len(res) <= 1 {
				t.Fatalf(`%s("%s") expected more than 1 results`, tt.funcName, q)
			}

			if res[0].URL != "https://grafikart.fr/" {
				t.Errorf(`%s("%s") expected grafikart as first result, got %v`, tt.funcName, q, res[0].URL)
			}
		})
	}
}
