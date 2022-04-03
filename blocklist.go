package main

var blocklist = []string{
	"pinterest.com",
}

func IsBlockedSite(s string) bool {
	for _, domain := range blocklist {
		if domain == s {
			return true
		}
	}
	return false
}
