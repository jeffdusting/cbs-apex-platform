/**
 * Agent Provider Adapter
 * Bridges the training module with the existing agent library system
 */

import { IAgentProvider, IAgent } from "../interfaces/ITrainingModule";
import { db } from "../db";
import { agentLibrary } from "@shared/schema";
import { eq } from "drizzle-orm";

export class AgentProviderAdapter implements IAgentProvider {
  async getAgent(id: string): Promise<IAgent | null> {
    try {
      const [agent] = await db
        .select()
        .from(agentLibrary)
        .where(eq(agentLibrary.id, id));

      if (!agent) {
        return null;
      }

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description || undefined,
        primaryPersonality: agent.primaryPersonality || undefined,
        secondaryPersonality: agent.secondaryPersonality || undefined,
      };
    } catch (error) {
      console.error("Error fetching agent:", error);
      return null;
    }
  }

  async getAllAgents(): Promise<IAgent[]> {
    try {
      const agents = await db.select().from(agentLibrary);

      return agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || undefined,
        primaryPersonality: agent.primaryPersonality || undefined,
        secondaryPersonality: agent.secondaryPersonality || undefined,
      }));
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  }
}