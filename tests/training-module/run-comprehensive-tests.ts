#!/usr/bin/env tsx

/**
 * Comprehensive Training Module Test Runner
 * 
 * Executes all training module tests including:
 * - Backend E2E workflow tests
 * - Frontend component tests
 * - Integration tests
 * - Regression tests
 * - Performance tests
 * 
 * Provides detailed reporting and analysis of test results.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface TestResult {
  suite: string;
  passed: boolean;
  tests: number;
  failures: number;
  duration: number;
  output: string;
  errors: string[];
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
  suites: TestResult[];
  criticalFailures: string[];
  recommendations: string[];
}

class ComprehensiveTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<TestReport> {
    console.log('🧪 Starting Comprehensive Training Module Test Suite\n');
    this.startTime = Date.now();

    const testSuites = [
      {
        name: 'Regression Tests',
        command: 'npx',
        args: ['jest', 'tests/training-module/training-module-regression.test.ts'],
        critical: true
      },
      {
        name: 'Performance Tests',
        command: 'npx',
        args: ['jest', 'tests/training-module/training-module-performance.test.ts'],
        critical: false
      },
      {
        name: 'Integration Tests',
        command: 'npx',
        args: ['jest', 'tests/training-module/training-module-integration.test.ts'],
        critical: true
      },
      {
        name: 'Backend E2E Tests',
        command: 'npx',
        args: ['jest', 'tests/training-module/backend-e2e-workflow.test.ts'],
        critical: true
      },
      {
        name: 'Frontend Component Tests',
        command: 'npx',
        args: ['jest', 'tests/frontend/training-components.test.tsx'],
        critical: true
      },
      {
        name: 'Frontend-Backend Integration',
        command: 'npx',
        args: ['jest', 'tests/integration/frontend-backend-training.test.ts'],
        critical: true
      }
    ];

    // Run each test suite
    for (const suite of testSuites) {
      console.log(`\n📋 Running ${suite.name}...`);
      const result = await this.runTestSuite(suite.name, suite.command, suite.args);
      this.results.push(result);
      
      if (result.passed) {
        console.log(`✅ ${suite.name} passed (${result.tests} tests, ${result.duration}ms)`);
      } else {
        console.log(`❌ ${suite.name} failed (${result.failures}/${result.tests} failed, ${result.duration}ms)`);
        if (suite.critical) {
          console.log(`🚨 CRITICAL FAILURE in ${suite.name}`);
        }
      }
    }

    // Generate and save report
    const report = this.generateReport();
    await this.saveReport(report);
    this.printSummary(report);

    return report;
  }

  private async runTestSuite(name: string, command: string, args: string[]): Promise<TestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = '';
      let errorOutput = '';

      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        const fullOutput = output + errorOutput;
        
        // Parse Jest output to extract test information
        const testInfo = this.parseJestOutput(fullOutput);
        
        resolve({
          suite: name,
          passed: code === 0,
          tests: testInfo.tests,
          failures: testInfo.failures,
          duration: duration,
          output: fullOutput,
          errors: testInfo.errors
        });
      });

      process.on('error', (error) => {
        resolve({
          suite: name,
          passed: false,
          tests: 0,
          failures: 1,
          duration: Date.now() - startTime,
          output: '',
          errors: [error.message]
        });
      });
    });
  }

  private parseJestOutput(output: string): { tests: number; failures: number; errors: string[] } {
    const errors: string[] = [];
    
    // Extract test counts from Jest output
    let tests = 0;
    let failures = 0;

    // Look for Jest summary lines
    const summaryMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (summaryMatch) {
      failures = parseInt(summaryMatch[1]);
      const passed = parseInt(summaryMatch[2]);
      tests = parseInt(summaryMatch[3]);
    } else {
      // Try alternative Jest output format
      const passedMatch = output.match(/(\d+)\s+passing/);
      const failedMatch = output.match(/(\d+)\s+failing/);
      
      if (passedMatch) tests += parseInt(passedMatch[1]);
      if (failedMatch) {
        failures = parseInt(failedMatch[1]);
        tests += failures;
      }
    }

    // Extract error messages
    const errorMatches = output.match(/Error:.*$/gm);
    if (errorMatches) {
      errors.push(...errorMatches);
    }

    // Extract failed test names
    const failedTestMatches = output.match(/✕.*$/gm);
    if (failedTestMatches) {
      errors.push(...failedTestMatches);
    }

    return { tests, failures, errors };
  }

  private generateReport(): TestReport {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, result) => sum + result.tests, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failures, 0);
    const totalPassed = totalTests - totalFailed;

    const criticalFailures: string[] = [];
    const recommendations: string[] = [];

    // Analyze results for critical failures and recommendations
    for (const result of this.results) {
      if (!result.passed) {
        if (result.suite.includes('Regression') || result.suite.includes('Integration')) {
          criticalFailures.push(`CRITICAL: ${result.suite} failed - may break existing functionality`);
        }
        
        if (result.failures > 0) {
          recommendations.push(`Review and fix ${result.failures} failing tests in ${result.suite}`);
        }
      }

      // Performance recommendations
      if (result.suite.includes('Performance') && result.duration > 30000) {
        recommendations.push(`Performance tests took ${result.duration}ms - consider optimization`);
      }

      // Coverage recommendations
      if (result.tests === 0) {
        recommendations.push(`No tests found for ${result.suite} - verify test files exist`);
      }
    }

    // General recommendations
    if (totalFailed === 0) {
      recommendations.push('All tests passed! Training module is ready for deployment.');
    } else if (criticalFailures.length === 0) {
      recommendations.push('Non-critical test failures detected. Review and fix before next release.');
    } else {
      recommendations.push('CRITICAL failures detected. Do not deploy until resolved.');
    }

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      totalPassed,
      totalFailed,
      totalDuration,
      suites: this.results,
      criticalFailures,
      recommendations
    };
  }

  private async saveReport(report: TestReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'tests/training-module/test-reports');
    
    try {
      await fs.mkdir(reportPath, { recursive: true });
      
      const filename = `training-test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filePath = path.join(reportPath, filename);
      
      await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Test report saved to: ${filePath}`);
      
      // Also save a latest report
      const latestPath = path.join(reportPath, 'latest-report.json');
      await fs.writeFile(latestPath, JSON.stringify(report, null, 2));
      
    } catch (error) {
      console.error('Failed to save test report:', error);
    }
  }

  private printSummary(report: TestReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TRAINING MODULE TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Overall Results:`);
    console.log(`   Total Tests: ${report.totalTests}`);
    console.log(`   Passed: ${report.totalPassed} (${((report.totalPassed / report.totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${report.totalFailed} (${((report.totalFailed / report.totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Duration: ${(report.totalDuration / 1000).toFixed(2)}s`);

    console.log(`\n📋 Suite Breakdown:`);
    for (const suite of report.suites) {
      const status = suite.passed ? '✅' : '❌';
      const passRate = suite.tests > 0 ? ((suite.tests - suite.failures) / suite.tests * 100).toFixed(1) : '0.0';
      console.log(`   ${status} ${suite.suite}: ${suite.tests - suite.failures}/${suite.tests} (${passRate}%) - ${suite.duration}ms`);
    }

    if (report.criticalFailures.length > 0) {
      console.log(`\n🚨 Critical Failures:`);
      for (const failure of report.criticalFailures) {
        console.log(`   • ${failure}`);
      }
    }

    console.log(`\n💡 Recommendations:`);
    for (const recommendation of report.recommendations) {
      console.log(`   • ${recommendation}`);
    }

    console.log(`\n🎯 Status: ${report.totalFailed === 0 ? '✅ ALL TESTS PASSED' : report.criticalFailures.length > 0 ? '🚨 CRITICAL FAILURES' : '⚠️  MINOR FAILURES'}`);
    console.log('='.repeat(60));
  }
}

// Run the comprehensive test suite
async function main() {
  const runner = new ComprehensiveTestRunner();
  
  try {
    const report = await runner.runAllTests();
    
    // Exit with appropriate code
    const exitCode = report.criticalFailures.length > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Test run interrupted by user');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Test run terminated');
  process.exit(143);
});

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ComprehensiveTestRunner, type TestReport };