/**
 * Data Generator for Simulations
 * Generates realistic test data for CBS Apex application scenarios
 */

export class DataGenerator {
  private readonly hbdiPersonalities = [
    'Analytical', 'Practical', 'Relational', 'Experimental', 
    'Strategic', 'Expressive', 'Safekeeping', 'Organizing'
  ];

  private readonly agentNames = [
    'Strategic Planner', 'Data Analyst', 'Creative Thinker', 'Process Optimizer',
    'Relationship Builder', 'Innovation Catalyst', 'Risk Assessor', 'Detail Manager',
    'Vision Architect', 'Quality Controller', 'Team Facilitator', 'Research Specialist'
  ];

  private readonly competencies = [
    'Analytical Thinking', 'Creative Problem Solving', 'Strategic Planning',
    'Process Optimization', 'Collaborative Leadership', 'Risk Management',
    'Innovation Development', 'Quality Assurance', 'Data Analysis',
    'Communication Skills', 'Project Management', 'Research Methodology'
  ];

  private readonly promptTemplates = [
    "Analyze the current market trends in {industry} and provide strategic recommendations.",
    "Design a creative solution for improving {process} efficiency in {context}.",
    "Evaluate the risks and benefits of implementing {technology} in {scenario}.",
    "Develop a comprehensive plan for {objective} considering {constraints}.",
    "Research best practices for {topic} and synthesize key insights.",
    "Create an innovative approach to {challenge} using {methodology}."
  ];

  private readonly industries = [
    'healthcare', 'finance', 'technology', 'education', 'manufacturing',
    'retail', 'energy', 'transportation', 'real estate', 'entertainment'
  ];

  private readonly contexts = [
    'enterprise environment', 'startup ecosystem', 'government sector',
    'non-profit organization', 'small business', 'multinational corporation',
    'academic institution', 'healthcare system', 'financial services'
  ];

  /**
   * Generate realistic agent data
   */
  generateAgent(): any {
    const name = this.getRandomItem(this.agentNames);
    const primaryPersonality = this.getRandomItem(this.hbdiPersonalities);
    const secondaryPersonality = this.getRandomItem(
      this.hbdiPersonalities.filter(p => p !== primaryPersonality)
    );

    return {
      name: `${name} ${Math.floor(Math.random() * 1000)}`,
      description: `An AI agent specialized in ${primaryPersonality.toLowerCase()} thinking with ${secondaryPersonality.toLowerCase()} capabilities.`,
      primaryPersonality,
      secondaryPersonality: Math.random() > 0.3 ? secondaryPersonality : null,
      isDevilsAdvocate: Math.random() > 0.7,
      supplementalPrompt: Math.random() > 0.5 ? this.generateSupplementalPrompt() : null,
      preferredProviderId: this.getRandomProviderId()
    };
  }

  /**
   * Generate training session data
   */
  generateTrainingSession(): any {
    return {
      agentId: `agent-${Math.floor(Math.random() * 100)}`,
      specialtyId: `specialty-${Math.floor(Math.random() * 50)}`,
      competencyName: this.getRandomItem(this.competencies),
      targetCompetencyLevel: this.getRandomItem(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
      maxIterations: Math.floor(Math.random() * 8) + 3,
      selectedFolders: this.generateRandomFolders(),
      preferredProviderId: this.getRandomProviderId()
    };
  }

  /**
   * Generate prompt sequence for AI meetings
   */
  generatePromptSequence(): any {
    const agentCount = Math.floor(Math.random() * 4) + 2; // 2-5 agents
    const llmChain = Array.from({ length: agentCount }, (_, i) => ({
      step: i + 1,
      providerId: this.getRandomProviderId(),
      customInstructions: Math.random() > 0.5 ? this.generateSupplementalPrompt() : undefined,
      primaryPersonality: this.getRandomItem(this.personalities),
      secondaryPersonality: Math.random() > 0.5 ? this.getRandomItem(this.personalities) : undefined,
      isDevilsAdvocate: Math.random() > 0.8
    }));

    return {
      name: `AI Meeting ${Date.now()}`,
      description: 'Collaborative AI discussion session',
      taskObjective: this.generateTaskObjective(),
      initialPrompt: this.generatePromptContent(),
      iterations: Math.floor(Math.random() * 3) + 1, // 1-3 iterations
      llmChain: llmChain,
      selectedFolders: this.generateRandomFolders(),
      synthesisProviderId: this.getRandomProviderId()
    };
  }

  /**
   * Generate folder data
   */
  generateFolder(): any {
    const topics = [
      'Research Papers', 'Strategy Documents', 'Market Analysis', 'Technical Specs',
      'Meeting Notes', 'Project Plans', 'Training Materials', 'Case Studies',
      'Best Practices', 'Industry Reports', 'Competitive Analysis', 'User Feedback'
    ];

    const folderName = this.getRandomItem(topics);
    return {
      name: `${folderName} ${Math.floor(Math.random() * 1000)}`,
      description: `Collection of documents related to ${folderName.toLowerCase()}`
    };
  }

  /**
   * Generate batch test configuration
   */
  generateBatchTest(): any {
    const promptCount = Math.floor(Math.random() * 5) + 2; // 2-6 prompts
    const prompts = Array.from({ length: promptCount }, () => this.generatePromptContent());
    
    return {
      name: `Batch Test ${Date.now()}`,
      description: 'Comparative analysis across multiple LLM providers',
      prompts,
      selectedProviders: this.getRandomProviders(),
      selectedFolders: this.generateRandomFolders()
    };
  }

  /**
   * Generate realistic prompt content (used internally)
   */
  private generatePromptContent(): string {
    const template = this.getRandomItem(this.promptTemplates);
    const industry = this.getRandomItem(this.industries);
    const context = this.getRandomItem(this.contexts);
    const process = this.getRandomItem(['workflow', 'communication', 'decision-making', 'analysis']);
    const technology = this.getRandomItem(['AI', 'blockchain', 'IoT', 'cloud computing', 'automation']);
    const objective = this.getRandomItem(['growth', 'efficiency', 'innovation', 'collaboration']);
    const challenge = this.getRandomItem(['scalability', 'user engagement', 'cost reduction', 'quality improvement']);
    const methodology = this.getRandomItem(['agile approach', 'design thinking', 'lean methodology', 'data-driven strategy']);
    const scenario = this.getRandomItem(['digital transformation', 'market expansion', 'operational excellence']);
    const topic = this.getRandomItem(['leadership', 'customer experience', 'digital innovation', 'sustainability']);
    const constraints = this.getRandomItem(['budget limitations', 'time constraints', 'regulatory requirements', 'resource availability']);

    return template
      .replace('{industry}', industry)
      .replace('{context}', context)
      .replace('{process}', process)
      .replace('{technology}', technology)
      .replace('{objective}', objective)
      .replace('{challenge}', challenge)
      .replace('{methodology}', methodology)
      .replace('{scenario}', scenario)
      .replace('{topic}', topic)
      .replace('{constraints}', constraints);
  }

  /**
   * Generate PromptRequest object for API calls
   */
  generatePrompt(): any {
    return {
      content: this.generatePromptContent(),
      selectedProviders: this.getRandomProviders(),
      selectedFolders: this.generateRandomFolders(),
      conversationId: undefined
    };
  }

  /**
   * Generate supplemental prompt for agents
   */
  private generateSupplementalPrompt(): string {
    const prompts = [
      "Always consider the human impact of your recommendations.",
      "Focus on practical, implementable solutions.",
      "Challenge assumptions and ask probing questions.",
      "Prioritize data-driven insights and evidence.",
      "Think creatively and explore unconventional approaches.",
      "Consider long-term implications and sustainability.",
      "Emphasize collaboration and stakeholder engagement.",
      "Maintain a balanced perspective on risks and opportunities."
    ];
    return this.getRandomItem(prompts);
  }

  /**
   * Generate task objective for meetings
   */
  private generateTaskObjective(): string {
    const objectives = [
      "Develop a comprehensive strategy for digital transformation",
      "Analyze market opportunities and competitive positioning",
      "Design an innovative solution for operational challenges",
      "Evaluate investment options and risk assessment",
      "Create a roadmap for technological advancement",
      "Assess organizational capabilities and improvement areas",
      "Plan strategic partnerships and collaboration opportunities",
      "Review performance metrics and optimization strategies"
    ];
    return this.getRandomItem(objectives);
  }

  /**
   * Get random provider ID
   */
  private getRandomProviderId(): string {
    const providers = ['openai-gpt5', 'anthropic-claude', 'google-gemini'];
    return this.getRandomItem(providers);
  }

  /**
   * Get random multiple providers
   */
  private getRandomProviders(): string[] {
    const allProviders = ['openai-gpt5', 'anthropic-claude', 'google-gemini'];
    const count = Math.floor(Math.random() * 2) + 2; // 2-3 providers
    return this.shuffleArray(allProviders).slice(0, count);
  }

  /**
   * Generate random folder selection
   */
  private generateRandomFolders(): string[] {
    const folderCount = Math.floor(Math.random() * 3) + 1; // 1-3 folders
    return Array.from({ length: folderCount }, () => `folder-${Math.floor(Math.random() * 10)}`);
  }

  /**
   * Utility: Get random item from array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Utility: Shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}