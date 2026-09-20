import type { UIMessage } from "ai";
import type { WebSearchInput, WebSearchOutput } from "./web-search";

/** Map of UI tool parts, mirroring `chatTools`. Keeps client code type-safe.  */
export type ChatUITools =  {
    web_search : { input: WebSearchInput; output: WebSearchOutput };
}


/** The message type used by `useChat` and the chat components */
export type ChatUIMessage = UIMessage<never, never, ChatUITools>;