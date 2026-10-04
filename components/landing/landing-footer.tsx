import Link from "next/link";

const REPO_URL = "https://github.com/ArmanRuhit/chai-gpt-build";

export function LandingFooter() {
  return (
    <footer>
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            C
          </span>
          <span className="text-sm text-zinc-400">ChaiGPT</span>
        </div>
        <p className="font-mono text-xs text-zinc-400">Next.js · AI SDK · Clerk · Prisma · Tavily</p>
        <Link
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          GitHub
        </Link>
      </div>
    </footer>
  );
}
