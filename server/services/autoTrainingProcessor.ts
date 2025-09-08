/**
 * Automatic Training Processor
 * Handles background progression of agent training sessions
 */

import { TrainingSessionManager } from "./trainingSessionManager";
import { AgentTrainingService } from "./agentTrainingService";
import { type AgentTrainingSession } from "@shared/schema";

export class AutoTrainingProcessor {
  private trainingService: AgentTrainingService;
  private sessionManager: TrainingSessionManager;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 30000; // Process every 30 seconds
  private readonly PHASE_DURATION = 60000; // Each phase lasts 1 minute for testing (adjust as needed)
  private isProcessing = false;

  constructor() {
    this.trainingService = new AgentTrainingService();
    this.sessionManager = new TrainingSessionManager();
  }

  /**
   * Start the automatic training processor
   */
  start(): void {
    if (this.processingInterval) {
      console.log("AutoTrainingProcessor already running");
      return;
    }

    console.log("Starting AutoTrainingProcessor...");
    this.processingInterval = setInterval(
      () => this.processActiveSessions(),
      this.PROCESSING_INTERVAL
    );

    // Run initial processing
    this.processActiveSessions();
  }

  /**
   * Stop the automatic training processor
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log("AutoTrainingProcessor stopped");
    }
  }

  /**
   * Validate if a training session is legitimate (user-created) vs placeholder/demo
   */
  private isLegitimateUserSession(session: AgentTrainingSession): boolean {
    // Check for placeholder/demo session indicators
    const agentName = (session as any).agentName || '';
    
    // Reject sessions with placeholder agent names
    const placeholderPatterns = [
      /catalyst/i,
      /builder/i,
      /assessor/i,
      /\d{3,4}$/, // ends with 3-4 digits (like "576", "789")
      /test agent/i,
      /demo agent/i,
      /placeholder/i
    ];
    
    const hasPlaceholderName = placeholderPatterns.some(pattern => 
      pattern.test(agentName)
    );
    
    if (hasPlaceholderName) {
      console.log(`Skipping placeholder session ${session.id} with agent "${agentName}"`);
      return false;
    }
    
    // Additional validation: ensure session has required user-created data
    const hasValidData = !!(session.agentId && 
                           session.specialtyId && 
                           session.targetCompetencyLevel &&
                           session.startedAt);
    
    return hasValidData;
  }

  /**
   * Process all active training sessions (legitimate user-created only)
   */
  private async processActiveSessions(): Promise<void> {
    if (this.isProcessing) {
      return; // Prevent overlapping processing
    }

    this.isProcessing = true;

    try {
      const activeSessions = await this.trainingService.getAllTrainingSessions();
      console.log(`Found ${activeSessions.length} total sessions in database`);
      console.log('Session statuses:', activeSessions.map(s => ({ id: s.id, status: s.status })));
      
      const inProgressSessions = activeSessions.filter(
        session => session.status === "in_progress"
      );

      // Filter to only legitimate user-created sessions
      const legitimateSessions = inProgressSessions.filter(session => 
        this.isLegitimateUserSession(session)
      );

      console.log(`Processing ${legitimateSessions.length} legitimate user training sessions (filtered from ${inProgressSessions.length} total active)`);

      for (const session of legitimateSessions) {
        try {
          await this.processSession(session);
        } catch (error) {
          console.error(`Error processing session ${session.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in automatic training processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single training session
   */
  private async processSession(session: AgentTrainingSession): Promise<void> {
    const now = new Date();
    const sessionStart = new Date(session.startedAt || now);
    
    // Calculate how long this session has been running
    const sessionDuration = now.getTime() - sessionStart.getTime();
    
    // Calculate which phase we should be in based on time (each phase = 1 minute for testing)
    const totalPhases = 4; // study, practice, test, review
    const phaseIndex = Math.floor(sessionDuration / this.PHASE_DURATION) % totalPhases;
    const currentCycle = Math.floor(sessionDuration / (this.PHASE_DURATION * totalPhases)) + 1;
    const phases = ['study', 'practice', 'test', 'review'];
    const currentPhase = phases[phaseIndex];
    
    // Track phase progression using learning objectives field as temporary storage
    const sessionData = session.learningObjectives as any || {};
    const lastProcessedPhase = sessionData.lastProcessedPhase;
    const lastProcessedTime = sessionData.lastProcessedTime;
    
    // Only process if enough time has passed or we're in a new phase
    const timeSinceLastProcess = lastProcessedTime ? (now.getTime() - new Date(lastProcessedTime).getTime()) : this.PHASE_DURATION;
    const shouldProcess = !lastProcessedPhase || 
                         lastProcessedPhase !== currentPhase || 
                         timeSinceLastProcess >= this.PHASE_DURATION;

    if (shouldProcess) {
      console.log(`Auto-advancing session ${session.id} - Cycle: ${currentCycle}, Phase: ${currentPhase} (${phaseIndex + 1}/4)`);
      
      try {
        // Update the current phase in session using learning objectives field
        const updatedSessionData = {
          ...(session.learningObjectives as any || {}),
          currentPhase,
          phaseIndex,
          lastProcessedPhase: currentPhase,
          lastProcessedTime: now.toISOString(),
          sessionDuration: sessionDuration
        };
        
        await this.trainingService.updateTrainingSession(session.id, {
          currentIteration: currentCycle,
          learningObjectives: updatedSessionData
        });
        
        // Execute efficient competency-based training iteration (test-first approach)
        const cycle = await this.sessionManager.executeTrainingIteration(session.id);
        
        // Check if competency was achieved immediately (no training needed)
        if (cycle.nextAction !== 'continue') {
          console.log(`Training completed efficiently for session ${session.id} - competency achieved!`);
          await this.completeTraining(session);
          return;
        }
        
        // Handle cycle completion based on the new efficient approach
        if (cycle.learningPhase === 'test' && cycle.test) {
          // Test has been completed as part of the efficient training flow
          await this.autoSubmitTest(session.id, cycle.test.id);
        }
        
        // Update overall progress
        const maxCycles = session.maxIterations || 10;
        if (currentCycle <= maxCycles) {
          const phaseProgress = (phaseIndex + 1) / totalPhases;
          const cycleProgress = (currentCycle - 1) / maxCycles;
          const totalProgress = Math.round(Math.min(95, (cycleProgress + phaseProgress / maxCycles) * 100));
          
          await this.trainingService.updateTrainingSession(session.id, {
            progress: totalProgress
          });
        }
        
        // Check for completion after additional iterations
        if (cycle.nextAction !== 'continue' || currentCycle >= (session.maxIterations || 10)) {
          await this.completeTraining(session);
        }
        
      } catch (error) {
        console.error(`Error auto-advancing session ${session.id}:`, error);
      }
    }
  }

  /**
   * Auto-submit test with reasonable performance for progression
   */
  private async autoSubmitTest(sessionId: string, testId: string): Promise<void> {
    try {
      const test = await this.trainingService.getTestById(testId);
      if (!test) return;

      const questions = test.questions as any[];
      const answers = questions.map((question, index) => ({
        questionId: question.id || `q${index}`,
        answer: this.generateReasonableAnswer(question),
        timeSpent: Math.floor(Math.random() * 30) + 15, // 15-45 seconds per question
      }));

      await this.trainingService.submitTestAttempt(testId, sessionId, answers);
      console.log(`Auto-submitted test for session ${sessionId}`);
    } catch (error) {
      console.error(`Error auto-submitting test for session ${sessionId}:`, error);
    }
  }

  /**
   * Generate reasonable answers for automatic test submission
   */
  private generateReasonableAnswer(question: any): string {
    if (question.type === 'multiple_choice') {
      // Choose first option 60% of time (simulating learning progress)
      const options = question.options || [];
      const correctIndex = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * options.length);
      return options[correctIndex] || question.correctAnswer || "A";
    }
    
    if (question.type === 'scenario' || question.type === 'essay') {
      return `Based on the training materials, I would approach this by applying the core concepts learned in this specialty. The key considerations include following best practices and leveraging the knowledge gained during the study phase.`;
    }
    
    return question.correctAnswer || "Applying learned concepts and best practices.";
  }

  /**
   * Complete a training session
   */
  private async completeTraining(session: AgentTrainingSession): Promise<void> {
    try {
      const progress = await this.trainingService.getTrainingProgress(session.id);
      
      // Determine final competency level based on progress
      let finalCompetency = session.currentCompetencyLevel || "Beginner";
      if (progress.progress >= 80 && progress.testsPassed >= 3) {
        finalCompetency = session.targetCompetencyLevel;
      } else if (progress.progress >= 60) {
        // Advance by one level
        const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
        const currentIndex = levels.indexOf(session.currentCompetencyLevel || "Beginner");
        finalCompetency = levels[Math.min(currentIndex + 1, levels.length - 1)];
      }

      await this.trainingService.updateTrainingSession(session.id, {
        status: "completed",
        completedAt: new Date(),
        currentCompetencyLevel: finalCompetency,
        progress: 100
      });

      // Update agent's trained specialties
      await this.updateAgentSpecialties(session, finalCompetency);

      console.log(`Training completed for session ${session.id} - Final competency: ${finalCompetency}`);
    } catch (error) {
      console.error(`Error completing training for session ${session.id}:`, error);
    }
  }

  /**
   * Update agent's specialties after training completion
   */
  private async updateAgentSpecialties(
    session: AgentTrainingSession, 
    competencyLevel: string
  ): Promise<void> {
    try {
      const agent = await this.trainingService.getAgentById(session.agentId);
      if (!agent) return;

      // Use experience field to track training completion
      const experience = agent.experience as any || {
        meetingsParticipated: 0,
        topicsExplored: [],
        keyInsights: [],
        collaborationHistory: []
      };
      
      // Add completed specialty to key insights
      const completionInfo = `Completed ${session.specialtyId} training at ${competencyLevel} level`;
      if (!experience.keyInsights.includes(completionInfo)) {
        experience.keyInsights.push(completionInfo);
      }
      
      // Add to topics explored if not already there
      if (!experience.topicsExplored.includes(session.specialtyId)) {
        experience.topicsExplored.push(session.specialtyId);
      }

      await this.trainingService.updateAgent(session.agentId, {
        experience
      });
    } catch (error) {
      console.error(`Error updating agent specialties for session ${session.id}:`, error);
    }
  }

  /**
   * Get processor status
   */
  getStatus(): {
    isRunning: boolean;
    processingInterval: number;
    phaseDuration: number;
  } {
    return {
      isRunning: this.processingInterval !== null,
      processingInterval: this.PROCESSING_INTERVAL,
      phaseDuration: this.PHASE_DURATION,
    };
  }
}

// Export singleton instance
export const autoTrainingProcessor = new AutoTrainingProcessor();