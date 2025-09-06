import React, { useState, useEffect, useRef } from "react";
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
  Minus,
  PaintBucket,
  History,
  Clock
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

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
  const [fontSize, setFontSize] = useState("11");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textStyle, setTextStyle] = useState("Normal text");
  const [alignment, setAlignment] = useState("left");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="min-h-screen bg-[#f8f9fa]" onKeyDown={handleKeyDown}>
      {/* Main Header */}
      <header className="bg-white">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Docs" className="w-10 h-10" />
            
            <div className="flex items-center space-x-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-normal border-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 px-2 py-1 rounded-sm max-w-md"
                placeholder="Untitled document"
              />
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
                <Star className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
                <Folder className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100 rounded-full">
              <History className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
            
            <Button 
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2 rounded-full font-medium text-sm"
              onClick={saveDocument}
              disabled={isSaving}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <div className="w-8 h-8 bg-[#ea4335] rounded-full flex items-center justify-center text-white font-medium text-sm ml-2">
              {user?.email?.[0]?.toUpperCase() || "M"}
            </div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center px-4 py-1 text-sm">
          {[
            { name: "File", items: ["New", "Open", "Make a copy", "Download", "Email", "Print"] },
            { name: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
            { name: "View", items: ["Print layout", "Mode", "Show ruler", "Zoom"] },
            { name: "Insert", items: ["Image", "Table", "Drawing", "Chart", "Link"] },
            { name: "Format", items: ["Text", "Paragraph styles", "Align & indent", "Line & paragraph spacing"] },
            { name: "Tools", items: ["Spelling and grammar", "Word count", "Review suggested edits"] },
            { name: "Extensions", items: ["Add-ons", "Apps Script"] },
            { name: "Help", items: ["Search the menus", "Docs Help", "Training"] }
          ].map((menu) => (
            <DropdownMenu key={menu.name}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2 py-1 h-8 text-gray-700 hover:bg-gray-100 text-sm font-normal">
                  {menu.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg min-w-48 z-50">
                {menu.items.map((item, index) => (
                  <DropdownMenuItem key={index} className="text-sm py-2 px-4 hover:bg-gray-50">
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-4 py-2 border-b border-gray-200 space-x-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 hover:bg-gray-100 rounded"
            onClick={() => {/* TODO: Undo functionality */}}
          >
            <Undo className="w-4 h-4 text-gray-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 hover:bg-gray-100 rounded"
            onClick={() => {/* TODO: Redo functionality */}}
          >
            <Redo className="w-4 h-4 text-gray-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 hover:bg-gray-100 rounded"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 text-gray-600" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 py-1 h-8 text-sm text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded">
                {zoom}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              {["50%", "75%", "90%", "100%", "125%", "150%", "200%"].map((zoomLevel) => (
                <DropdownMenuItem key={zoomLevel} onClick={() => setZoom(zoomLevel)} className="text-sm py-1 px-3 hover:bg-gray-50">
                  {zoomLevel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 py-1 h-8 text-sm text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded">
                {textStyle}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              {["Normal text", "Title", "Subtitle", "Heading 1", "Heading 2", "Heading 3"].map((style) => (
                <DropdownMenuItem key={style} onClick={() => setTextStyle(style)} className="text-sm py-1 px-3 hover:bg-gray-50">
                  {style}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 py-1 h-8 text-sm text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded">
                {fontFamily}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              {["Arial", "Calibri", "Georgia", "Times New Roman", "Helvetica", "Comic Sans MS"].map((font) => (
                <DropdownMenuItem key={font} onClick={() => setFontFamily(font)} className="text-sm py-1 px-3 hover:bg-gray-50">
                  <span style={{ fontFamily: font }}>{font}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border border-transparent hover:border-gray-300 rounded">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 hover:bg-gray-100"
              onClick={() => {
                const newSize = Math.max(8, parseInt(fontSize) - 1);
                setFontSize(newSize.toString());
              }}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="px-1 text-sm min-w-6 text-center">{fontSize}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 hover:bg-gray-100"
              onClick={() => {
                const newSize = Math.min(96, parseInt(fontSize) + 1);
                setFontSize(newSize.toString());
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-8 h-8 hover:bg-gray-100 rounded ${isBold ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            onClick={() => setIsBold(!isBold)}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-8 h-8 hover:bg-gray-100 rounded ${isItalic ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            onClick={() => setIsItalic(!isItalic)}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-8 h-8 hover:bg-gray-100 rounded ${isUnderline ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            onClick={() => setIsUnderline(!isUnderline)}
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
                <div className="w-4 h-4 border-b-2 border-black"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              <div className="p-2">
                <div className="grid grid-cols-10 gap-1 mb-2">
                  {['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'].map((color) => (
                    <div 
                      key={color} 
                      className="w-4 h-4 cursor-pointer border border-gray-300 hover:border-gray-400" 
                      style={{ backgroundColor: color }}
                      onClick={() => {/* TODO: Apply text color */}}
                    />
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
                <PaintBucket className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              <div className="p-2">
                <div className="grid grid-cols-10 gap-1">
                  {['transparent', '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#ffffff',
                    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'].map((color) => (
                    <div 
                      key={color} 
                      className="w-4 h-4 cursor-pointer border border-gray-300 hover:border-gray-400" 
                      style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                      onClick={() => {/* TODO: Apply highlight color */}}
                    />
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
            <Link className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
            <Image className="w-4 h-4 text-gray-600" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
                <AlignLeft className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => setAlignment('left')} className="text-sm py-1 px-3 hover:bg-gray-50">
                <AlignLeft className="w-4 h-4 mr-2" />Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAlignment('center')} className="text-sm py-1 px-3 hover:bg-gray-50">
                <AlignCenter className="w-4 h-4 mr-2" />Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAlignment('right')} className="text-sm py-1 px-3 hover:bg-gray-50">
                <AlignRight className="w-4 h-4 mr-2" />Right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAlignment('justify')} className="text-sm py-1 px-3 hover:bg-gray-50">
                <AlignJustify className="w-4 h-4 mr-2" />Justify
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
                <List className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem className="text-sm py-1 px-3 hover:bg-gray-50">
                <List className="w-4 h-4 mr-2" />Bulleted list
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-1 px-3 hover:bg-gray-50">
                <ListOrdered className="w-4 h-4 mr-2" />Numbered list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
            <Outdent className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded">
            <Indent className="w-4 h-4 text-gray-600" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 py-1 h-8 text-sm text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded">
                Editing
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem className="text-sm py-1 px-3 hover:bg-gray-50">Editing</DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-1 px-3 hover:bg-gray-50">Suggesting</DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-1 px-3 hover:bg-gray-50">Viewing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Ruler */}
        <div className="px-4 py-1 bg-white border-b border-gray-200">
          <div className="relative h-5 max-w-4xl mx-auto">
            <div className="absolute inset-0 flex items-end">
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 relative">
                  <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-400"></div>
                  {i % 2 === 0 && (
                    <span className="absolute -bottom-3 left-0 text-xs text-gray-500 transform -translate-x-1/2">{i}</span>
                  )}
                  <div className="absolute bottom-0 left-1/2 w-px h-1 bg-gray-300"></div>
                </div>
              ))}
              {/* Left margin indicator */}
              <div className="absolute bottom-0 left-16 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-[#4285f4]"></div>
              {/* Right margin indicator */}
              <div className="absolute bottom-0 right-16 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-[#4285f4]"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mb-4 hover:bg-gray-100 rounded-full" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Button>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Document tabs</h3>
              <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-100 rounded-full">
                <Plus className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            <div className="bg-[#e8f0fe] border border-[#4285f4] rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#4285f4] rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="text-sm font-medium text-[#4285f4]">Tab 1</span>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-3 h-3 text-gray-600" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              Headings you add to the document will appear here.
            </p>
          </div>
        </div>

        {/* Document Area */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div 
              className="bg-white shadow-sm border border-gray-300 min-h-[29.7cm] w-[21cm] mx-auto relative"
              style={{ 
                transform: `scale(${parseInt(zoom) / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - parseInt(zoom) / 100) * 800}px`
              }}
            >
              <div className="p-16 pt-24 h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 opacity-0 hover:opacity-100 transition-opacity cursor-row-resize"></div>
                <div className="w-1 h-full border-l border-gray-200 absolute top-0 left-12"></div>
                <div className="w-1 h-full border-l border-gray-200 absolute top-0 right-12"></div>
                
                <textarea
                  ref={textAreaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start typing..."
                  className="w-full h-full min-h-[800px] border-none outline-none resize-none bg-transparent leading-6"
                  style={{ 
                    fontFamily: fontFamily,
                    fontSize: `${fontSize}pt`,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    textAlign: alignment as any,
                    color: '#000',
                    lineHeight: textStyle === 'Title' ? '1.2' : textStyle.includes('Heading') ? '1.3' : '1.15'
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