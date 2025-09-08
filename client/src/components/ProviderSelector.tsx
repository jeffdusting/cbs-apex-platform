import { useQuery } from "@tanstack/react-query";
import { useProviders } from "@/hooks/useProviders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ProviderGridSkeleton } from "@/components/LoadingSkeletons";
import { getProviderColorClasses, getProviderCardClasses, ProviderIcon } from "@/lib/providerUtils";

// Provider utilities are now imported from shared lib

interface ProviderSelectorProps {
  selectedProviders: string[];
  onSelectionChange: (providers: string[]) => void;
}

interface ProviderSettings {
  [providerId: string]: {
    selectedModel: string;
  };
}

export default function ProviderSelector({ selectedProviders, onSelectionChange }: ProviderSelectorProps) {
  const { data: providers = [], isLoading } = useProviders();
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>({});

  const toggleProvider = (providerId: string) => {
    if (selectedProviders.includes(providerId)) {
      onSelectionChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onSelectionChange([...selectedProviders, providerId]);
    }
  };

  const handleModelChange = (providerId: string, model: string) => {
    setProviderSettings(prev => ({
      ...prev,
      [providerId]: { selectedModel: model }
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 border-b border-border">
        <h3 className="text-sm font-semibold mb-4">Select LLM Providers</h3>
        <ProviderGridSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 border-b border-border" data-testid="provider-selector">
      <h3 className="text-sm font-semibold mb-4">Select LLM Providers</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {providers.map((provider) => (
          <div 
            key={provider.id}
            onClick={() => toggleProvider(provider.id)}
            className={`provider-card border-2 border-border rounded-lg p-3 lg:p-4 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-lg ${
              selectedProviders.includes(provider.id) ? 'selected border-primary bg-primary/5' : ''
            } ${!provider.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            data-testid={`provider-${provider.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-full ${getProviderColorClasses(provider.color || "gray").bg} ${getProviderColorClasses(provider.color || "gray").hover} flex items-center justify-center flex-shrink-0 transition-colors`}>
                  <ProviderIcon provider={provider} className="text-white text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm lg:text-base truncate">{provider.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{provider.model}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">${provider.costPer1kTokens}</div>
                <div className="text-xs text-muted-foreground">per 1K tokens</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full" 
                    style={{ width: `${provider.quotaUsed}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{provider.quotaUsed}% quota</span>
              </div>
              
              {selectedProviders.includes(provider.id) && provider.availableModels && provider.availableModels.length > 1 && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <Select 
                    value={providerSettings[provider.id]?.selectedModel || provider.model}
                    onValueChange={(value) => handleModelChange(provider.id, value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
