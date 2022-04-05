package main

import (
	"fmt"
	"math"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func parseGoogleResponse(q string) ([]SearchResult, error) {
	res, err := fetch(fmt.Sprintf("https://google.com/search?q=%s", url.QueryEscape(q)))
	if err != nil {
		return nil, err
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)

	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	sel := doc.Find("div.g")
	urls := make(map[string]int)

	// Find natural results
	for i := range sel.Nodes {
		item := sel.Eq(i)
		linkTag := item.Find("a")
		link, _ := linkTag.Attr("href")
		titleTag := item.Find("h3").First()
		descTag := item.Find(".VwiC3b")
		desc, _ := descTag.Html()
		title := titleTag.Text()
		link = strings.Trim(link, " ")
		cite := item.Find("cite")

		if link != "" && link != "#" && !strings.HasPrefix(link, "/") {
			url, err := url.Parse(link)
			_, linkAlreadyListed := urls[link]
			if err == nil && !isBlockedSite(url.Host) && !linkAlreadyListed {
				urls[link] = 1
				result := SearchResult{
					URL:     link,
					Title:   title,
					Desc:    desc,
					Domain:  url.Host,
					Author:  cite.First().Text(),
					Related: extractRelated(item.Find(".fl")),
				}
				results = append(results, result)
			}
		}
	}

	// Find youtube videos
	sel = doc.Find(".RzdJxc")
	var videos []SearchResult
	if len(sel.Nodes) > 0 {
		for i := range sel.Nodes {
			item := sel.Eq(i)
			anchor := item.Find("a")
			href := anchor.AttrOr("href", "")
			cite := anchor.Find("cite").Parent()
			title := anchor.AttrOr("aria-label", "")
			parts := strings.Split(title, ",")
			videos = append(videos, SearchResult{
				URL:    href,
				Title:  parts[0],
				Desc:   parts[1],
				Domain: "youtube.com",
				Author: cite.First().Text(),
			})
		}
		max := int(math.Min(float64(len(videos)-1), 3))
		newResults := make([]SearchResult, 0, max+len(results))
		newResults = append(newResults, results[:2]...)
		newResults = append(newResults, videos[:max]...)
		newResults = append(newResults, results[2:]...)
		results = newResults
	}

	return results, err
}

func extractRelated(s *goquery.Selection) []Link {
	var selection []Link
	for i := range s.Nodes {
		item := s.Eq(i)
		span := item.Find("span")
		title := span.Text()
		url := item.AttrOr("href", "")
		if !strings.Contains(url, "webcache.googleusercontent") &&
			!strings.Contains(url, "translate.google.com") &&
			!strings.HasPrefix(url, "/search?q") {
			selection = append(selection, Link{title, url})
		}
	}
	return selection
}
