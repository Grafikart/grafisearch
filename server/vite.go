package server

import (
	"fmt"
	"local-research/utils"
	"io/fs"
	"log"
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
	log.Printf("DEBUG: Looking for manifest at path: %s", manifestPath)

	// Debug: list files in the assets directory
	entries, err := fs.ReadDir(filesystem, "assets")
	if err == nil {
		log.Printf("DEBUG: Files in assets directory:")
		for _, entry := range entries {
			log.Printf("DEBUG: - %s", entry.Name())
			if entry.IsDir() {
				subEntries, _ := fs.ReadDir(filesystem, "assets/"+entry.Name())
				for _, subEntry := range subEntries {
					log.Printf("DEBUG:   - %s", subEntry.Name())
				}
			}
		}
	} else {
		log.Printf("DEBUG: Could not read assets directory: %v", err)
	}

	f, err := filesystem.Open(manifestPath)
	if err == nil {
		defer f.Close()
		log.Printf("DEBUG: Found manifest, parsing...")
		err = utils.ParseJsonFile(f, &data)
		if err != nil {
			log.Printf("DEBUG: Error parsing manifest: %v", err)
		} else {
			log.Printf("DEBUG: Successfully parsed manifest with %d entries", len(data))
		}
	} else {
		log.Printf("DEBUG: Could not open manifest: %v", err)
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
	log.Printf("DEBUG: GetHeadHTML called - hasManifest: %v, manifest entries: %d", v.hasManifest, len(v.manifestData))
	if !v.hasManifest {
		log.Printf("DEBUG: Using dev mode scripts")
		sb.WriteString(fmt.Sprintf(`<script type="module" src="http://localhost:%[1]d/@vite/client"></script>
			<script src="http://localhost:%[1]d/assets/main.tsx" type="module"></script>`, v.port))
		return sb.String()
	}

	log.Printf("DEBUG: Using production assets from manifest")
	for _, item := range v.manifestData {
		log.Printf("DEBUG: Adding script: %s%s", v.publicPath, item.File)
		sb.WriteString(fmt.Sprintf("<script type=\"module\" src=\"%s%s\"></script>", v.publicPath, item.File))
		for _, css := range item.CSS {
			log.Printf("DEBUG: Adding CSS: %s%s", v.publicPath, css)
			sb.WriteString(fmt.Sprintf("<link rel=\"stylesheet\" href=\"%s%s\">", v.publicPath, css))
		}
	}

	return sb.String()
}
