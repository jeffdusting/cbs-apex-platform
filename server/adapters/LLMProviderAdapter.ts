/**
 * LLM Provider Adapter
 * Bridges the training module with OpenAI LLM services
 */

import { ILLMProvider, ITestQuestion } from "../interfaces/ITrainingModule";
import OpenAI from "openai";

export class LLMProviderAdapter implements ILLMProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: options?.maxTokens || 1000,
        // Note: GPT-5 only supports default temperature (1), so we omit the temperature parameter
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating text:", error);
      throw new Error("Failed to generate text");
    }
  }

  async generateQuestions(specialty: string, level: string, count: number): Promise<ITestQuestion[]> {
    // Competency-specific learning objectives for each level
    const competencyFocus = this.getCompetencyLearningObjectives(specialty, level);
    
    const difficultyMap: Record<string, string> = {
      'Beginner': 'easy',
      'Intermediate': 'medium',
      'Advanced': 'hard',
      'Expert': 'hard'
    };

    const prompt = `Generate ${count} rigorous test questions for ${specialty} competency at ${level} level.

    COMPETENCY-SPECIFIC LEARNING OBJECTIVES FOR ${level.toUpperCase()} LEVEL:
    ${competencyFocus}
    
    Requirements:
    - Questions must directly assess the specific learning objectives listed above
    - Each question must test a distinct skill within ${specialty} competency
    - Questions must be challenging enough to require 90% mastery for progression
    - Create realistic scenarios that professionals would encounter
    - All questions should differentiate between ${level} level and other competency levels
    - Include questions that test both knowledge and practical application
    - Questions should progress from basic to complex within the ${level} level
    
    Question Distribution:
    - Create ${Math.ceil(count * 0.8)} multiple choice questions with 4 options each
    - Create ${Math.floor(count * 0.2)} scenario-based questions
    - Each question must map to specific competency skills
    - Difficulty: ${difficultyMap[level]}
    
    IMPORTANT: Questions must be specific to ${specialty} and appropriate for ${level} level.
    Avoid generic questions that could apply to any competency area.
    
    Return the response as a JSON array with this structure:
    [
      {
        "id": "unique_id",
        "question": "detailed question text with realistic scenario context",
        "type": "multiple_choice" or "short_answer",
        "options": ["option1", "option2", "option3", "option4"] (only for multiple_choice),
        "correctAnswer": "correct_option_or_expected_answer",
        "explanation": "comprehensive explanation why this is correct and what ${specialty} skills it demonstrates",
        "difficulty": "${difficultyMap[level]}",
        "competencySkills": ["skill1", "skill2"],
        "scenario": "brief context or situation description"
      }
    ]`;

    try {
      const response = await this.generateText(prompt);
      const questions = JSON.parse(response);
      
      return questions.map((q: any, index: number) => ({
        id: q.id || `${specialty.toLowerCase().replace(/\s+/g, '_')}_${level.toLowerCase()}_${Date.now()}_${index}`,
        question: q.question,
        type: q.type || 'multiple_choice',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || `This tests ${specialty} competency at ${level} level.`,
        difficulty: q.difficulty || difficultyMap[level] || 'medium',
      }));
    } catch (error) {
      console.error("Error generating questions:", error);
      // Return fallback questions if generation fails
      return this.getFallbackQuestions(specialty, level, count);
    }
  }

  private getCompetencyLearningObjectives(specialty: string, level: string): string {
    const objectives: Record<string, Record<string, string>> = {
      'Analytical Thinking': {
        'Beginner': `- Identify key information and data patterns in simple datasets
- Understand cause-and-effect relationships in straightforward scenarios
- Break down basic problems into component parts
- Recognize when additional information is needed for analysis
- Use basic logical reasoning to draw simple conclusions
- Interpret charts, graphs, and simple data visualizations`,
        
        'Intermediate': `- Analyze complex data sets to identify trends and anomalies
- Compare and contrast multiple solutions to problems
- Synthesize information from 2-3 different sources
- Apply analytical frameworks (SWOT, root cause analysis)
- Evaluate evidence quality and reliability
- Make data-driven recommendations with supporting rationale`,
        
        'Advanced': `- Design analytical approaches for complex, ambiguous problems
- Integrate insights from multiple data sources and stakeholders
- Identify underlying assumptions and potential biases in analysis
- Create new analytical frameworks for novel situations
- Facilitate analytical discussions and decision-making processes
- Predict consequences of different analytical approaches`,
        
        'Expert': `- Develop organizational analytical methodologies and standards
- Mentor others in advanced analytical thinking techniques
- Innovate new approaches to complex analytical challenges
- Lead cross-functional analytical initiatives
- Establish analytical best practices across teams
- Anticipate future analytical needs and prepare solutions`
      },
      
      'Creative Problem Solving': {
        'Beginner': `- Generate multiple alternative solutions to simple problems
- Use basic brainstorming techniques effectively
- Recognize when conventional approaches may not work
- Apply simple creativity tools (mind mapping, free association)
- Remain open to unconventional ideas from others
- Combine existing ideas in new ways`,
        
        'Intermediate': `- Apply structured creativity methodologies (SCAMPER, Six Thinking Hats)
- Facilitate brainstorming sessions with diverse groups
- Balance creative thinking with practical constraints
- Adapt solutions from one context to another
- Overcome mental blocks and creative barriers
- Evaluate creative solutions for feasibility and impact`,
        
        'Advanced': `- Design custom creative problem-solving processes
- Lead innovation projects and creative initiatives
- Integrate creativity with strategic planning and execution
- Develop organizational creative capabilities
- Manage creative tension between innovation and risk
- Create environments that foster sustained creativity`,
        
        'Expert': `- Pioneer new creative methodologies and frameworks
- Build organizational cultures of innovation
- Mentor creative leaders and teams
- Integrate creativity with business strategy at highest levels
- Influence industry standards for creative problem solving
- Drive breakthrough innovations that transform markets`
      },
      
      'Emotional Intelligence': {
        'Beginner': `- Recognize and name basic emotions in self and others
- Understand how emotions affect behavior and decision-making
- Practice basic empathy and perspective-taking
- Manage personal emotional responses in low-stress situations
- Communicate feelings appropriately in personal interactions
- Recognize emotional triggers and early warning signs`,
        
        'Intermediate': `- Regulate emotions effectively under moderate pressure
- Read nonverbal cues and social dynamics accurately
- Adapt communication style to different personality types
- Build rapport with diverse individuals and groups
- Manage conflict constructively using emotional awareness
- Support others through emotional challenges`,
        
        'Advanced': `- Facilitate emotionally charged conversations and meetings
- Create psychologically safe environments for teams
- Coach others in emotional intelligence development
- Lead change initiatives with high emotional intelligence
- Design emotionally intelligent organizational practices
- Resolve complex interpersonal and team conflicts`,
        
        'Expert': `- Develop organizational emotional intelligence strategies
- Measure and improve organizational emotional climate
- Train and certify others in emotional intelligence
- Research and innovate new emotional intelligence applications
- Influence organizational culture through emotional intelligence leadership
- Drive industry standards for emotionally intelligent practices`
      },
      
      'Strategic Planning': {
        'Beginner': `- Understand the difference between goals, objectives, and tactics
- Conduct basic SWOT analysis for simple situations
- Identify key stakeholders and their interests
- Follow and execute strategic plans effectively
- Recognize short-term vs. long-term thinking
- Understand how individual actions support larger strategies`,
        
        'Intermediate': `- Develop departmental and project-level strategic plans
- Conduct market and competitive analysis
- Set SMART objectives and key performance indicators
- Coordinate cross-functional strategic initiatives
- Analyze strategic trade-offs and resource allocation
- Monitor and adjust strategies based on performance data`,
        
        'Advanced': `- Create comprehensive organizational strategic plans
- Lead strategic planning processes and workshops
- Analyze complex competitive landscapes and market dynamics
- Manage strategic portfolios and investment decisions
- Communicate strategy effectively to diverse stakeholders
- Lead strategic transformations and major changes`,
        
        'Expert': `- Design strategic planning methodologies and frameworks
- Anticipate industry disruptions and emerging trends
- Influence strategic direction at board and C-suite levels
- Mentor strategic leaders and develop strategic capabilities
- Drive strategic innovation and new business models
- Shape long-term organizational vision and purpose`
      }
    };
    
    return objectives[specialty]?.[level] || 
           `Core ${specialty} competency skills appropriate for ${level} level practitioners in professional environments.`;
  }

  async evaluateAnswer(question: string, answer: string, correctAnswer: string): Promise<{
    isCorrect: boolean;
    score: number;
    feedback: string;
  }> {
    const prompt = `Evaluate this test answer:
    
    Question: ${question}
    Student Answer: ${answer}
    Correct Answer: ${correctAnswer}
    
    Provide evaluation as JSON:
    {
      "isCorrect": boolean,
      "score": number (0-100),
      "feedback": "constructive feedback explaining the evaluation"
    }`;

    try {
      const response = await this.generateText(prompt);
      const evaluation = JSON.parse(response);
      
      return {
        isCorrect: evaluation.isCorrect,
        score: Math.max(0, Math.min(100, evaluation.score)),
        feedback: evaluation.feedback || "Answer evaluated",
      };
    } catch (error) {
      console.error("Error evaluating answer:", error);
      // Fallback to simple string comparison
      const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? "Correct answer" : "Incorrect answer",
      };
    }
  }

  private getFallbackQuestions(specialty: string, level: string, count: number): ITestQuestion[] {
    const fallbackQuestions: ITestQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      fallbackQuestions.push({
        id: `fallback_${Date.now()}_${i}`,
        question: `What is a key concept in ${specialty} for ${level} level practitioners?`,
        type: 'multiple_choice',
        options: [
          "Basic understanding",
          "Advanced application", 
          "Expert-level mastery",
          "Foundational knowledge"
        ],
        correctAnswer: level === 'Beginner' ? "Foundational knowledge" : 
                      level === 'Intermediate' ? "Basic understanding" :
                      level === 'Advanced' ? "Advanced application" : "Expert-level mastery",
        explanation: `This tests ${level} level understanding of ${specialty}`,
        difficulty: level === 'Beginner' ? 'easy' : 
                   level === 'Intermediate' ? 'medium' : 'hard',
      });
    }
    
    return fallbackQuestions;
  }
}