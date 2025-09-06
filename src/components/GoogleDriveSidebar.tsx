import { useState } from "react";
import { 
  HardDrive, 
  Clock, 
  Star, 
  Users, 
  Trash2, 
  Cloud,
  ChevronDown,
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "My Drive", icon: HardDrive, active: true },
  { label: "Computers", icon: HardDrive },
  { label: "Shared with me", icon: Users },
  { label: "Recent", icon: Clock },
  { label: "Starred", icon: Star },
  { label: "Trash", icon: Trash2 }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const storageUsed = 2.1; // GB
  const storageTotal = 15; // GB
  const storagePercentage = (storageUsed / storageTotal) * 100;

  return (
    <div className={cn("border-r border-border bg-background", collapsed ? "w-16" : "w-64")}>
      <div className="p-4 space-y-4">
        {/* New Button */}
        {!collapsed && (
          <Button className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            New
          </Button>
        )}

        {collapsed && (
          <Button size="icon" className="w-12 h-12 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full shadow-md mx-auto">
            <Plus className="w-5 h-5" />
          </Button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 rounded-full",
                  item.active 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Storage Section */}
        {!collapsed && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="w-4 h-4" />
              <span>Storage</span>
            </div>
            
            <div className="space-y-2">
              <Progress value={storagePercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {storageUsed} GB of {storageTotal} GB used
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              Get more storage
            </Button>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 text-muted-foreground hover:bg-muted"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}