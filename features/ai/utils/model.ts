import { createProviderRegistry } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createDeepSeek } from "@ai-sdk/deepseek"

import { DEFAULT_MODEL_ID, isChatModelId, type ChatModelId } from "@/features/ai/config/models"

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
})


const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const registry = createProviderRegistry(
    { openai, deepseek },
    { separator: "/"}
)



export function getChatModel(modelId?: string | null) {
    const model = modelId && isChatModelId(modelId) ? modelId : DEFAULT_MODEL_ID
    return registry.languageModel(model as ChatModelId)
}