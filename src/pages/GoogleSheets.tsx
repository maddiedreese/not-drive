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

const spreadsheetTemplates = [
  {
    id: "blank",
    title: "Blank spreadsheet",
    preview: "/lovable-uploads/fc341c1a-c84e-4871-ba13-962c23a89cea.png",
    type: "spreadsheet"
  },
  {
    id: "invoice",
    title: "Invoice",
    preview: "/placeholder-template.png",
    type: "spreadsheet"
  },
  {
    id: "timesheet",
    title: "Weekly time sheet",
    preview: "/placeholder-template.png",
    type: "spreadsheet"
  },
  {
    id: "expense",
    title: "Expense report",
    preview: "/placeholder-template.png",
    type: "spreadsheet"
  },
  {
    id: "gantt",
    title: "Gantt chart",
    subtitle: "by Smartsheet",
    preview: "/placeholder-template.png",
    type: "spreadsheet"
  },
  {
    id: "financial",
    title: "Annual financial data",
    preview: "/placeholder-template.png",
    type: "spreadsheet"
  }
];

export default function GoogleSheets() {
  const { user } = useAuth();
  const { crazyMode, toggleCrazyMode } = useCrazyMode();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSpreadsheet = async (template: typeof spreadsheetTemplates[0]) => {
    if (!user) {
      toast.error("Please sign in to create spreadsheets");
      return;
    }

    console.log('Creating spreadsheet from template:', template.id, template.title, 'user:', user.id);
    setIsCreating(true);
    try {
      const spreadsheetName = template.id === "blank" ? "Untitled spreadsheet" : `${template.title} - ${new Date().toLocaleDateString()}`;
      
      const { data, error } = await supabase.from('documents').insert([
        {
          user_id: user.id,
          name: spreadsheetName,
          type: 'spreadsheet',
          is_folder: false,
          content: template.id === "blank" ? "" : `Template: ${template.title}`,
        },
      ]).select().single();

      if (error) {
        console.error('Spreadsheet insert error:', error);
        throw error;
      }

      console.log('Spreadsheet created successfully:', data);
      toast.success(`${spreadsheetName} created successfully`);
      
      // Refresh the drive view (same-tab)
      window.dispatchEvent(new Event('documents:refresh'));
      
      // Cross-tab refresh via BroadcastChannel + localStorage fallback
      try {
        const bc = new BroadcastChannel('documents');
        bc.postMessage('refresh');
        bc.close();
      } catch {}
      try { localStorage.setItem('documents:refresh-token', Date.now().toString()); } catch {}
      
      // Navigate to spreadsheet editor
      navigate(`/spreadsheet/${data.id}`);
    } catch (error: any) {
      console.error('Spreadsheet creation failed:', error);
      toast.error(error.message || 'Failed to create spreadsheet');
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
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/fc341c1a-c84e-4871-ba13-962c23a89cea.png" alt="Sheets" className="w-8 h-8 object-contain" />
              <span className="text-xl font-normal text-gray-700">Sheets</span>
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
            <h2 className="text-lg font-normal text-gray-700">Start a new spreadsheet</h2>
            
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {spreadsheetTemplates.map((template) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
                onClick={() => {
                  console.log('Spreadsheet template clicked:', template.id, template.title);
                  handleCreateSpreadsheet(template);
                }}
              >
                <div className="aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden">
                  {template.id === "blank" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded border-2 border-gray-300 flex items-center justify-center">
                        <div className="text-green-600 text-3xl font-bold">+</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <div className="text-xs text-gray-400 text-center p-2">
                        Template Preview
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{template.title}</h3>
                  {template.subtitle && (
                    <p className="text-xs text-gray-500">{template.subtitle}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Spreadsheets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-normal text-gray-700">Recent spreadsheets</h2>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Owned by anyone
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                Last opened by me
              </Button>
              <Button variant="ghost" size="icon">
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Empty state */}
          <div className="text-center py-16">
            <p className="text-gray-600 mb-2">No spreadsheets yet</p>
            <p className="text-sm text-gray-500">
              Select a blank spreadsheet or choose another template above to get started
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}