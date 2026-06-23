package search

import (
	"fmt"
	"local-research/utils"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// GetStartpageResults fetches and parses Startpage search results
func GetStartpageResults(q string) ([]SearchResult, error) {
	res, err := utils.Fetch(fmt.Sprintf("https://www.startpage.com/do/dsearch?query=%s&cat=web", url.QueryEscape(q)))
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	urls := make(map[string]int)

	doc.Find("div.result").Each(func(i int, item *goquery.Selection) {
		a := item.Find("a[data-testid='gl-title-link']").First()
		title := item.Find("h2.wgl-title").First()
		desc := item.Find("p.description").First()
		link := a.AttrOr("href", "")
		displayURL := item.Find("a.wgl-display-url").First()

		if link != "" && link != "#" && !strings.HasPrefix(link, "/") {
			u, err := url.Parse(link)
			_, linkAlreadyListed := urls[link]
			if err == nil && u.Host != "" && !isBlockedSite(u.Host) && !linkAlreadyListed {
				urls[link] = 1

				siteName := u.Host
				if strings.HasPrefix(siteName, "www.") {
					siteName = strings.TrimPrefix(siteName, "www.")
				}

				result := SearchResult{
					URL:      link,
					Title:    strings.TrimSpace(title.Text()),
					Desc:     strings.TrimSpace(desc.Text()),
					Domain:   u.Host,
					Author:   strings.TrimSpace(displayURL.Text()),
					SiteName: siteName,
				}
				results = append(results, result)
			}
		}
	})

	return results, nil
}
