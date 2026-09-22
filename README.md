# ChaiGPT

A ChatGPT-style AI chat app built with Next.js, the Vercel AI SDK, and Prisma. The model can call a web search tool mid-conversation, stream the tool execution, and answer from real-time results.

## Features

- **AI tool calling** — the model decides when it needs the web, calls the `web_search` tool, and keeps generating from the results (multi-step, up to 5 steps)
- **Streamed tool execution** — search progress, results, and failures render inline as the response streams
- **Web search via Tavily** — provider adapter normalizes results into `title`, `url`, `snippet`, `publishedAt`
- **Tool call persistence** — every invocation is stored in a queryable `ToolCall` table; full message parts replay on reload
- Streaming chat with persisted conversation history
- Multi-provider model support (DeepSeek, OpenAI) via the AI SDK provider registry
- Per-conversation model selection at chat start
- Clerk authentication, PostgreSQL persistence with Prisma

## Tech Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Vercel AI SDK 7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/deepseek`, `@ai-sdk/react`)
- Zod 4 for tool input schemas
- Tavily Search API
- Prisma 7 + PostgreSQL
- Clerk authentication

## Getting Started

1. `bun install`
2. Create `.env.local` with the variables below
3. `bunx prisma migrate dev`
4. `bun run dev` and open http://localhost:3000

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `DEEPSEEK_API_KEY` | DeepSeek API key (default provider) |
| `OPENAI_API_KEY` | OpenAI API key (optional provider) |
| `TAVILY_API_KEY` | Tavily web search API key (required for search) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post sign-in redirect |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post sign-up redirect |

Get a free Tavily key at [tavily.com](https://tavily.com) (1,000 credits/month). If the key is missing, the tool returns a clear "Web search is not configured" error instead of crashing the request.

## Architecture

### Chat request flow

1. `app/api/chat/route.ts` validates auth/ownership and persists the user message.
2. `streamText` runs with `tools: chatTools` and `stopWhen: isStepCount(5)`, so the model can search, read results, and continue answering in the same request.
3. Tool execution streams over the UI message protocol — the client sees `input-streaming`, `input-available`, `output-available`, or `output-error` states.
4. On stream end, messages (including tool parts) are saved to `Message.parts`, and each invocation is upserted into `ToolCall`.

### Web search tool

- `features/ai/tools/index.ts` — `chatTools` registry (add new tools here)
- `features/ai/tools/web-search.ts` — the `web_search` tool: description, Zod input schema, `execute` calling Tavily
- `features/ai/tools/search/tavily.ts` — provider adapter (10s timeout, error mapping, result normalization)
- `features/ai/tools/types.ts` — client-safe `ChatUIMessage` type for typed tool parts

The model chooses when to call the tool (`toolChoice: "auto"`). The tool description is the main lever for how eagerly it searches.

### Persistence

| Model | Purpose |
| --- | --- |
| `Conversation` | Thread metadata, per-thread model |
| `Message` | Full `parts` JSON, so tool calls replay in the UI |
| `ToolCall` | Queryable audit trail: `toolName`, `input`, `output`, `state` (`PENDING`/`SUCCESS`/`ERROR`), `errorText`, timestamps |

### UI

- `features/conversation/components/tool-call.tsx` — collapsible tool card: spinner while searching, source list with links and snippets when done, destructive alert on failure
- `features/conversation/components/chat-messages.tsx` — renders text, reasoning, and tool parts; shows a retry banner when a response fails

## Demo Prompts

- `Search the web for today's AI news headlines` — basic tool call
- `What is the latest Next.js version and its release date? Confirm with two independent sources, then list breaking changes mentioned in the release notes.` — multi-step verification
- `Summarize the second source you found and give me its URL.` — follow-up that reuses stored tool results

## Deployment

1. Push to GitHub and import the repo into Vercel.
2. Add every variable from the Environment Variables table to the Vercel project (all environments).
3. Run migrations against the production database: `bunx prisma migrate deploy`.
4. Deploy. Build command and output are the Next.js defaults.

## Scripts

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run lint` — ESLint
- `bunx prisma migrate dev` — create/apply migrations locally
- `bunx prisma migrate deploy` — apply migrations in production
- `bunx prisma studio` — browse the database

## Roadmap

- Phase 2: conversation branching — create branches from any message, switch between them, rename/delete.
