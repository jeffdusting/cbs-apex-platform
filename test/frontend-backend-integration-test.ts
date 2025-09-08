// Frontend-Backend Integration Test
// Designed to catch TypeScript compilation and data flow issues
// that mock-heavy tests miss

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface IntegrationTestResult {
  testId: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  error?: string;
  details?: any;
  duration: number;
}

export class FrontendBackendIntegrationTest {
  private baseUrl = 'http://localhost:5000';
  private testResults: IntegrationTestResult[] = [];

  async runTest(testId: string, name: string, testFn: () => Promise<any>): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      const testResult: IntegrationTestResult = {
        testId,
        name,
        status: 'PASS',
        details: result,
        duration
      };
      
      this.testResults.push(testResult);
      console.log(`✅ ${testId}: ${name} - PASSED (${duration}ms)`);
      return testResult;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const testResult: IntegrationTestResult = {
        testId,
        name,
        status: error.message.includes('Expected') ? 'FAIL' : 'ERROR',
        error: error.message,
        duration
      };
      
      this.testResults.push(testResult);
      console.log(`❌ ${testId}: ${name} - ${testResult.status} (${duration}ms): ${error.message}`);
      return testResult;
    }
  }

  // ===== TYPESCRIPT COMPILATION VALIDATION =====
  
  async testTypeScriptCompilation(): Promise<IntegrationTestResult> {
    return this.runTest('INT001', 'TypeScript Compilation - Frontend Code', async () => {
      try {
        // Check if frontend TypeScript compiles without errors
        const { stdout, stderr } = await execAsync('npx tsc --noEmit --project ../tsconfig.json');
        
        if (stderr && stderr.includes('error TS')) {
          throw new Error(`TypeScript compilation errors: ${stderr}`);
        }
        
        return { 
          compiled: true, 
          output: stdout || 'No compilation errors',
          compilerUsed: 'tsc'
        };
      } catch (error: any) {
        throw new Error(`TypeScript compilation failed: ${error.message}`);
      }
    });
  }

  async testLSPDiagnostics(): Promise<IntegrationTestResult> {
    return this.runTest('INT002', 'LSP Diagnostics - Type Errors Detection', async () => {
      // Check for critical TypeScript files that should have no errors
      const criticalFiles = [
        'client/src/pages/agent-library.tsx',
        'client/src/pages/agent-training.tsx', 
        'client/src/pages/prompt-studio.tsx'
      ];
      
      const errors: string[] = [];
      
      for (const file of criticalFiles) {
        try {
          if (fs.existsSync(file)) {
            // Simple check for common TypeScript error patterns
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for common problematic patterns
            const problematicPatterns = [
              /:\s*any\[\]/g,                    // any[] arrays (type safety issue)
              /as\s+any/g,                       // 'as any' casting (type safety issue)
              /\.map\(\s*\([^)]*\)\s*=>/g,       // .map without proper typing
              /\?\.\w+\.\w+\?/g,                 // inconsistent null checking
            ];
            
            problematicPatterns.forEach((pattern, index) => {
              const matches = content.match(pattern);
              if (matches && matches.length > 3) { // Allow some flexibility
                errors.push(`${file}: Found ${matches.length} instances of potentially problematic pattern ${index + 1}`);
              }
            });
          }
        } catch (error: any) {
          errors.push(`${file}: Error reading file - ${error.message}`);
        }
      }
      
      if (errors.length > 0) {
        throw new Error(`Type safety issues found:\n${errors.join('\n')}`);
      }
      
      return { 
        filesChecked: criticalFiles.length,
        typeSafetyIssues: 0,
        status: 'Clean'
      };
    });
  }

  // ===== SCHEMA-FRONTEND COMPATIBILITY =====
  
  async testSchemaFrontendAlignment(): Promise<IntegrationTestResult> {
    return this.runTest('INT003', 'Schema-Frontend Type Alignment', async () => {
      // Test that frontend can handle actual API response structure
      const testEndpoints = [
        { path: '/api/agent-library', entity: 'agent' },
        { path: '/api/training/specialties', entity: 'specialty' },
        { path: '/api/providers', entity: 'provider' }
      ];
      
      const alignmentIssues: string[] = [];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint.path}`);
          
          if (!response.ok) {
            alignmentIssues.push(`${endpoint.path}: API returned ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          
          if (!Array.isArray(data)) {
            alignmentIssues.push(`${endpoint.path}: Expected array, got ${typeof data}`);
            continue;
          }
          
          if (data.length > 0) {
            const firstItem = data[0];
            
            // Check for required fields based on entity type
            const requiredFields: Record<string, string[]> = {
              agent: ['id', 'name', 'createdAt'],
              specialty: ['id', 'name', 'domain'],
              provider: ['id', 'name', 'model']
            };
            
            const required = requiredFields[endpoint.entity] || [];
            const missing = required.filter(field => !(field in firstItem));
            
            if (missing.length > 0) {
              alignmentIssues.push(`${endpoint.path}: Missing required fields: ${missing.join(', ')}`);
            }
            
            // Check for unexpected null values in critical fields
            if (endpoint.entity === 'agent' && firstItem.experience === undefined) {
              alignmentIssues.push(`${endpoint.path}: Agent missing experience field structure`);
            }
          }
        } catch (error: any) {
          alignmentIssues.push(`${endpoint.path}: ${error.message}`);
        }
      }
      
      if (alignmentIssues.length > 0) {
        throw new Error(`Schema alignment issues:\n${alignmentIssues.join('\n')}`);
      }
      
      return {
        endpointsChecked: testEndpoints.length,
        alignmentIssues: 0,
        status: 'Aligned'
      };
    });
  }

  // ===== REAL DATA FLOW TESTING =====
  
  async testRealDataFlowAgentCreation(): Promise<IntegrationTestResult> {
    return this.runTest('INT004', 'Real Data Flow - Agent Creation E2E', async () => {
      // Create agent using actual API (not mocked)
      const agentData = {
        name: 'Integration Test Agent',
        description: 'Test agent for data flow validation',
        primaryPersonality: 'Analytical',
        secondaryPersonality: 'Practical',
        isDevilsAdvocate: false,
        supplementalPrompt: 'Test prompt for integration',
        preferredProviderId: 'openai-gpt5'
      };
      
      // Step 1: Create agent
      const createResponse = await fetch(`${this.baseUrl}/api/agent-library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Agent creation failed: ${createResponse.status} - ${errorText}`);
      }
      
      const createdAgent = await createResponse.json() as any;
      
      // Step 2: Verify created agent has proper structure
      const requiredFields = ['id', 'name', 'createdAt', 'experience'];
      const missingFields = requiredFields.filter(field => !(field in createdAgent));
      
      if (missingFields.length > 0) {
        throw new Error(`Created agent missing fields: ${missingFields.join(', ')}`);
      }
      
      // Step 3: Verify experience object structure
      if (!createdAgent.experience || typeof createdAgent.experience !== 'object') {
        throw new Error('Created agent missing or invalid experience object');
      }
      
      const experienceRequired = ['meetingsParticipated', 'topicsExplored', 'keyInsights', 'collaborationHistory'];
      const experienceMissing = experienceRequired.filter(field => !(field in createdAgent.experience));
      
      if (experienceMissing.length > 0) {
        throw new Error(`Agent experience missing fields: ${experienceMissing.join(', ')}`);
      }
      
      // Step 4: Fetch agent back from API
      const fetchResponse = await fetch(`${this.baseUrl}/api/agent-library/${createdAgent.id}`);
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch created agent: ${fetchResponse.status}`);
      }
      
      const fetchedAgent = await fetchResponse.json() as any;
      
      // Step 5: Verify data consistency
      if (fetchedAgent.name !== agentData.name) {
        throw new Error(`Data inconsistency: expected name '${agentData.name}', got '${fetchedAgent.name}'`);
      }
      
      // Step 6: Clean up - delete test agent
      const deleteResponse = await fetch(`${this.baseUrl}/api/agent-library/${createdAgent.id}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        console.warn(`Warning: Failed to cleanup test agent ${createdAgent.id}`);
      }
      
      return {
        agentCreated: createdAgent.id,
        dataFlowValidated: true,
        fieldsVerified: requiredFields.length + experienceRequired.length,
        cleanedUp: deleteResponse.ok
      };
    });
  }

  // ===== BROWSER RUNTIME ERROR DETECTION =====
  
  async testBrowserErrorDetection(): Promise<IntegrationTestResult> {
    return this.runTest('INT005', 'Browser Runtime Error Detection', async () => {
      // Test for common runtime errors that prevent form submission
      const testCases = [
        {
          name: 'Valid Agent Data',
          data: {
            name: 'Runtime Test Agent',
            primaryPersonality: 'Analytical',
            description: 'Test description'
          },
          shouldSucceed: true
        },
        {
          name: 'Missing Required Field',
          data: {
            description: 'Missing name field'
          },
          shouldSucceed: false
        },
        {
          name: 'Invalid Personality',
          data: {
            name: 'Invalid Personality Test',
            primaryPersonality: 'NonExistentPersonality'
          },
          shouldSucceed: false
        }
      ];
      
      const results: any[] = [];
      
      for (const testCase of testCases) {
        try {
          const response = await fetch(`${this.baseUrl}/api/agent-library`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testCase.data)
          });
          
          const success = response.ok;
          const expectedSuccess = testCase.shouldSucceed;
          
          if (success !== expectedSuccess) {
            throw new Error(`${testCase.name}: Expected ${expectedSuccess ? 'success' : 'failure'}, got ${success ? 'success' : 'failure'}`);
          }
          
          results.push({
            testCase: testCase.name,
            expected: expectedSuccess,
            actual: success,
            status: 'PASS'
          });
          
          // Clean up successful creations
          if (success && response.ok) {
            const created = await response.json() as any;
            await fetch(`${this.baseUrl}/api/agent-library/${created.id}`, { method: 'DELETE' });
          }
          
        } catch (error: any) {
          results.push({
            testCase: testCase.name,
            error: error.message,
            status: 'ERROR'
          });
        }
      }
      
      const failed = results.filter(r => r.status !== 'PASS');
      if (failed.length > 0) {
        throw new Error(`Runtime validation failures:\n${failed.map(f => `${f.testCase}: ${f.error || 'Unexpected result'}`).join('\n')}`);
      }
      
      return {
        testCasesRun: testCases.length,
        validationResults: results,
        runtimeErrorsDetected: 0
      };
    });
  }

  // ===== RUN ALL INTEGRATION TESTS =====
  
  async runAllTests(): Promise<void> {
    console.log('🔧 Starting Frontend-Backend Integration Tests...\n');
    
    const tests = [
      () => this.testTypeScriptCompilation(),
      () => this.testLSPDiagnostics(), 
      () => this.testSchemaFrontendAlignment(),
      () => this.testRealDataFlowAgentCreation(),
      () => this.testBrowserErrorDetection()
    ];
    
    for (const test of tests) {
      await test();
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
    }
    
    this.printSummary();
  }
  
  private printSummary(): void {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    
    console.log('\n📊 Integration Test Summary:');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🚨 Errors: ${errors}`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (failed > 0 || errors > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status !== 'PASS')
        .forEach(r => console.log(`  ${r.testId}: ${r.name} - ${r.error}`));
    }
  }

  getResults(): IntegrationTestResult[] {
    return this.testResults;
  }
}

// Export for use in other test files
export default FrontendBackendIntegrationTest;

// Main execution function
async function main() {
  const integrationTest = new FrontendBackendIntegrationTest();
  await integrationTest.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}