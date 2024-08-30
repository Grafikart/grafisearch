package server

import (
	"grafikart/grafisearch/templates"
	"grafikart/grafisearch/utils"
	"net/http"
)

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	component := templates.SearchPage(utils.Wallpaper)
	component.Render(r.Context(), w)
}
