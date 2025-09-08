import React, { useState } from "react";
import { 
  File, 
  Folder, 
  Star, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share2, 
  Edit3, 
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Presentation,
  Sheet,
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCrazyMode } from "./CrazyModeProvider";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";

interface FileGridProps {
  viewMode: "grid" | "list";
  searchQuery: string;
  currentPath: string[];
  currentFolderId?: string;
  isSharedDrives?: boolean;
  isRecent?: boolean;
  isTrash?: boolean;
  onFolderNavigate?: (folderId: string, folderName: string) => void;
}

const getFileIcon = (document: Document) => {
  if (document.is_folder) return Folder;
  
  switch (document.type) {
    case 'document':
      return FileText;
    case 'spreadsheet':
      return Sheet;
    case 'presentation':
      return Presentation;
    case 'folder':
      return Folder;
    default:
      if (document.mime_type?.startsWith('image/')) return Image;
      if (document.mime_type?.startsWith('video/')) return Video;
      if (document.mime_type?.startsWith('audio/')) return Music;
      if (document.mime_type?.includes('zip') || document.mime_type?.includes('archive')) return Archive;
      return File;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const isFileOld = (document: Document): boolean => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return new Date(document.created_at) < oneDayAgo;
};

export function FileGrid({ 
  viewMode, 
  searchQuery, 
  currentPath, 
  currentFolderId, 
  isSharedDrives = false, 
  isRecent = false, 
  isTrash = false,
  onFolderNavigate 
}: FileGridProps) {
  const { documents, loading, deleteDocument, downloadFile, createDocument } = useDocuments(currentFolderId, isTrash);
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [showNoFlash, setShowNoFlash] = useState(false);
  const [showLaugh, setShowLaugh] = useState(false);
  const [showCoworkerForm, setShowCoworkerForm] = useState(false);
  const [coworkerEmails, setCoworkerEmails] = useState<string>("");
  const [renameDocument, setRenameDocument] = useState<Document | null>(null);
  const [newName, setNewName] = useState("");
  const [showAddToFolder, setShowAddToFolder] = useState<Document | null>(null);
  const [allFolders, setAllFolders] = useState<Document[]>([]);
  const navigate = useNavigate();
  const { crazyMode } = useCrazyMode();
  const { user } = useAuth();

  // Filter documents based on the current view
  const displayDocuments = isSharedDrives ? [] : 
    isRecent ? [...documents].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) : 
    isTrash ? documents.filter(doc => doc.deleted === true) :
    documents;

  const filteredDocuments = displayDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isThirdFile = (index: number): boolean => {
    return (index + 1) % 3 === 0;
  };

  const handleDocumentClick = (document: Document) => {
    if (document.is_folder) {
      onFolderNavigate?.(document.id, document.name);
      return;
    }
    
    if (document.type === 'spreadsheet') {
      navigate(`/spreadsheet/${document.id}`);
    } else if (document.type === 'document') {
      navigate(`/document/${document.id}`);
    }
  };

  const handleDownload = async (document: Document) => {
    if (document.file_path) {
      await downloadFile(document);
    }
  };

  const handleDelete = async (document: Document) => {
    if (crazyMode) {
      // In crazy mode, flash "NO" and duplicate the file instead
      setShowNoFlash(true);
      setTimeout(() => setShowNoFlash(false), 1000);
      
      // Duplicate the file 4 times with all properties
      for (let i = 1; i <= 4; i++) {
        try {
          const { error } = await supabase
            .from('documents')
            .insert([
              {
                user_id: user?.id,
                name: `${document.name} (${i})`,
                type: document.type,
                content: document.content,
                parent_folder_id: document.parent_folder_id,
                file_path: document.file_path,
                file_size: document.file_size,
                mime_type: document.mime_type,
                is_folder: document.is_folder,
              },
            ]);
          
          if (error) throw error;
        } catch (error: any) {
          console.error(`Failed to duplicate file ${i}:`, error);
        }
      }
      
      // Refresh the documents list to show duplicates
      window.dispatchEvent(new Event('documents:refresh'));
      toast.success("File emphasized by duplication!");
      return;
    }
    
    if (isTrash) {
      // In trash, permanently delete the file
      if (confirm(`Are you sure you want to permanently delete "${document.name}"? This action cannot be undone.`)) {
        await deleteDocument(document.id);
        toast.success("File permanently deleted!");
      }
    } else {
      // In normal mode, move to trash (soft delete)
      if (confirm(`Are you sure you want to move "${document.name}" to trash?`)) {
        try {
          const { error } = await supabase
            .from('documents')
            .update({ deleted: true })
            .eq('id', document.id);
          
          if (error) throw error;
          
          // Refresh the documents list
          window.dispatchEvent(new Event('documents:refresh'));
          toast.success("File moved to trash!");
        } catch (error: any) {
          console.error('Failed to move file to trash:', error);
          toast.error('Failed to move file to trash');
        }
      }
    }
  };

  const handleRestore = async (document: Document) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ deleted: false })
        .eq('id', document.id);
      
      if (error) throw error;
      
      // Refresh the documents list
      window.dispatchEvent(new Event('documents:refresh'));
      toast.success("File restored successfully!");
    } catch (error: any) {
      console.error('Failed to restore file:', error);
      toast.error('Failed to restore file');
    }
  };

  const handleRecoverFile = async (document: Document) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Restore original content and created_at if they exist
      if (document.original_content !== null) {
        updateData.content = document.original_content;
        updateData.original_content = null;
      }
      if (document.original_created_at) {
        updateData.created_at = document.original_created_at;
        updateData.original_created_at = null;
      }
      
      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', document.id);
      
      if (error) throw error;
      
      toast.success("File recovered successfully!");
      // Refresh the documents list
      window.dispatchEvent(new Event('documents:refresh'));
    } catch (error: any) {
      toast.error(`Failed to recover file: ${error.message}`);
    }
  };

  const handleKillFile = async (document: Document) => {
    try {
      // Set the created_at to 2 days ago to make it appear old
      // Store original state for recovery
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const { error } = await supabase
        .from('documents')
        .update({ 
          created_at: twoDaysAgo.toISOString(),
          original_content: document.content,
          original_created_at: document.created_at
        })
        .eq('id', document.id);
      
      if (error) throw error;
      
      toast.success("File killed successfully!");
      // Refresh the documents list
      window.dispatchEvent(new Event('documents:refresh'));
    } catch (error: any) {
      toast.error(`Failed to kill file: ${error.message}`);
    }
  };

  const handleRename = async (document: Document) => {
    setRenameDocument(document);
    setNewName(document.name);
  };

  const handleRenameSubmit = async () => {
    if (!renameDocument || !newName.trim()) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ name: newName.trim() })
        .eq('id', renameDocument.id);

      if (error) throw error;

      // Refresh the documents list
      window.dispatchEvent(new Event('documents:refresh'));
      toast.success("File renamed successfully!");
      setRenameDocument(null);
      setNewName("");
    } catch (error: any) {
      toast.error(`Failed to rename file: ${error.message}`);
    }
  };

  const handleShare = async (document: Document) => {
    try {
      let shareUrl = "";
      
      if (document.file_path) {
        // For files with storage path, get the public URL
        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(document.file_path);
        shareUrl = data.publicUrl;
      } else if (document.type === 'document') {
        // For Google Docs-like documents, create a share link to the editor
        shareUrl = `${window.location.origin}/document/${document.id}`;
      } else if (document.type === 'spreadsheet') {
        // For spreadsheets, create a share link to the editor
        shareUrl = `${window.location.origin}/spreadsheet/${document.id}`;
      } else {
        // For other document types, create a generic share link
        shareUrl = `${window.location.origin}/my-drive?file=${document.id}`;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error: any) {
      toast.error("Failed to copy link to clipboard");
    }
  };

  // Load all folders for the "Add to folder" dropdown
  React.useEffect(() => {
    const loadFolders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_folder', true)
          .eq('deleted', false)
          .order('name');
        
        if (error) throw error;
        setAllFolders(data || []);
      } catch (error: any) {
        console.error('Failed to load folders:', error);
      }
    };

    loadFolders();
  }, [user, documents]);

  const handleAddToFolder = async (document: Document, targetFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ parent_folder_id: targetFolderId })
        .eq('id', document.id);

      if (error) throw error;

      // Refresh the documents list
      window.dispatchEvent(new Event('documents:refresh'));
      toast.success(targetFolderId ? "File moved to folder!" : "File moved to root!");
      setShowAddToFolder(null);
    } catch (error: any) {
      toast.error(`Failed to move file: ${error.message}`);
    }
  };


  const handleFileClick = async (document: Document, index?: number) => {
    if (document.is_folder) {
      onFolderNavigate?.(document.id, document.name);
      return;
    }
    
    // Check if it's every third file in crazy mode
    if (crazyMode && typeof index === 'number' && isThirdFile(index)) {
      // Show laugh first
      setShowLaugh(true);
      setTimeout(() => {
        setShowLaugh(false);
        setShowCoworkerForm(true);
      }, 2000);
      return;
    }
    
    // If it's a document type (Google Docs-like), handle crazy mode or navigate to editor
    if (document.type === 'document' || document.type === 'spreadsheet' || document.type === 'presentation') {
      if (crazyMode) {
        try {
          toast.info("Processing document in crazy mode...");
          
          // Call Toolhouse API
          const response = await fetch('https://agents.toolhouse.ai/9ee728c8-2841-4f6c-ab71-e0704c093395', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: document.content || `Transform this document: ${document.name}`
            }),
          });
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }
          
          // Save the run ID from headers
          const toolhouseRunId = response.headers.get('X-Toolhouse-Run-ID');
          if (toolhouseRunId) {
            setRunId(toolhouseRunId);
          }
          
          const result = await response.text();
          
          // Update the document content with the API response
          const { error } = await supabase
            .from('documents')
            .update({ content: result })
            .eq('id', document.id);
          
          if (error) {
            throw error;
          }
          
          toast.success("Document transformed in crazy mode!");
          
          // Navigate to the editor to show the updated content
          navigate(`/document/${document.id}`);
        } catch (error: any) {
          console.error('Crazy mode transformation failed:', error);
          toast.error(`Failed to transform document: ${error.message}`);
          // Fall back to normal navigation
          navigate(`/document/${document.id}`);
        }
      } else {
        navigate(`/document/${document.id}`);
      }
      return;
    }
    
    // For other file types, show the preview modal
    setSelectedFile(document);
    
    if (document.file_path) {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);
      
      setFileUrl(data.publicUrl);
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    setFileUrl(null);
  };

  const FilePreview = ({ document }: { document: Document }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
      if (document.file_path && document.mime_type?.startsWith('image/')) {
        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(document.file_path);
        
        setPreviewUrl(data.publicUrl);
      }
    }, [document]);

    // Show gravestone for old files in crazy mode
    if (crazyMode && isFileOld(document)) {
      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          <img 
            src="/lovable-uploads/4337bb78-33e7-4f77-ba89-e9dcd82eff5d.png" 
            alt="Dead file"
            className="w-12 h-12 object-contain"
          />
        </div>
      );
    }

    // Spreadsheet type preview - render actual grid data
    if (document.type === 'spreadsheet') {
      const spreadsheetData = document.spreadsheet_data as any || {};
      const hasData = Object.keys(spreadsheetData).length > 0;
      
      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-white border border-gray-200 shadow-sm">
          {hasData ? (
            <div className="w-full h-full relative">
              {/* Mini spreadsheet grid - 8x8 */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0">
                {Array.from({ length: 64 }, (_, i) => {
                  const row = Math.floor(i / 8) + 1;
                  const col = String.fromCharCode(65 + (i % 8)); // A-H
                  const cellId = `${col}${row}`;
                  const cellValue = spreadsheetData[cellId];
                  
                  return (
                    <div
                      key={cellId}
                      className="border-r border-b border-gray-300 text-[0.5px] leading-none overflow-hidden bg-white flex items-center justify-center"
                      style={{ 
                        fontSize: '0.5px',
                        minHeight: '0.125rem',
                        padding: '0.5px'
                      }}
                    >
                      {cellValue ? (
                        <span className="text-gray-700 font-mono text-center block w-full truncate">
                          {String(cellValue).substring(0, 2)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {/* Column headers A-H */}
              <div className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 grid grid-cols-8" style={{ height: '0.125rem' }}>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(col => (
                  <div 
                    key={col} 
                    className="text-[0.4px] text-center text-gray-500 border-r border-gray-300 flex items-center justify-center"
                    style={{ fontSize: '0.4px', lineHeight: 1 }}
                  >
                    {col}
                  </div>
                ))}
              </div>
              {/* Row numbers 1-8 */}
              <div className="absolute left-0 bottom-0 bg-gray-100 border-r border-gray-300 grid grid-rows-8" style={{ width: '0.125rem', top: '0.125rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <div 
                    key={num} 
                    className="text-[0.4px] text-center text-gray-500 border-b border-gray-300 flex items-center justify-center"
                    style={{ fontSize: '0.4px', lineHeight: 1 }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Empty spreadsheet grid - 8x8
            <div className="w-full h-full relative bg-white">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0">
                {Array.from({ length: 64 }, (_, i) => (
                  <div
                    key={i}
                    className="border-r border-b border-gray-300 bg-white"
                    style={{ minHeight: '0.125rem' }}
                  />
                ))}
              </div>
              <div className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 grid grid-cols-8" style={{ height: '0.125rem' }}>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(col => (
                  <div 
                    key={col} 
                    className="text-[0.4px] text-center text-gray-500 border-r border-gray-300 flex items-center justify-center"
                    style={{ fontSize: '0.4px', lineHeight: 1 }}
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="absolute left-0 bottom-0 bg-gray-100 border-r border-gray-300 grid grid-rows-8" style={{ width: '0.125rem', top: '0.125rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <div 
                    key={num} 
                    className="text-[0.4px] text-center text-gray-500 border-b border-gray-300 flex items-center justify-center"
                    style={{ fontSize: '0.4px', lineHeight: 1 }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Document type preview - render actual content
    if (document.type === 'document' || document.type === 'presentation') {
      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-white border border-gray-200 shadow-sm">
          <div className="w-full h-full p-1 text-[2px] leading-tight overflow-hidden">
            {document.content && document.content.trim() ? (
              <div className="text-gray-800 whitespace-pre-wrap break-words">
                {document.content.substring(0, 200)}
              </div>
            ) : (
              // Blank page for empty documents
              <div className="w-full h-full bg-white"></div>
            )}
          </div>
        </div>
      );
    }

    // Image preview
    if (document.mime_type?.startsWith('image/') && previewUrl) {
      return (
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
          <img 
            src={previewUrl} 
            alt={document.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      );
    }

    // Fallback to icon for other file types
    const IconComponent = getFileIcon(document);
    return (
      <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center">
        <IconComponent className="w-8 h-8 text-blue-600" />
      </div>
    );
  };

  const FileIcon = ({ document }: { document: Document }) => {
    const IconComponent = getFileIcon(document);
    return <IconComponent className="w-6 h-6 text-blue-600" />;
  };

  const FileActions = ({ document }: { document: Document }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isTrash && (
          <DropdownMenuItem onClick={() => handleRestore(document)} className="text-green-600">
            <Star className="w-4 h-4 mr-2" />
            Restore
          </DropdownMenuItem>
        )}
        {crazyMode && isFileOld(document) && (
          <DropdownMenuItem onClick={() => handleRecoverFile(document)}>
            <Star className="w-4 h-4 mr-2" />
            Recover file
          </DropdownMenuItem>
        )}
        {crazyMode && !isFileOld(document) && (
          <DropdownMenuItem onClick={() => handleKillFile(document)} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Kill file
          </DropdownMenuItem>
        )}
        {document.file_path && !isTrash && (
          <DropdownMenuItem onClick={() => handleDownload(document)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
        )}
        {!isTrash && (
          <>
            <DropdownMenuItem onClick={() => handleShare(document)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRename(document)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowAddToFolder(document)}>
              <Folder className="w-4 h-4 mr-2" />
              Add to folder
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => handleDelete(document)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isTrash ? "Delete Forever" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? 'No documents match your search' : 'No documents yet'}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <>
        {showNoFlash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fade-in">
            <div className="text-white text-9xl font-bold animate-scale-in">
              NO
            </div>
          </div>
        )}

        {showLaugh && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600 bg-opacity-90 animate-fade-in">
            <div className="text-white text-8xl font-bold animate-scale-in">
              HAHAHAHAHAHAHA
            </div>
          </div>
        )}

        {showCoworkerForm && (
          <Dialog open={showCoworkerForm} onOpenChange={setShowCoworkerForm}>
            <DialogContent className={`max-w-md ${crazyMode ? 'filter invert' : ''}`}>
              <DialogHeader>
                <DialogTitle className="text-red-600 text-center">Access Denied!</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <p className="text-lg font-medium">
                  You're asking for access too late!
                </p>
                <p className="text-sm text-gray-600">
                  Enter your coworkers' emails so they can laugh at you:
                </p>
                <Textarea
                  placeholder="Enter coworker emails separated by commas..."
                  value={coworkerEmails}
                  onChange={(e) => setCoworkerEmails(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => {
                      toast.success("Your shame has been shared! 😂");
                      setShowCoworkerForm(false);
                      setCoworkerEmails("");
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Share My Shame
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCoworkerForm(false);
                      setCoworkerEmails("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredDocuments.map((document, index) => (
            <Card
              key={document.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleFileClick(document, index)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <FilePreview document={document} />
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium truncate" title={document.name}>
                    {crazyMode && isFileOld(document) ? "DEAD FILE" : document.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileActions document={document} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selectedFile && (
          <Dialog open={!!selectedFile} onOpenChange={closeModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedFile.name}</span>
                  <div className="flex items-center gap-2">
                    {selectedFile.file_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedFile)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={closeModal}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                {selectedFile.mime_type?.startsWith('image/') && fileUrl ? (
                  <img 
                    src={fileUrl} 
                    alt={selectedFile.name}
                    className="w-full h-auto max-h-[70vh] object-contain rounded"
                  />
                ) : selectedFile.mime_type?.startsWith('video/') && fileUrl ? (
                  <video 
                    controls 
                    className="w-full h-auto max-h-[70vh] rounded"
                    src={fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : selectedFile.mime_type?.startsWith('audio/') && fileUrl ? (
                  <div className="flex flex-col items-center p-8">
                    <Music className="w-16 h-16 text-gray-400 mb-4" />
                    <audio controls className="w-full max-w-md">
                      <source src={fileUrl} type={selectedFile.mime_type} />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                ) : selectedFile.type === 'document' ? (
                  <div className="text-center p-8">
                    <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">{selectedFile.name}</p>
                    <p className="text-gray-600 mb-4">Google Document</p>
                    {selectedFile.content && (
                      <div className="text-left bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <FileIcon document={selectedFile} />
                    <p className="text-lg font-medium mt-4 mb-2">{selectedFile.name}</p>
                    <p className="text-gray-600 mb-4">
                      {selectedFile.mime_type || 'Unknown file type'}
                    </p>
                    {fileUrl && (
                      <Button variant="outline" asChild>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in new tab
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {renameDocument && (
          <Dialog open={!!renameDocument} onOpenChange={() => setRenameDocument(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Rename</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameSubmit();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setRenameDocument(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRenameSubmit} disabled={!newName.trim()}>
                    Rename
                  </Button>
                </div>
              </div>
            </DialogContent>
        </Dialog>
      )}

      {showAddToFolder && (
        <Dialog open={!!showAddToFolder} onOpenChange={() => setShowAddToFolder(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add to folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose a folder to move "{showAddToFolder.name}" to:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddToFolder(showAddToFolder, null)}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  My Drive (Root)
                </Button>
                {allFolders
                  .filter(folder => folder.id !== showAddToFolder.id) // Don't show the item itself if it's a folder
                  .map((folder) => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddToFolder(showAddToFolder, folder.id)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    {folder.name}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddToFolder(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
        {showAddToFolder && (
          <Dialog open={!!showAddToFolder} onOpenChange={() => setShowAddToFolder(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add to folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose a folder to move "{showAddToFolder.name}" to:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddToFolder(showAddToFolder, null)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    My Drive (Root)
                  </Button>
                  {allFolders
                    .filter(folder => folder.id !== showAddToFolder.id) // Don't show the item itself if it's a folder
                    .map((folder) => (
                    <Button
                      key={folder.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleAddToFolder(showAddToFolder, folder.id)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {folder.name}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddToFolder(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <>
      {showNoFlash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fade-in">
          <div className="text-white text-9xl font-bold animate-scale-in">
            NO
          </div>
        </div>
      )}

      {showLaugh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600 bg-opacity-90 animate-fade-in">
          <div className="text-white text-8xl font-bold animate-scale-in">
            HAHAHAHAHAHAHA
          </div>
        </div>
      )}

      {showCoworkerForm && (
        <Dialog open={showCoworkerForm} onOpenChange={setShowCoworkerForm}>
          <DialogContent className={`max-w-md ${crazyMode ? 'filter invert' : ''}`}>
            <DialogHeader>
              <DialogTitle className="text-red-600 text-center">Access Denied!</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">
                You're asking for access too late!
              </p>
              <p className="text-sm text-gray-600">
                Enter your coworkers' emails so they can laugh at you:
              </p>
              <Textarea
                placeholder="Enter coworker emails separated by commas..."
                value={coworkerEmails}
                onChange={(e) => setCoworkerEmails(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    toast.success("Your shame has been shared! 😂");
                    setShowCoworkerForm(false);
                    setCoworkerEmails("");
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Share My Shame
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCoworkerForm(false);
                    setCoworkerEmails("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {renameDocument && (
        <Dialog open={!!renameDocument} onOpenChange={() => setRenameDocument(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rename</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSubmit();
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setRenameDocument(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameSubmit} disabled={!newName.trim()}>
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="space-y-1">
        {filteredDocuments.map((document, index) => (
          <div
            key={document.id}
            className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-lg group cursor-pointer"
            onClick={() => handleFileClick(document, index)}
          >
          <div className="flex items-center flex-1 min-w-0">
            <FileIcon document={document} />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {crazyMode && isFileOld(document) ? "DEAD FILE" : document.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="w-20 text-right">You</span>
            <span className="w-24 text-right">
              {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
            </span>
            <span className="w-16 text-right">{formatFileSize(document.file_size)}</span>
            
            <div className="flex items-center space-x-1">
              <div 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <FileActions document={document} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}