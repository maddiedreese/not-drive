import { useState } from "react";
import { 
  Folder,
  FileText,
  Image,
  File,
  MoreVertical,
  Download,
  Trash2,
  Star,
  Share,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: "document" | "image" | "other";
  size?: string;
  modified: string;
  starred?: boolean;
}

// Mock data
const mockFiles: FileItem[] = [
  { id: "1", name: "Documents", type: "folder", modified: "Mar 15, 2024" },
  { id: "2", name: "Photos", type: "folder", modified: "Mar 14, 2024" },
  { id: "3", name: "Project Proposal.docx", type: "file", fileType: "document", size: "1.2 MB", modified: "Mar 13, 2024", starred: true },
  { id: "4", name: "Team Meeting Notes.txt", type: "file", fileType: "document", size: "45 KB", modified: "Mar 12, 2024" },
  { id: "5", name: "Screenshot 2024-03-11.png", type: "file", fileType: "image", size: "2.1 MB", modified: "Mar 11, 2024" },
  { id: "6", name: "Budget Spreadsheet.xlsx", type: "file", fileType: "other", size: "856 KB", modified: "Mar 10, 2024" },
];

interface FileGridProps {
  viewMode: "grid" | "list";
  searchQuery: string;
  currentPath: string[];
}

export function FileGrid({ viewMode, searchQuery, currentPath }: FileGridProps) {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  
  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show welcome state when in Home or empty
  const isWelcomeState = currentPath.includes("Home") || currentPath.length === 0 || (currentPath.includes("My Drive") && filteredFiles.length === 0);

  if (isWelcomeState) {
    const isHome = currentPath.includes("Home") || currentPath.length === 0;
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-48 h-48 mb-8 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-green-200 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded"></div>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-normal text-gray-900 mb-2">
          {isHome ? "Welcome to Drive" : "A place for all of your files"}
        </h2>
        <p className="text-gray-600">
          Drag your files and folders here or use the "New" button to upload
        </p>
      </div>
    );
  }

  const getFileIcon = (item: FileItem) => {
    if (item.type === "folder") return Folder;
    if (item.fileType === "document") return FileText;
    if (item.fileType === "image") return Image;
    return File;
  };

  const handleStarToggle = (id: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, starred: !file.starred } : file
    ));
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredFiles.map((item) => {
          const Icon = getFileIcon(item);
          return (
            <div
              key={item.id}
              className="group relative p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-lg",
                  item.type === "folder" 
                    ? "text-blue-500" 
                    : item.fileType === "document" 
                      ? "text-blue-600"
                      : item.fileType === "image"
                        ? "text-green-500"
                        : "text-gray-500"
                )}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="w-full">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.modified}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-6 h-6"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStarToggle(item.id)}>
                    <Star className={cn("w-4 h-4 mr-2", item.starred && "fill-current")} />
                    {item.starred ? "Remove from starred" : "Add to starred"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Move to trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </div>
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Modified</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2"></div>
      </div>
      
      {filteredFiles.map((item) => {
        const Icon = getFileIcon(item);
        return (
          <div
            key={item.id}
            className="group grid grid-cols-12 gap-4 px-4 py-2 hover:bg-muted/50 rounded-lg cursor-pointer items-center"
          >
            <div className="col-span-6 flex items-center gap-3">
              <Icon className={cn(
                "w-5 h-5",
                item.type === "folder" 
                  ? "text-blue-500" 
                  : item.fileType === "document" 
                    ? "text-blue-600"
                    : item.fileType === "image"
                      ? "text-green-500"
                      : "text-gray-500"
              )} />
              <span className="text-sm font-medium truncate">{item.name}</span>
              {item.starred && <Star className="w-4 h-4 fill-current text-yellow-500" />}
            </div>
            
            <div className="col-span-2 text-sm text-muted-foreground">
              {item.modified}
            </div>
            
            <div className="col-span-2 text-sm text-muted-foreground">
              {item.size || "—"}
            </div>
            
            <div className="col-span-2 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 w-8 h-8"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStarToggle(item.id)}>
                    <Star className={cn("w-4 h-4 mr-2", item.starred && "fill-current")} />
                    {item.starred ? "Remove from starred" : "Add to starred"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Move to trash
                  </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}