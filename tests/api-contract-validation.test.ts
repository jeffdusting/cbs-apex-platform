/**
 * API Contract Validation Tests
 * 
 * These tests ensure that:
 * 1. All required parameters are documented
 * 2. Error messages are clear and actionable
 * 3. API contracts match documentation
 * 4. Missing parameters return helpful errors
 */

import '@anthropic-ai/sdk/shims/node';
import 'whatwg-fetch';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

interface ApiEndpoint {
  method: string;
  path: string;
  requiredParams: string[];
  optionalParams?: string[];
  expectedErrorCodes: number[];
}

const TRAINING_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/training/specialties',
    requiredParams: ['name', 'domain', 'llmProviderId'],
    optionalParams: ['description', 'requiredKnowledge', 'competencyLevels'],
    expectedErrorCodes: [400, 500]
  },
  {
    method: 'POST', 
    path: '/api/training/sessions',
    requiredParams: ['agentId', 'specialtyId', 'targetCompetencyLevel'],
    optionalParams: ['maxIterations'],
    expectedErrorCodes: [400, 500]
  },
  {
    method: 'POST',
    path: '/api/agent-library',
    requiredParams: ['name', 'description', 'hbdiPersonalityType'],
    optionalParams: ['specializations', 'communicationStyle'],
    expectedErrorCodes: [400, 500]
  }
];

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
});

describe('API Contract Validation', () => {
  async function makeRequest(method: string, path: string, data?: any): Promise<any> {
    try {
      const agent = request(app);
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await agent.get(path);
          break;
        case 'post':
          response = await agent.post(path).send(data || {});
          break;
        case 'put':
          response = await agent.put(path).send(data || {});
          break;
        case 'patch':
          response = await agent.patch(path).send(data || {});
          break;
        case 'delete':
          response = await agent.delete(path);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Request failed: ${method} ${path}`, error);
      throw error;
    }
  }

  describe('Training API Endpoints', () => {
    TRAINING_ENDPOINTS.forEach(endpoint => {
      describe(`${endpoint.method} ${endpoint.path}`, () => {
        it('should reject requests with no data and provide clear error message', async () => {
          const response = await makeRequest(endpoint.method, endpoint.path, {});
          
          expect(response.status).toBeGreaterThanOrEqual(400);
          
          const errorResponse = response.body;
          expect(errorResponse).toHaveProperty('error');
          expect(typeof errorResponse.error).toBe('string');
          expect(errorResponse.error.length).toBeGreaterThan(10); // Should be descriptive
        });

        it('should validate each required parameter individually', async () => {
          for (const requiredParam of endpoint.requiredParams) {
            // Create request data with all required params except the one we're testing
            const testData: any = {};
            endpoint.requiredParams.forEach(param => {
              if (param !== requiredParam) {
                testData[param] = getDefaultValueForParam(param);
              }
            });

            const response = await makeRequest(endpoint.method, endpoint.path, testData);
            
            expect(response.status).toBeGreaterThanOrEqual(400);
            
            const errorResponse = response.body;
            expect(errorResponse).toHaveProperty('error');
            
            // Error message should mention the missing parameter or be helpful
            const errorMsg = errorResponse.error.toLowerCase();
            const isHelpful = errorMsg.includes(requiredParam.toLowerCase()) || 
                             errorMsg.includes('required') || 
                             errorMsg.includes('missing') ||
                             errorMsg.includes('provide');
            
            expect(isHelpful).toBe(true);
            
            console.log(`✅ Missing ${requiredParam} properly handled: "${errorResponse.error}"`);
          }
        });

        it('should accept requests with all required parameters', async () => {
          const validData: any = {};
          endpoint.requiredParams.forEach(param => {
            validData[param] = getDefaultValueForParam(param);
          });

          const response = await makeRequest(endpoint.method, endpoint.path, validData);
          
          // Should either succeed (201/200) or fail for business logic reasons (not parameter validation)
          if (response.status >= 400) {
            const errorResponse = response.body;
            // Error should NOT be about missing required parameters
            const errorMsg = errorResponse.error.toLowerCase();
            const isParameterError = endpoint.requiredParams.some(param => 
              errorMsg.includes(param.toLowerCase()) && 
              (errorMsg.includes('required') || errorMsg.includes('missing'))
            );
            
            expect(isParameterError).toBe(false);
            console.log(`ℹ️  Business logic error (acceptable): "${errorResponse.error}"`);
          } else {
            console.log(`✅ Request succeeded with all required parameters`);
            expect(response.status).toBeLessThan(400);
          }
        });
      });
    });
  });

  describe('Error Response Quality', () => {
    it('should provide actionable error messages for competency creation', async () => {
      const response = await makeRequest('POST', '/api/training/specialties', {
        name: 'Test Competency',
        domain: 'technical'
        // Missing llmProviderId
      });

      expect(response.status).toBe(400);
      const errorResponse = response.body;
      
      // Error should be specific and actionable
      expect(errorResponse.error).toContain('llmProviderId');
      expect(errorResponse.error).toContain('required');
      
      console.log(`✅ Competency creation error is actionable: "${errorResponse.error}"`);
    });

    it('should include helpful context in error messages', async () => {
      const problematicRequests = [
        {
          endpoint: '/api/training/specialties',
          data: { name: 'Test' }, // Missing domain and llmProviderId
          expectedKeywords: ['domain', 'llmProviderId', 'required']
        },
        {
          endpoint: '/api/training/sessions',
          data: { agentId: 'test-agent' }, // Missing specialtyId and targetCompetencyLevel
          expectedKeywords: ['specialty', 'competency', 'required']
        }
      ];

      for (const req of problematicRequests) {
        const response = await makeRequest('POST', req.endpoint, req.data);
        expect(response.status).toBeGreaterThanOrEqual(400);
        
        const errorResponse = response.body;
        const errorMsg = errorResponse.error.toLowerCase();
        
        // At least one expected keyword should be present
        const hasExpectedKeyword = req.expectedKeywords.some(keyword => 
          errorMsg.includes(keyword.toLowerCase())
        );
        
        expect(hasExpectedKeyword).toBe(true);
        console.log(`✅ Error for ${req.endpoint} contains helpful keywords: "${errorResponse.error}"`);
      }
    });
  });

  describe('Documentation Consistency', () => {
    it('should verify that documented endpoints actually exist', async () => {
      const documentedEndpoints = [
        'GET /api/training/specialties',
        'POST /api/training/specialties',
        'PUT /api/training/specialties/:id',
        'DELETE /api/training/specialties/:id',
        'GET /api/training/sessions',
        'POST /api/training/sessions'
      ];

      for (const endpointDesc of documentedEndpoints) {
        const [method, path] = endpointDesc.split(' ');
        const testPath = path.replace(':id', 'test-id').replace(':specialtyId', 'test-specialty');
        
        const response = await makeRequest(method, testPath);
        
        // Should not return 404 (endpoint exists)
        expect(response.status).not.toBe(404);
        console.log(`✅ Documented endpoint ${endpointDesc} exists (status: ${response.status})`);
      }
    });
  });
});

/**
 * Helper function to provide realistic default values for API parameters
 */
function getDefaultValueForParam(param: string): any {
  const defaults: Record<string, any> = {
    name: 'Test Competency',
    description: 'Test description for automated testing',
    domain: 'technical',
    llmProviderId: 'openai-gpt5',
    agentId: 'test-agent-123',
    specialtyId: 'test-specialty-123',
    targetCompetencyLevel: 'Intermediate',
    maxIterations: 5,
    hbdiPersonalityType: 'analytical',
    requiredKnowledge: ['Basic concepts'],
    competencyLevels: ['Beginner', 'Intermediate', 'Advanced'],
    specializations: ['Problem solving'],
    communicationStyle: 'direct'
  };

  return defaults[param] || `test-${param}`;
}

export { ApiEndpoint, TRAINING_ENDPOINTS };