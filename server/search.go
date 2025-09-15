package server

import (
	"fmt"
	"grafikart/grafisearch/templates"
	"grafikart/grafisearch/utils"
	"net/http"
	"net/url"
	"strings"
)

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")

	// Redirect if a bang is used or if the query is an URL
	if redirect := parseRedirectBangs(q); redirect != "" {
		http.Redirect(w, r, redirect, http.StatusFound)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	templates.SearchPage(utils.Config.Bangs).Render(r.Context(), w)
}

func ReplaceFilterBangs(q string) string {
	for bang, replace := range utils.Config.Filters {
		if strings.HasPrefix(q, bang+" ") ||
			strings.HasSuffix(q, " "+bang) {
			q = strings.ReplaceAll(q, bang, replace)
		}
	}
	return q
}

func parseRedirectBangs(q string) string {
	if q == "" {
		return ""
	}
	// Query is in fact an URL
	if utils.IsUrl(q) {
		return q
	}

	// The query contains a redirect bang
	bang := utils.ExtractBang(q)
	for redirectUrl, ok := utils.Config.Bangs[bang]; ok && strings.Contains(q, bang); {
		return fmt.Sprintf(
			redirectUrl,
			url.QueryEscape(
				strings.TrimSpace(
					strings.ReplaceAll(q, bang, ""),
				),
			),
		)
	}
	return ""
}
