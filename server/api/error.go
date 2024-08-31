package api

import (
	"encoding/json"
	"net/http"
)

func serveError(r http.ResponseWriter, err error) {
	r.WriteHeader(http.StatusInternalServerError)
	body, _ := json.Marshal(map[string]string{
		"message": err.Error(),
	})
	r.Write(body)
}
