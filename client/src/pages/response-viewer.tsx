import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseViewerProps {
  promptId?: string;
  selectedProviders?: string[];
}

export default function ResponseViewer() {
  const [promptId, setPromptId] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const { data: providers = [] } = useProviders();
  const { toast } = useToast();

  // Get parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promptIdParam = params.get('promptId');
    const providersParam = params.get('providers');
    
    if (promptIdParam) setPromptId(promptIdParam);
    if (providersParam) setSelectedProviders(providersParam.split(','));
  }, []);

  const { data: responses = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/prompts", promptId, "responses"],
    enabled: !!promptId
  });

  const selectedProviderDetails = providers.filter(p => selectedProviders.includes(p.id));

  const downloadArtifact = async (responseId: string, artifactIndex: number, artifact: any) => {
    try {
      const response = await fetch(`/api/responses/${responseId}/artifacts/${artifactIndex}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artifact.name}.${artifact.language || 'txt'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Artifact downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download artifact",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Success",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive"
      });
    }
  };

  if (!promptId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="response-viewer">
        <div className="text-center text-muted-foreground">
          <i className="fas fa-external-link-alt text-4xl mb-4"></i>
          <h1 className="text-2xl font-semibold mb-2">Response Viewer</h1>
          <p>No prompt ID provided. This page should be opened from the Prompt Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="response-viewer">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Response Viewer</h1>
              <div className="flex gap-2 flex-wrap">
                {selectedProviderDetails.map(provider => (
                  <span 
                    key={provider.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-${provider.color}-100 text-${provider.color}-700`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-${provider.color}-500`}></div>
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.close()}
              data-testid="button-close-tab"
            >
              <i className="fas fa-times mr-2"></i>
              Close Tab
            </Button>
          </div>
        </div>
      </header>

      {/* Response Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-6">
            {selectedProviders.map((providerId, index) => (
              <Card key={providerId}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
              <div className="flex gap-1">
                {selectedProviderDetails.map(provider => (
                  <div key={provider.id} className={`w-2 h-2 rounded-full bg-${provider.color}-500`}></div>
                ))}
              </div>
              Generating responses...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response: any) => {
              const provider = providers.find(p => p.id === response.providerId);
              if (!provider) return null;

              return (
                <Card key={response.id} data-testid={`response-${response.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${provider.color}-500 flex items-center justify-center`}>
                          <i className={`${provider.icon} text-white text-sm`}></i>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            Response time: {(response.responseTime / 1000).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Cost: ${parseFloat(response.cost || "0").toFixed(3)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(response.content)}
                          data-testid={`button-copy-${response.id}`}
                        >
                          <i className="fas fa-copy mr-2"></i>
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="prose prose-lg max-w-none whitespace-pre-wrap">
                      {response.content}
                    </div>
                    
                    {response.artifacts && response.artifacts.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Artifacts</h4>
                        {response.artifacts.map((artifact: any, index: number) => (
                          <div key={index} className="p-4 bg-accent rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <i className={`fas text-lg ${
                                  artifact.type === 'code' ? 'fa-file-code text-green-600' :
                                  artifact.type === 'config' ? 'fa-cog text-blue-600' :
                                  'fa-file-alt text-gray-600'
                                }`}></i>
                                <div>
                                  <span className="font-medium">
                                    {artifact.name}
                                  </span>
                                  <div className="text-sm text-muted-foreground">
                                    {artifact.type} • {artifact.language || 'text'}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => downloadArtifact(response.id, index, artifact)}
                                data-testid={`button-download-artifact-${response.id}-${index}`}
                              >
                                <i className="fas fa-download mr-2"></i>Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}