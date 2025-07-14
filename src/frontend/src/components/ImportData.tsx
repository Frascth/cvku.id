
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';
import { ResumeData } from '../store/useResumeStore';

export const ImportData: React.FC = () => {
  const { resumeData, updatePersonalInfo, addWorkExperience, addEducation, addSkill, addCertification } = useResumeStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string) as ResumeData;
        
        // Import personal info
        updatePersonalInfo(jsonData.personalInfo);
        
        // Import work experience
        jsonData.workExperience.forEach(exp => {
          const { id, ...expData } = exp;
          addWorkExperience(expData);
        });
        
        // Import education
        jsonData.education.forEach(edu => {
          const { id, ...eduData } = edu;
          addEducation(eduData);
        });
        
        // Import skills
        jsonData.skills.forEach(skill => {
          const { id, ...skillData } = skill;
          addSkill(skillData);
        });
        
        // Import certifications
        jsonData.certifications.forEach(cert => {
          const { id, ...certData } = cert;
          addCertification(certData);
        });
        
        toast({
          title: "Import Successful",
          description: "Your resume data has been imported successfully!",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import resume data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const simulateLinkedInImport = () => {
    toast({
      title: "LinkedIn Import",
      description: "LinkedIn import feature coming soon! Connect your account to import profile data.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Import Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 p-4"
          >
            <FileText className="w-5 h-5" />
            <span>Import from JSON</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={simulateLinkedInImport}
            className="flex items-center justify-center space-x-2 p-4"
          >
            <div className="w-5 h-5 bg-blue-600 rounded" />
            <span>Import from LinkedIn</span>
          </Button>
        </div>
        
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Import Tips:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>JSON files should match the resume data format</li>
              <li>Imported data will be added to existing content</li>
              <li>LinkedIn import requires account connection</li>
            </ul>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
