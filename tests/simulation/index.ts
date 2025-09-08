/**
 * CBS Apex User Scenario Simulation Entry Point
 * 
 * This module provides automated simulation of user interactions through
 * all documented CBS Apex application scenarios.
 */

export { UserScenarioSimulator } from './UserScenarioSimulator';
export { ApiClient } from './ApiClient';
export { DataGenerator } from './DataGenerator';
export { SimulationReporter } from './SimulationReporter';

export type {
  SimulationStep,
  ScenarioConfig,
  SimulationResult
} from './UserScenarioSimulator';

export type {
  SimulationSummary
} from './SimulationReporter';

// Example usage:
// const simulator = new UserScenarioSimulator('http://localhost:5000');
// await simulator.runAllScenarios();