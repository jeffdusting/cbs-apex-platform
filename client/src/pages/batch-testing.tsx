import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { useFolders } from "@/hooks/useFolders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BatchTest, BatchResult } from "@shared/schema";

export default function BatchTesting() {
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { data: providers = [] } = useProviders();
  const { data: folders = [] } = useFolders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batchTests = [], isLoading: testsLoading } = useQuery<BatchTest[]>({
    queryKey: ["/api/batch-tests"],
  });

  const { data: batchResults = [] } = useQuery<BatchResult[]>({
    queryKey: ["/api/batch-tests", selectedTest, "results"],
    enabled: !!selectedTest,
  });

  const createBatchTest = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/batch-tests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-tests"] });
      setTestName("");
      setTestDescription("");
      setPrompts([""]);
      setSelectedProviders([]);
      setSelectedFolders([]);
      toast({
        title: "Success",
        description: "Batch test created and started successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create batch test",
        variant: "destructive"
      });
    }
  });

  const addPrompt = () => {
    setPrompts([...prompts, ""]);
  };

  const updatePrompt = (index: number, value: string) => {
    const updated = [...prompts];
    updated[index] = value;
    setPrompts(updated);
  };

  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      setSelectedProviders(selectedProviders.filter(id => id !== providerId));
    } else {
      setSelectedProviders([...selectedProviders, providerId]);
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
    if (!testName.trim() || prompts.every(p => !p.trim()) || selectedProviders.length === 0) {
      toast({
        title: "Error",
        description: "Please provide test name, at least one prompt, and select providers",
        variant: "destructive"
      });
      return;
    }

    createBatchTest.mutate({
      name: testName,
      description: testDescription,
      prompts: prompts.filter(p => p.trim()),
      selectedProviders,
      selectedFolders
    });
  };

  const exportResults = async (testId: string) => {
    try {
      const response = await fetch(`/api/batch-tests/${testId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-test-results-${testId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Results exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          <h2 className="text-lg font-semibold">Batch Testing</h2>
          <p className="text-sm text-muted-foreground hidden sm:block">Test multiple prompts across different providers</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 lg:p-6">

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Create New Test */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Batch Test</CardTitle>
              <CardDescription>Configure multiple prompts to test across providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Test Name</label>
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Enter test name..."
                  data-testid="input-test-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <Textarea
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Describe what this test is for..."
                  rows={3}
                  data-testid="textarea-test-description"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Test Prompts</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPrompt}
                    data-testid="button-add-prompt"
                  >
                    <i className="fas fa-plus mr-1"></i>Add Prompt
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {prompts.map((prompt, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={prompt}
                        onChange={(e) => updatePrompt(index, e.target.value)}
                        placeholder={`Prompt ${index + 1}...`}
                        rows={2}
                        className="flex-1"
                        data-testid={`textarea-prompt-${index}`}
                      />
                      {prompts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrompt(index)}
                          className="px-2"
                          data-testid={`button-remove-prompt-${index}`}
                        >
                          <i className="fas fa-trash text-red-500"></i>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Providers</label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => toggleProvider(provider.id)}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedProviders.includes(provider.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                      data-testid={`provider-${provider.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          provider.color === 'emerald' ? 'bg-emerald-500' :
                          provider.color === 'amber' ? 'bg-amber-500' :
                          provider.color === 'blue' ? 'bg-blue-500' :
                          provider.color === 'orange' ? 'bg-orange-500' :
                          provider.color === 'slate' ? 'bg-slate-700' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm">{provider.name}</span>
                      </div>
                    </div>
                  ))}
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
                disabled={createBatchTest.isPending}
                className="w-full"
                data-testid="button-create-batch-test"
              >
                {createBatchTest.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Test...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-2"></i>
                    Create & Run Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test History */}
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>View and manage your batch tests</CardDescription>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 border rounded animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : batchTests.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-flask text-2xl mb-2 block"></i>
                  <p>No batch tests yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {batchTests.map((test) => (
                    <div
                      key={test.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedTest === test.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => setSelectedTest(test.id)}
                      data-testid={`batch-test-${test.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            test.status === 'completed' ? 'default' :
                            test.status === 'running' ? 'secondary' :
                            test.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {test.status}
                          </Badge>
                          {test.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportResults(test.id);
                              }}
                              data-testid={`button-export-${test.id}`}
                            >
                              <i className="fas fa-download"></i>
                            </Button>
                          )}
                        </div>
                      </div>
                      {test.description && (
                        <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {test.prompts?.length || 0} prompts • {test.selectedProviders?.length || 0} providers
                        {test.totalCost && ` • $${parseFloat(test.totalCost).toFixed(3)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {selectedTest && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Detailed results for the selected batch test</CardDescription>
            </CardHeader>
            <CardContent>
              {batchResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-chart-bar text-2xl mb-2 block"></i>
                  <p>No results available yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group results by prompt */}
                  {Object.entries(
                    batchResults.reduce((acc, result) => {
                      const key = result.promptIndex;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(result);
                      return acc;
                    }, {} as Record<number, typeof batchResults>)
                  ).map(([promptIndex, results]) => (
                    <div key={promptIndex} className="border rounded-lg p-3 lg:p-4">
                      <h5 className="font-medium mb-2">Prompt {parseInt(promptIndex) + 1}</h5>
                      <div className="bg-muted p-3 rounded mb-4 text-sm max-h-32 overflow-y-auto">
                        {results[0].promptContent}
                      </div>
                      <div className="space-y-4">
                        {results.map((result) => {
                          const provider = providers.find(p => p.id === result.providerId);
                          return (
                            <div key={result.id} className="border-l-4 border-primary pl-3 lg:pl-4">
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className={`w-3 h-3 rounded-full bg-${provider?.color}-500 flex-shrink-0`}></div>
                                  <span className="font-medium text-sm truncate">{provider?.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {result.responseTime}ms • ${parseFloat(result.cost || "0").toFixed(3)}
                                </div>
                              </div>
                              <div className="text-sm bg-accent p-3 rounded whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {result.responseContent}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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