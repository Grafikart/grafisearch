package utils

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

var fetchClient = &http.Client{Timeout: 10 * time.Second}

func Fetch(ctx context.Context, url string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Add("accept-language", "fr,fr-FR;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6")
	req.Header.Add("cache-control", "no-cache")

	if strings.Contains(url, "www.google.com") {
		req.Header.Add("user-agent", getLynxUserAgent())
		// Bypass the consent page
		req.AddCookie(&http.Cookie{
			Name:  "CONSENT",
			Value: "PENDING+987",
		})
		// Cookies preference
		req.AddCookie(&http.Cookie{
			Name:  "SOCS",
			Value: "CAESHAgBEhIaAB",
		})
	} else {
		req.Header.Add("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36")
	}

	res, err := fetchClient.Do(req)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != 200 {
		res.Body.Close()
		return nil, fmt.Errorf("status code error: %d %s", res.StatusCode, res.Status)
	}
	return res, nil
}

/**
 * Use a Lynx user agent to get an HTML version of the search results
 * From : https://github.com/Nv7-GitHub/googlesearch/tree/master/googlesearch
 */
func getLynxUserAgent() string {
	lynxVersion := fmt.Sprintf("Lynx/%d.%d.%d",
		rand.Intn(2)+2, // 2-3
		rand.Intn(2)+8, // 8-9
		rand.Intn(3))   // 0-2

	libwwwVersion := fmt.Sprintf("libwww-FM/%d.%d",
		rand.Intn(2)+2,  // 2-3
		rand.Intn(3)+13) // 13-15

	sslMMVersion := fmt.Sprintf("SSL-MM/%d.%d",
		rand.Intn(2)+1, // 1-2
		rand.Intn(3)+3) // 3-5

	opensslVersion := fmt.Sprintf("OpenSSL/%d.%d.%d",
		rand.Intn(3)+1, // 1-3
		rand.Intn(5),   // 0-4
		rand.Intn(10))  // 0-9

	return fmt.Sprintf("%s %s %s %s", lynxVersion, libwwwVersion, sslMMVersion, opensslVersion)
}
