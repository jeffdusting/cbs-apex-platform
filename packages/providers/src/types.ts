import { z } from 'zod'

export const ProviderResponseSchema = z.object({
  id: z.string(),
  provider: z.string(),
  content: z.string(),
  tokens: z.number(),
  cost: z.number(),
  responseTime: z.number(),
  model: z.string(),
  finishReason: z.string().optional(),
  error: z.string().optional()
})

export const GenerationOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  context: z.object({
    documents: z.array(z.string()).optional(),
    conversation: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })).optional()
  }).optional()
})

export type ProviderResponse = z.infer<typeof ProviderResponseSchema>
export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>

export interface ProviderConfig {
  name: string
  type: string
  apiKey: string
  baseUrl?: string
  model: string
  isActive: boolean
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
  pricing: {
    inputTokens: number  // Cost per 1K tokens
    outputTokens: number // Cost per 1K tokens
  }
}

export interface ProviderUsage {
  providerId: string
  requestCount: number
  tokenCount: number
  cost: number
  lastUsed: Date
}

