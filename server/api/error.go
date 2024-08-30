package api

import (
	"encoding/json"
	"net/http"
)

func serveError(r http.ResponseWriter, err error) {
	r.WriteHeader(http.StatusInternalServerError)
	data := map[string]string{
		"message": err.Error(),
	}
	body, _ := json.Marshal(data)
	r.Write(body)
}
