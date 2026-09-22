"use client";

import { useState } from "react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";

import {
    ChevronDownIcon,
    CircleAlertIcon,
    ExternalLinkIcon,
    GlobeIcon,
} from "lucide-react"


import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ToolCallPart = ToolUIPart | DynamicToolUIPart;

type SearchResult = { title: string; url: string; snippet: string };

/** Defensively reads web search results out of an unknown tool output */
function getSearchResults(output: unknown): SearchResult[] {
    if(!output || typeof output !== "object") return [];
    const results = (output as {results?: unknown}).results;
    if(!Array.isArray(results)) return [];
    return results.filter(
        (item): item is SearchResult => 
            Boolean(item) && 
            typeof item === "object" &&
            typeof (item as SearchResult).title === "string" &&
            typeof (item as SearchResult).url === "string"
    );
}

/**Reads the search query from a partially or fully streamed tool input */
function getQuery(input: unknown): string | undefined {
    if(!input || typeof input !== "object") return undefined;
    const query = (input as {query?: unknown}).query;
    return typeof query === "string" ? query : undefined;
}


/**
 * Renders one tool invocation inside an assistant message. While the call runs it shows a spinner; once done, results collapse into a source list.
 */
export function ToolCall({ part }: { part: ToolCallPart}) {
    const [userOpen, setUserOpen] = useState<boolean | null>(null);

    const isStreaming = part.state === "input-streaming" || part.state === "input-available";

    const open = userOpen ?? isStreaming;
    const query = getQuery(part.input);
    const results = part.state === "output-available" ? getSearchResults(part.output) : [];


    if(part.state === "output-error") {
        return (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <CircleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                <div className="min-w-0">
                    <p className="font-medium">Web Search failed</p>
                    <p className="break-words text-destructive/80">{part.errorText}</p>
                </div>
            </div>
        )
    }


    if(
        part.state === "output-denied" ||
        part.state === "approval-requested" ||
        part.state === "approval-responded"
    ) {
        return <p className="text-xs text-muted-foreground"> Web search was not run.</p>
    }

    return (
        <Collapsible
            className="w-full rounded-lg border border-border/60 bg-muted/30"
            onOpenChange={(nextOpen) => setUserOpen(nextOpen)}
            open={open}
        >
            <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                {isStreaming ? (
                    <Spinner className="size-3.5" />
                ) : (
                    <GlobeIcon className="size-3.5 shrink-0" />
                )}
                <span className="shrink-0">
                    {isStreaming 
                        ? "Searching the web..."
                        : `Searched ${results.length} source${results.length === 1 ? "" : "s"}`}
                </span>
                {query ? (
                    <span className="truncate text-muted-foreground/70">{query}</span>
                ) : null}
                <ChevronDownIcon 
                     className={cn(
                        "ml-auto size-3.5 shrink-0 transition-transform",
                        open && "rotate-180"
                    )}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
                    <ol className="space-y-2 border-t border-border/60 px-3 py-2">
                        {results.length === 0 ? (
                            <li className="text-xs text-muted-foreground">No results found.</li>
                        ) : (
                            results.map((result) => (
                                <li key={result.url} className="text-xs">
                                    <a
                                        className="flex items-center gap-1 font-medium text-foreground hover:underline" 
                                        href={result.url} 
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <span className="truncate">{result.title}</span>
                                        <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground " />
                                    </a>
                                    <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                                            {result.snippet}
                                    </p>
                                </li>
                            ))
                        )}
                    </ol>
            </CollapsibleContent>
        </Collapsible>
    )
}