/**
 * Training Module Regression Test Runner
 * 
 * Comprehensive test runner for the training module regression suite.
 * Run this script to verify that training module changes don't break other parts of the app.
 */

import { execSync } from 'child_process';
import path from 'path';

interface TestSuite {
  name: string;
  file: string;
  description: string;
  critical: boolean;
}

const testSuites: TestSuite[] = [
  {
    name: 'Core Functionality',
    file: 'training-module-regression.test.ts',
    description: 'Tests isolated training module functionality and basic integration',
    critical: true
  },
  {
    name: 'Performance',
    file: 'training-module-performance.test.ts',
    description: 'Verifies performance characteristics and resource usage',
    critical: true
  },
  {
    name: 'Integration',
    file: 'training-module-integration.test.ts',
    description: 'Ensures no adverse impacts on other application components',
    critical: true
  }
];

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
}

class TrainingRegressionTestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Training Module Regression Test Suite');
    console.log('=' .repeat(60));
    console.log('');

    console.log('📋 Test Suites to Execute:');
    testSuites.forEach((suite, index) => {
      const criticality = suite.critical ? '[CRITICAL]' : '[OPTIONAL]';
      console.log(`  ${index + 1}. ${suite.name} ${criticality}`);
      console.log(`     ${suite.description}`);
    });
    console.log('');

    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    this.generateReport();
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`🔄 Running: ${suite.name}`);
    console.log(`   File: ${suite.file}`);
    
    const startTime = Date.now();
    
    try {
      const testPath = path.join(__dirname, suite.file);
      const output = execSync(`npx jest ${testPath} --verbose`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        timeout: 300000 // 5 minutes timeout
      });

      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: true,
        duration,
        output
      });

      console.log(`   ✅ PASSED (${duration}ms)`);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        suite: suite.name,
        passed: false,
        duration,
        output: error.stdout || '',
        error: error.stderr || error.message
      });

      console.log(`   ❌ FAILED (${duration}ms)`);
      if (suite.critical) {
        console.log(`   ⚠️  CRITICAL TEST FAILURE - This may indicate breaking changes`);
      }
    }
    
    console.log('');
  }

  private generateReport(): void {
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    console.log('');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`📈 Overall Results:`);
    console.log(`   Total Suites: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    console.log('');

    // Detailed results
    console.log(`📋 Detailed Results:`);
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `(${result.duration}ms)`;
      console.log(`   ${index + 1}. ${result.suite}: ${status} ${duration}`);
      
      if (!result.passed && result.error) {
        console.log(`      Error: ${result.error.split('\n')[0]}`);
      }
    });
    console.log('');

    // Critical failures
    const criticalFailures = this.results.filter(r => !r.passed && 
      testSuites.find(s => s.name === r.suite)?.critical
    );

    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL FAILURES DETECTED:');
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.suite}`);
        if (failure.error) {
          console.log(`     ${failure.error.split('\n')[0]}`);
        }
      });
      console.log('');
      console.log('⚠️  These failures indicate potential breaking changes to the training module.');
      console.log('   Please review and fix before deploying changes.');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    
    if (failedTests === 0) {
      console.log('   ✅ All tests passed! The training module changes appear safe.');
      console.log('   ✅ No adverse impacts detected on other application components.');
    } else {
      console.log(`   ⚠️  ${failedTests} test suite(s) failed. Review the failures above.`);
      
      if (criticalFailures.length > 0) {
        console.log('   🚨 Critical failures detected - do not deploy until resolved.');
      } else {
        console.log('   ℹ️  Non-critical failures detected - review and fix when possible.');
      }
    }

    console.log('');
    console.log('🔍 For detailed test output, check the individual test logs above.');
    console.log('📖 For test documentation, see: docs/TrainingModuleArchitecture.md');
    console.log('');

    // Set exit code based on critical failures
    if (criticalFailures.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Main execution
async function main() {
  const runner = new TrainingRegressionTestRunner();
  
  try {
    await runner.runAllTests();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { TrainingRegressionTestRunner };