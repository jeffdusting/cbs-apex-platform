import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { useFolders } from "@/hooks/useFolders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PromptSequence, SequenceStep } from "@shared/schema";
import { MeetingMoodBar, CompactMoodBar } from "@/components/MeetingMoodBar";

// HBDI Thinking Styles based on Herrmann Brain Dominance Instrument
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

// Personality-based prompt templates
const HBDI_PROMPT_TEMPLATES = {
  'Analytical': 'Approach this with logical, data-driven thinking. Focus on facts, numbers, and quantitative analysis. Ask "what" questions and seek concrete evidence. Prioritize accuracy, precision, and rational evaluation.',
  'Practical': 'Take a systematic, organized approach. Focus on step-by-step processes, implementation details, and practical execution. Ask "how" questions and emphasize structure, planning, and proven methods.',
  'Relational': 'Consider the human and interpersonal aspects. Focus on people impacts, team dynamics, and emotional considerations. Ask "who" questions and prioritize collaboration, communication, and stakeholder needs.',
  'Experimental': 'Think holistically and creatively. Focus on big-picture connections, innovative possibilities, and creative solutions. Ask "what if" questions and emphasize synthesis, intuition, and breakthrough thinking.',
  'Strategic': 'Focus on future possibilities and long-term vision. Consider strategic implications, trends, and conceptual frameworks. Ask "why" questions and emphasize forward-thinking, possibilities, and strategic positioning.',
  'Expressive': 'Bring creativity and communication focus. Emphasize storytelling, visual thinking, and expressive communication. Focus on how ideas can be communicated effectively and creatively presented.',
  'Safekeeping': 'Prioritize risk management and stability. Focus on potential problems, conservative approaches, and proven methods. Emphasize caution, quality control, and maintaining established standards.',
  'Organizing': 'Focus on systems, procedures, and administrative excellence. Emphasize detailed planning, resource management, and operational efficiency. Prioritize order, control, and systematic approaches.'
} as const;

// Function to generate personality-based prompt instructions
const generatePersonalityPrompt = (primary?: HBDIStyle, secondary?: HBDIStyle): string => {
  if (!primary) return '';
  
  let prompt = `THINKING STYLE: ${HBDI_PROMPT_TEMPLATES[primary]}`;
  
  if (secondary) {
    prompt += ` Additionally, incorporate ${secondary.toLowerCase()} thinking by: ${HBDI_PROMPT_TEMPLATES[secondary].toLowerCase()}`;
  }
  
  return prompt;
};

interface AgentStep {
  step: number;
  providerId: string;
  primaryPersonality?: HBDIStyle;
  secondaryPersonality?: HBDIStyle;
  isDevilsAdvocate?: boolean;
  supplementalPrompt?: string;
  sequence: number;
  // Agent library metadata
  name?: string;
  description?: string;
  libraryAgentId?: string;
  experience?: {
    meetingsParticipated: number;
    topicsExplored: string[];
    keyInsights: string[];
    collaborationHistory: Array<{
      meetingId: string;
      role: string;
      keyContributions: string[];
      timestamp: string;
    }>;
  };
}

export default function PromptSequencing() {
  const [meetingName, setMeetingName] = useState("Research Analysis Meeting");
  const [meetingDescription, setMeetingDescription] = useState("Multi-agent research analysis with diverse perspectives");
  const [meetingObjective, setMeetingObjective] = useState("Analyze the given topic from multiple perspectives and provide comprehensive insights");
  const [initialPrompt, setInitialPrompt] = useState("Please analyze the impact of artificial intelligence on modern education systems. Focus on both opportunities and challenges.");
  const [agentChain, setAgentChain] = useState<AgentStep[]>([]);
  const [iterations, setIterations] = useState(1);
  const [synthesisProviderId, setSynthesisProviderId] = useState("");
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  const { data: providers = [] } = useProviders();
  const { data: folders = [] } = useFolders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agentLibraries = [] } = useQuery<any[]>({
    queryKey: ["/api/agent-library"],
  });

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery<PromptSequence[]>({
    queryKey: ["/api/prompt-sequences"],
  });

  const { data: meetingSteps = [] } = useQuery<SequenceStep[]>({
    queryKey: ["/api/prompt-sequences", selectedMeeting, "steps"],
    enabled: !!selectedMeeting,
  });

  const createMeeting = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/prompt-sequences', data);
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-sequences"] });
      setMeetingName("Research Analysis Meeting");
      setMeetingDescription("Multi-agent research analysis with diverse perspectives");
      setMeetingObjective("Analyze the given topic from multiple perspectives and provide comprehensive insights");
      setInitialPrompt("Please analyze the impact of artificial intelligence on modern education systems. Focus on both opportunities and challenges.");
      setAgentChain([
        { step: 1, providerId: "openai-gpt5", primaryPersonality: "Analytical", secondaryPersonality: "Experimental", supplementalPrompt: "Analyze from a technical and innovation perspective", sequence: 1 },
        { step: 2, providerId: "anthropic-claude", primaryPersonality: "Relational", secondaryPersonality: "Strategic", supplementalPrompt: "Examine the ethical and societal implications", sequence: 2 },
        { step: 3, providerId: "google-gemini", primaryPersonality: "Practical", secondaryPersonality: "Organizing", supplementalPrompt: "Focus on practical implementation challenges", sequence: 3 }
      ]);
      setIterations(1);
      setSynthesisProviderId("");
      setSelectedFolders([]);
      // Set the active meeting for mood tracking
      if (result?.id) {
        setActiveMeetingId(result.id);
      }
      // Extract agent IDs from the agent chain
      const agentIds = agentChain.map((step, index) => `agent-${step.providerId}-${index}`);
      setSelectedAgentIds(agentIds);
      toast({
        title: "Success",
        description: "Meeting created and started successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create meeting",
        variant: "destructive"
      });
    }
  });

  const saveAgent = useMutation({
    mutationFn: async (data: { name: string; description: string; agent: AgentStep }) => {
      return apiRequest('POST', '/api/agent-library', {
        name: data.name,
        description: data.description,
        primaryPersonality: data.agent.primaryPersonality,
        secondaryPersonality: data.agent.secondaryPersonality,
        isDevilsAdvocate: data.agent.isDevilsAdvocate || false,
        supplementalPrompt: data.agent.supplementalPrompt,
        preferredProviderId: data.agent.providerId
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent saved to library successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to save agent to library",
        variant: "destructive"
      });
    }
  });

  const handleSaveAgent = async (agent: AgentStep, agentIndex: number) => {
    const agentName = prompt("Enter a name for this agent configuration:", 
      `${agent.primaryPersonality || "Agent"} ${agent.secondaryPersonality ? `+ ${agent.secondaryPersonality}` : ""} Configuration`);
    
    if (!agentName) return;

    const agentDescription = prompt("Enter a description for this agent (optional):", 
      `Agent with ${agent.primaryPersonality || "default"} thinking style${agent.secondaryPersonality ? ` and ${agent.secondaryPersonality} secondary style` : ""}${agent.isDevilsAdvocate ? ", configured as Devil's Advocate" : ""}`);

    saveAgent.mutate({
      name: agentName,
      description: agentDescription || "",
      agent
    });
  };

  const handleLoadAgent = (libraryAgent: any) => {
    if (agentChain.length >= 5) {
      toast({
        title: "Error",
        description: "Cannot add more than 5 agents to a meeting",
        variant: "destructive"
      });
      return;
    }

    const maxSequence = Math.max(...agentChain.map(a => a.sequence), 0);
    const newAgent: AgentStep = {
      step: agentChain.length + 1,
      providerId: libraryAgent.preferredProviderId || providers[0]?.id || "",
      primaryPersonality: libraryAgent.primaryPersonality as HBDIStyle,
      secondaryPersonality: libraryAgent.secondaryPersonality as HBDIStyle,
      isDevilsAdvocate: libraryAgent.isDevilsAdvocate,
      supplementalPrompt: libraryAgent.supplementalPrompt || "",
      sequence: maxSequence + 1,
      // Transfer all agent metadata from library
      name: libraryAgent.name,
      description: libraryAgent.description,
      libraryAgentId: libraryAgent.id,
      experience: libraryAgent.experience
    };
    setAgentChain([...agentChain, newAgent]);
    toast({
      title: "Success",
      description: `Agent "${libraryAgent.name}" loaded successfully`
    });
  };

  const addAgent = () => {
    if (agentChain.length < 5) {
      const maxSequence = Math.max(...agentChain.map(a => a.sequence), 0);
      const newAgent: AgentStep = {
        step: agentChain.length + 1,
        providerId: "",
        primaryPersonality: undefined,
        secondaryPersonality: undefined,
        isDevilsAdvocate: false,
        supplementalPrompt: "",
        sequence: maxSequence + 1,
        // Manual agents don't have library metadata
        name: undefined,
        description: undefined,
        libraryAgentId: undefined,
        experience: undefined
      };
      setAgentChain([...agentChain, newAgent]);
    }
  };

  const removeAgent = (stepIndex: number) => {
    if (agentChain.length > 1) {
      const updated = agentChain.filter((_, i) => i !== stepIndex);
      // Renumber both steps and sequences
      const renumbered = updated.map((agent, i) => ({ 
        ...agent, 
        step: i + 1,
        sequence: i + 1
      }));
      setAgentChain(renumbered);
    }
  };

  const updateAgent = (stepIndex: number, field: keyof AgentStep, value: string | number | HBDIStyle | boolean | undefined) => {
    const updated = [...agentChain];
    (updated[stepIndex] as any)[field] = value;
    
    // If sequence is updated, sort agents and renumber steps
    if (field === 'sequence') {
      const sorted = updated.sort((a, b) => a.sequence - b.sequence);
      const renumbered = sorted.map((agent, index) => ({ ...agent, step: index + 1 }));
      setAgentChain(renumbered);
    } else {
      setAgentChain(updated);
    }
  };

  const getSortedAgents = () => {
    return [...agentChain].sort((a, b) => a.sequence - b.sequence);
  };

  const moveStepUp = (stepIndex: number) => {
    const sortedAgents = getSortedAgents();
    const agentIndex = sortedAgents.findIndex(a => a.step === agentChain[stepIndex].step);
    if (agentIndex > 0) {
      const targetSequence = sortedAgents[agentIndex - 1].sequence;
      updateAgent(stepIndex, 'sequence', targetSequence - 0.5);
    }
  };

  const moveStepDown = (stepIndex: number) => {
    const sortedAgents = getSortedAgents();
    const agentIndex = sortedAgents.findIndex(a => a.step === agentChain[stepIndex].step);
    if (agentIndex < sortedAgents.length - 1) {
      const targetSequence = sortedAgents[agentIndex + 1].sequence;
      updateAgent(stepIndex, 'sequence', targetSequence + 0.5);
    }
  };

  const toggleDocument = (documentId: string) => {
    if (selectedFolders.includes(documentId)) {
      setSelectedFolders(selectedFolders.filter(id => id !== documentId));
    } else {
      setSelectedFolders([...selectedFolders, documentId]);
    }
  };

  const handleSubmit = () => {
    if (!meetingName.trim() || !meetingObjective.trim() || !initialPrompt.trim() || 
        agentChain.some(step => !step.providerId)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select providers for each agent",
        variant: "destructive"
      });
      return;
    }

    createMeeting.mutate({
      name: meetingName,
      description: meetingDescription,
      taskObjective: meetingObjective,
      initialPrompt,
      llmChain: agentChain.map((step, index) => ({
        step: index + 1,
        providerId: step.providerId,
        primaryPersonality: step.primaryPersonality,
        secondaryPersonality: step.secondaryPersonality,
        isDevilsAdvocate: step.isDevilsAdvocate,
        customInstructions: (() => {
          const personalityPrompt = generatePersonalityPrompt(step.primaryPersonality, step.secondaryPersonality);
          const devilsAdvocatePrompt = step.isDevilsAdvocate ? 
            'DEVIL\'S ADVOCATE ROLE: Your primary function is to challenge assumptions, identify potential flaws, and present counterarguments. Question the premises, point out overlooked risks, and argue for alternative perspectives. Be constructively critical and thorough in identifying weaknesses or problems with the proposed ideas.' : '';
          const supplementalPrompt = step.supplementalPrompt || '';
          
          return [personalityPrompt, devilsAdvocatePrompt, supplementalPrompt]
            .filter(prompt => prompt.trim())
            .join(' ');
        })()
      })),
      selectedFolders,
      iterations,
      synthesisProviderId
    });
  };

  const exportMeetingResults = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/prompt-sequences/${meetingId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-results-${meetingId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Meeting results exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export meeting results",
        variant: "destructive"
      });
    }
  };

  const downloadSynthesisReport = async (meetingId: string, format: 'html' | 'markdown' | 'json') => {
    try {
      const response = await fetch(`/api/prompt-sequences/${meetingId}/synthesis-report?format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extensions = { html: 'html', markdown: 'md', json: 'json' };
      a.download = `synthesis-report-${meetingId}.${extensions[format]}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `Synthesis report downloaded in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      console.error('Error downloading synthesis report:', error);
      toast({
        title: "Error",
        description: "Failed to download synthesis report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          <h2 className="text-lg font-semibold">AI Meeting Studio</h2>
          <p className="text-sm text-muted-foreground hidden sm:block">Orchestrate AI agents with diverse perspectives and expertise</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 lg:p-6">

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Create New Meeting */}
          <Card>
            <CardHeader>
              <CardTitle>Setup AI Meeting</CardTitle>
              <CardDescription>Configure AI agents with diverse perspectives to collaborate on your task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Real-time collaboration mood indicators */}
              {activeMeetingId && selectedAgentIds.length > 0 && (
                <MeetingMoodBar 
                  meetingId={activeMeetingId}
                  agentIds={selectedAgentIds}
                  layout="horizontal"
                  className="mb-4"
                  showConnectionStatus={true}
                />
              )}
              
              {/* Meeting Overview */}
              <div className="border-b border-border pb-4 space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Meeting Overview</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Name *</label>
                  <Input
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                    placeholder="Enter meeting name..."
                    data-testid="input-meeting-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Objective *</label>
                  <Textarea
                    value={meetingObjective}
                    onChange={(e) => setMeetingObjective(e.target.value)}
                    placeholder="Define the main goal for this AI collaboration..."
                    rows={3}
                    data-testid="textarea-meeting-objective"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Reference Document Folder</label>
                  <Select
                    value={selectedFolders[0] || "none"}
                    onValueChange={(value) => setSelectedFolders(value ? [value] : [])}
                  >
                    <SelectTrigger data-testid="select-reference-folder">
                      <SelectValue placeholder="Select reference documents folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <i className="fas fa-folder text-blue-600"></i>
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Initial Prompt *</label>
                  <Textarea
                    value={initialPrompt}
                    onChange={(e) => setInitialPrompt(e.target.value)}
                    placeholder="The discussion topic or question to start the meeting..."
                    rows={3}
                    data-testid="textarea-initial-prompt"
                  />
                </div>
              </div>

              {/* Meeting Participants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Meeting Participants ({agentChain.length}/5 Agents)</h3>
                  <div className="flex items-center gap-2">
                    {agentLibraries.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={agentChain.length >= 5}
                            data-testid="button-load-agent"
                          >
                            <i className="fas fa-download mr-1"></i>Load from Library
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                            Select Agent to Load
                          </div>
                          <div className="border-t border-border my-1"></div>
                          {agentLibraries.map((libraryAgent: any) => (
                            <DropdownMenuItem
                              key={libraryAgent.id}
                              onClick={() => handleLoadAgent(libraryAgent)}
                              className="flex flex-col items-start gap-1 py-2"
                              data-testid={`menu-item-load-agent-${libraryAgent.id}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <i className="fas fa-robot text-blue-600"></i>
                                  <span className="font-medium truncate">{libraryAgent.name}</span>
                                </div>
                                {libraryAgent.experience?.meetingsParticipated > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <i className="fas fa-star"></i>
                                    <span>{libraryAgent.experience.meetingsParticipated}</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-6 space-y-1">
                                {(libraryAgent.primaryPersonality || libraryAgent.secondaryPersonality) && (
                                  <div className="flex items-center gap-1 text-xs">
                                    {libraryAgent.primaryPersonality && (
                                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                        {libraryAgent.primaryPersonality}
                                      </span>
                                    )}
                                    {libraryAgent.secondaryPersonality && (
                                      <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                        {libraryAgent.secondaryPersonality}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {libraryAgent.experience?.topicsExplored?.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Topics: {libraryAgent.experience.topicsExplored.slice(0, 2).join(', ')}
                                    {libraryAgent.experience.topicsExplored.length > 2 && '...'}
                                  </div>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAgent}
                      disabled={agentChain.length >= 5}
                      data-testid="button-add-agent"
                    >
                      <i className="fas fa-user-plus mr-1"></i>Add Agent
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {getSortedAgents().map((agent, displayIndex) => {
                    const actualIndex = agentChain.findIndex(a => a.step === agent.step);
                    return (
                    <Card key={agent.step} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start gap-4">
                        {/* Agent Icon */}
                        <div className="flex flex-col items-center gap-2 min-w-0">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <i className="fas fa-robot text-blue-600 dark:text-blue-400 text-lg"></i>
                          </div>
                          <Badge variant="outline" className="text-xs">Agent {displayIndex + 1}</Badge>
                        </div>
                        
                        {/* Agent Details */}
                        <div className="flex-1 space-y-3">
                          {/* Agent Name and Metadata (if loaded from library) */}
                          {agent.name && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <i className="fas fa-bookmark text-blue-600 text-sm"></i>
                                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 truncate" data-testid={`agent-name-${actualIndex}`}>
                                      {agent.name}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2" data-testid={`agent-description-${actualIndex}`}>
                                    {agent.description || "No description provided"}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full" data-testid={`agent-meetings-${actualIndex}`}>
                                      <i className="fas fa-users mr-1"></i>
                                      {agent.experience?.meetingsParticipated || 0} meetings
                                    </span>
                                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full" data-testid={`agent-topics-${actualIndex}`}>
                                      <i className="fas fa-lightbulb mr-1"></i>
                                      {agent.experience?.topicsExplored?.length || 0} topics
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs ml-2" data-testid={`badge-from-library-${actualIndex}`}>From Library</Badge>
                              </div>
                            </div>
                          )}
                          
                          {/* Manual Agent Header (if not from library) */}
                          {!agent.name && (
                            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <i className="fas fa-cog text-gray-600 text-sm"></i>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300" data-testid={`agent-name-${actualIndex}`}>
                                    Manual Agent Configuration
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">Custom</Badge>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Label>Seq:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={agent.sequence}
                                  onChange={(e) => updateAgent(actualIndex, 'sequence', parseInt(e.target.value) || 1)}
                                  className="w-14 h-6 text-xs"
                                  data-testid={`input-sequence-${actualIndex}`}
                                />
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStepUp(actualIndex)}
                                  disabled={displayIndex === 0}
                                  className="px-1 h-7"
                                  data-testid={`button-move-up-${actualIndex}`}
                                >
                                  <i className="fas fa-chevron-up text-xs"></i>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStepDown(actualIndex)}
                                  disabled={displayIndex === getSortedAgents().length - 1}
                                  className="px-1 h-7"
                                  data-testid={`button-move-down-${actualIndex}`}
                                >
                                  <i className="fas fa-chevron-down text-xs"></i>
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveAgent(agent, actualIndex)}
                                className="px-2 text-green-600 hover:text-green-700"
                                title="Save agent configuration to library"
                                data-testid={`button-save-agent-${actualIndex}`}
                              >
                                <i className="fas fa-save text-xs"></i>
                              </Button>
                              {agentChain.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAgent(actualIndex)}
                                  className="px-2 text-red-500 hover:text-red-700"
                                  data-testid={`button-remove-agent-${actualIndex}`}
                                >
                                  <i className="fas fa-trash text-xs"></i>
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Primary Thinking Style</label>
                                <Select
                                  value={agent.primaryPersonality || "none"}
                                  onValueChange={(value: HBDIStyle) => updateAgent(actualIndex, 'primaryPersonality', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs" data-testid={`select-primary-personality-${actualIndex}`}>
                                    <SelectValue placeholder="Select primary style" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(HBDI_THINKING_STYLES).map(([style, description]) => (
                                      <SelectItem key={style} value={style}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{style}</span>
                                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{description}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Secondary Thinking Style</label>
                                <Select
                                  value={agent.secondaryPersonality || "none"}
                                  onValueChange={(value: HBDIStyle) => updateAgent(actualIndex, 'secondaryPersonality', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs" data-testid={`select-secondary-personality-${actualIndex}`}>
                                    <SelectValue placeholder="Select secondary style" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      <span className="text-muted-foreground">None (Optional)</span>
                                    </SelectItem>
                                    {Object.entries(HBDI_THINKING_STYLES)
                                      .filter(([style]) => style !== agent.primaryPersonality)
                                      .map(([style, description]) => (
                                        <SelectItem key={style} value={style}>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{style}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{description}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                  id={`devils-advocate-${actualIndex}`}
                                  checked={agent.isDevilsAdvocate || false}
                                  onCheckedChange={(checked: boolean) => updateAgent(actualIndex, 'isDevilsAdvocate', checked)}
                                  data-testid={`checkbox-devils-advocate-${actualIndex}`}
                                />
                                <Label 
                                  htmlFor={`devils-advocate-${actualIndex}`} 
                                  className="text-xs font-medium text-muted-foreground cursor-pointer"
                                >
                                  Devil's Advocate Role
                                </Label>
                              </div>
                              {agent.isDevilsAdvocate && (
                                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                  <i className="fas fa-exclamation-triangle mr-1"></i>
                                  This agent will automatically challenge assumptions and present counterarguments
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">LLM Selection</label>
                              <Select
                                value={agent.providerId}
                                onValueChange={(value) => updateAgent(actualIndex, 'providerId', value)}
                              >
                                <SelectTrigger data-testid={`select-provider-${actualIndex}`}>
                                  <SelectValue placeholder="Select AI Model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {providers.map((provider) => (
                                    <SelectItem key={provider.id} value={provider.id}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full bg-${provider.color}-500`}></div>
                                        {provider.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplemental Prompt</label>
                              <Textarea
                                value={agent.supplementalPrompt || ""}
                                onChange={(e) => updateAgent(actualIndex, 'supplementalPrompt', e.target.value)}
                                placeholder="Additional instructions or perspective for this agent..."
                                rows={2}
                                className="text-sm"
                                data-testid={`textarea-supplemental-prompt-${actualIndex}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Iterations</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={iterations}
                      onChange={(e) => setIterations(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      className="w-20"
                      data-testid="input-iterations"
                    />
                    <span className="text-sm text-muted-foreground">times (default: 1)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Number of times to repeat the entire sequence</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Final Synthesis Model</label>
                  <Select
                    value={synthesisProviderId}
                    onValueChange={setSynthesisProviderId}
                  >
                    <SelectTrigger data-testid="select-synthesis-provider">
                      <SelectValue placeholder="Select model for synthesis (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No synthesis</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${provider.color}-500`}></div>
                            {provider.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Model to synthesize all iteration outputs</p>
                </div>
              </div>

              {folders.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Context Documents (optional)</label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {folders.map((doc: any) => (
                      <div
                        key={doc.id}
                        onClick={() => toggleDocument(doc.id)}
                        className={`p-2 border rounded cursor-pointer transition-colors text-sm ${
                          selectedFolders.includes(doc.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted'
                        }`}
                        data-testid={`document-${doc.id}`}
                      >
                        <i className="fas fa-file mr-2"></i>
                        {doc.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={createMeeting.isPending}
                className="w-full"
                data-testid="button-start-meeting"
              >
                {createMeeting.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Starting Meeting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-users mr-2"></i>
                    Start AI Meeting
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Meeting History */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting History</CardTitle>
              <CardDescription>View and manage your AI meetings</CardDescription>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 border rounded animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-users text-2xl mb-2 block"></i>
                  <p>No meetings yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedMeeting === meeting.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setSelectedMeeting(meeting.id)}
                      data-testid={`meeting-${meeting.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{meeting.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            meeting.status === 'completed' ? 'default' :
                            meeting.status === 'running' ? 'secondary' :
                            meeting.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {meeting.status}
                          </Badge>
                          {meeting.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportMeetingResults(meeting.id);
                              }}
                              data-testid={`button-export-${meeting.id}`}
                            >
                              <i className="fas fa-download"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {meeting.llmChain?.length || 0} agents
                        {meeting.totalCost && ` • $${parseFloat(meeting.totalCost).toFixed(3)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meeting Results */}
        {selectedMeeting && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Meeting Results</CardTitle>
              <CardDescription>Agent discussions and outputs for the selected meeting</CardDescription>
            </CardHeader>
            <CardContent>
              {meetingSteps.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-users text-2xl mb-2 block"></i>
                  <p>No meeting results available yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group steps by iteration */}
                  {Object.entries(
                    meetingSteps
                      .sort((a, b) => (a.iterationNumber || 1) - (b.iterationNumber || 1) || a.stepNumber - b.stepNumber)
                      .reduce((groups, step) => {
                        const iteration = step.iterationNumber || 1;
                        if (!groups[iteration]) groups[iteration] = [];
                        groups[iteration].push(step);
                        return groups;
                      }, {} as Record<number, typeof meetingSteps>)
                  ).map(([iteration, steps]) => (
                    <div key={iteration} className="space-y-4">
                      {parseInt(iteration) > 1 && (
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                            {iteration}
                          </div>
                          <h4 className="font-medium text-blue-700">Iteration {iteration}</h4>
                        </div>
                      )}
                      
                      {steps.map((step, index) => {
                        const provider = providers.find(p => p.id === step.providerId);
                        const isLast = index === steps.length - 1 && parseInt(iteration) === Math.max(...Object.keys(meetingSteps.reduce((groups, s) => {
                          const iter = s.iterationNumber || 1;
                          if (!groups[iter]) groups[iter] = [];
                          return groups;
                        }, {} as Record<number, any>)).map(Number));
                        
                        return (
                          <div key={step.id} className="relative ml-6">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  step.isSynthesis ? 'bg-purple-100 text-purple-700' :
                                  step.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  step.status === 'running' ? 'bg-blue-100 text-blue-700' :
                                  step.status === 'failed' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {step.isSynthesis ? 'S' : step.stepNumber}
                                </div>
                                {!isLast && <div className="w-px h-16 bg-border mt-2"></div>}
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className={`w-3 h-3 rounded-full bg-${provider?.color}-500`}></div>
                                    <span className="font-medium">{provider?.name || step.providerId}</span>
                                    <Badge variant={step.isSynthesis ? "default" : "outline"} className="text-xs">
                                      {step.isSynthesis ? 'Synthesis' : `Step ${step.stepNumber}`}
                                    </Badge>
                                    {!step.isSynthesis && (() => {
                                      const currentSequence = meetings.find((seq: any) => seq.id === selectedMeeting);
                                      const chainStep = currentSequence?.llmChain?.find((chain: any) => chain.step === step.stepNumber);
                                      const primary = chainStep?.primaryPersonality;
                                      const secondary = chainStep?.secondaryPersonality;
                                      const isDevilsAdvocate = chainStep?.isDevilsAdvocate;
                                      return (primary || secondary || isDevilsAdvocate) && (
                                        <div className="flex gap-1 flex-wrap">
                                          {isDevilsAdvocate && (
                                            <Badge variant="destructive" className="text-xs bg-red-50 text-red-700 border-red-200">
                                              <i className="fas fa-exclamation-triangle mr-1"></i>Devil's Advocate
                                            </Badge>
                                          )}
                                          {primary && (
                                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                              {primary}
                                            </Badge>
                                          )}
                                          {secondary && (
                                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                              {secondary}
                                            </Badge>
                                          )}
                                        </div>
                                      );
                                    })()}
                                    {step.isSynthesis && step.outputContent && (
                                      <div className="flex items-center gap-1 ml-2">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                                              <i className="fas fa-download mr-1"></i>
                                              Report
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => downloadSynthesisReport(selectedMeeting!, 'html')}>
                                              <i className="fas fa-globe mr-2"></i>
                                              HTML Report
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => downloadSynthesisReport(selectedMeeting!, 'markdown')}>
                                              <i className="fas fa-file-alt mr-2"></i>
                                              Markdown
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => downloadSynthesisReport(selectedMeeting!, 'json')}>
                                              <i className="fas fa-code mr-2"></i>
                                              JSON Data
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {step.responseTime && `${step.responseTime}ms`}
                                    {step.cost && ` • $${parseFloat(step.cost).toFixed(3)}`}
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Input:</h5>
                                    <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                                      {step.inputPrompt}
                                    </div>
                                  </div>
                                  
                                  {step.outputContent && (
                                    <div>
                                      <h5 className="text-sm font-medium mb-1">Output:</h5>
                                      <div className="text-sm bg-accent p-3 rounded whitespace-pre-wrap">
                                        {step.outputContent}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}