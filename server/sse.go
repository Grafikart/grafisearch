package server

import (
	"fmt"
	"local-research/utils"
	"net/http"
	"sync"
)

var channels []*chan string
var mu sync.Mutex

func PushMessage(msg string) {
	fmt.Printf("Sending to %v:", len(channels))
	for _, ch := range channels {
		*ch <- msg
	}
}

func SSEHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)

	if !ok {
		fmt.Println("Could not init http.Flusher")
		return
	}

	mu.Lock()
	ch := make(chan string)
	channels = append(channels, &ch)
	mu.Unlock()
	done := r.Context().Done()

	defer func() {
		mu.Lock()
		close(ch)
		channels = utils.RemoveItem(channels, &ch)
		ch = nil
		mu.Unlock()
	}()

	for {
		select {
		case <-done:
			return
		case msg := <-ch:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		}
	}
}
