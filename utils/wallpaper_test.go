package utils

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

type wallpaperTransport struct {
	status int
	body   string
}

func (t wallpaperTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	return &http.Response{
		StatusCode: t.status,
		Status:     http.StatusText(t.status),
		Header:     make(http.Header),
		Body:       io.NopCloser(strings.NewReader(t.body)),
		Request:    r,
	}, nil
}

func TestFetchBingWallpaper(t *testing.T) {
	original := http.DefaultTransport
	t.Cleanup(func() { http.DefaultTransport = original })

	for _, tt := range []struct {
		name   string
		status int
		body   string
		want   string
	}{
		{"valid", 200, "<images><image><urlBase>/wallpaper</urlBase></image></images>", "https://www.bing.com/wallpaper_UHD.jpg"},
		{"upstream error", 503, "unavailable", ""},
		{"empty body", 200, "", ""},
		{"invalid XML", 200, "<images>", ""},
		{"missing images", 200, "<response/>", ""},
		{"missing image", 200, "<images/>", ""},
		{"missing urlBase", 200, "<images><image/></images>", ""},
		{"blank urlBase", 200, "<images><image><urlBase> </urlBase></image></images>", ""},
	} {
		t.Run(tt.name, func(t *testing.T) {
			http.DefaultTransport = wallpaperTransport{status: tt.status, body: tt.body}
			got, err := FetchBingWallpaper()
			if tt.want == "" {
				if err == nil {
					t.Fatal("expected an error")
				}
				return
			}
			if err != nil || got != tt.want {
				t.Fatalf("got (%q, %v), want %q", got, err, tt.want)
			}
		})
	}
}
