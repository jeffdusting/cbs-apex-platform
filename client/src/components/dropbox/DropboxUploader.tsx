/**
 * Dropbox Folder Upload Component
 * Provides interface for connecting to Dropbox and uploading folder structures
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FolderPlus, Upload, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DropboxAccount {
  accountId: string;
  name: string;
  email: string;
}

interface DropboxItem {
  path: string;
  name: string;
  level: number;
  parentPath: string;
  isFolder: boolean;
  size?: number;
}

interface DropboxStructure {
  structure: any;
  flatStructure: DropboxItem[];
  totalItems: number;
  totalFiles: number;
  totalFolders: number;
}

interface UploadProgress {
  isUploading: boolean;
  currentFile?: string;
  progress: number;
  completed: number;
  total: number;
}

export function DropboxUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<DropboxAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const [selectedPath, setSelectedPath] = useState('');
  const [folderStructure, setFolderStructure] = useState<DropboxStructure | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [browseError, setBrowseError] = useState('');

  const [preserveStructure, setPreserveStructure] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    completed: 0,
    total: 0
  });
  const [uploadResult, setUploadResult] = useState<any>(null);

  const connectToDropbox = async () => {
    if (!accessToken.trim()) {
      setConnectionError('Please enter your Dropbox access token');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      const response = await apiRequest('POST', '/api/dropbox/connect', { accessToken });

      setIsConnected(true);
      const responseData = await response.json();
      setAccount(responseData.account);
    } catch (error) {
      setConnectionError('Failed to connect to Dropbox. Please check your access token.');
    } finally {
      setIsConnecting(false);
    }
  };

  const browseFolders = async (path: string = '') => {
    if (!accessToken) return;

    setIsBrowsing(true);
    setBrowseError('');

    try {
      const response = await apiRequest('POST', '/api/dropbox/browse', { accessToken, path, maxLevel: 3 });
      
      const responseData = await response.json();
      setFolderStructure(responseData);
      setSelectedPath(path);
    } catch (error) {
      setBrowseError('Failed to browse folders. Please try again.');
    } finally {
      setIsBrowsing(false);
    }
  };

  const uploadFolder = async () => {
    if (!accessToken || !selectedPath) return;

    const totalFiles = folderStructure?.totalFiles || 0;
    
    setUploadProgress({
      isUploading: true,
      progress: 0,
      completed: 0,
      total: totalFiles
    });

    try {
      // Simulate progressive upload by making request
      const response = await apiRequest('POST', '/api/dropbox/upload', {
        accessToken,
        folderPath: selectedPath,
        preserveStructure
      });

      const responseData = await response.json();
      setUploadResult(responseData);
      setUploadProgress(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        completed: responseData.documentsCreated
      }));

      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, isUploading: false }));
      setBrowseError(
        error?.message || 'Upload failed. Please check your connection and try again.'
      );
    }
  };

  const disconnect = () => {
    setAccessToken('');
    setIsConnected(false);
    setAccount(null);
    setFolderStructure(null);
    setSelectedPath('');
    setUploadResult(null);
    setConnectionError('');
    setBrowseError('');
  };

  return (
    <div className="space-y-6" data-testid="dropbox-uploader">
      {/* Connection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Connect to Dropbox
          </CardTitle>
          <CardDescription>
            Upload folders from your Dropbox account to the content library with preserved folder structure (up to 3 levels).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="access-token">Dropbox Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Enter your Dropbox access token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  data-testid="input-access-token"
                />
                <div className="text-sm text-muted-foreground">
                  <a 
                    href="https://www.dropbox.com/developers/apps" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get your access token from Dropbox App Console
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              {connectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={connectToDropbox}
                disabled={isConnecting || !accessToken.trim()}
                className="w-full"
                data-testid="button-connect"
              >
                {isConnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Connect to Dropbox
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Connected to Dropbox
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {account?.name} ({account?.email})
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={disconnect} data-testid="button-disconnect">
                  Disconnect
                </Button>
              </div>

              <Button 
                onClick={() => browseFolders()}
                disabled={isBrowsing}
                className="w-full"
                data-testid="button-browse"
              >
                {isBrowsing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Browse Folders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Folder Browser Section */}
      {folderStructure && (
        <Card>
          <CardHeader>
            <CardTitle>Select Folder to Upload</CardTitle>
            <CardDescription>
              Choose a folder to upload. Structure will be preserved up to 3 levels deep.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Folder className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <p className="font-medium">{folderStructure.totalFolders}</p>
                <p className="text-muted-foreground">Folders</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <File className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <p className="font-medium">{folderStructure.totalFiles}</p>
                <p className="text-muted-foreground">Files</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Upload className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                <p className="font-medium">{folderStructure.totalItems}</p>
                <p className="text-muted-foreground">Total Items</p>
              </div>
            </div>

            <FolderStructureView 
              structure={folderStructure.structure}
              onSelectPath={setSelectedPath}
              selectedPath={selectedPath}
            />

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserve-structure"
                  checked={preserveStructure}
                  onCheckedChange={(checked) => setPreserveStructure(checked === true)}
                  data-testid="checkbox-preserve-structure"
                />
                <Label htmlFor="preserve-structure" className="text-sm">
                  Preserve folder structure in content library
                </Label>
              </div>

              {browseError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{browseError}</AlertDescription>
                </Alert>
              )}

              {uploadProgress.isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{uploadProgress.completed} / {uploadProgress.total}</span>
                  </div>
                  <Progress value={uploadProgress.progress} className="h-2" />
                  {uploadProgress.currentFile && (
                    <p className="text-sm text-muted-foreground">
                      Current: {uploadProgress.currentFile}
                    </p>
                  )}
                </div>
              )}

              {uploadResult && (
                <div className="space-y-3">
                  <Alert className={uploadResult.errorsCount > 0 ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" : ""}>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Upload completed! Created {uploadResult.foldersCreated} folders and {uploadResult.documentsCreated} documents.
                      {uploadResult.errorsCount > 0 && ` ${uploadResult.errorsCount} items failed to upload.`}
                    </AlertDescription>
                  </Alert>
                  
                  {uploadResult.errorsCount > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          View {uploadResult.errorsCount} Error{uploadResult.errorsCount > 1 ? 's' : ''}
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {uploadResult.details.errors.map((error: any, index: number) => (
                            <div key={index} className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-200">
                              <div className="font-medium">{error.name || error.path}</div>
                              <div className="text-red-600 dark:text-red-400">{error.error}</div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              <Button 
                onClick={uploadFolder}
                disabled={!selectedPath || uploadProgress.isUploading}
                className="w-full"
                data-testid="button-upload"
              >
                {uploadProgress.isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload Selected Folder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component to display folder structure
function FolderStructureView({ 
  structure, 
  onSelectPath, 
  selectedPath,
  level = 0 
}: {
  structure: any;
  onSelectPath: (path: string) => void;
  selectedPath: string;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels

  if (!structure) return null;

  const isSelected = selectedPath === structure.path;
  const hasChildren = structure.children?.length > 0;
  const hasFiles = structure.files?.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-primary/10 border border-primary/20' 
            : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectPath(structure.path)}
        data-testid={`folder-item-${structure.name}`}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5"
          >
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        
        <Folder className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">{structure.name || 'Root'}</span>
        
        <div className="flex gap-1 ml-auto">
          {hasChildren && (
            <Badge variant="secondary" className="text-xs">
              {structure.children.length} folders
            </Badge>
          )}
          {hasFiles && (
            <Badge variant="outline" className="text-xs">
              {structure.files.length} files
            </Badge>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div>
          {structure.children.map((child: any, index: number) => (
            <FolderStructureView
              key={`${child.path}-${index}`}
              structure={child}
              onSelectPath={onSelectPath}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}