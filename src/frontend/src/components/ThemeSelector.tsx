
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useToast } from '@/hooks/use-toast';

export const ThemeSelector: React.FC = () => {
  const { 
    currentTheme, 
    currentFont, 
    availableThemes, 
    availableFonts, 
    setTheme, 
    setFont 
  } = useThemeStore();
  const { toast } = useToast();

  const handleThemeChange = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setTheme(theme);
      toast({
        title: "Theme Changed",
        description: `Applied ${theme.name} color scheme`,
      });
    }
  };

  const handleFontChange = (fontId: string) => {
    const font = availableFonts.find(f => f.id === fontId);
    if (font) {
      setFont(font);
      toast({
        title: "Font Changed",
        description: `Applied ${font.name} typography`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Theme & Typography</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Themes */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Color Scheme</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  currentTheme.id === theme.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="space-y-2">
                  <div className="flex space-x-1 h-4">
                    <div 
                      className="flex-1 rounded-sm" 
                      style={{ backgroundColor: theme.colors.primary }}
                    ></div>
                    <div 
                      className="flex-1 rounded-sm" 
                      style={{ backgroundColor: theme.colors.secondary }}
                    ></div>
                    <div 
                      className="flex-1 rounded-sm" 
                      style={{ backgroundColor: theme.colors.accent }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{theme.name}</div>
                    {currentTheme.id === theme.id && (
                      <div className="text-xs text-blue-600">✓ Active</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Typography</span>
          </h3>
          <Select value={currentFont.id} onValueChange={handleFontChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent>
              {availableFonts.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  <span style={{ fontFamily: font.family }}>
                    {font.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p 
              className="text-sm"
              style={{ fontFamily: currentFont.family }}
            >
              <strong>Preview:</strong> This is how your resume text will look with {currentFont.name} font family.
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-amber-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Typography Tips:</p>
          <ul className="space-y-1">
            <li>• Use serif fonts for traditional/academic roles</li>
            <li>• Sans-serif fonts work well for modern/tech positions</li>
            <li>• Ensure good readability across different devices</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
