import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useFolders } from "@/hooks/useFolders";
import { apiRequest } from "@/lib/queryClient";
import type { Folder, Document } from "@shared/schema";
import { DropboxUploader } from "@/components/dropbox/DropboxUploader";

export default function DocumentLibrary() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("library");
  
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents/"],
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return apiRequest('POST', '/api/folders', data);
    },
    onSuccess: async (newFolder: any) => {
      // Force refetch of folders data
      await queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      await queryClient.refetchQueries({ queryKey: ["/api/folders"] });
      // Auto-expand the newly created folder and select it
      if (newFolder?.id) {
        setExpandedFolders(prev => [...prev, newFolder.id]);
        setSelectedFolder(newFolder.id);
      }
      setNewFolderName("");
      setNewFolderDescription("");
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; description?: string }) => {
      return apiRequest('PUT', `/api/folders/${id}`, data);
    },
    onSuccess: async () => {
      // Force refetch of folders data
      await queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      await queryClient.refetchQueries({ queryKey: ["/api/folders"] });
      setEditingFolder(null);
      toast({
        title: "Success",
        description: "Folder updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/folders/${id}`);
    },
    onSuccess: async (data, variables) => {
      // Force refetch of folders data
      await queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      await queryClient.refetchQueries({ queryKey: ["/api/folders"] });
      if (selectedFolder === variables) {
        setSelectedFolder(null);
      }
      toast({
        title: "Success",
        description: "Folder deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  });

  const moveDocumentMutation = useMutation({
    mutationFn: async ({ documentId, folderId }: { documentId: string; folderId: string }) => {
      return apiRequest('PUT', `/api/documents/${documentId}`, { folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/"] });
      toast({
        title: "Success",
        description: "Document moved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to move document",
        variant: "destructive"
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents/"] });
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const getFolderDocuments = (folderId: string) => {
    return documents.filter(doc => doc.folderId === folderId);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined
      });
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolder && editingFolder.name.trim()) {
      updateFolderMutation.mutate({
        id: editingFolder.id,
        name: editingFolder.name.trim(),
        description: editingFolder.description?.trim() || undefined
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderDocs = getFolderDocuments(folderId);
    if (folderDocs.length > 0) {
      toast({
        title: "Cannot delete folder",
        description: `This folder contains ${folderDocs.length} document(s). Move or delete them first.`,
        variant: "destructive"
      });
      return;
    }
    
    if (folderId === 'general') {
      toast({
        title: "Cannot delete folder",
        description: "The General folder cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    deleteFolderMutation.mutate(folderId);
  };

  const handleDragStart = (e: React.DragEvent, documentId: string) => {
    e.dataTransfer.setData('text/plain', documentId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDraggedOver(folderId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDraggedOver(null);
    
    // Handle file drops from external sources
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, folderId);
      return;
    }
    
    // Handle moving existing documents
    const documentId = e.dataTransfer.getData('text/plain');
    const document = documents.find(doc => doc.id === documentId);
    if (document && document.folderId !== folderId) {
      moveDocumentMutation.mutate({ documentId, folderId });
    }
  };

  const handleFileUpload = async (files: FileList | null, folderId: string) => {
    if (!files) return;
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);
      
      try {
        console.log('Uploading file:', file.name, 'to folder:', folderId);
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        queryClient.invalidateQueries({ queryKey: ["/api/documents/"] });
        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleDropboxUploadComplete = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/documents/"] });
    await queryClient.refetchQueries({ queryKey: ["/api/folders"] });
    await queryClient.refetchQueries({ queryKey: ["/api/documents/"] });
    setActiveTab("library"); // Switch back to library view
    toast({
      title: "Success",
      description: "Dropbox folder upload completed successfully"
    });
  };

  return (
    <div className="h-screen flex flex-col p-6" data-testid="document-library">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Document Library</h1>
        <p className="text-muted-foreground mt-1">Organize and manage your document collection</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="library" data-testid="tab-library">Document Library</TabsTrigger>
          <TabsTrigger value="dropbox" data-testid="tab-dropbox">Dropbox Import</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="flex-1 flex gap-6 m-0">
          <div className="flex-1 flex gap-6">
        {/* Folders Panel */}
        <div className="w-80 flex flex-col">
          <Card className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Folders</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-create-folder">
                    <i className="fas fa-plus w-4 h-4 mr-2"></i>
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      data-testid="input-folder-name"
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      data-testid="input-folder-description"
                    />
                    <Button 
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || createFolderMutation.isPending}
                      data-testid="button-confirm-create"
                    >
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-96">
              {foldersLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded animate-pulse">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <div className="flex-1 h-4 bg-muted rounded"></div>
                  </div>
                ))
              ) : (
                folders.map((folder: Folder) => (
                  <div 
                    key={folder.id}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedFolder === folder.id 
                        ? 'bg-primary/10 border-primary/20' 
                        : draggedOver === folder.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => setSelectedFolder(folder.id)}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                    data-testid={`folder-${folder.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <i 
                        className={`fas ${expandedFolders.includes(folder.id) ? 'fa-chevron-down' : 'fa-chevron-right'} text-xs text-muted-foreground cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolderExpansion(folder.id);
                        }}
                      ></i>
                      <i className="fas fa-folder text-blue-600"></i>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{folder.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getFolderDocuments(folder.id).length}
                          </Badge>
                        </div>
                        {folder.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {folder.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFolder(folder);
                              }}
                              data-testid={`button-edit-folder-${folder.id}`}
                            >
                              <i className="fas fa-edit w-3 h-3"></i>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Folder</DialogTitle>
                            </DialogHeader>
                            {editingFolder && (
                              <div className="space-y-4">
                                <Input
                                  placeholder="Folder name"
                                  value={editingFolder.name}
                                  onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
                                  data-testid="input-edit-folder-name"
                                />
                                <Textarea
                                  placeholder="Description (optional)"
                                  value={editingFolder.description || ""}
                                  onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})}
                                  data-testid="input-edit-folder-description"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={handleUpdateFolder}
                                    disabled={!editingFolder.name.trim() || updateFolderMutation.isPending}
                                    data-testid="button-confirm-edit"
                                  >
                                    Update
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleDeleteFolder(editingFolder.id)}
                                    disabled={deleteFolderMutation.isPending}
                                    data-testid="button-delete-folder"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {expandedFolders.includes(folder.id) && (
                      <div className="mt-3 ml-6 space-y-1">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files, folder.id)}
                          className="hidden"
                          id={`upload-${folder.id}`}
                        />
                        <label
                          htmlFor={`upload-${folder.id}`}
                          className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors"
                          data-testid={`upload-area-${folder.id}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files.length > 0) {
                              handleFileUpload(e.dataTransfer.files, folder.id);
                            }
                          }}
                        >
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Drop files here or click to upload</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Documents Panel */}
        <div className="flex-1">
          <Card className="h-full p-4">
            <div className="mb-4">
              <h2 className="font-semibold">
                {selectedFolder 
                  ? `Documents in "${folders.find(f => f.id === selectedFolder)?.name}"`
                  : "Select a folder to view documents"
                }
              </h2>
            </div>

            {selectedFolder ? (
              <div className="space-y-2 overflow-y-auto max-h-[calc(100%-4rem)]">
                {getFolderDocuments(selectedFolder).map((doc) => (
                  <div
                    key={doc.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, doc.id)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors cursor-move"
                    data-testid={`document-${doc.id}`}
                  >
                    <i className="fas fa-file text-gray-500"></i>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {doc.type} • {((doc.size || 0) / 1024).toFixed(1)}KB
                        {doc.uploadedAt && (
                          <span> • {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocumentMutation.mutate(doc.id)}
                      disabled={deleteDocumentMutation.isPending}
                      data-testid={`button-delete-document-${doc.id}`}
                    >
                      <i className="fas fa-trash w-3 h-3"></i>
                    </Button>
                  </div>
                ))}
                
                {getFolderDocuments(selectedFolder).length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <i className="fas fa-folder-open text-4xl mb-4"></i>
                    <p>This folder is empty</p>
                    <p className="text-sm mt-1">Upload files or drag documents here</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <i className="fas fa-folder text-4xl mb-4"></i>
                  <p>Select a folder from the left to view its documents</p>
                </div>
              </div>
            )}
          </Card>
        </div>
          </div>
        </TabsContent>

        <TabsContent value="dropbox" className="flex-1 m-0">
          <DropboxUploader onUploadComplete={handleDropboxUploadComplete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}