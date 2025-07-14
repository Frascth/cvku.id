
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';

export const PreviewPanel: React.FC = () => {
  const { selectedTemplate, resumeData } = useResumeStore();

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate data={resumeData} />;
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      default:
        return <ModernTemplate data={resumeData} />;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <span>Live Preview</span>
          <span className="text-sm font-normal text-gray-500 capitalize">
            ({selectedTemplate} template)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="transform scale-75 origin-top-left w-[133.33%] h-auto">
            {renderTemplate()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
