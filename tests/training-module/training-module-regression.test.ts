/**
 * Training Module Regression Test Suite
 * 
 * This comprehensive test suite verifies that changes to the training module
 * do not adversely impact other elements of the application and that the
 * isolated training module functions correctly.
 */

import { TrainingModuleFactory } from '../../server/factories/TrainingModuleFactory';
import { ITrainingModule } from '../../server/interfaces/ITrainingModule';
import { AgentProviderAdapter } from '../../server/adapters/AgentProviderAdapter';
import { LLMProviderAdapter } from '../../server/adapters/LLMProviderAdapter';
import { KnowledgeStoreAdapter } from '../../server/adapters/KnowledgeStoreAdapter';
import { storage } from '../../server/storage';
import { createServer } from 'http';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../../server/routes';

describe('Training Module Regression Tests', () => {
  let app: express.Express;
  let server: any;
  let trainingModule: ITrainingModule;

  beforeAll(async () => {
    // Setup test environment
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
    
    // Initialize training module for isolated testing
    trainingModule = TrainingModuleFactory.createTrainingModule();
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    TrainingModuleFactory.resetInstance();
  });

  describe('Isolated Training Module Tests', () => {
    describe('Specialty Management', () => {
      it('should create specialties without external dependencies', async () => {
        const specialtyData = {
          name: 'Test Specialty',
          description: 'A test specialty for regression testing',
          domain: 'technical',
          requiredKnowledge: ['Basic concepts'],
          competencyLevels: ['Beginner', 'Intermediate', 'Advanced']
        };

        const specialty = await trainingModule.createSpecialty(specialtyData);
        
        expect(specialty.id).toBeDefined();
        expect(specialty.name).toBe(specialtyData.name);
        expect(specialty.domain).toBe(specialtyData.domain);
        expect(specialty.competencyLevels).toEqual(specialtyData.competencyLevels);
      });

      it('should retrieve all specialties', async () => {
        const specialties = await trainingModule.getSpecialties();
        expect(Array.isArray(specialties)).toBe(true);
      });

      it('should update specialties without affecting other data', async () => {
        // First create a specialty
        const original = await trainingModule.createSpecialty({
          name: 'Original Specialty',
          domain: 'technical',
          requiredKnowledge: ['Basic'],
          competencyLevels: ['Beginner']
        });

        // Update it
        const updated = await trainingModule.updateSpecialty(original.id, {
          description: 'Updated description',
          requiredKnowledge: ['Basic', 'Intermediate concepts']
        });

        expect(updated.description).toBe('Updated description');
        expect(updated.requiredKnowledge).toContain('Intermediate concepts');
        expect(updated.name).toBe('Original Specialty'); // Should remain unchanged
      });

      it('should delete specialties and clean up related data', async () => {
        const specialty = await trainingModule.createSpecialty({
          name: 'Deletable Specialty',
          domain: 'test',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        });

        await expect(trainingModule.deleteSpecialty(specialty.id)).resolves.not.toThrow();
        
        // Verify specialty is removed
        const specialties = await trainingModule.getSpecialties();
        expect(specialties.find(s => s.id === specialty.id)).toBeUndefined();
      });
    });

    describe('Training Session Management', () => {
      let testSpecialty: any;
      let testAgent: any;

      beforeEach(async () => {
        // Create test specialty
        testSpecialty = await trainingModule.createSpecialty({
          name: 'Session Test Specialty',
          domain: 'testing',
          requiredKnowledge: ['Testing fundamentals'],
          competencyLevels: ['Beginner', 'Intermediate', 'Advanced']
        });

        // Ensure we have at least one agent to test with
        const agents = await storage.getAgentLibraries();
        if (agents.length === 0) {
          testAgent = await storage.createAgentLibrary({
            name: 'Test Agent',
            description: 'Agent for testing',
            primaryPersonality: 'analytical',
            secondaryPersonality: 'methodical'
          });
        } else {
          testAgent = agents[0];
        }
      });

      it('should start training sessions with valid data', async () => {
        const sessionData = {
          agentId: testAgent.id,
          specialtyId: testSpecialty.id,
          targetCompetencyLevel: 'Intermediate',
          maxIterations: 5
        };

        const session = await trainingModule.startTrainingSession(sessionData);
        
        expect(session.id).toBeDefined();
        expect(session.agentId).toBe(testAgent.id);
        expect(session.specialtyId).toBe(testSpecialty.id);
        expect(session.status).toBe('in_progress');
        expect(session.currentCompetencyLevel).toBe('Beginner');
        expect(session.progress).toBe(0);
      });

      it('should reject training sessions with invalid agent ID', async () => {
        const sessionData = {
          agentId: 'non-existent-agent',
          specialtyId: testSpecialty.id,
          targetCompetencyLevel: 'Advanced'
        };

        await expect(trainingModule.startTrainingSession(sessionData))
          .rejects.toThrow('Agent non-existent-agent not found');
      });

      it('should reject training sessions with invalid specialty ID', async () => {
        const sessionData = {
          agentId: testAgent.id,
          specialtyId: 'non-existent-specialty',
          targetCompetencyLevel: 'Advanced'
        };

        await expect(trainingModule.startTrainingSession(sessionData))
          .rejects.toThrow('Specialty non-existent-specialty not found');
      });

      it('should retrieve training sessions by agent', async () => {
        // Start a session
        await trainingModule.startTrainingSession({
          agentId: testAgent.id,
          specialtyId: testSpecialty.id,
          targetCompetencyLevel: 'Advanced'
        });

        const sessions = await trainingModule.getAgentTrainingSessions(testAgent.id);
        expect(sessions.length).toBeGreaterThan(0);
        expect(sessions[0].agentId).toBe(testAgent.id);
      });

      it('should track training progress correctly', async () => {
        const session = await trainingModule.startTrainingSession({
          agentId: testAgent.id,
          specialtyId: testSpecialty.id,
          targetCompetencyLevel: 'Intermediate'
        });

        const progress = await trainingModule.getTrainingProgress(session.id);
        
        expect(progress.session).toBeDefined();
        expect(progress.session.id).toBe(session.id);
        expect(progress.nextSteps).toBeDefined();
        expect(Array.isArray(progress.nextSteps)).toBe(true);
      });
    });

    describe('Test Generation and Evaluation', () => {
      let testSession: any;

      beforeEach(async () => {
        // Create test data
        const specialty = await trainingModule.createSpecialty({
          name: 'Test Generation Specialty',
          domain: 'technical',
          requiredKnowledge: ['Programming basics'],
          competencyLevels: ['Beginner', 'Intermediate']
        });

        const agents = await storage.getAgentLibraries();
        const agent = agents[0] || await storage.createAgentLibrary({
          name: 'Test Agent',
          description: 'For testing',
          primaryPersonality: 'analytical'
        });

        testSession = await trainingModule.startTrainingSession({
          agentId: agent.id,
          specialtyId: specialty.id,
          targetCompetencyLevel: 'Intermediate'
        });
      });

      it('should generate tests for training sessions', async () => {
        const test = await trainingModule.generateTest(testSession.id, 'competency');
        
        expect(test.id).toBeDefined();
        expect(test.sessionId).toBe(testSession.id);
        expect(test.questions).toBeDefined();
        expect(Array.isArray(test.questions)).toBe(true);
        expect(test.passingScore).toBeGreaterThan(0);
      });

      it('should evaluate test attempts correctly', async () => {
        const test = await trainingModule.generateTest(testSession.id, 'knowledge');
        
        // Simulate test answers
        const answers = test.questions.map(q => ({
          questionId: q.id,
          answer: q.correctAnswer // Provide correct answers for testing
        }));

        const attempt = await trainingModule.submitTestAttempt(test.id, testSession.id, answers);
        
        expect(attempt.id).toBeDefined();
        expect(attempt.testId).toBe(test.id);
        expect(attempt.sessionId).toBe(testSession.id);
        expect(attempt.score).toBeGreaterThanOrEqual(0);
        expect(attempt.score).toBeLessThanOrEqual(100);
        expect(typeof attempt.passed).toBe('boolean');
      });

      it('should retrieve tests and attempts for sessions', async () => {
        // Generate a test and submit an attempt
        const test = await trainingModule.generateTest(testSession.id, 'application');
        await trainingModule.submitTestAttempt(test.id, testSession.id, [
          { questionId: test.questions[0].id, answer: 'test answer' }
        ]);

        const tests = await trainingModule.getTestsForSession(testSession.id);
        const attempts = await trainingModule.getTestAttemptsForSession(testSession.id);

        expect(tests.length).toBeGreaterThan(0);
        expect(attempts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Impact Tests', () => {
    describe('API Endpoint Compatibility', () => {
      it('should not break existing legacy training endpoints', async () => {
        // Test legacy specialty endpoint
        const response = await request(app)
          .get('/api/training/specialties')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should provide new isolated training endpoints', async () => {
        // Test new isolated specialty endpoint
        const response = await request(app)
          .get('/api/training-v2/specialties')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should handle errors gracefully in both APIs', async () => {
        // Test invalid endpoint
        await request(app)
          .get('/api/training-v2/sessions/invalid-session-id')
          .expect(404);
      });
    });

    describe('Database Integration', () => {
      it('should not affect other database operations', async () => {
        // Test that agent library operations still work
        const agents = await storage.getAgentLibraries();
        expect(Array.isArray(agents)).toBe(true);

        // Test that document operations still work
        const documents = await storage.getDocuments('general');
        expect(Array.isArray(documents)).toBe(true);

        // Test that provider operations still work
        const providers = await storage.getProviders();
        expect(Array.isArray(providers)).toBe(true);
      });

      it('should maintain data integrity with training operations', async () => {
        // Create agent through normal storage
        const agent = await storage.createAgentLibrary({
          name: 'Integration Test Agent',
          description: 'Testing integration',
          primaryPersonality: 'creative'
        });

        // Verify training module can access this agent
        const specialty = await trainingModule.createSpecialty({
          name: 'Integration Specialty',
          domain: 'integration',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        });

        // Should be able to start training with this agent
        const session = await trainingModule.startTrainingSession({
          agentId: agent.id,
          specialtyId: specialty.id,
          targetCompetencyLevel: 'Beginner'
        });

        expect(session.agentId).toBe(agent.id);
      });
    });

    describe('Memory and Performance Impact', () => {
      it('should not create memory leaks during training operations', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Perform multiple training operations
        for (let i = 0; i < 10; i++) {
          const specialty = await trainingModule.createSpecialty({
            name: `Memory Test Specialty ${i}`,
            domain: 'memory-test',
            requiredKnowledge: [],
            competencyLevels: ['Beginner']
          });
          
          await trainingModule.deleteSpecialty(specialty.id);
        }

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      });

      it('should handle concurrent training operations', async () => {
        const agents = await storage.getAgentLibraries();
        if (agents.length === 0) {
          // Skip if no agents available
          return;
        }

        const specialty = await trainingModule.createSpecialty({
          name: 'Concurrency Test Specialty',
          domain: 'concurrency',
          requiredKnowledge: [],
          competencyLevels: ['Beginner', 'Advanced']
        });

        // Start multiple sessions concurrently
        const sessionPromises = agents.slice(0, 3).map(agent =>
          trainingModule.startTrainingSession({
            agentId: agent.id,
            specialtyId: specialty.id,
            targetCompetencyLevel: 'Advanced'
          })
        );

        const sessions = await Promise.all(sessionPromises);
        
        expect(sessions.length).toBe(Math.min(3, agents.length));
        sessions.forEach(session => {
          expect(session.id).toBeDefined();
          expect(session.status).toBe('in_progress');
        });
      });
    });

    describe('Event System Impact', () => {
      it('should emit events without disrupting other systems', async () => {
        const events: any[] = [];
        
        // Mock event handler to capture events
        const mockHandler = {
          handleEvent: jest.fn().mockImplementation(async (event) => {
            events.push(event);
          })
        };

        // Create a new training module with our mock handler
        const testModule = new (await import('../../server/services/TrainingModule')).TrainingModule({
          llmProvider: new LLMProviderAdapter(process.env.OPENAI_API_KEY || 'test-key'),
          agentProvider: new AgentProviderAdapter(),
          knowledgeStore: new KnowledgeStoreAdapter(),
          eventHandlers: [mockHandler],
          defaultMaxIterations: 5,
          testGenerationTimeout: 10000,
          competencyThresholds: { 'Beginner': 70 }
        });

        const specialty = await testModule.createSpecialty({
          name: 'Event Test Specialty',
          domain: 'events',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        });

        const agents = await storage.getAgentLibraries();
        if (agents.length > 0) {
          const session = await testModule.startTrainingSession({
            agentId: agents[0].id,
            specialtyId: specialty.id,
            targetCompetencyLevel: 'Beginner'
          });

          // Should have emitted session_started event
          expect(mockHandler.handleEvent).toHaveBeenCalled();
          expect(events.length).toBeGreaterThan(0);
          expect(events[0].type).toBe('session_started');
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid LLM responses gracefully', async () => {
      // This test ensures the training module degrades gracefully
      // when external LLM services are unavailable or return invalid data
      
      const specialty = await trainingModule.createSpecialty({
        name: 'Error Handling Specialty',
        domain: 'error-testing',
        requiredKnowledge: [],
        competencyLevels: ['Beginner']
      });

      const agents = await storage.getAgentLibraries();
      if (agents.length === 0) return;

      const session = await trainingModule.startTrainingSession({
        agentId: agents[0].id,
        specialtyId: specialty.id,
        targetCompetencyLevel: 'Beginner'
      });

      // Generate test should handle LLM failures gracefully
      const test = await trainingModule.generateTest(session.id, 'knowledge');
      expect(test.questions.length).toBeGreaterThan(0);
    });

    it('should validate input data properly', async () => {
      // Test with invalid specialty data
      await expect(trainingModule.createSpecialty({
        name: '',
        domain: '',
        requiredKnowledge: [],
        competencyLevels: []
      })).rejects.toThrow();

      // Test with invalid session data
      await expect(trainingModule.startTrainingSession({
        agentId: '',
        specialtyId: '',
        targetCompetencyLevel: ''
      })).rejects.toThrow();
    });

    it('should handle resource cleanup on failures', async () => {
      // Ensure that failed operations don't leave orphaned data
      const initialSpecialties = await trainingModule.getSpecialties();
      const initialCount = initialSpecialties.length;

      try {
        // Attempt operation that should fail
        await trainingModule.startTrainingSession({
          agentId: 'invalid-agent',
          specialtyId: 'invalid-specialty',
          targetCompetencyLevel: 'Invalid'
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify no orphaned data was created
      const finalSpecialties = await trainingModule.getSpecialties();
      expect(finalSpecialties.length).toBe(initialCount);
    });
  });
});

describe('Training Module Factory Tests', () => {
  afterEach(() => {
    TrainingModuleFactory.resetInstance();
  });

  it('should create singleton training module instance', () => {
    const instance1 = TrainingModuleFactory.createTrainingModule();
    const instance2 = TrainingModuleFactory.createTrainingModule();
    
    expect(instance1).toBe(instance2);
  });

  it('should reset instance when requested', () => {
    const instance1 = TrainingModuleFactory.createTrainingModule();
    TrainingModuleFactory.resetInstance();
    const instance2 = TrainingModuleFactory.createTrainingModule();
    
    expect(instance1).not.toBe(instance2);
  });

  it('should require OpenAI API key', () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    expect(() => TrainingModuleFactory.createTrainingModule())
      .toThrow('OPENAI_API_KEY environment variable is required');

    process.env.OPENAI_API_KEY = originalKey;
  });
});