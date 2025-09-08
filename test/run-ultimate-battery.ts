// CBS Ultimate Test Battery Runner
import CBSUltimateTestBattery from './cbs-ultimate-test-battery';

async function main() {
  console.log('🎯 CBS LLM Studio - Ultimate Test Battery Execution\n');
  console.log('⚡ Running 23 comprehensive scenarios with full validation...\n');
  
  const battery = new CBSUltimateTestBattery();
  
  try {
    // Run all tests
    await battery.runAllTests();
    
    // Save test battery for future use
    await battery.saveTestBattery();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);