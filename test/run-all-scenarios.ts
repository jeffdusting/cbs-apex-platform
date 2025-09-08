// Run all scenarios and identify issues
import { CBSTestSimulator } from './simulator';
import { userScenarios } from './scenarios';

async function runAllScenarios() {
  console.log('🚀 Running all scenarios to identify issues...\n');
  
  const simulator = new CBSTestSimulator('http://localhost:5000');
  const results = await simulator.runAllScenarios(userScenarios);
  
  // Analyze results
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  console.log(`\n📊 SUMMARY`);
  console.log(`=========`);
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed/results.length)*100).toFixed(1)}%`);
  
  // Group failures by type
  const failuresByType = new Map<string, string[]>();
  
  results.filter(r => !r.passed).forEach(result => {
    result.errors.forEach(error => {
      const errorType = categorizeError(error);
      if (!failuresByType.has(errorType)) {
        failuresByType.set(errorType, []);
      }
      failuresByType.get(errorType)!.push(`${result.scenarioId}: ${error}`);
    });
  });
  
  console.log(`\n🐛 ERROR CATEGORIES`);
  console.log(`=================`);
  
  failuresByType.forEach((errors, category) => {
    console.log(`\n${category} (${errors.length} errors):`);
    errors.slice(0, 3).forEach(error => console.log(`  - ${error}`)); // Show first 3
    if (errors.length > 3) {
      console.log(`  ... and ${errors.length - 3} more`);
    }
  });
  
  return results;
}

function categorizeError(error: string): string {
  if (error.includes('Element does not exist') || error.includes('Element not found')) {
    return '❌ Missing UI Elements';
  }
  if (error.includes('Backend calls mismatch')) {
    return '🔌 Backend API Issues';
  }
  if (error.includes('Network error') || error.includes('fetch')) {
    return '🌐 Network Errors';
  }
  if (error.includes('File') || error.includes('upload')) {
    return '📁 File Upload Issues';
  }
  if (error.includes('timeout') || error.includes('within')) {
    return '⏱️ Timeout Issues';
  }
  return '❓ Other Issues';
}

// Run the analysis
runAllScenarios().catch(console.error);