import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Activity", icon: Bell },
  { label: "Workspaces", icon: Users },
  { label: "My Drive", icon: Folder, hasExpander: true },
  { label: "Shared drives", icon: UsersRound, hasExpander: true },
  { label: "Shared with me", icon: UsersRound, highlighted: true },
  { label: "Recent", icon: Clock },
  { label: "Starred", icon: Star },
  { label: "Spam", icon: Info },
  { label: "Trash", icon: Trash2 },
  { label: "Storage", icon: Cloud, subtext: "0 bytes used" }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-64 bg-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <svg viewBox="0 0 48 48" className="w-10 h-10">
              <polygon fill="#0066DA" points="16,10.85 26.42,4 38,20 27.58,26.85"/>
              <polygon fill="#00AC47" points="27.58,26.85 38,20 48,36 37.58,42.85"/>
              <polygon fill="#EA4335" points="10,36 20.42,42.85 32,26 21.58,20"/>
              <polygon fill="#FFBA00" points="21.58,20 32,26 42.42,10.85 32,4"/>
            </svg>
          </div>
          <h1 className="text-[22px] text-[#5f6368] font-normal font-roboto">Drive</h1>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* New Button */}
        <Button className="w-full h-12 bg-white hover:bg-[#fafbfd] text-[#3c4043] border border-[#dadce0] rounded-3xl shadow-sm font-medium transition-all duration-200 hover:shadow-md hover:border-[#d2e3fc] hover:bg-[#f8f9fa]">
          <Plus className="w-5 h-5 mr-3" />
          New
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="relative">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-8 px-3 rounded-full text-sm font-normal transition-colors relative",
                  item.active 
                    ? "bg-[#c2e7ff] text-[#041e49] font-medium" 
                    : item.highlighted
                    ? "bg-[#f1f3f4] text-[#3c4043]"
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