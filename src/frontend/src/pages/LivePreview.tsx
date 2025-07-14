
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/useResumeStore';
import { MinimalTemplate } from '../components/templates/MinimalTemplate';
import { ModernTemplate } from '../components/templates/ModernTemplate';
import { ProfessionalTemplate } from '../components/templates/ProfessionalTemplate';

const LivePreview = () => {
  const navigate = useNavigate();
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

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
  };

  const handleShare = () => {
    console.log('Sharing resume...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Editor</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span>Live Preview</span>
                </h1>
                <p className="text-sm text-gray-600 capitalize">
                  {selectedTemplate} template
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
              <Button
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-0">
              <div className="bg-white">
                {renderTemplate()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
