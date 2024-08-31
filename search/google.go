package search

import (
	"fmt"
	"grafikart/grafisearch/utils"
	"math"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func GetGoogleResults(q string) ([]SearchResult, error) {
	res, err := utils.Fetch(fmt.Sprintf("https://google.com/search?q=%s", url.QueryEscape(q)))
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
		a := item.Find("a")
		title := item.Find("h3").First()
		desc := item.Find(".VwiC3b")
		link := strings.TrimSpace(a.AttrOr("href", ""))
		cite := item.Find("cite")
		siteName := item.Find(".VuuXrf")

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
					Related:  extractRelated(item.Find(".fl")),
					SiteName: utils.StringOrEmpty(siteName.Html()),
				}
				results = append(results, result)

				extractSameSite(item, &results)
				extractNestedLi(item, &results)
			}
		}

	}

	// Extract youtube videos
	sel = doc.Find(".RzdJxc")
	var videos []SearchResult
	if len(sel.Nodes) > 0 {
		for i := range sel.Nodes {
			item := sel.Eq(i)
			anchor := item.Find("a")
			href := anchor.AttrOr("href", "")
			cite := anchor.Find("cite").Parent()
			title := item.Find("[role=\"heading\"]").Find("div").First().Text()
			description := item.Find("span[aria-hidden=\"true\"]").First().Text()
			siteName := item.Find(".Sg4azc cite")
			videos = append(videos, SearchResult{
				URL:      href,
				Title:    title,
				Desc:     description,
				Domain:   "youtube.com",
				Author:   cite.First().Text(),
				SiteName: utils.StringOrEmpty(siteName.Html()),
			})
		}
		max := int(math.Min(float64(len(videos)-1), 3))
		results = utils.InsertSlice(results, videos[:max], 2)
	}

	return results, err
}

// Extract similar answers (ex stackoverflow links)
func extractRelated(s *goquery.Selection) []Link {
	var selection []Link
	for i := range s.Nodes {
		item := s.Eq(i)
		span := item.Find("span")
		title := span.Text()
		href := item.AttrOr("href", "")
		if !strings.Contains(href, "webcache.googleusercontent") &&
			!strings.Contains(href, "translate.google.com") &&
			!strings.HasPrefix(href, "/search?q") {
			selection = append(selection, Link{title, href})
		}
	}
	return selection
}

// Extract link from the section "Autres résultats sur site.com »"
func extractSameSite(s *goquery.Selection, r *[]SearchResult) {
	items := s.Find(".mslg")
	for i := range items.Nodes {
		item := items.Eq(i)
		title := item.Find("h3")
		a := title.Find("a")
		href := a.AttrOr("href", "")
		u, _ := url.Parse(href)
		desc := title.Next()
		*r = append(*r, SearchResult{
			URL:    href,
			Title:  a.Text(),
			Desc:   strings.Trim(utils.StringOrEmpty(desc.Html()), "<br/>"),
			Domain: u.Host,
		})
	}
}

// Extract nested link "same domain"
func extractNestedLi(s *goquery.Selection, r *[]SearchResult) {
	items := s.Find("li.MYVUIe")
	for i := range items.Nodes {
		item := items.Eq(i)
		title := item.Find("h3")
		a := title.Parent()
		href := a.AttrOr("href", "")
		u, _ := url.Parse(href)
		desc := item.Find("div[data-content-feature]")
		*r = append(*r, SearchResult{
			URL:    href,
			Title:  title.Text(),
			Desc:   strings.Trim(utils.StringOrEmpty(desc.Find("span").Last().Html()), "<br/>"),
			Domain: u.Host,
		})
	}
}
