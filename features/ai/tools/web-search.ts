import { tool } from "ai";
import { z } from "zod"

import { tavilySearch } from "./search/tavily";
import type { SearchResult } from "./search/types";

const inputSchema = z.object({
    query: z
        .string()
        .min(2)
        .describe("Concise search keywords, not a full sentence."),
    maxResults: z
        .number()
        .int()
        .min(1)
        .max(5)
        .default(5)
        .describe("How many results to return (1-5). Defaults to 5.")
});


export type WebSearchInput = z.infer<typeof inputSchema>;
export type WebSearchOutput = { query: string; results: SearchResult[] };

/** Lets the model fetch real-time web results when its training data is stale */
export const webSearchTool = tool({
    description: "Search the web for current information. Use for news, prices, recent events, or any fact that may have changed since your training cutoff. Returns titles, URLs, and snippets.",
    inputSchema,
    execute: async ({ query, maxResults}): Promise<WebSearchOutput> => {
        const results = await tavilySearch({ query, maxResults});
        return { query, results };
    }
});