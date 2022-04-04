export type SearchLink = {
    label: string,
    url: string
}

export type SearchResult = {
    url: string,
    title: string,
    desc: string,
    domain: string,
    related?: SearchLink[]
}