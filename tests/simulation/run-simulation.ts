#!/usr/bin/env tsx

/**
 * Simulation Runner Script
 * Run user scenario simulations from command line
 */

import { UserScenarioSimulator } from './UserScenarioSimulator';

interface SimulationConfig {
  baseUrl?: string;
  scenarios?: string[];
  mode: 'all' | 'specific' | 'interactive';
  iterations?: number;
}

class SimulationRunner {
  private simulator: UserScenarioSimulator;

  constructor(config: SimulationConfig) {
    this.simulator = new UserScenarioSimulator(config.baseUrl || 'http://localhost:5000');
  }

  async run(config: SimulationConfig): Promise<void> {
    console.log('🎯 CBS Apex User Scenario Simulation');
    console.log('====================================\n');

    switch (config.mode) {
      case 'all':
        await this.runAllScenarios(config.iterations || 1);
        break;
      case 'specific':
        if (config.scenarios && config.scenarios.length > 0) {
          await this.runSpecificScenarios(config.scenarios);
        } else {
          console.error('❌ No scenarios specified for specific mode');
          this.showAvailableScenarios();
        }
        break;
      case 'interactive':
        await this.runInteractiveMode();
        break;
      default:
        console.error('❌ Invalid mode specified');
        this.showUsage();
    }
  }

  private async runAllScenarios(iterations: number): Promise<void> {
    console.log(`🚀 Running all scenarios (${iterations} iteration${iterations > 1 ? 's' : ''})...\n`);
    
    for (let i = 1; i <= iterations; i++) {
      if (iterations > 1) {
        console.log(`\n📊 === ITERATION ${i} of ${iterations} ===\n`);
      }
      
      const results = await this.simulator.runAllScenarios();
      
      if (iterations > 1 && i < iterations) {
        console.log('\n⏱️  Waiting 10 seconds before next iteration...\n');
        await this.sleep(10000);
      }
    }
  }

  private async runSpecificScenarios(scenarioIds: string[]): Promise<void> {
    console.log(`🎯 Running specific scenarios: ${scenarioIds.join(', ')}\n`);
    
    const results = await this.simulator.runScenarios(scenarioIds);
    
    console.log('\n📊 Scenario-specific results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.scenarioId}: ${(result.duration / 1000).toFixed(2)}s`);
    });
  }

  private async runInteractiveMode(): Promise<void> {
    console.log('🎮 Interactive Mode - Select scenarios to run:\n');
    
    this.showAvailableScenarios();
    
    // In a real implementation, you would use readline or similar for user input
    console.log('\n💡 Interactive mode would allow you to select specific scenarios');
    console.log('For now, running a demo scenario...\n');
    
    await this.simulator.runScenario('agent-creation');
  }

  private showAvailableScenarios(): void {
    const scenarios = this.simulator.getAvailableScenarios();
    
    console.log('📋 Available Scenarios:');
    scenarios.forEach((scenario, index) => {
      console.log(`   ${index + 1}. ${scenario.id}: ${scenario.name}`);
      console.log(`      ${scenario.description}`);
    });
    console.log('');
  }

  private showUsage(): void {
    console.log('Usage Examples:');
    console.log('  npm run simulate all                    # Run all scenarios once');
    console.log('  npm run simulate all --iterations=3     # Run all scenarios 3 times');
    console.log('  npm run simulate specific agent-creation,training-setup');
    console.log('  npm run simulate interactive             # Interactive scenario selection');
    console.log('');
    this.showAvailableScenarios();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Parse command line arguments
function parseArgs(): SimulationConfig {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return { mode: 'interactive' };
  }

  const mode = args[0] as SimulationConfig['mode'];
  const config: SimulationConfig = { mode };

  // Parse additional arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--base-url=')) {
      config.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--iterations=')) {
      config.iterations = parseInt(arg.split('=')[1]);
    } else if (mode === 'specific' && !arg.startsWith('--')) {
      // Treat as comma-separated scenario list
      config.scenarios = arg.split(',').map(s => s.trim());
    }
  }

  return config;
}

// Main execution
async function main(): Promise<void> {
  try {
    const config = parseArgs();
    const runner = new SimulationRunner(config);
    await runner.run(config);
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  }
}

// Run if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SimulationRunner };