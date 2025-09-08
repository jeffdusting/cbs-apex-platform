#!/usr/bin/env tsx

/**
 * Test Runner Script - Demonstrates Complete Test Execution
 * This script shows how to run the comprehensive test suite
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { getTestEnvironment } from './utils/test-database';
import { TestDataCollections } from './utils/test-factories';

const execAsync = promisify(exec);

class TestRunner {
  private testResults: Array<{
    suite: string;
    passed: boolean;
    duration: number;
    coverage?: number;
    errors?: string[];
  }> = [];

  async runTestSuite(name: string, command: string): Promise<boolean> {
    console.log(`\n🧪 Running ${name}...`);
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command);
      const duration = Date.now() - startTime;

      // Parse Jest output for results
      const passed = !stderr && stdout.includes('Tests:') && !stdout.includes('failed');
      const coverage = this.extractCoverage(stdout);

      this.testResults.push({
        suite: name,
        passed,
        duration,
        coverage,
        errors: stderr ? [stderr] : undefined
      });

      if (passed) {
        console.log(`✅ ${name} passed in ${duration}ms`);
        if (coverage !== undefined) {
          console.log(`📊 Coverage: ${coverage}%`);
        }
      } else {
        console.log(`❌ ${name} failed in ${duration}ms`);
        if (stderr) {
          console.log(`Error: ${stderr.substring(0, 200)}...`);
        }
      }

      return passed;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${name} crashed in ${duration}ms`);
      console.log(`Error: ${error.message}`);

      this.testResults.push({
        suite: name,
        passed: false,
        duration,
        errors: [error.message]
      });

      return false;
    }
  }

  private extractCoverage(output: string): number | undefined {
    const coverageMatch = output.match(/All files.*?(\d+(?:\.\d+)?)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : undefined;
  }

  async demonstrateTestEnvironment(): Promise<void> {
    console.log('\n🔧 Setting up test environment...');

    try {
      // Initialize test environment
      const testEnv = getTestEnvironment();
      await testEnv.setupStandardTestData();

      // Demonstrate test data
      const storage = testEnv.getStorage();
      const providers = await storage.getProviders();
      const agents = await storage.getAgentLibraries();
      
      console.log(`✅ Test environment ready:`);
      console.log(`   - ${providers.length} mock providers`);
      console.log(`   - ${agents.length} test agents`);
      console.log(`   - Mock LLM responses configured`);

      // Demonstrate test data collections
      const workflowData = TestDataCollections.getCompleteWorkflow();
      console.log(`   - Complete workflow test data: ${workflowData.steps.length} steps`);

      const promptData = TestDataCollections.getPromptWorkflow();
      console.log(`   - Prompt workflow test data: ${promptData.responses.length} responses`);

      testEnv.reset();
      console.log(`✅ Environment cleanup completed`);

    } catch (error: any) {
      console.log(`❌ Environment setup failed: ${error.message}`);
    }
  }

  async runFullTestSuite(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite');
    console.log('====================================');

    // Demonstrate test environment setup
    await this.demonstrateTestEnvironment();

    // Run all test suites
    const testSuites = [
      { name: 'Backend API Tests', command: 'jest tests/backend --verbose' },
      { name: 'Frontend Integration Tests', command: 'jest tests/frontend --verbose' },
      { name: 'End-to-End Tests', command: 'jest tests/integration --verbose' }
    ];

    let allPassed = true;

    for (const suite of testSuites) {
      const passed = await this.runTestSuite(suite.name, suite.command);
      allPassed = allPassed && passed;
    }

    // Run coverage report
    console.log('\n📊 Generating coverage report...');
    await this.runTestSuite('Coverage Report', 'jest --coverage --silent');

    // Display summary
    this.displaySummary(allPassed);
  }

  private displaySummary(allPassed: boolean): void {
    console.log('\n📋 Test Summary');
    console.log('===============');

    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const coverage = result.coverage ? ` (${result.coverage}% coverage)` : '';
      console.log(`${status} ${result.suite}: ${result.duration}ms${coverage}`);
      
      if (result.errors) {
        result.errors.forEach(error => {
          console.log(`   ⚠️  ${error.substring(0, 100)}...`);
        });
      }
    });

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    const avgCoverage = this.testResults
      .filter(r => r.coverage !== undefined)
      .reduce((sum, r, _, arr) => sum + (r.coverage! / arr.length), 0);

    console.log('\n📈 Overall Results:');
    console.log(`   Tests: ${passedTests}/${totalTests} passed`);
    console.log(`   Duration: ${totalDuration}ms total`);
    if (avgCoverage > 0) {
      console.log(`   Average Coverage: ${avgCoverage.toFixed(1)}%`);
    }

    if (allPassed) {
      console.log('\n🎉 All tests passed! The application is ready for deployment.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    }
  }

  async demonstrateTestScenarios(): Promise<void> {
    console.log('\n🎭 Test Scenario Demonstrations');
    console.log('==============================');

    const scenarios = [
      {
        name: 'Prompt Studio Workflow',
        description: 'User creates prompt → selects providers → receives responses'
      },
      {
        name: 'AI Meeting Execution',
        description: 'Configure agents → run meeting → generate synthesis → save experience'
      },
      {
        name: 'Agent Library Management',
        description: 'Create agent → use in meeting → track experience → reuse'
      },
      {
        name: 'Document Context Injection',
        description: 'Upload documents → select for context → enhanced AI responses'
      },
      {
        name: 'Batch Testing Workflow',
        description: 'Multiple prompts → all providers → comparative analysis'
      },
      {
        name: 'Error Handling & Recovery',
        description: 'Network failures → timeouts → graceful degradation'
      }
    ];

    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   ${scenario.description}`);
    });

    console.log('\n💡 These scenarios are covered by the integration tests');
    console.log('   Run: npm run test:e2e to execute them');
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();

  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--demo')) {
    await runner.demonstrateTestScenarios();
  } else if (args.includes('--env')) {
    await runner.demonstrateTestEnvironment();
  } else {
    await runner.runFullTestSuite();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TestRunner };