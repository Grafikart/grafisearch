package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var wallpaper string

type SearchResult struct {
	Rank  int    `json:"id"`
	URL   string `json:"url"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
}

func main() {
	bingWallpaper, err := BingWallpaper()
	if err != nil {
		log.Fatal(err)
	}
	wallpaper = bingWallpaper

	// API
	http.HandleFunc("/google", serveGoogle)

	// Static files
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/", serveHome)

	// Start the server
	fmt.Println("Server started at port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func serveGoogle(res http.ResponseWriter, req *http.Request) {
	q := req.URL.Query().Get("q")
	results, err := ParseGoogleResponse(q)
	if err != nil {
		log.Fatal(err)
	}
	data, err := json.Marshal(results)
	if err != nil {
		return
	}
	res.Write(data)
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("index.gohtml")
	if err != nil {
		log.Fatal(err)
	}

	// http.ServeFile(w, r, "static/index.html")
	err = t.Execute(w, map[string]string{
		"background": wallpaper,
	})
}
