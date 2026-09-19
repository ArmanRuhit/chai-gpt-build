# ChaiGPT

A ChatGPT-style AI chat app built with Next.js, the Vercel AI SDK, and Prisma.

## Features

- Streaming chat with persisted conversation history
- Multi-provider model support (DeepSeek, OpenAI) via the AI SDK provider registry
- Per-conversation model selection at chat start
- Clerk authentication, PostgreSQL persistence with Prisma

## Tech Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Vercel AI SDK 7 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`)
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
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post sign-in redirect |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post sign-up redirect |

## Models

The catalog lives in `features/ai/config/models.ts`; providers are registered in `features/ai/utils/model.ts`. Add a provider to the registry plus an entry to the catalog to expose it in the picker. Model is chosen at chat start and locked after the first message.

## Scripts

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run lint` — ESLint