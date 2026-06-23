package search

import (
	"fmt"
	"local-research/utils"
	"io"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

// GetGoogleResults fetches and parses Google search results
func GetGoogleResults(q string) ([]SearchResult, error) {
	// Use standard search with special parameters
	res, err := utils.Fetch(fmt.Sprintf("https://www.google.com/search?q=%s&hl=en&num=20&gbv=1", url.QueryEscape(q)))
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var body io.Reader
	body = res.Body

	// Handle character encoding if needed
	contentType := res.Header.Get("Content-Type")
	if strings.Contains(contentType, "ISO-8859") {
		decoder := charmap.ISO8859_1.NewDecoder()
		body = transform.NewReader(res.Body, decoder)
	}

	doc, err := goquery.NewDocumentFromReader(body)
	if err != nil {
		return nil, err
	}

	results := []SearchResult{}
	urls := make(map[string]int)

	// Try multiple selectors for Google results
	// First try modern selectors
	doc.Find("div.g, div.Gx5Zad, div[data-sokoban-container]").Each(func(i int, item *goquery.Selection) {
		// Skip special results
		if item.HasClass("kp-blk") || item.HasClass("xpdopen") {
			return
		}

		var link, title, desc string

		// Find link
		if a := item.Find("a[href]").First(); a.Length() > 0 {
			if href, exists := a.Attr("href"); exists {
				if strings.HasPrefix(href, "/url?") {
					link = extractUrl(href)
				} else if strings.HasPrefix(href, "http") {
					link = href
				}
			}

			// Try to find title within the link
			if h3 := a.Find("h3").First(); h3.Length() > 0 {
				title = strings.TrimSpace(h3.Text())
			}
		}

		// Alternative title selectors
		if title == "" {
			if h3 := item.Find("h3").First(); h3.Length() > 0 {
				title = strings.TrimSpace(h3.Text())
			}
		}

		// Find description
		descSelectors := []string{
			"div.VwiC3b",
			"div.yXK7lf",
			"span.aCOpRe",
			"div.lEBKkf",
			"div.IsZvec",
		}

		for _, selector := range descSelectors {
			if el := item.Find(selector).First(); el.Length() > 0 {
				desc = strings.TrimSpace(el.Text())
				if desc != "" {
					break
				}
			}
		}

		// Process result if we have minimum required data
		if link != "" && title != "" && !strings.HasPrefix(link, "/") {
			u, err := url.Parse(link)
			if err == nil && u.Host != "" {
				_, linkAlreadyListed := urls[link]
				if !isBlockedSite(u.Host) && !linkAlreadyListed {
					urls[link] = 1

					siteName := u.Host
					if strings.HasPrefix(siteName, "www.") {
						siteName = strings.TrimPrefix(siteName, "www.")
					}

					result := SearchResult{
						URL:      link,
						Title:    title,
						Desc:     desc,
						Domain:   u.Host,
						SiteName: siteName,
					}
					results = append(results, result)
				}
			}
		}
	})

	// If no results found, try legacy selectors
	if len(results) == 0 {
		doc.Find("div.ezO2md").Each(func(i int, item *goquery.Selection) {
			a := item.Find("a")
			title := item.Find(".CVA68e, h3").First()
			desc := item.Find(".FrIlee, .VwiC3b").First()
			link := extractUrl(a.AttrOr("href", ""))
			siteName := strings.ReplaceAll(item.Find(".fYyStc").First().Text(), "www.", "")

			if link != "" && link != "#" && !strings.HasPrefix(link, "/") {
				u, err := url.Parse(link)
				_, linkAlreadyListed := urls[link]
				if err == nil && u.Host != "" && !isBlockedSite(u.Host) && !linkAlreadyListed {
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
					if result.SiteName == "" {
						result.SiteName = u.Host
					}
					results = append(results, result)
				}
			}
		})
	}

	// Final fallback: try to find any HTTP links with text
	if len(results) == 0 {
		doc.Find("a[href^='http']").Each(func(i int, a *goquery.Selection) {
			href, _ := a.Attr("href")
			text := strings.TrimSpace(a.Text())

			if href != "" && text != "" && len(text) > 10 && len(text) < 200 {
				u, err := url.Parse(href)
				if err == nil && u.Host != "" {
					_, linkAlreadyListed := urls[href]
					if !isBlockedSite(u.Host) && !linkAlreadyListed {
						urls[href] = 1

						siteName := u.Host
						if strings.HasPrefix(siteName, "www.") {
							siteName = strings.TrimPrefix(siteName, "www.")
						}

						result := SearchResult{
							URL:      href,
							Title:    text,
							Desc:     "",
							Domain:   u.Host,
							SiteName: siteName,
						}
						results = append(results, result)

						// Limit results
						if len(results) >= 10 {
							return
						}
					}
				}
			}
		})
	}

	return results, nil
}

// Extract the URL from a google result
func extractUrl(s string) string {
	if strings.HasPrefix(s, "/url?") {
		// Parse the URL parameters
		u, err := url.Parse(s)
		if err == nil {
			q := u.Query()
			if targetUrl := q.Get("q"); targetUrl != "" {
				return targetUrl
			}
			if targetUrl := q.Get("url"); targetUrl != "" {
				return targetUrl
			}
		}
		// Fallback
		parts := strings.Split(s, "&")
		if len(parts) > 0 {
			cleaned := strings.ReplaceAll(parts[0], "/url?q=", "")
			cleaned = strings.ReplaceAll(cleaned, "/url?url=", "")
			if decoded, err := url.QueryUnescape(cleaned); err == nil {
				return decoded
			}
			return cleaned
		}
	}
	return s
}