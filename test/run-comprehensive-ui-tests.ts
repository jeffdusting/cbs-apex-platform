// Run Comprehensive UI Testing
import { ComprehensiveUIValidator } from './comprehensive-ui-validator';

async function main() {
  console.log('🚀 Starting Comprehensive UI Testing Suite\n');
  
  const validator = new ComprehensiveUIValidator();
  
  try {
    await validator.runComprehensiveUIValidation();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Comprehensive UI testing completed successfully!');
    console.log('📋 Review the detailed results above for component and scenario validation.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ UI testing failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);