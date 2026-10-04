import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CtaMotion } from "./motion";

const REPO_URL = "https://github.com/ArmanRuhit/chai-gpt-build";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
            C
          </span>
          <span className="text-sm font-medium tracking-tight text-zinc-100">ChaiGPT</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden px-3 text-sm text-zinc-400 transition-colors hover:text-zinc-100 sm:block"
          >
            GitHub
          </Link>
          <CtaMotion>
            <Button size="sm" nativeButton={false} render={<Link href="/sign-in" />}>
              Start chatting
            </Button>
          </CtaMotion>
        </nav>
      </div>
    </header>
  );
}
