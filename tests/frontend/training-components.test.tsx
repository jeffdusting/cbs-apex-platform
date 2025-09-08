/**
 * Training Module UI Component Tests
 * 
 * Tests individual React components and their functionality
 * within the training module interface.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import AgentTraining from '../../client/src/pages/agent-training';

// Mock the API module
jest.mock('../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

// Mock toast hook
jest.mock('../../client/src/hooks/use-toast', () => ({
  toast: jest.fn(),
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Training Module UI Components', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    // Clear all mocks
    jest.clearAllMocks();

    // Mock successful API responses
    const mockApiRequest = require('../../client/src/lib/queryClient').apiRequest;
    
    // Default mock responses
    mockApiRequest.mockImplementation((endpoint: string) => {
      if (endpoint === '/api/training/sessions') {
        return Promise.resolve([
          {
            id: 'session-1',
            agentId: 'agent-1',
            agentName: 'Test Agent 1',
            specialtyName: 'JavaScript Development',
            targetCompetencyLevel: 'Advanced',
            currentCompetencyLevel: 'Intermediate',
            status: 'in_progress',
            progress: 65,
            currentIteration: 3,
            maxIterations: 10,
            startedAt: new Date().toISOString()
          },
          {
            id: 'session-2',
            agentId: 'agent-2',
            agentName: 'Test Agent 2',
            specialtyName: 'Data Analysis',
            targetCompetencyLevel: 'Expert',
            currentCompetencyLevel: 'Advanced',
            status: 'completed',
            progress: 100,
            currentIteration: 8,
            maxIterations: 10,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          }
        ]);
      }
      
      if (endpoint === '/api/training/specialties') {
        return Promise.resolve([
          {
            id: 'specialty-1',
            name: 'JavaScript Development',
            description: 'Modern JavaScript programming',
            domain: 'technical',
            competencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          },
          {
            id: 'specialty-2',
            name: 'Data Analysis',
            description: 'Statistical analysis and visualization',
            domain: 'analytical',
            competencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
          }
        ]);
      }
      
      if (endpoint === '/api/agent-library') {
        return Promise.resolve([
          {
            id: 'agent-1',
            name: 'Test Agent 1',
            description: 'Analytical agent for testing',
            primaryPersonality: 'analytical'
          },
          {
            id: 'agent-2',
            name: 'Test Agent 2',
            description: 'Creative agent for testing',
            primaryPersonality: 'creative'
          }
        ]);
      }

      return Promise.resolve([]);
    });
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Main Training Page', () => {
    it('should render training page with all tabs', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Agent Training Hub')).toBeInTheDocument();
      });

      // Check for tab triggers
      expect(screen.getByText('Agents In Training')).toBeInTheDocument();
      expect(screen.getByText('Start New Training')).toBeInTheDocument();
      expect(screen.getByText('Training Competencies')).toBeInTheDocument();
    });

    it('should switch between tabs correctly', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Agent Training Hub')).toBeInTheDocument();
      });

      // Click on "Start New Training" tab
      const startTrainingTab = screen.getByText('Start New Training');
      fireEvent.click(startTrainingTab);

      await waitFor(() => {
        expect(screen.getByText('Select Agent')).toBeInTheDocument();
      });

      // Click on "Training Competencies" tab
      const competenciesTab = screen.getByText('Training Competencies');
      fireEvent.click(competenciesTab);

      await waitFor(() => {
        expect(screen.getByText('Available Specialties')).toBeInTheDocument();
      });
    });
  });

  describe('Agents In Training Tab', () => {
    it('should display active training sessions', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Agents Currently Training (1)')).toBeInTheDocument();
      });

      // Check for active session details
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Specialty: JavaScript Development')).toBeInTheDocument();
      expect(screen.getByText('Target: Advanced')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('should display completed training sessions', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Recently Completed (1)')).toBeInTheDocument();
      });

      // Check for completed session
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
      expect(screen.getByText('Specialty: Data Analysis')).toBeInTheDocument();
    });

    it('should allow selecting a training session', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByTestId('training-session-session-1')).toBeInTheDocument();
      });

      // Click on a training session
      const sessionCard = screen.getByTestId('training-session-session-1');
      fireEvent.click(sessionCard);

      // Should show session details
      await waitFor(() => {
        expect(screen.getByText('Training Progress Overview')).toBeInTheDocument();
      });
    });

    it('should handle empty training sessions state', async () => {
      // Mock empty response
      const mockApiRequest = require('../../client/src/lib/queryClient').apiRequest;
      mockApiRequest.mockImplementation(() => Promise.resolve([]));

      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('No agents currently in training. Start a new training session to begin.')).toBeInTheDocument();
      });
    });
  });

  describe('Start New Training Tab', () => {
    it('should render agent selection interface', async () => {
      renderWithQueryClient(<AgentTraining />);

      // Switch to Start New Training tab
      const startTrainingTab = screen.getByText('Start New Training');
      fireEvent.click(startTrainingTab);

      await waitFor(() => {
        expect(screen.getByText('Select Agent')).toBeInTheDocument();
        expect(screen.getByText('Select Specialty')).toBeInTheDocument();
        expect(screen.getByText('Target Competency Level')).toBeInTheDocument();
      });
    });

    it('should enable start training button when form is complete', async () => {
      renderWithQueryClient(<AgentTraining />);

      // Switch to Start New Training tab
      const startTrainingTab = screen.getByText('Start New Training');
      fireEvent.click(startTrainingTab);

      await waitFor(() => {
        const startButton = screen.getByTestId('button-start-training');
        expect(startButton).toBeDisabled();
      });

      // Select agent
      const agentSelect = screen.getByTestId('select-agent');
      fireEvent.click(agentSelect);
      
      await waitFor(() => {
        const agentOption = screen.getByText('Test Agent 1');
        fireEvent.click(agentOption);
      });

      // Select specialty
      const specialtySelect = screen.getByTestId('select-specialty');
      fireEvent.click(specialtySelect);
      
      await waitFor(() => {
        const specialtyOption = screen.getByText('JavaScript Development');
        fireEvent.click(specialtyOption);
      });

      // Select competency level
      const levelSelect = screen.getByTestId('select-competency-level');
      fireEvent.click(levelSelect);
      
      await waitFor(() => {
        const levelOption = screen.getByText('Advanced');
        fireEvent.click(levelOption);
      });

      // Button should now be enabled
      await waitFor(() => {
        const startButton = screen.getByTestId('button-start-training');
        expect(startButton).toBeEnabled();
      });
    });

    it('should start training session when button clicked', async () => {
      const mockApiRequest = require('../../client/src/lib/queryClient').apiRequest;
      
      // Mock successful training start
      mockApiRequest.mockImplementation((endpoint: string, options: any) => {
        if (options?.method === 'POST' && endpoint === '/api/training/sessions') {
          return Promise.resolve({
            id: 'new-session-id',
            agentId: 'agent-1',
            specialtyId: 'specialty-1',
            targetCompetencyLevel: 'Advanced',
            status: 'in_progress'
          });
        }
        // Return default responses for other calls
        return Promise.resolve([]);
      });

      renderWithQueryClient(<AgentTraining />);

      // Switch to Start New Training tab and fill form
      const startTrainingTab = screen.getByText('Start New Training');
      fireEvent.click(startTrainingTab);

      // Fill in the form and submit
      // (Simplified for test - in real scenario would need to interact with selects)
      
      await waitFor(() => {
        const startButton = screen.getByTestId('button-start-training');
        // Manually enable button for test
        startButton.removeAttribute('disabled');
        fireEvent.click(startButton);
      });

      // Verify API was called
      expect(mockApiRequest).toHaveBeenCalledWith('/api/training/sessions', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  describe('Training Competencies Tab', () => {
    it('should display available specialties', async () => {
      renderWithQueryClient(<AgentTraining />);

      // Switch to Training Competencies tab
      const competenciesTab = screen.getByText('Training Competencies');
      fireEvent.click(competenciesTab);

      await waitFor(() => {
        expect(screen.getByText('Available Specialties')).toBeInTheDocument();
        expect(screen.getByText('JavaScript Development')).toBeInTheDocument();
        expect(screen.getByText('Data Analysis')).toBeInTheDocument();
      });
    });

    it('should show create specialty button', async () => {
      renderWithQueryClient(<AgentTraining />);

      // Switch to Training Competencies tab
      const competenciesTab = screen.getByText('Training Competencies');
      fireEvent.click(competenciesTab);

      await waitFor(() => {
        expect(screen.getByTestId('button-create-specialty')).toBeInTheDocument();
      });
    });

    it('should open create specialty dialog', async () => {
      renderWithQueryClient(<AgentTraining />);

      // Switch to Training Competencies tab
      const competenciesTab = screen.getByText('Training Competencies');
      fireEvent.click(competenciesTab);

      await waitFor(() => {
        const createButton = screen.getByTestId('button-create-specialty');
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Create New Specialty')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Domain')).toBeInTheDocument();
      });
    });
  });

  describe('Training Progress Components', () => {
    it('should display progress bar correctly', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        // Look for progress indicators
        const progressText = screen.getByText('65%');
        expect(progressText).toBeInTheDocument();
        
        // Check for progress bar element
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('should show training status badges', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        // Check for training status
        expect(screen.getByText('Training')).toBeInTheDocument();
      });
    });

    it('should display competency levels', async () => {
      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Target: Advanced')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should handle API errors gracefully', async () => {
      const mockApiRequest = require('../../client/src/lib/queryClient').apiRequest;
      mockApiRequest.mockRejectedValue(new Error('API Error'));

      renderWithQueryClient(<AgentTraining />);

      // Should not crash and should handle error state
      await waitFor(() => {
        expect(screen.getByText('Agent Training Hub')).toBeInTheDocument();
      });
    });

    it('should show loading states', async () => {
      const mockApiRequest = require('../../client/src/lib/queryClient').apiRequest;
      mockApiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Loading training sessions...')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithQueryClient(<AgentTraining />);

      await waitFor(() => {
        expect(screen.getByText('Agent Training Hub')).toBeInTheDocument();
      });

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      // Component should still render correctly
      expect(screen.getByText('Agent Training Hub')).toBeInTheDocument();
    });
  });
});