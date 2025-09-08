import React, { useEffect, useState } from 'react';
import { AgentMoodIndicator, AgentMoodList } from './AgentMoodIndicator';
import { useMoodWebSocket } from '@/hooks/useMoodWebSocket';
import { AgentMood } from '@shared/moodSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

interface MeetingMoodBarProps {
  meetingId: string;
  agentIds: string[];
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showConnectionStatus?: boolean;
}

export const MeetingMoodBar: React.FC<MeetingMoodBarProps> = ({
  meetingId,
  agentIds,
  className = '',
  layout = 'horizontal',
  showConnectionStatus = true
}) => {
  const [activeMoods, setActiveMoods] = useState<AgentMood[]>([]);
  
  const { isConnected, error, moods, sendMoodUpdate } = useMoodWebSocket({
    meetingId,
    onMoodUpdate: (mood) => {
      console.log('Mood updated:', mood);
    },
    onStatusChange: (agentId, status) => {
      console.log('Status changed:', agentId, status);
    }
  });

  // Update active moods when moods from WebSocket change
  useEffect(() => {
    const moodArray = Array.from(moods.values());
    setActiveMoods(moodArray);
  }, [moods]);

  // Initialize moods for agents when component mounts
  useEffect(() => {
    if (agentIds.length > 0 && isConnected) {
      fetch(`/api/meetings/${meetingId}/init-moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds })
      }).catch(console.error);
    }
  }, [meetingId, agentIds, isConnected]);

  // Get layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-3';
      case 'grid':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3';
      default:
        return 'flex flex-row gap-3 flex-wrap';
    }
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Live
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <Badge variant="destructive" className="text-red-700">
            Disconnected
          </Badge>
        </>
      )}
    </div>
  );

  // Agent mood card for detailed view
  const AgentMoodCard = ({ mood }: { mood: AgentMood }) => (
    <Card className="min-w-[120px]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <AgentMoodIndicator mood={mood} size="sm" />
          <span className="text-sm font-medium truncate">
            Agent {mood.agentId.slice(-4)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Mood: <span className="capitalize">{mood.mood}</span></div>
          <div>Status: <span className="capitalize">{mood.status}</span></div>
          <div>Intensity: {Math.round(mood.intensity * 100)}%</div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="w-4 h-4" />
            <span>Failed to connect to mood updates</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Agent Collaboration Mood</CardTitle>
          {showConnectionStatus && <ConnectionStatus />}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {activeMoods.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No active agents
          </div>
        ) : layout === 'grid' ? (
          <div className={getLayoutClasses()}>
            {activeMoods.map((mood) => (
              <AgentMoodCard key={mood.agentId} mood={mood} />
            ))}
          </div>
        ) : (
          <div className={getLayoutClasses()}>
            {activeMoods.map((mood) => (
              <AgentMoodIndicator
                key={mood.agentId}
                mood={mood}
                size="md"
                showLabel={layout === 'vertical'}
                animated={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Compact version for sidebars
export const CompactMoodBar: React.FC<{
  meetingId: string;
  agentIds: string[];
}> = ({ meetingId, agentIds }) => {
  const { moods, isConnected } = useMoodWebSocket({ meetingId });
  const activeMoods = Array.from(moods.values());

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <span className="text-xs font-medium text-muted-foreground">
        Mood:
      </span>
      <div className="flex gap-1">
        {activeMoods.slice(0, 3).map((mood) => (
          <AgentMoodIndicator
            key={mood.agentId}
            mood={mood}
            size="sm"
            animated={true}
          />
        ))}
        {activeMoods.length > 3 && (
          <Badge variant="outline" className="text-xs px-1 h-5">
            +{activeMoods.length - 3}
          </Badge>
        )}
      </div>
      {!isConnected && <WifiOff className="w-3 h-3 text-red-500" />}
    </div>
  );
};