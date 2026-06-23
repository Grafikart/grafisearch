package search

import (
	"fmt"
	"local-research/utils"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func GetYouTubeResults(q string) ([]SearchResult, error) {
	searchURL := fmt.Sprintf("https://www.youtube.com/results?search_query=%s", url.QueryEscape(q))
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
	urls := make(map[string]int)

	// Find video results using YouTube's structure
	doc.Find("ytd-video-renderer, ytd-rich-item-renderer, .ytd-video-renderer, .ytd-rich-item-renderer").Each(func(i int, item *goquery.Selection) {
		var title, videoURL, channelName, duration, views, desc string

		// Try to find the video link
		if a := item.Find("a#video-title, a.yt-simple-endpoint").First(); a.Length() > 0 {
			if href, exists := a.Attr("href"); exists {
				if strings.HasPrefix(href, "/watch") {
					videoURL = "https://www.youtube.com" + href
				} else if strings.HasPrefix(href, "http") {
					videoURL = href
				}
			}
			title = strings.TrimSpace(a.Text())
		}

		// Alternative title selector
		if title == "" {
			if t := item.Find("#video-title, .ytd-video-renderer #video-title, h3.title").First(); t.Length() > 0 {
				title = strings.TrimSpace(t.Text())
			}
		}

		// Find channel name
		if channel := item.Find("#channel-name, .ytd-channel-name, .ytd-video-renderer #channel-name").First(); channel.Length() > 0 {
			channelName = strings.TrimSpace(channel.Text())
		}

		// Find duration
		if dur := item.Find("#text.ytd-thumbnail-overlay-time-status-renderer, .ytd-thumbnail-overlay-time-status-renderer #text").First(); dur.Length() > 0 {
			duration = strings.TrimSpace(dur.Text())
		}

		// Find views
		if viewCount := item.Find("#metadata-line span:contains('views'), .ytd-video-meta-block span:contains('views')").First(); viewCount.Length() > 0 {
			views = strings.TrimSpace(viewCount.Text())
		}

		// Find description snippet
		if descElement := item.Find("#description-text, .ytd-video-renderer #description-text, .metadata-snippet-container").First(); descElement.Length() > 0 {
			desc = strings.TrimSpace(descElement.Text())
		}

		// Process result if we have minimum required data
		if videoURL != "" && title != "" {
			_, urlAlreadyListed := urls[videoURL]
			if !urlAlreadyListed {
				urls[videoURL] = 1

				// Build description with metadata
				fullDesc := desc
				if channelName != "" {
					if fullDesc != "" {
						fullDesc = channelName + " • " + fullDesc
					} else {
						fullDesc = channelName
					}
				}
				if views != "" {
					if fullDesc != "" {
						fullDesc += " • " + views
					} else {
						fullDesc = views
					}
				}
				if duration != "" {
					if fullDesc != "" {
						fullDesc += " • " + duration
					} else {
						fullDesc = duration
					}
				}

				result := SearchResult{
					URL:      videoURL,
					Title:    title,
					Desc:     fullDesc,
					Domain:   "www.youtube.com",
					SiteName: "YouTube",
					Author:   channelName,
				}
				results = append(results, result)
			}
		}
	})

	// If no results found with modern selectors, try legacy approach
	if len(results) == 0 {
		doc.Find("a[href^='/watch']").Each(func(i int, a *goquery.Selection) {
			href, exists := a.Attr("href")
			if !exists || !strings.HasPrefix(href, "/watch") {
				return
			}

			videoURL := "https://www.youtube.com" + href
			_, urlAlreadyListed := urls[videoURL]
			if urlAlreadyListed {
				return
			}

			// Find the video container
			container := a.Closest(".video-list-item, .yt-lockup, .ytd-video-renderer")
			if container.Length() == 0 {
				container = a.Parent()
			}

			title := strings.TrimSpace(a.Text())
			if title == "" {
				if t := container.Find(".title, .video-title, h3").First(); t.Length() > 0 {
					title = strings.TrimSpace(t.Text())
				}
			}

			if title != "" {
				urls[videoURL] = 1
				result := SearchResult{
					URL:      videoURL,
					Title:    title,
					Desc:     "",
					Domain:   "www.youtube.com",
					SiteName: "YouTube",
				}
				results = append(results, result)
			}
		})
	}

	return results, nil
}