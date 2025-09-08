// Run CBS Comprehensive Test Battery
import { CBSComprehensiveTestBattery } from './cbs-comprehensive-test-battery';

async function main() {
  const battery = new CBSComprehensiveTestBattery();
  
  console.log('🎯 CBS LLM Studio - Starting Comprehensive Testing\n');
  
  // Run comprehensive tests once to identify all issues
  await battery.runComprehensiveTests();
  
  // Save the test battery configuration
  await battery.saveTestBattery();
  
  console.log('\n🏁 Initial test run complete!');
  console.log('📋 Review results above and fix any identified faults.');
  console.log('🔄 Run continuous testing after fixes to ensure full validation.');
}

main().catch(console.error);