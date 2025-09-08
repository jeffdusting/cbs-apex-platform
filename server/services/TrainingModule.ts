/**
 * Isolated Training Module Implementation
 * Self-contained training functionality with clear external interfaces
 */

import {
  ITrainingModule,
  ITrainingModuleConfig,
  ITrainingSpecialty,
  ITrainingSession,
  ITrainingTest,
  ITestAttempt,
  ITestQuestion,
  ITrainingEvent,
} from "../interfaces/ITrainingModule";

export class TrainingModule implements ITrainingModule {
  private config: ITrainingModuleConfig;
  private specialties: Map<string, ITrainingSpecialty> = new Map();
  private sessions: Map<string, ITrainingSession> = new Map();
  private tests: Map<string, ITrainingTest> = new Map();
  private attempts: Map<string, ITestAttempt> = new Map();

  constructor(config: ITrainingModuleConfig) {
    this.config = config;
    // Initialize the module with existing data
    this.initialize();
  }

  // Initialize training module with existing database data
  private async initialize(): Promise<void> {
    try {
      await this.loadExistingSpecialties();
      console.log(`✅ Training module initialized with ${this.specialties.size} specialties`);
    } catch (error) {
      console.error('❌ Failed to initialize training module:', error);
    }
  }

  // Load existing specialties from database into memory
  private async loadExistingSpecialties(): Promise<void> {
    try {
      // Import database here to avoid circular dependencies
      const { db } = await import('../db');
      const { agentSpecialties } = await import('@shared/schema');
      const { desc } = await import('drizzle-orm');
      
      const dbSpecialties = await db.select().from(agentSpecialties).orderBy(desc(agentSpecialties.createdAt));
      
      // Convert database format to training module format
      dbSpecialties.forEach(dbSpecialty => {
        const specialty: ITrainingSpecialty = {
          id: dbSpecialty.id,
          name: dbSpecialty.name,
          description: dbSpecialty.description || '',
          domain: dbSpecialty.domain,
          requiredKnowledge: Array.isArray(dbSpecialty.requiredKnowledge) ? dbSpecialty.requiredKnowledge : [],
          competencyLevels: Array.isArray(dbSpecialty.competencyLevels) ? dbSpecialty.competencyLevels : ['Beginner', 'Intermediate', 'Advanced', 'Expert']
        };
        this.specialties.set(specialty.id, specialty);
      });
      
      console.log(`📚 Loaded ${dbSpecialties.length} specialties from database into training module`);
    } catch (error) {
      console.error('Failed to load specialties from database:', error);
      // Don't throw here - let the module work with empty state if DB fails
    }
  }

  private getCompetencyPassingScore(level: string): number {
    // Competency-based training requires 90% mastery for progression
    const passingScores: Record<string, number> = {
      'Beginner': 90,      // Must demonstrate solid foundational understanding
      'Intermediate': 90,  // Must show practical application competency  
      'Advanced': 90,      // Must demonstrate complex problem-solving ability
      'Expert': 90         // Must show mastery and teaching capability
    };
    
    return passingScores[level] || 90;
  }

  // === SPECIALTY MANAGEMENT ===

  async createSpecialty(data: Omit<ITrainingSpecialty, 'id'>): Promise<ITrainingSpecialty> {
    const id = this.generateId();
    const specialty: ITrainingSpecialty = { id, ...data };
    this.specialties.set(id, specialty);
    
    // Also persist to database to keep in sync
    try {
      const { db } = await import('../db');
      const { agentSpecialties } = await import('@shared/schema');
      
      await db.insert(agentSpecialties).values({
        id: specialty.id,
        name: specialty.name,
        description: specialty.description,
        domain: specialty.domain,
        requiredKnowledge: specialty.requiredKnowledge,
        competencyLevels: specialty.competencyLevels,
        llmProviderId: 'openai-gpt5' // Default LLM provider
      });
      
      console.log(`💾 Persisted specialty '${specialty.name}' to database`);
    } catch (error) {
      console.error('Failed to persist specialty to database:', error);
      // Don't fail the operation - memory state is still valid
    }
    
    return specialty;
  }

  // Synchronize a specialty from database into memory (for legacy API sync)
  async syncSpecialtyFromDatabase(specialty: any): Promise<void> {
    const trainingSpecialty: ITrainingSpecialty = {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description || '',
      domain: specialty.domain,
      requiredKnowledge: specialty.requiredKnowledge || [],
      competencyLevels: specialty.competencyLevels || ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    };
    
    this.specialties.set(specialty.id, trainingSpecialty);
    console.log(`🔄 Synced specialty '${specialty.name}' into training module memory`);
  }

  async getSpecialties(): Promise<ITrainingSpecialty[]> {
    return Array.from(this.specialties.values());
  }

  async updateSpecialty(id: string, updates: Partial<ITrainingSpecialty>): Promise<ITrainingSpecialty> {
    const existing = this.specialties.get(id);
    if (!existing) {
      throw new Error(`Specialty ${id} not found`);
    }

    const updated = { ...existing, ...updates };
    this.specialties.set(id, updated);
    
    // Also update in database
    try {
      const { db } = await import('../db');
      const { agentSpecialties } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      await db.update(agentSpecialties)
        .set({
          name: updated.name,
          description: updated.description,
          domain: updated.domain,
          requiredKnowledge: updated.requiredKnowledge,
          competencyLevels: updated.competencyLevels,
          isArchived: updated.isArchived
        })
        .where(eq(agentSpecialties.id, id));
        
      console.log(`💾 Updated specialty '${updated.name}' in database`);
    } catch (error) {
      console.error('Failed to update specialty in database:', error);
    }
    
    return updated;
  }

  async deleteSpecialty(id: string): Promise<void> {
    if (!this.specialties.has(id)) {
      throw new Error(`Specialty ${id} not found`);
    }

    // Clean up related sessions
    const relatedSessions = Array.from(this.sessions.values())
      .filter(session => session.specialtyId === id);

    for (const session of relatedSessions) {
      await this.cleanupSession(session.id);
    }

    this.specialties.delete(id);
    
    // Also delete from database
    try {
      const { db } = await import('../db');
      const { agentSpecialties } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      await db.delete(agentSpecialties).where(eq(agentSpecialties.id, id));
      console.log(`💾 Deleted specialty '${id}' from database`);
    } catch (error) {
      console.error('Failed to delete specialty from database:', error);
    }
  }

  // === SESSION MANAGEMENT ===

  async startTrainingSession(data: {
    agentId: string;
    specialtyId: string;
    targetCompetencyLevel: string;
    maxIterations?: number;
  }): Promise<ITrainingSession> {
    // Validate agent exists
    const agent = await this.config.agentProvider.getAgent(data.agentId);
    if (!agent) {
      throw new Error(`Agent ${data.agentId} not found`);
    }

    // Validate specialty exists
    const specialty = this.specialties.get(data.specialtyId);
    if (!specialty) {
      throw new Error(`Specialty ${data.specialtyId} not found`);
    }

    // Create session
    const session: ITrainingSession = {
      id: this.generateId(),
      agentId: data.agentId,
      specialtyId: data.specialtyId,
      targetCompetencyLevel: data.targetCompetencyLevel,
      currentCompetencyLevel: 'Beginner',
      status: 'in_progress',
      progress: 0,
      currentIteration: 1,
      maxIterations: data.maxIterations || this.config.defaultMaxIterations,
      startedAt: new Date(),
    };

    this.sessions.set(session.id, session);

    // Emit event
    await this.emitEvent({
      type: 'session_started',
      sessionId: session.id,
      agentId: session.agentId,
      data: { specialty: specialty.name, targetLevel: data.targetCompetencyLevel },
      timestamp: new Date(),
    });

    return session;
  }

  async getTrainingSession(id: string): Promise<ITrainingSession | null> {
    return this.sessions.get(id) || null;
  }

  async getAgentTrainingSessions(agentId: string): Promise<ITrainingSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.agentId === agentId);
  }

  async getAllTrainingSessions(): Promise<ITrainingSession[]> {
    return Array.from(this.sessions.values());
  }

  async updateSessionProgress(id: string, progress: number): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    session.progress = Math.max(0, Math.min(100, progress));
    this.sessions.set(id, session);
  }

  async completeTrainingSession(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    session.status = 'completed';
    session.progress = 100;
    session.completedAt = new Date();
    this.sessions.set(id, session);

    // Emit event
    await this.emitEvent({
      type: 'session_completed',
      sessionId: session.id,
      agentId: session.agentId,
      data: { finalLevel: session.currentCompetencyLevel },
      timestamp: new Date(),
    });
  }

  // === TEST MANAGEMENT ===

  async generateTest(sessionId: string, testType: string): Promise<ITrainingTest> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const specialty = this.specialties.get(session.specialtyId);
    if (!specialty) {
      throw new Error(`Specialty ${session.specialtyId} not found`);
    }

    // Generate questions using LLM provider with level-appropriate count and competency focus
    const questionCount = {
      'Beginner': 6,
      'Intermediate': 8,
      'Advanced': 10,
      'Expert': 12
    }[session.currentCompetencyLevel] || 6;

    console.log(`Generating ${questionCount} questions for ${specialty.name} at ${session.currentCompetencyLevel} level`);

    const questions = await this.config.llmProvider.generateQuestions(
      specialty.name,
      session.currentCompetencyLevel,
      questionCount
    );

    const test: ITrainingTest = {
      id: this.generateId(),
      sessionId,
      testType,
      questions,
      passingScore: this.getCompetencyPassingScore(session.currentCompetencyLevel),
      difficulty: session.currentCompetencyLevel.toLowerCase(),
    };

    this.tests.set(test.id, test);

    // Emit event
    await this.emitEvent({
      type: 'test_generated',
      sessionId,
      agentId: session.agentId,
      data: { testId: test.id, questionCount: questions.length },
      timestamp: new Date(),
    });

    return test;
  }

  async submitTestAttempt(
    testId: string,
    sessionId: string,
    answers: Array<{ questionId: string; answer: string }>
  ): Promise<ITestAttempt> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Grade the test
    let totalScore = 0;
    const feedback: string[] = [];

    for (const answer of answers) {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const evaluation = await this.config.llmProvider.evaluateAnswer(
        question.question,
        answer.answer,
        question.correctAnswer
      );

      totalScore += evaluation.score;
      if (evaluation.feedback) {
        feedback.push(evaluation.feedback);
      }
    }

    const finalScore = Math.round((totalScore / test.questions.length) * 100);
    const passed = finalScore >= test.passingScore;

    const attempt: ITestAttempt = {
      id: this.generateId(),
      testId,
      sessionId,
      answers,
      score: finalScore,
      passed,
      feedback,
      completedAt: new Date(),
    };

    this.attempts.set(attempt.id, attempt);

    // Update session progress if test passed
    if (passed) {
      await this.handleCompetencyAchievement(session, attempt);
    }

    // Emit event
    await this.emitEvent({
      type: 'test_completed',
      sessionId,
      agentId: session.agentId,
      data: { testId, score: finalScore, passed },
      timestamp: new Date(),
    });

    return attempt;
  }

  async getTestsForSession(sessionId: string): Promise<ITrainingTest[]> {
    return Array.from(this.tests.values())
      .filter(test => test.sessionId === sessionId);
  }

  async getTestAttemptsForSession(sessionId: string): Promise<ITestAttempt[]> {
    return Array.from(this.attempts.values())
      .filter(attempt => attempt.sessionId === sessionId);
  }

  // === PROGRESS TRACKING ===

  async getTrainingProgress(sessionId: string): Promise<{
    session: ITrainingSession;
    currentTest?: ITrainingTest;
    latestAttempt?: ITestAttempt;
    nextSteps: string[];
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const tests = await this.getTestsForSession(sessionId);
    const attempts = await this.getTestAttemptsForSession(sessionId);

    const currentTest = tests[tests.length - 1];
    const latestAttempt = attempts[attempts.length - 1];

    const nextSteps = this.determineNextSteps(session, latestAttempt);

    return {
      session,
      currentTest,
      latestAttempt,
      nextSteps,
    };
  }

  // === PRIVATE METHODS ===

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async cleanupSession(sessionId: string): Promise<void> {
    // Remove all tests for this session
    const sessionTests = Array.from(this.tests.entries())
      .filter(([_, test]) => test.sessionId === sessionId);
    
    for (const [testId] of sessionTests) {
      this.tests.delete(testId);
    }

    // Remove all attempts for this session
    const sessionAttempts = Array.from(this.attempts.entries())
      .filter(([_, attempt]) => attempt.sessionId === sessionId);
    
    for (const [attemptId] of sessionAttempts) {
      this.attempts.delete(attemptId);
    }

    // Remove session
    this.sessions.delete(sessionId);
  }

  private async handleCompetencyAchievement(
    session: ITrainingSession,
    attempt: ITestAttempt
  ): Promise<void> {
    const specialty = this.specialties.get(session.specialtyId);
    if (!specialty) return;

    // Check if we've reached target competency
    if (session.currentCompetencyLevel === session.targetCompetencyLevel) {
      await this.completeTrainingSession(session.id);
      
      await this.emitEvent({
        type: 'competency_achieved',
        sessionId: session.id,
        agentId: session.agentId,
        data: { level: session.currentCompetencyLevel, score: attempt.score },
        timestamp: new Date(),
      });
    } else {
      // Advance to next level
      const currentIndex = specialty.competencyLevels.indexOf(session.currentCompetencyLevel);
      if (currentIndex < specialty.competencyLevels.length - 1) {
        session.currentCompetencyLevel = specialty.competencyLevels[currentIndex + 1];
        session.currentIteration += 1;
        session.progress = Math.round((currentIndex + 1) / specialty.competencyLevels.length * 100);
        this.sessions.set(session.id, session);
      }
    }
  }

  private determineNextSteps(session: ITrainingSession, latestAttempt?: ITestAttempt): string[] {
    const steps: string[] = [];

    if (!latestAttempt) {
      steps.push("Generate initial competency test");
      steps.push("Begin learning phase for " + session.currentCompetencyLevel + " level");
    } else if (!latestAttempt.passed) {
      steps.push("Review failed test areas");
      steps.push("Additional study required");
      steps.push("Retake competency test");
    } else if (session.currentCompetencyLevel !== session.targetCompetencyLevel) {
      steps.push("Advance to next competency level");
      steps.push("Generate test for " + session.currentCompetencyLevel + " level");
    } else {
      steps.push("Training complete - competency achieved");
    }

    return steps;
  }

  private async emitEvent(event: ITrainingEvent): Promise<void> {
    if (this.config.eventHandlers) {
      for (const handler of this.config.eventHandlers) {
        try {
          await handler.handleEvent(event);
        } catch (error) {
          console.error("Error in training event handler:", error);
        }
      }
    }
  }
}