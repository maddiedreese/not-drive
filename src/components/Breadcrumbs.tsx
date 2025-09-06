import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbsProps {
  path: string[];
  onNavigate: (newPath: string[]) => void;
}

export function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  const handleNavigate = (index: number) => {
    onNavigate(path.slice(0, index + 1));
  };

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {path.map((segment, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
          <Button
            variant="ghost"
            className={`h-8 px-2 ${
              index === path.length - 1
                ? "text-foreground font-medium cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            onClick={() => index < path.length - 1 && handleNavigate(index)}
          >
            {segment}
          </Button>
        </div>
      ))}
    </nav>
  );
}