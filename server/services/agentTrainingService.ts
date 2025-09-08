/**
 * Agent Training Service
 * Handles agent training sessions, test generation, and knowledge development
 */

import { eq, and, desc, getTableColumns } from "drizzle-orm";
import { db } from "../db";
import {
  agentLibrary as agents,
  agentSpecialties,
  agentTrainingSessions,
  trainingTests,
  testAttempts,
  agentKnowledgeBase,
  agentExperiences,
  competencyQuestionBank,
  providers,
  type AgentSpecialty,
  type AgentTrainingSession,
  type TrainingTest,
  type TestAttempt,
  type AgentKnowledgeBase,
  type AgentExperience,
  type CompetencyQuestion,
  type InsertAgentSpecialty,
  type InsertAgentTrainingSession,
  type InsertTrainingTest,
  type InsertTestAttempt,
  type InsertAgentKnowledgeBase,
  type InsertAgentExperience,
  type InsertCompetencyQuestion,
  type TestQuestion,
  type TrainingProgress,
  type AgentMemory,
  agentLibrary,
  type AgentLibrary,
  type InsertAgentLibrary,
} from "@shared/schema";
import { CompetencyLLMAdapter } from "../adapters/CompetencyLLMAdapter";
import { countTokens } from "./tokenCounter";

export class AgentTrainingService {
  // === SPECIALTY MANAGEMENT ===
  
  async createSpecialty(data: InsertAgentSpecialty): Promise<AgentSpecialty> {
    const [specialty] = await db.insert(agentSpecialties).values(data).returning();
    return specialty;
  }

  async getSpecialties(): Promise<AgentSpecialty[]> {
    return await db.select().from(agentSpecialties).orderBy(desc(agentSpecialties.createdAt));
  }

  async getSpecialtyById(id: string): Promise<AgentSpecialty | undefined> {
    const [specialty] = await db
      .select()
      .from(agentSpecialties)
      .where(eq(agentSpecialties.id, id));
    return specialty;
  }

  async updateSpecialty(id: string, updates: Partial<InsertAgentSpecialty>): Promise<AgentSpecialty> {
    const [specialty] = await db
      .update(agentSpecialties)
      .set(updates)
      .where(eq(agentSpecialties.id, id))
      .returning();
    return specialty;
  }

  async deleteSpecialty(id: string): Promise<void> {
    await db.delete(agentSpecialties).where(eq(agentSpecialties.id, id));
  }

  async resetSpecialtyTraining(specialtyId: string): Promise<void> {
    // Reset all training sessions for this specialty
    await db
      .update(agentTrainingSessions)
      .set({ 
        status: "reset",
        currentIteration: 0,
        progress: 0,
        currentCompetencyLevel: "Beginner"
      })
      .where(eq(agentTrainingSessions.specialtyId, specialtyId));

    // Clear related knowledge base entries
    await db
      .delete(agentKnowledgeBase)
      .where(eq(agentKnowledgeBase.specialtyId, specialtyId));

    // Clear test attempts
    const sessions = await db
      .select({ id: agentTrainingSessions.id })
      .from(agentTrainingSessions)
      .where(eq(agentTrainingSessions.specialtyId, specialtyId));

    for (const session of sessions) {
      await db
        .delete(testAttempts)
        .where(eq(testAttempts.sessionId, session.id));
    }
  }

  async deleteSpecialtyTraining(specialtyId: string): Promise<void> {
    // First get all sessions for this specialty
    const sessions = await db
      .select({ id: agentTrainingSessions.id })
      .from(agentTrainingSessions)
      .where(eq(agentTrainingSessions.specialtyId, specialtyId));

    // Delete test attempts for each session
    for (const session of sessions) {
      await db
        .delete(testAttempts)
        .where(eq(testAttempts.sessionId, session.id));
    }

    // Delete training tests for each session
    for (const session of sessions) {
      await db
        .delete(trainingTests)
        .where(eq(trainingTests.sessionId, session.id));
    }

    // Delete knowledge base entries
    await db
      .delete(agentKnowledgeBase)
      .where(eq(agentKnowledgeBase.specialtyId, specialtyId));

    // Delete training sessions
    await db
      .delete(agentTrainingSessions)
      .where(eq(agentTrainingSessions.specialtyId, specialtyId));
  }

  // === TRAINING SESSION MANAGEMENT ===

  async startTrainingSession(data: InsertAgentTrainingSession): Promise<AgentTrainingSession> {
    // Simplified training session creation without AI calls to prevent timeout
    const sessionData = {
      ...data,
      learningObjectives: [
        "Understand core concepts",
        "Apply knowledge effectively", 
        "Demonstrate competency"
      ],
      status: "in_progress" as const,
    };

    const [session] = await db.insert(agentTrainingSessions).values(sessionData).returning();
    
    // Update agent training cost after starting a new session
    await this.updateAgentTrainingCost(data.agentId);
    
    return session;
  }

  async getTrainingSession(sessionId: string): Promise<AgentTrainingSession | undefined> {
    const [session] = await db
      .select()
      .from(agentTrainingSessions)
      .where(eq(agentTrainingSessions.id, sessionId));
    return session;
  }

  async getAllTrainingSessions(): Promise<AgentTrainingSession[]> {
    const sessions = await db
      .select({
        ...getTableColumns(agentTrainingSessions),
        agentName: agents.name,
        specialtyName: agentSpecialties.name,
      })
      .from(agentTrainingSessions)
      .leftJoin(agents, eq(agentTrainingSessions.agentId, agents.id))
      .leftJoin(agentSpecialties, eq(agentTrainingSessions.specialtyId, agentSpecialties.id))
      .orderBy(desc(agentTrainingSessions.createdAt));
    
    // Filter out test/placeholder sessions using the same logic as AutoTrainingProcessor
    return sessions.filter(session => this.isLegitimateUserSession(session)) as any;
  }

  async getLatestTestAttempt(sessionId: string): Promise<TestAttempt | undefined> {
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.sessionId, sessionId))
      .orderBy(desc(testAttempts.completedAt))
      .limit(1);
    return attempt;
  }

  async getTestsForSession(sessionId: string): Promise<TrainingTest[]> {
    return await db
      .select()
      .from(trainingTests)
      .where(eq(trainingTests.sessionId, sessionId))
      .orderBy(desc(trainingTests.createdAt));
  }

  async getTestAttemptsForSession(sessionId: string): Promise<TestAttempt[]> {
    return await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.sessionId, sessionId))
      .orderBy(desc(testAttempts.completedAt));
  }

  /**
   * Validate if a training session is legitimate (user-created) vs placeholder/demo
   * This is the same logic used in AutoTrainingProcessor to filter out test sessions
   */
  private isLegitimateUserSession(session: any): boolean {
    // Check for placeholder/demo session indicators
    const agentName = session.agentName || '';
    
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
      return false;
    }
    
    // Additional validation: ensure session has required user-created data
    const hasValidData = session.agentId && 
                        session.specialtyId && 
                        session.targetCompetencyLevel &&
                        session.startedAt;
    
    return hasValidData;
  }

  async getAgentTrainingSessions(agentId: string): Promise<AgentTrainingSession[]> {
    const sessions = await db
      .select({
        ...getTableColumns(agentTrainingSessions),
        agentName: agents.name,
        specialtyName: agentSpecialties.name,
      })
      .from(agentTrainingSessions)
      .leftJoin(agents, eq(agentTrainingSessions.agentId, agents.id))
      .leftJoin(agentSpecialties, eq(agentTrainingSessions.specialtyId, agentSpecialties.id))
      .where(eq(agentTrainingSessions.agentId, agentId))
      .orderBy(desc(agentTrainingSessions.createdAt));
    
    // Filter out test/placeholder sessions using the same logic as AutoTrainingProcessor
    return sessions.filter(session => this.isLegitimateUserSession(session)) as any;
  }

  async updateTrainingSession(
    sessionId: string,
    updates: Partial<AgentTrainingSession>
  ): Promise<AgentTrainingSession> {
    const [session] = await db
      .update(agentTrainingSessions)
      .set(updates)
      .where(eq(agentTrainingSessions.id, sessionId))
      .returning();
    return session;
  }

  // === TEST GENERATION AND MANAGEMENT ===

  async generateTest(sessionId: string, testType: string = "knowledge"): Promise<TrainingTest> {
    const session = await this.getTrainingSession(sessionId);
    if (!session) {
      throw new Error("Training session not found");
    }

    const specialty = await this.getSpecialtyById(session.specialtyId);
    if (!specialty) {
      throw new Error("Specialty not found");
    }

    // Generate test questions using AI
    const questions = await this.generateTestQuestions(
      specialty,
      session.targetCompetencyLevel,
      testType,
      session.currentIteration || 1
    );

    const testData: InsertTrainingTest = {
      sessionId,
      testType,
      questions,
      passingScore: this.calculatePassingScore(session.targetCompetencyLevel),
      generatedBy: "gpt-5",
      difficulty: this.mapCompetencyToDifficulty(session.targetCompetencyLevel),
    };

    const [test] = await db.insert(trainingTests).values(testData).returning();
    return test;
  }

  async submitTestAttempt(
    testId: string,
    sessionId: string,
    answers: any[]
  ): Promise<{ attempt: TestAttempt; passed: boolean; nextAction: string }> {
    const test = await this.getTestById(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Get attempt number
    const existingAttempts = await db
      .select()
      .from(testAttempts)
      .where(and(eq(testAttempts.testId, testId), eq(testAttempts.sessionId, sessionId)));

    const attemptNumber = existingAttempts.length + 1;

    // Grade the test
    const { score, feedback, passed } = await this.gradeTest(test, answers);

    const attemptData: InsertTestAttempt = {
      testId,
      sessionId,
      attemptNumber,
      answers,
      score,
      passed,
      feedback,
      timeSpent: 0, // Would be calculated from frontend
    };

    const [attempt] = await db.insert(testAttempts).values(attemptData).returning();

    // Update training session progress
    await this.updateSessionProgress(sessionId, passed, score);

    // Update agent training cost after test completion
    const session = await this.getTrainingSession(sessionId);
    if (session) {
      await this.updateAgentTrainingCost(session.agentId);
    }

    // Record experience
    await this.recordAgentExperience(sessionId, passed, score, feedback);

    // Determine next action
    const nextAction = await this.determineNextAction(sessionId, passed);

    return { attempt, passed, nextAction };
  }

  // === KNOWLEDGE MANAGEMENT ===

  async addKnowledge(data: InsertAgentKnowledgeBase): Promise<AgentKnowledgeBase> {
    const [knowledge] = await db.insert(agentKnowledgeBase).values(data).returning();
    return knowledge;
  }

  async getAgentKnowledge(agentId: string, specialtyId?: string): Promise<AgentKnowledgeBase[]> {
    return await db
      .select()
      .from(agentKnowledgeBase)
      .where(specialtyId 
        ? and(eq(agentKnowledgeBase.agentId, agentId), eq(agentKnowledgeBase.specialtyId, specialtyId))
        : eq(agentKnowledgeBase.agentId, agentId)
      )
      .orderBy(desc(agentKnowledgeBase.relevanceScore));
  }

  async updateKnowledgeConfidence(
    knowledgeId: string,
    confidenceChange: number
  ): Promise<void> {
    await db
      .update(agentKnowledgeBase)
      .set({
        confidence: Math.max(0, Math.min(100, confidenceChange)),
        lastAccessed: new Date(),
        accessCount: 1,
      })
      .where(eq(agentKnowledgeBase.id, knowledgeId));
  }

  // === EXPERIENCE TRACKING ===

  async recordAgentExperience(
    sessionId: string,
    success: boolean,
    score: number,
    feedback: any[]
  ): Promise<void> {
    const session = await this.getTrainingSession(sessionId);
    if (!session) return;

    const experienceData: InsertAgentExperience = {
      agentId: session.agentId,
      sessionId,
      experienceType: success ? "success" : "failure",
      context: `Training test attempt - Score: ${score}%`,
      outcome: success ? "Passed training test" : "Failed training test",
      lessonsLearned: feedback.filter(f => f.type === "improvement").map(f => f.message),
      emotionalResponse: success ? "confident" : "determined",
      impactScore: Math.min(100, score + (success ? 20 : 0)),
    };

    await db.insert(agentExperiences).values(experienceData);
  }

  async getAgentExperiences(agentId: string): Promise<AgentExperience[]> {
    return await db
      .select()
      .from(agentExperiences)
      .where(eq(agentExperiences.agentId, agentId))
      .orderBy(desc(agentExperiences.createdAt));
  }

  // === PROGRESS TRACKING ===

  async getTrainingProgress(sessionId: string): Promise<TrainingProgress> {
    const session = await this.getTrainingSession(sessionId);
    if (!session) {
      throw new Error("Training session not found");
    }

    const attempts = await db
      .select()
      .from(testAttempts)
      .where(eq(testAttempts.sessionId, sessionId));

    const passedTests = attempts.filter(a => a.passed).length;
    const totalTests = attempts.length;

    const knowledgeEntries = await this.getAgentKnowledge(session.agentId, session.specialtyId);
    const avgConfidence = knowledgeEntries.length > 0 
      ? knowledgeEntries.reduce((sum, k) => sum + (k.confidence ?? 0), 0) / knowledgeEntries.length
      : 0;

    // Analyze strengths and weaknesses
    const recentAttempts = attempts.slice(-3); // Last 3 attempts
    const strengths = this.identifyStrengths(recentAttempts);
    const weaknesses = this.identifyWeaknesses(recentAttempts);
    const nextSteps = this.generateNextSteps(session, weaknesses);

    return {
      sessionId,
      currentIteration: session.currentIteration ?? 0,
      progress: session.progress ?? 0,
      knowledgeGained: Math.round(avgConfidence),
      testsPassed: passedTests,
      totalTests,
      currentCompetencyLevel: session.currentCompetencyLevel ?? 'Beginner',
      strengths,
      weaknesses,
      nextSteps,
    };
  }

  // === AGENT MEMORY SYSTEM ===

  async getAgentMemory(agentId: string): Promise<AgentMemory> {
    const [knowledge, experiences] = await Promise.all([
      this.getAgentKnowledge(agentId),
      this.getAgentExperiences(agentId),
    ]);

    const factualKnowledge = knowledge.map(k => ({
      content: k.content,
      confidence: k.confidence ?? 0,
      source: k.source || "training",
      tags: k.tags as string[],
    }));

    const agentExperiences = experiences.map(e => ({
      context: e.context,
      outcome: e.outcome || "",
      lessons: e.lessonsLearned as string[],
      emotionalResponse: e.emotionalResponse || "neutral",
    }));

    // Calculate skills based on training progress
    const sessions = await this.getAgentTrainingSessions(agentId);
    const skills = await this.calculateAgentSkills(sessions);

    return {
      factualKnowledge,
      experiences: agentExperiences,
      skills,
    };
  }

  // === COMPETENCY QUESTION BANK MANAGEMENT ===

  async generateCompetencyQuestions(
    specialtyId: string,
    competencyLevel: string,
    count: number = 20
  ): Promise<CompetencyQuestion[]> {
    const specialty = await this.getSpecialtyById(specialtyId);
    if (!specialty) {
      throw new Error("Specialty not found");
    }

    try {
      // Get the competency-specific LLM adapter
      const llmAdapter = await this.getCompetencyLLMAdapter(specialty);
      
      // Generate questions using the specified LLM
      const questions = await llmAdapter.generateQuestions(
        specialty.name,
        competencyLevel,
        count
      );

      // Store questions in the competency question bank
      const storedQuestions: CompetencyQuestion[] = [];
      
      for (const q of questions) {
        const questionData: InsertCompetencyQuestion = {
          specialtyId,
          competencyLevel,
          question: q.question,
          questionType: q.type === 'multiple_choice' ? 'multiple_choice' : 'scenario',
          options: q.options ? (Array.isArray(q.options) ? q.options : Object.values(q.options)) : null,
          correctAnswer: q.correctAnswer ?? null,
          explanation: q.explanation ?? null,
          difficulty: q.difficulty ?? 'medium',
          tags: [specialty.name, specialty.domain, competencyLevel],
          skillsTested: [specialty.name], // Default from specialty
          scenario: null, // Default for ITestQuestion compatibility
          points: 10,
          isActive: true,
          createdBy: 'ai',
          generatedByLlm: llmAdapter.getProviderId()
        };

        const [storedQuestion] = await db
          .insert(competencyQuestionBank)
          .values(questionData)
          .returning();
        
        storedQuestions.push(storedQuestion);
      }

      return storedQuestions;
    } catch (error) {
      console.error(`Failed to generate competency questions:`, error);
      throw new Error(`Failed to generate questions for ${specialty.name} at ${competencyLevel} level`);
    }
  }

  async getCompetencyQuestions(
    specialtyId?: string,
    competencyLevel?: string,
    includeInactive: boolean = false
  ): Promise<CompetencyQuestion[]> {
    const conditions = [];

    if (specialtyId) {
      conditions.push(eq(competencyQuestionBank.specialtyId, specialtyId));
    }

    if (competencyLevel) {
      conditions.push(eq(competencyQuestionBank.competencyLevel, competencyLevel));
    }

    if (!includeInactive) {
      conditions.push(eq(competencyQuestionBank.isActive, true));
    }

    const base = db.select().from(competencyQuestionBank);
    const query = conditions.length > 0 ? base.where(and(...conditions)) : base;

    return await query.orderBy(desc(competencyQuestionBank.createdAt));
  }

  // === TRAINING COST TRACKING ===

  async calculateAgentTrainingCost(agentId: string): Promise<number> {
    try {
      // Get all training sessions for this agent
      const sessions = await db
        .select()
        .from(agentTrainingSessions)
        .where(eq(agentTrainingSessions.agentId, agentId));

      let totalCost = 0;

      for (const session of sessions) {
        // Get all tests for this session
        const tests = await db
          .select()
          .from(trainingTests)
          .where(eq(trainingTests.sessionId, session.id));

        for (const test of tests) {
          // Estimate cost for test generation
          const questions = test.questions as any[];
          if (questions && questions.length > 0) {
            // Estimate tokens used for generating questions
            const questionTokens = questions.reduce((total, q) => {
              const questionText = q.question || '';
              const optionsText = (q.options || []).join(' ');
              const explanationText = q.explanation || '';
              return total + countTokens(questionText + optionsText + explanationText);
            }, 0);

            // Get the specialty to determine which LLM was used
            const [specialty] = await db
              .select()
              .from(agentSpecialties)
              .where(eq(agentSpecialties.id, session.specialtyId));

            if (specialty) {
              // Get provider cost information
              const [provider] = await db
                .select()
                .from(providers)
                .where(eq(providers.id, specialty.llmProviderId));

              if (provider) {
                const costPer1kTokens = parseFloat(provider.costPer1kTokens);
                const testGenerationCost = (questionTokens / 1000) * costPer1kTokens;
                totalCost += testGenerationCost;
              }
            }
          }

          // Get all test attempts for grading costs
          const attempts = await db
            .select()
            .from(testAttempts)
            .where(eq(testAttempts.testId, test.id));

          for (const attempt of attempts) {
            // Estimate grading cost for essay/scenario questions
            const answers = attempt.answers as any[];
            if (answers && questions) {
              for (let i = 0; i < Math.min(answers.length, questions.length); i++) {
                const question = questions[i];
                const answer = answers[i];
                
                // Only count grading cost for non-multiple-choice questions
                if (question.type !== 'multiple_choice' && answer && typeof answer === 'string') {
                  const gradingTokens = countTokens(question.question + answer + (question.rubric || ''));
                  
                  // Use default cost estimation if provider not found
                  const estimatedCostPer1k = 0.01; // Default OpenAI cost
                  const gradingCost = (gradingTokens / 1000) * estimatedCostPer1k;
                  totalCost += gradingCost;
                }
              }
            }
          }
        }
      }

      return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Failed to calculate training cost:', error);
      return 0;
    }
  }

  async updateAgentTrainingCost(agentId: string): Promise<void> {
    try {
      const totalCost = await this.calculateAgentTrainingCost(agentId);
      
      // Training cost is computed on read - no need to store in database
      // Can be accessed via calculateAgentTrainingCost(agentId) when needed
      console.log(`Agent ${agentId} training cost calculated: $${totalCost}`);
    } catch (error) {
      console.error('Failed to calculate agent training cost:', error);
    }
  }

  // === PUBLIC UTILITY METHODS ===

  async getTestById(testId: string): Promise<TrainingTest | undefined> {
    const [test] = await db
      .select()
      .from(trainingTests)
      .where(eq(trainingTests.id, testId));
    return test;
  }

  async getAgentById(agentId: string): Promise<AgentLibrary | undefined> {
    const [agent] = await db
      .select()
      .from(agentLibrary)
      .where(eq(agentLibrary.id, agentId));
    return agent;
  }

  async updateAgent(agentId: string, updates: Partial<InsertAgentLibrary>): Promise<AgentLibrary> {
    const [agent] = await db
      .update(agentLibrary)
      .set(updates as any) // Type assertion for Drizzle compatibility
      .where(eq(agentLibrary.id, agentId))
      .returning();
    return agent;
  }

  private async generateLearningObjectives(
    specialty: AgentSpecialty,
    targetLevel: string
  ): Promise<string[]> {
    // Return static objectives to prevent timeout issues during training session creation
    return [
      `Understand core concepts of ${specialty.name}`,
      `Apply ${specialty.name} techniques effectively`,
      `Demonstrate ${targetLevel} proficiency in ${specialty.domain}`,
      `Master required knowledge areas: ${(specialty.requiredKnowledge as string[]).slice(0, 2).join(", ")}`,
    ];
  }

  private async generateTestQuestions(
    specialty: AgentSpecialty,
    competencyLevel: string,
    testType: string,
    iteration: number
  ): Promise<TestQuestion[]> {
    try {
      // Get the LLM provider configured for this competency
      const llmAdapter = await this.getCompetencyLLMAdapter(specialty);
      
      // Generate questions using the competency-specific LLM
      const questions = await llmAdapter.generateQuestions(
        specialty.name,
        competencyLevel,
        10 // Number of questions
      );

      // Convert to our TestQuestion format
      return questions.map((q, index) => {
        const skills = Array.isArray((q as any).skillsTested) ? (q as any).skillsTested : [specialty.name];
        const scenario = (q as any).scenario ?? null;
        
        return {
          id: q.id || `q${index + 1}`,
          type: q.type as 'multiple_choice' | 'scenario' | 'essay',
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: 10,
          rubric: q.explanation || 'Standard grading criteria',
          skillsTested: skills,
          scenario: scenario,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
        };
      });
    } catch (error) {
      console.error("Failed to generate test questions:", error);
      // Fallback to basic questions if generation fails
      return this.generateFallbackQuestions(specialty, competencyLevel);
    }
  }

  private async getCompetencyLLMAdapter(specialty: AgentSpecialty): Promise<CompetencyLLMAdapter> {
    // Get the provider details for this competency
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, specialty.llmProviderId));

    if (!provider) {
      console.warn(`LLM provider ${specialty.llmProviderId} not found for competency ${specialty.name}, using fallback`);
      // Fallback to a default provider if the specified one is not found
      console.log('Looking for enabled providers as fallback...');
      const enabledProviders = await db
        .select()
        .from(providers)
        .where(eq(providers.isEnabled, true));
      
      console.log('Found enabled providers:', enabledProviders.length);
      const [defaultProvider] = enabledProviders;
      
      if (!defaultProvider) {
        throw new Error(`No enabled LLM providers found`);
      }
      
      const apiKey = process.env[defaultProvider.apiKeyEnvVar];
      if (!apiKey) {
        throw new Error(`API key not found for provider ${defaultProvider.name}`);
      }

      return new CompetencyLLMAdapter(defaultProvider.id, defaultProvider.model, apiKey);
    }

    // Get the API key for this provider
    const apiKey = process.env[provider.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(`API key not found for provider ${provider.name}`);
    }

    return new CompetencyLLMAdapter(provider.id, provider.model, apiKey);
  }

  private generateFallbackQuestions(specialty: AgentSpecialty, competencyLevel: string): TestQuestion[] {
    // Generate basic fallback questions when LLM generation fails
    return [
      {
        id: 'fallback1',
        type: 'multiple_choice' as const,
        question: `What is a key principle of ${specialty.name}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `This tests fundamental understanding of ${specialty.name}`,
        points: 10,
        rubric: 'Standard grading criteria',
        skillsTested: [specialty.name],
        difficulty: 'medium' as const
      },
      {
        id: 'fallback2',
        type: 'scenario' as const,
        question: `Describe how you would apply ${specialty.name} principles in a real-world scenario.`,
        options: [],
        correctAnswer: 'Open-ended response demonstrating understanding',
        explanation: `This tests practical application of ${specialty.name}`,
        points: 15,
        rubric: 'Evaluate based on understanding and practical application',
        skillsTested: [specialty.name],
        difficulty: competencyLevel.toLowerCase() as 'easy' | 'medium' | 'hard'
      }
    ];
  }

  private async gradeTest(
    test: TrainingTest,
    answers: any[]
  ): Promise<{ score: number; feedback: any[]; passed: boolean }> {
    const questions = test.questions as TestQuestion[];
    let totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    let earnedPoints = 0;
    const feedback: any[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];
      
      if (question.type === "multiple_choice") {
        if (answer === question.correctAnswer) {
          earnedPoints += question.points;
          feedback.push({
            questionId: question.id,
            type: "correct",
            message: "Correct answer!",
          });
        } else {
          feedback.push({
            questionId: question.id,
            type: "incorrect",
            message: `Incorrect. The correct answer is: ${question.correctAnswer}`,
          });
        }
      } else {
        // For essay/practical questions, use AI grading
        const grade = await this.gradeEssayQuestion(question, answer);
        earnedPoints += grade.points;
        feedback.push({
          questionId: question.id,
          type: grade.points === question.points ? "correct" : "partial",
          message: grade.feedback,
        });
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (test.passingScore || 60);

    return { score, feedback, passed };
  }

  private async gradeEssayQuestion(
    question: TestQuestion,
    answer: string
  ): Promise<{ points: number; feedback: string }> {
    const prompt = `Grade this answer for the following question:

    Question: ${question.question}
    Rubric: ${question.rubric}
    Maximum Points: ${question.points}
    Student Answer: ${answer}

    Provide:
    1. Points earned (0 to ${question.points})
    2. Detailed feedback

    Format as JSON: {"points": number, "feedback": "detailed feedback"}`;

    try {
      // Use the LLM provider adapter instead of direct OpenAI
      const llmAdapter = new (await import("../adapters/LLMProviderAdapter")).LLMProviderAdapter(process.env.OPENAI_API_KEY || "");
      const responseText = await llmAdapter.generateText(prompt, { 
        maxTokens: 500
        // Note: GPT-5 only supports default temperature (1), so we omit the temperature parameter
      });

      const result = JSON.parse(responseText || "{}");
      return {
        points: Math.min(question.points, Math.max(0, result.points || 0)),
        feedback: result.feedback || "Answer reviewed.",
      };
    } catch (error) {
      console.error("Failed to grade essay question:", error);
      return {
        points: Math.floor(question.points * 0.5), // Give partial credit
        feedback: "Unable to grade automatically. Manual review recommended.",
      };
    }
  }

  private async initializeAgentKnowledge(agentId: string, specialtyId: string): Promise<void> {
    const specialty = await this.getSpecialtyById(specialtyId);
    if (!specialty) return;

    const requiredKnowledge = specialty.requiredKnowledge as string[];
    
    for (const knowledge of requiredKnowledge) {
      await this.addKnowledge({
        agentId,
        specialtyId,
        knowledgeType: "concept",
        content: knowledge,
        source: "initial_training",
        confidence: 25, // Start with low confidence
        relevanceScore: 75,
        tags: [specialty.domain, "core_concept"],
      });
    }
  }

  private async updateSessionProgress(sessionId: string, testPassed: boolean, score: number): Promise<void> {
    const session = await this.getTrainingSession(sessionId);
    if (!session) return;

    const newProgress = Math.min(100, (session.progress || 0) + (testPassed ? 15 : 5));
    const updates: Partial<AgentTrainingSession> = {
      progress: newProgress,
    };

    // Check if agent should advance competency level
    if (testPassed && score >= 90) {
      const currentLevel = session.currentCompetencyLevel || "Beginner";
      const specialty = await this.getSpecialtyById(session.specialtyId);
      
      if (specialty) {
        const levels = specialty.competencyLevels as string[];
        const currentIndex = levels.indexOf(currentLevel);
        
        if (currentIndex >= 0 && currentIndex < levels.length - 1) {
          updates.currentCompetencyLevel = levels[currentIndex + 1];
        }
      }
    }

    // Check if training is complete
    if (newProgress >= 100 && session.currentCompetencyLevel === session.targetCompetencyLevel) {
      updates.status = "completed";
      updates.completedAt = new Date();
    }

    await this.updateTrainingSession(sessionId, updates);
  }

  private async determineNextAction(sessionId: string, testPassed: boolean): Promise<string> {
    const session = await this.getTrainingSession(sessionId);
    if (!session) return "error";

    if (session.status === "completed") {
      return "training_complete";
    }

    if (testPassed) {
      if (session.currentCompetencyLevel === session.targetCompetencyLevel) {
        return "target_reached";
      } else {
        return "advance_level";
      }
    } else {
      if ((session.currentIteration || 0) >= (session.maxIterations || 10)) {
        return "max_iterations_reached";
      } else {
        return "continue_training";
      }
    }
  }

  private calculatePassingScore(competencyLevel: string): number {
    const scoreMap = {
      "Beginner": 60,
      "Intermediate": 70,
      "Advanced": 80,
      "Expert": 90,
    };
    return scoreMap[competencyLevel as keyof typeof scoreMap] || 70;
  }

  private mapCompetencyToDifficulty(competencyLevel: string): string {
    const difficultyMap = {
      "Beginner": "easy",
      "Intermediate": "intermediate",
      "Advanced": "hard",
      "Expert": "expert",
    };
    return difficultyMap[competencyLevel as keyof typeof difficultyMap] || "intermediate";
  }

  private identifyStrengths(attempts: TestAttempt[]): string[] {
    // Analyze recent test attempts to identify strengths
    return ["Quick learning", "Pattern recognition", "Analytical thinking"];
  }

  private identifyWeaknesses(attempts: TestAttempt[]): string[] {
    // Analyze recent test attempts to identify weaknesses
    return ["Practical application", "Complex scenarios"];
  }

  private generateNextSteps(session: AgentTrainingSession, weaknesses: string[]): string[] {
    return [
      "Focus on practical applications",
      "Review complex scenario examples",
      "Practice problem-solving techniques",
    ];
  }

  private async calculateAgentSkills(sessions: AgentTrainingSession[]): Promise<Array<{
    name: string;
    level: number;
    lastPracticed: Date;
    improvement: number;
  }>> {
    // Calculate skills based on training sessions
    const skillMap = new Map();
    
    for (const session of sessions) {
      const specialtyId = session.specialtyId;
      if (!specialtyId) continue;
      
      const specialty = await this.getSpecialtyById(specialtyId);
      if (specialty) {
        const skillLevel = this.mapCompetencyToLevel(session.currentCompetencyLevel ?? 'Beginner');
        skillMap.set(specialty.name, {
          name: specialty.name,
          level: skillLevel,
          lastPracticed: (session as any).updatedAt || session.createdAt || new Date(),
          improvement: session.progress ?? 0,
        });
      }
    }

    return Array.from(skillMap.values());
  }

  private mapCompetencyToLevel(competency: string): number {
    const levelMap = {
      "Beginner": 25,
      "Intermediate": 50,
      "Advanced": 75,
      "Expert": 100,
    };
    return levelMap[competency as keyof typeof levelMap] || 25;
  }
}