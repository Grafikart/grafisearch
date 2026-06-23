package search

import (
	"fmt"
	"local-research/utils"
	"net/url"

	"github.com/PuerkitoBio/goquery"
)

func GetDDGResults(q string) ([]SearchResult, error) {
	searchURL := fmt.Sprintf("https://html.duckduckgo.com/html/?q=%s", url.QueryEscape(q))
	res, err := utils.Fetch(searchURL)

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
		link := utils.UrlUnescape(title.AttrOr("href", ""))
		desc, _ := item.Find(".result__snippet").Html()
		u, err := url.Parse(link)
		if err == nil &&
			!isBlockedSite(u.Host) &&
			!item.HasClass("result--ad") {
			results = append(results, SearchResult{
				URL:    link,
				Title:  utils.StringOrEmpty(title.Html()),
				Desc:   desc,
				Domain: u.Host,
			})
		}
	}

	return results, nil
}
