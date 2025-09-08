import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConversationThreadProps {
  conversationId: string | null;
}

export default function ConversationThread({ conversationId }: ConversationThreadProps) {
  const [followUpQuestion, setFollowUpQuestion] = useState("");

  const { data: conversation } = useQuery<{prompts?: any[]}>({
    queryKey: ["/api/conversations", conversationId],
    enabled: !!conversationId
  });

  const handleFollowUp = () => {
    if (followUpQuestion.trim()) {
      // TODO: Implement follow-up question submission
      console.log("Follow-up question:", followUpQuestion);
      setFollowUpQuestion("");
    }
  };

  return (
    <div className="p-4" data-testid="conversation-history">
      <h3 className="text-sm font-semibold mb-3">Conversation Thread</h3>
      
      {conversationId ? (
        <div className="space-y-3 text-sm">
          {conversation?.prompts?.map((prompt: any) => (
            <div key={prompt.id} className="conversation-bubble user">
              <p>{prompt.content.length > 100 ? prompt.content.slice(0, 100) + "..." : prompt.content}</p>
              <div className="text-xs opacity-75 mt-2">
                You • {new Date(prompt.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          <div className="mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Ask a follow-up question..."
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFollowUp()}
                className="pr-10"
                data-testid="input-followup"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleFollowUp}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                data-testid="button-send-followup"
              >
                <i className="fas fa-paper-plane text-xs"></i>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          <i className="fas fa-comment-dots text-2xl mb-2 block"></i>
          <p>Start a conversation to see the thread</p>
        </div>
      )}
    </div>
  );
}
