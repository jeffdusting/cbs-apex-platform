import { useQuery } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResponseAreaProps {
  promptId: string | null;
  selectedProviders: string[];
}

export default function ResponseArea({ promptId, selectedProviders }: ResponseAreaProps) {
  const { data: providers = [] } = useProviders();
  const { toast } = useToast();

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

  const openInNewTab = () => {
    if (!promptId || selectedProviders.length === 0) return;
    
    const url = `/response-viewer?promptId=${promptId}&providers=${selectedProviders.join(',')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Success",
      description: "Responses opened in new tab"
    });
  };

  if (!promptId) {
    return (
      <div className="w-1/2 border-l border-border flex items-center justify-center" data-testid="response-area">
        <div className="text-center text-muted-foreground">
          <i className="fas fa-comments text-4xl mb-4"></i>
          <p>Responses will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 border-l border-border flex flex-col" data-testid="response-area">
      <div className="p-4 border-b border-border bg-muted">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Responses</h3>
          {promptId && responses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              data-testid="button-open-new-tab"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Open in New Tab
            </Button>
          )}
        </div>
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
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-6">
            {selectedProviders.map((providerId, index) => (
              <div key={providerId} className="border-b border-border pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-muted animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : responses.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs">
              <div className="flex gap-1">
                {selectedProviderDetails.map(provider => (
                  <div key={provider.id} className={`w-2 h-2 rounded-full bg-${provider.color}-500`}></div>
                ))}
              </div>
              Generating responses...
            </div>
          </div>
        ) : (
          responses.map((response: any) => {
            const provider = providers.find(p => p.id === response.providerId);
            if (!provider) return null;

            return (
              <div key={response.id} className="p-6 border-b border-border" data-testid={`response-${response.id}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full bg-${provider.color}-500 flex items-center justify-center`}>
                      <i className={`${provider.icon} text-white text-xs`}></i>
                    </div>
                    <span className="font-medium text-sm">{provider.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(response.responseTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ${parseFloat(response.cost || "0").toFixed(3)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(response.content)}
                      data-testid={`button-copy-${response.id}`}
                    >
                      <i className="fas fa-copy text-xs"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {response.content}
                </div>
                
                {response.artifacts && response.artifacts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {response.artifacts.map((artifact: any, index: number) => (
                      <div key={index} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <i className={`fas ${
                              artifact.type === 'code' ? 'fa-file-code text-green-600' :
                              artifact.type === 'config' ? 'fa-cog text-blue-600' :
                              'fa-file-alt text-gray-600'
                            }`}></i>
                            <span className="text-sm font-medium">
                              Artifact: {artifact.name}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => downloadArtifact(response.id, index, artifact)}
                            data-testid={`button-download-artifact-${response.id}-${index}`}
                          >
                            <i className="fas fa-download mr-1"></i>Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
