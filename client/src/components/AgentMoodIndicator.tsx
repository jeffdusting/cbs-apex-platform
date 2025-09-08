import React from 'react';
import { Brain, Sparkles, Users, Eye, Zap, Search, Lightbulb, Heart, HelpCircle, CheckCircle, Minus } from 'lucide-react';
import { AgentMood, AgentMoodType, AgentStatusType } from '@shared/moodSchema';

interface AgentMoodIndicatorProps {
  mood: AgentMood;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

// Mood to icon mapping
const getMoodIcon = (mood: AgentMoodType) => {
  switch (mood) {
    case 'focused': return Brain;
    case 'excited': return Sparkles;
    case 'collaborative': return Users;
    case 'contemplative': return Eye;
    case 'energetic': return Zap;
    case 'analytical': return Search;
    case 'creative': return Lightbulb;
    case 'supportive': return Heart;
    case 'curious': return HelpCircle;
    case 'confident': return CheckCircle;
    default: return Minus;
  }
};

// Mood to color mapping
const getMoodColor = (mood: AgentMoodType, intensity: number) => {
  const baseColors = {
    focused: 'bg-blue-500',
    excited: 'bg-yellow-500',
    collaborative: 'bg-green-500',
    contemplative: 'bg-purple-500',
    energetic: 'bg-orange-500',
    analytical: 'bg-indigo-500',
    creative: 'bg-pink-500',
    supportive: 'bg-emerald-500',
    curious: 'bg-cyan-500',
    confident: 'bg-lime-500',
    neutral: 'bg-gray-500'
  };
  
  // Adjust opacity based on intensity
  const opacity = Math.floor(intensity * 100);
  return `${baseColors[mood]} opacity-${Math.max(20, opacity)}`;
};

// Status to animation mapping
const getStatusAnimation = (status: AgentStatusType, animated: boolean) => {
  if (!animated) return '';
  
  switch (status) {
    case 'thinking': return 'animate-pulse';
    case 'typing': return 'animate-bounce';
    case 'responding': return 'animate-ping';
    case 'synthesizing': return 'animate-spin';
    case 'listening': return 'animate-pulse';
    case 'reviewing': return 'animate-pulse';
    default: return '';
  }
};

// Size configurations
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm': return { container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' };
    case 'lg': return { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' };
    default: return { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' };
  }
};

// Status labels
const getStatusLabel = (status: AgentStatusType) => {
  switch (status) {
    case 'thinking': return 'Thinking...';
    case 'typing': return 'Responding...';
    case 'listening': return 'Listening';
    case 'responding': return 'Active';
    case 'synthesizing': return 'Synthesizing';
    case 'reviewing': return 'Reviewing';
    case 'idle': return 'Idle';
    case 'offline': return 'Offline';
    default: return status;
  }
};

export const AgentMoodIndicator: React.FC<AgentMoodIndicatorProps> = ({
  mood,
  size = 'md',
  showLabel = false,
  animated = true
}) => {
  const MoodIcon = getMoodIcon(mood.mood);
  const colorClass = getMoodColor(mood.mood, mood.intensity);
  const animationClass = getStatusAnimation(mood.status, animated);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`
          ${sizeClasses.container} 
          ${colorClass} 
          ${animationClass}
          rounded-full flex items-center justify-center
          transition-all duration-300 ease-in-out
          relative overflow-hidden
        `}
        title={`${mood.mood} • ${getStatusLabel(mood.status)}`}
      >
        <MoodIcon className={`${sizeClasses.icon} text-white`} />
        
        {/* Intensity indicator ring */}
        <div 
          className="absolute inset-0 border-2 border-white rounded-full opacity-30"
          style={{ 
            transform: `scale(${0.5 + mood.intensity * 0.5})` 
          }}
        />
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className={`${sizeClasses.text} font-medium capitalize`}>
            {mood.mood}
          </span>
          <span className={`${sizeClasses.text} text-muted-foreground`}>
            {getStatusLabel(mood.status)}
          </span>
        </div>
      )}
    </div>
  );
};

// Mood indicator list for multiple agents
interface AgentMoodListProps {
  moods: AgentMood[];
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export const AgentMoodList: React.FC<AgentMoodListProps> = ({
  moods,
  size = 'md',
  layout = 'horizontal',
  showLabels = false
}) => {
  return (
    <div className={`
      flex gap-3 
      ${layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
    `}>
      {moods.map((mood) => (
        <AgentMoodIndicator
          key={mood.agentId}
          mood={mood}
          size={size}
          showLabel={showLabels}
          animated={true}
        />
      ))}
    </div>
  );
};