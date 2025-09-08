import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import { FaBars } from "react-icons/fa";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import ErrorBoundary from "@/components/ErrorBoundary";
import PromptStudio from "@/pages/prompt-studio";
import BatchTesting from "@/pages/batch-testing";
import PromptSequencing from "@/pages/prompt-sequencing";
import DocumentLibrary from "@/pages/document-library";
import AgentLibrary from "@/pages/agent-library";
import AgentTraining from "@/pages/agent-training";
import QuestionManagement from "@/pages/question-management";
import ResponseViewer from "@/pages/response-viewer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PromptStudio} />
      <Route path="/batch-testing" component={BatchTesting} />
      <Route path="/prompt-sequencing" component={PromptSequencing} />
      <Route path="/document-library" component={DocumentLibrary} />
      <Route path="/agent-library" component={AgentLibrary} />
      <Route path="/agent-training" component={AgentTraining} />
      <Route path="/question-management" component={QuestionManagement} />
      <Route path="/response-viewer" component={ResponseViewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex bg-background text-foreground">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-50
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <Sidebar 
              onConversationSelect={setConversationId}
              conversationId={conversationId}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-4 left-4 z-30 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            data-testid="mobile-menu-button"
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
