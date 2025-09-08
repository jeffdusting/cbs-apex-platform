import { type Provider, type InsertProvider, type Folder, type InsertFolder, type Document, type InsertDocument, type Conversation, type InsertConversation, type Prompt, type InsertPrompt, type Response, type InsertResponse, type BatchTest, type InsertBatchTest, type BatchResult, type InsertBatchResult, type PromptSequence, type InsertPromptSequence, type SequenceStep, type InsertSequenceStep, type AgentLibrary, type InsertAgentLibrary, type AgentSpecialty, type InsertAgentSpecialty } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { agentLibrary } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Providers
  getProviders(): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, provider: Partial<InsertProvider>): Promise<Provider>;
  
  // Folders
  getFolders(): Promise<Folder[]>;
  getFolder(id: string): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, folder: Partial<InsertFolder>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
  
  // Documents
  getDocuments(folderId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  searchDocuments(query: string): Promise<Document[]>;
  getFolderDocuments(folderId: string): Promise<Document[]>;
  
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation>;
  
  // Prompts
  getPrompts(conversationId?: string): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  
  // Responses
  getResponses(promptId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  
  // Usage tracking
  updateProviderUsage(providerId: string, cost: number): Promise<void>;
  getTotalCosts(): Promise<{ daily: number; monthly: number; total: number }>;
  
  // Batch testing
  getBatchTests(): Promise<BatchTest[]>;
  getBatchTest(id: string): Promise<BatchTest | undefined>;
  createBatchTest(batchTest: InsertBatchTest): Promise<BatchTest>;
  updateBatchTest(id: string, updates: Partial<InsertBatchTest>): Promise<BatchTest>;
  getBatchResults(batchTestId: string): Promise<BatchResult[]>;
  createBatchResult(batchResult: InsertBatchResult): Promise<BatchResult>;
  
  // Prompt sequencing
  getPromptSequences(): Promise<PromptSequence[]>;
  getPromptSequence(id: string): Promise<PromptSequence | undefined>;
  createPromptSequence(sequence: InsertPromptSequence): Promise<PromptSequence>;
  updatePromptSequence(id: string, updates: Partial<InsertPromptSequence>): Promise<PromptSequence>;
  getSequenceSteps(sequenceId: string): Promise<SequenceStep[]>;
  createSequenceStep(step: InsertSequenceStep): Promise<SequenceStep>;
  updateSequenceStep(id: string, updates: Partial<InsertSequenceStep>): Promise<SequenceStep>;

  // Agent library
  getAgentLibraries(): Promise<AgentLibrary[]>;
  getAgentLibrary(id: string): Promise<AgentLibrary | undefined>;
  createAgentLibrary(agent: InsertAgentLibrary): Promise<AgentLibrary>;
  updateAgentLibrary(id: string, updates: Partial<InsertAgentLibrary>): Promise<AgentLibrary>;
  deleteAgentLibrary(id: string): Promise<void>;
  updateAgentExperience(agentId: string, meetingId: string, role: string, contributions: string[], insights: string[], topics: string[]): Promise<AgentLibrary>;

  // Agent specialties
  getSpecialties(): Promise<AgentSpecialty[]>;
  getSpecialty(id: string): Promise<AgentSpecialty | undefined>;
  createSpecialty(specialty: InsertAgentSpecialty): Promise<AgentSpecialty>;
  updateSpecialty(id: string, updates: Partial<InsertAgentSpecialty>): Promise<AgentSpecialty>;
  deleteSpecialty(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private providers: Map<string, Provider> = new Map();
  private folders: Map<string, Folder> = new Map();
  private documents: Map<string, Document> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private prompts: Map<string, Prompt> = new Map();
  private responses: Map<string, Response> = new Map();
  private batchTests: Map<string, BatchTest> = new Map();
  private batchResults: Map<string, BatchResult> = new Map();
  private promptSequences: Map<string, PromptSequence> = new Map();
  private sequenceSteps: Map<string, SequenceStep> = new Map();
  private agentLibraries: Map<string, AgentLibrary> = new Map();
  private agentSpecialties: Map<string, AgentSpecialty> = new Map();

  constructor() {
    this.initializeDefaultProviders();
    this.initializeDefaultFolders();
  }

  private initializeDefaultFolders() {
    const defaultFolders: Folder[] = [
      {
        id: "general",
        name: "General",
        description: "General purpose documents and files",
        createdAt: new Date()
      }
    ];

    defaultFolders.forEach(folder => {
      this.folders.set(folder.id, folder);
    });
  }

  private initializeDefaultProviders() {
    const defaultProviders: Provider[] = [
      {
        id: "openai-gpt5",
        name: "GPT-5",
        model: "gpt-5",
        availableModels: ["gpt-5", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"] as string[],
        apiKeyEnvVar: "OPENAI_API_KEY",
        costPer1kTokens: "0.01",
        isEnabled: true,
        quotaUsed: "75",
        quotaLimit: "100",
        icon: "openai",
        color: "emerald",
        description: "OpenAI's most advanced language model with superior reasoning capabilities",
        website: "https://openai.com",
        documentation: "https://platform.openai.com/docs",
        maxTokens: 8192,
        supportedFeatures: {
          streaming: true,
          functionCalling: true,
          imageAnalysis: true,
          codeGeneration: true,
          multiModal: true
        },
        rateLimit: {
          requestsPerMinute: 500,
          tokensPerMinute: 30000,
          tokensPerDay: 1000000
        },
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: "anthropic-claude",
        name: "Claude Sonnet 4",
        model: "claude-sonnet-4-20250514",
        availableModels: ["claude-sonnet-4-20250514", "claude-opus-4-1-20250110", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"] as string[],
        apiKeyEnvVar: "ANTHROPIC_API_KEY",
        costPer1kTokens: "0.015",
        isEnabled: true,
        quotaUsed: "45",
        quotaLimit: "100",
        icon: "anthropic",
        color: "amber",
        description: "Anthropic's most capable AI assistant with enhanced safety and reasoning",
        website: "https://anthropic.com",
        documentation: "https://docs.anthropic.com",
        maxTokens: 8192,
        supportedFeatures: {
          streaming: true,
          functionCalling: true,
          imageAnalysis: true,
          codeGeneration: true,
          multiModal: true
        },
        rateLimit: {
          requestsPerMinute: 300,
          tokensPerMinute: 25000,
          tokensPerDay: 800000
        },
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: "google-gemini",
        name: "Gemini 2.5 Pro",
        model: "gemini-2.5-pro",
        availableModels: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-1.0-pro-vision"] as string[],
        apiKeyEnvVar: "GEMINI_API_KEY",
        costPer1kTokens: "0.0025",
        isEnabled: true,
        quotaUsed: "20",
        quotaLimit: "100",
        icon: "google",
        color: "blue",
        description: "Google's advanced multimodal AI model",
        website: "https://ai.google.dev/",
        documentation: "https://ai.google.dev/docs",
        maxTokens: 8192,
        supportedFeatures: {
          streaming: true,
          functionCalling: true,
          imageAnalysis: true,
          codeGeneration: true,
          multiModal: true
        },
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 32000,
          tokensPerDay: 1000000
        },
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: "mistral-large",
        name: "Mistral Large",
        model: "mistral-large-latest",
        availableModels: ["mistral-large-latest", "mistral-large-2407", "mistral-medium-latest", "mistral-small-latest", "open-mistral-7b", "open-mixtral-8x7b", "open-mixtral-8x22b", "codestral-latest"] as string[],
        apiKeyEnvVar: "MISTRAL_API_KEY",
        costPer1kTokens: "0.008",
        isEnabled: true,
        quotaUsed: "10",
        quotaLimit: "100",
        icon: "mistral",
        color: "orange",
        description: "Mistral's flagship large language model",
        website: "https://mistral.ai/",
        documentation: "https://docs.mistral.ai/",
        maxTokens: 128000,
        supportedFeatures: {
          streaming: true,
          functionCalling: true,
          imageAnalysis: false,
          codeGeneration: true,
          multiModal: false
        },
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 100000,
          tokensPerDay: 1000000
        },
        lastUpdated: new Date(),
        createdAt: new Date()
      },
      {
        id: "xai-grok",
        name: "Grok 2",
        model: "grok-2-1212",
        availableModels: ["grok-2-1212", "grok-2-vision-1212", "grok-beta", "grok-vision-beta"] as string[],
        apiKeyEnvVar: "XAI_API_KEY",
        costPer1kTokens: "0.02",
        isEnabled: true,
        quotaUsed: "5",
        quotaLimit: "100",
        icon: "xai",
        color: "slate",
        description: "xAI's conversational AI model",
        website: "https://x.ai/",
        documentation: "https://docs.x.ai/",
        maxTokens: 131072,
        supportedFeatures: {
          streaming: true,
          functionCalling: true,
          imageAnalysis: true,
          codeGeneration: true,
          multiModal: true
        },
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 60000,
          tokensPerDay: 1000000
        },
        lastUpdated: new Date(),
        createdAt: new Date()
      }
    ];

    defaultProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  async getProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = randomUUID();
    const provider: Provider = { 
      ...insertProvider, 
      id,
      isEnabled: insertProvider.isEnabled ?? true,
      quotaUsed: insertProvider.quotaUsed ?? "0",
      quotaLimit: insertProvider.quotaLimit ?? "100",
      availableModels: (insertProvider.availableModels as string[]) ?? [],
      icon: insertProvider.icon ?? null,
      color: insertProvider.color ?? null,
      description: insertProvider.description ?? null,
      website: insertProvider.website ?? null,
      documentation: insertProvider.documentation ?? null,
      maxTokens: insertProvider.maxTokens ?? 4096,
      supportedFeatures: insertProvider.supportedFeatures ?? {
        streaming: true,
        functionCalling: false,
        imageAnalysis: false,
        codeGeneration: true,
        multiModal: false
      },
      rateLimit: insertProvider.rateLimit ?? {
        requestsPerMinute: 60,
        tokensPerMinute: 10000,
        tokensPerDay: 100000
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: string, updates: Partial<InsertProvider>): Promise<Provider> {
    const existing = this.providers.get(id);
    if (!existing) throw new Error("Provider not found");
    
    const updated = { 
      ...existing, 
      ...updates,
      availableModels: updates.availableModels ? [...(updates.availableModels as string[])] : existing.availableModels
    };
    this.providers.set(id, updated);
    return updated;
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = randomUUID();
    const folder: Folder = { 
      ...insertFolder, 
      id, 
      createdAt: new Date(),
      description: insertFolder.description || null
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: string, updates: Partial<InsertFolder>): Promise<Folder> {
    const existing = this.folders.get(id);
    if (!existing) throw new Error("Folder not found");
    
    const updated = { ...existing, ...updates };
    this.folders.set(id, updated);
    return updated;
  }

  async deleteFolder(id: string): Promise<void> {
    // First, update all documents in this folder to have no folder
    for (const [docId, doc] of Array.from(this.documents.entries())) {
      if (doc.folderId === id) {
        this.documents.set(docId, { ...doc, folderId: null });
      }
    }
    this.folders.delete(id);
  }

  async getDocuments(folderId?: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    if (folderId) {
      return docs.filter(doc => doc.folderId === folderId);
    }
    return docs;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date(),
      size: insertDocument.size || null,
      folderId: insertDocument.folderId || null
    };
    this.documents.set(id, document);
    return document;
  }

  async getFolderDocuments(folderId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.folderId === folderId);
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort((a, b) => 
      new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) throw new Error("Conversation not found");
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async getPrompts(conversationId?: string): Promise<Prompt[]> {
    const prompts = Array.from(this.prompts.values());
    if (conversationId) {
      return prompts.filter(p => p.conversationId === conversationId);
    }
    return prompts.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const prompt: Prompt = { 
      ...insertPrompt, 
      id, 
      createdAt: new Date(),
      conversationId: insertPrompt.conversationId || null,
      selectedProviders: insertPrompt.selectedProviders ? [...insertPrompt.selectedProviders] : null,
      selectedFolders: insertPrompt.selectedFolders ? [...insertPrompt.selectedFolders] : null,
      tokenCount: insertPrompt.tokenCount || null,
      totalCost: insertPrompt.totalCost || null
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getResponses(promptId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(r => r.promptId === promptId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = { 
      ...insertResponse, 
      id, 
      createdAt: new Date(),
      tokensUsed: insertResponse.tokensUsed || null,
      cost: insertResponse.cost || null,
      responseTime: insertResponse.responseTime || null,
      artifacts: insertResponse.artifacts as any[] || null
    };
    this.responses.set(id, response);
    return response;
  }

  async updateProviderUsage(providerId: string, cost: number): Promise<void> {
    const provider = this.providers.get(providerId);
    if (provider) {
      const currentUsage = parseFloat(provider.quotaUsed || "0");
      const quotaLimit = parseFloat(provider.quotaLimit || "100");
      const newUsage = Math.min(currentUsage + (cost / 0.01) * 100, quotaLimit);
      
      provider.quotaUsed = newUsage.toFixed(2);
      this.providers.set(providerId, provider);
    }
  }

  async getTotalCosts(): Promise<{ daily: number; monthly: number; total: number }> {
    const responses = Array.from(this.responses.values());
    const batchResults = Array.from(this.batchResults.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyCosts = [...responses, ...batchResults]
      .filter(r => new Date(r.createdAt!) >= today)
      .reduce((sum, r) => sum + parseFloat(r.cost || "0"), 0);

    const monthlyCosts = [...responses, ...batchResults]
      .filter(r => new Date(r.createdAt!) >= thisMonth)
      .reduce((sum, r) => sum + parseFloat(r.cost || "0"), 0);

    const totalCosts = [...responses, ...batchResults]
      .reduce((sum, r) => sum + parseFloat(r.cost || "0"), 0);

    return {
      daily: dailyCosts,
      monthly: monthlyCosts,
      total: totalCosts
    };
  }

  async getBatchTests(): Promise<BatchTest[]> {
    return Array.from(this.batchTests.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getBatchTest(id: string): Promise<BatchTest | undefined> {
    return this.batchTests.get(id);
  }

  async createBatchTest(insertBatchTest: InsertBatchTest): Promise<BatchTest> {
    const id = randomUUID();
    const batchTest: BatchTest = { 
      ...insertBatchTest, 
      id,
      status: insertBatchTest.status || "pending",
      createdAt: new Date(),
      completedAt: null,
      totalCost: insertBatchTest.totalCost || null,
      description: insertBatchTest.description || null,
      prompts: [...(insertBatchTest.prompts as string[])],
      selectedProviders: [...(insertBatchTest.selectedProviders as string[])],
      selectedFolders: insertBatchTest.selectedFolders ? [...(insertBatchTest.selectedFolders as string[])] : null
    };
    this.batchTests.set(id, batchTest);
    return batchTest;
  }

  async updateBatchTest(id: string, updates: Partial<InsertBatchTest>): Promise<BatchTest> {
    const existing = this.batchTests.get(id);
    if (!existing) throw new Error("Batch test not found");
    
    const updated = { 
      ...existing, 
      ...updates,
      prompts: updates.prompts ? [...(updates.prompts as string[])] : existing.prompts,
      selectedProviders: updates.selectedProviders ? [...(updates.selectedProviders as string[])] : existing.selectedProviders,
      selectedFolders: updates.selectedFolders ? [...(updates.selectedFolders as string[])] : existing.selectedFolders
    };
    if (updates.status === 'completed') {
      updated.completedAt = new Date();
    }
    this.batchTests.set(id, updated);
    return updated;
  }

  async getBatchResults(batchTestId: string): Promise<BatchResult[]> {
    return Array.from(this.batchResults.values())
      .filter(r => r.batchTestId === batchTestId)
      .sort((a, b) => a.promptIndex - b.promptIndex);
  }

  async createBatchResult(insertBatchResult: InsertBatchResult): Promise<BatchResult> {
    const id = randomUUID();
    const batchResult: BatchResult = { 
      ...insertBatchResult, 
      id, 
      createdAt: new Date(),
      tokensUsed: insertBatchResult.tokensUsed || null,
      cost: insertBatchResult.cost || null,
      responseTime: insertBatchResult.responseTime || null,
      artifacts: insertBatchResult.artifacts as any[] || null
    };
    this.batchResults.set(id, batchResult);
    return batchResult;
  }

  async getPromptSequences(): Promise<PromptSequence[]> {
    return Array.from(this.promptSequences.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPromptSequence(id: string): Promise<PromptSequence | undefined> {
    return this.promptSequences.get(id);
  }

  async createPromptSequence(insertSequence: InsertPromptSequence): Promise<PromptSequence> {
    const id = randomUUID();
    const sequence: PromptSequence = { 
      name: insertSequence.name,
      taskObjective: insertSequence.taskObjective,
      initialPrompt: insertSequence.initialPrompt,
      iterations: insertSequence.iterations || 1,
      id,
      status: insertSequence.status || "pending",
      createdAt: new Date(),
      completedAt: null,
      totalCost: insertSequence.totalCost || null,
      description: insertSequence.description || null,
      synthesisProviderId: insertSequence.synthesisProviderId || null,
      selectedFolders: insertSequence.selectedFolders ? [...(insertSequence.selectedFolders as string[])] : null,
      llmChain: [...(insertSequence.llmChain as any[])]
    };
    this.promptSequences.set(id, sequence);
    return sequence;
  }

  async updatePromptSequence(id: string, updates: Partial<InsertPromptSequence>): Promise<PromptSequence> {
    const existing = this.promptSequences.get(id);
    if (!existing) throw new Error("Prompt sequence not found");
    
    const updated = { 
      ...existing, 
      ...updates,
      selectedFolders: updates.selectedFolders ? [...(updates.selectedFolders as string[])] : existing.selectedFolders,
      llmChain: updates.llmChain ? [...(updates.llmChain as any[])] : existing.llmChain
    };
    if (updates.status === 'completed') {
      updated.completedAt = new Date();
    }
    this.promptSequences.set(id, updated);
    return updated;
  }

  async getSequenceSteps(sequenceId: string): Promise<SequenceStep[]> {
    return Array.from(this.sequenceSteps.values())
      .filter(s => s.sequenceId === sequenceId)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }

  async createSequenceStep(insertStep: InsertSequenceStep): Promise<SequenceStep> {
    const id = randomUUID();
    const step: SequenceStep = { 
      id,
      providerId: insertStep.providerId,
      sequenceId: insertStep.sequenceId,
      stepNumber: insertStep.stepNumber,
      iterationNumber: insertStep.iterationNumber || 1,
      inputPrompt: insertStep.inputPrompt,
      status: insertStep.status || "pending",
      createdAt: new Date(),
      tokensUsed: insertStep.tokensUsed || null,
      cost: insertStep.cost || null,
      responseTime: insertStep.responseTime || null,
      artifacts: insertStep.artifacts ? [...(insertStep.artifacts as any[])] : null,
      outputContent: insertStep.outputContent || null,
      isSynthesis: insertStep.isSynthesis || false
    };
    this.sequenceSteps.set(id, step);
    return step;
  }

  async updateSequenceStep(id: string, updates: Partial<InsertSequenceStep>): Promise<SequenceStep> {
    const existing = this.sequenceSteps.get(id);
    if (!existing) throw new Error("Sequence step not found");
    
    const updated = { 
      ...existing, 
      ...updates,
      artifacts: updates.artifacts ? [...(updates.artifacts as any[])] : existing.artifacts
    };
    this.sequenceSteps.set(id, updated);
    return updated;
  }

  // Agent library methods - using database instead of memory
  async getAgentLibraries(includeArchived: boolean = false, includeTestAgents: boolean = true): Promise<AgentLibrary[]> {
    try {
      let whereConditions = [];
      
      if (!includeArchived) {
        whereConditions.push(eq(agentLibrary.isArchived, false));
      }
      
      // In production environment, exclude test agents by default
      if (!includeTestAgents || (process.env.NODE_ENV === 'production')) {
        whereConditions.push(eq(agentLibrary.isTestAgent, false));
      }
      
      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
      
      const agents = await db.select()
        .from(agentLibrary)
        .where(whereClause)
        .orderBy(sql`${agentLibrary.createdAt} DESC`);
      return agents;
    } catch (error) {
      console.error('Error fetching agent libraries:', error);
      return [];
    }
  }

  // Get only production agents (excludes test agents)
  async getProductionAgentLibraries(): Promise<AgentLibrary[]> {
    try {
      const agents = await db.select()
        .from(agentLibrary)
        .where(and(
          eq(agentLibrary.isArchived, false),
          eq(agentLibrary.isTestAgent, false),
          eq(agentLibrary.environment, 'production')
        ))
        .orderBy(sql`${agentLibrary.createdAt} DESC`);
      return agents;
    } catch (error) {
      console.error('Error fetching production agent libraries:', error);
      return [];
    }
  }

  async getAgentLibrary(id: string): Promise<AgentLibrary | undefined> {
    try {
      const [agent] = await db.select().from(agentLibrary).where(eq(agentLibrary.id, id));
      return agent || undefined;
    } catch (error) {
      console.error('Error fetching agent library:', error);
      return undefined;
    }
  }

  async createAgentLibrary(insertAgent: InsertAgentLibrary): Promise<AgentLibrary> {
    try {
      // Determine if this is a test agent based on patterns or explicit flag
      const namePattern = /^(test agent|dev agent|sample agent|placeholder|demo agent|untitled|default agent|technical analyst pro|creative strategist|people operations expert)$/i;
      const descriptionTestMarkers = insertAgent.description?.toLowerCase().includes('[test]') ||
                                   insertAgent.description?.toLowerCase().includes('[dev]') ||
                                   insertAgent.description?.toLowerCase().includes('[sample]') ||
                                   insertAgent.description?.toLowerCase().includes('placeholder');
      
      // Check if this is likely a development/test environment
      const isDevelopmentEnvironment = process.env.NODE_ENV === 'development' || 
                                     process.env.NODE_ENV === 'test' ||
                                     !process.env.NODE_ENV; // Default to development if not set
      
      const isAutoDetectedTestAgent = namePattern.test(insertAgent.name) || descriptionTestMarkers;
      
      // Determine final test agent status and environment
      const isTestAgent = (insertAgent as any).isTestAgent || isAutoDetectedTestAgent || isDevelopmentEnvironment;
      const environment = (insertAgent as any).environment || 
                         (isDevelopmentEnvironment ? 'development' : 'production');
      
      const agentData: any = {
        name: insertAgent.name,
        description: insertAgent.description || null,
        primaryPersonality: insertAgent.primaryPersonality || null,
        secondaryPersonality: insertAgent.secondaryPersonality || null,
        isDevilsAdvocate: insertAgent.isDevilsAdvocate || false,
        supplementalPrompt: insertAgent.supplementalPrompt || null,
        preferredProviderId: insertAgent.preferredProviderId || null,
        isArchived: false, // Don't auto-archive, use proper flagging instead
        isTestAgent: isTestAgent,
        environment: environment,
      };
      
      // Only set experience if provided, otherwise let database default kick in
      if (insertAgent.experience) {
        agentData.experience = insertAgent.experience;
      } else {
        // Explicitly set the default experience structure
        agentData.experience = {
          meetingsParticipated: 0,
          topicsExplored: [],
          keyInsights: [],
          collaborationHistory: []
        };
      }
      
      const [agent] = await db.insert(agentLibrary).values(agentData).returning();
      return agent;
    } catch (error) {
      console.error('Error creating agent library:', error);
      throw new Error("Failed to create agent");
    }
  }

  async updateAgentLibrary(id: string, updates: Partial<InsertAgentLibrary>): Promise<AgentLibrary> {
    try {
      const updateData: any = { ...updates };
      
      const [updated] = await db.update(agentLibrary)
        .set(updateData)
        .where(eq(agentLibrary.id, id))
        .returning();
      
      if (!updated) throw new Error("Agent library not found");
      return updated;
    } catch (error) {
      console.error('Error updating agent library:', error);
      throw new Error("Failed to update agent");
    }
  }

  async deleteAgentLibrary(id: string): Promise<void> {
    try {
      await db.delete(agentLibrary).where(eq(agentLibrary.id, id));
    } catch (error) {
      console.error('Error deleting agent library:', error);
      throw new Error("Failed to delete agent");
    }
  }

  async archiveAgentLibrary(id: string, archived: boolean = true): Promise<AgentLibrary> {
    try {
      const [updated] = await db.update(agentLibrary)
        .set({ isArchived: archived })
        .where(eq(agentLibrary.id, id))
        .returning();
      
      if (!updated) throw new Error("Agent library not found");
      return updated;
    } catch (error) {
      console.error('Error archiving agent library:', error);
      throw new Error("Failed to archive agent");
    }
  }

  async updateAgentExperience(
    agentId: string, 
    meetingId: string, 
    role: string, 
    contributions: string[], 
    insights: string[], 
    topics: string[]
  ): Promise<AgentLibrary> {
    try {
      const existing = await this.getAgentLibrary(agentId);
      if (!existing) throw new Error("Agent library not found");
      
      const currentExperience = existing.experience || {
        meetingsParticipated: 0,
        topicsExplored: [],
        keyInsights: [],
        collaborationHistory: []
      };

      // Update experience with proper array types  
      const topicsArray: string[] = Array.from(new Set([...currentExperience.topicsExplored, ...topics]));
      const insightsArray: string[] = Array.from(new Set([...currentExperience.keyInsights, ...insights]));
      
      const updatedExperience = {
        meetingsParticipated: currentExperience.meetingsParticipated + 1,
        topicsExplored: topicsArray,
        keyInsights: insightsArray,
        collaborationHistory: [
          ...currentExperience.collaborationHistory,
          {
            meetingId,
            role,
            keyContributions: contributions,
            timestamp: new Date().toISOString()
          }
        ]
      };

      return await this.updateAgentLibrary(agentId, { experience: updatedExperience });
    } catch (error) {
      console.error('Error updating agent experience:', error);
      throw new Error("Failed to update agent experience");
    }
  }

  // Agent Specialties methods
  async getSpecialties(): Promise<AgentSpecialty[]> {
    return Array.from(this.agentSpecialties.values()).filter(specialty => !specialty.isArchived);
  }

  async getSpecialty(id: string): Promise<AgentSpecialty | undefined> {
    return this.agentSpecialties.get(id);
  }

  async createSpecialty(specialty: InsertAgentSpecialty): Promise<AgentSpecialty> {
    const id = randomUUID();
    const newSpecialty: AgentSpecialty = {
      id,
      name: specialty.name,
      description: specialty.description || null,
      domain: specialty.domain,
      requiredKnowledge: specialty.requiredKnowledge || [],
      competencyLevels: specialty.competencyLevels || ["Beginner", "Intermediate", "Advanced", "Expert"],
      llmProviderId: specialty.llmProviderId || "openai-gpt5",
      isArchived: false,
      createdAt: new Date()
    };
    this.agentSpecialties.set(id, newSpecialty);
    return newSpecialty;
  }

  async updateSpecialty(id: string, updates: Partial<InsertAgentSpecialty>): Promise<AgentSpecialty> {
    const existing = this.agentSpecialties.get(id);
    if (!existing) {
      throw new Error("Specialty not found");
    }
    const updated = { ...existing, ...updates };
    this.agentSpecialties.set(id, updated);
    return updated;
  }

  async deleteSpecialty(id: string): Promise<void> {
    this.agentSpecialties.delete(id);
  }
}

export const storage = new MemStorage();
