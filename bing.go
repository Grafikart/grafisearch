package main

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/beevik/etree"
)

const (
	bingURL = `https://www.bing.com`
	bingAPI = `https://www.bing.com/HPImageArchive.aspx?format=xml&idx=%d&n=1&mkt=%s`
)

func bingWallpaper() (string, error) {

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	request, err := http.NewRequest(http.MethodGet, fmt.Sprintf(bingAPI, 0, "fr-FR"), nil)
	if err != nil {
		return "", err
	}
	request.Header.Add("Referer", bingURL)
	request.Header.Add("User-Agent", `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36`)
	request.Header.Add("Accept", `application/xml`)

	resp, err := client.Do(request)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil || len(body) == 0 {
		return "", fmt.Errorf("failed to parse request body from %s", bingURL)
	}

	doc := etree.NewDocument()
	if err := doc.ReadFromBytes(body); err != nil {
		return "", err
	}

	// get image element
	imgElem := doc.SelectElement("images").SelectElement("image")

	return fmt.Sprintf("%s%s_%s", bingURL, imgElem.SelectElement("urlBase").Text(), "1920x1080.jpg"), nil
}

// Fetch bing wallpaper and retry every 30 seconds if necessary
func fetchBingWallpaper() string {
	retries := 0
	c := make(chan string, 1)
	t := time.NewTicker(time.Second * 30)
	go func() {
		defer t.Stop()
		for {
			<-t.C
			retries++
			w, err := bingWallpaper()
			if err == nil {
				c <- w
				close(c)
				return
			} else if retries > 4 {
				c <- ""
				close(c)
				return
			}
		}
	}()

	return <-c
}
