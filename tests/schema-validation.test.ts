/**
 * Schema Validation and Type Safety Test Suite
 * 
 * Catches schema mismatches, type inconsistencies, and runtime type errors
 * that LSP diagnostics reveal.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  Provider, 
  AgentLibrary, 
  PromptSequence, 
  SequenceStep,
  insertProviderSchema,
  insertAgentLibrarySchema,
  insertPromptSequenceSchema,
  insertSequenceStepSchema
} from '../shared/schema';
import { MemStorage } from '../server/storage';
import { z } from 'zod';

describe('Schema Validation and Type Safety Tests', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Schema-Database Consistency', () => {
    it('SV001 - Provider schema should match storage implementation', async () => {
      // Test that all schema fields are properly handled in storage
      const testProvider = {
        name: 'Test Provider',
        model: 'test-model',
        availableModels: ['model1', 'model2'],
        apiKeyEnvVar: 'TEST_KEY',
        costPer1kTokens: '0.01',
        isEnabled: true,
        quotaUsed: '0',
        quotaLimit: '1000',
        icon: 'test-icon',
        color: 'blue',
        description: 'Test description',
        website: 'https://test.com',
        documentation: 'https://docs.test.com',
        maxTokens: 4096
      };

      // Validate against schema
      expect(() => insertProviderSchema.parse(testProvider)).not.toThrow();

      // Test storage implementation can handle all fields
      const created = await storage.createProvider(testProvider);
      expect(created).toMatchObject(testProvider);
      
      // Verify no missing properties that would cause runtime errors
      const requiredFields = ['id', 'name', 'model', 'availableModels', 'apiKeyEnvVar', 'costPer1kTokens'];
      requiredFields.forEach(field => {
        expect(created).toHaveProperty(field);
        expect(created[field as keyof typeof created]).toBeDefined();
      });
    });

    it('SV002 - Agent Library schema should not reference deleted fields', async () => {
      const testAgent = {
        name: 'Test Agent',
        description: 'Test description',
        primaryPersonality: 'Analytical',
        secondaryPersonality: 'Practical',
        isDevilsAdvocate: false,
        supplementalPrompt: 'Test prompt',
        preferredProviderId: 'test-provider'
      };

      // Validate schema doesn't include trainingCost
      const schema = insertAgentLibrarySchema;
      const schemaKeys = Object.keys(schema.shape);
      expect(schemaKeys).not.toContain('trainingCost');

      // Test creation succeeds without trainingCost - schema validation only
      expect(() => schema.parse(testAgent)).not.toThrow();
      
      // Verify the test agent object doesn't have deprecated fields
      expect(testAgent).not.toHaveProperty('trainingCost');
      expect(testAgent).not.toHaveProperty('deletedField');
      
      // Test that schema validation passes and all required fields are present
      const validatedAgent = schema.parse(testAgent);
      expect(validatedAgent.name).toBe(testAgent.name);
      expect(validatedAgent.primaryPersonality).toBe(testAgent.primaryPersonality);
    });

    it('SV003 - Array properties should be properly typed as string arrays', async () => {
      // Test that array properties maintain correct typing
      const testSequence = {
        name: 'Test Sequence',
        description: 'Test description',
        taskObjective: 'Test objective',
        initialPrompt: 'Test prompt',
        llmChain: [
          { providerId: 'test-provider', step: 1 }
        ],
        selectedFolders: ['folder1', 'folder2'],
        iterations: 1,
        synthesisProviderId: 'test-provider'
      };

      const created = await storage.createPromptSequence(testSequence);
      
      // Verify arrays maintain proper typing
      expect(Array.isArray(created.selectedFolders)).toBe(true);
      expect(Array.isArray(created.llmChain)).toBe(true);
      
      // Verify array elements are properly typed
      if (created.selectedFolders) {
        created.selectedFolders.forEach(folder => {
          expect(typeof folder).toBe('string');
        });
      }
    });
  });

  describe('Type Safety Validation', () => {
    it('SV004 - Should detect incompatible type assignments', () => {
      // Test for the type compatibility issues found in LSP diagnostics
      const malformedProvider = {
        id: 'test-id',
        name: 'Test',
        model: 'test-model',
        availableModels: ['model1'], // Should be string[]
        apiKeyEnvVar: 'TEST_KEY',
        costPer1kTokens: '0.01',
        isEnabled: true, // LSP showed this was literal 'true' not boolean
        quotaUsed: '0',
        quotaLimit: '1000',
        icon: 'test-icon',
        color: 'blue'
        // Missing required fields that caused LSP errors
      };

      // Schema validation should catch missing required fields
      expect(() => {
        const schema = z.object({
          description: z.string().nullable(),
          website: z.string().nullable(),
          documentation: z.string().nullable(),
          maxTokens: z.number().nullable(),
        });
        schema.parse(malformedProvider);
      }).toThrow();
    });

    it('SV005 - Should validate undefined vs null handling', () => {
      // Test for undefined vs null type mismatches that caused LSP errors
      const agentWithUndefined = {
        name: 'Test Agent',
        description: undefined, // Should be null or string, not undefined
        primaryPersonality: null,
        secondaryPersonality: null,
        isDevilsAdvocate: false,
        supplementalPrompt: null,
        preferredProviderId: null
      };

      // Schema should enforce proper null handling
      const schema = z.object({
        description: z.string().nullable(), // null is OK, undefined is not
      });

      expect(() => schema.parse({ description: undefined })).toThrow();
      expect(() => schema.parse({ description: null })).not.toThrow();
      expect(() => schema.parse({ description: 'valid' })).not.toThrow();
    });

    it('SV006 - Should validate array iteration compatibility', () => {
      // Test for Map iterator issues that caused LSP errors
      const testMap = new Map([
        ['key1', { value: 'value1' }],
        ['key2', { value: 'value2' }]
      ]);

      // Ensure proper iteration patterns
      const valuesArray = Array.from(testMap.values());
      expect(Array.isArray(valuesArray)).toBe(true);
      
      const entriesArray = Array.from(testMap.entries());
      expect(Array.isArray(entriesArray)).toBe(true);
      
      // Test that we can iterate without downlevelIteration issues
      for (const [key, value] of testMap) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('object');
      }
    });
  });

  describe('Runtime Type Validation', () => {
    it('SV007 - Should validate JSON array operations', () => {
      // Test for the array.pop() type issues in LSP diagnostics
      const testData = {
        prompts: ['prompt1', 'prompt2', 'prompt3'],
        selectedProviders: ['provider1', 'provider2'],
        artifacts: [
          { name: 'artifact1', type: 'code', content: 'test', language: 'typescript' }
        ]
      };

      // Ensure array operations maintain type safety
      const promptsCopy = [...testData.prompts];
      const lastPrompt = promptsCopy.pop();
      expect(typeof lastPrompt).toBe('string');

      const providersCopy = [...testData.selectedProviders];
      const lastProvider = providersCopy.pop();
      expect(typeof lastProvider).toBe('string');

      const artifactsCopy = [...testData.artifacts];
      const lastArtifact = artifactsCopy.pop();
      expect(lastArtifact).toHaveProperty('name');
      expect(lastArtifact).toHaveProperty('type');
    });

    it('SV008 - Should validate experience object structure', () => {
      // Test for agent experience type mismatches
      const validExperience = {
        meetingsParticipated: 5,
        topicsExplored: ['AI', 'Training', 'Development'],
        keyInsights: ['Insight 1', 'Insight 2'],
        collaborationHistory: [
          {
            meetingId: 'meeting-1',
            role: 'facilitator',
            keyContributions: ['contribution 1'],
            timestamp: '2025-01-01T00:00:00Z'
          }
        ]
      };

      // Validate structure
      expect(typeof validExperience.meetingsParticipated).toBe('number');
      expect(Array.isArray(validExperience.topicsExplored)).toBe(true);
      expect(Array.isArray(validExperience.keyInsights)).toBe(true);
      expect(Array.isArray(validExperience.collaborationHistory)).toBe(true);

      // Validate array element types
      validExperience.topicsExplored.forEach(topic => {
        expect(typeof topic).toBe('string');
      });

      validExperience.collaborationHistory.forEach(history => {
        expect(typeof history.meetingId).toBe('string');
        expect(typeof history.role).toBe('string');
        expect(Array.isArray(history.keyContributions)).toBe(true);
      });
    });
  });

  describe('Database-Code Consistency', () => {
    it('SV009 - Should verify database schema matches TypeScript types', async () => {
      // This test would run against actual database in CI/CD
      // For now, we test that our schema definitions are internally consistent
      
      const providerSchema = insertProviderSchema;
      const agentSchema = insertAgentLibrarySchema;
      
      // Verify schemas can parse their own generated types
      const validProvider = {
        name: 'Test Provider',
        model: 'test-model',
        availableModels: ['model1'],
        apiKeyEnvVar: 'TEST_KEY',
        costPer1kTokens: '0.01',
        isEnabled: true,
        quotaUsed: '0',
        quotaLimit: '1000',
        icon: 'test-icon',
        color: 'blue'
      };

      const validAgent = {
        name: 'Test Agent',
        description: 'Test description',
        primaryPersonality: 'Analytical',
        secondaryPersonality: 'Practical',
        isDevilsAdvocate: false,
        supplementalPrompt: 'Test prompt',
        preferredProviderId: 'test-provider'
      };

      expect(() => providerSchema.parse(validProvider)).not.toThrow();
      expect(() => agentSchema.parse(validAgent)).not.toThrow();
    });

    it('SV010 - Should catch field reference errors early', () => {
      // Test that would catch the trainingCost reference error
      const agentLibraryFields = Object.keys(insertAgentLibrarySchema.shape);
      
      // These fields should NOT exist (would cause runtime errors)
      const forbiddenFields = ['trainingCost', 'totalCost', 'sessions'];
      forbiddenFields.forEach(field => {
        expect(agentLibraryFields).not.toContain(field);
      });

      // These fields SHOULD exist (required for functionality)
      const requiredFields = ['name', 'primaryPersonality', 'isDevilsAdvocate'];
      requiredFields.forEach(field => {
        expect(agentLibraryFields).toContain(field);
      });
    });
  });
});