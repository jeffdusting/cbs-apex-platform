import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";
import type { ProviderResponse } from "@shared/schema";
// Artifact detection functionality
function detectArtifacts(content: string): Array<{
  type: string;
  name: string;
  content: string;
  language?: string;
}> {
  const artifacts: Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }> = [];

  // Detect code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let codeMatch;
  let codeIndex = 1;

  while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
    const language = codeMatch[1] || 'text';
    const code = codeMatch[2].trim();
    
    if (code.length > 50) { // Only include substantial code blocks
      artifacts.push({
        type: 'code',
        name: `Code Snippet ${codeIndex} (${language})`,
        content: code,
        language
      });
      codeIndex++;
    }
  }

  return artifacts;
}
import { countTokens } from "./tokenCounter";

/*
Important model information:
- The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
- The newest Anthropic model is "claude-sonnet-4-20250514", not older 3.x models
- The newest Gemini model series is "gemini-2.5-pro"
- The newest xAI Grok model is "grok-2-1212"
*/

export interface LLMProvider {
  id: string;
  generateResponse(prompt: string, context?: string): Promise<ProviderResponse>;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  public id: string;
  private costPer1kTokens: number;

  constructor(id: string, apiKey: string, costPer1kTokens = 0.01) {
    this.id = id;
    this.client = new OpenAI({ apiKey });
    this.costPer1kTokens = costPer1kTokens;
  }

  async generateResponse(prompt: string, context?: string): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "user", content: context ? `${context}\n\n${prompt}` : prompt }
    ];

    const response = await this.client.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages,
    });

    const content = response.choices[0].message.content || "";
    // Use response token count if available, otherwise use tiktoken with model information
    const tokensUsed = response.usage?.total_tokens || countTokens(content, "gpt-5", "openai");
    const responseTime = Date.now() - startTime;
    const cost = (tokensUsed / 1000) * this.costPer1kTokens;

    const artifacts = detectArtifacts(content);

    return {
      content,
      tokensUsed,
      cost,
      responseTime,
      artifacts
    };
  }
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  public id: string;
  private costPer1kTokens: number;

  constructor(id: string, apiKey: string, costPer1kTokens = 0.015) {
    this.id = id;
    this.client = new Anthropic({ apiKey });
    this.costPer1kTokens = costPer1kTokens;
  }

  async generateResponse(prompt: string, context?: string): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    const message = await this.client.messages.create({
      max_tokens: 4096,
      messages: [{ 
        role: 'user', 
        content: context ? `${context}\n\n${prompt}` : prompt 
      }],
      model: "claude-sonnet-4-20250514", // newest Anthropic model
    });

    const content = Array.isArray(message.content) 
      ? message.content.map(c => c.type === 'text' ? c.text : '').join('')
      : message.content;
    
    // Use response token count if available, otherwise use tiktoken with model information
    const tokensUsed = (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0) || countTokens(content, "claude-sonnet-4-20250514", "anthropic");
    const responseTime = Date.now() - startTime;
    // Use configured cost per 1k tokens
    const cost = (tokensUsed / 1000) * this.costPer1kTokens;

    const artifacts = detectArtifacts(content);

    return {
      content,
      tokensUsed,
      cost,
      responseTime,
      artifacts
    };
  }
}

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  public id: string;
  private costPer1kTokens: number;

  constructor(id: string, apiKey: string, costPer1kTokens = 0.0025) {
    this.id = id;
    this.client = new GoogleGenAI({ apiKey });
    this.costPer1kTokens = costPer1kTokens;
  }

  async generateResponse(prompt: string, context?: string): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-pro", // newest Gemini model
      contents: context ? `${context}\n\n${prompt}` : prompt,
    });

    const content = response.text || "";
    // Use tiktoken with Gemini model information for more accurate counting
    const tokensUsed = countTokens(content, "gemini-2.5-pro", "google");
    const responseTime = Date.now() - startTime;
    const cost = (tokensUsed / 1000) * this.costPer1kTokens;

    const artifacts = detectArtifacts(content);

    return {
      content,
      tokensUsed,
      cost,
      responseTime,
      artifacts
    };
  }
}

export class MistralProvider implements LLMProvider {
  public id: string;
  private costPer1kTokens: number;

  constructor(id: string, apiKey: string, costPer1kTokens = 0.008) {
    this.id = id;
    this.costPer1kTokens = costPer1kTokens;
    // Mistral implementation would go here
    // For now, we'll simulate the response
  }

  async generateResponse(prompt: string, context?: string): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    // Simulate Mistral API call
    // In a real implementation, this would use the Mistral SDK
    const content = "Mistral response simulation - API integration pending";
    const tokensUsed = countTokens(content, "mistral-large-latest", "mistral");
    const responseTime = Date.now() - startTime;
    const cost = (tokensUsed / 1000) * this.costPer1kTokens;

    const artifacts = detectArtifacts(content);

    return {
      content,
      tokensUsed,
      cost,
      responseTime,
      artifacts
    };
  }
}

export class GrokProvider implements LLMProvider {
  private client: OpenAI;
  public id: string;
  private costPer1kTokens: number;

  constructor(id: string, apiKey: string, costPer1kTokens = 0.02) {
    this.id = id;
    this.costPer1kTokens = costPer1kTokens;
    // xAI's Grok uses OpenAI-compatible API
    this.client = new OpenAI({ 
      baseURL: "https://api.x.ai/v1", 
      apiKey 
    });
  }

  async generateResponse(prompt: string, context?: string): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "user", content: context ? `${context}\n\n${prompt}` : prompt }
    ];

    const response = await this.client.chat.completions.create({
      model: "grok-2-1212", // Latest Grok model
      messages,
    });

    const content = response.choices[0].message.content || "";
    // Use response token count if available, otherwise use tiktoken with XAI model information
    const tokensUsed = response.usage?.total_tokens || countTokens(content, "grok-2-1212", "xai");
    const responseTime = Date.now() - startTime;
    const cost = (tokensUsed / 1000) * this.costPer1kTokens;

    const artifacts = detectArtifacts(content);

    return {
      content,
      tokensUsed,
      cost,
      responseTime,
      artifacts
    };
  }
}

export function createProvider(id: string, model: string, apiKey: string): LLMProvider {
  if (model.startsWith('gpt')) {
    return new OpenAIProvider(id, apiKey);
  } else if (model.startsWith('claude')) {
    return new AnthropicProvider(id, apiKey);
  } else if (model.startsWith('gemini')) {
    return new GeminiProvider(id, apiKey);
  } else if (model.startsWith('mistral')) {
    return new MistralProvider(id, apiKey);
  } else if (model.startsWith('grok')) {
    return new GrokProvider(id, apiKey);
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}
