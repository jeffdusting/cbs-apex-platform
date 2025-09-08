import { AgentMood, MoodUpdate, AgentMoodType, AgentStatusType, MoodTriggerType, agentMoodSchema } from "@shared/moodSchema";

// In-memory mood storage (could be moved to database later)
class MoodStorage {
  private moods = new Map<string, Map<string, AgentMood>>(); // meetingId -> agentId -> mood

  getMoodsForMeeting(meetingId: string): AgentMood[] {
    const meetingMoods = this.moods.get(meetingId);
    return meetingMoods ? Array.from(meetingMoods.values()) : [];
  }

  getAgentMood(meetingId: string, agentId: string): AgentMood | undefined {
    return this.moods.get(meetingId)?.get(agentId);
  }

  updateMood(meetingId: string, agentId: string, mood: AgentMood): void {
    if (!this.moods.has(meetingId)) {
      this.moods.set(meetingId, new Map());
    }
    this.moods.get(meetingId)!.set(agentId, mood);
  }

  clearMeeting(meetingId: string): void {
    this.moods.delete(meetingId);
  }

  clearAll(): void {
    this.moods.clear();
  }
}

export class MoodService {
  private storage = new MoodStorage();
  private moodDecayIntervals = new Map<string, NodeJS.Timeout>();

  // Initialize default mood for an agent
  initializeAgentMood(meetingId: string, agentId: string): AgentMood {
    const mood: AgentMood = {
      agentId,
      mood: 'neutral',
      status: 'idle',
      intensity: 0.5,
      timestamp: Date.now()
    };

    this.storage.updateMood(meetingId, agentId, mood);
    return mood;
  }

  // Update agent mood based on trigger
  updateMood(meetingId: string, update: MoodUpdate): AgentMood {
    const currentMood = this.storage.getAgentMood(meetingId, update.agentId);
    
    const newMood: AgentMood = {
      agentId: update.agentId,
      mood: update.mood || currentMood?.mood || 'neutral',
      status: update.status || currentMood?.status || 'idle',
      intensity: update.intensity || this.calculateIntensity(update.trigger, currentMood?.intensity || 0.5),
      timestamp: Date.now(),
      trigger: update.trigger,
      metadata: update.metadata
    };

    // Apply mood changes based on trigger
    this.applyMoodTrigger(newMood, update.trigger);
    
    this.storage.updateMood(meetingId, update.agentId, newMood);
    
    // Set up automatic mood decay
    this.scheduleMoodDecay(meetingId, update.agentId);
    
    return newMood;
  }

  // Calculate mood intensity based on trigger
  private calculateIntensity(trigger: MoodTriggerType, currentIntensity: number): number {
    const intensityChanges: Record<MoodTriggerType, number> = {
      'positive_feedback': 0.2,
      'challenge_presented': 0.3,
      'collaboration_start': 0.1,
      'idea_breakthrough': 0.4,
      'disagreement': -0.1,
      'completion': 0.3,
      'complexity_increase': 0.2,
      'support_given': 0.15,
      'support_received': 0.1,
      'timeout': -0.05,
      'reset': -0.5
    };

    const change = intensityChanges[trigger] || 0;
    return Math.max(0.1, Math.min(1.0, currentIntensity + change));
  }

  // Apply mood changes based on specific triggers
  private applyMoodTrigger(mood: AgentMood, trigger: MoodTriggerType): void {
    switch (trigger) {
      case 'positive_feedback':
        mood.mood = 'excited';
        mood.status = 'responding';
        break;
      case 'challenge_presented':
        mood.mood = 'focused';
        mood.status = 'thinking';
        break;
      case 'collaboration_start':
        mood.mood = 'collaborative';
        mood.status = 'listening';
        break;
      case 'idea_breakthrough':
        mood.mood = 'creative';
        mood.status = 'responding';
        break;
      case 'disagreement':
        mood.mood = 'analytical';
        mood.status = 'reviewing';
        break;
      case 'completion':
        mood.mood = 'confident';
        mood.status = 'idle';
        break;
      case 'complexity_increase':
        mood.mood = 'contemplative';
        mood.status = 'thinking';
        break;
      case 'support_given':
        mood.mood = 'supportive';
        mood.status = 'responding';
        break;
      case 'support_received':
        mood.mood = 'collaborative';
        mood.status = 'listening';
        break;
      case 'reset':
        mood.mood = 'neutral';
        mood.status = 'idle';
        mood.intensity = 0.5;
        break;
    }
  }

  // Schedule automatic mood decay towards neutral
  private scheduleMoodDecay(meetingId: string, agentId: string): void {
    const key = `${meetingId}-${agentId}`;
    
    // Clear existing timeout
    if (this.moodDecayIntervals.has(key)) {
      clearTimeout(this.moodDecayIntervals.get(key)!);
    }

    // Set new timeout for gradual mood decay (5 minutes)
    const timeout = setTimeout(() => {
      const currentMood = this.storage.getAgentMood(meetingId, agentId);
      if (currentMood && currentMood.mood !== 'neutral') {
        this.updateMood(meetingId, {
          meetingId,
          agentId,
          trigger: 'timeout'
        });
      }
    }, 5 * 60 * 1000);

    this.moodDecayIntervals.set(key, timeout);
  }

  // Get all moods for a meeting
  getMoodsForMeeting(meetingId: string): AgentMood[] {
    return this.storage.getMoodsForMeeting(meetingId);
  }

  // Get specific agent mood
  getAgentMood(meetingId: string, agentId: string): AgentMood | undefined {
    return this.storage.getAgentMood(meetingId, agentId);
  }

  // Suggest mood changes based on AI response content
  suggestMoodFromContent(content: string): { mood: AgentMoodType; trigger: MoodTriggerType } {
    const contentLower = content.toLowerCase();
    
    // Analyze content for mood indicators
    if (contentLower.includes('excited') || contentLower.includes('great idea')) {
      return { mood: 'excited', trigger: 'positive_feedback' };
    }
    if (contentLower.includes('i disagree') || contentLower.includes('however')) {
      return { mood: 'analytical', trigger: 'disagreement' };
    }
    if (contentLower.includes('let me think') || contentLower.includes('considering')) {
      return { mood: 'contemplative', trigger: 'challenge_presented' };
    }
    if (contentLower.includes('building on') || contentLower.includes('together')) {
      return { mood: 'collaborative', trigger: 'collaboration_start' };
    }
    if (contentLower.includes('eureka') || contentLower.includes('breakthrough')) {
      return { mood: 'creative', trigger: 'idea_breakthrough' };
    }
    if (contentLower.includes('help') || contentLower.includes('support')) {
      return { mood: 'supportive', trigger: 'support_given' };
    }

    return { mood: 'neutral', trigger: 'reset' };
  }

  // Clean up resources
  cleanup(): void {
    this.moodDecayIntervals.forEach(timeout => clearTimeout(timeout));
    this.moodDecayIntervals.clear();
    this.storage.clearAll();
  }
}

// Export singleton instance
export const moodService = new MoodService();