export type ChatModelId = `${"openai" | "deepseek"}/${string}`
export type ChatModel = {id: ChatModelId; label: string; provider: "openai" | "deepseek"}

export const CHAT_MODELS = [
    {id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash", provider: "deepseek"},
    {id: "openai/gpt-4o-mini", label: "GPT-4o mini", provider: "openai"},
] as const satisfies readonly ChatModel[]

export const DEFAULT_MODEL_ID = "deepseek/deepseek-v4-flash" satisfies ChatModelId

export function isChatModelId(id: string): id is ChatModelId {
    return CHAT_MODELS.some((model) => model.id === id)
}