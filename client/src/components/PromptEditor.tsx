import { useState, useEffect } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PromptEditorProps {
  content: string;
  onChange: (content: string) => void;
  selectedFolders: string[];
  onPromptSubmit: (promptId: string) => void;
  selectedProviders: string[];
  conversationId: string | null;
}

export default function PromptEditor({ 
  content, 
  onChange, 
  selectedFolders, 
  onPromptSubmit,
  selectedProviders,
  conversationId 
}: PromptEditorProps) {
  const [tokenCount, setTokenCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createPrompt } = usePrompts();

  useEffect(() => {
    if (content) {
      // Debounced token counting with provider-specific estimation
      const timeoutId = setTimeout(async () => {
        try {
          // Use the first selected provider for token estimation, or default to OpenAI
          const primaryProvider = selectedProviders[0] || 'openai-gpt5';
          
          // Map provider IDs to provider names and models for more accurate counting
          const providerMapping: Record<string, { provider: string; model: string }> = {
            'openai-gpt5': { provider: 'openai', model: 'gpt-5' },
            'anthropic-claude': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
            'google-gemini': { provider: 'google', model: 'gemini-2.5-pro' },
            'mistral-large': { provider: 'mistral', model: 'mistral-large-latest' },
            'xai-grok': { provider: 'xai', model: 'grok-2-1212' }
          };

          const providerInfo = providerMapping[primaryProvider] || providerMapping['openai-gpt5'];
          
          const response = await apiRequest('POST', '/api/tokens/estimate', { 
            content,
            model: providerInfo.model,
            provider: providerInfo.provider
          });
          const data = await response.json();
          setTokenCount(data.tokenCount);
        } catch (error) {
          console.error('Failed to estimate tokens:', error);
          // Fallback to simple estimation
          setTokenCount(Math.ceil(content.split(/\s+/).length / 0.75));
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setTokenCount(0);
    }
  }, [content, selectedProviders]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }

    if (selectedProviders.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one provider",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPrompt.mutateAsync({
        content,
        selectedProviders,
        selectedFolders,
        conversationId: conversationId || undefined
      });

      onPromptSubmit(result.prompt.id);
      
      toast({
        title: "Success",
        description: "Prompt sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send prompt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6" data-testid="prompt-editor">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Prompt Editor</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Estimated tokens:</span>
          <span className="text-xs font-medium" data-testid="token-count">
            {tokenCount.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-2 border border-border rounded-t-lg bg-muted">
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-bold"></i>
        </button>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-italic"></i>
        </button>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-code"></i>
        </button>
        <div className="w-px h-4 bg-border"></div>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-list-ul"></i>
        </button>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-list-ol"></i>
        </button>
        <div className="w-px h-4 bg-border"></div>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-link"></i>
        </button>
        <button className="p-2 hover:bg-background rounded text-xs">
          <i className="fas fa-image"></i>
        </button>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="editor-content flex-1 border border-t-0 border-border rounded-b-lg p-4 bg-card focus:ring-2 focus:ring-ring resize-none"
        placeholder="Enter your prompt here..."
        data-testid="input-prompt"
      />
      
      {selectedFolders.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            <span className="text-sm font-medium">Context will be injected</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedFolders.length} folder{selectedFolders.length > 1 ? 's' : ''} selected
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || selectedProviders.length === 0}
          className="px-6"
          data-testid="button-send-prompt"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane mr-2"></i>
              Send Prompt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
