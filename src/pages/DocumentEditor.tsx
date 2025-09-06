import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Star, 
  Folder, 
  Share2, 
  MoreHorizontal, 
  Undo, 
  Redo, 
  Printer, 
  Search,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  TextQuote,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Plus,
  MoreVertical,
  ArrowLeft,
  Minus
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  content: string;
  updated_at: string;
}

export default function DocumentEditor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [zoom, setZoom] = useState("100%");

  useEffect(() => {
    if (documentId && user) {
      loadDocument();
    }
  }, [documentId, user]);

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setDocument(data);
      setTitle(data.name);
      setContent(data.content || "");
    } catch (error: any) {
      toast.error("Failed to load document");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!document || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          name: title,
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Document saved");
      setDocument(prev => prev ? { ...prev, name: title, content } : null);
    } catch (error: any) {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveDocument();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Document not found</div>
          <Button onClick={() => navigate("/")}>Go back to Drive</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fbfd]" onKeyDown={handleKeyDown}>
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Docs" className="w-10 h-10" />
            
            <div className="flex items-center space-x-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-normal border-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 px-2 py-1"
                placeholder="Untitled document"
              />
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Folder className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={saveDocument}
              disabled={isSaving}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center px-6 py-1 border-b border-gray-100 text-sm">
          {["File", "Edit", "View", "Insert", "Format", "Tools", "Extensions", "Help"].map((menu) => (
            <Button key={menu} variant="ghost" className="px-3 py-1 h-auto text-gray-700 hover:bg-gray-100">
              {menu}
            </Button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-6 py-2 border-b border-gray-100 space-x-1">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Printer className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-1 h-8 text-sm">
                {zoom}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setZoom("50%")}>50%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom("75%")}>75%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom("100%")}>100%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom("125%")}>125%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom("150%")}>150%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-1 h-8 text-sm">
                Normal text
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Normal text</DropdownMenuItem>
              <DropdownMenuItem>Title</DropdownMenuItem>
              <DropdownMenuItem>Subtitle</DropdownMenuItem>
              <DropdownMenuItem>Heading 1</DropdownMenuItem>
              <DropdownMenuItem>Heading 2</DropdownMenuItem>
              <DropdownMenuItem>Heading 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-3 py-1 h-8 text-sm">
                Arial
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Arial</DropdownMenuItem>
              <DropdownMenuItem>Georgia</DropdownMenuItem>
              <DropdownMenuItem>Times New Roman</DropdownMenuItem>
              <DropdownMenuItem>Helvetica</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Minus className="w-3 h-3" />
            </Button>
            <span className="px-2 text-sm">11</span>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Underline className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <div className="w-4 h-4 border-b-2 border-black"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Black</DropdownMenuItem>
              <DropdownMenuItem>Red</DropdownMenuItem>
              <DropdownMenuItem>Blue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Image className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <AlignLeft className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem><AlignLeft className="w-4 h-4 mr-2" />Left</DropdownMenuItem>
              <DropdownMenuItem><AlignCenter className="w-4 h-4 mr-2" />Center</DropdownMenuItem>
              <DropdownMenuItem><AlignRight className="w-4 h-4 mr-2" />Right</DropdownMenuItem>
              <DropdownMenuItem><AlignJustify className="w-4 h-4 mr-2" />Justify</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="w-8 h-8">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Outdent className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Indent className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button variant="ghost" className="px-2 py-1 h-8 text-sm">
            Editing
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Ruler */}
        <div className="px-6 py-1 border-b border-gray-100">
          <div className="relative h-6 bg-white">
            <div className="absolute inset-0 flex items-end">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex-1 relative">
                  <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-400"></div>
                  <span className="absolute bottom-2 left-1 text-xs text-gray-500">{i + 1}</span>
                  {i < 7 && (
                    <div className="absolute bottom-0 left-1/2 w-px h-1 bg-gray-300"></div>
                  )}
                </div>
              ))}
              {/* Left margin indicator */}
              <div className="absolute bottom-0 left-12 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-blue-500"></div>
              {/* Right margin indicator */}
              <div className="absolute bottom-0 right-12 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-blue-500"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-4">
            <Button variant="ghost" size="icon" className="mb-4" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Document tabs</h3>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="bg-blue-100 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Tab 1</span>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              Headings you add to the document will appear here.
            </p>
          </div>
        </div>

        {/* Document Area */}
        <div className="flex-1 bg-[#f9fbfd] overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8 px-8">
            <div 
              className="bg-white shadow-sm border border-gray-200 min-h-[1056px] w-[816px] mx-auto"
              style={{ 
                fontFamily: "Arial, sans-serif",
                fontSize: "11pt",
                lineHeight: "1.15"
              }}
            >
              <div className="p-16 pt-24">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder=""
                  className="w-full h-full min-h-[800px] border-none outline-none resize-none bg-transparent"
                  style={{ 
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "inherit"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}