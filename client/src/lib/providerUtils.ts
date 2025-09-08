import React from "react";
import { SiOpenai, SiGoogle } from "react-icons/si";
import { Bot, Sparkles, Wind } from "lucide-react";
import { FaRobot } from "react-icons/fa";

// Provider icon mapping with React Icons
export const getProviderIcon = (iconType: string, className: string = "text-white text-lg") => {
  switch (iconType) {
    case "openai":
      return SiOpenai;
    case "anthropic":
      return Bot;
    case "google":
      return SiGoogle;
    case "mistral":
      return Wind;
    case "xai":
      return Sparkles;
    default:
      return FaRobot;
  }
};

// Provider color mapping for consistent Tailwind classes
export const getProviderColorClasses = (color: string) => {
  switch (color) {
    case "emerald":
      return { 
        bg: "bg-emerald-500", 
        hover: "hover:bg-emerald-600",
        border: "border-emerald-500",
        text: "text-emerald-600" 
      };
    case "amber":
      return { 
        bg: "bg-amber-500", 
        hover: "hover:bg-amber-600",
        border: "border-amber-500",
        text: "text-amber-600" 
      };
    case "blue":
      return { 
        bg: "bg-blue-500", 
        hover: "hover:bg-blue-600",
        border: "border-blue-500",
        text: "text-blue-600" 
      };
    case "orange":
      return { 
        bg: "bg-orange-500", 
        hover: "hover:bg-orange-600",
        border: "border-orange-500",
        text: "text-orange-600" 
      };
    case "slate":
      return { 
        bg: "bg-slate-700", 
        hover: "hover:bg-slate-800",
        border: "border-slate-700",
        text: "text-slate-600" 
      };
    default:
      return { 
        bg: "bg-gray-500", 
        hover: "hover:bg-gray-600",
        border: "border-gray-500",
        text: "text-gray-600" 
      };
  }
};

// Provider status utilities
export const getProviderStatus = (provider: any) => {
  if (!provider.isEnabled) return { status: "disabled", color: "text-red-500" };
  if (provider.quotaUsed >= 90) return { status: "quota-high", color: "text-orange-500" };
  if (provider.quotaUsed >= 75) return { status: "quota-medium", color: "text-yellow-500" };
  return { status: "active", color: "text-green-500" };
};

// Render provider icon component
export const ProviderIcon: React.FC<{ 
  provider: any; 
  className?: string; 
}> = ({ 
  provider, 
  className = "text-white text-lg" 
}) => {
  const IconComponent = getProviderIcon(provider.icon || "default");
  return React.createElement(IconComponent, { className });
};

// Get provider card classes
export const getProviderCardClasses = (provider: any, isSelected: boolean, className: string = "") => {
  const colors = getProviderColorClasses(provider.color || "gray");
  
  return `
    border-2 rounded-lg p-4 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-lg
    ${isSelected ? `selected ${colors.border} bg-primary/5` : 'border-border'}
    ${!provider.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();
};