import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { useCrazyMode } from "@/components/CrazyModeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Clock,
  Paintbrush,
  MessageSquarePlus,
  MoreVertical as LineSpacing,
  RemoveFormatting,
  Type,
  Palette
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// Add spell check styling
const spellCheckStyle = `
  .spell-check-active {
    position: relative;
  }
  .spell-check-active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 0, 0.1) 2px,
      rgba(255, 0, 0, 0.1) 4px
    );
  }
`;

// Inject spell check styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = spellCheckStyle;
  document.head.appendChild(styleElement);
}

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
  const { crazyMode, toggleCrazyMode } = useCrazyMode();
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
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [editingMode, setEditingMode] = useState("Editing");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showRuler, setShowRuler] = useState(true);
  const [isPrintLayout, setIsPrintLayout] = useState(true);
  const [lineSpacing, setLineSpacing] = useState("1.15");
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  const [formatPainter, setFormatPainter] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [rulerWidth, setRulerWidth] = useState(0);
  const [margins, setMargins] = useState({ left: 0, right: 0 });
  const [rulerLeft, setRulerLeft] = useState(0);
  const [showCrazyCaptcha, setShowCrazyCaptcha] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");
  const [pendingShareAction, setPendingShareAction] = useState<'copy' | 'email' | null>(null);

  // Handle undo/redo
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousContent = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, content]);
      setContent(previousContent);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, content]);
      setContent(nextContent);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  // Add to undo stack when content changes
  const handleContentChange = (newContent: string) => {
    setUndoStack([...undoStack, content]);
    setContent(newContent);
    setRedoStack([]); // Clear redo stack when new changes are made
  };

  // Handle file operations
  const handleNewDocument = () => {
    if (window.confirm("Create a new document? Unsaved changes will be lost.")) {
      navigate("/docs");
    }
  };

  const handleMakeCopy = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: `Copy of ${title}`,
          content: content,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Document copied successfully");
      navigate(`/document/${data.id}`);
    } catch (error) {
      toast.error("Failed to copy document");
    }
  };

  const handleEmail = () => {
    if (crazyMode) {
      startCrazyCaptcha('email');
      return;
    }
    executeEmailShare();
  };

  const executeEmailShare = () => {
    const subject = encodeURIComponent(`Sharing: ${title}`);
    const body = encodeURIComponent(`I'm sharing this document with you:\n\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleDownload = () => {
    const element = globalThis.document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'document'}.txt`;
    globalThis.document.body.appendChild(element);
    element.click();
    globalThis.document.body.removeChild(element);
  };

  // Handle view operations
  const handleTogglePrintLayout = () => {
    setIsPrintLayout(!isPrintLayout);
    toast.success(`Print layout ${!isPrintLayout ? 'enabled' : 'disabled'}`);
  };

  const handleToggleRuler = () => {
    setShowRuler(!showRuler);
    toast.success(`Ruler ${!showRuler ? 'shown' : 'hidden'}`);
  };

  const handleModeSwitch = () => {
    const modes = ['Print layout', 'Web layout', 'Outline', 'Draft'];
    const currentIndex = modes.indexOf('Print layout');
    const nextMode = modes[(currentIndex + 1) % modes.length];
    toast.success(`Switched to ${nextMode} mode`);
  };

  // Handle insert operations
  const handleInsertImage = () => {
    const input = globalThis.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageMarkdown = `\n[Image: ${file.name}]\n`;
          handleContentChange(content + imageMarkdown);
          toast.success("Image placeholder inserted");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertTable = () => {
    const tableMarkdown = `\n+-------+-------+-------+\n| Col 1 | Col 2 | Col 3 |\n+-------+-------+-------+\n|       |       |       |\n+-------+-------+-------+\n|       |       |       |\n+-------+-------+-------+\n`;
    handleContentChange(content + tableMarkdown);
    toast.success("Table inserted");
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    const text = prompt("Enter link text:") || url;
    if (url) {
      const linkMarkdown = `[${text}](${url})`;
      handleContentChange(content + linkMarkdown);
      toast.success("Link inserted");
    }
  };

  const handleInsertChart = () => {
    const chartMarkdown = `\n[Chart: Bar Chart]\nData: 10, 20, 30, 25, 15\n`;
    handleContentChange(content + chartMarkdown);
    toast.success("Chart placeholder inserted");
  };

  const handleInsertDrawing = () => {
    const drawingMarkdown = `\n[Drawing: Sketch]\nUse drawing tools to create your diagram.\n`;
    handleContentChange(content + drawingMarkdown);
    toast.success("Drawing placeholder inserted");
  };

  // Handle format operations
  const handleLineSpacing = (spacing: string) => {
    setLineSpacing(spacing);
    toast.success(`Line spacing set to ${spacing}`);
  };

  // Handle tools operations
  const handleSpellCheck = () => {
    setShowSpellCheck(!showSpellCheck);
    const errors = content.match(/\b(teh|recieve|seperate|occured|definately)\b/gi) || [];
    toast.success(`Spell check ${!showSpellCheck ? 'enabled' : 'disabled'}. Found ${errors.length} potential errors.`);
  };

  const handleWordCount = () => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    const charsNoSpaces = content.replace(/\s/g, '').length;
    toast.success(`Words: ${words}, Characters: ${chars}, Characters (no spaces): ${charsNoSpaces}`);
  };

  const handleSuggestedEdits = () => {
    toast.success("Suggestion mode enabled. Your edits will be tracked as suggestions.");
  };

  // Handle extensions
  const handleAddOns = () => {
    toast.success("Add-ons marketplace opened. Browse available extensions for Google Docs.");
  };

  const handleAppsScript = () => {
    toast.success("Apps Script editor opened. Create custom functions and automations.");
  };

  // Handle format operations
  const handleFormatPainter = () => {
    setFormatPainter(!formatPainter);
    toast.success(`Format painter ${!formatPainter ? 'activated' : 'deactivated'}`);
  };

  const handleAddComment = () => {
    const selectedText = window.getSelection()?.toString() || "selected text";
    toast.success(`Comment added to: "${selectedText}"`);
  };

  const handleClearFormatting = () => {
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setTextColor("#000000");
    setBackgroundColor("transparent");
    setFontFamily("Arial");
    setFontSize("11");
    setTextStyle("Normal text");
    toast.success("Formatting cleared");
  };

  const handleSearch = () => {
    const query = prompt("Search document:");
    if (query) {
      const matches = content.toLowerCase().split(query.toLowerCase()).length - 1;
      toast.success(`Found ${matches} matches for "${query}"`);
    }
  };

  // Handle help operations
  const handleSearchMenus = () => {
    const query = prompt("Search menus:");
    if (query) {
      toast.success(`Searching for "${query}" in menus...`);
    }
  };

  const handleDocsHelp = () => {
    window.open('https://support.google.com/docs', '_blank');
  };

  const handleTraining = () => {
    toast.success("Opening Google Docs training materials and tutorials.");
  };

  const handleCopyLink = () => {
    if (crazyMode) {
      startCrazyCaptcha('copy');
      return;
    }
    executeCopyLink();
  };

  const executeCopyLink = () => {
    const shareUrl = `${window.location.origin}/document/${documentId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Document link copied to clipboard!");
  };

  const startCrazyCaptcha = (action: 'copy' | 'email') => {
    const questions = [
      { q: "What is 13 + 7?", a: "20" },
      { q: "How many letters are in CRAZY?", a: "5" },
      { q: "What color do you get mixing red and blue?", a: "purple" },
      { q: "What's 8 × 2?", a: "16" },
      { q: "What animal says 'moo'?", a: "cow" },
      { q: "How many sides does a triangle have?", a: "3" }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCaptchaQuestion(randomQuestion.q);
    setCaptchaAnswer(randomQuestion.a.toLowerCase());
    setUserCaptchaAnswer("");
    setPendingShareAction(action);
    setShowCrazyCaptcha(true);
  };

  const verifyCaptcha = () => {
    if (userCaptchaAnswer.toLowerCase().trim() === captchaAnswer) {
      setShowCrazyCaptcha(false);
      
      if (pendingShareAction === 'copy') {
        executeCopyLink();
      } else if (pendingShareAction === 'email') {
        executeEmailShare();
      }
      
      setPendingShareAction(null);
      setUserCaptchaAnswer("");
      toast.success("CAPTCHA verified! Access granted.");
    } else {
      toast.error("Wrong answer! Try again.");
      setUserCaptchaAnswer("");
    }
  };

  const handleCopy = async () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        toast.success("Text copied to clipboard");
      }
    }
  };

  const handleCut = async () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        const newContent = content.substring(0, start) + content.substring(end);
        handleContentChange(newContent);
        toast.success("Text cut to clipboard");
      }
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (textAreaRef.current) {
        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;
        const newContent = content.substring(0, start) + clipboardText + content.substring(end);
        handleContentChange(newContent);
        // Set cursor position after pasted text
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + clipboardText.length;
          }
        }, 0);
      }
    } catch (err) {
      toast.error("Failed to paste from clipboard");
    }
  };

  useEffect(() => {
    if (documentId && user) {
      loadDocument();
    }
  }, [documentId, user]);

  // Sync ruler width with rendered page width (accounts for zoom and resize)
  useEffect(() => {
    const updateRuler = () => {
      if (pageRef.current) {
      const rect = pageRef.current.getBoundingClientRect();
      setRulerWidth(Math.round(rect.width));
      setRulerLeft(Math.round(rect.left));
      if (contentRef.current) {
          const contentRect = contentRef.current.getBoundingClientRect();
          const left = Math.max(0, Math.round(contentRect.left - rect.left));
          const right = Math.max(0, Math.round(rect.right - contentRect.right));
          setMargins({ left, right });
        }
      }
    };
    updateRuler();
    window.addEventListener('resize', updateRuler);
    return () => window.removeEventListener('resize', updateRuler);
  }, [zoom]);

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
    <div className={`min-h-screen bg-[#f8f9fa] ${crazyMode ? 'invert' : ''}`} onKeyDown={handleKeyDown}>
      {/* Main Header - Fixed position */}
      <header className="bg-white fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" 
              alt="Docs" 
              className="w-10 h-10 object-contain cursor-pointer hover:bg-gray-100 rounded p-1" 
              onClick={() => navigate("/docs")}
            />
            
            <div className="flex items-center space-x-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl font-normal border-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 px-2 py-1 rounded-sm max-w-md"
                placeholder="Untitled document"
              />
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
                <Star className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full">
                <Folder className="w-4 h-4 text-gray-600" />
              </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full" onClick={handleCopyLink}>
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCrazyMode}
              className={`w-10 h-10 hover:bg-gray-100 rounded-full ${crazyMode ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            >
              <Palette className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100 rounded-full">
              <History className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
            
            <div className="flex items-center bg-[#c8e6f5] hover:bg-[#b8d6e5] rounded-full overflow-hidden">
              <Button 
                className="bg-transparent hover:bg-transparent text-black px-4 py-2 font-medium text-sm flex items-center space-x-2 rounded-none"
                onClick={saveDocument}
                disabled={isSaving}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8C17.4 8 17 8.4 17 9v6c0 0.6 0.4 1 1 1s1-0.4 1-1V9c0-0.6-0.4-1-1-1z" fill="currentColor"/>
                  <path d="M6 10c-0.6 0-1 0.4-1 1v4c0 0.6 0.4 1 1 1s1-0.4 1-1v-4c0-0.6-0.4-1-1-1z" fill="currentColor"/>
                  <path d="M9 6c-1.1 0-2 0.9-2 2v8c0 1.1 0.9 2 2 2h6c1.1 0 2-0.9 2-2V8c0-1.1-0.9-2-2-2H9zm0 2h6v8H9V8z" fill="currentColor"/>
                </svg>
                <span>Share</span>
              </Button>
              
              <div className="w-px h-6 bg-black/20"></div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-transparent hover:bg-transparent text-black px-3 py-2 rounded-none"
                    variant="ghost"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50 rounded-lg">
                  <DropdownMenuItem 
                    className="text-sm py-2 px-3 hover:bg-gray-50 cursor-pointer"
                    onClick={handleCopyLink}
                  >
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-sm py-2 px-3 hover:bg-gray-50 cursor-pointer"
                    onClick={handleEmail}
                  >
                    Send via email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-8 h-8 bg-[#ea4335] rounded-full flex items-center justify-center text-white font-medium text-sm ml-2">
              {user?.email?.[0]?.toUpperCase() || "M"}
            </div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center px-4 py-1 text-sm -mt-6">
          <div className="flex items-center ml-[40px]">
            {[
              { 
                name: "File", 
                items: [
                  { label: "New", action: handleNewDocument },
                  { label: "Open", action: () => navigate("/") },
                  { label: "Make a copy", action: handleMakeCopy },
                  { label: "Download", action: handleDownload },
                  { label: "Email", action: handleEmail },
                  { label: "Print", action: () => window.print() }
                ]
              },
              { 
                name: "Edit", 
                items: [
                  { label: "Undo", action: handleUndo },
                  { label: "Redo", action: handleRedo },
                  { label: "Cut", action: handleCut },
                  { label: "Copy", action: handleCopy },
                  { label: "Paste", action: handlePaste }
                ]
              },
              { 
                name: "View", 
                items: [
                  { label: "Print layout", action: handleTogglePrintLayout },
                  { label: "Mode", action: handleModeSwitch },
                  { label: "Show ruler", action: handleToggleRuler },
                  { label: "Zoom", action: () => toast.info("Use zoom dropdown in toolbar") }
                ]
              },
              { 
                name: "Insert", 
                items: [
                  { label: "Image", action: handleInsertImage },
                  { label: "Table", action: handleInsertTable },
                  { label: "Drawing", action: handleInsertDrawing },
                  { label: "Chart", action: handleInsertChart },
                  { label: "Link", action: handleInsertLink }
                ]
              },
              { 
                name: "Format", 
                items: [
                  { label: "Text", action: () => toast.info("Use toolbar formatting options") },
                  { label: "Paragraph styles", action: () => toast.info("Use style dropdown in toolbar") },
                  { label: "Align & indent", action: () => toast.info("Use alignment tools in toolbar") },
                  { label: "Line & paragraph spacing", action: () => {
                    const spacing = prompt("Enter line spacing (1.0, 1.15, 1.5, 2.0):", lineSpacing);
                    if (spacing && ['1.0', '1.15', '1.5', '2.0'].includes(spacing)) {
                      handleLineSpacing(spacing);
                    }
                  }}
                ]
              },
              { 
                name: "Tools", 
                items: [
                  { label: "Spelling and grammar", action: handleSpellCheck },
                  { label: "Word count", action: handleWordCount },
                  { label: "Review suggested edits", action: handleSuggestedEdits }
                ]
              },
              { 
                name: "Extensions", 
                items: [
                  { label: "Add-ons", action: handleAddOns },
                  { label: "Apps Script", action: handleAppsScript }
                ]
              },
              { 
                name: "Help", 
                items: [
                  { label: "Search the menus", action: handleSearchMenus },
                  { label: "Docs Help", action: handleDocsHelp },
                  { label: "Training", action: handleTraining }
                ]
              }
            ].map((menu) => (
              <DropdownMenu key={menu.name}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-1 h-8 text-gray-700 hover:bg-gray-100 text-sm font-normal">
                    {menu.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {menu.items.map((item, index) => (
                    <DropdownMenuItem 
                      key={index}
                      className="text-sm py-2 px-3 hover:bg-gray-50 cursor-pointer"
                      onClick={item.action}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="w-full border-b border-gray-200">
          <div className="flex items-center justify-center px-4 py-1.5">
            <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-full px-6 py-1 w-full max-w-7xl">
              
              {/* Search */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 hover:bg-gray-200 rounded"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 hover:bg-gray-200 rounded"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
              >
                <Undo className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 hover:bg-gray-200 rounded"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 hover:bg-gray-200 rounded"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 text-gray-600" />
              </Button>
              
              {/* Format Painter */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-7 h-7 hover:bg-gray-200 rounded ${formatPainter ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={handleFormatPainter}
              >
                <Paintbrush className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-1 h-6 text-xs text-gray-700 hover:bg-gray-200 rounded min-w-16">
                    {zoom}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {["50%", "75%", "90%", "100%", "125%", "150%", "200%"].map((zoomLevel) => (
                    <DropdownMenuItem key={zoomLevel} onClick={() => setZoom(zoomLevel)} className="text-xs py-1 px-2 hover:bg-gray-50">
                      {zoomLevel}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-1 h-6 text-xs text-gray-700 hover:bg-gray-200 rounded min-w-24">
                    {textStyle}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {["Normal text", "Title", "Subtitle", "Heading 1", "Heading 2", "Heading 3"].map((style) => (
                    <DropdownMenuItem 
                      key={style} 
                      onClick={() => setTextStyle(style)} 
                      className="text-sm py-1 px-3 hover:bg-gray-50 cursor-pointer"
                      style={{ 
                        fontSize: style === 'Title' ? '20px' : style === 'Subtitle' ? '16px' : 
                                 style === 'Heading 1' ? '18px' : style === 'Heading 2' ? '16px' : 
                                 style === 'Heading 3' ? '14px' : '11px',
                        fontWeight: style.includes('Heading') || style === 'Title' ? 'bold' : 'normal'
                      }}
                    >
                      {style}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-1 h-6 text-xs text-gray-700 hover:bg-gray-200 rounded min-w-20">
                    {fontFamily}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {["Arial", "Calibri", "Georgia", "Times New Roman", "Helvetica", "Comic Sans MS"].map((font) => (
                    <DropdownMenuItem key={font} onClick={() => setFontFamily(font)} className="text-xs py-1 px-2 hover:bg-gray-50">
                      <span style={{ fontFamily: font }}>{font}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center bg-gray-50 rounded px-1 py-0.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const newSize = Math.max(8, parseInt(fontSize) - 1);
                    setFontSize(newSize.toString());
                  }}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  value={fontSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && parseInt(value) <= 96) {
                      setFontSize(value);
                    }
                  }}
                  className="w-6 h-5 text-center text-xs font-medium border-none bg-transparent px-0.5"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-5 h-5 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const newSize = Math.min(96, parseInt(fontSize) + 1);
                    setFontSize(newSize.toString());
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-7 h-7 hover:bg-gray-200 rounded ${isBold ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setIsBold(!isBold)}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-7 h-7 hover:bg-gray-200 rounded ${isItalic ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setIsItalic(!isItalic)}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-7 h-7 hover:bg-gray-200 rounded ${isUnderline ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                onClick={() => setIsUnderline(!isUnderline)}
              >
                <Underline className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
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
                          onClick={() => {
                            setTextColor(color);
                            toast.success(`Text color changed to ${color}`);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
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
                          onClick={() => {
                            setBackgroundColor(color);
                            toast.success(`Highlight color changed to ${color === 'transparent' ? 'none' : color}`);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded" onClick={handleInsertLink}>
                <Link className="w-4 h-4 text-gray-600" />
              </Button>
              
              {/* Add Comment */}
              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded" onClick={handleAddComment}>
                <MessageSquarePlus className="w-4 h-4 text-gray-600" />
              </Button>
              
              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded" onClick={handleInsertImage}>
                <Image className="w-4 h-4 text-gray-600" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
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

              {/* Line Spacing */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
                    <LineSpacing className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <DropdownMenuItem onClick={() => handleLineSpacing('1.0')} className="text-sm py-1 px-3 hover:bg-gray-50">
                    Single
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLineSpacing('1.15')} className="text-sm py-1 px-3 hover:bg-gray-50">
                    1.15
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLineSpacing('1.5')} className="text-sm py-1 px-3 hover:bg-gray-50">
                    1.5
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLineSpacing('2.0')} className="text-sm py-1 px-3 hover:bg-gray-50">
                    Double
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
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

              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
                <Outdent className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded">
                <Indent className="w-4 h-4 text-gray-600" />
              </Button>
              
              {/* Clear Formatting */}
              <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200 rounded" onClick={handleClearFormatting}>
                <RemoveFormatting className="w-4 h-4 text-gray-600" />
              </Button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-1 h-6 text-xs text-gray-700 hover:bg-gray-200 rounded min-w-20">
                    {editingMode}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <DropdownMenuItem 
                    onClick={() => setEditingMode("Editing")} 
                    className="text-sm py-1 px-3 hover:bg-gray-50 cursor-pointer"
                  >
                    Editing
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setEditingMode("Suggesting")} 
                    className="text-sm py-1 px-3 hover:bg-gray-50 cursor-pointer"
                  >
                    Suggesting
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setEditingMode("Viewing")} 
                    className="text-sm py-1 px-3 hover:bg-gray-50 cursor-pointer"
                  >
                    Viewing
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Ruler */}
        {showRuler && (
          <div className="w-full bg-white border-b border-gray-200 flex justify-center">
            <div className="relative h-6 w-[21cm]" style={{ transform: `scale(${parseInt(zoom) / 100})` }}>
              <div className="absolute inset-0 flex">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="flex-1 relative">
                    <div className="absolute bottom-1 left-0 w-px h-3 bg-gray-400"></div>
                    <span className="absolute bottom-4 left-0 text-xs text-gray-500 transform -translate-x-1/2">{i + 1}</span>
                    {/* Half marks */}
                    <div className="absolute bottom-1 left-1/2 w-px h-1 bg-gray-300"></div>
                  </div>
                ))}
                {/* 9th marker at the very right */}
                <div className="absolute bottom-1 right-0 w-px h-3 bg-gray-400"></div>
                <span className="absolute bottom-4 right-0 text-xs text-gray-500 transform translate-x-1/2">9</span>
                {/* Left margin indicator - blue triangle */}
                <div className="absolute bottom-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#4285f4]" style={{ left: `${margins.left}px` }}></div>
                {/* First line indent - blue rectangle */}
                <div className="absolute bottom-0 w-2 h-1 bg-[#4285f4]" style={{ left: `${margins.left + 24}px` }}></div>
                {/* Right margin indicator - blue triangle */}
                <div className="absolute bottom-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#4285f4]" style={{ right: `${margins.right}px` }}></div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="relative min-h-screen pt-32 bg-[#f8f9fa]">
        {/* Vertical Ruler Sidebar */}
        <div className="w-6 bg-white border-r border-gray-300 fixed top-32 bottom-0 left-0">
          {/* Vertical ruler that scrolls with document - starts aligned with document content */}
          <div className="relative" style={{ paddingTop: '96px' }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="relative" style={{ height: '82px' }}>
                <div className="absolute left-1 w-3 h-px bg-gray-400"></div>
                <span className="absolute left-5 top-0 text-xs text-gray-500 transform -rotate-90 origin-left whitespace-nowrap">{i + 1}</span>
                {/* Quarter marks */}
                <div className="absolute left-1 w-1 h-px bg-gray-300" style={{ top: '20.5px' }}></div>
                <div className="absolute left-1 w-2 h-px bg-gray-300" style={{ top: '41px' }}></div>
                <div className="absolute left-1 w-1 h-px bg-gray-300" style={{ top: '61.5px' }}></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Left Sidebar - Fixed position */}
        <div className="w-80 bg-[#f8f9fa] fixed top-32 bottom-0 left-6 overflow-y-auto">
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
            
            <div className="bg-[#c8e6f5] hover:bg-[#b8d6e5] transition-colors duration-200 rounded-full p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-black">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-black">Tab 1</span>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-[#a8c6a9] rounded-full">
                  <MoreVertical className="w-4 h-4 text-black" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic">
              Headings you add to the document will appear here.
            </p>
          </div>
        </div>

        {/* Document Area */}
        <div className="w-full min-h-full flex justify-center">
          <div className="w-full max-w-5xl bg-[#f8f9fa]" style={{ paddingTop: '96px', paddingLeft: '32px', paddingRight: '32px', paddingBottom: '32px' }}>
            <div
              ref={pageRef}
              className="bg-white shadow-sm border border-gray-300 w-[21cm] mx-auto relative"
              style={{ 
                height: '738px', // Height matches 9 ruler marks (82px * 9 = 738px)
                transform: `scale(${parseInt(zoom) / 100})`,
                transformOrigin: 'top center',
                marginBottom: `${(1 - parseInt(zoom) / 100) * 800}px`
              }}
            >
              <div ref={contentRef} className="p-16 h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 opacity-0 hover:opacity-100 transition-opacity cursor-row-resize"></div>
                <div className="w-1 h-full border-l border-gray-200 absolute top-0 left-12"></div>
                <div className="w-1 h-full border-l border-gray-200 absolute top-0 right-12"></div>
                
                <textarea
                  ref={textAreaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start typing..."
                  className={`w-full h-full border-none outline-none resize-none bg-transparent leading-6 ${showSpellCheck ? 'spell-check-active' : ''}`}
                  readOnly={editingMode === 'Viewing'}
                  style={{ 
                    fontFamily: fontFamily,
                    fontSize: textStyle === 'Title' ? '28pt' : textStyle === 'Subtitle' ? '18pt' : 
                             textStyle === 'Heading 1' ? '20pt' : textStyle === 'Heading 2' ? '16pt' : 
                             textStyle === 'Heading 3' ? '14pt' : `${fontSize}pt`,
                    fontWeight: isBold || textStyle.includes('Heading') || textStyle === 'Title' ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isUnderline ? 'underline' : 'none',
                    textAlign: alignment as any,
                    color: textColor,
                    backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
                    lineHeight: lineSpacing,
                    cursor: editingMode === 'Viewing' ? 'default' : 'text'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crazy CAPTCHA Modal */}
      {showCrazyCaptcha && (
        <Dialog open={showCrazyCaptcha} onOpenChange={setShowCrazyCaptcha}>
          <DialogContent className={`max-w-md ${crazyMode ? 'filter invert' : ''}`}>
            <DialogHeader>
              <DialogTitle className="text-center text-red-600 text-xl font-bold">
                🤖 CRAZY CAPTCHA 🤖
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-lg font-medium text-purple-600">
                Prove you're not a robot!
              </p>
              <div className="bg-gradient-to-r from-pink-200 to-yellow-200 p-4 rounded-lg border-4 border-dashed border-rainbow">
                <p className="text-xl font-bold text-blue-800">
                  {captchaQuestion}
                </p>
              </div>
              <Input
                value={userCaptchaAnswer}
                onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="text-center text-lg font-bold border-2 border-green-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    verifyCaptcha();
                  }
                }}
              />
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={verifyCaptcha}
                  className="bg-rainbow bg-gradient-to-r from-red-500 to-blue-500 hover:from-blue-500 hover:to-red-500 text-white font-bold"
                >
                  ✨ VERIFY ✨
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCrazyCaptcha(false)}
                  className="border-2 border-gray-600"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-500 italic">
                Warning: Incorrect answers may result in spontaneous document transformation! 🎭
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}