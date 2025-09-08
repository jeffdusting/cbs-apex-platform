#!/usr/bin/env tsx
// Enhanced Ultimate Test Battery Runner
// Includes Frontend-Backend Integration Tests

import CBSUltimateTestBattery from './cbs-ultimate-test-battery';

async function main() {
  console.log('🚀 Enhanced Ultimate Test Battery - 28 Comprehensive Scenarios');
  console.log('================================================================================');
  console.log('🔧 Including Frontend-Backend Integration Tests');
  console.log('📊 TypeScript Compilation Validation');
  console.log('🌊 Real Data Flow Testing');
  console.log('🔍 Schema-Frontend Alignment Checks');
  console.log('================================================================================\n');

  const testBattery = new CBSUltimateTestBattery();
  
  try {
    await testBattery.runAllTests();
    await testBattery.saveTestBattery();
    
    console.log('\n✅ Enhanced Ultimate Test Battery completed successfully!');
    console.log('🎯 All 28 test scenarios executed with integration validation.');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;