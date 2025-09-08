import request from 'supertest';
import express, { type Express } from 'express';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage';
import type { Server } from 'http';

// Mock storage for testing
jest.mock('../../server/storage');
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('Backend API Tests', () => {
  let app: Express;
  let server: Server;

  beforeAll(async () => {
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

  describe('Prompt Workflows', () => {
    describe('GET /api/providers', () => {
      it('should return list of providers', async () => {
        const mockProviders = [
          {
            id: 'openai-gpt5',
            name: 'GPT-5',
            model: 'gpt-5',
            icon: 'fas fa-brain',
            color: 'blue',
            isEnabled: true,
            apiKeyEnvVar: 'OPENAI_API_KEY',
            inputCostPer1k: 0.01,
            outputCostPer1k: 0.03,
            dailyLimit: 1000,
            monthlyLimit: 30000,
            usage: { daily: 0, monthly: 0, total: 0 }
          }
        ];
        
        mockStorage.getProviders.mockResolvedValue(mockProviders);

        const response = await request(app)
          .get('/api/providers')
          .expect(200);

        expect(response.body).toEqual(mockProviders);
        expect(mockStorage.getProviders).toHaveBeenCalledTimes(1);
      });
    });

    describe('POST /api/prompts', () => {
      it('should create and process a prompt successfully', async () => {
        const mockPrompt = {
          id: 'prompt-123',
          content: 'Test prompt',
          selectedProviders: ['openai-gpt5'],
          conversationId: null,
          createdAt: new Date(),
          status: 'completed'
        };

        const mockProvider = {
          id: 'openai-gpt5',
          name: 'GPT-5',
          model: 'gpt-5',
          isEnabled: true,
          apiKeyEnvVar: 'OPENAI_API_KEY'
        };

        mockStorage.createPrompt.mockResolvedValue(mockPrompt);
        mockStorage.getProvider.mockResolvedValue(mockProvider);

        const promptData = {
          content: 'Test prompt',
          selectedProviders: ['openai-gpt5'],
          selectedFolders: [],
          conversationId: null
        };

        const response = await request(app)
          .post('/api/prompts')
          .send(promptData)
          .expect(201);

        expect(response.body.id).toBe('prompt-123');
        expect(mockStorage.createPrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Test prompt',
            selectedProviders: ['openai-gpt5']
          })
        );
      });

      it('should return 400 for invalid prompt data', async () => {
        const response = await request(app)
          .post('/api/prompts')
          .send({ content: '', selectedProviders: [] })
          .expect(400);

        expect(response.body.error).toBe('Content and at least one provider are required');
      });
    });

    describe('GET /api/prompts/:id/responses', () => {
      it('should return responses for a prompt', async () => {
        const mockResponses = [
          {
            id: 'response-123',
            promptId: 'prompt-123',
            providerId: 'openai-gpt5',
            content: 'AI response content',
            tokensUsed: 50,
            cost: '0.0015',
            responseTime: 1500,
            artifacts: []
          }
        ];

        mockStorage.getResponses.mockResolvedValue(mockResponses);

        const response = await request(app)
          .get('/api/prompts/prompt-123/responses')
          .expect(200);

        expect(response.body).toEqual(mockResponses);
        expect(mockStorage.getResponses).toHaveBeenCalledWith('prompt-123');
      });
    });
  });

  describe('AI Meeting Workflows', () => {
    describe('POST /api/prompt-sequences', () => {
      it('should create an AI meeting successfully', async () => {
        const mockSequence = {
          id: 'sequence-123',
          name: 'Test Meeting',
          description: 'Test meeting description',
          taskObjective: 'Analyze test data',
          initialPrompt: 'Please analyze this data',
          llmChain: [
            {
              step: 1,
              providerId: 'openai-gpt5',
              primaryPersonality: 'Analytical',
              secondaryPersonality: 'Experimental',
              supplementalPrompt: 'Focus on technical aspects'
            }
          ],
          iterations: 1,
          selectedFolders: [],
          status: 'running',
          createdAt: new Date()
        };

        mockStorage.createPromptSequence.mockResolvedValue(mockSequence);

        const sequenceData = {
          name: 'Test Meeting',
          description: 'Test meeting description',
          taskObjective: 'Analyze test data',
          initialPrompt: 'Please analyze this data',
          llmChain: [
            {
              step: 1,
              providerId: 'openai-gpt5',
              primaryPersonality: 'Analytical',
              secondaryPersonality: 'Experimental',
              supplementalPrompt: 'Focus on technical aspects'
            }
          ],
          iterations: 1,
          selectedFolders: [],
          synthesisProviderId: 'anthropic-claude'
        };

        const response = await request(app)
          .post('/api/prompt-sequences')
          .send(sequenceData)
          .expect(201);

        expect(response.body.id).toBe('sequence-123');
        expect(mockStorage.createPromptSequence).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Meeting',
            status: 'running'
          })
        );
      });

      it('should return 400 for invalid meeting data', async () => {
        const response = await request(app)
          .post('/api/prompt-sequences')
          .send({ name: '', llmChain: [] })
          .expect(400);

        expect(response.body.error).toBe('Name, task objective, initial prompt, LLM chain, and valid iterations are required');
      });
    });

    describe('GET /api/prompt-sequences', () => {
      it('should return list of AI meetings', async () => {
        const mockSequences = [
          {
            id: 'sequence-123',
            name: 'Test Meeting',
            status: 'completed',
            createdAt: new Date(),
            totalCost: '0.05'
          }
        ];

        mockStorage.getPromptSequences.mockResolvedValue(mockSequences);

        const response = await request(app)
          .get('/api/prompt-sequences')
          .expect(200);

        expect(response.body).toEqual(mockSequences);
        expect(mockStorage.getPromptSequences).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /api/prompt-sequences/:id/steps', () => {
      it('should return meeting steps', async () => {
        const mockSteps = [
          {
            id: 'step-123',
            sequenceId: 'sequence-123',
            stepNumber: 1,
            providerId: 'openai-gpt5',
            inputPrompt: 'Initial prompt',
            outputContent: 'Agent response',
            status: 'completed',
            tokensUsed: 75,
            cost: '0.002',
            responseTime: 2000,
            isSynthesis: false
          }
        ];

        mockStorage.getSequenceSteps.mockResolvedValue(mockSteps);

        const response = await request(app)
          .get('/api/prompt-sequences/sequence-123/steps')
          .expect(200);

        expect(response.body).toEqual(mockSteps);
        expect(mockStorage.getSequenceSteps).toHaveBeenCalledWith('sequence-123');
      });
    });

    describe('GET /api/prompt-sequences/:id/synthesis-report', () => {
      it('should generate synthesis report in JSON format', async () => {
        const mockSequence = {
          id: 'sequence-123',
          name: 'Test Meeting',
          description: 'Test description',
          taskObjective: 'Test objective',
          initialPrompt: 'Test prompt',
          iterations: 1,
          totalCost: '0.05',
          completedAt: new Date(),
          llmChain: [
            {
              step: 1,
              providerId: 'openai-gpt5',
              primaryPersonality: 'Analytical'
            }
          ]
        };

        const mockSteps = [
          {
            id: 'step-123',
            stepNumber: 1,
            providerId: 'openai-gpt5',
            inputPrompt: 'Test input',
            outputContent: 'Agent response',
            isSynthesis: false,
            tokensUsed: 50,
            cost: '0.002',
            responseTime: 1500
          },
          {
            id: 'step-124',
            stepNumber: 2,
            providerId: 'anthropic-claude',
            outputContent: 'Synthesis result',
            isSynthesis: true,
            tokensUsed: 100,
            cost: '0.003',
            responseTime: 2000
          }
        ];

        const mockProviders = [
          { id: 'openai-gpt5', name: 'GPT-5' },
          { id: 'anthropic-claude', name: 'Claude' }
        ];

        mockStorage.getPromptSequence.mockResolvedValue(mockSequence);
        mockStorage.getSequenceSteps.mockResolvedValue(mockSteps);
        mockStorage.getProviders.mockResolvedValue(mockProviders);

        const response = await request(app)
          .get('/api/prompt-sequences/sequence-123/synthesis-report?format=json')
          .expect(200);

        expect(response.body.meeting.name).toBe('Test Meeting');
        expect(response.body.agentDiscussions).toHaveLength(1);
        expect(response.body.synthesis.content).toBe('Synthesis result');
      });
    });
  });

  describe('Agent Library Workflows', () => {
    describe('GET /api/agent-library', () => {
      it('should return list of saved agents', async () => {
        const mockAgents = [
          {
            id: 'agent-123',
            name: 'Test Agent',
            description: 'Test agent description',
            primaryPersonality: 'Analytical',
            secondaryPersonality: 'Experimental',
            isDevilsAdvocate: false,
            supplementalPrompt: 'Focus on data',
            preferredProviderId: 'openai-gpt5'
          }
        ];

        // Mock the cached agent libraries function
        jest.doMock('../../server/routes', () => ({
          getCachedAgentLibraries: jest.fn().mockResolvedValue(mockAgents)
        }));

        mockStorage.getAgentLibraries.mockResolvedValue(mockAgents);

        const response = await request(app)
          .get('/api/agent-library')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('POST /api/agent-library', () => {
      it('should create a new agent', async () => {
        const mockAgent = {
          id: 'agent-123',
          name: 'Test Agent',
          description: 'Test description',
          primaryPersonality: 'Analytical',
          preferredProviderId: 'openai-gpt5'
        };

        mockStorage.createAgentLibrary.mockResolvedValue(mockAgent);

        const agentData = {
          name: 'Test Agent',
          description: 'Test description',
          primaryPersonality: 'Analytical',
          preferredProviderId: 'openai-gpt5'
        };

        const response = await request(app)
          .post('/api/agent-library')
          .send(agentData)
          .expect(200);

        expect(response.body.id).toBe('agent-123');
        expect(mockStorage.createAgentLibrary).toHaveBeenCalledWith(
          expect.objectContaining(agentData)
        );
      });
    });

    describe('PATCH /api/agent-library/:id/experience', () => {
      it('should update agent experience', async () => {
        const mockAgent = {
          id: 'agent-123',
          name: 'Test Agent',
          experienceHistory: [
            {
              meetingId: 'meeting-123',
              role: 'Analyst',
              contributions: ['Data analysis'],
              insights: ['Key insight'],
              topics: ['AI', 'Data']
            }
          ]
        };

        mockStorage.updateAgentExperience.mockResolvedValue(mockAgent);

        const experienceData = {
          meetingId: 'meeting-123',
          role: 'Analyst',
          contributions: ['Data analysis'],
          insights: ['Key insight'],
          topics: ['AI', 'Data']
        };

        const response = await request(app)
          .patch('/api/agent-library/agent-123/experience')
          .send(experienceData)
          .expect(200);

        expect(response.body.id).toBe('agent-123');
        expect(mockStorage.updateAgentExperience).toHaveBeenCalledWith(
          'agent-123',
          'meeting-123',
          'Analyst',
          ['Data analysis'],
          ['Key insight'],
          ['AI', 'Data']
        );
      });

      it('should return 400 for invalid experience data', async () => {
        const response = await request(app)
          .patch('/api/agent-library/agent-123/experience')
          .send({ meetingId: '', contributions: 'invalid' })
          .expect(400);

        expect(response.body.error).toBe('Invalid experience data');
      });
    });
  });

  describe('Document Management', () => {
    describe('GET /api/folders', () => {
      it('should return list of folders', async () => {
        const mockFolders = [
          {
            id: 'general',
            name: 'General',
            description: 'General documents'
          }
        ];

        mockStorage.getFolders.mockResolvedValue(mockFolders);

        const response = await request(app)
          .get('/api/folders')
          .expect(200);

        expect(response.body).toEqual(mockFolders);
        expect(mockStorage.getFolders).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /api/documents/:folderId', () => {
      it('should return documents in a folder', async () => {
        const mockDocuments = [
          {
            id: 'doc-123',
            name: 'test.txt',
            folderId: 'general',
            content: 'Test content',
            size: 12,
            createdAt: new Date()
          }
        ];

        mockStorage.getFolderDocuments.mockResolvedValue(mockDocuments);

        const response = await request(app)
          .get('/api/documents/general')
          .expect(200);

        expect(response.body).toEqual(mockDocuments);
        expect(mockStorage.getFolderDocuments).toHaveBeenCalledWith('general');
      });
    });
  });

  describe('Batch Testing Workflows', () => {
    describe('POST /api/batch-tests', () => {
      it('should create a batch test successfully', async () => {
        const mockBatchTest = {
          id: 'batch-123',
          name: 'Test Batch',
          prompts: ['Prompt 1', 'Prompt 2'],
          selectedProviders: ['openai-gpt5'],
          status: 'running',
          createdAt: new Date()
        };

        mockStorage.createBatchTest.mockResolvedValue(mockBatchTest);

        const batchData = {
          name: 'Test Batch',
          prompts: ['Prompt 1', 'Prompt 2'],
          selectedProviders: ['openai-gpt5'],
          selectedFolders: []
        };

        const response = await request(app)
          .post('/api/batch-tests')
          .send(batchData)
          .expect(201);

        expect(response.body.id).toBe('batch-123');
        expect(mockStorage.createBatchTest).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Batch',
            status: 'running'
          })
        );
      });
    });

    describe('GET /api/batch-tests/:id/results', () => {
      it('should return batch test results', async () => {
        const mockResults = [
          {
            id: 'result-123',
            batchTestId: 'batch-123',
            promptIndex: 0,
            promptContent: 'Prompt 1',
            providerId: 'openai-gpt5',
            responseContent: 'Response 1',
            tokensUsed: 50,
            cost: '0.002'
          }
        ];

        mockStorage.getBatchResults.mockResolvedValue(mockResults);

        const response = await request(app)
          .get('/api/batch-tests/batch-123/results')
          .expect(200);

        expect(response.body).toEqual(mockResults);
        expect(mockStorage.getBatchResults).toHaveBeenCalledWith('batch-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockStorage.getProviders.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/providers')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch providers');
    });

    it('should handle missing resources', async () => {
      mockStorage.getPromptSequence.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/prompt-sequences/nonexistent/synthesis-report')
        .expect(404);

      expect(response.body.error).toBe('Sequence not found');
    });
  });
});