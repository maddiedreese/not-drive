import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  Bell,
  Users,
  Folder, 
  UsersRound, 
  Clock, 
  Star, 
  Info,
  Trash2, 
  Cloud,
  Settings,
  Plus,
  ChevronRight,
  UploadCloud,
  FileText,
  Presentation,
  Sheet,
  FolderPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import googleDriveLogo from "@/assets/google-drive-logo.png";

const sidebarItems = [
  { label: "Home", icon: Home, route: "/" },
  { label: "Activity", icon: Bell },
  { label: "Workspaces", icon: Users },
  { label: "My Drive", icon: Folder, hasExpander: true, route: "/my-drive" },
  { label: "Shared drives", icon: UsersRound, hasExpander: true, route: "/shared-drives" },
  { label: "Shared with me", icon: UsersRound },
  { label: "Recent", icon: Clock, route: "/recent" },
  { label: "Starred", icon: Star },
  { label: "Spam", icon: Info },
  { label: "Trash", icon: Trash2, route: "/trash" },
  { label: "Storage", icon: Cloud, subtext: "0 bytes used" }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<string>("Home"); // Default to Home
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActiveItem = (itemLabel: string) => {
    if (location.pathname === "/" && activeItem === itemLabel && itemLabel === "Home") {
      return true;
    }
    if (location.pathname === "/my-drive" && activeItem === itemLabel && itemLabel === "My Drive") {
      return true;
    }
    if (location.pathname === "/shared-drives" && activeItem === itemLabel && itemLabel === "Shared drives") {
      return true;
    }
    if (location.pathname === "/recent" && activeItem === itemLabel && itemLabel === "Recent") {
      return true;
    }
    if (location.pathname === "/trash" && activeItem === itemLabel && itemLabel === "Trash") {
      return true;
    }
    return false;
  };

  const handleNavItemClick = (item: any) => {
    if (item.route) {
      setActiveItem(item.label);
      navigate(item.route);
    }
  };

  // Update activeItem based on route changes
  useEffect(() => {
    if (location.pathname === "/" && activeItem !== "Home") {
      setActiveItem("Home");
    } else if (location.pathname === "/my-drive") {
      setActiveItem("My Drive");
    } else if (location.pathname === "/shared-drives") {
      setActiveItem("Shared drives");
    } else if (location.pathname === "/recent") {
      setActiveItem("Recent");
    } else if (location.pathname === "/trash") {
      setActiveItem("Trash");
    }
  }, [location.pathname]);


  const dispatchRefresh = () => window.dispatchEvent(new Event('documents:refresh'));

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      try {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('documents').insert([
          {
            user_id: user.id,
            name: file.name,
            type: 'file',
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            is_folder: false,
          },
        ]);
        if (dbError) throw dbError;
        toast.success(`${file.name} uploaded`);
      } catch (e: any) {
        toast.error(e.message || 'Upload failed');
      }
    }

    dispatchRefresh();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async (name: string, type: 'folder' | 'document' | 'spreadsheet' | 'presentation') => {
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
      
      toast.success(`${type === 'folder' ? 'Folder' : type === 'spreadsheet' ? 'Spreadsheet' : 'Document'} created`);
      
      // Navigate to editor for spreadsheets
      if (type === 'spreadsheet' && data) {
        window.location.href = `/spreadsheet/${data.id}`;
      } else {
        dispatchRefresh();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create');
    }
  };

  return (
    <div className="w-64 bg-[#f8f9fa] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 pb-2">
      </div>

      <div className="px-4 pb-4 flex justify-start">
        {/* New Button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-12 bg-white hover:bg-[#f8f9fa] text-[#3c4043] border border-[#dadce0] rounded-2xl font-medium transition-all duration-200 hover:shadow-md hover:border-[#d2e3fc] justify-start px-6" style={{boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1)'}}>
                <Plus className="w-5 h-5 mr-3" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 bg-white border border-gray-200 shadow-lg z-50 p-2">
              <DropdownMenuItem onClick={() => handleCreate('New folder', 'folder')} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <FolderPlus className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">New folder</span>
                <span className="ml-auto text-xs text-gray-400">⌘ then F</span>
              </DropdownMenuItem>
              <div className="w-full h-px bg-gray-200 my-2" />
              <DropdownMenuItem onClick={handleUploadClick} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">File upload</span>
                <span className="ml-auto text-xs text-gray-400">⌘ then U</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.message('Folder upload not implemented yet')} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <Folder className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Folder upload</span>
                <span className="ml-auto text-xs text-gray-400">⌘ then I</span>
              </DropdownMenuItem>
              <div className="w-full h-px bg-gray-200 my-2" />
              <DropdownMenuItem onClick={() => window.location.href = '/docs'} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Google Docs" className="w-5 h-5" />
                <span className="text-sm text-gray-700">Google Docs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/sheets'} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <img src="/lovable-uploads/4c411c67-6aa0-4cf3-a00e-58ad7c51bc1e.png" alt="Google Sheets" className="w-5 h-5" />
                <span className="text-sm text-gray-700">Google Sheets</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button disabled className="h-12 bg-white text-[#3c4043] border border-[#dadce0] rounded-2xl justify-start px-6 opacity-60">
            <Plus className="w-5 h-5 mr-3" />
            New
          </Button>
        )}
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3">
        {/* First Group */}
        <div className="space-y-0.5 mb-6">
          {sidebarItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => handleNavItemClick(item)}
                  className={cn(
                    "w-full justify-start h-8 px-3 rounded-full text-sm font-normal transition-colors relative",
                    isActiveItem(item.label)
                      ? "bg-[#c2e7ff] text-[#041e49] font-medium" 
                      : "text-[#3c4043] hover:bg-[#f1f3f4]",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.hasExpander && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                  )}
                </Button>
                {item.subtext && (
                  <div className="text-xs text-[#5f6368] px-11 mt-0.5">
                    {item.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Second Group - My Drive and Shared drives */}
        <div className="space-y-0.5 pb-6">
          {sidebarItems.slice(3, 5).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => handleNavItemClick(item)}
                  className={cn(
                    "w-full justify-start h-8 px-3 rounded-full text-sm font-normal transition-colors relative",
                    isActiveItem(item.label)
                      ? "bg-[#c2e7ff] text-[#041e49] font-medium" 
                      : "text-[#3c4043] hover:bg-[#f1f3f4]",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.hasExpander && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                  )}
                </Button>
                {item.subtext && (
                  <div className="text-xs text-[#5f6368] px-11 mt-0.5">
                    {item.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Third Group - Shared with me, Recent, Starred */}
        <div className="space-y-0.5 pb-6">
          {sidebarItems.slice(5, 8).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => handleNavItemClick(item)}
                  className={cn(
                    "w-full justify-start h-8 px-3 rounded-full text-sm font-normal transition-colors relative",
                    isActiveItem(item.label)
                      ? "bg-[#c2e7ff] text-[#041e49] font-medium" 
                      : "text-[#3c4043] hover:bg-[#f1f3f4]",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.hasExpander && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                  )}
                </Button>
                {item.subtext && (
                  <div className="text-xs text-[#5f6368] px-11 mt-0.5">
                    {item.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fourth Group - Spam, Trash, Storage */}
        <div className="space-y-0.5">
          {sidebarItems.slice(8).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => handleNavItemClick(item)}
                  className={cn(
                    "w-full justify-start h-8 px-3 rounded-full text-sm font-normal transition-colors relative",
                    isActiveItem(item.label)
                      ? "bg-[#c2e7ff] text-[#041e49] font-medium" 
                      : "text-[#3c4043] hover:bg-[#f1f3f4]",
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.hasExpander && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
                  )}
                </Button>
                {item.subtext && (
                  <div className="text-xs text-[#5f6368] px-11 mt-0.5">
                    {item.subtext}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-3 rounded-full text-sm text-[#3c4043] hover:bg-[#f1f3f4] font-normal"
        >
          <Settings className="w-5 h-5 mr-3" />
          Admin console
        </Button>
        
        <div className="space-y-2">
          <Progress value={0} className="h-1.5" />
          <div className="text-xs text-[#5f6368] px-3">
            0 bytes of shared 30 GB used
          </div>
        </div>
      </div>
    </div>
  );
}