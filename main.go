package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
)

type Link struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type SearchResult struct {
	URL     string `json:"url"`
	Title   string `json:"title"`
	Desc    string `json:"desc"`
	Domain  string `json:"domain"`
	Author  string `json:"author,omitempty"`
	Related []Link `json:"related,omitempty"`
}

//go:embed index.html
var index string

//go:embed static/*
var staticContent embed.FS

func main() {
	homePage, err := parseHomepage()
	if err != nil {
		panic(err)
	}

	// API
	http.HandleFunc("/api/google", serveWithParser(parseGoogleResponse))
	http.HandleFunc("/api/ddg", serveWithParser(ParseDDGResponse))
	http.HandleFunc("/api/log", logResult)

	// Static files
	http.Handle("/static/", http.FileServer(http.FS(staticContent)))
	http.HandleFunc("/weather", serveWeather)
	http.HandleFunc("/", serveHome(homePage))

	// Start the server
	fmt.Println("Listening on http://localhost:8042")
	log.Fatal(http.ListenAndServe(":8042", nil))
}

func serveWithParser(fn func(string) ([]SearchResult, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setupCORS(w)
		q := r.URL.Query().Get("q")
		results, err := fn(parseFilterBangs(q))
		if err != nil {
			serveError(w, err)
			return
		}
		data, err := json.Marshal(results)
		if err != nil {
			serveError(w, err)
			return
		}
		w.Write(data)
	}
}

func serveError(r http.ResponseWriter, err error) {
	r.WriteHeader(http.StatusInternalServerError)
	data := map[string]string{
		"message": err.Error(),
	}
	body, _ := json.Marshal(data)
	r.Write(body)
}

func serveRedirect(w http.ResponseWriter, url string) {
	w.Header().Set("Location", url)
	w.WriteHeader(http.StatusFound)
}

func serveHome(homePage string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		q := r.URL.Query().Get("q")
		redirect := parseRedirectBangs(q)
		if redirect != "" {
			serveRedirect(w, redirect)
			return
		}
		w.Write([]byte(homePage))
	}
}

func serveWeather(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	url, err := extractUrlFromYrNoDk(q)
	if err != nil {
		serveError(w, err)
		return
	}
	serveRedirect(w, url)
}

func parseHomepage() (string, error) {
	wallpaper, err := bingWallpaper()
	if err != nil {
		return "", err
	}
	bangs, err := json.Marshal(redirectBangs)
	if err != nil {
		return "", err
	}
	t, err := template.New("index.html").Parse(index)
	if err != nil {
		return "", err
	}

	tempWriter := new(strings.Builder)
	err = t.Execute(tempWriter, map[string]interface{}{
		"background": wallpaper,
		"bangs":      template.JS(bangs),
	})
	if err != nil {
		return "", err
	}
	s := tempWriter.String()
	s = strings.ReplaceAll(s, "/assets/app.ts", "/static/app.js")
	s = strings.ReplaceAll(s, "<style>", "<link rel=\"stylesheet\" href=\"/static/style.css\"></link>\n  <style>")
	return s, nil
}

func setupCORS(r http.ResponseWriter) {
	r.Header().Set("Access-Control-Allow-Origin", "*")
	r.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	r.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
