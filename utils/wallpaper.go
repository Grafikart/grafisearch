package utils

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/beevik/etree"
)

const BaseWallpaper = "/images/red-forest.png"

var Wallpaper = BaseWallpaper

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
func FetchBingWallpaper() {
	retries := 0
	for {
		retries++
		w, err := bingWallpaper()
		if err == nil {
			Wallpaper = w
			return
		} else if retries > 4 {
			fmt.Println("Failed to fetch wallpaper", err)
			return
		}
		time.Sleep(time.Second * 30)
	}
}

// Toggle between bing and default wallpaper
func ToggleWallpaper() (string, error) {
	if Wallpaper == BaseWallpaper {
		w, err := bingWallpaper()
		if err != nil {
			fmt.Println("Failed to fetch wallpaper", err)
			return BaseWallpaper, err
		}
		Wallpaper = w
	} else {
		Wallpaper = BaseWallpaper
	}
	return Wallpaper, nil
}
