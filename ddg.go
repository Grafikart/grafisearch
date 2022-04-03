package main

import (
	"fmt"
	"net/url"

	"github.com/PuerkitoBio/goquery"
)

func ParseDDGResponse(q string) ([]SearchResult, error) {
	searchURL := fmt.Sprintf("https://html.duckduckgo.com/html/?q=%s", url.QueryEscape(q))
	res, err := fetch(searchURL)

	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)

	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	sel := doc.Find(".result")
	for i := range sel.Nodes {
		item := sel.Eq(i)
		title := item.Find(".result__title").Find("a")
		link := title.AttrOr("href", "")
		desc, _ := item.Find(".result__snippet").Html()
		u, err := url.Parse(link)
		if err == nil && !isBlockedSite(u.Host) {
			results = append(results, SearchResult{
				i,
				link,
				title.Text(),
				desc,
				u.Host,
				nil,
			})
		}
	}

	return results, nil
}
