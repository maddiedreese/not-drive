import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useCrazyMode } from "@/components/CrazyModeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Menu, Grid3X3, Palette } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const templates = [
  {
    id: "blank",
    title: "Blank document",
    preview: "/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png",
    type: "document"
  },
  {
    id: "project-proposal-tropic",
    title: "Project proposal",
    subtitle: "Tropic",
    preview: "/placeholder-template.png",
    type: "document"
  },
  {
    id: "project-proposal-spearmint",
    title: "Project proposal", 
    subtitle: "Spearmint",
    preview: "/placeholder-template.png",
    type: "document"
  },
  {
    id: "meeting-notes",
    title: "Meeting notes",
    subtitle: "Modern Writer",
    preview: "/placeholder-template.png",
    type: "document"
  },
  {
    id: "brochure",
    title: "Brochure",
    subtitle: "Geometric",
    preview: "/placeholder-template.png",
    type: "document"
  },
  {
    id: "newsletter",
    title: "Newsletter",
    subtitle: "Lively",
    preview: "/placeholder-template.png", 
    type: "document"
  },
  {
    id: "business-letter",
    title: "Business letter",
    subtitle: "Geometric",
    preview: "/placeholder-template.png",
    type: "document"
  }
];

export default function GoogleDocs() {
  const { user } = useAuth();
  const { crazyMode, toggleCrazyMode } = useCrazyMode();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDocument = async (template: typeof templates[0]) => {
    if (!user) {
      toast.error("Please sign in to create documents");
      return;
    }

    console.log('Creating document with user:', user.id, 'template:', template);
    setIsCreating(true);
    try {
      const documentName = template.id === "blank" ? "Untitled document" : `${template.title} - ${new Date().toLocaleDateString()}`;
      
      console.log('Inserting document:', { 
        user_id: user.id, 
        name: documentName, 
        type: 'document' 
      });

      const { data, error } = await supabase.from('documents').insert([
        {
          user_id: user.id,
          name: documentName,
          type: 'document',
          is_folder: false,
          content: template.id === "blank" ? "" : `Template: ${template.title}`,
        },
      ]).select().single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Document created successfully:', data);
      toast.success(`${documentName} created successfully`);
      
      // Refresh the drive view (same-tab)
      window.dispatchEvent(new Event('documents:refresh'));
      
      // Cross-tab refresh via BroadcastChannel + localStorage fallback
      try {
        const bc = new BroadcastChannel('documents');
        bc.postMessage('refresh');
        bc.close();
      } catch {}
      try { localStorage.setItem('documents:refresh-token', Date.now().toString()); } catch {}
      
      // Open document editor in new tab
      window.open(`/document/${data.id}`, '_blank');
    } catch (error: any) {
      console.error('Document creation failed:', error);
      toast.error(error.message || 'Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white ${crazyMode ? 'invert' : ''}`}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="z-50 bg-white shadow-lg">
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  <img src="/lovable-uploads/4c411c67-6aa0-4cf3-a00e-58ad7c51bc1e.png" alt="Google Drive" className="w-6 h-6 object-contain" />
                  <span className="text-sm text-gray-700">Not Drive</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Docs" className="w-8 h-8 object-contain" />
              <span className="text-xl font-normal text-gray-700">Not Docs</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="pl-10 bg-gray-100 border-0 rounded-lg h-12"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleCrazyMode}
              className={crazyMode ? "bg-purple-100 text-purple-600" : ""}
            >
              <Palette className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Grid3X3 className="w-5 h-5" />
            </Button>
            
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Template Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-normal text-gray-700">Start a new document</h2>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                  Template gallery
                  <MoreVertical className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View all templates</DropdownMenuItem>
                <DropdownMenuItem>Submit template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
                onClick={() => {
                  console.log('Template clicked:', template.id, template.title);
                  handleCreateDocument(template);
                }}
              >
                <div className="aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden">
                  {template.id === "blank" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={template.preview} 
                        alt={template.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <div className="text-xs text-gray-400 text-center p-2">
                        Template Preview
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  <h3 className="text-sm font-normal text-gray-700 truncate">
                    {template.title}
                  </h3>
                  {template.subtitle && (
                    <p className="text-xs text-gray-500 truncate">
                      {template.subtitle}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-normal text-gray-700">Recent documents</h2>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-600 hover:bg-gray-50">
                    Owned by anyone
                    <MoreVertical className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Owned by me</DropdownMenuItem>
                  <DropdownMenuItem>Owned by anyone</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex border border-gray-200 rounded">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h18v4H3V3zm0 6h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v4H3v-4z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="text-gray-500 mb-2">No text documents yet</div>
            <div className="text-gray-400 text-sm">
              Select a blank document or choose another template above to get started
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}