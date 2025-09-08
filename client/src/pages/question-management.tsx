import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, BookOpen, Brain, Target, Sparkles } from "lucide-react";

interface CompetencyQuestion {
  id: string;
  specialtyId: string;
  specialtyName: string;
  competencyLevel: string;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  tags: string[];
  skillsTested: string[];
  scenario: string;
  points: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface Specialty {
  id: string;
  name: string;
  description: string;
  domain: string;
  competencyLevels: string[];
}

export default function QuestionManagement() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all-specialties");
  const [selectedLevel, setSelectedLevel] = useState<string>("all-levels");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CompetencyQuestion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: specialties, isLoading: specialtiesLoading } = useQuery({
    queryKey: ["/api/training/specialties"],
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/competency-questions", selectedSpecialty, selectedLevel],
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: { specialtyId: string; competencyLevel: string; count: number }) => {
      return apiRequest("POST", "/api/competency-questions/generate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competency-questions"] });
      toast({
        title: "Questions Generated",
        description: "AI questions have been generated and added to the question bank.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return apiRequest("DELETE", `/api/competency-questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competency-questions"] });
      toast({
        title: "Question Deleted",
        description: "Question has been removed from the question bank.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const competencyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const filteredQuestions = (questions as CompetencyQuestion[])?.filter(q => 
    (selectedSpecialty === "all-specialties" || q.specialtyId === selectedSpecialty) &&
    (selectedLevel === "all-levels" || q.competencyLevel === selectedLevel)
  ) || [];

  const questionsByLevel = competencyLevels.reduce((acc, level) => {
    acc[level] = filteredQuestions.filter(q => q.competencyLevel === level);
    return acc;
  }, {} as Record<string, CompetencyQuestion[]>);

  const handleGenerateQuestions = (specialtyId: string, level: string) => {
    generateQuestionsMutation.mutate({
      specialtyId,
      competencyLevel: level,
      count: 5
    });
  };

  if (specialtiesLoading) {
    return <div className="flex justify-center items-center h-64">Loading specialties...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question Management</h1>
        <p className="text-muted-foreground">
          Manage test questions for each competency and level. View, edit, and add questions for training assessments.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filter Questions
          </CardTitle>
          <CardDescription>
            Select a specialty and competency level to view or manage questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="specialty-select">Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger data-testid="specialty-select">
                  <SelectValue placeholder="Select a specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-specialties">All Specialties</SelectItem>
                  {(specialties as Specialty[])?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level-select">Competency Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger data-testid="level-select">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                  {competencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                disabled={selectedSpecialty === "all-specialties" || selectedLevel === "all-levels"}
                className="flex items-center gap-2"
                data-testid="add-question-button"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
              
              {selectedSpecialty !== "all-specialties" && selectedLevel !== "all-levels" && (
                <Button
                  onClick={() => handleGenerateQuestions(selectedSpecialty, selectedLevel)}
                  disabled={generateQuestionsMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="generate-questions-button"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Questions
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Display */}
      {questionsLoading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : selectedSpecialty !== "all-specialties" || selectedLevel !== "all-levels" ? (
        <div className="space-y-6">
          {competencyLevels.map((level) => {
            const levelQuestions = questionsByLevel[level];
            if (selectedLevel === "all-levels" || selectedLevel === level) {
              return (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {level} Level Questions
                        <Badge variant="secondary">{levelQuestions.length}</Badge>
                      </div>
                      {selectedSpecialty !== "all-specialties" && (
                        <Button
                          onClick={() => handleGenerateQuestions(selectedSpecialty, level)}
                          disabled={generateQuestionsMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          data-testid={`generate-${level.toLowerCase()}-questions`}
                        >
                          <Sparkles className="h-3 w-3" />
                          Generate
                        </Button>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Questions for {level.toLowerCase()} level competency assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {levelQuestions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No questions found for this level.</p>
                        <p className="text-sm">Click "Generate AI Questions" to create some.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {levelQuestions.map((question, index) => (
                          <Card key={question.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{question.questionType}</Badge>
                                  <Badge variant="secondary">{question.difficulty}</Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {question.points} pts
                                  </Badge>
                                  {question.createdBy === 'ai' && (
                                    <Badge variant="secondary" className="text-xs">
                                      AI Generated
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingQuestion(question)}
                                    data-testid={`edit-question-${index}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteQuestionMutation.mutate(question.id)}
                                    disabled={deleteQuestionMutation.isPending}
                                    data-testid={`delete-question-${index}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <p className="font-medium text-sm text-muted-foreground mb-1">Question:</p>
                                  <p className="text-sm">{question.question}</p>
                                </div>

                                {question.scenario && (
                                  <div>
                                    <p className="font-medium text-sm text-muted-foreground mb-1">Scenario:</p>
                                    <p className="text-sm italic text-muted-foreground">{question.scenario}</p>
                                  </div>
                                )}

                                {question.questionType === 'multiple_choice' && question.options.length > 0 && (
                                  <div>
                                    <p className="font-medium text-sm text-muted-foreground mb-1">Options:</p>
                                    <ul className="text-sm space-y-1">
                                      {question.options.map((option, optIndex) => (
                                        <li 
                                          key={optIndex} 
                                          className={`pl-2 ${option === question.correctAnswer ? 'text-green-600 font-medium' : ''}`}
                                        >
                                          {option} {option === question.correctAnswer && '✓'}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {question.explanation && (
                                  <div>
                                    <p className="font-medium text-sm text-muted-foreground mb-1">Explanation:</p>
                                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                  </div>
                                )}

                                {question.skillsTested.length > 0 && (
                                  <div>
                                    <p className="font-medium text-sm text-muted-foreground mb-1">Skills Tested:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {question.skillsTested.map((skill, skillIndex) => (
                                        <Badge key={skillIndex} variant="outline" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select Filters to View Questions</h3>
              <p className="text-muted-foreground">
                Choose a specialty and competency level to view and manage questions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Question Dialog */}
      <QuestionDialog
        isOpen={isAddDialogOpen || !!editingQuestion}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        specialties={specialties as Specialty[]}
        selectedSpecialty={selectedSpecialty}
        selectedLevel={selectedLevel}
      />
    </div>
  );
}

interface QuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: CompetencyQuestion | null;
  specialties: Specialty[];
  selectedSpecialty: string;
  selectedLevel: string;
}

function QuestionDialog({ isOpen, onClose, question, specialties, selectedSpecialty, selectedLevel }: QuestionDialogProps) {
  const [formData, setFormData] = useState({
    specialtyId: selectedSpecialty,
    competencyLevel: selectedLevel,
    question: "",
    questionType: "multiple_choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: "medium",
    tags: [] as string[],
    skillsTested: [] as string[],
    scenario: "",
    points: 10,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (question) {
      setFormData({
        specialtyId: question.specialtyId,
        competencyLevel: question.competencyLevel,
        question: question.question,
        questionType: question.questionType,
        options: question.options.length >= 4 ? question.options : [...question.options, ...Array(4 - question.options.length).fill("")],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
        tags: question.tags || [],
        skillsTested: question.skillsTested || [],
        scenario: question.scenario || "",
        points: question.points,
      });
    } else {
      setFormData({
        specialtyId: selectedSpecialty,
        competencyLevel: selectedLevel,
        question: "",
        questionType: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        difficulty: "medium",
        tags: [],
        skillsTested: [],
        scenario: "",
        points: 10,
      });
    }
  }, [question, selectedSpecialty, selectedLevel]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        options: data.questionType === 'multiple_choice' ? data.options.filter(Boolean) : [],
        createdBy: 'user'
      };

      if (question) {
        return apiRequest("PUT", `/api/competency-questions/${question.id}`, payload);
      } else {
        return apiRequest("POST", "/api/competency-questions", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competency-questions"] });
      toast({
        title: question ? "Question Updated" : "Question Added",
        description: question ? "Question has been updated successfully." : "New question has been added to the question bank.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Add New Question"}</DialogTitle>
          <DialogDescription>
            {question ? "Update the question details below." : "Create a new question for the question bank."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={formData.specialtyId} onValueChange={(value) => setFormData({...formData, specialtyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Competency Level</Label>
              <Select value={formData.competencyLevel} onValueChange={(value) => setFormData({...formData, competencyLevel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              placeholder="Enter the question text..."
              required
            />
          </div>

          <div>
            <Label htmlFor="scenario">Scenario/Context (Optional)</Label>
            <Textarea
              id="scenario"
              value={formData.scenario}
              onChange={(e) => setFormData({...formData, scenario: e.target.value})}
              placeholder="Provide context or scenario for the question..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={formData.questionType} onValueChange={(value) => setFormData({...formData, questionType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 10})}
                min="1"
                max="100"
              />
            </div>
          </div>

          {formData.questionType === "multiple_choice" && (
            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({...formData, options: newOptions});
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Input
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
              placeholder="Enter the correct answer..."
              required
            />
          </div>

          <div>
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({...formData, explanation: e.target.value})}
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : question ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}