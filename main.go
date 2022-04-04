package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var wallpaper string

type Link struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type SearchResult struct {
	URL     string `json:"url"`
	Title   string `json:"title"`
	Desc    string `json:"desc"`
	Domain  string `json:"domain"`
	Related []Link `json:"related,omitempty"`
}

//go:embed index.html
var index string

//go:embed static/*
var staticContent embed.FS

func main() {
	bingWallpaper, err := bingWallpaper()
	if err != nil {
		log.Fatal(err)
	}
	wallpaper = bingWallpaper

	// API
	http.HandleFunc("/api/google", serveWithParser(parseGoogleResponse))
	http.HandleFunc("/api/ddg", serveWithParser(ParseDDGResponse))

	// Static files
	http.Handle("/static/", http.FileServer(http.FS(staticContent)))
	http.HandleFunc("/", serveHome)

	// Start the server
	fmt.Println("Server started at port 8042")
	log.Fatal(http.ListenAndServe(":8042", nil))
}

func serveWithParser(fn func(string) ([]SearchResult, error)) func(http.ResponseWriter, *http.Request) {
	return func(res http.ResponseWriter, req *http.Request) {
		setupCORS(&res)
		q := req.URL.Query().Get("q")
		results, err := fn(parseBangs(q))
		if err != nil {
			serveError(res, err)
			return
		}
		data, err := json.Marshal(results)
		if err != nil {
			serveError(res, err)
			return
		}
		res.Write(data)
	}
}

func serveError(res http.ResponseWriter, err error) {
	res.WriteHeader(http.StatusInternalServerError)
	data := map[string]string{
		"message": err.Error(),
	}
	body, _ := json.Marshal(data)
	res.Write(body)
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	t, err := template.New("index.html").Parse(index)
	if err != nil {
		log.Fatal(err)
	}

	t.Execute(w, map[string]string{
		"background": wallpaper,
	})
}

func setupCORS(res *http.ResponseWriter) {
	(*res).Header().Set("Access-Control-Allow-Origin", "*")
	(*res).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*res).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
