package search

import (
	"context"
	"fmt"
	"grafikart/grafisearch/utils"
	"io"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

/**
* This doesn't work anymore since google force JavaScript for search results since January 2025
 */
func GetGoogleResults(ctx context.Context, q string) ([]SearchResult, error) {
	res, err := utils.Fetch(ctx, fmt.Sprintf("https://www.google.com/search?q=%s", url.QueryEscape(q)))
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var body io.Reader
	body = res.Body
	if strings.Contains(res.Header.Get("Content-Type"), "ISO-8859") {
		decoder := charmap.ISO8859_1.NewDecoder()
		body = transform.NewReader(res.Body, decoder)
	}

	doc, err := goquery.NewDocumentFromReader(body)

	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	sel := doc.Find("div.ezO2md")
	urls := make(map[string]int)

	// Find natural results
	for i := range sel.Nodes {
		item := sel.Eq(i)
		a := item.Find("a")
		title := item.Find(".CVA68e").First()
		desc := item.Find(".FrIlee").First()
		link := extractUrl(a.AttrOr("href", ""))
		siteName := strings.ReplaceAll(item.Find(".fYyStc").First().Text(), "www.", "")

		if link != "" && link != "#" && !strings.HasPrefix(link, "/") {
			u, err := url.Parse(link)
			_, linkAlreadyListed := urls[link]
			if err == nil && !isBlockedSite(u.Host) && !linkAlreadyListed {
				parts := strings.Split(siteName, " › ")
				urls[link] = 1
				result := SearchResult{
					URL:      link,
					Title:    title.Text(),
					Desc:     desc.Text(),
					Domain:   u.Host,
					Author:   parts[len(parts)-1],
					SiteName: siteName,
				}
				results = append(results, result)
			}
		}
	}

	return results, err
}

// Extract the URL from a google result
func extractUrl(s string) string {
	parts := strings.Split(s, "&")
	return utils.UrlUnescape(strings.ReplaceAll(parts[0], "/url?q=", ""))
}
