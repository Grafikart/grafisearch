package utils

import (
	"net/url"
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
