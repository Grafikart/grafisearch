package main

import (
	"context"
	"embed"
	"fmt"
	"local-research/search"
	"local-research/server"
	"local-research/server/api"
	"local-research/utils"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed all:public
var assets embed.FS

//go:embed install/com.local-research.plist
var macOSService string

//go:embed install/local-research.service
var linuxService string

const port = ":8042"

func main() {
	// Handle "install" flag
	if len(os.Args) >= 2 && os.Args[1] == "install" {
		err := utils.InstallApp(linuxService, macOSService)
		if err != nil {
			panic(err)
		}
		return
	}

	publicFS, err := fs.Sub(assets, "public")
	if err != nil {
		panic(fmt.Sprintf("Cannot sub public directory %v", err))
	}

	viteAssets := server.NewViteAssets(publicFS)
	frontMiddleware := createFrontEndMiddleware(viteAssets)
	publicServer := http.FileServer(http.FS(publicFS))

	// Static Assets
	http.HandleFunc("/sse", server.SSEHandler)

	// API
	http.HandleFunc("/api/google", api.SearchWithParser(search.GetGoogleResults))
	http.HandleFunc("/api/ddg", api.SearchWithParser(search.GetDDGResults))
	http.HandleFunc("/api/startpage", api.SearchWithParser(search.GetStartpageResults))
	http.HandleFunc("/api/youtube", api.SearchWithParser(search.GetYouTubeResults))
	http.HandleFunc("/api/wallpaper", api.WallpaperHandler)

	// FrontEnd URLs
	http.HandleFunc("/weather", server.WeatherHandler)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve the root
		if r.URL.Path == "/" {
			frontMiddleware(server.SearchHandler)(w, r)
			return
		}
		// Otherwise serve public files
		publicServer.ServeHTTP(w, r)
	})

	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}

// Inject assets tags (as a string) in the context
func createFrontEndMiddleware(vite *server.ViteAssets) func(func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	return func(next func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
		return func(w http.ResponseWriter, r *http.Request) {
			html := vite.GetHeadHTML()
			ctx := context.WithValue(r.Context(), "assets", html)
			next(w, r.WithContext(ctx))
		}
	}
}
