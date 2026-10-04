import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CtaMotion, FadeIn } from "./motion";

export function LandingHero() {
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:px-6 lg:pt-24 lg:pb-24">
        <FadeIn fade={false}>
          <h1 className="max-w-4xl text-4xl font-medium tracking-tighter text-zinc-100 md:text-6xl">
            Chat that searches, branches, and knows when to stop.
          </h1>
        </FadeIn>
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          <FadeIn fade={false} delay={0.08}>
            <p className="max-w-[46ch] text-base leading-relaxed text-zinc-400 md:text-lg">
              Web search runs mid-answer. Every reply can fork into a branch. Free messages are counted,
              not hidden.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <CtaMotion>
                <Button size="lg" nativeButton={false} render={<Link href="/sign-in" />}>
                  Start chatting
                </Button>
              </CtaMotion>
              <Link
                href="#features"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                See how it works
              </Link>
            </div>
          </FadeIn>
          <FadeIn fade={false} delay={0.16}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
              <Image
                src="/landing/hero-chat.png"
                alt="ChaiGPT answering a question with live web search results"
                width={800}
                height={500}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/80 to-transparent" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
