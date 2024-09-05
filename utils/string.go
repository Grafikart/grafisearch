package utils

import (
	"net/url"
	"strings"
)

func StringOrEmpty(s string, err error) string {
	if err != nil {
		return ""
	}
	return s
}

func UrlUnescape(u string) string {
	unescapedURL, err := url.QueryUnescape(u)
	if err != nil {
		return u
	}
	return unescapedURL
}

func IsUrl(s string) bool {
	return strings.HasPrefix(s, "http://") || strings.HasPrefix(s, "https://")
}
