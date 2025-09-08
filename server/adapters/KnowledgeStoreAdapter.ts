/**
 * Knowledge Store Adapter
 * Bridges the training module with the existing agent memory system
 */

import { IKnowledgeStore } from "../interfaces/ITrainingModule";
import { db } from "../db";
import { agentKnowledgeBase } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class KnowledgeStoreAdapter implements IKnowledgeStore {
  async storeKnowledge(agentId: string, knowledge: {
    content: string;
    source: string;
    confidence: number;
    tags: string[];
  }): Promise<void> {
    try {
      await db.insert(agentKnowledgeBase).values({
        agentId,
        content: knowledge.content,
        knowledgeType: knowledge.source,
        confidence: Math.max(0, Math.min(100, knowledge.confidence)),
        tags: knowledge.tags,
        source: this.inferCategory(knowledge.tags),
      });
    } catch (error) {
      console.error("Error storing knowledge:", error);
      throw new Error("Failed to store knowledge");
    }
  }

  async retrieveKnowledge(agentId: string, query: string): Promise<Array<{
    content: string;
    relevance: number;
    confidence: number;
  }>> {
    try {
      // Simple keyword-based search (in production, this could use vector similarity)
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      
      const knowledge = await db
        .select()
        .from(agentKnowledgeBase)
        .where(eq(agentKnowledgeBase.agentId, agentId))
        .orderBy(desc(agentKnowledgeBase.confidence))
        .limit(10);

      return knowledge
        .map(item => ({
          content: item.content,
          relevance: this.calculateRelevance(item.content, keywords),
          confidence: item.confidence || 50,
        }))
        .filter(item => item.relevance > 0.1) // Filter out low relevance items
        .sort((a, b) => (b.relevance * b.confidence) - (a.relevance * a.confidence));
    } catch (error) {
      console.error("Error retrieving knowledge:", error);
      return [];
    }
  }

  private inferCategory(tags: string[]): string {
    const categoryMap: { [key: string]: string[] } = {
      'technical': ['code', 'programming', 'software', 'system', 'api'],
      'business': ['strategy', 'marketing', 'finance', 'management'],
      'creative': ['design', 'art', 'writing', 'creative'],
      'analytical': ['data', 'analysis', 'statistics', 'research'],
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (tags.some(tag => keywords.includes(tag.toLowerCase()))) {
        return category;
      }
    }

    return 'general';
  }

  private calculateImportance(confidence: number, content: string): number {
    let importance = confidence;
    
    // Boost importance for longer, more detailed content
    if (content.length > 500) importance += 10;
    if (content.length > 1000) importance += 10;
    
    // Keywords that indicate important concepts
    const importantKeywords = ['principle', 'concept', 'theory', 'method', 'approach'];
    const hasImportantKeywords = importantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasImportantKeywords) importance += 15;
    
    return Math.max(0, Math.min(100, importance));
  }

  private calculateRelevance(content: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;

    const contentLower = content.toLowerCase();
    let relevanceScore = 0;
    let matchCount = 0;

    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        matchCount++;
        // Boost score for exact keyword matches
        relevanceScore += 1;
        
        // Additional boost for keywords in key positions
        if (contentLower.startsWith(keyword) || contentLower.includes(`. ${keyword}`)) {
          relevanceScore += 0.5;
        }
      }
    }

    // Calculate final relevance as percentage of matched keywords
    const relevance = matchCount / keywords.length;
    
    // Apply content quality multiplier
    const qualityMultiplier = Math.min(1.5, content.length / 200);
    
    return Math.min(1, relevance * qualityMultiplier);
  }
}