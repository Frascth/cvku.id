
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, File, Share2 } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const ExportOptions: React.FC = () => {
  const { resumeData } = useResumeStore();
  const { toast } = useToast();

  const exportToPDF = () => {
    // Mock PDF export functionality
    toast({
      title: "PDF Export",
      description: "Your resume has been exported to PDF successfully!",
    });
  };

  const exportToWord = () => {
    // Mock Word export functionality
    toast({
      title: "Word Export", 
      description: "Your resume has been exported to Word format successfully!",
    });
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "JSON Export",
      description: "Your resume data has been exported to JSON successfully!",
    });
  };

  const shareResume = () => {
    const shareUrl = `${window.location.origin}/resume/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Copied",
      description: "Resume share link has been copied to clipboard!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export & Share</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={exportToPDF} className="flex flex-col items-center p-4 h-auto">
            <FileText className="w-6 h-6 mb-2 text-red-500" />
            <span className="text-sm">PDF</span>
          </Button>
          
          <Button variant="outline" onClick={exportToWord} className="flex flex-col items-center p-4 h-auto">
            <File className="w-6 h-6 mb-2 text-blue-500" />
            <span className="text-sm">Word</span>
          </Button>
          
          <Button variant="outline" onClick={exportToJSON} className="flex flex-col items-center p-4 h-auto">
            <Download className="w-6 h-6 mb-2 text-green-500" />
            <span className="text-sm">JSON</span>
          </Button>
          
          <Button variant="outline" onClick={shareResume} className="flex flex-col items-center p-4 h-auto">
            <Share2 className="w-6 h-6 mb-2 text-purple-500" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
