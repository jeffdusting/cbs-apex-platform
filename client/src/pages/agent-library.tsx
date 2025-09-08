import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Brain, BookOpen, Trophy, TrendingUp, Target, GraduationCap, Star, Clock, Play, Users } from "lucide-react";
import type { AgentLibrary } from "@shared/schema";

// HBDI Thinking Styles
const HBDI_THINKING_STYLES = {
  'Analytical': 'Logical, rational, fact-based, quantitative thinking. Focuses on numbers, data, financial aspects.',
  'Practical': 'Organized, sequential, planned, detailed thinking. Emphasizes process, implementation, and structure.',
  'Relational': 'Interpersonal, feeling-based, kinesthetic thinking. Values people, teamwork, and emotional aspects.',
  'Experimental': 'Holistic, intuitive, integrating, synthesizing thinking. Focuses on big picture and innovation.',
  'Strategic': 'Future-focused, conceptual, imaginative thinking. Emphasizes vision and possibilities.',
  'Expressive': 'Verbal, symbolic, artistic thinking. Values creativity and self-expression.',
  'Safekeeping': 'Conservative, traditional, risk-averse thinking. Focuses on stability and proven methods.',
  'Organizing': 'Administrative, procedural, controlled thinking. Emphasizes planning and systematic approaches.'
} as const;

type HBDIStyle = keyof typeof HBDI_THINKING_STYLES;

export default function AgentLibrary() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentLibrary | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(() => {
    const saved = localStorage.getItem('showArchivedAgents');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist show archived preference
  const handleShowArchivedChange = (checked: boolean) => {
    setShowArchived(checked);
    localStorage.setItem('showArchivedAgents', JSON.stringify(checked));
  };
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primaryPersonality: "" as HBDIStyle | "",
    secondaryPersonality: "" as HBDIStyle | "",
    isDevilsAdvocate: false,
    supplementalPrompt: "",
    preferredProviderId: ""
  });

  const { data: providers = [] } = useProviders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agentLibraries = [], isLoading } = useQuery<AgentLibrary[]>({
    queryKey: ["/api/agent-library", { includeArchived: showArchived }],
  });

  // Training-related queries
  const { data: specialties = [] } = useQuery({
    queryKey: ["/api/training/specialties"],
  });

  // Get training sessions for each agent
  const getAgentTrainingSessions = (agentId: string) => {
    return useQuery({
      queryKey: ["/api/training/agents", agentId, "sessions"],
      enabled: !!agentId,
      staleTime: 5 * 60 * 1000, // 5 minutes - prevent excessive calls
      refetchInterval: false, // Disable auto refetch to prevent rate limiting
    });
  };

  // Get agent expertise profile
  const getAgentExpertise = (agentId: string) => {
    return useQuery({
      queryKey: ["/api/memory/agents", agentId, "expertise"],
      enabled: !!agentId,
      staleTime: 5 * 60 * 1000, // 5 minutes - prevent excessive calls
      refetchInterval: false, // Disable auto refetch to prevent rate limiting
    });
  };

  const createAgent = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/agent-library', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-library"] });
      resetForm();
      toast({
        title: "Success",
        description: "Agent created successfully"
      });
    },
    onError: (error: Error) => {
      console.error('Agent creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive"
      });
    }
  });

  const updateAgent = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<typeof formData> }) => {
      return apiRequest('PATCH', `/api/agent-library/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-library"] });
      resetForm();
      toast({
        title: "Success",
        description: "Agent updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive"
      });
    }
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/agent-library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-library"] });
      toast({
        title: "Success",
        description: "Agent deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  });

  const archiveAgent = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      return apiRequest('PATCH', `/api/agent-library/${id}/archive`, { archived });
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-library"], exact: false });
      toast({
        title: "Success",
        description: `Agent ${archived ? 'archived' : 'unarchived'} successfully`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update agent archive status",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      primaryPersonality: "",
      secondaryPersonality: "",
      isDevilsAdvocate: false,
      supplementalPrompt: "",
      preferredProviderId: ""
    });
    setShowCreateForm(false);
    setEditingAgent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive"
      });
      return;
    }

    if (editingAgent) {
      updateAgent.mutate({ id: editingAgent.id, updates: formData });
    } else {
      createAgent.mutate(formData);
    }
  };

  const handleEdit = (agent: AgentLibrary) => {
    setFormData({
      name: agent.name,
      description: agent.description || "",
      primaryPersonality: agent.primaryPersonality as HBDIStyle || "",
      secondaryPersonality: agent.secondaryPersonality as HBDIStyle || "none",
      isDevilsAdvocate: agent.isDevilsAdvocate,
      supplementalPrompt: agent.supplementalPrompt || "",
      preferredProviderId: agent.preferredProviderId || ""
    });
    setEditingAgent(agent);
    setShowCreateForm(true);
  };

  const handleDelete = (agent: AgentLibrary) => {
    if (confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) {
      deleteAgent.mutate(agent.id);
    }
  };

  const [archiveDialogAgent, setArchiveDialogAgent] = useState<AgentLibrary | null>(null);

  const handleArchive = (agent: AgentLibrary) => {
    setArchiveDialogAgent(agent);
  };

  const confirmArchive = () => {
    if (!archiveDialogAgent) return;
    archiveAgent.mutate({ id: archiveDialogAgent.id, archived: !archiveDialogAgent.isArchived });
    setArchiveDialogAgent(null);
  };

  const getPersonalityColor = (personality: string | null) => {
    const colors: Record<string, string> = {
      'Analytical': 'bg-blue-100 text-blue-800',
      'Practical': 'bg-green-100 text-green-800',
      'Relational': 'bg-pink-100 text-pink-800',
      'Experimental': 'bg-purple-100 text-purple-800',
      'Strategic': 'bg-indigo-100 text-indigo-800',
      'Expressive': 'bg-yellow-100 text-yellow-800',
      'Safekeeping': 'bg-gray-100 text-gray-800',
      'Organizing': 'bg-orange-100 text-orange-800'
    };
    return personality ? colors[personality] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  };

  const getProviderName = (providerId: string | null) => {
    const provider = providers.find(p => p.id === providerId);
    return provider ? provider.name : 'No preferred provider';
  };

  const handleStartTraining = (agent: AgentLibrary) => {
    setSelectedAgentId(null); // Close dialog
    setLocation(`/agent-training?agent=${agent.id}&name=${encodeURIComponent(agent.name)}`);
  };

  const handleContinueTraining = (agent: AgentLibrary) => {
    setSelectedAgentId(null); // Close dialog
    setLocation(`/agent-training?agent=${agent.id}&name=${encodeURIComponent(agent.name)}&continue=true`);
  };

  const handleViewSessionProgress = (session: any) => {
    setSelectedAgentId(null); // Close dialog
    setLocation(`/agent-training?agent=${session.agentId}&session=${session.id}&view=progress`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-xl"></i>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Library</h1>
          <p className="text-muted-foreground mt-2">
            Manage reusable AI agent configurations with different thinking styles and behaviors
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-archived"
              checked={showArchived}
              onCheckedChange={(v) => handleShowArchivedChange(!!v)}
              data-testid="checkbox-show-archived"
            />
            <Label htmlFor="show-archived" className="text-sm">
              Show archived agents
            </Label>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            data-testid="button-create-agent"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Agent
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingAgent ? "Edit Agent" : "Create New Agent"}
            </CardTitle>
            <CardDescription>
              Configure an AI agent with specific thinking styles and behaviors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Agent name..."
                    required
                    data-testid="agent-name"
                  />
                </div>
                <div>
                  <Label htmlFor="preferred-provider">Preferred Provider (optional)</Label>
                  <Select
                    value={formData.preferredProviderId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferredProviderId: value }))}
                  >
                    <SelectTrigger data-testid="select-preferred-provider">
                      <SelectValue placeholder="Select preferred AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this agent's purpose and characteristics..."
                  rows={2}
                  data-testid="agent-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-personality">Primary Thinking Style *</Label>
                  <Select
                    value={formData.primaryPersonality}
                    onValueChange={(value: HBDIStyle) => setFormData(prev => ({ ...prev, primaryPersonality: value }))}
                  >
                    <SelectTrigger data-testid="hbdi-profile">
                      <SelectValue placeholder="Select primary thinking style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HBDI_THINKING_STYLES).map(([style, description]) => (
                        <SelectItem key={style} value={style}>
                          <div className="flex flex-col">
                            <span className="font-medium">{style}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[250px]">{description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secondary-personality">Secondary Thinking Style (optional)</Label>
                  <Select
                    value={formData.secondaryPersonality}
                    onValueChange={(value: HBDIStyle) => setFormData(prev => ({ ...prev, secondaryPersonality: value }))}
                  >
                    <SelectTrigger data-testid="select-secondary-personality">
                      <SelectValue placeholder="Select secondary thinking style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {Object.entries(HBDI_THINKING_STYLES)
                        .filter(([style]) => style !== formData.primaryPersonality)
                        .map(([style, description]) => (
                          <SelectItem key={style} value={style}>
                            <div className="flex flex-col">
                              <span className="font-medium">{style}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[250px]">{description}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="devils-advocate"
                  checked={formData.isDevilsAdvocate}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isDevilsAdvocate: checked }))}
                  data-testid="checkbox-devils-advocate"
                />
                <Label htmlFor="devils-advocate">Devil's Advocate Role</Label>
              </div>
              {formData.isDevilsAdvocate && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  This agent will automatically challenge assumptions and present counterarguments
                </div>
              )}

              <div>
                <Label htmlFor="supplemental-prompt">Supplemental Prompt (optional)</Label>
                <Textarea
                  id="supplemental-prompt"
                  value={formData.supplementalPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplementalPrompt: e.target.value }))}
                  placeholder="Additional instructions or perspective for this agent..."
                  rows={3}
                  data-testid="system-prompt"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={createAgent.isPending || updateAgent.isPending}
                  data-testid="save-agent"
                >
                  {createAgent.isPending || updateAgent.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {editingAgent ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingAgent ? "fa-save" : "fa-plus"} mr-2`}></i>
                      {editingAgent ? "Update Agent" : "Create Agent"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  data-testid="button-cancel-agent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(agentLibraries as AgentLibrary[]).map((agent: AgentLibrary) => {
          const AgentCard = ({ agent }: { agent: AgentLibrary }) => {
          const trainingData = getAgentTrainingSessions(agent.id);
          const expertiseData = getAgentExpertise(agent.id);
          const activeSessions = (trainingData.data as any[])?.filter((s: any) => s.status === "in_progress") || [];
          const completedSessions = (trainingData.data as any[])?.filter((s: any) => s.status === "completed") || [];

          return (
            <Card className={`hover:shadow-md transition-shadow ${agent.isArchived ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate flex items-center gap-2">
                      {agent.name}
                      {agent.isArchived && (
                        <Badge 
                          variant="outline" 
                          className="text-xs border-orange-500 text-orange-600"
                          data-testid={`text-archived-badge-${agent.id}`}
                        >
                          <i className="fas fa-archive mr-1"></i>
                          Archived
                        </Badge>
                      )}
                      {completedSessions.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          Trained
                        </Badge>
                      )}
                    </CardTitle>
                    {agent.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {agent.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {/* Training Dialog */}
                    <Dialog open={selectedAgentId === agent.id} onOpenChange={(open) => setSelectedAgentId(open ? agent.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          data-testid={`button-view-training-${agent.id}`}
                          disabled={agent.isArchived}
                          title={agent.isArchived ? 'Unarchive to train' : 'View training'}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Training Profile: {agent.name}</DialogTitle>
                          <DialogDescription>
                            View training progress, expertise, and start new training sessions
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
                            <TabsTrigger value="expertise">Expertise</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              
                              {/* Skills & Competencies Section */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Skills & Competencies
                                  </CardTitle>
                                  {/* Competency Level Legend */}
                                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
                                    <div className="flex items-center gap-1">
                                      <span>🔴</span>
                                      <span>Beginner</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span>🟡</span>
                                      <span>Intermediate</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span>🔵</span>
                                      <span>Advanced</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span>🟢</span>
                                      <span>Expert</span>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {completedSessions.length > 0 ? (
                                    <div className="space-y-3">
                                      {completedSessions.map((session: any, index: number) => {
                                        const getCompetencyIcon = (level: string) => {
                                          switch (level.toLowerCase()) {
                                            case 'beginner': return '🔴';
                                            case 'intermediate': return '🟡';
                                            case 'advanced': return '🔵';
                                            case 'expert': return '🟢';
                                            default: return '⚪';
                                          }
                                        };

                                        return (
                                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                              <span className="text-lg">
                                                {getCompetencyIcon(session.currentCompetencyLevel)}
                                              </span>
                                              <div>
                                                <div className="font-medium">{session.specialtyName || 'Unknown Specialty'}</div>
                                                <div className="text-sm text-muted-foreground">{session.currentCompetencyLevel} Level</div>
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="bg-white">
                                              {session.progress}% Complete
                                            </Badge>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>No completed training yet</p>
                                      <p className="text-sm">Start training to build skills</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Current Training Section */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Current Training
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {activeSessions.length > 0 ? (
                                    <div className="space-y-4">
                                      {activeSessions.map((session: any) => (
                                        <div key={session.id} className="p-3 border rounded-lg space-y-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="font-medium">{session.specialtyName || 'Unknown Specialty'}</div>
                                              <div className="text-sm text-muted-foreground">
                                                Target: {session.targetCompetencyLevel} Level
                                              </div>
                                            </div>
                                            <Badge variant="secondary">
                                              Iteration {session.currentIteration}/{session.maxIterations}
                                            </Badge>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                              <span>Progress</span>
                                              <span>{session.progress}%</span>
                                            </div>
                                            <Progress value={session.progress} className="h-2" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>No active training</p>
                                      <p className="text-sm">Start a new training session</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>

                            {/* Meetings History Section */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Meetings History
                                  <Badge variant="outline" className="ml-2">
                                    {agent.experience?.collaborationHistory?.length || 0} meetings
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {(agent.experience?.collaborationHistory?.length || 0) > 0 ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {agent.experience?.collaborationHistory?.length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Meetings</div>
                                      </div>
                                      <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                          {agent.experience?.meetingsParticipated || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Participated</div>
                                      </div>
                                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                          {Math.round((agent.experience?.collaborationHistory?.length || 0) / Math.max(1, new Date().getMonth() + 1))}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Avg/Month</div>
                                      </div>
                                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                          {agent.experience?.keyInsights?.length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Rating</div>
                                      </div>
                                    </div>
                                    
                                    <div className="border rounded-lg p-4">
                                      <h4 className="font-medium mb-3">Recent Meetings</h4>
                                      <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {(agent.experience?.collaborationHistory || [])
                                          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                          .slice(0, 10)
                                          .map((meeting: any, index: number) => (
                                            <div 
                                              key={index} 
                                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                              data-testid={`meeting-${index}`}
                                            >
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                  Meeting {meeting.meetingId || `#${index + 1}`}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  Role: {meeting.role || 'Participant'}
                                                </div>
                                              </div>
                                              <div className="text-xs text-muted-foreground ml-2">
                                                {new Date(meeting.timestamp).toLocaleDateString()}
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                      {agent.experience?.collaborationHistory?.length && agent.experience.collaborationHistory.length > 10 && (
                                        <div className="text-center mt-3 pt-3 border-t">
                                          <Button variant="ghost" size="sm" className="text-xs">
                                            View All {agent.experience.collaborationHistory.length} Meetings
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No meeting history</p>
                                    <p className="text-sm">Agent hasn't participated in any meetings yet</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartTraining(agent);
                                }}
                                data-testid={`button-start-training-${agent.id}`}
                                disabled={agent.isArchived}
                                title={agent.isArchived ? 'Unarchive to train' : 'Manage Training'}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Manage Training
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedAgentId(null);
                                  setLocation('/agent-training?tab=training-competencies');
                                }}
                                data-testid={`button-manage-competencies-${agent.id}`}
                                disabled={agent.isArchived}
                                title={agent.isArchived ? 'Unarchive to train' : 'Manage Competencies'}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Competencies
                              </Button>
                              {activeSessions.length > 0 && (
                                <Button 
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleContinueTraining(agent);
                                  }}
                                  data-testid={`button-continue-training-${agent.id}`}
                                  disabled={agent.isArchived}
                                  title={agent.isArchived ? 'Unarchive to train' : 'Continue Training'}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue Training
                                </Button>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="sessions" className="space-y-4">
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {(trainingData.data as any[])?.map((session: any) => (
                                  <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewSessionProgress(session)}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium">{session.specialtyName || 'Unknown Specialty'}</div>
                                        <Badge variant={
                                          session.status === "completed" ? "default" :
                                          session.status === "in_progress" ? "secondary" :
                                          "destructive"
                                        }>
                                          {session.status}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-2">
                                        Target: {session.targetCompetencyLevel} • Current: {session.currentCompetencyLevel} • Progress: {session.progress}%
                                      </div>
                                      <Progress value={session.progress} className="h-1" />
                                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                        <span>Iteration {session.currentIteration}/{session.maxIterations}</span>
                                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      {session.status === "in_progress" && (
                                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                          <div className="flex items-center gap-1 text-blue-700">
                                            <i className="fas fa-eye"></i>
                                            Click to view detailed progress and test results
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                )) || (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No training sessions yet. Start training to see progress here.
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="expertise" className="space-y-4">
                            {expertiseData.data ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <Card className="p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {(expertiseData.data as any)?.learningVelocity || 0}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Learning Velocity</div>
                                  </Card>
                                  <Card className="p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {(expertiseData.data as any)?.knowledgeRetention || 0}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Knowledge Retention</div>
                                  </Card>
                                  <Card className="p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {(expertiseData.data as any)?.adaptabilityScore || 0}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Adaptability</div>
                                  </Card>
                                  <Card className="p-4 text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                      {(expertiseData.data as any)?.specialties?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Specialties</div>
                                  </Card>
                                </div>

                                {(expertiseData.data as any)?.specialties && (expertiseData.data as any).specialties.length > 0 && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Specialty Areas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3">
                                        {((expertiseData.data as any)?.specialties || []).map((specialty: any, index: number) => (
                                          <div key={index} className="border rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                              <div className="font-medium">{specialty.name}</div>
                                              <Badge variant="outline">{specialty.competencyLevel}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span>Confidence</span>
                                                <span>{specialty.confidenceScore}%</span>
                                              </div>
                                              <Progress value={specialty.confidenceScore} className="h-1" />
                                              <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{specialty.knowledgeDepth} knowledge items</span>
                                                <span>{specialty.experienceCount} experiences</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                No expertise data available. Complete training sessions to build expertise profile.
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(agent)}
                      className="px-2"
                      data-testid={`button-edit-agent-${agent.id}`}
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(agent)}
                          className="px-2"
                          data-testid={`button-archive-agent-${agent.id}`}
                          aria-label={agent.isArchived ? 'Unarchive agent' : 'Archive agent'}
                        >
                          <i className={`fas ${agent.isArchived ? 'fa-unarchive' : 'fa-archive'} text-xs`}></i>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {agent.isArchived ? 'Unarchive agent' : 'Archive agent'}
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(agent)}
                      className="px-2 text-red-500 hover:text-red-700"
                      data-testid={`button-delete-agent-${agent.id}`}
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Training Status Badge */}
                {activeSessions.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Training in Progress ({activeSessions.length} session{activeSessions.length > 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Competencies Display */}
                {completedSessions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Competencies</div>
                      {/* Inline Competency Level Legend */}
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span title="Beginner">🔴</span>
                        <span title="Intermediate">🟡</span>
                        <span title="Advanced">🔵</span>
                        <span title="Expert">🟢</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {completedSessions.slice(0, 4).map((session: any, index: number) => {
                        const getCompetencyIcon = (level: string) => {
                          switch (level.toLowerCase()) {
                            case 'beginner':
                              return '🔴'; // Red circle for beginner
                            case 'intermediate':
                              return '🟡'; // Yellow circle for intermediate
                            case 'advanced':
                              return '🔵'; // Blue circle for advanced
                            case 'expert':
                              return '🟢'; // Green circle for expert
                            default:
                              return '⚪'; // White circle for unknown
                          }
                        };

                        return (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-sm">
                                {getCompetencyIcon(session.currentCompetencyLevel)}
                              </span>
                              <span className="font-medium truncate">
                                {session.specialtyName || 'Unknown Specialty'}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                              {session.currentCompetencyLevel}
                            </Badge>
                          </div>
                        );
                      })}
                      {completedSessions.length > 4 && (
                        <div className="text-center pt-1">
                          <Badge variant="outline" className="text-xs">
                            +{completedSessions.length - 4} more competencies
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Thinking Styles */}
                <div className="space-y-2">
                  {agent.primaryPersonality && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Primary:</span>
                      <Badge className={`text-xs ${getPersonalityColor(agent.primaryPersonality)}`}>
                        {agent.primaryPersonality}
                      </Badge>
                    </div>
                  )}
                  {agent.secondaryPersonality && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Secondary:</span>
                      <Badge className={`text-xs ${getPersonalityColor(agent.secondaryPersonality)}`}>
                        {agent.secondaryPersonality}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Special Features */}
                {agent.isDevilsAdvocate && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <i className="fas fa-exclamation-triangle text-xs"></i>
                    <span className="text-xs font-medium">Devil's Advocate</span>
                  </div>
                )}

                {/* Preferred Provider */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Provider:</span>
                  <span className="text-xs">{getProviderName(agent.preferredProviderId)}</span>
                </div>

                {/* Experience Information */}
                {agent.experience && agent.experience.meetingsParticipated > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Meeting Experience</div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-handshake text-green-600"></i>
                        <span>{agent.experience.meetingsParticipated} meetings</span>
                      </div>
                      {agent.experience.topicsExplored.length > 0 && (
                        <div className="flex items-center gap-1">
                          <i className="fas fa-lightbulb text-yellow-600"></i>
                          <span>{agent.experience.topicsExplored.length} topics</span>
                        </div>
                      )}
                    </div>
                    {agent.experience.keyInsights.length > 0 && (
                      <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 line-clamp-2">
                        <i className="fas fa-brain mr-1"></i>
                        Recent insight: {agent.experience.keyInsights[agent.experience.keyInsights.length - 1]}
                      </div>
                    )}
                  </div>
                )}

                {/* Supplemental Prompt Preview */}
                {agent.supplementalPrompt && (
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 line-clamp-3">
                    {agent.supplementalPrompt}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Created {new Date(agent.createdAt!).toLocaleDateString()}
                  {(agent.experience?.meetingsParticipated || 0) > 0 && (
                    <span className="ml-2 text-green-600">
                      • Experienced ({agent.experience?.meetingsParticipated || 0} meetings)
                    </span>
                  )}
                  {completedSessions.length > 0 && (
                    <span className="ml-2 text-blue-600">
                      • Trained ({completedSessions.length} specialties)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        };

          return <AgentCard key={agent.id} agent={agent} />;
        })}
      </div>

      {agentLibraries.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-robot text-4xl text-muted-foreground mb-4"></i>
          <h3 className="text-lg font-medium mb-2">No agents in library</h3>
          <p className="text-muted-foreground mb-4">
            Create your first AI agent configuration to get started
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <i className="fas fa-plus mr-2"></i>
            Create First Agent
          </Button>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!archiveDialogAgent} onOpenChange={(open) => !open && setArchiveDialogAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {archiveDialogAgent?.isArchived ? 'Unarchive' : 'Archive'} Agent
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {archiveDialogAgent?.isArchived ? 'unarchive' : 'archive'} "{archiveDialogAgent?.name}"?
              {!archiveDialogAgent?.isArchived && ' Archived agents are hidden by default but can be restored later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              {archiveDialogAgent?.isArchived ? 'Unarchive' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
}