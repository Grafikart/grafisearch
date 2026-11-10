package utils

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"time"
)

type waitingTransport struct{}

func (waitingTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	<-r.Context().Done()
	return nil, r.Context().Err()
}

func TestFetchCancellation(t *testing.T) {
	original := fetchClient
	t.Cleanup(func() { fetchClient = original })
	fetchClient = &http.Client{Transport: waitingTransport{}, Timeout: time.Second}

	ctx, cancel := context.WithCancel(t.Context())
	cancel()
	_, err := Fetch(ctx, "https://example.com")
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("expected cancellation, got %v", err)
	}
}

func TestFetchTimeout(t *testing.T) {
	original := fetchClient
	t.Cleanup(func() { fetchClient = original })
	fetchClient = &http.Client{Transport: waitingTransport{}, Timeout: 10 * time.Millisecond}

	_, err := Fetch(t.Context(), "https://example.com")
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("expected timeout, got %v", err)
	}
}
