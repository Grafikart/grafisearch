package main

import "strings"

var blocklist = []string{
	"pinterest.com",
	"allocine.com",
	"jeuxvideo.com",
	"lemonde.fr",
	"w3schools.com",
}

func isBlockedSite(s string) bool {
	for _, domain := range blocklist {
		if strings.HasSuffix(s, domain) {
			return true
		}
	}
	return false
}
