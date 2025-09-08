import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { CrazyModeProvider } from "@/components/CrazyModeProvider";
import Index from "./pages/Index";
import GoogleDocs from "./pages/GoogleDocs";
import MyDrive from "./pages/MyDrive";
import SharedDrives from "./pages/SharedDrives";
import Recent from "./pages/Recent";
import Trash from "./pages/Trash";
import DocumentEditor from "./pages/DocumentEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CrazyModeProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/docs" element={<GoogleDocs />} />
            <Route path="/my-drive" element={<MyDrive />} />
            <Route path="/shared-drives" element={<SharedDrives />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/document/:documentId" element={<DocumentEditor />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </CrazyModeProvider>
  </QueryClientProvider>
);

export default App;
