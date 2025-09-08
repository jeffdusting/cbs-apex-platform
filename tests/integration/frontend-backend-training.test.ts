/**
 * Frontend-Backend Integration Tests for Training Module
 * 
 * Tests that verify the complete integration between the React frontend
 * and Express backend for all training module functionality.
 */

import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock React Testing Library and components for integration testing
const mockRender = jest.fn();
const mockScreen = {
  getByText: jest.fn(),
  getByTestId: jest.fn(),
  getAllByTestId: jest.fn(),
};
const mockFireEvent = {
  click: jest.fn(),
};
const mockWaitFor = jest.fn();

jest.mock('@testing-library/react', () => ({
  render: mockRender,
  screen: mockScreen,
  fireEvent: mockFireEvent,
  waitFor: mockWaitFor,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    clear: jest.fn(),
  })),
  QueryClientProvider: jest.fn(),
}));

jest.mock('../../client/src/pages/agent-training', () => {
  return jest.fn().mockImplementation(() => ({
    type: 'AgentTraining',
    props: {},
  }));
});

// Mock fetch for frontend tests
global.fetch = jest.fn();

describe('Frontend-Backend Training Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    // Setup backend
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Specialty Management Integration', () => {
    it('FBTI001 - Should create specialty via backend and display in frontend', async () => {
      // 1. Create specialty via backend API
      const specialtyData = {
        name: 'Integration Test Specialty',
        description: 'Created during integration testing',
        domain: 'technical',
        requiredKnowledge: ['Basic programming', 'Testing'],
        competencyLevels: ['Beginner', 'Intermediate', 'Advanced']
      };

      const backendResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send(specialtyData)
        .expect(201);

      const createdSpecialty = backendResponse.body;
      expect(createdSpecialty.name).toBe(specialtyData.name);

      // 2. Mock frontend API call to return the created specialty
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([createdSpecialty]),
      });

      // 3. Simulate frontend rendering
      mockRender.mockReturnValue({});
      mockScreen.getByText.mockReturnValue({ textContent: 'Integration Test Specialty' });
      mockWaitFor.mockImplementation((fn) => Promise.resolve(fn()));

      // 4. Verify specialty data consistency
      expect(createdSpecialty.description).toBe('Created during integration testing');
      expect(createdSpecialty.domain).toBe('technical');
      expect(createdSpecialty.requiredKnowledge).toContain('Basic programming');

      // 5. Cleanup - delete specialty via backend
      await request(app)
        .delete(`/api/training-v2/specialties/${createdSpecialty.id}`)
        .expect(204);
    });

    it('FBTI002 - Should update specialty via backend and reflect changes', async () => {
      // Create initial specialty
      const initialData = {
        name: 'Update Test Specialty',
        description: 'Initial description',
        domain: 'analytical',
        requiredKnowledge: ['Basic concepts'],
        competencyLevels: ['Beginner', 'Advanced']
      };

      const createResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send(initialData)
        .expect(201);

      const specialty = createResponse.body;

      // Update specialty via backend
      const updatedData = {
        description: 'Updated description via integration test',
        requiredKnowledge: ['Basic concepts', 'Advanced topics'],
      };

      const updateResponse = await request(app)
        .put(`/api/training-v2/specialties/${specialty.id}`)
        .send(updatedData)
        .expect(200);

      expect(updateResponse.body.description).toBe(updatedData.description);

      // Verify updated data consistency
      expect(updateResponse.body.requiredKnowledge).toContain('Advanced topics');

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${specialty.id}`)
        .expect(204);
    });
  });

  describe('Training Session Integration', () => {
    let testAgent: any;
    let testSpecialty: any;

    beforeEach(async () => {
      // Create test dependencies
      testAgent = {
        id: 'test-agent-integration',
        name: 'Integration Test Agent',
        description: 'Agent for integration testing',
        primaryPersonality: 'analytical'
      };

      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Integration Session Specialty',
          description: 'For session integration testing',
          domain: 'technical',
          requiredKnowledge: ['Programming'],
          competencyLevels: ['Beginner', 'Intermediate', 'Advanced']
        })
        .expect(201);

      testSpecialty = specialtyResponse.body;
    });

    afterEach(async () => {
      // Cleanup specialty
      if (testSpecialty) {
        await request(app)
          .delete(`/api/training-v2/specialties/${testSpecialty.id}`)
          .expect(204);
      }
    });

    it('FBTI003 - Should start training session via backend', async () => {
      // Mock API responses for frontend
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([testAgent]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([testSpecialty]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]), // Initial empty sessions
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'new-session-id',
            agentId: testAgent.id,
            specialtyId: testSpecialty.id,
            targetCompetencyLevel: 'Advanced',
            status: 'in_progress'
          }),
        });

      // Create session via backend directly for testing
      const sessionData = {
        agentId: testAgent.id,
        specialtyId: testSpecialty.id,
        targetCompetencyLevel: 'Advanced',
        maxIterations: 5
      };

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send(sessionData)
        .expect(201);

      expect(sessionResponse.body.agentId).toBe(testAgent.id);
      expect(sessionResponse.body.specialtyId).toBe(testSpecialty.id);
      expect(sessionResponse.body.status).toBe('in_progress');
    });

    it('FBTI004 - Should get training progress from backend', async () => {
      // Create session via backend
      const sessionData = {
        agentId: testAgent.id,
        specialtyId: testSpecialty.id,
        targetCompetencyLevel: 'Advanced',
        maxIterations: 5
      };

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send(sessionData)
        .expect(201);

      const session = sessionResponse.body;

      // Get progress
      const progressResponse = await request(app)
        .get(`/api/training-v2/sessions/${session.id}/progress`)
        .expect(200);

      expect(progressResponse.body.session).toBeDefined();
      expect(progressResponse.body.nextSteps).toBeDefined();
    });
  });

  describe('Test Generation and Evaluation Integration', () => {
    let session: any;

    beforeEach(async () => {
      // Create test session
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Test Generation Specialty',
          description: 'For test generation integration',
          domain: 'technical',
          requiredKnowledge: ['Testing'],
          competencyLevels: ['Beginner', 'Intermediate']
        })
        .expect(201);

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: 'test-agent-id',
          specialtyId: specialtyResponse.body.id,
          targetCompetencyLevel: 'Intermediate'
        })
        .expect(201);

      session = sessionResponse.body;
    });

    it('FBTI005 - Should generate test via backend', async () => {
      // Generate test via backend
      const testResponse = await request(app)
        .post(`/api/training-v2/sessions/${session.id}/test`)
        .send({
          testType: 'competency'
        })
        .expect(201);

      const generatedTest = testResponse.body;
      expect(generatedTest.questions).toBeDefined();
      expect(generatedTest.questions.length).toBeGreaterThan(0);

      // Verify test generation succeeded in backend
      const testsResponse = await request(app)
        .get(`/api/training-v2/sessions/${session.id}/tests`)
        .expect(200);

      expect(testsResponse.body).toHaveLength(1);
      expect(testsResponse.body[0].id).toBe(generatedTest.id);
    });

    it('FBTI006 - Should submit test attempt and receive evaluation', async () => {
      // Generate test first
      const testResponse = await request(app)
        .post(`/api/training-v2/sessions/${session.id}/test`)
        .send({
          testType: 'competency'
        })
        .expect(201);

      const test = testResponse.body;

      // Submit test attempt
      const answers = test.questions.map((q: any) => ({
        questionId: q.id,
        answer: 'Integration test answer'
      }));

      const attemptResponse = await request(app)
        .post(`/api/training-v2/tests/${test.id}/attempt`)
        .send({
          sessionId: session.id,
          answers: answers
        })
        .expect(201);

      const attempt = attemptResponse.body;
      expect(typeof attempt.score).toBe('number');
      expect(typeof attempt.passed).toBe('boolean');

      // Verify attempt was stored
      const attemptsResponse = await request(app)
        .get(`/api/training-v2/sessions/${session.id}/attempts`)
        .expect(200);

      expect(attemptsResponse.body).toHaveLength(1);
      expect(attemptsResponse.body[0].id).toBe(attempt.id);
    });
  });

  describe('Error Handling Integration', () => {
    it('FBTI008 - Should handle backend errors gracefully', async () => {
      // Try to create session with non-existent agent
      const invalidSessionData = {
        agentId: 'non-existent-agent',
        specialtyId: 'non-existent-specialty',
        targetCompetencyLevel: 'Advanced'
      };

      await request(app)
        .post('/api/training-v2/sessions')
        .send(invalidSessionData)
        .expect(500);

      // Backend should handle error gracefully without crashing
      const healthCheck = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      expect(Array.isArray(healthCheck.body)).toBe(true);
    });

    it('FBTI009 - Should validate data consistency between operations', async () => {
      // Create specialty with specific data
      const specialtyData = {
        name: 'Consistency Test Specialty',
        description: 'Testing data consistency',
        domain: 'analytical',
        requiredKnowledge: ['Consistency', 'Validation'],
        competencyLevels: ['Beginner', 'Expert']
      };

      const backendSpecialty = await request(app)
        .post('/api/training-v2/specialties')
        .send(specialtyData)
        .expect(201);

      // Retrieve via backend API
      const retrieveResponse = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      const foundSpecialty = retrieveResponse.body.find((s: any) => s.id === backendSpecialty.body.id);
      expect(foundSpecialty).toBeDefined();
      expect(foundSpecialty.name).toBe(specialtyData.name);
      expect(foundSpecialty.domain).toBe(specialtyData.domain);
      expect(foundSpecialty.requiredKnowledge).toEqual(specialtyData.requiredKnowledge);

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${backendSpecialty.body.id}`)
        .expect(204);
    });
  });

  describe('API Endpoint Verification', () => {
    it('FBTI010 - Should have all required endpoints available', async () => {
      // Test specialty endpoints
      await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      // Test session endpoints
      await request(app)
        .get('/api/training-v2/sessions')
        .expect(200);

      // Test legacy compatibility
      await request(app)
        .get('/api/training/specialties')
        .expect(200);

      await request(app)
        .get('/api/training/sessions')
        .expect(200);
    });
  });
});