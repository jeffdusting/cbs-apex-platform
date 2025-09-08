/**
 * Training Module Integration Regression Tests
 * 
 * Tests to ensure the training module integrates properly with other
 * application components and doesn't break existing functionality.
 */

import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage';
import { TrainingModuleFactory } from '../../server/factories/TrainingModuleFactory';

describe('Training Module Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    TrainingModuleFactory.resetInstance();
  });

  describe('API Coexistence Tests', () => {
    it('should maintain both legacy and new training APIs', async () => {
      // Test legacy API still works
      const legacyResponse = await request(app)
        .get('/api/training/specialties')
        .expect(200);

      expect(Array.isArray(legacyResponse.body)).toBe(true);

      // Test new isolated API works
      const newResponse = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      expect(Array.isArray(newResponse.body)).toBe(true);
    });

    it('should not interfere with non-training endpoints', async () => {
      // Test that other API endpoints still work correctly
      const providersResponse = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(Array.isArray(providersResponse.body)).toBe(true);

      const foldersResponse = await request(app)
        .get('/api/folders')
        .expect(200);

      expect(Array.isArray(foldersResponse.body)).toBe(true);

      const conversationsResponse = await request(app)
        .get('/api/conversations')
        .expect(200);

      expect(Array.isArray(conversationsResponse.body)).toBe(true);
    });

    it('should handle cross-system agent operations', async () => {
      // Create agent through regular storage
      const agent = await storage.createAgentLibrary({
        name: 'Integration Test Agent',
        description: 'Testing cross-system integration',
        primaryPersonality: 'analytical',
        secondaryPersonality: 'creative'
      });

      // Verify agent appears in agent library endpoint
      const agentResponse = await request(app)
        .get('/api/agent-library')
        .expect(200);

      const createdAgent = agentResponse.body.find((a: any) => a.id === agent.id);
      expect(createdAgent).toBeDefined();
      expect(createdAgent.name).toBe('Integration Test Agent');

      // Verify new training API can use this agent
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Integration Test Specialty',
          domain: 'integration',
          requiredKnowledge: [],
          competencyLevels: ['Beginner', 'Advanced']
        })
        .expect(201);

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: agent.id,
          specialtyId: specialtyResponse.body.id,
          targetCompetencyLevel: 'Advanced'
        })
        .expect(201);

      expect(sessionResponse.body.agentId).toBe(agent.id);

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${specialtyResponse.body.id}`)
        .expect(204);
    });
  });

  describe('Database Integration Tests', () => {
    it('should not affect existing data integrity', async () => {
      // Get initial counts
      const initialAgents = await storage.getAgentLibraries();
      const initialProviders = await storage.getProviders();
      const initialFolders = await storage.getFolders();

      // Perform training operations
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Database Integration Test',
          domain: 'database',
          requiredKnowledge: ['Database basics'],
          competencyLevels: ['Beginner', 'Expert']
        })
        .expect(201);

      if (initialAgents.length > 0) {
        await request(app)
          .post('/api/training-v2/sessions')
          .send({
            agentId: initialAgents[0].id,
            specialtyId: specialtyResponse.body.id,
            targetCompetencyLevel: 'Expert'
          })
          .expect(201);
      }

      // Verify other data is unchanged
      const finalAgents = await storage.getAgentLibraries();
      const finalProviders = await storage.getProviders();
      const finalFolders = await storage.getFolders();

      expect(finalAgents.length).toBe(initialAgents.length);
      expect(finalProviders.length).toBe(initialProviders.length);
      expect(finalFolders.length).toBe(initialFolders.length);

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${specialtyResponse.body.id}`)
        .expect(204);
    });

    it('should handle transaction rollbacks properly', async () => {
      // Test that failed operations don't leave partial data
      const initialSpecialties = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      // Attempt to create session with invalid data
      await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: 'non-existent-agent',
          specialtyId: 'non-existent-specialty',
          targetCompetencyLevel: 'Invalid'
        })
        .expect(500);

      // Verify no orphaned specialties were created
      const finalSpecialties = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      expect(finalSpecialties.body.length).toBe(initialSpecialties.body.length);
    });
  });

  describe('AI Meetings Integration', () => {
    it('should not interfere with AI meeting functionality', async () => {
      // Test that AI meeting endpoints still work
      const agentsResponse = await request(app)
        .get('/api/agent-library')
        .expect(200);

      if (agentsResponse.body.length >= 2) {
        // Test meeting creation
        const meetingResponse = await request(app)
          .post('/api/meetings')
          .send({
            title: 'Integration Test Meeting',
            description: 'Testing training module integration',
            selectedAgents: agentsResponse.body.slice(0, 2).map((a: any) => a.id),
            maxMessages: 5
          })
          .expect(201);

        expect(meetingResponse.body.id).toBeDefined();
        expect(meetingResponse.body.title).toBe('Integration Test Meeting');

        // Test that mood system still works
        const moodResponse = await request(app)
          .post(`/api/meetings/${meetingResponse.body.id}/init-moods`)
          .send({
            agentIds: agentsResponse.body.slice(0, 2).map((a: any) => a.id)
          })
          .expect(200);

        expect(Array.isArray(moodResponse.body)).toBe(true);
      }
    });

    it('should maintain agent library consistency', async () => {
      // Create agent through training system
      const agent = await storage.createAgentLibrary({
        name: 'Training System Agent',
        description: 'Agent created for training integration test',
        primaryPersonality: 'methodical',
        secondaryPersonality: 'analytical'
      });

      // Verify agent appears in meeting agent selection
      const agentsResponse = await request(app)
        .get('/api/agent-library')
        .expect(200);

      const foundAgent = agentsResponse.body.find((a: any) => a.id === agent.id);
      expect(foundAgent).toBeDefined();
      expect(foundAgent.name).toBe('Training System Agent');

      // Verify agent can be used in both systems
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Consistency Test Specialty',
          domain: 'consistency',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        })
        .expect(201);

      const sessionResponse = await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: agent.id,
          specialtyId: specialtyResponse.body.id,
          targetCompetencyLevel: 'Beginner'
        })
        .expect(201);

      expect(sessionResponse.body.agentId).toBe(agent.id);

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${specialtyResponse.body.id}`)
        .expect(204);
    });
  });

  describe('Document and Provider Integration', () => {
    it('should not affect document management', async () => {
      // Test document operations still work
      const documentsResponse = await request(app)
        .get('/api/documents/general')
        .expect(200);

      expect(Array.isArray(documentsResponse.body)).toBe(true);

      // Test folder operations
      const foldersResponse = await request(app)
        .get('/api/folders')
        .expect(200);

      expect(Array.isArray(foldersResponse.body)).toBe(true);
    });

    it('should not interfere with provider operations', async () => {
      // Test provider retrieval
      const providersResponse = await request(app)
        .get('/api/providers')
        .expect(200);

      expect(Array.isArray(providersResponse.body)).toBe(true);

      // Test cost tracking still works
      const costsResponse = await request(app)
        .get('/api/costs')
        .expect(200);

      expect(typeof costsResponse.body.total).toBe('number');
      expect(typeof costsResponse.body.monthly).toBe('number');
      expect(typeof costsResponse.body.daily).toBe('number');
    });
  });

  describe('WebSocket and Real-time Features', () => {
    it('should not interfere with mood updates', async () => {
      // Test that mood update endpoints still work
      const agents = await storage.getAgentLibraries();
      if (agents.length === 0) return;

      const moodResponse = await request(app)
        .patch('/api/moods/test-meeting/update')
        .send({
          agentId: agents[0].id,
          mood: 'excited',
          reason: 'Testing mood integration'
        })
        .expect(200);

      expect(moodResponse.body.mood).toBe('excited');
    });
  });

  describe('Error Handling Integration', () => {
    it('should maintain consistent error responses across APIs', async () => {
      // Test 404 responses are consistent
      const legacyNotFound = await request(app)
        .get('/api/training/sessions/non-existent')
        .expect(404);

      const newNotFound = await request(app)
        .get('/api/training-v2/sessions/non-existent')
        .expect(404);

      expect(legacyNotFound.body).toHaveProperty('error');
      expect(newNotFound.body).toHaveProperty('error');

      // Test validation errors are consistent
      const legacyValidation = await request(app)
        .post('/api/training/specialties')
        .send({})
        .expect(400);

      const newValidation = await request(app)
        .post('/api/training-v2/specialties')
        .send({})
        .expect(400);

      expect(legacyValidation.body).toHaveProperty('error');
      expect(newValidation.body).toHaveProperty('error');
    });

    it('should handle system-wide errors gracefully', async () => {
      // Test that training module errors don't break other endpoints
      
      // Cause a training error
      await request(app)
        .post('/api/training-v2/sessions')
        .send({
          agentId: 'invalid',
          specialtyId: 'invalid',
          targetCompetencyLevel: 'invalid'
        })
        .expect(500);

      // Verify other endpoints still work
      await request(app)
        .get('/api/providers')
        .expect(200);

      await request(app)
        .get('/api/folders')
        .expect(200);

      await request(app)
        .get('/api/agent-library')
        .expect(200);
    });
  });

  describe('Performance Impact on Other Systems', () => {
    it('should not significantly slow down other API endpoints', async () => {
      // Baseline performance test
      const start = Date.now();
      await request(app).get('/api/providers');
      await request(app).get('/api/folders');
      await request(app).get('/api/agent-library');
      const baselineDuration = Date.now() - start;

      // Create training load
      const specialtyResponse = await request(app)
        .post('/api/training-v2/specialties')
        .send({
          name: 'Performance Impact Test',
          domain: 'performance',
          requiredKnowledge: [],
          competencyLevels: ['Beginner']
        })
        .expect(201);

      // Test performance under load
      const loadStart = Date.now();
      await request(app).get('/api/providers');
      await request(app).get('/api/folders');
      await request(app).get('/api/agent-library');
      const loadDuration = Date.now() - loadStart;

      // Performance shouldn't degrade significantly
      expect(loadDuration).toBeLessThan(baselineDuration * 3);

      // Cleanup
      await request(app)
        .delete(`/api/training-v2/specialties/${specialtyResponse.body.id}`)
        .expect(204);
    });
  });
});