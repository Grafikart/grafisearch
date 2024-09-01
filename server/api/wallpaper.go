package api

import (
	"encoding/json"
	"errors"
	"grafikart/grafisearch/utils"
	"net/http"
)

type wallpaperResponse struct {
	Wallpaper string `json:"wallpaper"`
}

func WallpaperHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		serveError(w, errors.New("method not allowed"))
		return
	}

	wallpaper, err := utils.ToggleWallpaper()
	if err != nil {
		serveError(w, err)
		return
	}

	j, _ := json.Marshal(wallpaperResponse{Wallpaper: wallpaper})
	w.Write(j)
}
