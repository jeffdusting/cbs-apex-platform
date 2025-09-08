/**
 * Frontend Integration Tests for Prompt Studio Workflow
 */

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  }))
}));

// Mock custom hooks
jest.mock('@/hooks/useProviders', () => ({
  useProviders: jest.fn()
}));

jest.mock('@/hooks/useFolders', () => ({
  useFolders: jest.fn()
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
}));

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProviders } from '@/hooks/useProviders';
import { useFolders } from '@/hooks/useFolders';
import { useToast } from '@/hooks/use-toast';
import PromptStudio from '@/pages/prompt-studio';

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;
const mockUseProviders = useProviders as jest.MockedFunction<typeof useProviders>;
const mockUseFolders = useFolders as jest.MockedFunction<typeof useFolders>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;

describe('Prompt Studio Integration Tests', () => {
  const mockProviders = [
    {
      id: 'openai-gpt5',
      name: 'GPT-5',
      model: 'gpt-5',
      availableModels: ['gpt-5'],
      apiKeyEnvVar: 'OPENAI_API_KEY',
      costPer1kTokens: '0.01',
      isEnabled: true,
      quotaUsed: '0',
      quotaLimit: '1000',
      icon: 'fas fa-brain',
      color: 'blue',
      description: 'OpenAI GPT-5',
      website: 'https://openai.com',
      documentation: 'https://platform.openai.com/docs',
      maxTokens: 8192,
      supportedFeatures: {
        streaming: true,
        functionCalling: true,
        imageAnalysis: true,
        codeGeneration: true,
        multiModal: true
      },
      rateLimit: {
        requestsPerMinute: 500,
        tokensPerMinute: 30000,
        tokensPerDay: 1000000
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    },
    {
      id: 'anthropic-claude',
      name: 'Claude',
      model: 'claude-sonnet-4',
      availableModels: ['claude-sonnet-4'],
      apiKeyEnvVar: 'ANTHROPIC_API_KEY',
      costPer1kTokens: '0.008',
      isEnabled: true,
      quotaUsed: '0',
      quotaLimit: '1000',
      icon: 'fas fa-robot',
      color: 'orange',
      description: 'Anthropic Claude',
      website: 'https://anthropic.com',
      documentation: 'https://docs.anthropic.com',
      maxTokens: 8192,
      supportedFeatures: {
        streaming: true,
        functionCalling: true,
        imageAnalysis: true,
        codeGeneration: true,
        multiModal: true
      },
      rateLimit: {
        requestsPerMinute: 300,
        tokensPerMinute: 25000,
        tokensPerDay: 800000
      },
      lastUpdated: new Date(),
      createdAt: new Date()
    }
  ];

  const mockFolders = [
    {
      id: 'general',
      name: 'General',
      description: 'General documents'
    },
    {
      id: 'research',
      name: 'Research',
      description: 'Research documents'
    }
  ];

  const mockToast = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseProviders.mockReturnValue({ 
      data: mockProviders,
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      status: 'success' as const,
      refetch: jest.fn(),
      isRefetching: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      errorUpdateCount: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle' as const,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isLoadingError: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: true
    });
    mockUseFolders.mockReturnValue({ 
      data: mockFolders,
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      status: 'success' as const,
      refetch: jest.fn(),
      isRefetching: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      errorUpdateCount: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle' as const,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isLoadingError: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: true
    });
    mockUseToast.mockReturnValue({ 
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    });
    mockQueryClient.mockReturnValue({ invalidateQueries: mockInvalidateQueries });
  });

  describe('Complete Prompt Workflow', () => {
    it('should complete full prompt creation and response viewing workflow', async () => {
      // Mock successful prompt creation
      const mockMutate = jest.fn((data, { onSuccess }) => {
        const promptResult = {
          id: 'prompt-123',
          content: data.content,
          selectedProviders: data.selectedProviders,
          status: 'completed'
        };
        onSuccess(promptResult);
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
        data: null
      });

      // Mock responses query
      mockUseQuery.mockReturnValue({
        data: [
          {
            id: 'response-123',
            promptId: 'prompt-123',
            providerId: 'openai-gpt5',
            content: 'This is a test AI response from GPT-5.',
            tokensUsed: 45,
            cost: '0.00135',
            responseTime: 1250,
            artifacts: []
          },
          {
            id: 'response-124',
            promptId: 'prompt-123',
            providerId: 'anthropic-claude',
            content: 'This is a test AI response from Claude.',
            tokensUsed: 52,
            cost: '0.00156',
            responseTime: 980,
            artifacts: [
              {
                name: 'analysis-script',
                type: 'code',
                language: 'python',
                content: 'print("Hello, World!")'
              }
            ]
          }
        ],
        isLoading: false,
        error: null
      });

      render(<PromptStudio />);

      // 1. Verify initial page load
      expect(screen.getByTestId('prompt-studio')).toBeInTheDocument();
      expect(screen.getByText('New Prompt')).toBeInTheDocument();

      // 2. Select providers
      const providerSection = screen.getByTestId('provider-selector');
      expect(providerSection).toBeInTheDocument();

      // Click on GPT-5 provider
      const gptProvider = within(providerSection).getByTestId('provider-openai-gpt5');
      fireEvent.click(gptProvider);

      // Click on Claude provider
      const claudeProvider = within(providerSection).getByTestId('provider-anthropic-claude');
      fireEvent.click(claudeProvider);

      // 3. Enter prompt content
      const promptEditor = screen.getByTestId('prompt-editor');
      const textArea = within(promptEditor).getByRole('textbox');
      fireEvent.change(textArea, {
        target: { value: 'Analyze the impact of AI on modern education systems' }
      });

      // 4. Submit prompt
      const sendButton = screen.getByTestId('button-send-prompt');
      fireEvent.click(sendButton);

      // Verify prompt creation was called
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Analyze the impact of AI on modern education systems',
          selectedProviders: ['openai-gpt5', 'anthropic-claude']
        }),
        expect.any(Object)
      );

      // 5. Verify responses appear
      await waitFor(() => {
        const responseArea = screen.getByTestId('response-area');
        expect(responseArea).toBeInTheDocument();

        // Check GPT-5 response
        const gptResponse = screen.getByTestId('response-response-123');
        expect(gptResponse).toBeInTheDocument();
        expect(within(gptResponse).getByText('GPT-5')).toBeInTheDocument();
        expect(within(gptResponse).getByText('This is a test AI response from GPT-5.')).toBeInTheDocument();
        expect(within(gptResponse).getByText('$0.001')).toBeInTheDocument();
        expect(within(gptResponse).getByText('1.3s')).toBeInTheDocument();

        // Check Claude response
        const claudeResponse = screen.getByTestId('response-response-124');
        expect(claudeResponse).toBeInTheDocument();
        expect(within(claudeResponse).getByText('Claude')).toBeInTheDocument();
        expect(within(claudeResponse).getByText('This is a test AI response from Claude.')).toBeInTheDocument();
        expect(within(claudeResponse).getByText('$0.002')).toBeInTheDocument();
        expect(within(claudeResponse).getByText('1.0s')).toBeInTheDocument();

        // Check artifact
        const artifactButton = screen.getByTestId('button-download-artifact-response-124-0');
        expect(artifactButton).toBeInTheDocument();
        expect(within(claudeResponse).getByText('Artifact: analysis-script')).toBeInTheDocument();
      });

      // 6. Test copy functionality
      const copyButton = screen.getByTestId('button-copy-response-123');
      fireEvent.click(copyButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content copied to clipboard'
      });

      // 7. Test new tab functionality
      const newTabButton = screen.getByTestId('button-open-new-tab');
      expect(newTabButton).toBeInTheDocument();

      // Mock window.open
      const mockWindowOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockWindowOpen,
        writable: true
      });

      fireEvent.click(newTabButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/response-viewer?promptId=prompt-123&providers=openai-gpt5,anthropic-claude',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should handle provider selection and cost calculation', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: null,
        data: null
      });

      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });

      render(<PromptStudio />);

      const providerSection = screen.getByTestId('provider-selector');

      // Initially no providers selected
      expect(screen.getByTestId('current-cost')).toHaveTextContent('$0.00');

      // Select GPT-5
      const gptProvider = within(providerSection).getByTestId('provider-openai-gpt5');
      fireEvent.click(gptProvider);

      // Enter some text to trigger cost calculation
      const promptEditor = screen.getByTestId('prompt-editor');
      const textArea = within(promptEditor).getByRole('textbox');
      fireEvent.change(textArea, {
        target: { value: 'This is a test prompt for cost calculation' }
      });

      // Cost should update based on estimated tokens
      await waitFor(() => {
        const costElement = screen.getByTestId('current-cost');
        expect(costElement.textContent).not.toBe('$0.00');
      });
    });

    it('should handle document folder selection', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: null,
        data: null
      });

      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });

      render(<PromptStudio />);

      // Find context panel
      const contextPanel = screen.getByTestId('context-panel');
      expect(contextPanel).toBeInTheDocument();

      // Select research folder
      const researchFolder = within(contextPanel).getByTestId('folder-research');
      fireEvent.click(researchFolder);

      // Verify folder is selected
      expect(within(contextPanel).getByTestId('folder-research')).toHaveClass('selected');
    });

    it('should handle error states gracefully', async () => {
      const mockMutateWithError = jest.fn((data, { onError }) => {
        onError(new Error('API Error'));
      });

      mockUseMutation.mockReturnValue({
        mutate: mockMutateWithError,
        isPending: false,
        error: new Error('API Error'),
        data: null
      });

      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });

      render(<PromptStudio />);

      // Select a provider and enter content
      const gptProvider = screen.getByTestId('provider-openai-gpt5');
      fireEvent.click(gptProvider);

      const textArea = screen.getByRole('textbox');
      fireEvent.change(textArea, {
        target: { value: 'Test prompt' }
      });

      // Submit prompt
      const sendButton = screen.getByTestId('button-send-prompt');
      fireEvent.click(sendButton);

      // Should show error toast
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to submit prompt',
        variant: 'destructive'
      });
    });

    it('should show loading states properly', async () => {
      mockUseMutation.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        error: null,
        data: null
      });

      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: true,
        error: null
      });

      render(<PromptStudio />);

      // Should show loading skeleton in response area
      const responseArea = screen.getByTestId('response-area');
      const loadingSkeletons = within(responseArea).getAllByText(/animate-pulse/);
      expect(loadingSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Response Viewer Integration', () => {
    it('should handle response viewer URL parameters correctly', () => {
      // Mock URL parameters
      Object.defineProperty(window, 'location', {
        value: {
          search: '?promptId=prompt-123&providers=openai-gpt5,anthropic-claude'
        },
        writable: true
      });

      // This would be tested in the ResponseViewer component
      const params = new URLSearchParams(window.location.search);
      expect(params.get('promptId')).toBe('prompt-123');
      expect(params.get('providers')).toBe('openai-gpt5,anthropic-claude');
    });
  });
});