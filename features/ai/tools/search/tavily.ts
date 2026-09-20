import type { SearchOptions, SearchResult } from "./types";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const REQUEST_TIMEOUT_MS = 10_000;


type TavilyResult = {
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    published_date?: string;
}

type TavilyResponse = {
    results?: TavilyResult[];
    detail?: string | { error?: string }
}

/** Runs a Tavily web search and normalizes the response */
export async function tavilySearch({
    query,
    maxResults = 5,
}: SearchOptions): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;

    if(!apiKey) {
        throw new Error("Web search is not configured. Set TAVILY_API_KEY.")
    }

    const response = await fetch(TAVILY_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            query,
            max_results: maxResults,
            search_depth: "basic",
            include_answer: false,
            include_raw_content: false,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if(!response.ok) {
        throw new Error(`Web search failed (${response.status}): ${await readErrorMessage(response)}`);
    }

    const data = (await response.json()) as TavilyResponse;

    return (data.results ?? [])
        .filter(
            (item): item is TavilyResult & { title: string; url: string} => Boolean(item.title && item.url)
        )
        .map((item) => ({
            title: item.title,
            url: item.url,
            snippet: item.content ?? "",
            score: item.score,
            publishedAt: item.published_date,
        }));
}


/** Extracts Tavily's error message across its two error shapes */
async function readErrorMessage(response : Response): Promise<string> {
    try {
        const data = (await response.json()) as TavilyResponse;
        if(typeof data.detail === "string") return data.detail;
        if(data.detail && typeof data.detail === "object" && data.detail.error) {
            return data.detail.error;
        }
        return response.statusText || "Unknown error";
    } catch {
        return response.statusText || "Unknown error";
    }
}