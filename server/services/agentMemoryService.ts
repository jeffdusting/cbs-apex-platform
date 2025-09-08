/**
 * Agent Memory Service
 * Manages agent memory, expertise development, and knowledge recall
 */

import { eq, and, desc, sql, or } from "drizzle-orm";
import { db } from "../db";
import {
  agentKnowledgeBase,
  agentExperiences,
  agentLibrary,
  type AgentKnowledgeBase,
  type AgentExperience,
  type AgentMemory,
  type InsertAgentKnowledgeBase,
  type InsertAgentExperience,
} from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MemorySearchQuery {
  query: string;
  context?: string;
  specialtyId?: string;
  limit?: number;
  minRelevance?: number;
}

export interface MemoryRecall {
  facts: AgentKnowledgeBase[];
  experiences: AgentExperience[];
  relevanceScore: number;
  contextualInsights: string[];
  suggestedActions: string[];
}

export interface ExpertiseProfile {
  agentId: string;
  specialties: Array<{
    specialtyId: string;
    name: string;
    competencyLevel: string;
    knowledgeDepth: number;
    experienceCount: number;
    confidenceScore: number;
    recentActivity: Date;
    strongAreas: string[];
    developingAreas: string[];
  }>;
  overallExpertise: number;
  learningVelocity: number;
  knowledgeRetention: number;
  adaptabilityScore: number;
}

export class AgentMemoryService {
  /**
   * Store new knowledge in agent's memory
   */
  async storeKnowledge(data: InsertAgentKnowledgeBase): Promise<AgentKnowledgeBase> {
    // Check for existing similar knowledge to avoid duplicates
    const existingKnowledge = await this.findSimilarKnowledge(data.agentId, data.content);
    
    if (existingKnowledge.length > 0) {
      // Update existing knowledge instead of creating duplicate
      const existing = existingKnowledge[0];
      const updatedKnowledge = await this.updateKnowledgeConfidence(
        existing.id,
        Math.min(100, (existing.confidence || 0) + 10)
      );
      return updatedKnowledge || existing;
    }

    // Store new knowledge
    const [knowledge] = await db.insert(agentKnowledgeBase).values(data).returning();
    
    // Update agent's learning statistics
    await this.updateLearningStats(data.agentId);
    
    return knowledge;
  }

  /**
   * Record an experience in agent's memory
   */
  async recordExperience(data: InsertAgentExperience): Promise<AgentExperience> {
    const [experience] = await db.insert(agentExperiences).values(data).returning();
    
    // Extract and store insights from the experience
    await this.extractInsightsFromExperience(experience);
    
    // Update agent's experience statistics
    await this.updateExperienceStats(data.agentId);
    
    return experience;
  }

  /**
   * Intelligent memory recall based on context
   */
  async recallMemory(agentId: string, query: MemorySearchQuery): Promise<MemoryRecall> {
    const { query: searchQuery, context, specialtyId, limit = 10, minRelevance = 0.3 } = query;

    // Search relevant knowledge
    const relevantKnowledge = await this.searchKnowledge(agentId, searchQuery, specialtyId, limit);
    
    // Search relevant experiences
    const relevantExperiences = await this.searchExperiences(agentId, searchQuery, limit);
    
    // Calculate overall relevance score
    const relevanceScore = this.calculateRelevanceScore(relevantKnowledge, relevantExperiences, searchQuery);
    
    // Generate contextual insights
    const contextualInsights = await this.generateContextualInsights(
      relevantKnowledge,
      relevantExperiences,
      searchQuery,
      context
    );
    
    // Suggest actions based on memory recall
    const suggestedActions = await this.generateActionSuggestions(
      relevantKnowledge,
      relevantExperiences,
      searchQuery
    );

    // Update access counts for recalled knowledge
    await this.updateAccessCounts(relevantKnowledge, relevantExperiences);

    return {
      facts: relevantKnowledge,
      experiences: relevantExperiences,
      relevanceScore,
      contextualInsights,
      suggestedActions,
    };
  }

  /**
   * Get comprehensive agent memory
   */
  async getAgentMemory(agentId: string): Promise<AgentMemory> {
    const [knowledge, experiences] = await Promise.all([
      this.getAgentKnowledge(agentId),
      this.getAgentExperiences(agentId),
    ]);

    const factualKnowledge = knowledge.map(k => ({
      content: k.content,
      confidence: k.confidence || 0,
      source: k.source || "unknown",
      tags: k.tags as string[],
    }));

    const agentExperiences = experiences.map(e => ({
      context: e.context,
      outcome: e.outcome || "",
      lessons: e.lessonsLearned as string[],
      emotionalResponse: e.emotionalResponse || "neutral",
    }));

    // Calculate skills from knowledge and experiences
    const skills = await this.calculateAgentSkills(agentId);

    return {
      factualKnowledge,
      experiences: agentExperiences,
      skills,
    };
  }

  /**
   * Build comprehensive expertise profile
   */
  async buildExpertiseProfile(agentId: string): Promise<ExpertiseProfile> {
    // Get all knowledge grouped by specialty
    const knowledgeBySpecialty = await this.getKnowledgeBySpecialty(agentId);
    
    // Get all experiences grouped by specialty
    const experiencesBySpecialty = await this.getExperiencesBySpecialty(agentId);
    
    // Build specialty profiles
    const specialties = await this.buildSpecialtyProfiles(
      agentId,
      knowledgeBySpecialty,
      experiencesBySpecialty
    );
    
    // Calculate overall metrics
    const overallExpertise = this.calculateOverallExpertise(specialties);
    const learningVelocity = await this.calculateLearningVelocity(agentId);
    const knowledgeRetention = await this.calculateKnowledgeRetention(agentId);
    const adaptabilityScore = await this.calculateAdaptabilityScore(agentId);

    return {
      agentId,
      specialties,
      overallExpertise,
      learningVelocity,
      knowledgeRetention,
      adaptabilityScore,
    };
  }

  /**
   * Strengthen knowledge based on successful usage
   */
  async reinforceKnowledge(agentId: string, knowledgeId: string, successContext: string): Promise<void> {
    // Increase confidence
    await this.updateKnowledgeConfidence(knowledgeId, 5);
    
    // Record positive experience
    await this.recordExperience({
      agentId,
      sessionId: null,
      experienceType: "knowledge_application",
      context: successContext,
      outcome: "Successfully applied knowledge",
      lessonsLearned: ["Knowledge application was effective"],
      emotionalResponse: "confident",
      impactScore: 75,
    });
  }

  /**
   * Update knowledge when usage fails
   */
  async correctKnowledge(
    agentId: string,
    knowledgeId: string,
    failureContext: string,
    correction: string
  ): Promise<void> {
    // Decrease confidence slightly
    await this.updateKnowledgeConfidence(knowledgeId, -2);
    
    // Add corrected knowledge
    await this.storeKnowledge({
      agentId,
      specialtyId: "", // Will be filled by the knowledge entry
      knowledgeType: "correction",
      content: correction,
      source: "failure_correction",
      confidence: 70,
      relevanceScore: 80,
      tags: ["correction", "improvement"],
    });
    
    // Record learning experience
    await this.recordExperience({
      agentId,
      sessionId: null,
      experienceType: "mistake_correction",
      context: failureContext,
      outcome: "Learned from mistake",
      lessonsLearned: [correction],
      emotionalResponse: "determined",
      impactScore: 60,
    });
  }

  /**
   * Forget obsolete or low-confidence knowledge
   */
  async forgetObsoleteKnowledge(agentId: string): Promise<number> {
    // Find knowledge with very low confidence that hasn't been accessed recently
    const obsoleteKnowledge = await db
      .select()
      .from(agentKnowledgeBase)
      .where(
        and(
          eq(agentKnowledgeBase.agentId, agentId),
          sql`${agentKnowledgeBase.confidence} < 20`,
          sql`${agentKnowledgeBase.lastAccessed} < NOW() - INTERVAL '30 days'`
        )
      );

    // Remove obsolete knowledge
    for (const knowledge of obsoleteKnowledge) {
      await db
        .delete(agentKnowledgeBase)
        .where(eq(agentKnowledgeBase.id, knowledge.id));
    }

    return obsoleteKnowledge.length;
  }

  // === PRIVATE HELPER METHODS ===

  private async findSimilarKnowledge(agentId: string, content: string): Promise<AgentKnowledgeBase[]> {
    // Simple similarity check - in production, you might use vector embeddings
    const keywords = content.toLowerCase().split(' ').filter(word => word.length > 3);
    
    if (keywords.length === 0) return [];

    // Create OR conditions for each keyword
    const keywordConditions = keywords.map(keyword => 
      sql`LOWER(${agentKnowledgeBase.content}) LIKE ${`%${keyword}%`}`
    );

    const similar = await db
      .select()
      .from(agentKnowledgeBase)
      .where(
        and(
          eq(agentKnowledgeBase.agentId, agentId),
          or(...keywordConditions)
        )
      )
      .limit(3);

    return similar;
  }

  private async updateKnowledgeConfidence(
    knowledgeId: string,
    newConfidence: number
  ): Promise<AgentKnowledgeBase | undefined> {
    const [updated] = await db
      .update(agentKnowledgeBase)
      .set({
        confidence: Math.max(0, Math.min(100, newConfidence)),
        lastAccessed: new Date(),
        accessCount: sql`${agentKnowledgeBase.accessCount} + 1`,
      })
      .where(eq(agentKnowledgeBase.id, knowledgeId))
      .returning();

    return updated;
  }

  private async searchKnowledge(
    agentId: string,
    query: string,
    specialtyId?: string,
    limit: number = 10
  ): Promise<AgentKnowledgeBase[]> {
    const conditions = [eq(agentKnowledgeBase.agentId, agentId)];
    
    if (specialtyId) {
      conditions.push(eq(agentKnowledgeBase.specialtyId, specialtyId));
    }

    // Simple text search - in production, use full-text search or vector similarity
    if (query.trim()) {
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      if (keywords.length > 0) {
        conditions.push(
          sql`LOWER(${agentKnowledgeBase.content}) LIKE ANY(${keywords.map(k => `%${k}%`)})`
        );
      }
    }

    return await db
      .select()
      .from(agentKnowledgeBase)
      .where(and(...conditions))
      .orderBy(desc(agentKnowledgeBase.relevanceScore), desc(agentKnowledgeBase.confidence))
      .limit(limit);
  }

  private async searchExperiences(
    agentId: string,
    query: string,
    limit: number = 10
  ): Promise<AgentExperience[]> {
    const conditions = [eq(agentExperiences.agentId, agentId)];

    // Simple text search in context and lessons learned
    if (query.trim()) {
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      if (keywords.length > 0) {
        conditions.push(
          sql`LOWER(${agentExperiences.context}) LIKE ANY(${keywords.map(k => `%${k}%`)}) OR 
              LOWER(${agentExperiences.outcome}) LIKE ANY(${keywords.map(k => `%${k}%`)})`
        );
      }
    }

    return await db
      .select()
      .from(agentExperiences)
      .where(and(...conditions))
      .orderBy(desc(agentExperiences.impactScore), desc(agentExperiences.createdAt))
      .limit(limit);
  }

  private calculateRelevanceScore(
    knowledge: AgentKnowledgeBase[],
    experiences: AgentExperience[],
    query: string
  ): number {
    if (knowledge.length === 0 && experiences.length === 0) return 0;

    const avgKnowledgeRelevance = knowledge.length > 0
      ? knowledge.reduce((sum, k) => sum + (k.relevanceScore || 0), 0) / knowledge.length
      : 0;

    const avgExperienceImpact = experiences.length > 0
      ? experiences.reduce((sum, e) => sum + (e.impactScore || 0), 0) / experiences.length
      : 0;

    return Math.round((avgKnowledgeRelevance + avgExperienceImpact) / 2);
  }

  private async generateContextualInsights(
    knowledge: AgentKnowledgeBase[],
    experiences: AgentExperience[],
    query: string,
    context?: string
  ): Promise<string[]> {
    if (knowledge.length === 0 && experiences.length === 0) {
      return ["No relevant knowledge or experience found for this query."];
    }

    const insights: string[] = [];

    // Knowledge-based insights
    if (knowledge.length > 0) {
      const highConfidenceKnowledge = knowledge.filter(k => (k.confidence || 0) > 70);
      if (highConfidenceKnowledge.length > 0) {
        insights.push(`High confidence knowledge available in ${highConfidenceKnowledge.length} areas`);
      }

      const recentKnowledge = knowledge.filter(k => 
        new Date(k.createdAt || Date.now()).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      if (recentKnowledge.length > 0) {
        insights.push(`Recently acquired knowledge relevant to this topic`);
      }
    }

    // Experience-based insights
    if (experiences.length > 0) {
      const successfulExperiences = experiences.filter(e => e.experienceType === "success");
      if (successfulExperiences.length > 0) {
        insights.push(`Previous successful experiences in similar contexts`);
      }

      const lessonsLearned = experiences
        .flatMap(e => e.lessonsLearned as string[])
        .filter(lesson => lesson && lesson.length > 0);
      if (lessonsLearned.length > 0) {
        insights.push(`Valuable lessons from ${lessonsLearned.length} past experiences`);
      }
    }

    return insights.length > 0 ? insights : ["Some relevant information found"];
  }

  private async generateActionSuggestions(
    knowledge: AgentKnowledgeBase[],
    experiences: AgentExperience[],
    query: string
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (knowledge.length > 0) {
      suggestions.push("Apply relevant knowledge to current situation");
      
      const lowConfidenceKnowledge = knowledge.filter(k => (k.confidence || 0) < 50);
      if (lowConfidenceKnowledge.length > 0) {
        suggestions.push("Validate uncertain knowledge before application");
      }
    }

    if (experiences.length > 0) {
      suggestions.push("Consider lessons from similar past experiences");
      
      const recentFailures = experiences.filter(e => 
        e.experienceType === "failure" &&
        new Date(e.createdAt || Date.now()).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );
      if (recentFailures.length > 0) {
        suggestions.push("Avoid patterns that led to recent failures");
      }
    }

    if (suggestions.length === 0) {
      suggestions.push("Seek additional information or training");
    }

    return suggestions;
  }

  private async updateAccessCounts(
    knowledge: AgentKnowledgeBase[],
    experiences: AgentExperience[]
  ): Promise<void> {
    // Update knowledge access counts
    for (const k of knowledge) {
      await db
        .update(agentKnowledgeBase)
        .set({
          lastAccessed: new Date(),
          accessCount: sql`${agentKnowledgeBase.accessCount} + 1`,
        })
        .where(eq(agentKnowledgeBase.id, k.id));
    }
  }

  private async getAgentKnowledge(agentId: string): Promise<AgentKnowledgeBase[]> {
    return await db
      .select()
      .from(agentKnowledgeBase)
      .where(eq(agentKnowledgeBase.agentId, agentId))
      .orderBy(desc(agentKnowledgeBase.relevanceScore));
  }

  private async getAgentExperiences(agentId: string): Promise<AgentExperience[]> {
    return await db
      .select()
      .from(agentExperiences)
      .where(eq(agentExperiences.agentId, agentId))
      .orderBy(desc(agentExperiences.createdAt));
  }

  private async calculateAgentSkills(agentId: string): Promise<Array<{
    name: string;
    level: number;
    lastPracticed: Date;
    improvement: number;
  }>> {
    // Group knowledge by specialty and calculate skill levels
    const knowledgeBySpecialty = await this.getKnowledgeBySpecialty(agentId);
    const skills: Array<{
      name: string;
      level: number;
      lastPracticed: Date;
      improvement: number;
    }> = [];

    for (const [specialtyId, knowledgeItems] of Object.entries(knowledgeBySpecialty)) {
      if (knowledgeItems.length === 0) continue;

      const avgConfidence = knowledgeItems.reduce((sum, k) => sum + (k.confidence || 0), 0) / knowledgeItems.length;
      const mostRecent = knowledgeItems.reduce((latest, k) => {
        const kDate = new Date(k.lastAccessed || k.createdAt || Date.now());
        const latestDate = new Date(latest.lastAccessed || latest.createdAt || Date.now());
        return kDate > latestDate ? k : latest;
      });

      // Calculate improvement over time
      const recentKnowledge = knowledgeItems.filter(k => 
        new Date(k.createdAt || Date.now()).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );
      const improvement = recentKnowledge.length;

      skills.push({
        name: specialtyId, // In production, you'd look up the specialty name
        level: Math.round(avgConfidence),
        lastPracticed: new Date(mostRecent.lastAccessed || mostRecent.createdAt || Date.now()),
        improvement,
      });
    }

    return skills;
  }

  private async getKnowledgeBySpecialty(agentId: string): Promise<Record<string, AgentKnowledgeBase[]>> {
    const knowledge = await this.getAgentKnowledge(agentId);
    const grouped: Record<string, AgentKnowledgeBase[]> = {};

    for (const k of knowledge) {
      const specialty = k.specialtyId || "general";
      if (!grouped[specialty]) {
        grouped[specialty] = [];
      }
      grouped[specialty].push(k);
    }

    return grouped;
  }

  private async getExperiencesBySpecialty(agentId: string): Promise<Record<string, AgentExperience[]>> {
    const experiences = await this.getAgentExperiences(agentId);
    // Group by context or session (would need specialty mapping in production)
    return { general: experiences };
  }

  private async buildSpecialtyProfiles(
    agentId: string,
    knowledgeBySpecialty: Record<string, AgentKnowledgeBase[]>,
    experiencesBySpecialty: Record<string, AgentExperience[]>
  ): Promise<ExpertiseProfile['specialties']> {
    const specialties: ExpertiseProfile['specialties'] = [];

    for (const [specialtyId, knowledgeItems] of Object.entries(knowledgeBySpecialty)) {
      if (knowledgeItems.length === 0) continue;

      const experiences = experiencesBySpecialty[specialtyId] || [];
      
      const avgConfidence = knowledgeItems.reduce((sum, k) => sum + (k.confidence || 0), 0) / knowledgeItems.length;
      const knowledgeDepth = knowledgeItems.length;
      const experienceCount = experiences.length;
      
      const mostRecent = knowledgeItems.reduce((latest, k) => {
        const kDate = new Date(k.lastAccessed || k.createdAt || Date.now());
        const latestDate = new Date(latest.lastAccessed || latest.createdAt || Date.now());
        return kDate > latestDate ? k : latest;
      });

      // Identify strong and developing areas based on confidence levels
      const strongAreas = knowledgeItems
        .filter(k => (k.confidence || 0) > 80)
        .map(k => k.knowledgeType)
        .filter((type, index, arr) => arr.indexOf(type) === index)
        .slice(0, 3);

      const developingAreas = knowledgeItems
        .filter(k => (k.confidence || 0) < 60)
        .map(k => k.knowledgeType)
        .filter((type, index, arr) => arr.indexOf(type) === index)
        .slice(0, 3);

      specialties.push({
        specialtyId,
        name: specialtyId, // Would look up actual name in production
        competencyLevel: this.mapConfidenceToLevel(avgConfidence),
        knowledgeDepth,
        experienceCount,
        confidenceScore: Math.round(avgConfidence),
        recentActivity: new Date(mostRecent.lastAccessed || mostRecent.createdAt || Date.now()),
        strongAreas,
        developingAreas,
      });
    }

    return specialties;
  }

  private calculateOverallExpertise(specialties: ExpertiseProfile['specialties']): number {
    if (specialties.length === 0) return 0;
    
    const totalExpertise = specialties.reduce((sum, s) => sum + s.confidenceScore, 0);
    return Math.round(totalExpertise / specialties.length);
  }

  private async calculateLearningVelocity(agentId: string): Promise<number> {
    // Calculate knowledge acquired in the last 30 days
    const recentKnowledge = await db
      .select()
      .from(agentKnowledgeBase)
      .where(
        and(
          eq(agentKnowledgeBase.agentId, agentId),
          sql`${agentKnowledgeBase.createdAt} > NOW() - INTERVAL '30 days'`
        )
      );

    // Learning velocity is based on recent knowledge acquisition
    return Math.min(100, recentKnowledge.length * 5);
  }

  private async calculateKnowledgeRetention(agentId: string): Promise<number> {
    const allKnowledge = await this.getAgentKnowledge(agentId);
    if (allKnowledge.length === 0) return 0;

    // Knowledge retention based on average confidence of older knowledge
    const oldKnowledge = allKnowledge.filter(k => 
      new Date(k.createdAt || Date.now()).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    if (oldKnowledge.length === 0) return 100;

    const avgRetention = oldKnowledge.reduce((sum, k) => sum + (k.confidence || 0), 0) / oldKnowledge.length;
    return Math.round(avgRetention);
  }

  private async calculateAdaptabilityScore(agentId: string): Promise<number> {
    const experiences = await this.getAgentExperiences(agentId);
    if (experiences.length === 0) return 50;

    // Adaptability based on variety of experience types and success after failures
    const experienceTypes = new Set(experiences.map(e => e.experienceType));
    const varietyScore = Math.min(100, experienceTypes.size * 20);

    const failures = experiences.filter(e => e.experienceType === "failure");
    const successesAfterFailures = failures.filter(f => {
      const laterSuccesses = experiences.filter(e => 
        e.experienceType === "success" && 
        new Date(e.createdAt || Date.now()) > new Date(f.createdAt || Date.now())
      );
      return laterSuccesses.length > 0;
    });

    const recoveryRate = failures.length > 0 ? (successesAfterFailures.length / failures.length) * 100 : 100;

    return Math.round((varietyScore + recoveryRate) / 2);
  }

  private mapConfidenceToLevel(confidence: number): string {
    if (confidence >= 90) return "Expert";
    if (confidence >= 75) return "Advanced";
    if (confidence >= 60) return "Intermediate";
    return "Beginner";
  }

  private async updateLearningStats(agentId: string): Promise<void> {
    // Update agent learning statistics (implementation depends on schema)
    // This could update fields in agentLibrary table
  }

  private async updateExperienceStats(agentId: string): Promise<void> {
    // Update agent experience statistics
  }

  private async extractInsightsFromExperience(experience: AgentExperience): Promise<void> {
    // Use AI to extract additional insights from experiences
    try {
      const prompt = `Analyze this agent experience and extract key insights:
      
      Context: ${experience.context}
      Outcome: ${experience.outcome}
      Type: ${experience.experienceType}
      
      Provide 2-3 key insights that could be useful for future situations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      });

      const insights = response.choices[0].message.content?.split('\n').filter(line => line.trim()) || [];
      
      // Store insights as additional knowledge
      if (insights.length > 0 && experience.agentId) {
        await this.storeKnowledge({
          agentId: experience.agentId,
          specialtyId: "",
          knowledgeType: "insight",
          content: insights.join("; "),
          source: `experience_${experience.id}`,
          confidence: 60,
          relevanceScore: 70,
          tags: ["insight", "experience_derived"],
        });
      }
    } catch (error) {
      console.error("Failed to extract insights from experience:", error);
    }
  }
}