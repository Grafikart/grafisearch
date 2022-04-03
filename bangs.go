package main

import "strings"

var bangs = map[string]string{
	"!r": "site:reddit.com",
	"!g": "site:grafikart.fr",
	"!i": "site:stackoverflow.com OR site:github.com",
}

func parseBangs(q string) string {
	for bang, replace := range bangs {
		if strings.Contains(q, " "+bang) ||
			strings.Contains(q, bang+" ") {
			q = strings.ReplaceAll(q, bang, replace)
		}
	}
	return q
}
