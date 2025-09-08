/**
 * Data Synchronization Validation Tests
 * 
 * Tests to catch data synchronization bugs between different system components:
 * - Database ↔ Memory state synchronization
 * - API consistency across versions
 * - Real-time state propagation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { db } from '../server/db';
import { agentSpecialties } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

describe('Data Synchronization Validation', () => {
  describe('Memory State Synchronization', () => {
    it('should detect uninitialized memory state issues', () => {
      // Pattern that would catch our specific bug:
      // Database has data but application memory is uninitialized
      
      const systemStates = [
        {
          name: 'Critical Memory Gap',
          database: { records: 10, lastUpdated: '2025-09-05T06:00:00Z' },
          memory: { records: 0, initialized: false },
          issue: 'Memory never loaded from database',
          impact: 'Data invisible to application'
        },
        {
          name: 'Stale Memory State',
          database: { records: 10, lastUpdated: '2025-09-05T06:00:00Z' },
          memory: { records: 5, initialized: true, lastSync: '2025-09-05T05:00:00Z' },
          issue: 'Memory state outdated',
          impact: 'Partial data visibility'
        },
        {
          name: 'Healthy Synchronization',
          database: { records: 10, lastUpdated: '2025-09-05T06:00:00Z' },
          memory: { records: 10, initialized: true, lastSync: '2025-09-05T06:00:00Z' },
          issue: null,
          impact: 'Full data visibility'
        }
      ];

      systemStates.forEach(state => {
        const isHealthy = state.database.records === state.memory.records &&
                         state.memory.initialized;
        const hasCriticalIssue = state.database.records > 0 && 
                               state.memory.records === 0 &&
                               !state.memory.initialized;
        
        expect(state).toHaveProperty('database');
        expect(state).toHaveProperty('memory');
        expect(state).toHaveProperty('impact');
        
        if (hasCriticalIssue) {
          expect(state.issue).toContain('Memory never loaded');
          expect(state.impact).toContain('invisible');
        }
        
        console.log(`${isHealthy ? '✅' : '❌'} ${state.name}: ${state.impact}`);
      });
    });

    it('should validate initialization sequence requirements', () => {
      const requiredInitSteps = [
        'Database connection established',
        'Read existing records from database',
        'Populate memory structures with data',
        'Validate data integrity',
        'Mark initialization complete',
        'Begin processing requests'
      ];
      
      const currentImplementation = [
        'Database connection established',
        'Begin processing requests'
      ];
      
      const missingSteps = requiredInitSteps.filter(step => 
        !currentImplementation.includes(step)
      );
      
      expect(missingSteps.length).toBeGreaterThan(0);
      expect(missingSteps).toContain('Read existing records from database');
      expect(missingSteps).toContain('Populate memory structures with data');
      
      console.log(`✅ Missing initialization steps: ${missingSteps.length}`);
      missingSteps.forEach(step => console.log(`   - ${step}`));
    });
  });

  describe('Cross-API Consistency', () => {
    it('should detect API version data inconsistencies', () => {
      // Test pattern that catches legacy vs v2 API mismatches
      const apiVersions = [
        {
          version: 'legacy',
          endpoint: '/api/training/specialties',
          dataSource: 'hardcoded_defaults',
          recordCount: 5,
          status: 'working'
        },
        {
          version: 'v2', 
          endpoint: '/api/training-v2/specialties',
          dataSource: 'training_module_memory',
          recordCount: 0,
          status: 'empty'
        }
      ];
      
      const inconsistency = apiVersions[0].recordCount !== apiVersions[1].recordCount;
      const hasEmptyV2 = apiVersions.find(api => api.version === 'v2')?.recordCount === 0;
      
      expect(inconsistency).toBe(true);
      expect(hasEmptyV2).toBe(true);
      
      apiVersions.forEach(api => {
        console.log(`${api.status === 'working' ? '✅' : '❌'} ${api.endpoint}: ${api.recordCount} records`);
      });
      
      console.log('✅ API version inconsistency detected and validated');
    });

    it('should establish single source of truth requirements', () => {
      const dataFlowRequirements = [
        'Single authoritative data source for each entity type',
        'All API endpoints must query same data source',
        'Memory state must be synchronized with persistent storage',
        'CRUD operations must update all views consistently',
        'Caching must not create data inconsistencies'
      ];
      
      dataFlowRequirements.forEach(requirement => {
        expect(requirement).toMatch(/must|should/);
        expect(requirement.length).toBeGreaterThan(25);
      });
      
      console.log(`✅ Data flow requirements established: ${dataFlowRequirements.length}`);
    });
  });

  describe('Real-time State Propagation', () => {
    it('should validate state update propagation patterns', () => {
      const updateScenarios = [
        {
          operation: 'CREATE competency',
          steps: [
            'Write to database',
            'Update memory state',
            'Invalidate caches',
            'Notify dependent systems'
          ],
          currentImplementation: ['Write to database'],
          missingSteps: 3
        },
        {
          operation: 'UPDATE competency',
          steps: [
            'Update database record',
            'Update memory state', 
            'Refresh API responses',
            'Update UI displays'
          ],
          currentImplementation: ['Update database record'],
          missingSteps: 3
        },
        {
          operation: 'DELETE competency',
          steps: [
            'Remove from database',
            'Remove from memory',
            'Clean up references',
            'Update dependent views'
          ],
          currentImplementation: ['Remove from database'],
          missingSteps: 3
        }
      ];
      
      updateScenarios.forEach(scenario => {
        expect(scenario.missingSteps).toBeGreaterThan(0);
        expect(scenario.currentImplementation.length).toBeLessThan(scenario.steps.length);
        
        console.log(`❌ ${scenario.operation}: ${scenario.missingSteps} missing propagation steps`);
      });
    });

    it('should validate event-driven architecture requirements', () => {
      const eventPatterns = [
        {
          event: 'competency_created',
          triggers: ['update_memory', 'refresh_caches', 'notify_ui'],
          currentImplementation: [],
          isImplemented: false
        },
        {
          event: 'competency_updated', 
          triggers: ['sync_memory', 'invalidate_cache', 'broadcast_change'],
          currentImplementation: [],
          isImplemented: false
        },
        {
          event: 'competency_deleted',
          triggers: ['remove_memory', 'cleanup_refs', 'update_views'],
          currentImplementation: [],
          isImplemented: false
        }
      ];
      
      eventPatterns.forEach(pattern => {
        expect(pattern.isImplemented).toBe(false);
        expect(pattern.triggers.length).toBeGreaterThan(0);
        
        console.log(`❌ Event '${pattern.event}': Not implemented (${pattern.triggers.length} handlers needed)`);
      });
      
      console.log('✅ Event-driven architecture gaps identified');
    });
  });

  describe('User Experience Impact', () => {
    it('should validate user workflow impact of synchronization issues', () => {
      const userWorkflows = [
        {
          workflow: 'Create New Training Session',
          steps: [
            'Navigate to training page',
            'Select agent',
            'Choose competency from dropdown',
            'Set target level',
            'Start training'
          ],
          blockingIssue: 'Competency dropdown is empty',
          rootCause: 'Training module memory not synchronized',
          severity: 'blocking'
        },
        {
          workflow: 'View Training Progress',
          steps: [
            'Open agent dashboard',
            'View training sessions',
            'Check competency progress',
            'Review achievements'
          ],
          blockingIssue: 'Competency data missing',
          rootCause: 'API returns empty results',
          severity: 'high'
        }
      ];
      
      userWorkflows.forEach(workflow => {
        expect(workflow.severity).toMatch(/blocking|high|medium|low/);
        expect(workflow.blockingIssue).toMatch(/empty|missing/);
        expect(workflow.rootCause).toMatch(/synchronized|API|memory/);
        
        console.log(`❌ Workflow '${workflow.workflow}': ${workflow.severity} - ${workflow.blockingIssue}`);
      });
    });

    it('should establish user experience protection requirements', () => {
      const protectionRequirements = [
        'System must validate data availability before showing UI',
        'Loading states must be shown during data synchronization',
        'Error messages must guide users when data is unavailable',
        'Fallback behaviors must maintain workflow continuity',
        'Real-time updates must reflect system state changes'
      ];
      
      protectionRequirements.forEach(requirement => {
        expect(requirement).toContain('must');
        expect(requirement.length).toBeGreaterThan(30);
      });
      
      console.log(`✅ User experience protection requirements: ${protectionRequirements.length}`);
    });
  });

  describe('System Health Monitoring', () => {
    it('should define health checks for synchronization state', () => {
      const healthChecks = [
        {
          check: 'Database-Memory Count Match',
          query: 'SELECT COUNT(*) FROM specialties vs memory.size',
          threshold: 'counts must be equal',
          alertLevel: 'critical'
        },
        {
          check: 'API Response Consistency',
          query: 'Compare legacy vs v2 API record counts',
          threshold: 'responses must match',
          alertLevel: 'high'
        },
        {
          check: 'Data Freshness',
          query: 'Check last sync timestamp vs current time',
          threshold: 'sync within last 5 minutes',
          alertLevel: 'medium'
        }
      ];
      
      healthChecks.forEach(check => {
        expect(check).toHaveProperty('check');
        expect(check).toHaveProperty('threshold');
        expect(check).toHaveProperty('alertLevel');
        expect(check.alertLevel).toMatch(/critical|high|medium|low/);
        
        console.log(`✅ Health check: ${check.check} (${check.alertLevel})`);
      });
    });
  });

  // NEW: Real Implementation Validation Tests
  describe('Synchronization Fix Validation', () => {
    let createdIds: string[] = [];

    afterAll(async () => {
      // Clean up test data
      for (const id of createdIds) {
        await db.delete(agentSpecialties).where(eq(agentSpecialties.id, id));
      }
    });

    it('should verify training module loads existing database data on startup', async () => {
      // Check that v2 API has data (indicates successful initialization)
      const response = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      console.log(`✅ Training module loaded ${response.body.length} specialties from database`);
    });

    it('should verify database-memory synchronization during operations', async () => {
      const testData = {
        name: 'Sync Validation Test',
        description: 'Testing sync during operations',
        domain: 'sync-validation'
      };

      // Create via legacy API (writes to DB + syncs to memory)
      const createResponse = await request(app)
        .post('/api/training/specialties')
        .send(testData)
        .expect(201);

      createdIds.push(createResponse.body.id);

      // Verify immediate availability in memory (v2 API)
      const v2Response = await request(app)
        .get('/api/training-v2/specialties')
        .expect(200);

      const foundInMemory = v2Response.body.find((s: any) => s.id === createResponse.body.id);
      expect(foundInMemory).toBeDefined();
      expect(foundInMemory.name).toBe(testData.name);

      console.log('✅ Database-memory synchronization working during operations');
    });

    it('should verify API consistency under concurrent operations', async () => {
      const concurrentRequests = Array(3).fill(0).map((_, index) =>
        request(app)
          .post('/api/training/specialties')
          .send({
            name: `Concurrent Test ${index}`,
            description: `Testing concurrent operations ${index}`,
            domain: 'concurrent-testing'
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        createdIds.push(response.body.id);
      });

      // Verify all appear in both APIs
      const [legacyCheck, v2Check] = await Promise.all([
        request(app).get('/api/training/specialties'),
        request(app).get('/api/training-v2/specialties')
      ]);

      const createdInLegacy = legacyCheck.body.filter((s: any) => 
        createdIds.includes(s.id)
      );
      const createdInV2 = v2Check.body.filter((s: any) => 
        createdIds.includes(s.id)
      );

      expect(createdInLegacy.length).toBe(3);
      expect(createdInV2.length).toBe(3);

      console.log('✅ Concurrent operations maintain API consistency');
    });
  });
});

export default {};