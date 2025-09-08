/**
 * User Scenario Simulator
 * Simulates realistic user interactions through all CBS Apex application scenarios
 */

import { ApiClient } from './ApiClient';
import { DataGenerator } from './DataGenerator';
import { SimulationReporter } from './SimulationReporter';

export interface SimulationStep {
  action: string;
  description: string;
  apiCall?: {
    method: string;
    endpoint: string;
    data?: any;
  };
  delay?: number; // Milliseconds to wait before next step
  validation?: (response: any) => boolean;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  steps: SimulationStep[];
  expectedDuration: number; // Estimated duration in seconds
}

export interface SimulationResult {
  scenarioId: string;
  success: boolean;
  duration: number;
  stepResults: Array<{
    stepIndex: number;
    action: string;
    success: boolean;
    response?: any;
    error?: string;
    duration: number;
  }>;
  metrics: {
    totalApiCalls: number;
    averageResponseTime: number;
    errorsEncountered: number;
  };
}

export class UserScenarioSimulator {
  private apiClient: ApiClient;
  private dataGenerator: DataGenerator;
  private reporter: SimulationReporter;
  private scenarios: Map<string, ScenarioConfig> = new Map();
  private lastStepResult: any = null;
  private stepResults: any[] = [];

  constructor(baseUrl: string = 'http://localhost:5000') {
    console.log(`🔧 Initializing UserScenarioSimulator with baseUrl: ${baseUrl}`);
    this.apiClient = new ApiClient(baseUrl);
    this.dataGenerator = new DataGenerator();
    this.reporter = new SimulationReporter();
    this.initializeScenarios();
    console.log(`✅ Simulator initialized with ${this.scenarios.size} scenarios`);
  }

  /**
   * Initialize all 12 user scenarios from the documentation
   */
  private initializeScenarios(): void {
    // Scenario 1: Agent Creation and Configuration
    this.scenarios.set('agent-creation', {
      id: 'agent-creation',
      name: 'Agent Creation and Configuration',
      description: 'Create a new AI agent with HBDI-based personality traits',
      expectedDuration: 30,
      steps: [
        {
          action: 'navigate-to-agent-library',
          description: 'Navigate to Agent Library page',
          apiCall: {
            method: 'GET',
            endpoint: '/api/agent-library'
          }
        },
        {
          action: 'create-agent',
          description: 'Create new agent with HBDI personality',
          apiCall: {
            method: 'POST',
            endpoint: '/api/agent-library',
            data: () => this.dataGenerator.generateAgent()
          }
        },
        {
          action: 'verify-agent-creation',
          description: 'Verify agent was created successfully',
          apiCall: {
            method: 'GET',
            endpoint: '/api/agent-library'
          },
          validation: (response) => Array.isArray(response) && response.length > 0
        }
      ]
    });

    // Scenario 2: Agent Training Session Setup
    this.scenarios.set('training-setup', {
      id: 'training-setup',
      name: 'Agent Training Session Setup',
      description: 'Configure and start training session for an agent',
      expectedDuration: 45,
      steps: [
        {
          action: 'get-agents',
          description: 'Get available agents for training',
          apiCall: {
            method: 'GET',
            endpoint: '/api/agent-library'
          }
        },
        {
          action: 'get-specialties',
          description: 'Get available training specialties',
          apiCall: {
            method: 'GET',
            endpoint: '/api/training/specialties'
          }
        },
        {
          action: 'create-training-session',
          description: 'Start new training session',
          apiCall: {
            method: 'POST',
            endpoint: '/api/training/sessions',
            data: () => {
              // Use the first available agent from step 1 (get-agents)
              const agents = this.stepResults?.find(r => r.action === 'get-agents')?.response || [];
              const agentId = Array.isArray(agents) && agents.length > 0 ? agents[0].id : 'test-agent-fallback';
              return {
                agentId: agentId,
                specialtyId: 'analytical-thinking',
                targetCompetencyLevel: 'Intermediate',
                maxIterations: 5
              };
            }
          }
        },
        {
          action: 'monitor-training',
          description: 'Check training session status',
          apiCall: {
            method: 'GET',
            endpoint: '/api/training/sessions'
          },
          delay: 2000
        }
      ]
    });

    // Scenario 3: Multi-Agent Meeting Setup
    this.scenarios.set('ai-meeting-setup', {
      id: 'ai-meeting-setup',
      name: 'Multi-Agent Meeting Setup',
      description: 'Schedule collaborative AI meeting with multiple agents',
      expectedDuration: 60,
      steps: [
        {
          action: 'get-agents-for-meeting',
          description: 'Get available agents for meeting',
          apiCall: {
            method: 'GET',
            endpoint: '/api/agent-library'
          }
        },
        {
          action: 'create-prompt-sequence',
          description: 'Create AI meeting with agent collaboration',
          apiCall: {
            method: 'POST',
            endpoint: '/api/prompt-sequences',
            data: () => {
              // Get agents from the previous step
              const agents = this.stepResults?.find(r => r.action === 'get-agents-for-meeting')?.response || [];
              if (!Array.isArray(agents) || agents.length === 0) {
                console.log('⚠️ No agents available for meeting setup - using fallback data');
                return this.dataGenerator.generatePromptSequence();
              }
              
              // Use the actual agents to create llmChain
              const agentCount = Math.min(agents.length, 3); // Use up to 3 agents
              const selectedAgents = agents.slice(0, agentCount);
              
              const llmChain = selectedAgents.map((agent, i) => ({
                step: i + 1,
                agentId: agent.id,
                providerId: agent.preferredProviderId || 'anthropic-claude',
                customInstructions: agent.supplementalPrompt || undefined,
                primaryPersonality: agent.primaryPersonality,
                secondaryPersonality: agent.secondaryPersonality || undefined,
                isDevilsAdvocate: agent.isDevilsAdvocate || false
              }));
              
              return {
                name: `AI Meeting ${Date.now()}`,
                description: `Collaborative AI discussion with ${selectedAgents.map(a => a.name).join(', ')}`,
                taskObjective: this.dataGenerator.generateTaskObjective(),
                initialPrompt: this.dataGenerator.generatePromptContent(),
                iterations: Math.floor(Math.random() * 2) + 1, // 1-2 iterations
                llmChain: llmChain,
                selectedFolders: this.dataGenerator.generateRandomFolders(),
                synthesisProviderId: 'anthropic-claude'
              };
            }
          }
        },
        {
          action: 'monitor-meeting-progress',
          description: 'Monitor real-time meeting progress',
          apiCall: {
            method: 'GET',
            endpoint: '/api/prompt-sequences'
          },
          delay: 3000
        }
      ]
    });

    // Scenario 4: Document Library Management
    this.scenarios.set('document-management', {
      id: 'document-management',
      name: 'Document Library Management',
      description: 'Organize documents and create folder structure',
      expectedDuration: 25,
      steps: [
        {
          action: 'get-folders',
          description: 'Get existing folder structure',
          apiCall: {
            method: 'GET',
            endpoint: '/api/folders'
          }
        },
        {
          action: 'create-folder',
          description: 'Create new document folder',
          apiCall: {
            method: 'POST',
            endpoint: '/api/folders',
            data: () => this.dataGenerator.generateFolder()
          }
        },
        {
          action: 'get-documents',
          description: 'Get documents in library',
          apiCall: {
            method: 'GET',
            endpoint: '/api/documents/'
          }
        }
      ]
    });

    // Scenario 5: Batch Testing and Provider Comparison
    this.scenarios.set('batch-testing', {
      id: 'batch-testing',
      name: 'Batch Testing and Provider Comparison',
      description: 'Create and execute batch tests across multiple providers',
      expectedDuration: 90,
      steps: [
        {
          action: 'get-providers',
          description: 'Get available LLM providers',
          apiCall: {
            method: 'GET',
            endpoint: '/api/providers'
          }
        },
        {
          action: 'create-batch-test',
          description: 'Create new batch test configuration',
          apiCall: {
            method: 'POST',
            endpoint: '/api/batch-tests',
            data: () => this.dataGenerator.generateBatchTest()
          }
        },
        {
          action: 'monitor-batch-test',
          description: 'Monitor batch test execution',
          apiCall: {
            method: 'GET',
            endpoint: '/api/batch-tests'
          },
          delay: 5000
        }
      ]
    });

    // Scenario 6: Cost Tracking and Analytics
    this.scenarios.set('cost-tracking', {
      id: 'cost-tracking',
      name: 'Cost Tracking and Analytics',
      description: 'Monitor application costs and usage analytics',
      expectedDuration: 15,
      steps: [
        {
          action: 'get-cost-overview',
          description: 'Get current cost overview',
          apiCall: {
            method: 'GET',
            endpoint: '/api/costs'
          }
        },
        {
          action: 'get-provider-usage',
          description: 'Get provider-specific usage statistics',
          apiCall: {
            method: 'GET',
            endpoint: '/api/providers'
          }
        }
      ]
    });

    // Scenario 7: Prompt Studio Workflow
    this.scenarios.set('prompt-studio', {
      id: 'prompt-studio',
      name: 'Prompt Studio Workflow',
      description: 'Create and execute prompts with provider selection',
      expectedDuration: 40,
      steps: [
        {
          action: 'get-conversations',
          description: 'Get existing conversations',
          apiCall: {
            method: 'GET',
            endpoint: '/api/conversations'
          }
        },
        {
          action: 'create-prompt',
          description: 'Create new prompt with context',
          apiCall: {
            method: 'POST',
            endpoint: '/api/prompts',
            data: () => this.dataGenerator.generatePrompt()
          }
        },
        {
          action: 'get-responses',
          description: 'Get prompt responses from providers',
          delay: 2000
        }
      ]
    });

    // Additional scenarios would be added here following the same pattern...
  }

  /**
   * Run a specific scenario simulation
   */
  async runScenario(scenarioId: string): Promise<SimulationResult> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario '${scenarioId}' not found`);
    }

    console.log(`🚀 Starting simulation: ${scenario.name}`);
    const startTime = Date.now();
    
    // Reset step results for this scenario
    this.stepResults = [];
    
    const result: SimulationResult = {
      scenarioId,
      success: true,
      duration: 0,
      stepResults: [],
      metrics: {
        totalApiCalls: 0,
        averageResponseTime: 0,
        errorsEncountered: 0
      }
    };

    let totalResponseTime = 0;

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      const stepStartTime = Date.now();

      console.log(`  📝 Step ${i + 1}: ${step.description}`);

      try {
        let response = null;
        
        if (step.apiCall) {
          const stepData = typeof step.apiCall.data === 'function' 
            ? step.apiCall.data() 
            : step.apiCall.data;

          console.log(`    🔍 Making API call: ${step.apiCall.method} ${step.apiCall.endpoint}`);
          if (stepData) {
            console.log(`    📦 Data:`, JSON.stringify(stepData, null, 2));
          }

          response = await this.apiClient.request(
            step.apiCall.method,
            step.apiCall.endpoint,
            stepData
          );
          
          result.metrics.totalApiCalls++;
          console.log(`    ✅ API call completed. Total calls: ${result.metrics.totalApiCalls}`);
          console.log(`    📤 Response:`, response ? JSON.stringify(response).substring(0, 100) + '...' : 'null');
        }

        // Add realistic delay between steps
        if (step.delay) {
          await this.sleep(step.delay);
        } else {
          await this.sleep(this.getRandomDelay());
        }

        // Validate response if validation function provided
        const isValid = step.validation ? step.validation(response) : true;
        
        const stepDuration = Date.now() - stepStartTime;
        totalResponseTime += stepDuration;

        const stepResult = {
          stepIndex: i,
          action: step.action,
          success: isValid,
          response: response,
          duration: stepDuration
        };
        
        result.stepResults.push(stepResult);
        this.stepResults.push(stepResult);

        // Store the result for use in subsequent steps
        this.lastStepResult = { data: response };

        if (!isValid) {
          result.success = false;
          result.metrics.errorsEncountered++;
          console.log(`  ❌ Step failed validation`);
        } else {
          console.log(`  ✅ Step completed successfully`);
        }

      } catch (error) {
        const stepDuration = Date.now() - stepStartTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.stepResults.push({
          stepIndex: i,
          action: step.action,
          success: false,
          error: errorMessage,
          duration: stepDuration
        });

        result.success = false;
        result.metrics.errorsEncountered++;
        console.log(`  ❌ Step failed: ${errorMessage}`);
      }
    }

    result.duration = Date.now() - startTime;
    result.metrics.averageResponseTime = result.metrics.totalApiCalls > 0 
      ? totalResponseTime / result.metrics.totalApiCalls 
      : 0;

    console.log(`${result.success ? '✅' : '❌'} Scenario completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`   API Calls: ${result.metrics.totalApiCalls}`);
    console.log(`   Errors: ${result.metrics.errorsEncountered}`);

    this.reporter.addResult(result);
    return result;
  }

  /**
   * Run all scenarios in sequence
   */
  async runAllScenarios(): Promise<SimulationResult[]> {
    console.log('🎯 Starting comprehensive user scenario simulation...\n');
    
    const results: SimulationResult[] = [];
    const scenarioIds = Array.from(this.scenarios.keys());

    for (const scenarioId of scenarioIds) {
      try {
        const result = await this.runScenario(scenarioId);
        results.push(result);
        
        // Add delay between scenarios
        await this.sleep(2000);
      } catch (error) {
        console.error(`Failed to run scenario ${scenarioId}:`, error);
      }
    }

    this.reporter.generateSummaryReport(results);
    return results;
  }

  /**
   * Run specific scenarios by ID
   */
  async runScenarios(scenarioIds: string[]): Promise<SimulationResult[]> {
    const results: SimulationResult[] = [];

    for (const scenarioId of scenarioIds) {
      try {
        const result = await this.runScenario(scenarioId);
        results.push(result);
        await this.sleep(1000);
      } catch (error) {
        console.error(`Failed to run scenario ${scenarioId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get list of available scenarios
   */
  getAvailableScenarios(): Array<{id: string, name: string, description: string}> {
    return Array.from(this.scenarios.values()).map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description
    }));
  }

  /**
   * Utility function to add realistic delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random delay to simulate human interaction
   */
  private getRandomDelay(): number {
    return Math.floor(Math.random() * 2000) + 500; // 500-2500ms
  }
}