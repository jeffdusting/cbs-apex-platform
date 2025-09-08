/**
 * Frontend Integration Tests for AI Meetings Workflow
 */

// Mock React Query and custom hooks
jest.mock('@tanstack/react-query');
jest.mock('@/hooks/useProviders');
jest.mock('@/hooks/useFolders');
jest.mock('@/hooks/use-toast');
jest.mock('@/hooks/useMoodWebSocket');

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProviders } from '@/hooks/useProviders';
import { useFolders } from '@/hooks/useFolders';
import { useToast } from '@/hooks/use-toast';
import { useMoodWebSocket } from '@/hooks/useMoodWebSocket';
import PromptSequencing from '@/pages/prompt-sequencing';

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockUseProviders = useProviders as jest.MockedFunction<typeof useProviders>;
const mockUseFolders = useFolders as jest.MockedFunction<typeof useFolders>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockUseMoodWebSocket = useMoodWebSocket as jest.MockedFunction<typeof useMoodWebSocket>;

// Helper function to create proper React Query v5 mock objects
const createQueryMock = (data: any, isLoading = false, error: any = null) => ({
  data,
  isLoading,
  isPending: isLoading,
  isError: !!error,
  error,
  status: (error ? 'error' : 'success') as const,
  refetch: jest.fn(),
  isRefetching: false,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: error ? Date.now() : 0,
  errorUpdateCount: error ? 1 : 0,
  failureCount: error ? 1 : 0,
  failureReason: error,
  fetchStatus: 'idle' as const,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isLoadingError: false,
  isRefetchError: false,
  isStale: false,
  isSuccess: !error
} as any);

describe('AI Meetings Integration Tests', () => {
  const mockProviders = [
    {
      id: 'openai-gpt5',
      name: 'GPT-5',
      model: 'gpt-5',
      icon: 'fas fa-brain',
      color: 'blue',
      isEnabled: true
    },
    {
      id: 'anthropic-claude',
      name: 'Claude',
      model: 'claude-sonnet-4',
      icon: 'fas fa-robot',
      color: 'orange',
      isEnabled: true
    },
    {
      id: 'google-gemini',
      name: 'Gemini',
      model: 'gemini-2.5-pro',
      icon: 'fas fa-gem',
      color: 'purple',
      isEnabled: true
    }
  ];

  const mockFolders = [
    { id: 'general', name: 'General', description: 'General documents' },
    { id: 'research', name: 'Research', description: 'Research documents' }
  ];

  const mockAgentLibraries = [
    {
      id: 'agent-1',
      name: 'Data Analyst',
      description: 'Analytical agent for data insights',
      primaryPersonality: 'Analytical',
      secondaryPersonality: 'Experimental',
      preferredProviderId: 'openai-gpt5'
    }
  ];

  const mockToast = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseProviders.mockReturnValue({ data: mockProviders });
    mockUseFolders.mockReturnValue({ data: mockFolders });
    mockUseToast.mockReturnValue({ toast: mockToast });
    
    // Mock mood WebSocket
    mockUseMoodWebSocket.mockReturnValue({
      moods: {},
      isConnected: true
    });

    // Set up default query mocks
    mockUseQuery
      .mockReturnValueOnce(createQueryMock(mockAgentLibraries)) // agent libraries
      .mockReturnValueOnce(createQueryMock([])) // meetings
      .mockReturnValueOnce(createQueryMock([])); // meeting steps
  });

  describe('Complete AI Meeting Workflow', () => {
    it('should create and execute a complete AI meeting', async () => {
      // Mock successful meeting creation
      const mockCreateMeeting = jest.fn((data, { onSuccess }) => {
        const meetingResult = {
          id: 'meeting-123',
          name: data.name,
          status: 'running'
        };
        onSuccess(meetingResult);
      });

      // Mock save agent
      const mockSaveAgent = jest.fn();

      mockUseMutation
        .mockReturnValueOnce({
          mutate: mockCreateMeeting,
          isPending: false,
          error: null,
          data: null
        })
        .mockReturnValueOnce({
          mutate: mockSaveAgent,
          isPending: false,
          error: null,
          data: null
        });

      render(<PromptSequencing />);

      // 1. Verify initial page load
      expect(screen.getByTestId('ai-meetings-page')).toBeInTheDocument();
      expect(screen.getByText('AI Meetings')).toBeInTheDocument();

      // 2. Configure meeting details
      const meetingNameInput = screen.getByTestId('input-meeting-name');
      fireEvent.change(meetingNameInput, {
        target: { value: 'Strategic Analysis Meeting' }
      });

      const descriptionInput = screen.getByTestId('input-meeting-description');
      fireEvent.change(descriptionInput, {
        target: { value: 'Multi-agent strategic analysis session' }
      });

      const objectiveInput = screen.getByTestId('input-meeting-objective');
      fireEvent.change(objectiveInput, {
        target: { value: 'Analyze market opportunities and risks' }
      });

      const promptInput = screen.getByTestId('input-initial-prompt');
      fireEvent.change(promptInput, {
        target: { value: 'Analyze the current AI market landscape' }
      });

      // 3. Configure agent chain
      const agentSection = screen.getByTestId('agent-chain-section');
      
      // Add first agent
      const firstAgentProvider = within(agentSection).getByTestId('agent-0-provider-select');
      fireEvent.change(firstAgentProvider, { target: { value: 'openai-gpt5' } });

      const firstAgentPersonality = within(agentSection).getByTestId('agent-0-primary-personality');
      fireEvent.change(firstAgentPersonality, { target: { value: 'Analytical' } });

      const firstAgentSecondary = within(agentSection).getByTestId('agent-0-secondary-personality');
      fireEvent.change(firstAgentSecondary, { target: { value: 'Experimental' } });

      const firstAgentPrompt = within(agentSection).getByTestId('agent-0-supplemental-prompt');
      fireEvent.change(firstAgentPrompt, {
        target: { value: 'Focus on technical innovation and data analysis' }
      });

      // Add second agent
      const addAgentButton = screen.getByTestId('button-add-agent');
      fireEvent.click(addAgentButton);

      const secondAgentProvider = within(agentSection).getByTestId('agent-1-provider-select');
      fireEvent.change(secondAgentProvider, { target: { value: 'anthropic-claude' } });

      const secondAgentPersonality = within(agentSection).getByTestId('agent-1-primary-personality');
      fireEvent.change(secondAgentPersonality, { target: { value: 'Relational' } });

      // 4. Configure synthesis provider
      const synthesisSelect = screen.getByTestId('synthesis-provider-select');
      fireEvent.change(synthesisSelect, { target: { value: 'google-gemini' } });

      // 5. Set iterations
      const iterationsInput = screen.getByTestId('input-iterations');
      fireEvent.change(iterationsInput, { target: { value: '2' } });

      // 6. Start meeting
      const startButton = screen.getByTestId('button-start-meeting');
      fireEvent.click(startButton);

      // Verify meeting creation was called
      expect(mockCreateMeeting).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Strategic Analysis Meeting',
          description: 'Multi-agent strategic analysis session',
          taskObjective: 'Analyze market opportunities and risks',
          initialPrompt: 'Analyze the current AI market landscape',
          iterations: 2,
          llmChain: expect.arrayContaining([
            expect.objectContaining({
              step: 1,
              providerId: 'openai-gpt5',
              primaryPersonality: 'Analytical'
            }),
            expect.objectContaining({
              step: 2,
              providerId: 'anthropic-claude',
              primaryPersonality: 'Relational'
            })
          ])
        }),
        expect.any(Object)
      );

      // 7. Verify success toast
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Meeting created and started successfully'
      });
    });

    it('should handle mood tracking during meeting execution', async () => {
      // Mock active meeting with mood data
      mockUseMoodWebSocket.mockReturnValue({
        moods: {
          'agent-openai-gpt5-0': {
            agentId: 'agent-openai-gpt5-0',
            agentName: 'GPT-5 Analyst',
            currentMood: 'focused',
            moodIntensity: 0.8,
            confidence: 0.9,
            status: 'analyzing',
            lastUpdated: new Date()
          },
          'agent-anthropic-claude-1': {
            agentId: 'agent-anthropic-claude-1',
            agentName: 'Claude Strategist',
            currentMood: 'collaborative',
            moodIntensity: 0.7,
            confidence: 0.85,
            status: 'discussing',
            lastUpdated: new Date()
          }
        },
        isConnected: true
      });

      render(<PromptSequencing />);

      // Should display mood indicators
      const moodBar = screen.getByTestId('meeting-mood-bar');
      expect(moodBar).toBeInTheDocument();

      const gptMood = within(moodBar).getByTestId('agent-mood-agent-openai-gpt5-0');
      expect(gptMood).toBeInTheDocument();
      expect(within(gptMood).getByText('focused')).toBeInTheDocument();

      const claudeMood = within(moodBar).getByTestId('agent-mood-agent-anthropic-claude-1');
      expect(claudeMood).toBeInTheDocument();
      expect(within(claudeMood).getByText('collaborative')).toBeInTheDocument();
    });

    it('should save agents to library', async () => {
      const mockSaveAgent = jest.fn((data, { onSuccess }) => {
        onSuccess({ id: 'agent-new', ...data });
      });

      mockUseMutation
        .mockReturnValueOnce({
          mutate: jest.fn(),
          isPending: false,
          error: null,
          data: null
        })
        .mockReturnValueOnce({
          mutate: mockSaveAgent,
          isPending: false,
          error: null,
          data: null
        });

      render(<PromptSequencing />);

      // Configure an agent
      const agentSection = screen.getByTestId('agent-chain-section');
      const providerSelect = within(agentSection).getByTestId('agent-0-provider-select');
      fireEvent.change(providerSelect, { target: { value: 'openai-gpt5' } });

      const personalitySelect = within(agentSection).getByTestId('agent-0-primary-personality');
      fireEvent.change(personalitySelect, { target: { value: 'Analytical' } });

      // Save agent to library
      const saveButton = within(agentSection).getByTestId('button-save-agent-0');
      fireEvent.click(saveButton);

      // Should open save dialog
      const saveDialog = screen.getByTestId('save-agent-dialog');
      expect(saveDialog).toBeInTheDocument();

      const agentNameInput = within(saveDialog).getByTestId('input-agent-name');
      fireEvent.change(agentNameInput, { target: { value: 'Technical Analyst' } });

      const agentDescInput = within(saveDialog).getByTestId('input-agent-description');
      fireEvent.change(agentDescInput, { 
        target: { value: 'Specialized in technical analysis and data interpretation' } 
      });

      const confirmSaveButton = within(saveDialog).getByTestId('button-confirm-save');
      fireEvent.click(confirmSaveButton);

      expect(mockSaveAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Technical Analyst',
          description: 'Specialized in technical analysis and data interpretation',
          agent: expect.objectContaining({
            primaryPersonality: 'Analytical',
            providerId: 'openai-gpt5'
          })
        }),
        expect.any(Object)
      );
    });

    it('should load agents from library', async () => {
      render(<PromptSequencing />);

      const agentSection = screen.getByTestId('agent-chain-section');
      
      // Click load from library button
      const loadButton = within(agentSection).getByTestId('button-load-agent-0');
      fireEvent.click(loadButton);

      // Should open library dialog
      const libraryDialog = screen.getByTestId('agent-library-dialog');
      expect(libraryDialog).toBeInTheDocument();

      // Should show available agents
      const agentCard = within(libraryDialog).getByTestId('agent-card-agent-1');
      expect(agentCard).toBeInTheDocument();
      expect(within(agentCard).getByText('Data Analyst')).toBeInTheDocument();

      // Select agent
      fireEvent.click(agentCard);

      const confirmLoadButton = within(libraryDialog).getByTestId('button-confirm-load');
      fireEvent.click(confirmLoadButton);

      // Agent should be loaded into the chain
      const providerSelect = within(agentSection).getByTestId('agent-0-provider-select');
      expect(providerSelect).toHaveValue('openai-gpt5');
    });

    it('should handle meeting execution results', async () => {
      // Mock meeting steps data
      const mockSteps = [
        {
          id: 'step-1',
          stepNumber: 1,
          providerId: 'openai-gpt5',
          inputPrompt: 'Analyze the AI market landscape',
          outputContent: 'The AI market shows significant growth potential...',
          status: 'completed',
          tokensUsed: 150,
          cost: '0.0045',
          responseTime: 2500,
          isSynthesis: false
        },
        {
          id: 'step-2',
          stepNumber: 2,
          providerId: 'anthropic-claude',
          inputPrompt: 'Consider the human impact and ethical implications',
          outputContent: 'From an ethical perspective, AI development must consider...',
          status: 'completed',
          tokensUsed: 180,
          cost: '0.0054',
          responseTime: 1800,
          isSynthesis: false
        },
        {
          id: 'step-synthesis',
          stepNumber: 3,
          providerId: 'google-gemini',
          outputContent: 'Synthesizing all perspectives: The AI market presents...',
          status: 'completed',
          tokensUsed: 250,
          cost: '0.0075',
          responseTime: 3200,
          isSynthesis: true
        }
      ];

      mockUseQuery
        .mockReturnValueOnce(createQueryMock(mockAgentLibraries))
        .mockReturnValueOnce(createQueryMock([{ id: 'meeting-123', name: 'Test Meeting' }]))
        .mockReturnValueOnce(createQueryMock(mockSteps));

      render(<PromptSequencing />);

      // Select the meeting to view results
      const meetingSelect = screen.getByTestId('meeting-select');
      fireEvent.change(meetingSelect, { target: { value: 'meeting-123' } });

      await waitFor(() => {
        // Should display meeting steps
        const resultsSection = screen.getByTestId('meeting-results');
        expect(resultsSection).toBeInTheDocument();

        // Check individual steps
        const step1 = screen.getByTestId('step-step-1');
        expect(step1).toBeInTheDocument();
        expect(within(step1).getByText('GPT-5')).toBeInTheDocument();
        expect(within(step1).getByText('The AI market shows significant growth potential...')).toBeInTheDocument();

        const step2 = screen.getByTestId('step-step-2');
        expect(step2).toBeInTheDocument();
        expect(within(step2).getByText('Claude')).toBeInTheDocument();

        // Check synthesis step
        const synthesisStep = screen.getByTestId('step-step-synthesis');
        expect(synthesisStep).toBeInTheDocument();
        expect(within(synthesisStep).getByText('Synthesis')).toBeInTheDocument();
        expect(within(synthesisStep).getByText('Synthesizing all perspectives:')).toBeInTheDocument();
      });
    });

    it('should handle export functionality', async () => {
      // Mock completed meeting
      mockUseQuery
        .mockReturnValueOnce(createQueryMock(mockAgentLibraries))
        .mockReturnValueOnce(createQueryMock([{ id: 'meeting-123', name: 'Test Meeting', status: 'completed' }]))
        .mockReturnValueOnce(createQueryMock([]));

      render(<PromptSequencing />);

      const meetingSelect = screen.getByTestId('meeting-select');
      fireEvent.change(meetingSelect, { target: { value: 'meeting-123' } });

      await waitFor(() => {
        const exportButton = screen.getByTestId('button-export-csv');
        expect(exportButton).toBeInTheDocument();

        const reportButton = screen.getByTestId('button-download-report');
        expect(reportButton).toBeInTheDocument();
      });
    });

    it('should handle error states appropriately', async () => {
      const mockCreateWithError = jest.fn((data, { onError }) => {
        onError(new Error('Network error'));
      });

      mockUseMutation.mockReturnValue({
        mutate: mockCreateWithError,
        isPending: false,
        error: new Error('Network error'),
        data: null
      });

      render(<PromptSequencing />);

      // Fill minimum required fields and submit
      const meetingNameInput = screen.getByTestId('input-meeting-name');
      fireEvent.change(meetingNameInput, { target: { value: 'Test Meeting' } });

      const startButton = screen.getByTestId('button-start-meeting');
      fireEvent.click(startButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create meeting',
        variant: 'destructive'
      });
    });
  });
});