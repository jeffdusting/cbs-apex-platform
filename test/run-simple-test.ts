// Simple test to verify the simulator works
import { CBSTestSimulator } from './simulator';

const testScenarios = [
  {
    id: 'TEST001',
    name: 'Basic Navigation Test',
    description: 'Test basic navigation to prompt studio',
    steps: [
      { action: 'navigate' as const, target: '/prompt-studio' },
      { action: 'verify' as const, target: 'textarea[data-testid="input-prompt"]', condition: 'exists' as const }
    ],
    expectedBackendCalls: []
  }
];

async function runSimpleTest() {
  console.log('🧪 Running simple test...');
  
  const simulator = new CBSTestSimulator('http://localhost:5000');
  
  try {
    const result = await simulator.runScenario(testScenarios[0]);
    
    console.log('Result:', {
      passed: result.passed,
      errors: result.errors,
      executedSteps: result.executedSteps
    });

    if (result.passed) {
      console.log('✅ Simple test PASSED');
    } else {
      console.log('❌ Simple test FAILED');
      result.errors.forEach(error => console.log(`  Error: ${error}`));
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runSimpleTest();