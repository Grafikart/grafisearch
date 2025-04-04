package server

import (
	"fmt"
	"grafikart/grafisearch/templates"
	"grafikart/grafisearch/utils"
	"net/http"
	"net/url"
	"strings"
)

var filterBangs = map[string]string{
	"!r":  "site:reddit.com",
	"!gr": "site:grafikart.fr",
	"!i":  "site:stackoverflow.com OR site:github.com",
}

var redirectBangs = map[string]string{
	"!rt":   "https://www.rottentomatoes.com/search?search=%s",
	"!npm":  "https://www.npmjs.com/search?q=%s",
	"!wr":   "https://www.wordreference.com/enfr/%s",
	"!tr":   "https://www.deepl.com/fr/translator#en/fr/%s",
	"!imdb": "https://www.imdb.com/find?s=all&q=%s",
	"!gh":   "https://github.com/search?q=%s",
	"!yt":   "https://www.youtube.com/results?search_query=%s",
	"!d":    "https://www.larousse.fr/dictionnaires/francais/%s",
	"!g":    "https://www.google.com/search?q=%s",
	"!w":    "/weather?q=%s",
	"!c":    "https://www.conjugaisonfrancaise.com/recherche.html?q=%s",
	"!iad":  "https://www.phind.com/search?q=%s&c=&source=searchbox&init=true",
	"!gmap": "https://www.google.fr/maps?hl=fr&q=%s",
	"!img":  "https://duckduckgo.com/?q=%s&iax=images&ia=images",
	"!ia":   "https://www.perplexity.ai/search/?q=%s",
}

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")

	// Redirect if a bang is used or if the query is an URL
	if redirect := parseRedirectBangs(q); redirect != "" {
		http.Redirect(w, r, redirect, http.StatusFound)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	templates.SearchPage(redirectBangs).Render(r.Context(), w)
}

func ReplaceFilterBangs(q string) string {
	for bang, replace := range filterBangs {
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
	for redirectUrl, ok := redirectBangs[bang]; ok && strings.Contains(q, bang); {
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
