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
var homePage string

func main() {
	bingWallpaper, err := bingWallpaper()
	if err != nil {
		log.Fatal(err)
	}
	homePage, err = parseHomepage(bingWallpaper)
	if err != nil {
		log.Fatal(err)
	}

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

func serveError(r http.ResponseWriter, err error) {
	r.WriteHeader(http.StatusInternalServerError)
	data := map[string]string{
		"message": err.Error(),
	}
	body, _ := json.Marshal(data)
	r.Write(body)
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	redirect := parseRedirectBangs(q)
	if redirect != "" {
		w.Header().Set("Location", redirect)
		w.WriteHeader(http.StatusFound)
		return
	}
	w.Write([]byte(homePage))
}

func parseHomepage(wallpaper string) (string, error) {
	t, err := template.New("index.html").Parse(index)
	if err != nil {
		return "", err
	}

	tempWriter := new(strings.Builder)
	err = t.Execute(tempWriter, map[string]string{
		"background": wallpaper,
	})
	if err != nil {
		return "", err
	}
	s := tempWriter.String()
	s = strings.ReplaceAll(s, "/assets/app.ts", "/static/app.js")
	s = strings.ReplaceAll(s, "<style>", "<link rel=\"stylesheet\" href=\"/static/style.css\"></link>\n  <style>")
	return s, nil
}

func setupCORS(r *http.ResponseWriter) {
	(*r).Header().Set("Access-Control-Allow-Origin", "*")
	(*r).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*r).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}
