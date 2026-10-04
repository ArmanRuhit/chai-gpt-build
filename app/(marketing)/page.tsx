import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingBranching } from "@/components/landing/landing-branching";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingSearch } from "@/components/landing/landing-search";
import { LandingTrial } from "@/components/landing/landing-trial";

export const metadata: Metadata = {
  title: "ChaiGPT — Chat that searches, branches, and knows when to stop",
  description:
    "A small AI chat app with live web search, conversation branching, and a transparent free-message trial. Built with Next.js, the AI SDK, Clerk, and Prisma.",
};

export default async function MarketingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/new");
  }

  return (
    <div className="dark min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingSearch />
        <LandingBranching />
        <LandingTrial />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
