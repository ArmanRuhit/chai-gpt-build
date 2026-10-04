import Image from "next/image";

import { Reveal } from "./motion";

export function LandingTrial() {
  return (
    <section className="border-b border-white/5 bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 lg:py-28">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-medium tracking-tight text-zinc-100 md:text-4xl">
            Honest limits, visible from the start.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-xl text-zinc-400">
            Fifteen free messages, counted live in the composer. When they run out you get a clear
            upgrade path instead of a dead input.
          </p>
        </Reveal>
        <div className="mt-12 grid items-end gap-6 lg:grid-cols-12">
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/30">
              <Image
                src="/landing/trial-counter.png"
                alt="Composer showing thirteen of fifteen free messages left"
                width={545}
                height={140}
                className="w-full"
              />
            </div>
          </Reveal>
          <Reveal delay={0.16} className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/30">
              <Image
                src="/landing/trial-blocked.png"
                alt="Chat paused at the free message limit with an upgrade panel"
                width={545}
                height={297}
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
