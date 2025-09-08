#!/usr/bin/env tsx
// CBS LLM Studio Test Runner
import { CBSTestSimulator, SimulationResult } from './simulator';
import { userScenarios } from './scenarios';
import { promises as fs } from 'fs';
import * as path from 'path';

interface TestRunOptions {
  baseUrl?: string;
  scenarios?: string[]; // Run specific scenarios by ID
  iterations?: number; // Run multiple iterations to test consistency
  generateReport?: boolean;
  verbose?: boolean;
}

async function main() {
  const options: TestRunOptions = {
    baseUrl: 'http://localhost:5000',
    iterations: 1,
    generateReport: true,
    verbose: true
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        options.baseUrl = args[++i];
        break;
      case '--scenarios':
        options.scenarios = args[++i].split(',');
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i]) || 1;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--quiet':
        options.verbose = false;
        break;
    }
  }

  console.log('🎯 CBS LLM Studio Test Suite');
  console.log('==============================');
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Iterations: ${options.iterations}`);
  
  const simulator = new CBSTestSimulator(options.baseUrl);
  
  // Filter scenarios if specified
  const scenariosToRun = options.scenarios 
    ? userScenarios.filter(s => options.scenarios!.includes(s.id))
    : userScenarios;

  console.log(`Running ${scenariosToRun.length} scenarios...\n`);

  const allResults: SimulationResult[][] = [];
  
  // Run multiple iterations if specified
  for (let iteration = 1; iteration <= (options.iterations || 1); iteration++) {
    if ((options.iterations || 1) > 1) {
      console.log(`\n📋 Iteration ${iteration}/${options.iterations || 1}`);
      console.log('─'.repeat(40));
    }

    const results = await simulator.runAllScenarios(scenariosToRun);
    allResults.push(results);

    // Wait between iterations
    if (iteration < (options.iterations || 1)) {
      console.log('\n⏱️  Waiting 2 seconds before next iteration...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Analyze results across iterations
  const finalAnalysis = analyzeIterations(allResults);
  
  console.log('\n📊 Final Analysis');
  console.log('==================');
  console.log(`Overall Pass Rate: ${finalAnalysis.overallPassRate}%`);
  console.log(`Consistent Scenarios: ${finalAnalysis.consistentScenarios}/${scenariosToRun.length}`);
  
  if (finalAnalysis.flakyScenarios.length > 0) {
    console.log(`\n⚠️  Flaky Scenarios (inconsistent results):`);
    finalAnalysis.flakyScenarios.forEach(scenarioId => {
      console.log(`   - ${scenarioId}`);
    });
  }

  if (finalAnalysis.alwaysFailingScenarios.length > 0) {
    console.log(`\n💥 Always Failing Scenarios:`);
    finalAnalysis.alwaysFailingScenarios.forEach(scenarioId => {
      const scenario = scenariosToRun.find(s => s.id === scenarioId);
      console.log(`   - ${scenarioId}: ${scenario?.name}`);
    });
  }

  // Generate report if requested
  if (options.generateReport) {
    const report = generateComprehensiveReport(allResults, scenariosToRun, finalAnalysis);
    const reportPath = path.join(__dirname, '..', 'test-results', `report-${Date.now()}.md`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, report);
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }

  // Exit with error code if there are failing scenarios
  const hasFailures = finalAnalysis.alwaysFailingScenarios.length > 0 || 
                      finalAnalysis.flakyScenarios.length > 0;
  
  process.exit(hasFailures ? 1 : 0);
}

interface IterationAnalysis {
  overallPassRate: number;
  consistentScenarios: number;
  flakyScenarios: string[];
  alwaysFailingScenarios: string[];
  scenarioStats: Map<string, { passCount: number; failCount: number; errors: Set<string> }>;
}

function analyzeIterations(allResults: SimulationResult[][]): IterationAnalysis {
  if (allResults.length === 0) {
    return {
      overallPassRate: 0,
      consistentScenarios: 0,
      flakyScenarios: [],
      alwaysFailingScenarios: [],
      scenarioStats: new Map()
    };
  }

  const scenarioStats = new Map<string, { passCount: number; failCount: number; errors: Set<string> }>();
  
  // Collect stats across all iterations
  allResults.forEach(iterationResults => {
    iterationResults.forEach(result => {
      if (!scenarioStats.has(result.scenarioId)) {
        scenarioStats.set(result.scenarioId, { passCount: 0, failCount: 0, errors: new Set() });
      }
      
      const stats = scenarioStats.get(result.scenarioId)!;
      if (result.passed) {
        stats.passCount++;
      } else {
        stats.failCount++;
        result.errors.forEach(error => stats.errors.add(error));
      }
    });
  });

  const totalIterations = allResults.length;
  const flakyScenarios: string[] = [];
  const alwaysFailingScenarios: string[] = [];
  let consistentScenarios = 0;
  let totalPasses = 0;
  let totalRuns = 0;

  scenarioStats.forEach((stats, scenarioId) => {
    totalPasses += stats.passCount;
    totalRuns += stats.passCount + stats.failCount;

    if (stats.passCount === totalIterations) {
      // Always passes
      consistentScenarios++;
    } else if (stats.failCount === totalIterations) {
      // Always fails
      alwaysFailingScenarios.push(scenarioId);
    } else {
      // Inconsistent (flaky)
      flakyScenarios.push(scenarioId);
    }
  });

  return {
    overallPassRate: totalRuns > 0 ? Math.round((totalPasses / totalRuns) * 100) : 0,
    consistentScenarios,
    flakyScenarios,
    alwaysFailingScenarios,
    scenarioStats
  };
}

function generateComprehensiveReport(
  allResults: SimulationResult[][],
  scenarios: typeof userScenarios,
  analysis: IterationAnalysis
): string {
  const timestamp = new Date().toISOString();
  
  let report = `# CBS LLM Studio Comprehensive Test Report

**Generated**: ${timestamp}  
**Iterations**: ${allResults.length}  
**Total Scenarios**: ${scenarios.length}  
**Overall Pass Rate**: ${analysis.overallPassRate}%

## Executive Summary

`;

  if (analysis.alwaysFailingScenarios.length === 0 && analysis.flakyScenarios.length === 0) {
    report += `✅ **All scenarios are passing consistently!** The application is functioning correctly across all tested user workflows.\n\n`;
  } else {
    report += `⚠️ **Issues Found**: ${analysis.alwaysFailingScenarios.length} always-failing scenarios, ${analysis.flakyScenarios.length} flaky scenarios.\n\n`;
  }

  // Detailed scenario analysis
  report += `## Scenario Analysis\n\n`;

  scenarios.forEach(scenario => {
    const stats = analysis.scenarioStats.get(scenario.id);
    if (!stats) return;

    const passRate = Math.round((stats.passCount / (stats.passCount + stats.failCount)) * 100);
    let status = '';
    
    if (stats.failCount === 0) {
      status = '✅ CONSISTENT PASS';
    } else if (stats.passCount === 0) {
      status = '❌ ALWAYS FAILS';
    } else {
      status = '⚠️ FLAKY';
    }

    report += `### ${status} ${scenario.id} - ${scenario.name}\n`;
    report += `**Pass Rate**: ${passRate}% (${stats.passCount}/${stats.passCount + stats.failCount})\n`;
    report += `**Description**: ${scenario.description}\n`;

    if (stats.errors.size > 0) {
      report += `**Common Errors**:\n`;
      Array.from(stats.errors).forEach(error => {
        report += `- ${error}\n`;
      });
    }

    report += '\n';
  });

  // Backend API Coverage
  report += `## Backend API Coverage\n\n`;
  const allExpectedCalls = new Set<string>();
  scenarios.forEach(scenario => {
    scenario.expectedBackendCalls.forEach(call => allExpectedCalls.add(call));
  });

  report += `**Total API Endpoints Expected**: ${allExpectedCalls.size}\n`;
  report += `**Endpoints Called**:\n`;
  Array.from(allExpectedCalls).sort().forEach(endpoint => {
    report += `- ${endpoint}\n`;
  });

  // Recommendations
  report += `\n## Recommendations\n\n`;

  if (analysis.alwaysFailingScenarios.length > 0) {
    report += `### Critical Issues (Always Failing)\n`;
    analysis.alwaysFailingScenarios.forEach(scenarioId => {
      const scenario = scenarios.find(s => s.id === scenarioId);
      const stats = analysis.scenarioStats.get(scenarioId);
      report += `- **${scenarioId}**: ${scenario?.name}\n`;
      if (stats?.errors.size) {
        report += `  - Errors: ${Array.from(stats.errors).join(', ')}\n`;
      }
    });
    report += '\n';
  }

  if (analysis.flakyScenarios.length > 0) {
    report += `### Stability Issues (Flaky)\n`;
    analysis.flakyScenarios.forEach(scenarioId => {
      const scenario = scenarios.find(s => s.id === scenarioId);
      const stats = analysis.scenarioStats.get(scenarioId);
      report += `- **${scenarioId}**: ${scenario?.name} (${stats?.passCount}/${stats?.passCount! + stats?.failCount!} pass rate)\n`;
    });
    report += '\n';
  }

  if (analysis.overallPassRate < 100) {
    report += `### Next Steps\n`;
    report += `1. Fix critical issues that always fail\n`;
    report += `2. Investigate and stabilize flaky scenarios\n`;
    report += `3. Re-run tests to verify fixes\n`;
    report += `4. Consider adding more error handling and validation\n\n`;
  }

  return report;
}

// Run the tests
main().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});