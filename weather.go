package main

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
)

type yrNoDkSuggest struct {
	Embed *struct {
		Location []*struct {
			Id  string `json:"id"`
			URL string `json:"urlPath"`
		} `json:"location"`
	} `json:"_embedded,omitempty"`
}

func extractUrlFromYrNoDk(s string) (string, error) {
	r, err := fetch(fmt.Sprintf("https://www.yr.no/api/v0/locations/suggest?language=fr&q=%s", url.QueryEscape(s)))
	if err != nil {
		return "", err
	}

	decoder := json.NewDecoder(r.Body)
	var data yrNoDkSuggest
	err = decoder.Decode(&data)
	if err != nil {
		return "", err
	}

	if data.Embed == nil || len(data.Embed.Location) == 0 {
		return "", fmt.Errorf("impossible de trouver le lieu %s", s)
	}
	location := data.Embed.Location[0]
	return fmt.Sprintf(
		"https://www.yr.no/en/forecast/daily-table/%s/%s",
		location.Id,
		strings.ReplaceAll(
			url.QueryEscape(location.URL),
			"%2F",
			"/",
		),
	), nil
}
