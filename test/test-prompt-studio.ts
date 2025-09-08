// Test just the prompt studio scenario
import { CBSTestSimulator } from './simulator';

const promptStudioTest = {
  id: 'PS001',
  name: 'Basic Prompt Submission',
  description: 'User creates a simple prompt and sends to multiple providers',
  steps: [
    { action: 'navigate' as const, target: '/prompt-studio' },
    { action: 'type' as const, target: 'textarea[data-testid="input-prompt"]', value: 'What is artificial intelligence?' },
    { action: 'click' as const, target: 'div[data-testid="provider-openai-gpt5"]' },
    { action: 'click' as const, target: 'div[data-testid="provider-anthropic-claude"]' },
    { action: 'click' as const, target: 'button[data-testid="button-send-prompt"]' },
    { action: 'verify' as const, target: 'div[data-testid="response-openai-gpt5"]', condition: 'exists' as const }
  ],
  expectedBackendCalls: ['POST /api/conversations', 'POST /api/prompts']
};

async function testPromptStudio() {
  console.log('🧪 Testing Prompt Studio scenario...');
  
  const simulator = new CBSTestSimulator('http://localhost:5000');
  const result = await simulator.runScenario(promptStudioTest);
  
  console.log('Result:', {
    passed: result.passed,
    errors: result.errors,
    executedSteps: result.executedSteps,
    actualBackendCalls: result.actualBackendCalls
  });
  
  if (result.passed) {
    console.log('✅ Prompt Studio test PASSED');
  } else {
    console.log('❌ Prompt Studio test FAILED');
    result.errors.forEach(error => console.log(`  Error: ${error}`));
  }
}

testPromptStudio();