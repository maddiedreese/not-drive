import { useState } from "react";
import { Search, LayoutGrid, Settings, HelpCircle, Grid3X3, List, Upload, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "./GoogleDriveSidebar";
import { FileGrid } from "./FileGrid";
import { Breadcrumbs } from "./Breadcrumbs";

export function GoogleDriveLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPath, setCurrentPath] = useState(["My Drive"]);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-border bg-background px-4 flex items-center gap-4">
        {/* Google Drive Logo */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">G</span>
          </div>
          <h1 className="text-xl font-normal text-foreground">Drive</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search in Drive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted/50 border-0 rounded-full focus:bg-background focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">U</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Breadcrumbs path={currentPath} onNavigate={setCurrentPath} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} 
                      className={viewMode === "grid" ? "bg-muted" : ""}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-muted" : ""}>
                <List className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm" className="gap-2">
                <FolderPlus className="w-4 h-4" />
                New folder
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* File Content Area */}
          <div className="flex-1 p-6">
            <FileGrid viewMode={viewMode} searchQuery={searchQuery} currentPath={currentPath} />
          </div>
        </main>
      </div>
    </div>
  );
}