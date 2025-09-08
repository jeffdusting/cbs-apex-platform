import { createProvider, type LLMProvider } from "../services/llmProviders";
import { ILLMProvider, ITestQuestion } from "../interfaces/ITrainingModule";

export class CompetencyLLMAdapter implements ILLMProvider {
  private provider: LLMProvider;
  private providerId: string;

  constructor(providerId: string, model: string, apiKey: string) {
    this.providerId = providerId;
    this.provider = createProvider(providerId, model, apiKey);
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const response = await this.provider.generateResponse(prompt);
      return response.content;
    } catch (error) {
      console.error(`Error generating text with ${this.providerId}:`, error);
      throw new Error(`Failed to generate text with ${this.providerId}`);
    }
  }

  async evaluateAnswer(userAnswer: string, correctAnswer: string, question: string): Promise<any> {
    const prompt = `Evaluate this answer for the question: "${question}"
Correct Answer: ${correctAnswer}
User Answer: ${userAnswer}

Provide evaluation in this JSON format:
{
  "score": 0-100,
  "feedback": "Brief explanation of the score",
  "isCorrect": true/false
}`;

    try {
      const response = await this.provider.generateResponse(prompt);
      return JSON.parse(response.content);
    } catch (error) {
      console.error(`Error evaluating answer with ${this.providerId}:`, error);
      return { score: 0, feedback: "Unable to evaluate answer", isCorrect: false };
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
        "type": "multiple_choice" or "scenario",
        "options": ["option1", "option2", "option3", "option4"], // for multiple choice only
        "correctAnswer": "correct answer text",
        "explanation": "detailed explanation of why this is correct",
        "difficulty": "${difficultyMap[level]}",
        "skillsTested": ["skill1", "skill2"],
        "scenario": "context description if applicable"
      }
    ]`;

    try {
      const response = await this.provider.generateResponse(prompt);
      const questionsData = JSON.parse(response.content);
      
      return questionsData.map((q: any) => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        question: q.question,
        type: q.type || 'multiple_choice',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || `This tests ${specialty} competency at ${level} level.`,
        difficulty: q.difficulty || difficultyMap[level] || 'medium',
        skillsTested: q.skillsTested || [specialty],
        scenario: q.scenario || ''
      }));
    } catch (error) {
      console.error(`Error generating questions with ${this.providerId}:`, error);
      throw new Error(`Failed to generate questions with ${this.providerId}`);
    }
  }

  private getCompetencyLearningObjectives(specialty: string, level: string): string {
    const objectives: Record<string, Record<string, string>> = {
      "Analytical Thinking": {
        "Beginner": "Understand basic data analysis concepts, identify patterns in simple datasets, apply fundamental statistical measures",
        "Intermediate": "Perform complex data analysis, create meaningful visualizations, interpret statistical results with confidence",
        "Advanced": "Design comprehensive analytical frameworks, lead data-driven decision making, mentor others in analytical approaches",
        "Expert": "Innovate analytical methodologies, establish organizational analytical standards, transform complex problems into actionable insights"
      },
      "Creative Problem Solving": {
        "Beginner": "Generate multiple solution alternatives, apply basic brainstorming techniques, think outside conventional approaches",
        "Intermediate": "Combine diverse ideas innovatively, facilitate creative sessions, implement creative solutions effectively",
        "Advanced": "Lead innovation initiatives, develop creative problem-solving frameworks, inspire creative thinking in teams",
        "Expert": "Pioneer new creative methodologies, transform organizational culture toward innovation, mentor creative leaders"
      },
      "Systems Thinking": {
        "Beginner": "Identify system components and relationships, understand cause-and-effect relationships, recognize feedback loops",
        "Intermediate": "Analyze complex systems interactions, design system improvements, predict system behavior changes",
        "Advanced": "Architect comprehensive system solutions, lead systems integration projects, optimize organizational systems",
        "Expert": "Design transformational system architectures, establish systems thinking as organizational capability, influence industry system standards"
      }
    };

    return objectives[specialty]?.[level] || `Develop competency in ${specialty} at ${level} level`;
  }

  getProviderId(): string {
    return this.providerId;
  }
}