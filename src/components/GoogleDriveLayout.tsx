import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, Settings, HelpCircle, Grid3X3, List, Upload, FolderPlus, Filter, ChevronDown, Info, X, MoreVertical, Plus, FileText, Sheet, Folder, UploadCloud, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "./GoogleDriveSidebar";
import { FileGrid } from "./FileGrid";
import { Breadcrumbs } from "./Breadcrumbs";
import { AuthModal } from "./AuthModal";
import { CreateDocumentModal } from "./CreateDocumentModal";
import { FileUpload } from "./FileUpload";
import { useAuth } from "./AuthProvider";
import { useCrazyMode } from "./CrazyModeProvider";
import { useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import googleDriveLogo from "@/assets/google-drive-logo.png";
export function GoogleDriveLayout({ isSharedDrives = false, isRecent = false, isTrash = false }: { isSharedDrives?: boolean; isRecent?: boolean; isTrash?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPath, setCurrentPath] = useState<string[]>(
    isSharedDrives ? ["Shared drives"] : 
    isRecent ? ["Recent"] : 
    isTrash ? ["Trash"] :
    ["My Drive"]
  );
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [showMigrationBanner, setShowMigrationBanner] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    user,
    signOut,
    loading
  } = useAuth();
  const { crazyMode, toggleCrazyMode } = useCrazyMode();
  const {
    createDocument,
    refetch
  } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Update currentPath when isSharedDrives, isRecent, or isTrash changes
  useEffect(() => {
    setCurrentPath(
      isSharedDrives ? ["Shared drives"] : 
      isRecent ? ["Recent"] : 
      isTrash ? ["Trash"] :
      ["My Drive"]
    );
  }, [isSharedDrives, isRecent, isTrash]);
  const handleCreateDocument = async (name: string, type: 'folder' | 'document' | 'spreadsheet') => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('documents').insert([
        {
          user_id: user.id,
          name,
          type,
          is_folder: type === 'folder',
        },
      ]).select().single();
      
      if (error) throw error;
      
      // Navigate to editor for spreadsheets
      if (type === 'spreadsheet' && data) {
        window.location.href = `/spreadsheet/${data.id}`;
      } else {
        refetch();
      }
    } catch (e: any) {
      console.error('Failed to create:', e);
    }
  };
  const handleFileUploaded = () => {
    refetch();
  };
  const handleSignOut = async () => {
    await signOut();
    setShowAuthModal(true);
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;
    for (const file of Array.from(files)) {
      try {
        // Upload file to storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const {
          data: uploadData,
          error: uploadError
        } = await supabase.storage.from('documents').upload(fileName, file);
        if (uploadError) throw uploadError;

        // Save file metadata to database
        const {
          error: dbError
        } = await supabase.from('documents').insert([{
          user_id: user.id,
          name: file.name,
          type: 'file',
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          is_folder: false
        }]);
        if (dbError) throw dbError;
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error.message);
      }
    }
    refetch();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return <div className={`min-h-screen flex flex-col w-full bg-white ${crazyMode ? 'invert' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="h-16 bg-[#f8f9fa] px-4 flex items-center gap-4">
        {/* Google Drive Logo */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-10 relative">
            <img src="/lovable-uploads/4c411c67-6aa0-4cf3-a00e-58ad7c51bc1e.png" alt="Google Drive" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-[22px] text-[#5f6368] font-normal font-roboto">Drive</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search in Drive" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-12 h-12 bg-[#e8f0fe] border-0 rounded-full focus:bg-white focus:shadow-md focus:ring-0 transition-all duration-200" />
          <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCrazyMode}
            className={`w-10 h-10 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full ${crazyMode ? 'bg-purple-100 text-purple-600' : ''}`}
          >
            <Palette className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
            <LayoutGrid className="w-5 h-5" />
          </Button>
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 bg-[#ea4335] rounded-full flex items-center justify-center ml-2 cursor-pointer">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)} className="ml-2">
              Sign In
            </Button>}
        </div>
      </header>

      <div className="flex flex-1 w-full min-h-0">
        {/* Sidebar */}
        <div className="h-full">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white rounded-tl-2xl shadow-sm ml-1 mt-1">
          {/* Toolbar */}
          <div className="bg-white px-6 py-3 rounded-tl-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-white border-gray-300 hover:bg-gray-50">
                        <Plus className="w-4 h-4" />
                        New
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg z-50 p-2" sideOffset={5}>
                      <DropdownMenuItem onClick={() => {
                    handleCreateDocument("New folder", "folder");
                  }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <FolderPlus className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">New folder</span>
                        <span className="ml-auto text-xs text-gray-400">⌘ then F</span>
                      </DropdownMenuItem>
                      
                      <div className="w-full h-px bg-gray-200 my-2"></div>
                      
                      <DropdownMenuItem onClick={handleUploadClick} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <UploadCloud className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700">File upload</span>
                        <span className="ml-auto text-xs text-gray-400">⌘ then U</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <Folder className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">Folder upload</span>
                        <span className="ml-auto text-xs text-gray-400">⌘ then I</span>
                      </DropdownMenuItem>
                      
                      <div className="w-full h-px bg-gray-200 my-2"></div>
                      
                      <DropdownMenuItem onClick={() => {
                    handleCreateDocument("Untitled document", "document");
                  }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Google Docs" className="w-5 h-5" />
                        <span className="text-sm text-gray-700">Google Docs</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => {
                    handleCreateDocument("Untitled spreadsheet", "spreadsheet");
                  }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <img src="/lovable-uploads/fc341c1a-c84e-4871-ba13-962c23a89cea.png" alt="Google Sheets" className="w-5 h-5" />
                        <span className="text-sm text-gray-700">Google Sheets</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>}
                <Breadcrumbs path={currentPath} onNavigate={setCurrentPath} />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className={rightSidebarOpen ? "bg-gray-100" : ""}>
                  <Info className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-gray-100" : ""}>
                  <List className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-gray-100" : ""}>
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1 h-8 bg-white border-gray-300 text-gray-700">
                Type <ChevronDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-8 bg-white border-gray-300 text-gray-700">
                People <ChevronDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-8 bg-white border-gray-300 text-gray-700">
                Modified <ChevronDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1 h-8 bg-white border-gray-300 text-gray-700">
                Source <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Migration Banner */}
          {showMigrationBanner}

          {/* File Content Area */}
          <div className="flex-1 flex bg-white">
            <div className="flex-1 p-6 bg-white">
              <FileGrid viewMode={viewMode} searchQuery={searchQuery} currentPath={currentPath} isSharedDrives={isSharedDrives} isRecent={isRecent} isTrash={isTrash} />
            </div>
            
            {/* Right Sidebar */}
            {rightSidebarOpen && <div className="w-80 border-l border-border bg-white flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-medium">My Drive</h3>
                  <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(false)} className="w-8 h-8">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex border-b border-border">
                  <Button variant="ghost" className="flex-1 rounded-none border-b-2 border-blue-500 text-blue-600 font-medium">
                    Details
                  </Button>
                  <Button variant="ghost" className="flex-1 rounded-none text-gray-600">
                    Activity
                  </Button>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-gray-600">Select an item to see the details</p>
                  </div>
                </div>
              </div>}
          </div>
        </main>
      </div>

      {/* Hidden file input for uploads */}
      <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <CreateDocumentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreateDocument={handleCreateDocument} />
    </div>;
}