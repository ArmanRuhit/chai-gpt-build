# ChaiGPT

A ChatGPT-style AI chat app built with Next.js, the Vercel AI SDK, and Prisma. The model can call a web search tool mid-conversation, stream the tool execution, and answer from real-time results — and users can branch a conversation from any message and continue independently.

## Features

**AI tools**

- **AI tool calling** — the model decides when it needs the web, calls the `web_search` tool, and keeps generating from the results (multi-step, up to 5 steps)
- **Streamed tool execution** — search progress, results, and failures render inline as the response streams
- **Web search via Tavily** — provider adapter normalizes results into `title`, `url`, `snippet`, `publishedAt`
- **Tool call persistence** — every invocation is stored in a queryable `ToolCall` table; full message parts replay on reload

**Conversation branching**

- **Branch from any message** — fork a chat into a new conversation that keeps the shared history up to the fork point
- **Branch navigation** — header bar with `Branched from <title>` and a sibling switcher (`N of M`, prev/next)
- **Branch management** — rename, pin, and delete like any chat; deleting a parent keeps its branches alive
- **Sidebar tree** — branches indent under their parent with a branch icon

**Chat**

- Multi-provider model support (DeepSeek, OpenAI) via the AI SDK provider registry
- Per-conversation model selection at chat start
- Clerk authentication, PostgreSQL persistence with Prisma

## Tech Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Vercel AI SDK 7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/deepseek`, `@ai-sdk/react`)
- Zod 4 for tool input schemas
- Tavily Search API
- TanStack Query for server-state caching (conversations, messages, branch context)
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

### Conversation branching

A branch is a `Conversation` row linked to its parent, with the fork point recorded:

- `Conversation.parentConversationId` — null for root chats, set for branches
- `Conversation.forkedAtMessageId` — the message the branch continues from

Creating a branch copies every message up to and including the fork point into a new conversation inside a transaction, preserving `createdAt` and `parts` — so tool cards and citations replay in the branch automatically. A branch is still just a conversation, so the chat route, history loading, and rename/pin/delete all work unchanged.

- `features/branching/actions/branch-actions.ts` — `createBranch` (transactional prefix copy), `getBranchContext` (parent + siblings forked from the same message)
- `features/branching/hooks/use-branches.ts` — `useBranchContext`, `useCreateBranch`
- `features/branching/components/branch-bar.tsx` — `Branched from <title>` plus the `N of M` sibling switcher
- `features/conversation/components/app-sidebar.tsx` — `buildConversationTree` nests branches under their parent

Deleting a parent chat keeps its branches (`onDelete: SetNull`); the delete dialog tells the user how many branches will survive.

### Persistence

| Model | Purpose |
| --- | --- |
| `Conversation` | Thread metadata, per-thread model, branch link (`parentConversationId`, `forkedAtMessageId`) |
| `Message` | Full `parts` JSON, so tool calls replay in the UI |
| `ToolCall` | Queryable audit trail: `toolName`, `input`, `output`, `state` (`PENDING`/`SUCCESS`/`ERROR`), `errorText`, timestamps |

### UI

- `features/conversation/components/tool-call.tsx` — collapsible tool card: spinner while searching, source list with links and snippets when done, destructive alert on failure
- `features/conversation/components/chat-messages.tsx` — renders text, reasoning, and tool parts; hover action to branch from a message; retry banner when a response fails
- `features/branching/components/branch-bar.tsx` — branch lineage and sibling navigation under the chat header

## Demo Prompts

- `Search the web for today's AI news headlines` — basic tool call
- `What is the latest Next.js version and its release date? Confirm with two independent sources, then list breaking changes mentioned in the release notes.` — multi-step verification
- `Summarize the second source you found and give me its URL.` — follow-up that reuses stored tool results
- **Branching:** open any chat, hover a message → branch icon → ask a different follow-up in the new branch; the header shows `2 of 2` and the sidebar nests the branch under its parent

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

- Phase 1 (done): web search tool calling
- Phase 2 (done): conversation branching
- Next ideas: search-result caching, per-request search toggle, message editing with auto-branch, branch-aware regenerate
