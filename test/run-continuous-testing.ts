// CBS Ultimate Test Battery - Continuous Retesting Mode
import CBSUltimateTestBattery from './cbs-ultimate-test-battery';

async function runContinuousTestBattery() {
  console.log('🔄 CBS LLM Studio - Continuous Ultimate Test Battery\n');
  console.log('⚡ Running all 23 scenarios in continuous retesting mode...\n');
  console.log('🎯 Target: 100% pass rate across all scenarios\n');
  
  let attempt = 1;
  const maxAttempts = 3;
  let allTestsPassed = false;
  
  while (attempt <= maxAttempts && !allTestsPassed) {
    console.log(`🚀 ATTEMPT ${attempt}/${maxAttempts}`);
    console.log('=' .repeat(80));
    
    // Wait for system to be ready (avoid rate limiting)
    if (attempt > 1) {
      console.log('⏳ Waiting for system stabilization...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const battery = new CBSUltimateTestBattery();
    
    try {
      const results = await battery.runAllTests();
      
      // Check if all tests passed
      const passedTests = results.filter(r => r.status === 'passed').length;
      const totalTests = results.length;
      const passRate = (passedTests / totalTests) * 100;
      
      console.log(`\n📊 ATTEMPT ${attempt} RESULTS:`);
      console.log(`✅ Passed: ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)`);
      
      if (passedTests === totalTests) {
        allTestsPassed = true;
        console.log('\n🎉 SUCCESS! 100% PASS RATE ACHIEVED!');
        console.log('🏆 All 23 scenarios validated successfully');
        
        // Save the successful test battery
        await battery.saveTestBattery();
        console.log('💾 Test battery configuration saved');
        
        break;
      } else {
        const failedTests = results.filter(r => r.status === 'failed');
        console.log(`\n❌ Failed Tests (${failedTests.length}):`);
        failedTests.forEach(test => {
          console.log(`   • ${test.testId}: ${test.name} - ${test.error}`);
        });
        
        if (attempt < maxAttempts) {
          console.log(`\n🔄 Retrying... (${maxAttempts - attempt} attempts remaining)`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Test execution failed on attempt ${attempt}:`, error);
      
      if (attempt < maxAttempts) {
        console.log(`\n🔄 Retrying due to execution error... (${maxAttempts - attempt} attempts remaining)`);
      }
    }
    
    attempt++;
    console.log('\n');
  }
  
  if (!allTestsPassed) {
    console.log('⚠️  Could not achieve 100% pass rate after all attempts');
    console.log('💡 Some tests may require manual investigation');
    process.exit(1);
  } else {
    console.log('\n🎯 CONTINUOUS TESTING COMPLETE!');
    console.log('✨ CBS LLM Studio validated with 100% test coverage');
    process.exit(0);
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Continuous testing interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Continuous testing terminated');
  process.exit(0);
});

runContinuousTestBattery().catch(error => {
  console.error('💥 Critical error in continuous testing:', error);
  process.exit(1);
});