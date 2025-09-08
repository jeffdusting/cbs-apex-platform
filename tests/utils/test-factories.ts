/**
 * Test Factories and Utilities for Consistent Test Data
 */

import { Provider, Folder, AgentLibrary, PromptSequence, SequenceStep } from '../../shared/schema';

export interface TestProvider extends Provider {
  id: string;
  name: string;
  model: string;
  availableModels: string[];
  apiKeyEnvVar: string;
  costPer1kTokens: string;
  isEnabled: boolean;
  quotaUsed: string;
  quotaLimit: string;
  icon: string;
  color: string;
  description: string | null;
  website: string | null;
  documentation: string | null;
  maxTokens: number | null;
  supportedFeatures: {
    streaming: boolean;
    functionCalling: boolean;
    imageAnalysis: boolean;
    codeGeneration: boolean;
    multiModal: boolean;
  } | null;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    tokensPerDay: number;
  } | null;
  lastUpdated: Date | null;
  createdAt: Date | null;
}

export interface TestFolder extends Folder {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date | null;
}

export interface TestAgentLibrary extends AgentLibrary {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date | null;
  primaryPersonality: string | null;
  secondaryPersonality: string | null;
  isDevilsAdvocate: boolean;
  supplementalPrompt: string | null;
  preferredProviderId: string | null;
  experience: any | null;
}

export interface TestPromptSequence extends PromptSequence {
  id: string;
  name: string;
  description: string | null;
  taskObjective: string;
  initialPrompt: string;
  llmChain: any[];
  selectedFolders: string[] | null;
  iterations: number;
  synthesisProviderId: string | null;
  status: string;
  totalCost: string | null;
  createdAt: Date | null;
  completedAt: Date | null;
}

export interface TestSequenceStep extends SequenceStep {
  id: string;
  createdAt: Date | null;
  status: string;
  sequenceId: string;
  iterationNumber: number;
  stepNumber: number;
  providerId: string;
  inputPrompt: string;
  outputContent: string | null;
  tokensUsed: number | null;
  cost: string | null;
  responseTime: number | null;
  artifacts: any[] | null;
  isSynthesis: boolean;
}

/**
 * Factory for creating test providers
 */
export class ProviderFactory {
  static create(overrides: Partial<TestProvider> = {}): TestProvider {
    const defaults: TestProvider = {
      id: 'test-provider-1',
      name: 'Test Provider',
      model: 'test-model-1',
      availableModels: ['test-model-1'],
      apiKeyEnvVar: 'TEST_API_KEY',
      costPer1kTokens: '0.01',
      isEnabled: true,
      quotaUsed: '0',
      quotaLimit: '1000',
      icon: 'fas fa-brain',
      color: 'blue',
      description: 'Test Provider Description',
      website: 'https://test-provider.com',
      documentation: 'https://docs.test-provider.com',
      maxTokens: 4096,
      supportedFeatures: {
        streaming: true,
        functionCalling: false,
        imageAnalysis: false,
        codeGeneration: true,
        multiModal: false
      },
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 10000,
        tokensPerDay: 100000
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    };

    return { ...defaults, ...overrides };
  }

  static createOpenAI(overrides: Partial<TestProvider> = {}): TestProvider {
    return this.create({
      id: 'openai-gpt5',
      name: 'GPT-5',
      model: 'gpt-5',
      availableModels: ['gpt-5'],
      apiKeyEnvVar: 'OPENAI_API_KEY',
      costPer1kTokens: '0.01',
      icon: 'fas fa-brain',
      color: 'blue',
      ...overrides
    });
  }

  static createClaude(overrides: Partial<TestProvider> = {}): TestProvider {
    return this.create({
      id: 'anthropic-claude',
      name: 'Claude',
      model: 'claude-sonnet-4',
      availableModels: ['claude-sonnet-4'],
      apiKeyEnvVar: 'ANTHROPIC_API_KEY',
      costPer1kTokens: '0.008',
      icon: 'fas fa-robot',
      color: 'orange',
      ...overrides
    });
  }

  static createGemini(overrides: Partial<TestProvider> = {}): TestProvider {
    return this.create({
      id: 'google-gemini',
      name: 'Gemini',
      model: 'gemini-2.5-pro',
      availableModels: ['gemini-2.5-pro'],
      apiKeyEnvVar: 'GEMINI_API_KEY',
      costPer1kTokens: '0.005',
      icon: 'fas fa-gem',
      color: 'purple',
      ...overrides
    });
  }

  static createMultiple(count: number = 3): TestProvider[] {
    return [
      this.createOpenAI(),
      this.createClaude(),
      this.createGemini()
    ].slice(0, count);
  }
}

/**
 * Factory for creating test folders
 */
export class FolderFactory {
  static create(overrides: Partial<TestFolder> = {}): TestFolder {
    const defaults: TestFolder = {
      id: 'test-folder-1',
      name: 'Test Folder',
      description: 'Test folder description',
      createdAt: new Date()
    };

    return { ...defaults, ...overrides };
  }

  static createGeneral(overrides: Partial<TestFolder> = {}): TestFolder {
    return this.create({
      id: 'general',
      name: 'General',
      description: 'General documents',
      ...overrides
    });
  }

  static createResearch(overrides: Partial<TestFolder> = {}): TestFolder {
    return this.create({
      id: 'research',
      name: 'Research',
      description: 'Research documents',
      ...overrides
    });
  }

  static createMultiple(count: number = 2): TestFolder[] {
    return [
      this.createGeneral(),
      this.createResearch()
    ].slice(0, count);
  }
}

/**
 * Factory for creating test agents
 */
export class AgentFactory {
  static create(overrides: Partial<TestAgentLibrary> = {}): TestAgentLibrary {
    const defaults: TestAgentLibrary = {
      id: 'test-agent-1',
      name: 'Test Agent',
      description: 'Test agent description',
      createdAt: new Date(),
      primaryPersonality: 'Analytical',
      secondaryPersonality: 'Experimental',
      isDevilsAdvocate: false,
      supplementalPrompt: 'Focus on analytical thinking',
      preferredProviderId: 'openai-gpt5',
      experience: null
    };

    return { ...defaults, ...overrides };
  }

  static createAnalyst(overrides: Partial<TestAgentLibrary> = {}): TestAgentLibrary {
    return this.create({
      id: 'agent-analyst',
      name: 'Data Analyst',
      description: 'Specialized in data analysis and insights',
      primaryPersonality: 'Analytical',
      secondaryPersonality: 'Experimental',
      supplementalPrompt: 'Focus on data-driven insights and statistical analysis',
      preferredProviderId: 'openai-gpt5',
      ...overrides
    });
  }

  static createStrategist(overrides: Partial<TestAgentLibrary> = {}): TestAgentLibrary {
    return this.create({
      id: 'agent-strategist',
      name: 'Strategic Thinker',
      description: 'Focused on long-term strategy and planning',
      primaryPersonality: 'Strategic',
      secondaryPersonality: 'Organizing',
      supplementalPrompt: 'Consider long-term implications and strategic positioning',
      preferredProviderId: 'anthropic-claude',
      ...overrides
    });
  }

  static createAdvocate(overrides: Partial<TestAgentLibrary> = {}): TestAgentLibrary {
    return this.create({
      id: 'agent-advocate',
      name: 'Devils Advocate',
      description: 'Challenges assumptions and provides alternative perspectives',
      primaryPersonality: 'Relational',
      secondaryPersonality: 'Experimental',
      isDevilsAdvocate: true,
      supplementalPrompt: 'Challenge assumptions and provide contrarian viewpoints',
      preferredProviderId: 'google-gemini',
      ...overrides
    });
  }

  static createMultiple(count: number = 3): TestAgentLibrary[] {
    return [
      this.createAnalyst(),
      this.createStrategist(),
      this.createAdvocate()
    ].slice(0, count);
  }
}

/**
 * Factory for creating test meetings/sequences
 */
export class MeetingFactory {
  static create(overrides: Partial<TestPromptSequence> = {}): TestPromptSequence {
    const defaults: TestPromptSequence = {
      id: 'test-meeting-1',
      name: 'Test Meeting',
      description: 'Test meeting description',
      taskObjective: 'Analyze test data and provide insights',
      initialPrompt: 'Please analyze the following scenario',
      llmChain: [
        {
          step: 1,
          providerId: 'openai-gpt5',
          primaryPersonality: 'Analytical',
          secondaryPersonality: 'Experimental',
          supplementalPrompt: 'Focus on technical analysis'
        }
      ],
      selectedFolders: [],
      iterations: 1,
      synthesisProviderId: null,
      status: 'pending',
      totalCost: '0.00',
      createdAt: new Date(),
      completedAt: null
    };

    return { ...defaults, ...overrides };
  }

  static createStrategyMeeting(overrides: Partial<TestPromptSequence> = {}): TestPromptSequence {
    return this.create({
      id: 'strategy-meeting-1',
      name: 'Strategic Analysis Meeting',
      description: 'Multi-agent strategic analysis session',
      taskObjective: 'Analyze market opportunities and strategic positioning',
      initialPrompt: 'Analyze the current market landscape for AI technologies',
      llmChain: [
        {
          step: 1,
          providerId: 'openai-gpt5',
          primaryPersonality: 'Analytical',
          secondaryPersonality: 'Experimental',
          supplementalPrompt: 'Focus on technical innovation and market data'
        },
        {
          step: 2,
          providerId: 'anthropic-claude',
          primaryPersonality: 'Strategic',
          secondaryPersonality: 'Organizing',
          supplementalPrompt: 'Consider long-term strategic implications'
        },
        {
          step: 3,
          providerId: 'google-gemini',
          primaryPersonality: 'Relational',
          secondaryPersonality: 'Experimental',
          isDevilsAdvocate: true,
          supplementalPrompt: 'Challenge assumptions and provide alternative perspectives'
        }
      ],
      iterations: 2,
      ...overrides
    });
  }

  static createCompleted(overrides: Partial<TestPromptSequence> = {}): TestPromptSequence {
    return this.create({
      status: 'completed',
      completedAt: new Date(),
      totalCost: '0.045',
      ...overrides
    });
  }
}

/**
 * Factory for creating test sequence steps
 */
export class StepFactory {
  static create(overrides: Partial<TestSequenceStep> = {}): TestSequenceStep {
    const defaults: TestSequenceStep = {
      id: 'test-step-1',
      createdAt: new Date(),
      status: 'completed',
      sequenceId: 'test-meeting-1',
      iterationNumber: 1,
      stepNumber: 1,
      providerId: 'openai-gpt5',
      inputPrompt: 'Test input prompt',
      outputContent: 'Test response content',
      tokensUsed: 50,
      cost: '0.0015',
      responseTime: 1500,
      artifacts: [],
      isSynthesis: false
    };

    return { ...defaults, ...overrides };
  }

  static createSynthesis(overrides: Partial<TestSequenceStep> = {}): TestSequenceStep {
    return this.create({
      id: 'test-synthesis-step',
      stepNumber: 99,
      providerId: 'google-gemini',
      inputPrompt: '',
      outputContent: 'Synthesis of all agent responses',
      tokensUsed: 150,
      cost: '0.0045',
      responseTime: 2500,
      isSynthesis: true,
      ...overrides
    });
  }

  static createMultiple(sequenceId: string, count: number = 3): TestSequenceStep[] {
    const steps: TestSequenceStep[] = [];
    const providers = ['openai-gpt5', 'anthropic-claude', 'google-gemini'];

    for (let i = 0; i < count; i++) {
      steps.push(this.create({
        id: `step-${sequenceId}-${i + 1}`,
        sequenceId,
        stepNumber: i + 1,
        providerId: providers[i % providers.length],
        inputPrompt: `Input prompt for step ${i + 1}`,
        outputContent: `Response content for step ${i + 1}`,
        tokensUsed: 50 + (i * 10),
        cost: (0.0015 + (i * 0.0005)).toString(),
        responseTime: 1500 + (i * 200)
      }));
    }

    return steps;
  }
}

/**
 * Test data collections for comprehensive testing
 */
export class TestDataCollections {
  static getCompleteWorkflow() {
    const providers = ProviderFactory.createMultiple(3);
    const folders = FolderFactory.createMultiple(2);
    const agents = AgentFactory.createMultiple(3);
    const meeting = MeetingFactory.createStrategyMeeting();
    const steps = StepFactory.createMultiple(meeting.id, 3);
    const synthesis = StepFactory.createSynthesis({ sequenceId: meeting.id });

    return {
      providers,
      folders,
      agents,
      meeting,
      steps: [...steps, synthesis]
    };
  }

  static getPromptWorkflow() {
    const providers = ProviderFactory.createMultiple(2);
    const folders = FolderFactory.createMultiple(2);

    return {
      providers,
      folders,
      promptId: 'test-prompt-123',
      responses: [
        {
          id: 'response-1',
          promptId: 'test-prompt-123',
          providerId: providers[0].id,
          content: 'Response from first provider',
          tokensUsed: 45,
          cost: '0.00135',
          responseTime: 1250,
          artifacts: []
        },
        {
          id: 'response-2',
          promptId: 'test-prompt-123',
          providerId: providers[1].id,
          content: 'Response from second provider',
          tokensUsed: 52,
          cost: '0.00156',
          responseTime: 980,
          artifacts: [
            {
              name: 'analysis-script',
              type: 'code',
              language: 'python',
              content: 'print("Hello, World!")'
            }
          ]
        }
      ]
    };
  }
}

/**
 * Mock utilities for testing
 */
export class MockUtils {
  static createMockFetch(responses: Record<string, any>) {
    return jest.fn().mockImplementation((url: string) => {
      const response = responses[url];
      if (!response) {
        throw new Error(`No mock response for ${url}`);
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        blob: () => Promise.resolve(new Blob()),
        status: 200
      });
    });
  }

  static createMockWebSocket() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
  }

  static createMockLocalStorage() {
    const store: Record<string, string> = {};

    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      })
    };
  }
}

/**
 * Test environment setup utilities
 */
export class TestSetup {
  static setupDOMEnvironment() {
    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: jest.fn(),
      writable: true
    });

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined)
      },
      writable: true
    });

    // Mock URL constructor
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: jest.fn(() => 'mock-blob-url'),
        revokeObjectURL: jest.fn()
      },
      writable: true
    });
  }

  static cleanupAfterTest() {
    jest.clearAllMocks();
    localStorage.clear();
  }
}