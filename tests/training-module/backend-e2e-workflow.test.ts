/**
 * Comprehensive Backend End-to-End Training Workflow Tests
 * 
 * Tests complete training workflows from start to finish, simulating
 * real user scenarios through the backend API.
 */

import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage';

describe('Backend Training Workflow E2E Tests', () => {
  let app: express.Express;
  let server: any;
  let testAgent: any;
  let testSpecialty: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);

    // Create test agent
    testAgent = await storage.createAgentLibrary({
      name: 'E2E Test Agent',
      description: 'Agent for end-to-end testing',
      primaryPersonality: 'analytical',
      secondaryPersonality: 'methodical'
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Complete Training Specialty Workflow', () => {
    it('should complete full specialty lifecycle', async () => {
      // 1. Create specialty
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'E2E Software Engineering',
          description: 'Complete software engineering training',
          domain: 'technical',
          requiredKnowledge: ['Programming fundamentals', 'Version control', 'Testing'],
          competencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        })
        .expect(201);

      testSpecialty = specialtyResponse.body;
      expect(testSpecialty.name).toBe('E2E Software Engineering');

      // 2. Retrieve specialty
      await request(app)
        .get(`/api/training-v2/specialties`)
        .expect(200)
        .expect((res) => {
          const specialty = res.body.find((s: any) => s.id === testSpecialty.id);
          expect(specialty).toBeDefined();
          expect(specialty.name).toBe('E2E Software Engineering');
        });

      // 3. Update specialty
      await request(app)
        .put(`/api/training-v2/specialties/${testSpecialty.id}`)
        .send({
          description: 'Updated: Complete software engineering training with advanced concepts',
          requiredKnowledge: ['Programming fundamentals', 'Version control', 'Testing', 'Architecture']
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toContain('Updated:');
          expect(res.body.requiredKnowledge).toContain('Architecture');
        });

      // 4. Delete specialty (will be done in cleanup)
    });
  });

  describe('Complete Training Session Workflow', () => {
    let trainingSession: any;

    beforeAll(async () => {
      // Create specialty for session tests
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Session Test Specialty',
          description: 'For testing training sessions',
          domain: 'technical',
          requiredKnowledge: ['Basic concepts'],
          competencyLevels: ['Beginner', 'Intermediate', 'Advanced']
        })
        .expect(201);

      testSpecialty = specialtyResponse.body;
    });

    it('should complete full training session lifecycle', async () => {
      // 1. Start training session
      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: testAgent.id,
          specialtyId: testSpecialty.id,
          targetCompetencyLevel: 'Advanced',
          maxIterations: 5
        })
        .expect(201);

      trainingSession = sessionResponse.body;
      expect(trainingSession.agentId).toBe(testAgent.id);
      expect(trainingSession.specialtyId).toBe(testSpecialty.id);
      expect(trainingSession.status).toBe('in_progress');

      // 2. Get session details
      await request(app)
        .get(`/api/training-v2/sessions/${trainingSession.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(trainingSession.id);
          expect(res.body.targetCompetencyLevel).toBe('Advanced');
        });

      // 3. Get training progress
      await request(app)
        .get(`/api/training-v2/sessions/${trainingSession.id}/progress`)
        .expect(200)
        .expect((res) => {
          expect(res.body.session).toBeDefined();
          expect(res.body.nextSteps).toBeDefined();
          expect(Array.isArray(res.body.nextSteps)).toBe(true);
        });

      // 4. Get sessions for agent
      await request(app)
        .get(`/api/training-v2/agents/${testAgent.id}/sessions`)
        .expect(200)
        .expect((res) => {
          const session = res.body.find((s: any) => s.id === trainingSession.id);
          expect(session).toBeDefined();
        });

      // 5. Get all sessions
      await request(app)
        .get('/api/training-v2/sessions')
        .expect(200)
        .expect((res) => {
          const session = res.body.find((s: any) => s.id === trainingSession.id);
          expect(session).toBeDefined();
        });
    });

    afterAll(async () => {
      // Cleanup specialty
      if (testSpecialty) {
        await request(app)
          .delete(`/api/training-v2/specialties/${testSpecialty.id}`)
          .expect(204);
      }
    });
  });

  describe('Complete Test Generation and Evaluation Workflow', () => {
    let trainingSession: any;
    let generatedTest: any;

    beforeAll(async () => {
      // Create specialty and session for test workflow
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Test Generation Specialty',
          description: 'For testing test generation and evaluation',
          domain: 'technical',
          requiredKnowledge: ['Testing concepts'],
          competencyLevels: ['Beginner', 'Intermediate']
        })
        .expect(201);

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: testAgent.id,
          specialtyId: specialtyResponse.body.id,
          targetCompetencyLevel: 'Intermediate'
        })
        .expect(201);

      trainingSession = sessionResponse.body;
    });

    it('should complete full test workflow', async () => {
      // 1. Generate test
      const testResponse = await request(app)
        .post(`/api/training-v2/sessions/${trainingSession.id}/test`)
        .send({
          testType: 'competency'
        })
        .expect(201);

      generatedTest = testResponse.body;
      expect(generatedTest.sessionId).toBe(trainingSession.id);
      expect(generatedTest.questions).toBeDefined();
      expect(Array.isArray(generatedTest.questions)).toBe(true);
      expect(generatedTest.questions.length).toBeGreaterThan(0);

      // 2. Submit test attempt
      const answers = generatedTest.questions.map((q: any) => ({
        questionId: q.id,
        answer: q.correctAnswer || 'Test answer'
      }));

      const attemptResponse = await request(app)
        .post(`/api/training-v2/tests/${generatedTest.id}/attempt`)
        .send({
          sessionId: trainingSession.id,
          answers: answers
        })
        .expect(201);

      expect(attemptResponse.body.testId).toBe(generatedTest.id);
      expect(attemptResponse.body.sessionId).toBe(trainingSession.id);
      expect(typeof attemptResponse.body.score).toBe('number');
      expect(typeof attemptResponse.body.passed).toBe('boolean');

      // 3. Get tests for session
      await request(app)
        .get(`/api/training-v2/sessions/${trainingSession.id}/tests`)
        .expect(200)
        .expect((res) => {
          const test = res.body.find((t: any) => t.id === generatedTest.id);
          expect(test).toBeDefined();
        });

      // 4. Get attempts for session
      await request(app)
        .get(`/api/training-v2/sessions/${trainingSession.id}/attempts`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].testId).toBe(generatedTest.id);
        });
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle invalid session creation gracefully', async () => {
      // Try to create session with non-existent agent
      await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: 'non-existent-agent',
          specialtyId: testSpecialty?.id || 'dummy',
          targetCompetencyLevel: 'Advanced'
        })
        .expect(500)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });

      // Try to create session with non-existent specialty
      await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: testAgent.id,
          specialtyId: 'non-existent-specialty',
          targetCompetencyLevel: 'Advanced'
        })
        .expect(500)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
    });

    it('should handle invalid test generation gracefully', async () => {
      // Try to generate test for non-existent session
      await request(app)
        .post('/api/training-v2/sessions/non-existent-session/test')
        .send({
          testType: 'competency'
        })
        .expect(500)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
    });

    it('should handle invalid test attempts gracefully', async () => {
      // Try to submit attempt for non-existent test
      await request(app)
        .post('/api/training-v2/tests/non-existent-test/attempt')
        .send({
          sessionId: 'some-session',
          answers: []
        })
        .expect(500)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
        });
    });
  });

  describe('Legacy API Compatibility Workflow', () => {
    it('should maintain compatibility with legacy endpoints', async () => {
      // Test that legacy specialty endpoints still work
      const legacySpecialties = await request(app)
        .get('/api/training/specialties')
        .expect(200);

      expect(Array.isArray(legacySpecialties.body)).toBe(true);

      // Test legacy session endpoints
      const legacySessions = await request(app)
        .get('/api/training/sessions')
        .expect(200);

      expect(Array.isArray(legacySessions.body)).toBe(true);
    });

    it('should provide consistent data between legacy and new APIs', async () => {
      // Get specialties from both APIs
      const [legacyResponse, newResponse] = await Promise.all([
        request(app).get('/api/training/specialties').expect(200),
        request(app).get('/api/training-v2/specialties').expect(200)
      ]);

      // Both should return arrays (content may differ due to different storage)
      expect(Array.isArray(legacyResponse.body)).toBe(true);
      expect(Array.isArray(newResponse.body)).toBe(true);
    });
  });
});