import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import { apiRequest } from "@/lib/queryClient";
import ConversationThread from "@/components/ConversationThread";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import type { Folder } from "@shared/schema";

interface ContextPanelProps {
  selectedFolders: string[];
  onSelectionChange: (folders: string[]) => void;
  conversationId: string | null;
}

export default function ContextPanel({ 
  selectedFolders, 
  onSelectionChange,
  conversationId 
}: ContextPanelProps) {
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const { data: documents = [], uploadDocument } = useDocuments();

  const getFolderDocumentCount = (folderId: string) => {
    return documents.filter(doc => doc.folderId === folderId).length;
  };

  const getTotalDocumentCount = () => {
    return selectedFolders.reduce((total, folderId) => {
      return total + getFolderDocumentCount(folderId);
    }, 0);
  };

  const handleFileUpload = async (files: FileList | null, folderId: string) => {
    if (!files) return;
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', folderId);
        await uploadDocument.mutateAsync(formData);
        queryClient.invalidateQueries({ queryKey: ["/api/documents/"] });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="h-full flex flex-col" data-testid="document-library">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Context Selection</h3>
          <Link href="/document-library">
            <Button size="sm" variant="outline" data-testid="button-manage-documents">
              <i className="fas fa-folder-open w-3 h-3 mr-2"></i>
              Manage Documents
            </Button>
          </Link>
        </div>

        {selectedFolders.length > 0 ? (
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Context</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={clearSelection}
                data-testid="button-clear-selection"
              >
                <i className="fas fa-times w-3 h-3"></i>
              </Button>
            </div>
            <div className="space-y-2">
              {selectedFolders.map(folderId => {
                const folder = folders.find(f => f.id === folderId);
                if (!folder) return null;
                
                return (
                  <div 
                    key={folderId}
                    className="flex items-center gap-2 p-2 bg-muted rounded"
                    data-testid={`selected-folder-${folderId}`}
                  >
                    <i className="fas fa-folder text-blue-600 text-sm"></i>
                    <span className="flex-1 text-sm font-medium">{folder.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getFolderDocumentCount(folderId)} docs
                    </Badge>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2 border-t border-border text-center">
              <span className="text-xs text-muted-foreground">
                Total: {getTotalDocumentCount()} document{getTotalDocumentCount() !== 1 ? 's' : ''} selected for context
              </span>
            </div>
          </Card>
        ) : (
          <div className="p-4 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <i className="fas fa-folder-plus text-2xl text-muted-foreground mb-2"></i>
            <p className="text-sm text-muted-foreground mb-2">No context selected</p>
            <Link href="/document-library">
              <Button size="sm" data-testid="button-select-context">
                Select Folders for Context
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold mb-3">Quick Upload</h3>
        <div className="space-y-3">
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files, 'general')}
            className="hidden"
            id="quick-upload"
          />
          <label
            htmlFor="quick-upload"
            className="flex items-center justify-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors"
            data-testid="quick-upload-area"
          >
            <i className="fas fa-cloud-upload-alt"></i>
            <span>Upload to General folder</span>
          </label>
          <p className="text-xs text-muted-foreground text-center">
            Files will be uploaded to the General folder. Use Document Library for advanced organization.
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3">Conversation Thread</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ConversationThread conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}