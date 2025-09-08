import { db } from "./db";
import { agentSpecialties } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

const DEFAULT_SPECIALTIES = [
  {
    id: "analytical-thinking",
    name: "Analytical Thinking",
    domain: "Cognitive Skills",
    description: "Ability to analyze complex problems and make data-driven decisions",
    requiredKnowledge: ["Problem solving", "Critical thinking", "Data analysis"],
    competencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"],
    llmProviderId: "anthropic-claude"
  },
  {
    id: "creative-problem-solving",
    name: "Creative Problem Solving",
    domain: "Innovation Skills", 
    description: "Generate innovative solutions to complex challenges",
    requiredKnowledge: ["Creative thinking", "Brainstorming", "Innovation methods"],
    competencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"],
    llmProviderId: "openai-gpt5"
  },
  {
    id: "emotional-intelligence",
    name: "Emotional Intelligence",
    domain: "Interpersonal Skills",
    description: "Understanding and managing emotions in communication",
    requiredKnowledge: ["Empathy", "Communication", "Social awareness"],
    competencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"],
    llmProviderId: "anthropic-claude"
  },
  {
    id: "strategic-planning",
    name: "Strategic Planning",
    domain: "Leadership Skills",
    description: "Long-term thinking and strategic decision making",
    requiredKnowledge: ["Strategy", "Planning", "Decision making"],
    competencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"],
    llmProviderId: "google-gemini"
  },
  {
    id: "technical-expertise",
    name: "Technical Expertise",
    domain: "Domain Knowledge",
    description: "Deep technical knowledge in specific fields",
    requiredKnowledge: ["Technical skills", "Domain expertise", "Problem solving"],
    competencyLevels: ["Beginner", "Intermediate", "Advanced", "Expert"],
    llmProviderId: "openai-gpt5"
  }
];

export async function seedSpecialties() {
  try {
    console.log("🌱 Seeding default training specialties...");
    
    for (const specialty of DEFAULT_SPECIALTIES) {
      // Check if specialty already exists
      const existing = await db
        .select()
        .from(agentSpecialties)
        .where(eq(agentSpecialties.id, specialty.id))
        .limit(1);
        
      if (existing.length === 0) {
        console.log(`  📚 Creating specialty: ${specialty.name}`);
        await db
          .insert(agentSpecialties)
          .values(specialty)
          .onConflictDoNothing();
      } else {
        console.log(`  ✅ Specialty already exists: ${specialty.name}`);
      }
    }
    
    console.log("✅ Training specialties seeding completed");
  } catch (error) {
    console.error("❌ Failed to seed training specialties:", error);
    // Don't throw here - let the app continue even if seeding fails
  }
}