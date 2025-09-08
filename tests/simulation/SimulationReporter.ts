/**
 * Simulation Reporter
 * Generates comprehensive reports and analytics for user scenario simulations
 */

import { SimulationResult } from './UserScenarioSimulator';

export interface SimulationSummary {
  totalScenarios: number;
  successfulScenarios: number;
  failedScenarios: number;
  successRate: number;
  totalDuration: number;
  averageDuration: number;
  totalApiCalls: number;
  averageResponseTime: number;
  totalErrors: number;
  scenarioResults: Array<{
    id: string;
    name: string;
    success: boolean;
    duration: number;
    apiCalls: number;
    errors: number;
  }>;
}

export class SimulationReporter {
  private results: SimulationResult[] = [];

  addResult(result: SimulationResult): void {
    this.results.push(result);
  }

  /**
   * Generate comprehensive summary report
   */
  generateSummaryReport(results: SimulationResult[]): SimulationSummary {
    this.results = results;
    
    const summary: SimulationSummary = {
      totalScenarios: results.length,
      successfulScenarios: results.filter(r => r.success).length,
      failedScenarios: results.filter(r => !r.success).length,
      successRate: 0,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      averageDuration: 0,
      totalApiCalls: results.reduce((sum, r) => sum + r.metrics.totalApiCalls, 0),
      averageResponseTime: 0,
      totalErrors: results.reduce((sum, r) => sum + r.metrics.errorsEncountered, 0),
      scenarioResults: []
    };

    // Calculate averages
    if (results.length > 0) {
      summary.successRate = (summary.successfulScenarios / summary.totalScenarios) * 100;
      summary.averageDuration = summary.totalDuration / results.length;
      
      const totalResponseTimes = results.reduce((sum, r) => sum + r.metrics.averageResponseTime, 0);
      summary.averageResponseTime = results.length > 0 ? totalResponseTimes / results.length : 0;
    }

    // Map scenario results
    summary.scenarioResults = results.map(result => ({
      id: result.scenarioId,
      name: this.getScenarioName(result.scenarioId),
      success: result.success,
      duration: result.duration,
      apiCalls: result.metrics.totalApiCalls,
      errors: result.metrics.errorsEncountered
    }));

    this.printSummaryReport(summary);
    return summary;
  }

  /**
   * Print formatted summary report to console
   */
  private printSummaryReport(summary: SimulationSummary): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CBS APEX USER SCENARIO SIMULATION REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📈 OVERALL METRICS:');
    console.log(`   Total Scenarios: ${summary.totalScenarios}`);
    console.log(`   Successful: ${summary.successfulScenarios} (${summary.successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${summary.failedScenarios}`);
    console.log(`   Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`   Average Duration: ${(summary.averageDuration / 1000).toFixed(2)}s`);
    console.log(`   Total API Calls: ${summary.totalApiCalls}`);
    console.log(`   Average Response Time: ${summary.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Total Errors: ${summary.totalErrors}`);

    console.log('\n📋 SCENARIO BREAKDOWN:');
    summary.scenarioResults.forEach((scenario, index) => {
      const status = scenario.success ? '✅' : '❌';
      const duration = (scenario.duration / 1000).toFixed(2);
      console.log(`   ${index + 1}. ${status} ${scenario.name}`);
      console.log(`      Duration: ${duration}s | API Calls: ${scenario.apiCalls} | Errors: ${scenario.errors}`);
    });

    // Performance analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    const avgDurationSec = summary.averageDuration / 1000;
    if (avgDurationSec < 30) {
      console.log('   🟢 Excellent: Average scenario duration under 30s');
    } else if (avgDurationSec < 60) {
      console.log('   🟡 Good: Average scenario duration under 60s');
    } else {
      console.log('   🔴 Attention: Average scenario duration over 60s');
    }

    if (summary.averageResponseTime < 1000) {
      console.log('   🟢 Excellent: Average API response time under 1s');
    } else if (summary.averageResponseTime < 3000) {
      console.log('   🟡 Good: Average API response time under 3s');
    } else {
      console.log('   🔴 Attention: Average API response time over 3s');
    }

    if (summary.successRate >= 90) {
      console.log('   🟢 Excellent: Success rate 90% or higher');
    } else if (summary.successRate >= 75) {
      console.log('   🟡 Good: Success rate 75% or higher');
    } else {
      console.log('   🔴 Attention: Success rate below 75%');
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Generate detailed scenario report
   */
  generateScenarioReport(scenarioId: string): void {
    const result = this.results.find(r => r.scenarioId === scenarioId);
    if (!result) {
      console.log(`No results found for scenario: ${scenarioId}`);
      return;
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`📝 DETAILED REPORT: ${this.getScenarioName(scenarioId)}`);
    console.log('-'.repeat(60));
    
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`API Calls: ${result.metrics.totalApiCalls}`);
    console.log(`Average Response Time: ${result.metrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`Errors: ${result.metrics.errorsEncountered}`);

    console.log('\n🔄 STEP-BY-STEP BREAKDOWN:');
    result.stepResults.forEach((step, index) => {
      const status = step.success ? '✅' : '❌';
      const duration = (step.duration / 1000).toFixed(2);
      console.log(`   ${index + 1}. ${status} ${step.action} (${duration}s)`);
      
      if (!step.success && step.error) {
        console.log(`      Error: ${step.error}`);
      }
    });

    console.log('-'.repeat(60));
  }

  /**
   * Export results to JSON
   */
  exportResults(filename?: string): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummaryReport(this.results),
      detailedResults: this.results
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    
    if (filename) {
      // In a real implementation, you would write to file system
      console.log(`Results would be exported to: ${filename}`);
    }

    return jsonData;
  }

  /**
   * Get human-readable scenario name
   */
  private getScenarioName(scenarioId: string): string {
    const nameMap: Record<string, string> = {
      'agent-creation': 'Agent Creation & Configuration',
      'training-setup': 'Agent Training Setup',
      'ai-meeting-setup': 'Multi-Agent Meeting Setup',
      'document-management': 'Document Library Management',
      'batch-testing': 'Batch Testing & Provider Comparison',
      'cost-tracking': 'Cost Tracking & Analytics',
      'prompt-studio': 'Prompt Studio Workflow'
    };
    return nameMap[scenarioId] || scenarioId;
  }

  /**
   * Clear all stored results
   */
  clear(): void {
    this.results = [];
  }
}