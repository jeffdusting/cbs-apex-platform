/**
 * End-to-End Integration Tests
 * Tests complete workflows from frontend to backend
 */

import { TestEnvironment, getTestEnvironment } from '../utils/test-database';
import { TestDataCollections, ProviderFactory, MeetingFactory } from '../utils/test-factories';

describe('End-to-End Integration Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = getTestEnvironment();
    await testEnv.setupStandardTestData();
  });

  afterEach(() => {
    testEnv.reset();
  });

  describe('Complete Prompt Studio Workflow', () => {
    it('should handle complete prompt creation, execution, and response viewing', async () => {
      const storage = testEnv.getStorage();
      
      // 1. Create a prompt
      const promptData = {
        content: 'Analyze the impact of AI on healthcare',
        selectedProviders: ['openai-gpt5', 'anthropic-claude'],
        selectedFolders: ['research'],
        conversationId: null
      };

      const prompt = await storage.createPrompt(promptData);
      expect(prompt.id).toBeDefined();
      expect(prompt.content).toBe(promptData.content);

      // 2. Simulate AI responses
      const providers = await storage.getProviders();
      const selectedProviders = providers.filter(p => 
        promptData.selectedProviders.includes(p.id)
      );

      const responses = [];
      for (const provider of selectedProviders) {
        const mockProvider = testEnv.getMockProvider(provider.id);
        expect(mockProvider).toBeDefined();

        const aiResponse = await mockProvider!.generateResponse(prompt.content);
        
        const response = await storage.createResponse({
          promptId: prompt.id,
          providerId: provider.id,
          content: aiResponse.content,
          tokensUsed: aiResponse.tokensUsed,
          cost: aiResponse.cost.toString(),
          responseTime: aiResponse.responseTime,
          artifacts: aiResponse.artifacts || []
        });

        responses.push(response);

        // Update provider usage
        await storage.updateProviderUsage(provider.id, aiResponse.cost);
      }

      // 3. Verify responses were created
      expect(responses).toHaveLength(2);
      
      const promptResponses = await storage.getPromptResponses(prompt.id);
      expect(promptResponses).toHaveLength(2);

      // 4. Verify provider usage was updated
      const updatedProviders = await storage.getProviders();
      const gptProvider = updatedProviders.find(p => p.id === 'openai-gpt5');
      expect(gptProvider?.usage?.total).toBeGreaterThan(0);

      // 5. Test response retrieval and processing
      for (const response of promptResponses) {
        expect(response.content).toContain('Mock response from');
        expect(response.tokensUsed).toBeGreaterThan(0);
        expect(parseFloat(response.cost)).toBeGreaterThan(0);
        expect(response.responseTime).toBeGreaterThan(0);
      }
    });

    it('should handle document context injection', async () => {
      const storage = testEnv.getStorage();

      // 1. Create documents in a folder
      const researchDoc = await storage.createDocument({
        name: 'ai-research.txt',
        folderId: 'research',
        content: 'Latest research shows AI advances in medical diagnosis...',
        size: 52
      });

      // 2. Create prompt with folder context
      const prompt = await storage.createPrompt({
        content: 'Summarize recent AI developments',
        selectedProviders: ['openai-gpt5'],
        selectedFolders: ['research'],
        conversationId: null
      });

      // 3. Verify document was found
      const folderDocs = await storage.getFolderDocuments('research');
      expect(folderDocs).toContain(researchDoc);

      // 4. Simulate prompt processing with context
      const context = folderDocs
        .map(doc => `--- ${doc.name} ---\n${doc.content}`)
        .join('\n\n');
      
      const fullPrompt = `${context}\n\n${prompt.content}`;
      expect(fullPrompt).toContain('ai-research.txt');
      expect(fullPrompt).toContain('Latest research shows AI advances');
    });
  });

  describe('Complete AI Meeting Workflow', () => {
    it('should execute a full AI meeting with multiple agents and synthesis', async () => {
      const storage = testEnv.getStorage();

      // 1. Create AI meeting
      const meetingData = {
        name: 'Strategic AI Analysis',
        description: 'Multi-agent analysis of AI market trends',
        taskObjective: 'Provide comprehensive market analysis',
        initialPrompt: 'Analyze current AI market trends and future opportunities',
        llmChain: [
          {
            step: 1,
            providerId: 'openai-gpt5',
            primaryPersonality: 'Analytical',
            secondaryPersonality: 'Experimental',
            supplementalPrompt: 'Focus on technical innovation'
          },
          {
            step: 2,
            providerId: 'anthropic-claude',
            primaryPersonality: 'Strategic',
            secondaryPersonality: 'Organizing',
            supplementalPrompt: 'Consider business implications'
          },
          {
            step: 3,
            providerId: 'google-gemini',
            primaryPersonality: 'Relational',
            secondaryPersonality: 'Experimental',
            isDevilsAdvocate: true,
            supplementalPrompt: 'Challenge assumptions'
          }
        ],
        iterations: 2,
        selectedFolders: ['research'],
        synthesisProviderId: 'anthropic-claude'
      };

      const meeting = await storage.createPromptSequence(meetingData);
      expect(meeting.id).toBeDefined();
      expect(meeting.status).toBe('pending');

      // 2. Simulate meeting execution
      await storage.updatePromptSequence(meeting.id, { status: 'running' });

      // 3. Execute agent steps for each iteration
      let totalCost = 0;
      const allSteps = [];

      for (let iteration = 1; iteration <= meetingData.iterations; iteration++) {
        let currentPrompt = meetingData.initialPrompt;

        // Add context from previous iteration if exists
        if (iteration > 1) {
          const previousSteps = allSteps.filter(s => 
            s.iterationNumber === iteration - 1 && !s.isSynthesis
          );
          const previousContext = previousSteps
            .map(s => `${s.providerId}: ${s.outputContent}`)
            .join('\n\n');
          currentPrompt = `Previous discussion:\n${previousContext}\n\nContinue the analysis: ${meetingData.initialPrompt}`;
        }

        // Execute each agent step
        for (const chainStep of meetingData.llmChain) {
          const step = await storage.createSequenceStep({
            sequenceId: meeting.id,
            stepNumber: chainStep.step,
            providerId: chainStep.providerId,
            inputPrompt: currentPrompt,
            status: 'running',
            iterationNumber: iteration,
            isSynthesis: false
          });

          // Simulate AI response
          const mockProvider = testEnv.getMockProvider(chainStep.providerId);
          const aiResponse = await mockProvider!.generateResponse(currentPrompt);

          await storage.updateSequenceStep(step.id, {
            outputContent: aiResponse.content,
            status: 'completed',
            tokensUsed: aiResponse.tokensUsed,
            cost: aiResponse.cost.toString(),
            responseTime: aiResponse.responseTime
          });

          totalCost += aiResponse.cost;
          allSteps.push({
            ...step,
            outputContent: aiResponse.content,
            tokensUsed: aiResponse.tokensUsed,
            cost: aiResponse.cost.toString(),
            responseTime: aiResponse.responseTime,
            iterationNumber: iteration
          });

          // Update provider usage
          await storage.updateProviderUsage(chainStep.providerId, aiResponse.cost);
        }
      }

      // 4. Execute synthesis step
      const allAgentResponses = allSteps
        .filter(s => !s.isSynthesis)
        .map(s => `Agent ${s.stepNumber} (${s.providerId}): ${s.outputContent}`)
        .join('\n\n');

      const synthesisPrompt = `Synthesize the following agent discussions into a comprehensive analysis:\n\n${allAgentResponses}`;

      const synthesisStep = await storage.createSequenceStep({
        sequenceId: meeting.id,
        stepNumber: 999,
        providerId: meetingData.synthesisProviderId!,
        inputPrompt: synthesisPrompt,
        status: 'running',
        isSynthesis: true
      });

      const synthesisProvider = testEnv.getMockProvider(meetingData.synthesisProviderId!);
      const synthesisResponse = await synthesisProvider!.generateResponse(synthesisPrompt);

      await storage.updateSequenceStep(synthesisStep.id, {
        outputContent: synthesisResponse.content,
        status: 'completed',
        tokensUsed: synthesisResponse.tokensUsed,
        cost: synthesisResponse.cost.toString(),
        responseTime: synthesisResponse.responseTime
      });

      totalCost += synthesisResponse.cost;

      // 5. Complete the meeting
      await storage.updatePromptSequence(meeting.id, {
        status: 'completed',
        completedAt: new Date(),
        totalCost: totalCost.toString()
      });

      // 6. Verify meeting results
      const completedMeeting = await storage.getPromptSequence(meeting.id);
      expect(completedMeeting?.status).toBe('completed');
      expect(parseFloat(completedMeeting?.totalCost || '0')).toBeGreaterThan(0);

      const meetingSteps = await storage.getSequenceSteps(meeting.id);
      expect(meetingSteps).toHaveLength(7); // 3 agents × 2 iterations + 1 synthesis

      const synthStep = meetingSteps.find(s => s.isSynthesis);
      expect(synthStep).toBeDefined();
      expect(synthStep?.outputContent).toContain('Mock response from');

      // 7. Update agent experience
      const agents = await storage.getAgentLibraries();
      for (const agent of agents) {
        await storage.updateAgentExperience(
          agent.id,
          meeting.id,
          'Participant',
          ['Provided analytical insights'],
          ['Market trends analysis'],
          ['AI', 'Strategy', 'Innovation']
        );
      }

      // Verify experience was updated
      const updatedAgents = await storage.getAgentLibraries();
      const firstAgent = updatedAgents[0];
      expect(firstAgent.experienceHistory).toHaveLength(1);
      expect(firstAgent.experienceHistory![0].meetingId).toBe(meeting.id);
    });

    it('should handle meeting export and reporting', async () => {
      const storage = testEnv.getStorage();

      // Create a completed meeting with steps
      const meeting = MeetingFactory.createCompleted();
      storage.seedSequences([meeting]);

      const steps = [
        {
          id: 'step-1',
          sequenceId: meeting.id,
          stepNumber: 1,
          providerId: 'openai-gpt5',
          inputPrompt: 'Analyze market trends',
          outputContent: 'Market analysis shows growth...',
          status: 'completed' as const,
          tokensUsed: 100,
          cost: '0.003',
          responseTime: 1500,
          isSynthesis: false,
          iterationNumber: 1
        },
        {
          id: 'step-synthesis',
          sequenceId: meeting.id,
          stepNumber: 999,
          providerId: 'anthropic-claude',
          inputPrompt: 'Synthesize discussions',
          outputContent: 'Overall synthesis conclusion...',
          status: 'completed' as const,
          tokensUsed: 150,
          cost: '0.0045',
          responseTime: 2000,
          isSynthesis: true
        }
      ];
      storage.seedSteps(steps);

      // Test meeting data retrieval
      const retrievedMeeting = await storage.getPromptSequence(meeting.id);
      const retrievedSteps = await storage.getSequenceSteps(meeting.id);

      expect(retrievedMeeting).toBeDefined();
      expect(retrievedSteps).toHaveLength(2);

      // Test synthesis step identification
      const synthesisStep = retrievedSteps.find(s => s.isSynthesis);
      expect(synthesisStep).toBeDefined();
      expect(synthesisStep?.outputContent).toBe('Overall synthesis conclusion...');

      // Verify export data structure
      const exportData = {
        meeting: retrievedMeeting,
        agentSteps: retrievedSteps.filter(s => !s.isSynthesis),
        synthesis: synthesisStep
      };

      expect(exportData.meeting?.status).toBe('completed');
      expect(exportData.agentSteps).toHaveLength(1);
      expect(exportData.synthesis).toBeDefined();
    });
  });

  describe('Agent Library Integration', () => {
    it('should save and load agents with experience tracking', async () => {
      const storage = testEnv.getStorage();

      // 1. Create new agent
      const agentData = {
        name: 'Market Analyst',
        description: 'Specialized in market analysis and trends',
        primaryPersonality: 'Analytical',
        secondaryPersonality: 'Strategic',
        supplementalPrompt: 'Focus on data-driven market insights',
        preferredProviderId: 'openai-gpt5'
      };

      const agent = await storage.createAgentLibrary(agentData);
      expect(agent.id).toBeDefined();

      // 2. Use agent in meeting
      const meeting = await storage.createPromptSequence({
        name: 'Market Analysis Meeting',
        taskObjective: 'Analyze market conditions',
        initialPrompt: 'What are current market trends?',
        llmChain: [
          {
            step: 1,
            providerId: agent.preferredProviderId,
            primaryPersonality: agent.primaryPersonality,
            supplementalPrompt: agent.supplementalPrompt
          }
        ],
        iterations: 1
      });

      // 3. Update agent experience
      await storage.updateAgentExperience(
        agent.id,
        meeting.id,
        'Lead Analyst',
        ['Market trend analysis', 'Data interpretation'],
        ['Growth opportunities identified', 'Risk factors assessed'],
        ['Finance', 'Technology', 'Healthcare']
      );

      // 4. Verify experience was recorded
      const updatedAgent = await storage.getAgentLibrary(agent.id);
      expect(updatedAgent?.experienceHistory).toHaveLength(1);
      
      const experience = updatedAgent!.experienceHistory![0];
      expect(experience.meetingId).toBe(meeting.id);
      expect(experience.role).toBe('Lead Analyst');
      expect(experience.contributions).toContain('Market trend analysis');
      expect(experience.insights).toContain('Growth opportunities identified');
      expect(experience.topics).toContain('Finance');

      // 5. Test agent retrieval for reuse
      const allAgents = await storage.getAgentLibraries();
      const marketAnalyst = allAgents.find(a => a.name === 'Market Analyst');
      expect(marketAnalyst).toBeDefined();
      expect(marketAnalyst?.experienceHistory).toHaveLength(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle provider failures gracefully', async () => {
      const storage = testEnv.getStorage();

      // Create meeting with non-existent provider
      const meeting = await storage.createPromptSequence({
        name: 'Test Meeting',
        taskObjective: 'Test objective',
        initialPrompt: 'Test prompt',
        llmChain: [
          {
            step: 1,
            providerId: 'non-existent-provider',
            primaryPersonality: 'Analytical'
          }
        ],
        iterations: 1
      });

      // Attempt to get non-existent provider
      const provider = await storage.getProvider('non-existent-provider');
      expect(provider).toBeNull();

      // Meeting should handle provider failure
      const step = await storage.createSequenceStep({
        sequenceId: meeting.id,
        stepNumber: 1,
        providerId: 'non-existent-provider',
        inputPrompt: 'Test prompt',
        status: 'failed'
      });

      expect(step.status).toBe('failed');
    });

    it('should handle empty responses and timeouts', async () => {
      const storage = testEnv.getStorage();

      // Test empty response handling
      const response = await storage.createResponse({
        promptId: 'test-prompt',
        providerId: 'openai-gpt5',
        content: '',
        tokensUsed: 0,
        cost: '0',
        responseTime: 30000 // Simulate timeout
      });

      expect(response.content).toBe('');
      expect(response.tokensUsed).toBe(0);
      expect(response.responseTime).toBe(30000);
    });
  });
});