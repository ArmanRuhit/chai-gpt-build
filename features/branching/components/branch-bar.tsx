"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, GitBranchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBranchContext } from "@/features/branching/hooks/use-branches";

/**
 * Header strip under the chat header: shows where the current branch forked
 * from and lets the user cycle through sibling branches
 */
export function BranchBar({ conversationId } : { conversationId: string }) {
    const router = useRouter();
    const { data, status } = useBranchContext(conversationId);

    if(status !== "success" || !data?.parent) return null;

    const siblings = data.siblings;
    const index = Math.max(
        0,
        siblings.findIndex((sibling) => sibling.id === conversationId)
    );
    const previous = siblings[(index - 1 + siblings.length) % siblings.length];
    const next = siblings[(index + 1) % siblings.length];


    return (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <GitBranchIcon className="size-3.5 shrink-0" />
            <span className="shrink-0">Branched from</span>
            <Link
                className="truncate font-medium text-foreground hover:underline"
                href={`/c/${data.parent.id}`}
            >
                {data.parent.title}
            </Link>
            <span className="shrink-0">
                · {index + 1} of {siblings.length}
            </span>
            <span className="ml-auto flex items-center gap-1">
                <Button
                    aria-label="Previous branch"
                    disabled={siblings.length <= 1}
                    onClick={() => router.push(`/c/${previous.id}`)}
                    size="icon-sm"
                    variant="ghost"
                >
                    <ChevronLeftIcon />
                </Button>

                <Button
                    aria-label="Next branch"
                    disabled={siblings.length <= 1}
                    onClick={() => router.push(`/c/${next.id}`)}
                    size="icon-sm"
                    variant="ghost"
                >
                    <ChevronRightIcon />
                </Button>
            </span>
        </div>
    )
}