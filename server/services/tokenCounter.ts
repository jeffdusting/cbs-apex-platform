import { encoding_for_model, get_encoding } from 'tiktoken';

// Encoding mapping for different LLM providers
const ENCODING_MAP = {
  // OpenAI models
  'gpt-5': 'o200k_base',
  'gpt-4o': 'o200k_base', 
  'gpt-4o-mini': 'o200k_base',
  'gpt-4-turbo': 'cl100k_base',
  'gpt-4': 'cl100k_base',
  'gpt-3.5-turbo': 'cl100k_base',
  
  // Default fallback encoding
  'default': 'cl100k_base'
} as const;

// Provider-specific encoding defaults
const PROVIDER_ENCODING_MAP = {
  'openai': 'o200k_base',
  'anthropic': 'cl100k_base', // Anthropic uses similar tokenization to GPT-4
  'google': 'cl100k_base',    // Approximate for Gemini
  'mistral': 'cl100k_base',   // Approximate for Mistral
  'xai': 'cl100k_base',       // Approximate for Grok
} as const;

/**
 * Count tokens using tiktoken for accurate tokenization
 * @param text - The text to count tokens for
 * @param model - The specific model name (optional)
 * @param provider - The provider name (optional, used as fallback)
 * @returns Number of tokens
 */
export function countTokens(text: string, model?: string, provider?: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  try {
    let encoding;

    // Try to get encoding for specific model first
    if (model && model in ENCODING_MAP) {
      encoding = get_encoding(ENCODING_MAP[model as keyof typeof ENCODING_MAP]);
    }
    // Fall back to provider-specific encoding
    else if (provider && provider in PROVIDER_ENCODING_MAP) {
      encoding = get_encoding(PROVIDER_ENCODING_MAP[provider as keyof typeof PROVIDER_ENCODING_MAP]);
    }
    // Use default encoding
    else {
      encoding = get_encoding(ENCODING_MAP.default);
    }

    const tokens = encoding.encode(text);
    encoding.free(); // Important: free the encoding to prevent memory leaks
    return tokens.length;

  } catch (error) {
    console.warn('Failed to use tiktoken encoding, falling back to approximation:', error);
    // Fallback to word-based approximation if tiktoken fails
    return fallbackTokenCount(text);
  }
}

/**
 * Estimate tokens for a specific model
 * @param text - The text to estimate tokens for
 * @param model - The model to estimate for
 * @param provider - The provider name
 * @returns Number of estimated tokens
 */
export function estimateTokens(text: string, model?: string, provider?: string): number {
  return countTokens(text, model, provider);
}

/**
 * Count tokens for multiple texts efficiently
 * @param texts - Array of texts to count
 * @param model - The model name
 * @param provider - The provider name
 * @returns Array of token counts
 */
export function countTokensBatch(texts: string[], model?: string, provider?: string): number[] {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    let encoding;

    if (model && model in ENCODING_MAP) {
      encoding = get_encoding(ENCODING_MAP[model as keyof typeof ENCODING_MAP]);
    } else if (provider && provider in PROVIDER_ENCODING_MAP) {
      encoding = get_encoding(PROVIDER_ENCODING_MAP[provider as keyof typeof PROVIDER_ENCODING_MAP]);
    } else {
      encoding = get_encoding(ENCODING_MAP.default);
    }

    const results = texts.map(text => {
      if (!text || typeof text !== 'string') return 0;
      const tokens = encoding.encode(text);
      return tokens.length;
    });

    encoding.free(); // Free encoding after batch processing
    return results;

  } catch (error) {
    console.warn('Failed to use tiktoken for batch processing, falling back to approximation:', error);
    return texts.map(text => fallbackTokenCount(text));
  }
}

/**
 * Get token breakdown for messages (useful for chat completions)
 * @param messages - Array of message objects
 * @param model - The model name
 * @param provider - The provider name
 * @returns Object with detailed token breakdown
 */
export function getTokenBreakdown(
  messages: Array<{ role: string; content: string }>, 
  model?: string, 
  provider?: string
): {
  totalTokens: number;
  messageTokens: number[];
  overhead: number;
} {
  const messageTokens = messages.map(msg => countTokens(msg.content, model, provider));
  
  // Add overhead for message formatting (role, separators, etc.)
  // This is an approximation - actual overhead varies by provider
  const overheadPerMessage = 4; // Rough estimate for role and formatting tokens
  const overhead = messages.length * overheadPerMessage;
  
  const totalTokens = messageTokens.reduce((sum, tokens) => sum + tokens, 0) + overhead;

  return {
    totalTokens,
    messageTokens,
    overhead
  };
}

/**
 * Fallback token counting using word-based approximation
 * @param text - The text to count
 * @returns Approximate token count
 */
function fallbackTokenCount(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Improved approximation considering punctuation and special characters
  const words = text.trim().split(/\s+/).length;
  const characters = text.length;
  
  // More accurate approximation: average of word-based and character-based estimates
  const wordBasedEstimate = Math.ceil(words / 0.75);
  const charBasedEstimate = Math.ceil(characters / 4);
  
  return Math.round((wordBasedEstimate + charBasedEstimate) / 2);
}

/**
 * Calculate cost based on token count and pricing
 * @param tokenCount - Number of tokens
 * @param costPer1kTokens - Cost per 1000 tokens
 * @returns Cost in USD
 */
export function calculateTokenCost(tokenCount: number, costPer1kTokens: number): number {
  return (tokenCount / 1000) * costPer1kTokens;
}
