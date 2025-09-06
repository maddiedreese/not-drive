import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Share2, Menu, MoreHorizontal } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/34bbee19-7259-4cec-8abb-c0f595c8f7ae.png" alt="Docs" className="w-8 h-8" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-normal border-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500"
                placeholder="Untitled document"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={saveDocument}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Print</DropdownMenuItem>
                <DropdownMenuItem>Download as PDF</DropdownMenuItem>
                <DropdownMenuItem>Version history</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg min-h-[800px]">
          <div className="p-12">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your document..."
              className="w-full min-h-[700px] border-none text-base leading-relaxed resize-none focus:ring-0 focus:outline-none"
              style={{ fontFamily: "Georgia, serif" }}
            />
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm">
        Last saved: {new Date(document.updated_at).toLocaleTimeString()}
      </div>
    </div>
  );
}