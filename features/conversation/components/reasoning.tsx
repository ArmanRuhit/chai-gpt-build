"use client"

import { useState } from "react"
import { BrainIcon, ChevronDownIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"

import { cn } from "@/lib/utils"

type ReasoningProps = {
    text: string
    state: "streaming" | "done"
}

export function Reasoning({ text, state }: ReasoningProps) {
    const [userOpen, setUserOpen] = useState<boolean | null>(null)
    const open = userOpen ?? (state == "streaming")

    return (
        <Collapsible
            className="w-full rounded-lg border border-border/60 bg-muted/30"
            onOpenChange={(nextOpen) => setUserOpen(nextOpen)}
            open={open}
        >
            <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <BrainIcon className="size-3.5" />
                <span>{state === "streaming" ? "Thinking…" : "Thought for a moment"}</span>
                <ChevronDownIcon
                    className={cn("ml-auto size-3.5 transition-transform", open && "rotate-180")}
                />
            </CollapsibleTrigger>

            <CollapsibleContent className="overflow-hidden">
                <div className="max-h-72 overflow-y-auto whitespace-pre-wrap px-3 pb-3 text-xs leading-relaxed text-muted-foreground">
                    {text}
                </div>
            </CollapsibleContent>

        </Collapsible>
    )
}