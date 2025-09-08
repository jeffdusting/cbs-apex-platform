import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { FaTimes, FaEdit, FaLayerGroup, FaUsers, FaFolder, FaRobot, FaGraduationCap, FaChartLine } from "react-icons/fa";
import { ConversationListSkeleton } from "@/components/LoadingSkeletons";

interface SidebarProps {
  onConversationSelect: (id: string | null) => void;
  conversationId: string | null;
  onClose?: () => void;
}

export default function Sidebar({ onConversationSelect, conversationId, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: costs } = useQuery<{daily: number; monthly: number; total: number}>({
    queryKey: ["/api/costs"],
  });

  return (
    <div className="w-80 h-screen bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold gradient-text">CBS Apex</h1>
            <p className="text-sm text-muted-foreground mt-1">Multi-provider AI assistant</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              data-testid="close-sidebar"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-prompt-studio">
          <FaEdit className="w-4 h-4" />
          <span>Prompt Studio</span>
        </Link>
        <Link href="/batch-testing" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/batch-testing' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-batch-testing">
          <FaLayerGroup className="w-4 h-4" />
          <span>Batch Testing</span>
        </Link>
        <Link href="/prompt-sequencing" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/prompt-sequencing' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-ai-meetings">
          <FaUsers className="w-4 h-4" />
          <span>AI Meetings</span>
        </Link>
        <div className="border-t border-border my-2"></div>
        <Link href="/document-library" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/document-library' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-document-library">
          <FaFolder className="w-4 h-4" />
          <span>Document Library</span>
        </Link>
        <Link href="/agent-library" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/agent-library' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-agent-library">
          <FaRobot className="w-4 h-4" />
          <span>Agent Library</span>
        </Link>
        <Link href="/agent-training" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/agent-training' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-agent-training">
          <FaGraduationCap className="w-4 h-4" />
          <span>Agent Training</span>
        </Link>
        <Link href="/question-management" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location === '/question-management' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`} data-testid="link-question-management">
          <FaFolder className="w-4 h-4" />
          <span>Question Management</span>
        </Link>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <FaChartLine className="w-4 h-4" />
          <span>Usage & Costs</span>
        </a>
      </nav>
      
      <div className="p-4 flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Conversations</h3>
        {conversationsLoading ? (
          <ConversationListSkeleton />
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation: any) => (
              <div 
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors ${
                  conversationId === conversation.id ? 'bg-muted' : ''
                }`}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="text-sm font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-sm font-medium mb-2">This Month</div>
          <div className="text-2xl font-bold text-accent-foreground" data-testid="monthly-cost">
            ${costs?.monthly?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-muted-foreground">across multiple providers</div>
        </div>
      </div>
    </div>
  );
}
