import Image from "next/image";

import { Reveal } from "./motion";

export function LandingBranching() {
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
        <Reveal className="lg:order-2">
          <h2 className="max-w-md text-3xl font-medium tracking-tight text-zinc-100 md:text-4xl">
            Every answer is a fork in the road.
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            Branch from any reply to explore a different direction. Switch between takes in one click,
            and the original thread stays untouched.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="lg:order-1">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
            <Image
              src="/landing/branching.png"
              alt="A branched conversation with the branch switcher and the sidebar tree"
              width={800}
              height={720}
              className="w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
