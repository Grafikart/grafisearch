package main

import (
	"context"
	"embed"
	"fmt"
	"grafikart/grafisearch/search"
	"grafikart/grafisearch/server"
	"grafikart/grafisearch/server/api"
	"grafikart/grafisearch/utils"
	"io/fs"
	"log"
	"net/http"
)

//go:embed public/*
var assets embed.FS
var wallpaper string = "/images/red-forest.png"

func main() {
	publicFS, err := fs.Sub(assets, "public")
	if err != nil {
		panic(fmt.Sprintf("Cannot sub public directory %v", err))
	}

	go utils.FetchBingWallpaper()

	viteAssets := server.NewViteAssets(publicFS)
	frontMiddleware := createFrontEndMiddleware(*viteAssets)
	publicServer := http.FileServer(http.FS(publicFS))

	// Static Assets
	http.HandleFunc("/sse", server.SSEHandler)
	http.HandleFunc("/assets/", viteAssets.ServeAssets)

	// API
	http.HandleFunc("/api/ddg", api.SearchWithParser(search.GetDDGResults))
	http.HandleFunc("/api/google", api.SearchWithParser(search.GetGoogleResults))

	// HTML Pages
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve the root
		if r.URL.Path == "/" {
			frontMiddleware(server.SearchHandler)(w, r)
			return
		}
		// Otherwise serve public files
		publicServer.ServeHTTP(w, r)
	})

	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Inject assets tags (as a string) in the context
func createFrontEndMiddleware(vite server.ViteAssets) func(func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	html := vite.GetHeadHTML()
	return func(next func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
		return func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), "assets", html)
			next(w, r.WithContext(ctx))
		}
	}
}
