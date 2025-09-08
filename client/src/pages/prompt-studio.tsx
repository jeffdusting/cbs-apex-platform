import { useState } from "react";
import ProviderSelector from "@/components/ProviderSelector";
import PromptEditor from "@/components/PromptEditor";
import ResponseArea from "@/components/ResponseArea";
import ContextPanel from "@/components/ContextPanel";

export default function PromptStudio() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [promptContent, setPromptContent] = useState("");
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen" data-testid="prompt-studio">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6" data-testid="header">
        <div className="flex items-center gap-2 lg:gap-4 min-w-0">
          <h2 className="text-lg font-semibold truncate">New Prompt</h2>
          <div className="cost-indicator hidden sm:flex">
            <i className="fas fa-dollar-sign mr-1"></i>
            <span data-testid="current-cost">$0.00</span>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button 
            className="px-3 lg:px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            data-testid="button-save-draft"
          >
            <i className="fas fa-save lg:mr-2"></i>
            <span className="hidden lg:inline">Save Draft</span>
          </button>
          <button 
            className="px-3 lg:px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="button-send-prompt"
          >
            <i className="fas fa-paper-plane lg:mr-2"></i>
            <span className="hidden lg:inline">Send Prompt</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ProviderSelector 
            selectedProviders={selectedProviders}
            onSelectionChange={setSelectedProviders}
          />
          
          <PromptEditor 
            content={promptContent}
            onChange={setPromptContent}
            selectedFolders={selectedFolders}
            onPromptSubmit={(promptId) => setCurrentPromptId(promptId)}
            selectedProviders={selectedProviders}
            conversationId={conversationId}
          />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:w-96 xl:w-1/3 border-t lg:border-t-0 lg:border-l border-border">
          <ResponseArea 
            promptId={currentPromptId}
            selectedProviders={selectedProviders}
          />
          
          <ContextPanel 
            selectedFolders={selectedFolders}
            onSelectionChange={setSelectedFolders}
            conversationId={conversationId}
          />
        </div>
      </div>
    </div>
  );
}
