import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useCrazyMode } from "@/components/CrazyModeProvider";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { crazyMode, toggleCrazyMode } = useCrazyMode();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 ${crazyMode ? 'invert' : ''}`}>
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleCrazyMode}
          className={crazyMode ? "bg-purple-100 text-purple-600" : ""}
        >
          <Palette className="w-5 h-5" />
        </Button>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
