/**
 * Test Database Setup and Mock Storage Implementation
 */

import { IStorage } from '../../server/storage';
import { TestProvider, TestFolder, TestAgentLibrary, TestPromptSequence, TestSequenceStep } from './test-factories';

/**
 * In-memory test storage implementation
 */
export class TestStorage implements Partial<IStorage> {
  private providers: TestProvider[] = [];
  private folders: TestFolder[] = [];
  private agents: TestAgentLibrary[] = [];
  private sequences: TestPromptSequence[] = [];
  private steps: TestSequenceStep[] = [];
  private prompts: any[] = [];
  private responses: any[] = [];
  private documents: any[] = [];
  private batchTests: any[] = [];
  private batchResults: any[] = [];

  // Provider methods
  async getProviders(): Promise<TestProvider[]> {
    return [...this.providers];
  }

  async getProvider(id: string): Promise<TestProvider | undefined> {
    return this.providers.find(p => p.id === id);
  }

  async updateProviderUsage(providerId: string, cost: number): Promise<void> {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      // Update quota usage
      const currentUsage = parseFloat(provider.quotaUsed || '0');
      provider.quotaUsed = (currentUsage + cost).toString();
    }
  }

  // Folder methods
  async getFolders(): Promise<TestFolder[]> {
    return [...this.folders];
  }

  async createFolder(folderData: any): Promise<TestFolder> {
    const folder: TestFolder = {
      id: `folder-${Date.now()}`,
      ...folderData
    };
    this.folders.push(folder);
    return folder;
  }

  // Document methods
  async getFolderDocuments(folderId: string): Promise<any[]> {
    return this.documents.filter(doc => doc.folderId === folderId);
  }

  async createDocument(documentData: any): Promise<any> {
    const document = {
      id: `doc-${Date.now()}`,
      createdAt: new Date(),
      ...documentData
    };
    this.documents.push(document);
    return document;
  }

  // Agent Library methods
  async getAgentLibraries(): Promise<TestAgentLibrary[]> {
    return [...this.agents];
  }

  async getAgentLibrary(id: string): Promise<TestAgentLibrary | undefined> {
    return this.agents.find(a => a.id === id);
  }

  async createAgentLibrary(agentData: any): Promise<TestAgentLibrary> {
    const agent: TestAgentLibrary = {
      id: `agent-${Date.now()}`,
      createdAt: new Date(),
      experience: null,
      isDevilsAdvocate: false,
      ...agentData
    };
    this.agents.push(agent);
    return agent;
  }

  async updateAgentLibrary(id: string, updates: any): Promise<TestAgentLibrary> {
    const agentIndex = this.agents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error('Agent not found');
    }
    this.agents[agentIndex] = { ...this.agents[agentIndex], ...updates };
    return this.agents[agentIndex];
  }

  async deleteAgentLibrary(id: string): Promise<void> {
    const agentIndex = this.agents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error('Agent not found');
    }
    this.agents.splice(agentIndex, 1);
  }

  async updateAgentExperience(
    id: string,
    meetingId: string,
    role: string,
    contributions: string[],
    insights: string[],
    topics: string[]
  ): Promise<TestAgentLibrary> {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.experience) {
      agent.experience = { history: [] };
    }

    if (!agent.experience.history) {
      agent.experience.history = [];
    }

    agent.experience.history.push({
      meetingId,
      role,
      contributions,
      insights,
      topics,
      timestamp: new Date()
    });

    return agent;
  }

  // Prompt Sequence methods
  async getPromptSequences(): Promise<TestPromptSequence[]> {
    return [...this.sequences];
  }

  async getPromptSequence(id: string): Promise<TestPromptSequence | undefined> {
    return this.sequences.find(s => s.id === id);
  }

  async createPromptSequence(sequenceData: any): Promise<TestPromptSequence> {
    const sequence: TestPromptSequence = {
      id: `sequence-${Date.now()}`,
      createdAt: new Date(),
      completedAt: null,
      selectedFolders: [],
      synthesisProviderId: null,
      totalCost: null,
      status: 'pending',
      ...sequenceData
    };
    this.sequences.push(sequence);
    return sequence;
  }

  async updatePromptSequence(id: string, updates: any): Promise<TestPromptSequence> {
    const sequenceIndex = this.sequences.findIndex(s => s.id === id);
    if (sequenceIndex === -1) {
      throw new Error('Sequence not found');
    }
    this.sequences[sequenceIndex] = { ...this.sequences[sequenceIndex], ...updates };
    return this.sequences[sequenceIndex];
  }

  // Sequence Step methods
  async getSequenceSteps(sequenceId: string): Promise<TestSequenceStep[]> {
    return this.steps.filter(step => step.sequenceId === sequenceId);
  }

  async createSequenceStep(stepData: any): Promise<TestSequenceStep> {
    const step: TestSequenceStep = {
      id: `step-${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
      iterationNumber: 1,
      outputContent: null,
      tokensUsed: null,
      cost: null,
      responseTime: null,
      artifacts: [],
      isSynthesis: false,
      ...stepData
    };
    this.steps.push(step);
    return step;
  }

  async updateSequenceStep(id: string, updates: any): Promise<TestSequenceStep> {
    const stepIndex = this.steps.findIndex(s => s.id === id);
    if (stepIndex === -1) {
      throw new Error('Step not found');
    }
    this.steps[stepIndex] = { ...this.steps[stepIndex], ...updates };
    return this.steps[stepIndex];
  }

  // Prompt methods
  async createPrompt(promptData: any): Promise<any> {
    const prompt = {
      id: `prompt-${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
      ...promptData
    };
    this.prompts.push(prompt);
    return prompt;
  }

  async getPromptResponses(promptId: string): Promise<any[]> {
    return this.responses.filter(response => response.promptId === promptId);
  }

  async createResponse(responseData: any): Promise<any> {
    const response = {
      id: `response-${Date.now()}`,
      createdAt: new Date(),
      ...responseData
    };
    this.responses.push(response);
    return response;
  }

  // Batch Test methods
  async getBatchTests(): Promise<any[]> {
    return [...this.batchTests];
  }

  async getBatchTest(id: string): Promise<any | null> {
    return this.batchTests.find(bt => bt.id === id) || null;
  }

  async createBatchTest(batchData: any): Promise<any> {
    const batchTest = {
      id: `batch-${Date.now()}`,
      createdAt: new Date(),
      status: 'pending',
      ...batchData
    };
    this.batchTests.push(batchTest);
    return batchTest;
  }

  async updateBatchTest(id: string, updates: any): Promise<any> {
    const batchIndex = this.batchTests.findIndex(bt => bt.id === id);
    if (batchIndex === -1) {
      throw new Error('Batch test not found');
    }
    this.batchTests[batchIndex] = { ...this.batchTests[batchIndex], ...updates };
    return this.batchTests[batchIndex];
  }

  async getBatchResults(batchTestId: string): Promise<any[]> {
    return this.batchResults.filter(result => result.batchTestId === batchTestId);
  }

  async createBatchResult(resultData: any): Promise<any> {
    const result = {
      id: `result-${Date.now()}`,
      createdAt: new Date(),
      ...resultData
    };
    this.batchResults.push(result);
    return result;
  }

  // Utility methods for testing
  seedProviders(providers: TestProvider[]): void {
    this.providers = [...providers];
  }

  seedFolders(folders: TestFolder[]): void {
    this.folders = [...folders];
  }

  seedAgents(agents: TestAgentLibrary[]): void {
    this.agents = [...agents];
  }

  seedSequences(sequences: TestPromptSequence[]): void {
    this.sequences = [...sequences];
  }

  seedSteps(steps: TestSequenceStep[]): void {
    this.steps = [...steps];
  }

  seedDocuments(documents: any[]): void {
    this.documents = [...documents];
  }

  clearAll(): void {
    this.providers = [];
    this.folders = [];
    this.agents = [];
    this.sequences = [];
    this.steps = [];
    this.prompts = [];
    this.responses = [];
    this.documents = [];
    this.batchTests = [];
    this.batchResults = [];
  }

  // Get current state for testing
  getState() {
    return {
      providers: [...this.providers],
      folders: [...this.folders],
      agents: [...this.agents],
      sequences: [...this.sequences],
      steps: [...this.steps],
      prompts: [...this.prompts],
      responses: [...this.responses],
      documents: [...this.documents],
      batchTests: [...this.batchTests],
      batchResults: [...this.batchResults]
    };
  }
}

/**
 * Mock LLM Provider for testing
 */
export class MockLLMProvider {
  constructor(
    private providerId: string,
    private model: string,
    private apiKey: string
  ) {}

  async generateResponse(prompt: string): Promise<{
    content: string;
    tokensUsed: number;
    cost: number;
    responseTime: number;
    artifacts?: any[];
  }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    const baseTokens = Math.floor(prompt.length / 4); // Rough token estimation
    const responseTokens = Math.floor(Math.random() * 200) + 50;
    const totalTokens = baseTokens + responseTokens;

    return {
      content: `Mock response from ${this.providerId} for prompt: "${prompt.substring(0, 50)}..."`,
      tokensUsed: totalTokens,
      cost: totalTokens * 0.00003, // Mock cost calculation
      responseTime: Math.floor(Math.random() * 2000) + 500,
      artifacts: Math.random() > 0.7 ? [
        {
          name: 'mock-artifact',
          type: 'code',
          language: 'javascript',
          content: '// Mock generated code\nconsole.log("Hello from mock!");'
        }
      ] : []
    };
  }
}

/**
 * Test environment configuration
 */
export class TestEnvironment {
  private storage: TestStorage;
  private mockProviders: Map<string, MockLLMProvider>;

  constructor() {
    this.storage = new TestStorage();
    this.mockProviders = new Map();
  }

  getStorage(): TestStorage {
    return this.storage;
  }

  addMockProvider(providerId: string, model: string, apiKey: string = 'mock-key'): void {
    this.mockProviders.set(providerId, new MockLLMProvider(providerId, model, apiKey));
  }

  getMockProvider(providerId: string): MockLLMProvider | undefined {
    return this.mockProviders.get(providerId);
  }

  async setupStandardTestData(): Promise<void> {
    // Seed with standard test data
    const { ProviderFactory, FolderFactory, AgentFactory, MeetingFactory, StepFactory } = 
      await import('./test-factories');

    this.storage.seedProviders(ProviderFactory.createMultiple(3));
    this.storage.seedFolders(FolderFactory.createMultiple(2));
    this.storage.seedAgents(AgentFactory.createMultiple(3));

    const meeting = MeetingFactory.createStrategyMeeting();
    this.storage.seedSequences([meeting]);
    this.storage.seedSteps(StepFactory.createMultiple(meeting.id, 3));

    // Add mock providers
    this.addMockProvider('openai-gpt5', 'gpt-5');
    this.addMockProvider('anthropic-claude', 'claude-sonnet-4');
    this.addMockProvider('google-gemini', 'gemini-2.5-pro');
  }

  reset(): void {
    this.storage.clearAll();
    this.mockProviders.clear();
  }
}

// Global test environment instance
let globalTestEnv: TestEnvironment | null = null;

export function getTestEnvironment(): TestEnvironment {
  if (!globalTestEnv) {
    globalTestEnv = new TestEnvironment();
  }
  return globalTestEnv;
}

export function resetTestEnvironment(): void {
  if (globalTestEnv) {
    globalTestEnv.reset();
  }
}