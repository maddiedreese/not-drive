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
import googleDriveLogo from "@/assets/google-drive-logo.png";

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
    <div className="w-64 bg-[#f8f9fa] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 pb-2">
      </div>

      <div className="px-4 pb-4 flex justify-start">
        {/* New Button */}
        <Button className="h-12 bg-white hover:bg-[#f8f9fa] text-[#3c4043] border border-[#dadce0] rounded-2xl font-medium transition-all duration-200 hover:shadow-md hover:border-[#d2e3fc] justify-start px-6" style={{boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.1)'}}>
          <Plus className="w-5 h-5 mr-3" />
          New
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {/* First Group */}
        <div className="space-y-0.5 mb-6">
          {sidebarItems.slice(0, 3).map((item) => {
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
        </div>

        {/* Second Group - My Drive */}
        <div className="space-y-0.5 mb-6">
          {sidebarItems.slice(3, 4).map((item) => {
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
        </div>

        {/* Third Group - Shared drives */}
        <div className="space-y-0.5">
          {sidebarItems.slice(4, 5).map((item) => {
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
        </div>

        {/* Fourth Group - Shared with me */}
        <div className="space-y-0.5 mt-6 mb-6">
          {sidebarItems.slice(5, 6).map((item) => {
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
        </div>

        {/* Fifth Group - Recent, Starred */}
        <div className="space-y-0.5 mb-6">
          {sidebarItems.slice(6, 8).map((item) => {
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
        </div>

        {/* Sixth Group - Spam, Trash */}
        <div className="space-y-0.5 mb-6">
          {sidebarItems.slice(8, 10).map((item) => {
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
        </div>

        {/* Seventh Group - Storage */}
        <div className="space-y-0.5">
          {sidebarItems.slice(10).map((item) => {
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
        </div>
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