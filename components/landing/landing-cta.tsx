import Link from "next/link";

import { Button } from "@/components/ui/button";

import { CtaMotion, Reveal } from "./motion";

export function LandingCta() {
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center md:px-6 lg:py-32">
        <Reveal>
          <h2 className="text-3xl font-medium tracking-tight text-zinc-100 md:text-4xl">
            Your first fifteen messages are free.
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-8">
          <CtaMotion>
            <Button size="lg" nativeButton={false} render={<Link href="/sign-in" />}>
              Start chatting
            </Button>
          </CtaMotion>
        </Reveal>
      </div>
    </section>
  );
}
