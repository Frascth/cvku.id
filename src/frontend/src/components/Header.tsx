import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./ThemeSelector";
import {
  FileText,
  Settings,
  BarChart3,
  Brain,
  Palette,
  Sparkle,
  Sparkles,
  WandSparkles,
  Link2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Header: React.FC = () => {
  const location = useLocation();

  const { logout, isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={"./logo-full.png"} className="w-32" />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/builder"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/builder") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <WandSparkles className="w-4 h-4" />
              Builder
            </Link>
            <Link
              to="/templates"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/templates")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Palette className="w-4 h-4" />
              Templates
            </Link>
            <Link
              to="/assessment"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/assessment")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Brain className="w-4 h-4" />
              Assessment
            </Link>
            <Link
              to="/analytics"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/analytics")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              to="/spark"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/spark") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Spark
            </Link>
              <Link 
              to="/create-link" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive('/create-link') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Public Link
            </Link>
            <Link
              to="/settings"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive("/settings") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* <ThemeSelector /> */}
            {isAuthenticated ? (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Export PDF
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
