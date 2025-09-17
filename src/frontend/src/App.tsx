import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Builder from "./pages/Builder";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Assessment from "./pages/Assessment";
import Templates from "./pages/Templates";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import LivePreview from "./pages/LivePreview";
import { AuthProvider } from "./providers/AuthProvider";
import Spark from "./pages/Spark";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/live-preview" element={<LivePreview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/spark" element={<Spark />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
