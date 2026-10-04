"use client";

import * as React from "react";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";

type TrialLimitNoticeProps = {
    used: number;
    limit: number;
}

/**
 * Blocked state shown in place of the composer once the free quota is spent.
 * The upgrade button opens a placeholder checkout dialog.
 */
export function TrialLimitNotice({ used, limit }: TrialLimitNoticeProps) {
    const [upgradeOpen, setUpgradeOpen] = React.useState(false);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 md:px-6">
            <div className="flex flex-col items-center rounded-3xl border border-dashed bg-muted/40 px-6 py-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-background shadow-sm">
                    <LockIcon className="size-5 text-muted-foreground"/>
                </div>
                <h2 className="mt-3 text-sm font-medium">
                    You&apos;ve reached your free message limit
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {used} of {limit} free messages used.
                </p>
                <Button size="sm" className="mt-4" onClick={() => setUpgradeOpen(true)}>
                    Upgrade
                </Button>
            </div>
            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upgrade to ChaiGPT Pro</DialogTitle>
                        <DialogDescription>
                            Unlimited messages are coming soon. Billing isn&apos;t wired up in this demo build, so there is nothing to check out yet.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton />
                </DialogContent>
            </Dialog>
        </div>  
    )
}