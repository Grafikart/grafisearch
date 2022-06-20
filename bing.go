package main

import (
	"fmt"
	"io/ioutil"
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
	request.Header.Add("User-Agent", `Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/8.0; .NET4.0C; .NET4.0E)`)

	resp, err := client.Do(request)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
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
func bingWallpaperFetcher() chan string {
	retries := 0
	c := make(chan string, 1)
	t := time.NewTicker(time.Second * 30)
	go func() {
		defer t.Stop()
		for ; true; <-t.C {
			retries++
			w, err := bingWallpaper()
			if err == nil {
				c <- w
				close(c)
				return
			} else if retries > 4 {
				return
			}
		}
	}()

	return c
}
