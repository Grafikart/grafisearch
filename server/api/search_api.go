package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"grafikart/grafisearch/search"
	"grafikart/grafisearch/server"
)

func SearchWithParser(fn func(context.Context, string) ([]search.SearchResult, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")

		if q == "" {
			serveError(w, errors.New("missing query parameter"))
			return
		}
		results, err := fn(r.Context(), server.ReplaceFilterBangs(q))
		if err != nil {
			serveError(w, err)
			return
		}

		w.Header().Set("Cache-Control", "public, max-age=3600")
		w.Header().Set("Content-Type", "application/json")

		data, err := json.Marshal(results)
		if err != nil {
			serveError(w, err)
			return
		}
		w.Write(data)
	}
}
