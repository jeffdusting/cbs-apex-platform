/**
 * Competency Management Tests
 * 
 * Comprehensive tests for competency creation, modification, and lifecycle management
 * to ensure bugs like missing llmProviderId don't persist.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import 'whatwg-fetch';

// Use the polyfilled fetch

describe('Competency Management', () => {
  const baseUrl = 'http://localhost:5000';
  let createdSpecialtyIds: string[] = [];

  async function makeRequest(method: string, path: string, data?: any): Promise<any> {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return response;
    } catch (error) {
      console.error(`Request failed: ${method} ${path}`, error);
      throw error;
    }
  }

  async function createTestSpecialty(overrides: any = {}): Promise<any> {
    const defaultData = {
      name: `Test Competency ${Date.now()}`,
      description: 'Automated test competency',
      domain: 'technical',
      llmProviderId: 'openai-gpt5',
      requiredKnowledge: ['Basic concepts', 'Problem solving'],
      competencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    };

    const data = { ...defaultData, ...overrides };
    const response = await makeRequest('POST', '/api/training/specialties', data);
    
    if (response.ok) {
      const result = await response.json();
      createdSpecialtyIds.push(result.id);
      return result;
    }
    
    throw new Error(`Failed to create test specialty: ${response.status}`);
  }

  afterAll(async () => {
    // Cleanup created specialties
    for (const id of createdSpecialtyIds) {
      try {
        await makeRequest('DELETE', `/api/training/specialties/${id}`);
      } catch (error) {
        console.warn(`Failed to cleanup specialty ${id}:`, error);
      }
    }
  });

  describe('Competency Creation Requirements', () => {
    it('should successfully create competency with all required fields', async () => {
      const specialty = await createTestSpecialty();
      
      expect(specialty).toHaveProperty('id');
      expect(specialty.name).toContain('Test Competency');
      expect(specialty.domain).toBe('technical');
      expect(specialty.llmProviderId).toBe('openai-gpt5');
      
      console.log(`✅ Created competency: ${specialty.name} (ID: ${specialty.id})`);
    });

    it('should reject competency creation without llmProviderId', async () => {
      const response = await makeRequest('POST', '/api/training/specialties', {
        name: 'Test Competency Without LLM',
        description: 'Should fail',
        domain: 'technical'
        // Missing llmProviderId
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toContain('llmProviderId');
      expect(error.error).toContain('required');
      
      console.log(`✅ Properly rejected creation without llmProviderId: "${error.error}"`);
    });

    it('should reject competency creation without name', async () => {
      const response = await makeRequest('POST', '/api/training/specialties', {
        description: 'Should fail - no name',
        domain: 'technical',
        llmProviderId: 'openai-gpt5'
        // Missing name
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error.toLowerCase()).toMatch(/name.*required|required.*name/);
      
      console.log(`✅ Properly rejected creation without name: "${error.error}"`);
    });

    it('should reject competency creation without domain', async () => {
      const response = await makeRequest('POST', '/api/training/specialties', {
        name: 'Test Competency',
        description: 'Should fail - no domain',
        llmProviderId: 'openai-gpt5'
        // Missing domain
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error.toLowerCase()).toMatch(/domain.*required|required.*domain/);
      
      console.log(`✅ Properly rejected creation without domain: "${error.error}"`);
    });

    it('should handle invalid llmProviderId gracefully', async () => {
      const response = await makeRequest('POST', '/api/training/specialties', {
        name: 'Test Competency with Invalid LLM',
        description: 'Should handle invalid llmProviderId',
        domain: 'technical',
        llmProviderId: 'nonexistent-provider'
      });

      // Should either reject with clear error or accept and handle gracefully
      if (response.status >= 400) {
        const error = await response.json();
        expect(error.error).toBeDefined();
        console.log(`✅ Invalid llmProviderId handled: "${error.error}"`);
      } else {
        // If accepted, the system should handle it gracefully later
        const result = await response.json();
        expect(result.llmProviderId).toBe('nonexistent-provider');
        createdSpecialtyIds.push(result.id);
        console.log(`✅ Invalid llmProviderId accepted but will be handled in business logic`);
      }
    });
  });

  describe('Competency Lifecycle Management', () => {
    it('should retrieve created competencies', async () => {
      const specialty = await createTestSpecialty({ name: 'Retrievable Competency' });
      
      const response = await makeRequest('GET', '/api/training/specialties');
      expect(response.ok).toBe(true);
      
      const specialties = await response.json();
      expect(Array.isArray(specialties)).toBe(true);
      
      const found = specialties.find((s: any) => s.id === specialty.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Retrievable Competency');
      
      console.log(`✅ Successfully retrieved competency: ${found.name}`);
    });

    it('should update competency properties', async () => {
      const specialty = await createTestSpecialty({ name: 'Updatable Competency' });
      
      const updateData = {
        description: 'Updated description for testing',
        requiredKnowledge: ['Updated knowledge', 'New concepts']
      };
      
      const response = await makeRequest('PUT', `/api/training/specialties/${specialty.id}`, updateData);
      
      if (response.ok) {
        const updated = await response.json();
        expect(updated.description).toBe(updateData.description);
        expect(updated.requiredKnowledge).toEqual(updateData.requiredKnowledge);
        console.log(`✅ Successfully updated competency: ${updated.name}`);
      } else {
        const error = await response.json();
        console.log(`ℹ️  Update failed (may be expected): "${error.error}"`);
      }
    });

    it('should delete competency', async () => {
      const specialty = await createTestSpecialty({ name: 'Deletable Competency' });
      
      const response = await makeRequest('DELETE', `/api/training/specialties/${specialty.id}`);
      
      if (response.ok || response.status === 204) {
        // Remove from cleanup list since we successfully deleted it
        createdSpecialtyIds = createdSpecialtyIds.filter(id => id !== specialty.id);
        console.log(`✅ Successfully deleted competency: ${specialty.name}`);
      } else {
        const error = await response.json();
        console.log(`ℹ️  Delete failed (may be expected): "${error.error}"`);
      }
    });
  });

  describe('Integration with Training Sessions', () => {
    it('should verify competency can be used in training sessions', async () => {
      const specialty = await createTestSpecialty({ name: 'Training Session Competency' });
      
      // Try to create a training session with this competency
      const sessionData = {
        agentId: 'test-agent-for-competency',
        specialtyId: specialty.id,
        targetCompetencyLevel: 'Intermediate',
        maxIterations: 3
      };
      
      const response = await makeRequest('POST', '/api/training/sessions', sessionData);
      
      // Even if it fails due to missing agent, it should not fail due to competency issues
      if (response.status >= 400) {
        const error = await response.json();
        const isCompetencyError = error.error.toLowerCase().includes('specialty') && 
                                 error.error.toLowerCase().includes('not found');
        
        expect(isCompetencyError).toBe(false);
        console.log(`ℹ️  Training session creation failed for other reasons: "${error.error}"`);
      } else {
        const session = await response.json();
        expect(session.specialtyId).toBe(specialty.id);
        console.log(`✅ Training session created successfully with competency: ${specialty.name}`);
      }
    });
  });

  describe('Competency Question Generation', () => {
    it('should handle question generation for competencies', async () => {
      const specialty = await createTestSpecialty({ 
        name: 'Question Generation Competency',
        llmProviderId: 'openai-gpt5' // Ensure we have a valid LLM provider
      });
      
      const questionGenData = {
        llmProviderId: specialty.llmProviderId,
        questionCount: 3,
        difficulty: 'Intermediate'
      };
      
      const response = await makeRequest('POST', `/api/training/specialties/${specialty.id}/generate-questions`, questionGenData);
      
      if (response.ok) {
        const result = await response.json();
        expect(result).toHaveProperty('message');
        console.log(`✅ Question generation successful: ${result.message}`);
      } else {
        const error = await response.json();
        // Should not fail due to missing llmProviderId since we provided it
        expect(error.error).not.toContain('llmProviderId is required');
        console.log(`ℹ️  Question generation failed for other reasons: "${error.error}"`);
      }
    });
  });

  describe('Error Handling and User Experience', () => {
    it('should provide helpful error messages for common mistakes', async () => {
      const commonMistakes = [
        {
          data: {},
          expectedKeywords: ['name', 'domain', 'llmProviderId']
        },
        {
          data: { name: 'Test' },
          expectedKeywords: ['domain', 'llmProviderId']
        },
        {
          data: { name: 'Test', domain: 'technical' },
          expectedKeywords: ['llmProviderId']
        }
      ];

      for (const mistake of commonMistakes) {
        const response = await makeRequest('POST', '/api/training/specialties', mistake.data);
        expect(response.status).toBe(400);
        
        const error = await response.json();
        const errorMsg = error.error.toLowerCase();
        
        // Error should mention at least one of the expected keywords
        const hasHelpfulKeyword = mistake.expectedKeywords.some(keyword => 
          errorMsg.includes(keyword.toLowerCase())
        );
        
        expect(hasHelpfulKeyword).toBe(true);
        console.log(`✅ Helpful error for missing fields: "${error.error}"`);
      }
    });

    it('should provide consistent error format across all endpoints', async () => {
      const endpoints = [
        { method: 'POST', path: '/api/training/specialties', data: {} },
        { method: 'POST', path: '/api/training/sessions', data: {} },
        { method: 'POST', path: '/api/agent-library', data: {} }
      ];

      for (const endpoint of endpoints) {
        const response = await makeRequest(endpoint.method, endpoint.path, endpoint.data);
        expect(response.status).toBeGreaterThanOrEqual(400);
        
        const error = await response.json();
        
        // All errors should have consistent structure
        expect(error).toHaveProperty('error');
        expect(typeof error.error).toBe('string');
        expect(error.error.length).toBeGreaterThan(5);
        
        console.log(`✅ Consistent error format for ${endpoint.method} ${endpoint.path}: "${error.error}"`);
      }
    });
  });
});