export type SearchLink = {
    title: string,
    url: string
}

export type SearchResult = {
    url: string,
    title: string,
    desc: string,
    domain: string,
    related?: SearchLink[]
}