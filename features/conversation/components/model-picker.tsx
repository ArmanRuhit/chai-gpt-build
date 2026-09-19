"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CHAT_MODELS } from "@/features/ai/config/models";

type ModelPickerProps = {
    value: string;
    onValueChange: (modelId: string) => void;
    disabled?: boolean;
}

/** Model selector for a new (empty) conversation, locked after the first message */
export function ModelPicker({ value, onValueChange, disabled= false}: ModelPickerProps) {
    return (
        <Select
            value={value}
            onValueChange={(next) => {
                if(next) onValueChange(next as string);
            }}
            disabled={disabled}
        >
            <SelectTrigger size="sm" className="gap-1.5 text-xs font-medium" aria-label="Select Model">
                <SelectValue>
                    {(current) => 
                        CHAT_MODELS.find((model) => model.id === current)?.label ?? "Select model"
                    }
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {CHAT_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                        {model.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}