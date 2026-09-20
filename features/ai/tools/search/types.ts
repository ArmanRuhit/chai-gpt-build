/** One normalized web result, shared by every search provider */
export type SearchResult = {
    title: string;
    url: string;
    snippet: string;
    score?: number;
    publishedAt?: string;
}

/** Options accepted by every search provider adapter. */
export type SearchOptions = {
    query: string;
    maxResults?: number;
}