import { useState } from "react";
import { 
  Home,
  Activity,
  Briefcase,
  HardDrive, 
  Users, 
  Clock, 
  Star, 
  AlertOctagon,
  Trash2, 
  Cloud,
  Settings,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Activity", icon: Activity },
  { label: "Workspaces", icon: Briefcase },
  { label: "My Drive", icon: HardDrive, hasExpander: true },
  { label: "Shared drives", icon: Users, hasExpander: true },
  { label: "Shared with me", icon: Users },
  { label: "Recent", icon: Clock },
  { label: "Starred", icon: Star },
  { label: "Spam", icon: AlertOctagon },
  { label: "Trash", icon: Trash2 }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const storageUsed = 2.1; // GB
  const storageTotal = 15; // GB
  const storagePercentage = (storageUsed / storageTotal) * 100;

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col">
      <div className="p-3">
        {/* New Button */}
        <Button className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full shadow-sm font-medium">
          <Plus className="w-5 h-5 mr-2" />
          New
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start h-8 px-3 rounded-full text-sm font-normal",
                item.active 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-3 rounded text-sm text-gray-700 hover:bg-gray-100"
        >
          <Settings className="w-5 h-5 mr-3" />
          Admin console
        </Button>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Cloud className="w-4 h-4" />
            <span>Storage</span>
          </div>
          <Progress value={storagePercentage} className="h-1.5" />
          <div className="text-xs text-gray-500">
            0 bytes of shared {storageTotal} GB used
          </div>
        </div>
      </div>
    </div>
  );
}