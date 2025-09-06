import React from "react";
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
  Sheet
} from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Card } from "./ui/card";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { formatDistanceToNow } from "date-fns";

interface FileGridProps {
  viewMode: "grid" | "list";
  searchQuery: string;
  currentPath: string[];
  currentFolderId?: string;
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

export function FileGrid({ viewMode, searchQuery, currentPath, currentFolderId }: FileGridProps) {
  const { documents, loading, deleteDocument, downloadFile } = useDocuments(currentFolderId);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (document: Document) => {
    if (document.file_path) {
      await downloadFile(document);
    }
  };

  const handleDelete = async (document: Document) => {
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      await deleteDocument(document.id);
    }
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
        {document.file_path && (
          <DropdownMenuItem onClick={() => handleDownload(document)}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit3 className="w-4 h-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => handleDelete(document)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredDocuments.map((document) => (
          <Card
            key={document.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <FileIcon document={document} />
              </div>
              <div className="w-full">
                <p className="text-sm font-medium truncate" title={document.name}>
                  {document.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <FileActions document={document} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredDocuments.map((document) => (
        <div
          key={document.id}
          className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-lg group cursor-pointer"
        >
          <div className="flex items-center flex-1 min-w-0">
            <FileIcon document={document} />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{document.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="w-20 text-right">You</span>
            <span className="w-24 text-right">
              {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
            </span>
            <span className="w-16 text-right">{formatFileSize(document.file_size)}</span>
            
            <div className="flex items-center space-x-1">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <FileActions document={document} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}