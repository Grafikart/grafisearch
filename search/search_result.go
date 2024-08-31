package search

type Link struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type SearchResult struct {
	URL      string `json:"url"`
	Title    string `json:"title"`
	Desc     string `json:"desc"`
	Domain   string `json:"domain"`
	SiteName string `json:"siteName,omitempty"`
	Author   string `json:"author,omitempty"`
	Related  []Link `json:"related,omitempty"`
}
