package server

import (
	"fmt"
	"grafikart/grafisearch/utils"
	"io/fs"
	"net/http"
	"strings"
)

type viteManifestItem struct {
	File    string   `json:"file"`
	Name    string   `json:"name"`
	Src     string   `json:"src"`
	IsEntry bool     `json:"isEntry"`
	CSS     []string `json:"css"`
}

type viteManifestData map[string]viteManifestItem

type ViteAssets struct {
	publicPath   string
	assets       fs.FS
	hasManifest  bool
	port         int16
	manifestData viteManifestData
}

func NewViteAssets(filesystem fs.FS) *ViteAssets {
	var data viteManifestData
	manifestPath := "assets/.vite/manifest.json"
	f, err := filesystem.Open(manifestPath)
	if err == nil {
		defer f.Close()
		err = utils.ParseJsonFile(f, &data)
	}
	return &ViteAssets{
		publicPath:   "/assets/",
		assets:       filesystem,
		hasManifest:  err == nil,
		port:         3000,
		manifestData: data,
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

func (v ViteAssets) GetHeadHTML() string {
	var sb strings.Builder
	if !v.hasManifest {
		sb.WriteString(fmt.Sprintf(`<script type="module" src="http://localhost:%[1]d/@vite/client"></script>
			<script src="http://localhost:%[1]d/assets/main.tsx" type="module"></script>`, v.port))
		return sb.String()
	}

	for _, item := range v.manifestData {
		sb.WriteString(fmt.Sprintf("<script type=\"module\" src=\"%s%s\"></script>", v.publicPath, item.File))
		for _, css := range item.CSS {
			sb.WriteString(fmt.Sprintf("<link rel=\"stylesheet\" href=\"%s%s\">", v.publicPath, css))
		}
	}

	return sb.String()
}
