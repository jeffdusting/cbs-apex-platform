/**
 * Training Event Handlers
 * Handle events emitted by the isolated training module
 */

import { ITrainingEventHandler, ITrainingEvent } from "../interfaces/ITrainingModule";
import { AgentMemoryService } from "../services/agentMemoryService";

export class KnowledgeTrackingHandler implements ITrainingEventHandler {
  private memoryService: AgentMemoryService;

  constructor() {
    this.memoryService = new AgentMemoryService();
  }

  async handleEvent(event: ITrainingEvent): Promise<void> {
    switch (event.type) {
      case 'competency_achieved':
        await this.recordCompetencyAchievement(event);
        break;
      case 'session_completed':
        await this.recordTrainingCompletion(event);
        break;
      case 'test_completed':
        await this.recordTestExperience(event);
        break;
    }
  }

  private async recordCompetencyAchievement(event: ITrainingEvent): Promise<void> {
    try {
      await this.memoryService.storeKnowledge({
        agentId: event.agentId,
        knowledgeType: 'competency_achievement',
        content: `Achieved ${event.data.level} competency with score ${event.data.score}%`,
        source: 'achievement',
        confidence: event.data.score,
        tags: ['competency', 'achievement', event.data.level.toLowerCase()],
      });
    } catch (error) {
      console.error('Error recording competency achievement:', error);
    }
  }

  private async recordTrainingCompletion(event: ITrainingEvent): Promise<void> {
    try {
      await this.memoryService.recordExperience({
        agentId: event.agentId,
        experienceType: 'training_completion',
        context: 'Training session completed successfully',
        outcome: 'success',
        lessonsLearned: ['Training methodology', 'Competency development', 'Knowledge assessment'],
      });
    } catch (error) {
      console.error('Error recording training completion:', error);
    }
  }

  private async recordTestExperience(event: ITrainingEvent): Promise<void> {
    try {
      await this.memoryService.recordExperience({
        agentId: event.agentId,
        experienceType: 'assessment',
        context: `Test completed with ${event.data.score}% score`,
        outcome: event.data.passed ? 'success' : 'failure',
        lessonsLearned: event.data.passed ? ['Test strategy', 'Knowledge application'] : ['Areas for improvement', 'Study focus needed'],
      });
    } catch (error) {
      console.error('Error recording test experience:', error);
    }
  }
}

export class ProgressNotificationHandler implements ITrainingEventHandler {
  async handleEvent(event: ITrainingEvent): Promise<void> {
    // This could integrate with a notification system, websockets, etc.
    console.log(`Training Event [${event.type}]:`, {
      agentId: event.agentId,
      sessionId: event.sessionId,
      data: event.data,
      timestamp: event.timestamp,
    });

    // In a real implementation, this could:
    // - Send notifications to administrators
    // - Update real-time dashboards
    // - Trigger automated responses
    // - Log to external monitoring systems
  }
}