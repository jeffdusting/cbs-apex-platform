/**
 * Training Module Factory
 * Creates and configures the isolated training module with all dependencies
 */

import { TrainingModule } from "../services/TrainingModule";
import { ITrainingModule, ITrainingModuleConfig } from "../interfaces/ITrainingModule";
import { AgentProviderAdapter } from "../adapters/AgentProviderAdapter";
import { LLMProviderAdapter } from "../adapters/LLMProviderAdapter";
import { KnowledgeStoreAdapter } from "../adapters/KnowledgeStoreAdapter";
import { KnowledgeTrackingHandler, ProgressNotificationHandler } from "../handlers/TrainingEventHandlers";

export class TrainingModuleFactory {
  private static instance: ITrainingModule | null = null;

  static createTrainingModule(): ITrainingModule {
    if (this.instance) {
      return this.instance;
    }

    // Validate required environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required for training module");
    }

    // Create adapters
    const agentProvider = new AgentProviderAdapter();
    const llmProvider = new LLMProviderAdapter(openaiApiKey);
    const knowledgeStore = new KnowledgeStoreAdapter();

    // Create event handlers
    const eventHandlers = [
      new KnowledgeTrackingHandler(),
      new ProgressNotificationHandler(),
    ];

    // Configuration
    const config: ITrainingModuleConfig = {
      llmProvider,
      agentProvider,
      knowledgeStore,
      eventHandlers,
      
      // Training Parameters
      defaultMaxIterations: 10,
      testGenerationTimeout: 30000, // 30 seconds
      competencyThresholds: {
        'Beginner': 90,
        'Intermediate': 90,
        'Advanced': 90,
        'Expert': 90,
      },
    };

    // Create the training module
    this.instance = new TrainingModule(config);
    
    return this.instance;
  }

  static resetInstance(): void {
    this.instance = null;
  }

  static getInstance(): ITrainingModule | null {
    return this.instance;
  }
}