import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, decimal, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  model: text("model").notNull(),
  availableModels: jsonb("available_models").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  apiKeyEnvVar: text("api_key_env_var").notNull(),
  costPer1kTokens: decimal("cost_per_1k_tokens", { precision: 10, scale: 6 }).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  quotaUsed: decimal("quota_used", { precision: 10, scale: 6 }).notNull().default("0"),
  quotaLimit: decimal("quota_limit", { precision: 10, scale: 6 }).notNull().default("100"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  // Enhanced fields for robustness
  description: text("description"),
  website: text("website"),
  documentation: text("documentation"),
  maxTokens: integer("max_tokens").default(4096),
  supportedFeatures: jsonb("supported_features").$type<{
    streaming: boolean;
    functionCalling: boolean;
    imageAnalysis: boolean;
    codeGeneration: boolean;
    multiModal: boolean;
  }>().default(sql`'{
    "streaming": true,
    "functionCalling": false,
    "imageAnalysis": false,
    "codeGeneration": true,
    "multiModal": false
  }'::jsonb`),
  rateLimit: jsonb("rate_limit").$type<{
    requestsPerMinute: number;
    tokensPerMinute: number;
    tokensPerDay: number;
  }>().default(sql`'{
    "requestsPerMinute": 60,
    "tokensPerMinute": 10000,
    "tokensPerDay": 100000
  }'::jsonb`),
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const folders: any = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  parentId: varchar("parent_id").references((): any => folders.id),
  path: text("path"), // Store full path for easier querying
  level: integer("level").default(0), // 0=root, 1=first level, 2=second level, 3=third level
  sourceType: text("source_type").default("manual"), // "manual" or "dropbox"
  sourceId: text("source_id"), // Dropbox folder ID if from Dropbox
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  size: integer("size"),
  folderId: varchar("folder_id").references(() => folders.id),
  uploadedAt: timestamp("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  selectedProviders: jsonb("selected_providers").$type<string[]>(),
  selectedFolders: jsonb("selected_folders").$type<string[]>(),
  tokenCount: integer("token_count"),
  totalCost: decimal("total_cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").references(() => prompts.id).notNull(),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  responseTime: integer("response_time_ms"),
  artifacts: jsonb("artifacts").$type<Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const batchTests = pgTable("batch_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  prompts: jsonb("prompts").$type<string[]>().notNull(),
  selectedProviders: jsonb("selected_providers").$type<string[]>().notNull(),
  selectedFolders: jsonb("selected_folders").$type<string[]>(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  totalCost: decimal("total_cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
});

export const batchResults = pgTable("batch_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchTestId: varchar("batch_test_id").references(() => batchTests.id).notNull(),
  promptIndex: integer("prompt_index").notNull(),
  promptContent: text("prompt_content").notNull(),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  responseContent: text("response_content").notNull(),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  responseTime: integer("response_time_ms"),
  artifacts: jsonb("artifacts").$type<Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }>>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const promptSequences = pgTable("prompt_sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  taskObjective: text("task_objective").notNull(),
  initialPrompt: text("initial_prompt").notNull(),
  llmChain: jsonb("llm_chain").$type<Array<{
    step: number;
    providerId: string;
    customInstructions?: string;
    primaryPersonality?: string;
    secondaryPersonality?: string;
    isDevilsAdvocate?: boolean;
  }>>().notNull(),
  selectedFolders: jsonb("selected_folders").$type<string[]>(),
  iterations: integer("iterations").notNull().default(1),
  synthesisProviderId: text("synthesis_provider_id"),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  totalCost: decimal("total_cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
});

export const sequenceSteps = pgTable("sequence_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").references(() => promptSequences.id).notNull(),
  iterationNumber: integer("iteration_number").notNull().default(1),
  stepNumber: integer("step_number").notNull(),
  providerId: varchar("provider_id").references(() => providers.id).notNull(),
  inputPrompt: text("input_prompt").notNull(),
  outputContent: text("output_content"),
  tokensUsed: integer("tokens_used"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  responseTime: integer("response_time_ms"),
  artifacts: jsonb("artifacts").$type<Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }>>(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  isSynthesis: boolean("is_synthesis").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Define valid HBDI thinking styles
const validPersonalities = [
  "Analytical", 
  "Practical", 
  "Relational", 
  "Experimental", 
  "Strategic", 
  "Expressive", 
  "Safekeeping", 
  "Organizing"
] as const;

export const agentLibrary = pgTable("agent_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  primaryPersonality: text("primary_personality"),
  secondaryPersonality: text("secondary_personality"),
  isDevilsAdvocate: boolean("is_devils_advocate").notNull().default(false),
  supplementalPrompt: text("supplemental_prompt"),
  preferredProviderId: varchar("preferred_provider_id"), // Remove foreign key constraint as providers are managed in-memory
  isArchived: boolean("is_archived").notNull().default(false),
  isTestAgent: boolean("is_test_agent").notNull().default(false), // Flag for development/test agents
  environment: varchar("environment", { length: 20 }).default("production"), // "production", "development", "test"
  experience: jsonb("experience").$type<{
    meetingsParticipated: number;
    topicsExplored: string[];
    keyInsights: string[];
    collaborationHistory: Array<{
      meetingId: string;
      role: string;
      keyContributions: string[];
      timestamp: string;
    }>;
  }>().default(sql`'{
    "meetingsParticipated": 0,
    "topicsExplored": [],
    "keyInsights": [],
    "collaborationHistory": []
  }'::jsonb`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Agent Training System Tables
export const agentSpecialties = pgTable("agent_specialties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  domain: varchar("domain", { length: 100 }).notNull(), // e.g., "technical", "creative", "analytical"
  requiredKnowledge: jsonb("required_knowledge").default(sql`'[]'::jsonb`),
  competencyLevels: jsonb("competency_levels").default(sql`'["Beginner", "Intermediate", "Advanced", "Expert"]'::jsonb`),
  llmProviderId: varchar("llm_provider_id", { length: 100 }).notNull().default("openai-gpt5"), // LLM used for competency question generation
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const agentTrainingSessions = pgTable("agent_training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agentLibrary.id, { onDelete: "cascade" }),
  specialtyId: varchar("specialty_id").notNull().references(() => agentSpecialties.id, { onDelete: "cascade" }),
  targetCompetencyLevel: varchar("target_competency_level", { length: 50 }).notNull(),
  currentCompetencyLevel: varchar("current_competency_level", { length: 50 }).default("Beginner"),
  status: varchar("status", { length: 50 }).default("in_progress"), // in_progress, completed, failed
  trainingMaterials: jsonb("training_materials").default(sql`'[]'::jsonb`),
  learningObjectives: jsonb("learning_objectives").default(sql`'[]'::jsonb`),
  progress: integer("progress").default(0), // 0-100
  currentIteration: integer("current_iteration").default(1),
  maxIterations: integer("max_iterations").default(10),
  startedAt: timestamp("started_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const trainingTests = pgTable("training_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => agentTrainingSessions.id, { onDelete: "cascade" }),
  testType: varchar("test_type", { length: 50 }).notNull(), // "knowledge", "application", "synthesis"
  questions: jsonb("questions").notNull(), // Array of test questions
  passingScore: integer("passing_score").default(80),
  generatedBy: varchar("generated_by", { length: 50 }).notNull(), // AI model used for generation
  difficulty: varchar("difficulty", { length: 20 }).default("intermediate"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const testAttempts = pgTable("test_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").notNull().references(() => trainingTests.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => agentTrainingSessions.id, { onDelete: "cascade" }),
  attemptNumber: integer("attempt_number").notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  feedback: jsonb("feedback").default(sql`'[]'::jsonb`),
  timeSpent: integer("time_spent"), // seconds
  completedAt: timestamp("completed_at").default(sql`CURRENT_TIMESTAMP`),
});

export const agentKnowledgeBase = pgTable("agent_knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agentLibrary.id, { onDelete: "cascade" }),
  specialtyId: varchar("specialty_id").references(() => agentSpecialties.id, { onDelete: "cascade" }),
  knowledgeType: varchar("knowledge_type", { length: 50 }).notNull(), // "fact", "concept", "procedure", "experience"
  content: text("content").notNull(),
  source: varchar("source", { length: 100 }), // training session, experience, etc.
  confidence: integer("confidence").default(50), // 0-100
  relevanceScore: integer("relevance_score").default(50), // 0-100
  lastAccessed: timestamp("last_accessed").default(sql`CURRENT_TIMESTAMP`),
  accessCount: integer("access_count").default(0),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const agentExperiences = pgTable("agent_experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agentLibrary.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").references(() => agentTrainingSessions.id, { onDelete: "set null" }),
  experienceType: varchar("experience_type", { length: 50 }).notNull(), // "success", "failure", "learning", "interaction"
  context: text("context").notNull(),
  outcome: text("outcome"),
  lessonsLearned: jsonb("lessons_learned").default(sql`'[]'::jsonb`),
  emotionalResponse: varchar("emotional_response", { length: 50 }), // for personality development
  impactScore: integer("impact_score").default(50), // 0-100, how significant this experience was
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const competencyQuestionBank = pgTable("competency_question_bank", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  specialtyId: varchar("specialty_id").notNull().references(() => agentSpecialties.id, { onDelete: "cascade" }),
  competencyLevel: varchar("competency_level", { length: 50 }).notNull(), // "Beginner", "Intermediate", "Advanced", "Expert"
  question: text("question").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(), // "multiple_choice", "short_answer", "essay"
  options: jsonb("options").$type<string[]>().default(sql`'[]'::jsonb`), // For multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: varchar("difficulty", { length: 20 }).default("medium"), // "easy", "medium", "hard"
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
  skillsTested: jsonb("skills_tested").$type<string[]>().default(sql`'[]'::jsonb`),
  scenario: text("scenario"), // Context or situation description
  points: integer("points").default(10), // Points for correct answer
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by", { length: 50 }).default("system"), // "system", "user", "ai"
  generatedByLlm: varchar("generated_by_llm", { length: 100 }), // LLM provider that generated this question
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertProviderSchema = createInsertSchema(providers).omit({ id: true });
export const insertFolderSchema = createInsertSchema(folders).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Folder name cannot be empty")
});
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPromptSchema = createInsertSchema(prompts).omit({ id: true, createdAt: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true, createdAt: true });
export const insertBatchTestSchema = createInsertSchema(batchTests).omit({ id: true, createdAt: true, completedAt: true });
export const insertBatchResultSchema = createInsertSchema(batchResults).omit({ id: true, createdAt: true });
export const insertPromptSequenceSchema = createInsertSchema(promptSequences).omit({ id: true, createdAt: true, completedAt: true });
export const insertSequenceStepSchema = createInsertSchema(sequenceSteps).omit({ id: true, createdAt: true });
// Base agent library schema without complex validation
const baseAgentLibraryInsert = createInsertSchema(agentLibrary)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1, "Name is required and cannot be empty"),
    primaryPersonality: z.enum(validPersonalities).optional(),
    secondaryPersonality: z.enum(validPersonalities).optional(),
  });

// Insert schema with validation refinements
export const insertAgentLibrarySchema = baseAgentLibraryInsert
  .refine(
    (data) => !data.primaryPersonality || !data.secondaryPersonality || data.primaryPersonality !== data.secondaryPersonality,
    {
      message: "Secondary personality must be different from primary personality",
      path: ["secondaryPersonality"],
    }
  );

// Update schema for partial updates
export const updateAgentLibrarySchema = baseAgentLibraryInsert.partial();

// Training system insert schemas
export const insertAgentSpecialtySchema = createInsertSchema(agentSpecialties).omit({ id: true, createdAt: true });
export const insertAgentTrainingSessionSchema = createInsertSchema(agentTrainingSessions).omit({ id: true, createdAt: true, completedAt: true });
export const insertTrainingTestSchema = createInsertSchema(trainingTests).omit({ id: true, createdAt: true });
export const insertTestAttemptSchema = createInsertSchema(testAttempts).omit({ id: true, completedAt: true });
export const insertAgentKnowledgeBaseSchema = createInsertSchema(agentKnowledgeBase).omit({ id: true, createdAt: true, updatedAt: true, lastAccessed: true });
export const insertAgentExperienceSchema = createInsertSchema(agentExperiences).omit({ id: true, createdAt: true });
export const insertCompetencyQuestionSchema = createInsertSchema(competencyQuestionBank).omit({ id: true, createdAt: true, updatedAt: true });

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type BatchTest = typeof batchTests.$inferSelect;
export type InsertBatchTest = z.infer<typeof insertBatchTestSchema>;
export type BatchResult = typeof batchResults.$inferSelect;
export type InsertBatchResult = z.infer<typeof insertBatchResultSchema>;
export type PromptSequence = typeof promptSequences.$inferSelect;
export type InsertPromptSequence = z.infer<typeof insertPromptSequenceSchema>;
export type SequenceStep = typeof sequenceSteps.$inferSelect;
export type InsertSequenceStep = z.infer<typeof insertSequenceStepSchema>;
export type AgentLibrary = typeof agentLibrary.$inferSelect;
export type InsertAgentLibrary = z.infer<typeof insertAgentLibrarySchema>;

// Training system types
export type AgentSpecialty = typeof agentSpecialties.$inferSelect;
export type InsertAgentSpecialty = z.infer<typeof insertAgentSpecialtySchema>;
export type AgentTrainingSession = typeof agentTrainingSessions.$inferSelect;
export type InsertAgentTrainingSession = z.infer<typeof insertAgentTrainingSessionSchema>;
export type TrainingTest = typeof trainingTests.$inferSelect;
export type InsertTrainingTest = z.infer<typeof insertTrainingTestSchema>;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
export type AgentKnowledgeBase = typeof agentKnowledgeBase.$inferSelect;
export type InsertAgentKnowledgeBase = z.infer<typeof insertAgentKnowledgeBaseSchema>;
export type AgentExperience = typeof agentExperiences.$inferSelect;
export type InsertAgentExperience = z.infer<typeof insertAgentExperienceSchema>;
export type CompetencyQuestion = typeof competencyQuestionBank.$inferSelect;
export type InsertCompetencyQuestion = z.infer<typeof insertCompetencyQuestionSchema>;

export interface PromptRequest {
  content: string;
  selectedProviders: string[];
  selectedFolders: string[];
  conversationId?: string;
}

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
  cost: number;
  responseTime: number;
  artifacts: Array<{
    type: string;
    name: string;
    content: string;
    language?: string;
  }>;
}

export interface BatchTestRequest {
  name: string;
  description?: string;
  prompts: string[];
  selectedProviders: string[];
  selectedFolders: string[];
}

export interface PromptSequenceRequest {
  name: string;
  description?: string;
  taskObjective: string;
  initialPrompt: string;
  llmChain: Array<{
    step: number;
    providerId: string;
    customInstructions?: string;
    primaryPersonality?: string;
    secondaryPersonality?: string;
    isDevilsAdvocate?: boolean;
  }>;
  selectedFolders: string[];
  iterations: number;
  synthesisProviderId?: string;
}

// Training system interfaces
export interface TrainingSessionRequest {
  agentId: string;
  specialtyId: string;
  targetCompetencyLevel: string;
  trainingMaterials?: string[];
  learningObjectives?: string[];
  maxIterations?: number;
}

export interface TestQuestion {
  id: string;
  type: 'multiple_choice' | 'essay' | 'practical' | 'scenario' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer?: string;
  rubric?: string;
  points: number;
  explanation?: string;
  skillsTested?: string[];
  scenario?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TrainingProgress {
  sessionId: string;
  currentIteration: number;
  progress: number;
  knowledgeGained: number;
  testsPassed: number;
  totalTests: number;
  currentCompetencyLevel: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export interface AgentMemory {
  factualKnowledge: Array<{
    content: string;
    confidence: number;
    source: string;
    tags: string[];
  }>;
  experiences: Array<{
    context: string;
    outcome: string;
    lessons: string[];
    emotionalResponse: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    lastPracticed: Date;
    improvement: number;
  }>;
}
