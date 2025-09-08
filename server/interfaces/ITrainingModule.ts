/**
 * Training Module Interface Definitions
 * Defines clear contracts between training functionality and external systems
 */

// === CORE TRAINING INTERFACES ===

export interface IAgent {
  id: string;
  name: string;
  description?: string;
  primaryPersonality?: string;
  secondaryPersonality?: string;
}

export interface ITrainingSpecialty {
  id: string;
  name: string;
  description?: string;
  domain: string;
  requiredKnowledge: string[];
  competencyLevels: string[];
  isArchived?: boolean;
}

export interface ITrainingSession {
  id: string;
  agentId: string;
  specialtyId: string;
  targetCompetencyLevel: string;
  currentCompetencyLevel: string;
  status: 'in_progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentIteration: number;
  maxIterations: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface ITrainingTest {
  id: string;
  sessionId: string;
  testType: string;
  questions: ITestQuestion[];
  passingScore: number;
  difficulty: string;
}

export interface ITestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ITestAttempt {
  id: string;
  testId: string;
  sessionId: string;
  answers: Array<{ questionId: string; answer: string }>;
  score: number;
  passed: boolean;
  feedback: string[];
  completedAt: Date;
}

// === EXTERNAL DEPENDENCY INTERFACES ===

export interface IAgentProvider {
  getAgent(id: string): Promise<IAgent | null>;
  getAllAgents(): Promise<IAgent[]>;
}

export interface ILLMProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  generateQuestions(specialty: string, level: string, count: number): Promise<ITestQuestion[]>;
  evaluateAnswer(question: string, answer: string, correctAnswer: string): Promise<{
    isCorrect: boolean;
    score: number;
    feedback: string;
  }>;
}

export interface IKnowledgeStore {
  storeKnowledge(agentId: string, knowledge: {
    content: string;
    source: string;
    confidence: number;
    tags: string[];
  }): Promise<void>;
  
  retrieveKnowledge(agentId: string, query: string): Promise<Array<{
    content: string;
    relevance: number;
    confidence: number;
  }>>;
}

// === TRAINING MODULE INTERFACE ===

export interface ITrainingModule {
  // Specialty Management
  createSpecialty(data: Omit<ITrainingSpecialty, 'id'>): Promise<ITrainingSpecialty>;
  getSpecialties(): Promise<ITrainingSpecialty[]>;
  updateSpecialty(id: string, updates: Partial<ITrainingSpecialty>): Promise<ITrainingSpecialty>;
  deleteSpecialty(id: string): Promise<void>;

  // Session Management
  startTrainingSession(data: {
    agentId: string;
    specialtyId: string;
    targetCompetencyLevel: string;
    maxIterations?: number;
  }): Promise<ITrainingSession>;
  
  getTrainingSession(id: string): Promise<ITrainingSession | null>;
  getAgentTrainingSessions(agentId: string): Promise<ITrainingSession[]>;
  getAllTrainingSessions(): Promise<ITrainingSession[]>;
  updateSessionProgress(id: string, progress: number): Promise<void>;
  completeTrainingSession(id: string): Promise<void>;

  // Test Management
  generateTest(sessionId: string, testType: string): Promise<ITrainingTest>;
  submitTestAttempt(testId: string, sessionId: string, answers: Array<{
    questionId: string;
    answer: string;
  }>): Promise<ITestAttempt>;
  
  getTestsForSession(sessionId: string): Promise<ITrainingTest[]>;
  getTestAttemptsForSession(sessionId: string): Promise<ITestAttempt[]>;

  // Progress Tracking
  getTrainingProgress(sessionId: string): Promise<{
    session: ITrainingSession;
    currentTest?: ITrainingTest;
    latestAttempt?: ITestAttempt;
    nextSteps: string[];
  }>;
}

// === EVENT INTERFACES ===

export interface ITrainingEvent {
  type: 'session_started' | 'session_completed' | 'test_generated' | 'test_completed' | 'competency_achieved';
  sessionId: string;
  agentId: string;
  data: any;
  timestamp: Date;
}

export interface ITrainingEventHandler {
  handleEvent(event: ITrainingEvent): Promise<void>;
}

// === CONFIGURATION INTERFACE ===

export interface ITrainingModuleConfig {
  llmProvider: ILLMProvider;
  agentProvider: IAgentProvider;
  knowledgeStore: IKnowledgeStore;
  eventHandlers?: ITrainingEventHandler[];
  
  // Training Parameters
  defaultMaxIterations: number;
  testGenerationTimeout: number;
  competencyThresholds: {
    [level: string]: number; // minimum score required
  };
}