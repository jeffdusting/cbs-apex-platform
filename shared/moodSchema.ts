import { z } from "zod";

// Agent mood types based on collaboration states
export const AgentMoodType = z.enum([
  "focused",      // Deep in thought, analyzing
  "excited",      // Enthusiastic about ideas
  "collaborative", // Actively engaging with others
  "contemplative", // Pondering, reflecting
  "energetic",    // High energy, ready to contribute
  "analytical",   // In problem-solving mode
  "creative",     // In ideation phase
  "supportive",   // Helping others
  "curious",      // Asking questions, exploring
  "confident",    // Sure about their position
  "neutral"       // Default state
]);

// Agent status types for activity tracking
export const AgentStatusType = z.enum([
  "idle",         // Not currently active
  "thinking",     // Processing information
  "typing",       // Generating response
  "listening",    // Receiving input
  "responding",   // Actively responding
  "synthesizing", // Combining ideas
  "reviewing",    // Analyzing others' contributions
  "offline"       // Not participating
]);

// Mood change triggers
export const MoodTrigger = z.enum([
  "positive_feedback",    // Received positive response
  "challenge_presented",  // New problem to solve
  "collaboration_start",  // Beginning interaction
  "idea_breakthrough",    // Had an insight
  "disagreement",        // Conflicting viewpoints
  "completion",          // Task finished
  "complexity_increase", // Problem got harder
  "support_given",       // Helped someone
  "support_received",    // Got help from others
  "timeout",             // Natural mood decay
  "reset"                // Manual reset
]);

// Agent mood state schema
export const agentMoodSchema = z.object({
  agentId: z.string(),
  mood: AgentMoodType,
  status: AgentStatusType,
  intensity: z.number().min(0.1).max(1.0), // How strong the mood is
  timestamp: z.number(),
  trigger: MoodTrigger.optional(),
  duration: z.number().optional(), // How long mood should last (ms)
  metadata: z.record(z.any()).optional() // Additional context
});

export const moodUpdateSchema = z.object({
  meetingId: z.string(),
  agentId: z.string(),
  mood: AgentMoodType.optional(),
  status: AgentStatusType.optional(),
  trigger: MoodTrigger,
  intensity: z.number().min(0.1).max(1.0).optional(),
  metadata: z.record(z.any()).optional()
});

export type AgentMood = z.infer<typeof agentMoodSchema>;
export type MoodUpdate = z.infer<typeof moodUpdateSchema>;
export type AgentMoodType = z.infer<typeof AgentMoodType>;
export type AgentStatusType = z.infer<typeof AgentStatusType>;
export type MoodTriggerType = z.infer<typeof MoodTrigger>;