/**
 * Dropbox Integration Service
 * Handles Dropbox API authentication, folder listing, and file downloads
 */

import { Dropbox } from 'dropbox';

export interface DropboxFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
  parentPath: string;
}

export interface DropboxFolder {
  id: string;
  name: string;
  path: string;
  parentPath: string;
  level: number;
  children: DropboxFolder[];
  files: DropboxFile[];
}

export class DropboxService {
  private dbx: Dropbox;

  constructor(accessToken: string) {
    this.dbx = new Dropbox({ 
      accessToken,
      fetch: fetch
    });
  }

  /**
   * Get user's Dropbox account info
   */
  async getAccountInfo() {
    try {
      const response = await this.dbx.usersGetCurrentAccount();
      return {
        accountId: response.result.account_id,
        name: response.result.name.display_name,
        email: response.result.email
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to get account info: ${message}`);
    }
  }

  /**
   * List folders and files at a specific path with support for up to 3 levels
   */
  async listFolderContents(path: string = '', maxLevel: number = 3, currentLevel: number = 0): Promise<DropboxFolder> {
    if (currentLevel >= maxLevel) {
      return {
        id: path,
        name: this.getNameFromPath(path),
        path,
        parentPath: this.getParentPath(path),
        level: currentLevel,
        children: [],
        files: []
      };
    }

    try {
      const response = await this.dbx.filesListFolder({
        path: path || '',
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false
      });

      const folder: DropboxFolder = {
        id: path,
        name: this.getNameFromPath(path) || 'Root',
        path,
        parentPath: this.getParentPath(path),
        level: currentLevel,
        children: [],
        files: []
      };

      // Process entries
      for (const entry of response.result.entries) {
        if (entry['.tag'] === 'folder') {
          // Only process subfolders if we haven't reached max level
          if (currentLevel < maxLevel - 1) {
            const subFolder = await this.listFolderContents(
              entry.path_lower || entry.path_display,
              maxLevel,
              currentLevel + 1
            );
            folder.children.push(subFolder);
          } else {
            // Add folder reference without contents
            folder.children.push({
              id: entry.path_lower || entry.path_display || '',
              name: entry.name || 'Untitled Folder',
              path: entry.path_lower || entry.path_display || '',
              parentPath: path,
              level: currentLevel + 1,
              children: [],
              files: []
            });
          }
        } else if (entry['.tag'] === 'file') {
          // Only include supported file types
          if (this.isSupportedFileType(entry.name)) {
            folder.files.push({
              id: entry.path_lower || entry.path_display || '',
              name: entry.name || 'Untitled File',
              path: entry.path_lower || entry.path_display || '',
              type: 'file',
              size: entry.size,
              modified: new Date(entry.server_modified),
              parentPath: path
            });
          }
        }
      }

      return folder;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to list folder contents: ${message}`);
    }
  }

  /**
   * Download file content from Dropbox
   */
  async downloadFile(filePath: string): Promise<{ content: string; metadata: any }> {
    try {
      const response = await this.dbx.filesDownload({ path: filePath });
      
      // Convert ArrayBuffer to string
      const fileBlob = (response.result as any).fileBinary;
      const content = await this.convertBlobToText(fileBlob);
      
      return {
        content,
        metadata: {
          name: (response.result as any).name,
          size: (response.result as any).size,
          modified: (response.result as any).server_modified,
          path: filePath
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to download file: ${message}`);
    }
  }

  /**
   * Get folder structure as a flattened list for easier processing
   */
  getFlattenedFolderStructure(folder: DropboxFolder): Array<{
    path: string;
    name: string;
    level: number;
    parentPath: string;
    isFolder: boolean;
    size?: number;
  }> {
    const items: any[] = [];

    // Add current folder if not root
    if (folder.path !== '') {
      items.push({
        path: folder.path,
        name: folder.name,
        level: folder.level,
        parentPath: folder.parentPath,
        isFolder: true
      });
    }

    // Add files in current folder
    folder.files.forEach(file => {
      items.push({
        path: file.path,
        name: file.name,
        level: folder.level + 1,
        parentPath: folder.path,
        isFolder: false,
        size: file.size
      });
    });

    // Recursively add children
    folder.children.forEach(child => {
      items.push(...this.getFlattenedFolderStructure(child));
    });

    return items;
  }

  /**
   * Validate folder structure doesn't exceed 3 levels
   */
  validateFolderStructure(folder: DropboxFolder): { valid: boolean; message?: string } {
    const maxLevel = this.getMaxLevel(folder);
    
    if (maxLevel > 3) {
      return {
        valid: false,
        message: `Folder structure has ${maxLevel} levels. Maximum supported is 3 levels.`
      };
    }

    return { valid: true };
  }

  /**
   * Helper methods
   */
  private getNameFromPath(path: string): string {
    if (!path || path === '/') return '';
    return path.split('/').pop() || '';
  }

  private getParentPath(path: string): string {
    if (!path || path === '/') return '';
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '';
  }

  private getMaxLevel(folder: DropboxFolder): number {
    let maxLevel = folder.level;
    
    folder.children.forEach(child => {
      const childMaxLevel = this.getMaxLevel(child);
      if (childMaxLevel > maxLevel) {
        maxLevel = childMaxLevel;
      }
    });

    return maxLevel;
  }

  private isSupportedFileType(filename: string): boolean {
    const supportedExtensions = [
      '.txt', '.md', '.doc', '.docx', '.pdf', '.rtf',
      '.csv', '.json', '.xml', '.html', '.htm'
    ];
    
    const extension = filename.toLowerCase().substr(filename.lastIndexOf('.'));
    return supportedExtensions.includes(extension);
  }

  private async convertBlobToText(blob: any): Promise<string> {
    if (blob instanceof ArrayBuffer) {
      return new TextDecoder().decode(blob);
    }
    
    if (blob.text) {
      return await blob.text();
    }
    
    if (blob.arrayBuffer) {
      const buffer = await blob.arrayBuffer();
      return new TextDecoder().decode(buffer);
    }
    
    // Fallback: try to convert to string
    return blob.toString();
  }
}