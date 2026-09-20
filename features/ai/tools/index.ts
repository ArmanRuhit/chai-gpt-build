import { webSearchTool } from "./web-search";

/** Every tool the chat model may call. Add new tools here. */
export const chatTools = {
    web_search: webSearchTool,
} as const;


export type ChatTools = typeof chatTools;