
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Palette, FileText } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const TemplateSelector: React.FC = () => {
  const { selectedTemplate, setTemplate } = useResumeStore();
  const { toast } = useToast();

  const templates = [
    {
      id: 'minimal' as const,
      name: 'Minimal',
      description: 'Clean and simple design',
      icon: FileText,
      preview: 'Simple layout with clean typography'
    },
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Contemporary design with visual elements',
      icon: Palette,
      preview: 'Colorful sections with modern styling'
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      description: 'Traditional corporate style',
      icon: Layout,
      preview: 'Two-column layout with sidebar'
    }
  ];

  const handleTemplateChange = (templateId: 'minimal' | 'modern' | 'professional') => {
    setTemplate(templateId);
    toast({
      title: "Template Changed",
      description: `Switched to ${templates.find(t => t.id === templateId)?.name} template`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Layout className="w-5 h-5" />
          <span>Template Selection</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const IconComponent = template.icon;
            const isSelected = selectedTemplate === template.id;
            
            return (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <div className="text-center space-y-3">
                  <IconComponent 
                    className={`w-8 h-8 mx-auto ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} 
                  />
                  <div>
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {template.preview}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="text-xs text-blue-600 font-medium">
                      ✓ Currently Selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Choose a template that matches your industry. 
            Minimal for tech roles, Professional for corporate positions, Modern for creative fields.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
