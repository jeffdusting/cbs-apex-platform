import { useEffect, useRef, useState, useCallback } from 'react';
import { AgentMood, MoodUpdate } from '@shared/moodSchema';

interface UseMoodWebSocketProps {
  meetingId: string;
  onMoodUpdate?: (mood: AgentMood) => void;
  onStatusChange?: (agentId: string, status: string) => void;
}

interface MoodWebSocketState {
  isConnected: boolean;
  error: string | null;
  moods: Map<string, AgentMood>;
  sendMoodUpdate: (update: MoodUpdate) => void;
  reconnect: () => void;
}

export const useMoodWebSocket = ({
  meetingId,
  onMoodUpdate,
  onStatusChange
}: UseMoodWebSocketProps): MoodWebSocketState => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moods, setMoods] = useState<Map<string, AgentMood>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/mood/${meetingId}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Mood WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'mood_update':
              const updatedMood: AgentMood = data.payload;
              setMoods(prev => new Map(prev.set(updatedMood.agentId, updatedMood)));
              onMoodUpdate?.(updatedMood);
              break;
              
            case 'status_change':
              onStatusChange?.(data.payload.agentId, data.payload.status);
              break;
              
            case 'moods_sync':
              const allMoods: AgentMood[] = data.payload;
              const moodMap = new Map();
              allMoods.forEach(mood => moodMap.set(mood.agentId, mood));
              setMoods(moodMap);
              break;
              
            case 'error':
              console.error('WebSocket error:', data.payload);
              setError(data.payload.message);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('Mood WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (meetingId) {
            connect();
          }
        }, 3000);
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect');
    }
  }, [meetingId, onMoodUpdate, onStatusChange]);

  const sendMoodUpdate = useCallback((update: MoodUpdate) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mood_update',
        payload: update
      }));
    } else {
      console.warn('WebSocket not connected, cannot send mood update');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  useEffect(() => {
    if (meetingId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [meetingId, connect]);

  return {
    isConnected,
    error,
    moods,
    sendMoodUpdate,
    reconnect
  };
};