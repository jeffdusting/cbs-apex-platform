/**
 * Simplified backend API test to verify structure
 */

/// <reference types="jest" />

import { TestEnvironment } from '../utils/test-database';

describe('Backend API Structure Test', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setupStandardTestData();
  });

  afterEach(() => {
    testEnv.reset();
  });

  describe('Storage Interface', () => {
    it('should have test storage with providers', async () => {
      const storage = testEnv.getStorage();
      const providers = await storage.getProviders();
      
      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
      
      const gptProvider = providers.find(p => p.id === 'openai-gpt5');
      expect(gptProvider).toBeDefined();
      expect(gptProvider?.name).toBe('GPT-5');
    });

    it('should create and retrieve prompt sequences', async () => {
      const storage = testEnv.getStorage();
      
      const sequenceData = {
        name: 'Test Meeting',
        taskObjective: 'Test analysis',
        initialPrompt: 'Analyze this test case',
        llmChain: [
          {
            step: 1,
            providerId: 'openai-gpt5',
            primaryPersonality: 'Analytical'
          }
        ],
        iterations: 1
      };

      const sequence = await storage.createPromptSequence(sequenceData);
      expect(sequence.id).toBeDefined();
      expect(sequence.name).toBe('Test Meeting');

      const retrieved = await storage.getPromptSequence(sequence.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Meeting');
    });

    it('should handle agent library operations', async () => {
      const storage = testEnv.getStorage();
      
      const agentData = {
        name: 'Test Analyst',
        description: 'Test agent for analysis',
        primaryPersonality: 'Analytical',
        preferredProviderId: 'openai-gpt5'
      };

      const agent = await storage.createAgentLibrary(agentData);
      expect(agent.id).toBeDefined();
      expect(agent.name).toBe('Test Analyst');

      const agents = await storage.getAgentLibraries();
      expect(agents.length).toBeGreaterThan(0);
      
      const foundAgent = agents.find(a => a.id === agent.id);
      expect(foundAgent).toBeDefined();
    });
  });

  describe('Mock LLM Providers', () => {
    it('should generate mock responses', async () => {
      const mockProvider = testEnv.getMockProvider('openai-gpt5');
      expect(mockProvider).toBeDefined();

      const response = await mockProvider!.generateResponse('Test prompt');
      expect(response.content).toContain('Mock response from openai-gpt5');
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.responseTime).toBeGreaterThan(0);
    });
  });
});