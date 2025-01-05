package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"grafikart/grafisearch/search"
	"grafikart/grafisearch/server"
)

func SearchWithParser(fn func(string) ([]search.SearchResult, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")

		if q == "" {
			serveError(w, errors.New("missing query parameter"))
			return
		}
		results, err := fn(server.ReplaceFilterBangs(q))
		if err != nil {
			serveError(w, err)
			return
		}

		w.Header().Set("Cache-Control", "public, max-age=3600")

		data, err := json.Marshal(results)
		if err != nil {
			serveError(w, err)
			return
		}
		w.Write(data)
	}
}
