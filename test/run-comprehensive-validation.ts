// Comprehensive Application Validation
// Runs complete health check and testing readiness assessment

import { ReactAwareTester } from './react-aware-tester';

async function main() {
  console.log('🚀 Starting CBS LLM Studio Comprehensive Validation\n');
  
  const tester = new ReactAwareTester();
  
  try {
    await tester.runApplicationValidation();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Comprehensive validation completed successfully!');
    console.log('📋 Check the detailed results above for next steps.');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);