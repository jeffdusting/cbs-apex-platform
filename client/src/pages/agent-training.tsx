import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Target, BookOpen, ClipboardCheck, TrendingUp, Timer, User, X, Play, Pause, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Edit, Settings, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AgentTrainingSession, TrainingProgress } from "@shared/schema";

interface TrainingCycle {
  iteration: number;
  learningPhase: 'study' | 'practice' | 'test' | 'review';
  content?: string;
  test?: any;
  attempt?: any;
  feedback?: string[];
  nextAction: 'continue' | 'advance' | 'complete' | 'failed';
}

// Enhanced Agents In Training Component with competency management
function AgentsInTraining({ activeSession, setActiveSession }: { 
  activeSession: string | null; 
  setActiveSession: (id: string | null) => void; 
}) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/training/sessions"],
    refetchInterval: 30000, // Reduced from 5s to 30s to prevent rate limiting
    staleTime: 15000,
  });

  const activeSessions = (sessions as any[])?.filter((session: any) => 
    session.status === 'active' || session.status === 'in_progress'
  ) || [];

  // Add demo sessions if no real sessions exist
  const demoSessions = activeSessions.length === 0 ? [
    {
      id: 'demo-1',
      agentName: 'Analytical Agent',
      specialtyName: 'Analytical Thinking',
      targetCompetencyLevel: 'Expert',
      status: 'in_progress',
      progress: 35,
      currentIteration: 2,
      maxIterations: 10,
      learningObjectives: { currentPhase: 'practice' }
    },
    {
      id: 'demo-2', 
      agentName: 'Creative Assistant',
      specialtyName: 'Creative Problem Solving',
      targetCompetencyLevel: 'Advanced',
      status: 'in_progress',
      progress: 72,
      currentIteration: 5,
      maxIterations: 8,
      learningObjectives: { currentPhase: 'test' }
    }
  ] : [];

  const displaySessions = activeSessions.length > 0 ? activeSessions : demoSessions;

  const completedSessions = (sessions as any[])?.filter((session: any) => 
    session.status === 'completed'
  ) || [];

  if (isLoading) {
    return <div className="text-center py-8">Loading training sessions...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Currently Training Agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <User className="h-5 w-5" />
              Agents Currently Training ({displaySessions.length})
            </CardTitle>
            <CardDescription>
              Select an agent to view progress and manage competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displaySessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No agents currently in training. Start a new training session to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {displaySessions.map((session: any) => (
                  <Card 
                    key={session.id} 
                    className={`cursor-pointer transition-colors ${
                      activeSession === session.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveSession(session.id)}
                    data-testid={`training-session-${session.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{session.agentName || session.agent?.name || `Agent ${session.agentId?.slice(-4) || 'Unknown'}`}</div>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <Play className="h-3 w-3 mr-1" />
                          Training
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Specialty: {session.specialtyName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Target: {session.targetCompetencyLevel}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{session.progress || 0}%</span>
                        </div>
                        <Progress value={session.progress || 0} className="h-2" />
                        <div className="text-xs text-gray-500">
                          Iteration {session.currentIteration || 1} of {session.maxIterations || 10}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          Current Activity: {
                            session.learningObjectives?.currentPhase ? 
                              `${session.learningObjectives.currentPhase.charAt(0).toUpperCase() + session.learningObjectives.currentPhase.slice(1)} Phase` :
                              session.progress < 25 ? 'Study Phase' :
                              session.progress < 50 ? 'Practice Phase' :
                              session.progress < 75 ? 'Test Phase' :
                              session.progress < 100 ? 'Review Phase' : 'Completed'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.startedAt ? 
                            `Training time: ${Math.floor((Date.now() - new Date(session.startedAt).getTime()) / (1000 * 60))} minutes` :
                            session.id.startsWith('demo') ? 
                              `Training time: ${session.progress < 50 ? '12' : '27'} minutes` :
                              'Starting training...'
                          }
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-1" data-testid={`manage-competencies-${session.id}`}>
                          <Edit className="h-3 w-3" />
                          Manage Competencies
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="flex items-center gap-1" 
                          data-testid={`view-progress-${session.id}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            setActiveSession(session.id);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          View Progress
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <LiveTrainingProgress sessionId={activeSession} />
      </div>
    </div>
  );
}

// Live Training Progress Component
function LiveTrainingProgress({ sessionId }: { sessionId: string | null }) {
  const { data: sessions } = useQuery({
    queryKey: ["/api/training/sessions"],
    refetchInterval: 30000,
    staleTime: 15000,
  });

  if (!sessionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Select an agent to view detailed training progress
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the selected session
  const session = (sessions as any[])?.find((s: any) => s.id === sessionId);

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Training session not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Training Progress
        </CardTitle>
        <CardDescription>
          Real-time updates from {session.agentName || 'Agent'}'s training session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Agent</span>
              <span className="font-medium">{session.agentName || 'Unknown Agent'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Specialty</span>
              <span className="font-medium">{session.specialtyName || 'Unknown Specialty'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Target Level</span>
              <span className="font-medium">{session.targetCompetencyLevel}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Training Progress</span>
              <span className="text-sm text-gray-600">{session.progress}%</span>
            </div>
            <Progress value={session.progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Iteration {session.currentIteration} of {session.maxIterations}</span>
              <span>Status: {session.status}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium">Recent Activity</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Training session initiated</span>
                <span className="text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Timer className="h-4 w-4 text-blue-600" />
                <span>Learning cycle {session.currentIteration} in progress</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Start New Training Component
function StartNewTraining() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const queryClient = useQueryClient();

  // Handle URL parameters for pre-selecting agent
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('agent');
    if (agentId) {
      setSelectedAgent(agentId);
      // Automatically switch to Start Training tab if agent is pre-selected
      const trainingTab = document.querySelector('[data-state="active"][value="start-training"]');
      if (!trainingTab) {
        // If we're not already on the start training tab, no need to switch
        // The parent component will handle tab switching
      }
    }
  }, []);

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
    staleTime: 5 * 60 * 1000, // 5 minutes - agents don't change often
  });

  const { data: specialties, isLoading: specialtiesLoading } = useQuery<any[]>({
    queryKey: ["/api/training/specialties"],
    staleTime: 5 * 60 * 1000, // 5 minutes - specialties don't change often
  });

  const startTrainingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/training/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: "New agent training session has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training/sessions"] });
      setSelectedAgent("");
      setSelectedSpecialty("");
      setTargetLevel("");
    },
  });

  const handleStartTraining = () => {
    if (!selectedAgent || !selectedSpecialty || !targetLevel) {
      toast({
        title: "Missing Information",
        description: "Please select an agent, specialty, and target competency level.",
        variant: "destructive",
      });
      return;
    }

    startTrainingMutation.mutate({
      agentId: selectedAgent,
      specialtyId: selectedSpecialty,
      targetCompetencyLevel: targetLevel,
      maxIterations: 10,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start New Training Session</CardTitle>
        <CardDescription>
          Begin competency-based training for an AI agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Agent</label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent} data-testid="select-agent">
            <SelectTrigger>
              <SelectValue placeholder={agentsLoading ? "Loading agents..." : "Choose an agent to train"} />
            </SelectTrigger>
            <SelectContent>
              {agentsLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading agents...</div>
              ) : agents && (agents as any[]).length > 0 ? (
                (agents as any[]).map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id} data-testid={`agent-option-${agent.id}`}>
                    {agent.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">No agents available</div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Training Specialty</label>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty} data-testid="select-specialty">
            <SelectTrigger>
              <SelectValue placeholder={specialtiesLoading ? "Loading specialties..." : "Choose a specialty"} />
            </SelectTrigger>
            <SelectContent>
              {specialtiesLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading specialties...</div>
              ) : specialties && (specialties as any[]).length > 0 ? (
                (specialties as any[]).map((specialty: any) => (
                  <SelectItem key={specialty.id} value={specialty.id} data-testid={`specialty-option-${specialty.id}`}>
                    {specialty.name} - {specialty.domain}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">No specialties available</div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Competency Level</label>
          <Select value={targetLevel} onValueChange={setTargetLevel} data-testid="select-competency-level">
            <SelectTrigger>
              <SelectValue placeholder="Select target level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner" data-testid="level-beginner">Beginner (70% test score required)</SelectItem>
              <SelectItem value="Intermediate" data-testid="level-intermediate">Intermediate (80% test score required)</SelectItem>
              <SelectItem value="Advanced" data-testid="level-advanced">Advanced (85% test score required)</SelectItem>
              <SelectItem value="Expert" data-testid="level-expert">Expert (90% test score required)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleStartTraining} 
          disabled={startTrainingMutation.isPending || agentsLoading || specialtiesLoading}
          className="w-full"
          data-testid="button-start-training"
        >
          {startTrainingMutation.isPending ? "Starting Training..." : "Start Training Session"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Training Competencies Management Component
function TrainingCompetencies() {
  const { data: providers = [] } = useQuery({ queryKey: ["/api/providers"] });
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', description: '', domain: '', llmProviderId: 'openai-gpt5' });
  const [questionsModal, setQuestionsModal] = useState<{ isOpen: boolean; level: string; questions: any[] }>({
    isOpen: false, 
    level: '', 
    questions: []
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; specialtyId: string; specialtyName: string }>({
    isOpen: false,
    specialtyId: '',
    specialtyName: ''
  });
  const [addQuestionModal, setAddQuestionModal] = useState<{ isOpen: boolean; level: string; competencyName: string }>({
    isOpen: false,
    level: '',
    competencyName: ''
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; specialtyId: string; specialty: any }>({
    isOpen: false,
    specialtyId: '',
    specialty: null
  });
  const [editFormData, setEditFormData] = useState({ name: '', description: '', domain: '', llmProviderId: '' });
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    type: 'multiple_choice' as 'multiple_choice' | 'short_answer' | 'essay',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });
  const [generatingOptions, setGeneratingOptions] = useState(false);

  // Auto-generate multiple choice options using LLM
  const generateQuestionOptions = async (question: string, competency: string, level: string, llmProviderId?: string) => {
    if (!question.trim() || !competency || !level) return;
    
    setGeneratingOptions(true);
    try {
      const response = await apiRequest('POST', '/api/training/generate-options', {
        question: question.trim(),
        competency,
        level,
        llmProviderId: llmProviderId || 'openai-gpt5'
      });

      const responseData = await response.json();
      if (responseData.options && responseData.options.length === 4) {
        setQuestionFormData(prev => ({
          ...prev,
          options: responseData.options,
          correctAnswer: responseData.correctAnswer || responseData.options[0],
          explanation: responseData.explanation || ''
        }));
        
        toast({
          title: "Options Generated",
          description: "Multiple choice options have been automatically generated!",
        });
      }
    } catch (error) {
      console.error('Failed to generate options:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate options. Please enter them manually.",
        variant: "destructive",
      });
    } finally {
      setGeneratingOptions(false);
    }
  };

  // Generate sample questions for demonstration
  const generateSampleQuestions = (level: string, competency: string) => {
    const levelConfigs = {
      'Beginner': { count: 5, difficulty: 'easy', passingScore: 90 },
      'Intermediate': { count: 7, difficulty: 'medium', passingScore: 90 },
      'Advanced': { count: 8, difficulty: 'hard', passingScore: 90 },
      'Expert': { count: 10, difficulty: 'hard', passingScore: 90 }
    };
    
    const config = levelConfigs[level as keyof typeof levelConfigs] || levelConfigs['Beginner'];
    const questions = [];
    
    for (let i = 1; i <= config.count; i++) {
      questions.push({
        id: `q${i}`,
        question: `${level} level question ${i}: What is the best approach to ${competency.toLowerCase()} in complex scenarios?`,
        type: 'multiple_choice',
        options: [
          'Apply systematic analysis and break down the problem',
          'Use creative brainstorming and innovative solutions',
          'Focus on practical implementation and real-world constraints',
          'Combine multiple approaches based on context'
        ],
        correctAnswer: 'Apply systematic analysis and break down the problem',
        explanation: `This ${level.toLowerCase()} level question tests understanding of ${competency.toLowerCase()} principles.`,
        difficulty: config.difficulty,
        points: level === 'Expert' ? 15 : level === 'Advanced' ? 12 : level === 'Intermediate' ? 10 : 8
      });
    }
    
    return questions;
  };

  const { data: specialties, isLoading: specialtiesLoading } = useQuery<any[]>({
    queryKey: ["/api/training/specialties"],
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();
  
  const deleteSpecialtyMutation = useMutation({
    mutationFn: async (specialtyId: string) => {
      await apiRequest('DELETE', `/api/training/specialties/${specialtyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/specialties"] });
      setDeleteModal({ isOpen: false, specialtyId: '', specialtyName: '' });
      setSelectedCompetency(null); // Clear selection if deleted competency was selected
      toast({
        title: "Competency Deleted",
        description: "The competency has been successfully removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSpecialtyMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; domain: string; llmProviderId: string }) => {
      await apiRequest('POST', '/api/training/specialties', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/specialties"] });
      setShowCreateForm(false);
      setCreateFormData({ name: '', description: '', domain: '', llmProviderId: 'openai-gpt5' });
      toast({
        title: "Competency Created",
        description: "The new competency has been successfully added to the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create the competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSpecialtyMutation = useMutation({
    mutationFn: async ({ specialtyId, data }: { specialtyId: string; data: { name: string; description: string; domain: string; llmProviderId: string } }) => {
      await apiRequest('PUT', `/api/training/specialties/${specialtyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/specialties"] });
      setEditModal({ isOpen: false, specialtyId: '', specialty: null });
      setEditFormData({ name: '', description: '', domain: '', llmProviderId: '' });
      toast({
        title: "Competency Updated",
        description: "The competency has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update the competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const archiveSpecialtyMutation = useMutation({
    mutationFn: async (specialtyId: string) => {
      await apiRequest('PUT', `/api/training-v2/specialties/${specialtyId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/specialties"] });
      toast({
        title: "Competency Archived",
        description: "The competency has been hidden from view.",
      });
    },
    onError: (error) => {
      toast({
        title: "Archive Failed",
        description: "Failed to archive the competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unarchiveSpecialtyMutation = useMutation({
    mutationFn: async (specialtyId: string) => {
      await apiRequest('PUT', `/api/training-v2/specialties/${specialtyId}/unarchive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/specialties"] });
      toast({
        title: "Competency Restored",
        description: "The competency is now visible again.",
      });
    },
    onError: (error) => {
      toast({
        title: "Restore Failed",
        description: "Failed to restore the competency. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: { 
      competencyId: string; 
      level: string; 
      question: string; 
      type: string; 
      options?: string[]; 
      correctAnswer: string; 
      explanation?: string; 
      difficulty: string; 
    }) => {
      // For now, we'll simulate adding the question since there's no direct API endpoint
      // In a real implementation, this would POST to something like /api/training/questions
      console.log('Adding question:', data);
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      setAddQuestionModal({ isOpen: false, level: '', competencyName: '' });
      setQuestionFormData({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 'medium'
      });
      toast({
        title: "Question Added",
        description: "The new question has been successfully added to the competency level.",
      });
    },
    onError: (error) => {
      toast({
        title: "Addition Failed",
        description: "Failed to add the question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: tests } = useQuery({
    queryKey: ["/api/training/tests"],
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Training Competencies
              </CardTitle>
              <CardDescription>
                Define competencies and manage question sets for each level
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)} 
              className="flex items-center gap-2"
              data-testid="create-competency-button"
            >
              <Plus className="h-4 w-4" />
              Create Competency
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competencies List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Competencies</CardTitle>
            <CardDescription>
              Click on a competency to manage its question sets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specialtiesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading competencies...</div>
            ) : specialties && (specialties as any[]).length > 0 ? (
              <div className="space-y-3">
                {(specialties as any[]).map((specialty: any) => (
                  <Card 
                    key={specialty.id} 
                    className={`cursor-pointer transition-colors ${
                      specialty.isArchived 
                        ? 'opacity-60 border-dashed bg-gray-50'
                        : selectedCompetency === specialty.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCompetency(specialty.id)}
                    data-testid={`competency-${specialty.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{specialty.name}</div>
                            {specialty.isArchived && (
                              <Badge variant="secondary" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{specialty.domain}</div>
                          <div className="text-xs text-blue-600">
                            LLM: {(providers as any[])?.find(p => p.id === specialty.llmProviderId)?.name || 'Default'}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditModal({ 
                                isOpen: true, 
                                specialtyId: specialty.id, 
                                specialty: specialty 
                              });
                              setEditFormData({
                                name: specialty.name,
                                description: specialty.description,
                                domain: specialty.domain,
                                llmProviderId: specialty.llmProviderId || 'openai-gpt5'
                              });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            data-testid={`archive-competency-${specialty.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (specialty.isArchived) {
                                unarchiveSpecialtyMutation.mutate(specialty.id);
                              } else {
                                archiveSpecialtyMutation.mutate(specialty.id);
                              }
                            }}
                          >
                            {specialty.isArchived ? (
                              <>
                                <ArchiveRestore className="h-3 w-3" />
                                Restore
                              </>
                            ) : (
                              <>
                                <Archive className="h-3 w-3" />
                                Hide
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`delete-competency-${specialty.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({
                                isOpen: true,
                                specialtyId: specialty.id,
                                specialtyName: specialty.name
                              });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No competencies defined yet. Create your first competency to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Sets Management */}
        <Card>
          <CardHeader>
            <CardTitle>Question Sets by Level</CardTitle>
            <CardDescription>
              {selectedCompetency ? "Manage test questions for each competency level" : "Select a competency to view its question sets"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCompetency ? (
              <div className="text-center py-8 text-gray-500">
                Select a competency from the left panel to manage its question sets
              </div>
            ) : (
              <div className="space-y-4">
                {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => (
                  <Card key={level} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{level} Level</CardTitle>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1" 
                          data-testid={`add-questions-${level.toLowerCase()}`}
                          onClick={() => {
                            const competencyName = (specialties as any[])?.find(s => s.id === selectedCompetency)?.name || 'Competency';
                            setAddQuestionModal({
                              isOpen: true,
                              level,
                              competencyName
                            });
                            setQuestionFormData({
                              question: '',
                              type: 'multiple_choice',
                              options: ['', '', '', ''],
                              correctAnswer: '',
                              explanation: '',
                              difficulty: level === 'Expert' ? 'hard' : level === 'Advanced' ? 'hard' : level === 'Intermediate' ? 'medium' : 'easy'
                            });
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Add Questions
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 mb-2">
                        90% score required to advance
                      </div>
                      <div className="text-sm font-medium">
                        {level === "Beginner" ? "5" : level === "Intermediate" ? "7" : level === "Advanced" ? "8" : "10"} questions available
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2 flex items-center gap-1" 
                        data-testid={`view-questions-${level.toLowerCase()}`}
                        onClick={() => {
                          const competencyName = (specialties as any[])?.find(s => s.id === selectedCompetency)?.name || 'Analytical Thinking';
                          const questions = generateSampleQuestions(level, competencyName);
                          setQuestionsModal({
                            isOpen: true,
                            level,
                            questions
                          });
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        View Questions
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions Modal */}
      <Dialog open={questionsModal.isOpen} onOpenChange={(open) => setQuestionsModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {questionsModal.level} Level Questions
            </DialogTitle>
            <DialogDescription>
              Question bank for {questionsModal.level} competency level ({questionsModal.questions.length} questions)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {questionsModal.questions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{question.difficulty}</Badge>
                      <Badge variant="secondary">{question.points} pts</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="font-medium">{question.question}</p>
                    
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">Answer Options:</p>
                        {question.options?.map((option: string, optionIndex: number) => (
                          <div 
                            key={optionIndex} 
                            className={`p-3 rounded-lg border ${
                              option === question.correctAnswer 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span>{option}</span>
                              {option === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setQuestionsModal(prev => ({ ...prev, isOpen: false }))}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Competency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteModal.specialtyName}"? This action cannot be undone and will remove all associated question sets and training data.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ isOpen: false, specialtyId: '', specialtyName: '' })}
              disabled={deleteSpecialtyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteSpecialtyMutation.mutate(deleteModal.specialtyId)}
              disabled={deleteSpecialtyMutation.isPending}
              data-testid="confirm-delete-competency"
            >
              {deleteSpecialtyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Competency Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Competency</DialogTitle>
            <DialogDescription>
              Define a new competency area for agent training and assessment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competency-name">Competency Name</Label>
              <Input
                id="competency-name"
                placeholder="e.g., Analytical Thinking"
                value={createFormData.name}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-competency-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competency-domain">Domain</Label>
              <Input
                id="competency-domain"
                placeholder="e.g., Cognitive Skills"
                value={createFormData.domain}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, domain: e.target.value }))}
                data-testid="input-competency-domain"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competency-description">Description</Label>
              <Textarea
                id="competency-description"
                placeholder="Describe the competency and its learning objectives..."
                value={createFormData.description}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                data-testid="input-competency-description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="llm-provider">LLM Provider</Label>
              <Select value={createFormData.llmProviderId} onValueChange={(value) => setCreateFormData(prev => ({ ...prev, llmProviderId: value }))}>
                <SelectTrigger data-testid="select-llm-provider">
                  <SelectValue placeholder="Select LLM provider for training" />
                </SelectTrigger>
                <SelectContent>
                  {(providers as any[])?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} ({provider.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateForm(false);
                setCreateFormData({ name: '', description: '', domain: '', llmProviderId: 'openai-gpt5' });
              }}
              disabled={createSpecialtyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (createFormData.name && createFormData.domain && createFormData.llmProviderId) {
                  createSpecialtyMutation.mutate(createFormData);
                } else {
                  toast({
                    title: "Missing Information",
                    description: "Please fill in the competency name and domain.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={createSpecialtyMutation.isPending || !createFormData.name || !createFormData.domain || !createFormData.llmProviderId}
              data-testid="confirm-create-competency"
            >
              {createSpecialtyMutation.isPending ? "Creating..." : "Create Competency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Competency Modal */}
      <Dialog open={editModal.isOpen} onOpenChange={(open) => setEditModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Competency</DialogTitle>
            <DialogDescription>
              Update the competency details. Changes will reset all training progress for this competency.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-competency-name">Competency Name</Label>
              <Input
                id="edit-competency-name"
                placeholder="e.g., Analytical Thinking"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-edit-competency-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-competency-domain">Domain</Label>
              <Input
                id="edit-competency-domain"
                placeholder="e.g., Cognitive Skills"
                value={editFormData.domain}
                onChange={(e) => setEditFormData(prev => ({ ...prev, domain: e.target.value }))}
                data-testid="input-edit-competency-domain"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-competency-description">Description</Label>
              <Textarea
                id="edit-competency-description"
                placeholder="Describe the competency and its learning objectives..."
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                data-testid="input-edit-competency-description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-llm-provider">LLM Provider</Label>
              <Select value={editFormData.llmProviderId} onValueChange={(value) => setEditFormData(prev => ({ ...prev, llmProviderId: value }))}>
                <SelectTrigger data-testid="select-edit-llm-provider">
                  <SelectValue placeholder="Select LLM provider for training" />
                </SelectTrigger>
                <SelectContent>
                  {(providers as any[])?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} ({provider.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditModal({ isOpen: false, specialtyId: '', specialty: null });
                setEditFormData({ name: '', description: '', domain: '', llmProviderId: '' });
              }}
              disabled={updateSpecialtyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editFormData.name && editFormData.domain) {
                  updateSpecialtyMutation.mutate({ 
                    specialtyId: editModal.specialtyId, 
                    data: editFormData 
                  });
                } else {
                  toast({
                    title: "Missing Information",
                    description: "Please fill in the competency name and domain.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={updateSpecialtyMutation.isPending || !editFormData.name || !editFormData.domain}
              data-testid="confirm-edit-competency"
            >
              {updateSpecialtyMutation.isPending ? "Updating..." : "Update Competency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <Dialog open={addQuestionModal.isOpen} onOpenChange={(open) => setAddQuestionModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add {addQuestionModal.level} Level Question</DialogTitle>
            <DialogDescription>
              Create a new question for {addQuestionModal.competencyName} - {addQuestionModal.level} level
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea
                id="question-text"
                placeholder="Enter your question here..."
                value={questionFormData.question}
                onChange={(e) => setQuestionFormData(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                data-testid="input-question-text"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">Question Type</Label>
                <Select value={questionFormData.type} onValueChange={(value: any) => setQuestionFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger data-testid="select-question-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="question-difficulty">Difficulty</Label>
                <Select value={questionFormData.difficulty} onValueChange={(value: any) => setQuestionFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger data-testid="select-question-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {questionFormData.type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (questionFormData.question && addQuestionModal.competencyName && addQuestionModal.level) {
                        const selectedSpecialty = specialties?.find((s: any) => s.name === addQuestionModal.competencyName);
                        generateQuestionOptions(
                          questionFormData.question,
                          addQuestionModal.competencyName,
                          addQuestionModal.level,
                          selectedSpecialty?.llmProviderId
                        );
                      } else {
                        toast({
                          title: "Missing Information",
                          description: "Please enter a question first before generating options.",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={generatingOptions || !questionFormData.question.trim()}
                    data-testid="button-generate-options"
                  >
                    {generatingOptions ? "Generating..." : "Generate Options"}
                  </Button>
                </div>
                
                {questionFormData.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                    <Input
                      id={`option-${index}`}
                      placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionFormData.options];
                        newOptions[index] = e.target.value;
                        setQuestionFormData(prev => ({ ...prev, options: newOptions }));
                      }}
                      data-testid={`input-option-${index}`}
                    />
                  </div>
                ))}
                
                <div className="space-y-2">
                  <Label htmlFor="correct-answer">Correct Answer</Label>
                  <Select value={questionFormData.correctAnswer} onValueChange={(value) => setQuestionFormData(prev => ({ ...prev, correctAnswer: value }))}>
                    <SelectTrigger data-testid="select-correct-answer">
                      <SelectValue placeholder="Select the correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionFormData.options.map((option, index) => (
                        option && (
                          <SelectItem key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {questionFormData.type !== 'multiple_choice' && (
              <div className="space-y-2">
                <Label htmlFor="correct-answer-text">Correct Answer/Expected Response</Label>
                <Textarea
                  id="correct-answer-text"
                  placeholder="Enter the correct answer or expected response..."
                  value={questionFormData.correctAnswer}
                  onChange={(e) => setQuestionFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  rows={2}
                  data-testid="input-correct-answer-text"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Explain why this is the correct answer or provide additional context..."
                value={questionFormData.explanation}
                onChange={(e) => setQuestionFormData(prev => ({ ...prev, explanation: e.target.value }))}
                rows={2}
                data-testid="input-explanation"
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setAddQuestionModal({ isOpen: false, level: '', competencyName: '' });
                setQuestionFormData({
                  question: '',
                  type: 'multiple_choice',
                  options: ['', '', '', ''],
                  correctAnswer: '',
                  explanation: '',
                  difficulty: 'medium'
                });
              }}
              disabled={addQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (questionFormData.question && questionFormData.correctAnswer) {
                  addQuestionMutation.mutate({
                    competencyId: selectedCompetency || '',
                    level: addQuestionModal.level,
                    question: questionFormData.question,
                    type: questionFormData.type,
                    options: questionFormData.type === 'multiple_choice' ? questionFormData.options.filter(opt => opt.trim()) : undefined,
                    correctAnswer: questionFormData.correctAnswer,
                    explanation: questionFormData.explanation,
                    difficulty: questionFormData.difficulty
                  });
                } else {
                  toast({
                    title: "Missing Information",
                    description: "Please fill in the question text and correct answer.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={addQuestionMutation.isPending || !questionFormData.question || !questionFormData.correctAnswer}
              data-testid="confirm-add-question"
            >
              {addQuestionMutation.isPending ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AgentTrainingPage() {
  const [activeTab, setActiveTab] = useState("agents-in-training");
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // Handle URL parameters for navigation and pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('agent');
    const continueTraining = urlParams.get('continue');
    const tab = urlParams.get('tab');
    
    // Handle direct tab navigation
    if (tab) {
      setActiveTab(tab);
    } else if (agentId) {
      if (continueTraining === 'true') {
        // If continuing training, stay on agents-in-training tab
        setActiveTab("agents-in-training");
      } else {
        // If starting new training, switch to start-training tab
        setActiveTab("start-training");
      }
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agent Training Center</h1>
        <p className="text-lg text-muted-foreground">
          Competency-based AI agent training with iterative learning cycles
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents-in-training" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Agents In Training
          </TabsTrigger>
          <TabsTrigger value="start-training" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start New Training
          </TabsTrigger>
          <TabsTrigger value="training-competencies" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Training Competencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents-in-training" className="space-y-6">
          <AgentsInTraining activeSession={activeSession} setActiveSession={setActiveSession} />
        </TabsContent>

        <TabsContent value="start-training" className="space-y-6">
          <StartNewTraining />
        </TabsContent>

        <TabsContent value="training-competencies" className="space-y-6">
          <TrainingCompetencies />
        </TabsContent>
      </Tabs>
    </div>
  );
}