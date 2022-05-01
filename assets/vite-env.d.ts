/// <reference types="vite/client" />

declare interface Timer {
	duration: number
	end: number
}

declare interface SearchLink {
	title: string
	url: string
}

declare interface SearchResult {
	url: string
	title: string
	desc: string
	domain: string
	related?: SearchLink[]
	author?: string
}
