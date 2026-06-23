package api

import (
	"encoding/json"
	"local-research/utils"
	"net/http"
)

type wallpaperResponse struct {
	Wallpaper string `json:"wallpaper"`
}

func WallpaperHandler(w http.ResponseWriter, r *http.Request) {
	wallpaper, err := utils.FetchBingWallpaper()
	if err != nil {
		serveError(w, err)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=3600")
	j, _ := json.Marshal(wallpaperResponse{Wallpaper: wallpaper})
	w.Write(j)
}
