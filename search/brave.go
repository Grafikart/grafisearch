package search

import (
	"fmt"
	"local-research/utils"
	"math"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func GetBraveResults(q string) ([]SearchResult, error) {
	res, err := utils.Fetch(fmt.Sprintf("https://search.brave.com/search?q=%s", url.QueryEscape(q)))
	if err != nil {
		return nil, err
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)

	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	sel := doc.Find("div.snippet:not(.standalone)")
	urls := make(map[string]int)

	// Find natural results
	for i := range sel.Nodes {
		item := sel.Eq(i)
		a := item.Find("a")
		title := item.Find(".title").First()
		desc := item.Find(".snippet-description")
		link := utils.UrlUnescape(a.AttrOr("href", ""))
		cite := item.Find(".snippet-url")
		siteName := item.Find(".netloc")

		if link != "" && link != "#" && !strings.HasPrefix(link, "/") {
			u, err := url.Parse(link)
			_, linkAlreadyListed := urls[link]
			if err == nil && !isBlockedSite(u.Host) && !linkAlreadyListed {
				urls[link] = 1
				result := SearchResult{
					URL:      link,
					Title:    utils.StringOrEmpty(title.Html()),
					Desc:     utils.StringOrEmpty(desc.Html()),
					Domain:   u.Host,
					Author:   cite.First().Text(),
					SiteName: utils.StringOrEmpty(siteName.Html()),
				}
				results = append(results, result)
			}
		}
	}

	// Extract videos
	sel = doc.Find(".carousel .card")
	var videos []SearchResult
	if len(sel.Nodes) > 0 {
		for i := range sel.Nodes {
			item := sel.Eq(i)
			anchor := item.Find("a")
			href := utils.UrlUnescape(anchor.AttrOr("href", ""))
			videos = append(videos, SearchResult{
				URL:    href,
				Title:  item.Find("h2").Text(),
				Domain: item.Find(".card-footer").Text(),
				Author: anchor.Find("cite span").Text(), // Brave has no author, show the date instead
			})
		}
		max := int(math.Min(float64(len(videos)-1), 4))
		results = utils.InsertSlice(results, videos[:max+1], 2)
	}
	return results, err
}
