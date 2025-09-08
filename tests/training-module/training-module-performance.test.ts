/**
 * Training Module Performance Regression Tests
 * 
 * These tests verify that the training module maintains acceptable
 * performance characteristics and doesn't degrade system performance.
 */

import { TrainingModuleFactory } from '../../server/factories/TrainingModuleFactory';
import { ITrainingModule } from '../../server/interfaces/ITrainingModule';
import { storage } from '../../server/storage';

describe('Training Module Performance Tests', () => {
  let trainingModule: ITrainingModule;
  let testAgents: any[] = [];
  let testSpecialties: any[] = [];

  type PerformanceResult = {
    load: number;
    duration: number;
    avgPerOperation: number;
  };

  beforeAll(async () => {
    trainingModule = TrainingModuleFactory.createTrainingModule();
    
    // Create test agents if none exist
    const existingAgents = await storage.getAgentLibraries();
    if (existingAgents.length < 3) {
      for (let i = 0; i < 3; i++) {
        const agent = await storage.createAgentLibrary({
          name: `Performance Test Agent ${i}`,
          description: `Agent for performance testing ${i}`,
          primaryPersonality: 'analytical',
          secondaryPersonality: 'methodical'
        });
        testAgents.push(agent);
      }
    } else {
      testAgents = existingAgents.slice(0, 3);
    }

    // Create test specialties
    for (let i = 0; i < 5; i++) {
      const specialty = await trainingModule.createSpecialty({
        name: `Performance Specialty ${i}`,
        description: `Testing specialty ${i}`,
        domain: 'performance',
        requiredKnowledge: ['Basic concepts', 'Testing'],
        competencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      });
      testSpecialties.push(specialty);
    }
  });

  afterAll(async () => {
    // Cleanup test data
    for (const specialty of testSpecialties) {
      try {
        await trainingModule.deleteSpecialty(specialty.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    TrainingModuleFactory.resetInstance();
  });

  describe('Specialty Operations Performance', () => {
    it('should create specialties within acceptable time limits', async () => {
      const start = Date.now();
      
      const specialty = await trainingModule.createSpecialty({
        name: 'Performance Test Specialty',
        domain: 'performance',
        requiredKnowledge: ['Performance testing'],
        competencyLevels: ['Beginner', 'Advanced']
      });
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(specialty.id).toBeDefined();
      
      // Cleanup
      await trainingModule.deleteSpecialty(specialty.id);
    });

    it('should retrieve all specialties efficiently', async () => {
      const start = Date.now();
      
      const specialties = await trainingModule.getSpecialties();
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(Array.isArray(specialties)).toBe(true);
    });

    it('should handle bulk specialty operations efficiently', async () => {
      const start = Date.now();
      const specialtiesToCreate = 10;
      const createdSpecialties: any[] = [];
      
      // Create multiple specialties
      for (let i = 0; i < specialtiesToCreate; i++) {
        const specialty = await trainingModule.createSpecialty({
          name: `Bulk Test Specialty ${i}`,
          domain: 'bulk-test',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        });
        createdSpecialties.push(specialty);
      }
      
      const createDuration = Date.now() - start;
      
      // Cleanup
      const cleanupStart = Date.now();
      for (const specialty of createdSpecialties) {
        await trainingModule.deleteSpecialty(specialty.id);
      }
      const cleanupDuration = Date.now() - cleanupStart;
      
      // Performance assertions
      expect(createDuration).toBeLessThan(5000); // 10 creations within 5 seconds
      expect(cleanupDuration).toBeLessThan(3000); // 10 deletions within 3 seconds
      expect(createDuration / specialtiesToCreate).toBeLessThan(500); // Average 500ms per creation
    });
  });

  describe('Session Management Performance', () => {
    it('should start training sessions efficiently', async () => {
      const start = Date.now();
      
      const session = await trainingModule.startTrainingSession({
        agentId: testAgents[0].id,
        specialtyId: testSpecialties[0].id,
        targetCompetencyLevel: 'Intermediate',
        maxIterations: 3
      });
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(session.id).toBeDefined();
    });

    it('should handle concurrent session creation', async () => {
      const start = Date.now();
      const concurrentSessions = 5;
      
      const sessionPromises: Promise<any>[] = [];
      for (let i = 0; i < concurrentSessions; i++) {
        const promise = trainingModule.startTrainingSession({
          agentId: testAgents[i % testAgents.length].id,
          specialtyId: testSpecialties[i % testSpecialties.length].id,
          targetCompetencyLevel: 'Advanced',
          maxIterations: 2
        });
        sessionPromises.push(promise);
      }
      
      const sessions = await Promise.all(sessionPromises);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(10000); // All sessions within 10 seconds
      expect(sessions.length).toBe(concurrentSessions);
      sessions.forEach(session => {
        expect(session.id).toBeDefined();
        expect(session.status).toBe('in_progress');
      });
    });

    it('should retrieve session progress quickly', async () => {
      // Create a session first
      const session = await trainingModule.startTrainingSession({
        agentId: testAgents[0].id,
        specialtyId: testSpecialties[0].id,
        targetCompetencyLevel: 'Beginner'
      });

      const start = Date.now();
      
      const progress = await trainingModule.getTrainingProgress(session.id);
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(progress.session.id).toBe(session.id);
    });

    it('should handle large numbers of sessions efficiently', async () => {
      const start = Date.now();
      const sessionCount = 20;
      const createdSessions: any[] = [];
      
      // Create many sessions
      for (let i = 0; i < sessionCount; i++) {
        const session = await trainingModule.startTrainingSession({
          agentId: testAgents[i % testAgents.length].id,
          specialtyId: testSpecialties[i % testSpecialties.length].id,
          targetCompetencyLevel: 'Beginner',
          maxIterations: 1
        });
        createdSessions.push(session);
      }
      
      // Retrieve all sessions
      const allSessions = await trainingModule.getAllTrainingSessions();
      
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
      expect(allSessions.length).toBeGreaterThanOrEqual(sessionCount);
    });
  });

  describe('Test Generation Performance', () => {
    let performanceSession: any;

    beforeAll(async () => {
      performanceSession = await trainingModule.startTrainingSession({
        agentId: testAgents[0].id,
        specialtyId: testSpecialties[0].id,
        targetCompetencyLevel: 'Intermediate'
      });
    });

    it('should generate tests within reasonable time', async () => {
      const start = Date.now();
      
      const test = await trainingModule.generateTest(performanceSession.id, 'competency');
      
      const duration = Date.now() - start;
      
      // Test generation may take longer due to LLM API calls
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(test.questions.length).toBeGreaterThan(0);
    });

    it('should evaluate test attempts quickly', async () => {
      // Generate a test first
      const test = await trainingModule.generateTest(performanceSession.id, 'knowledge');
      
      const answers = test.questions.map(q => ({
        questionId: q.id,
        answer: q.correctAnswer
      }));

      const start = Date.now();
      
      const attempt = await trainingModule.submitTestAttempt(test.id, performanceSession.id, answers);
      
      const duration = Date.now() - start;
      
      // Test evaluation may involve LLM API calls
      expect(duration).toBeLessThan(20000); // Should complete within 20 seconds
      expect(attempt.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple test generations concurrently', async () => {
      const start = Date.now();
      const testCount = 3;
      
      const testPromises: Promise<any>[] = [];
      for (let i = 0; i < testCount; i++) {
        const promise = trainingModule.generateTest(performanceSession.id, 'application');
        testPromises.push(promise);
      }
      
      const tests = await Promise.all(testPromises);
      const duration = Date.now() - start;
      
      // Multiple concurrent LLM calls may take longer
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
      expect(tests.length).toBe(testCount);
      tests.forEach(test => {
        expect(test.questions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory Usage and Resource Management', () => {
    it('should maintain stable memory usage during extended operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform many operations
      for (let i = 0; i < 50; i++) {
        const specialty = await trainingModule.createSpecialty({
          name: `Memory Test ${i}`,
          domain: 'memory',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        });

        const session = await trainingModule.startTrainingSession({
          agentId: testAgents[0].id,
          specialtyId: specialty.id,
          targetCompetencyLevel: 'Beginner'
        });

        const progress = await trainingModule.getTrainingProgress(session.id);
        
        // Cleanup immediately
        await trainingModule.deleteSpecialty(specialty.id);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should clean up resources properly', async () => {
      const initialSpecialties = await trainingModule.getSpecialties();
      const initialCount = initialSpecialties.length;
      
      // Create and delete resources
      const specialty = await trainingModule.createSpecialty({
        name: 'Cleanup Test Specialty',
        domain: 'cleanup',
        requiredKnowledge: [],
        competencyLevels: ['Beginner']
      });

      const session = await trainingModule.startTrainingSession({
        agentId: testAgents[0].id,
        specialtyId: specialty.id,
        targetCompetencyLevel: 'Beginner'
      });

      const test = await trainingModule.generateTest(session.id, 'cleanup');
      
      // Delete specialty (should clean up related data)
      await trainingModule.deleteSpecialty(specialty.id);
      
      // Verify cleanup
      const finalSpecialties = await trainingModule.getSpecialties();
      expect(finalSpecialties.length).toBe(initialCount);
      
      // Verify session and test are cleaned up
      const sessionTests = await trainingModule.getTestsForSession(session.id);
      expect(sessionTests.length).toBe(0);
    });
  });

  describe('Scalability Tests', () => {
    it('should handle increasing loads gracefully', async () => {
      const loads = [1, 5, 10, 20];
      const results: PerformanceResult[] = [];
      
      for (const load of loads) {
        const start = Date.now();
        
        const promises: Promise<any>[] = [];
        for (let i = 0; i < load; i++) {
          const promise = trainingModule.startTrainingSession({
            agentId: testAgents[i % testAgents.length].id,
            specialtyId: testSpecialties[i % testSpecialties.length].id,
            targetCompetencyLevel: 'Beginner',
            maxIterations: 1
          });
          promises.push(promise);
        }
        
        await Promise.all(promises);
        const duration = Date.now() - start;
        
        results.push({ load, duration, avgPerOperation: duration / load });
      }
      
      // Verify performance doesn't degrade exponentially
      for (let i = 1; i < results.length; i++) {
        const current = results[i];
        const previous = results[i - 1];
        
        // Average time per operation shouldn't increase dramatically
        const performanceRatio = current.avgPerOperation / previous.avgPerOperation;
        expect(performanceRatio).toBeLessThan(3); // No more than 3x slower
      }
    });
  });
});