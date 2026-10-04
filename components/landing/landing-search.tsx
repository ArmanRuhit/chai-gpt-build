import Image from "next/image";

import { Reveal } from "./motion";

export function LandingSearch() {
  return (
    <section id="features" className="border-b border-white/5 bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 lg:py-28">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-medium tracking-tight text-zinc-100 md:text-4xl">
            It looks things up mid-answer.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-xl text-zinc-400">
            Ask anything current and the model reaches for the web on its own. Watch the sources land,
            then get an answer with citations.
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-12">
          <div className="max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
            <Image
              src="/landing/search-tool.png"
              alt="An expanded web search step showing five sources with titles and snippets"
              width={545}
              height={360}
              className="w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
