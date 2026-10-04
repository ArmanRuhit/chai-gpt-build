import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

/**
 * Public landing page
 */
const LandingPage = async () => {
    const { userId } = await auth();

    if (userId) {
        redirect("/new");
    }

    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
            <h1 className="max-w-3xl text-4xl font-medium tracking tight md:text-6xl">
                Chat that searches, branches, and knows when to stop.
            </h1>
            <Button size="lg" nativeButton={false} render={<Link href={"/sign-in"} />}>
                Start chatting
            </Button>
        </main>
    )
};

export default LandingPage;