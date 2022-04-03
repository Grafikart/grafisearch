package main

import (
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
	Rank    int    `json:"id"`
	URL     string `json:"url"`
	Title   string `json:"title"`
	Desc    string `json:"desc"`
	Domain  string `json:"domain"`
	Related []Link `json:"related"`
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
	setupCORS(&res)
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
	t, err := template.ParseFiles("index.html")
	if err != nil {
		log.Fatal(err)
	}

	// http.ServeFile(w, r, "static/index.html")
	err = t.Execute(w, map[string]string{
		"background": wallpaper,
	})
}

func setupCORS(res *http.ResponseWriter) {
	(*res).Header().Set("Access-Control-Allow-Origin", "*")
	(*res).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*res).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
