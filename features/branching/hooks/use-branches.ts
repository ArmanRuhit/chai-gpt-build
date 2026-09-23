"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    createBranch,
    getBranchContext,
} from "@/features/branching/actions/branch-actions";

import { queryKeys } from "@/features/conversation/utils/query-keys";


export function useBranchContext(conversationId: string) {
    return useQuery({
        queryKey: queryKeys.branch.context(conversationId),
        queryFn: () => getBranchContext(conversationId),
    });
}

/** Creates a branch from a message, then navigates to it. */
export function useCreateBranch(){
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: ({
            conversationId,
            messageId,
        }: {
            conversationId: string,
            messageId: string;
        }) => createBranch(conversationId, messageId),
        onSuccess: (branch) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
            router.push(`/c/${branch.id}`);
            toast.success("Branch created");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not create branch");
        },
    });
}