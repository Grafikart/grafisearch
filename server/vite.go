package server

import (
	"fmt"
	"grafikart/grafisearch/utils"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
)

type ViteAssets struct {
	publicPath   string
	assets       fs.FS
	manifestPath string
	hasManifest  bool
	port         int16
}

func NewViteAssets(assets fs.FS) *ViteAssets {
	manifestPath := "public/assets/.vite/manifest.json"
	_, err := os.Stat(manifestPath)
	return &ViteAssets{
		publicPath:   "/assets/",
		assets:       assets,
		manifestPath: manifestPath,
		hasManifest:  err == nil,
		port:         3000,
	}
}

func (v ViteAssets) ServeAssets(w http.ResponseWriter, r *http.Request) {
	if v.hasManifest {
		http.FileServer(http.FS(v.assets)).ServeHTTP(w, r)
		return
	}

	// Proxy everything to vite in dev mode
	u := *r.URL
	u.Host = fmt.Sprintf("%s:%d", strings.Split(r.Host, ":")[0], v.port)
	w.Header().Set("Location", u.String())
	w.WriteHeader(301)
}

type manifestItem struct {
	File    string   `json:"file"`
	Name    string   `json:"name"`
	Src     string   `json:"src"`
	IsEntry bool     `json:"isEntry"`
	CSS     []string `json:"css"`
}

type manifestData map[string]manifestItem

func (v ViteAssets) GetHeadHTML() string {
	var sb strings.Builder
	if !v.hasManifest {
		sb.WriteString(fmt.Sprintf(`<script type="module" src="http://localhost:%[1]d/@vite/client"></script>
			<script src="http://localhost:%[1]d/assets/main.tsx" type="module"></script>`, v.port))
		return sb.String()
	}

	var assets manifestData
	err := utils.ParseJsonFile(v.manifestPath, &assets)

	if err != nil {
		log.Fatalf("Cannot parse vite manifest file: %v", err)
	}

	for _, item := range assets {
		sb.WriteString(fmt.Sprintf("<script type=\"module\" src=\"%s%s\"></script>", v.publicPath, item.File))
		for _, css := range item.CSS {
			sb.WriteString(fmt.Sprintf("<link rel=\"strylesheet\" src=\"%s%s\">", v.publicPath, css))
		}
	}

	return sb.String()
}
