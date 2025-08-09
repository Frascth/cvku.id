
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Wand2, Download, Eye, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CoverLetterData {
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  tone: string;
  introduction: string;
  body: string;
  conclusion: string;
}

export const CoverLetterBuilder: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    recipientName: '',
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    tone: 'professional',
    introduction: '',
    body: '',
    conclusion: ''
  });

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'confident', label: 'Confident' },
    { value: 'creative', label: 'Creative' }
  ];

  const templates = [
    {
      id: 'traditional',
      name: 'Traditional',
      description: 'Classic formal business letter format'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary style with a personal touch'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Unique format for creative industries'
    },
    {
      id: 'tech',
      name: 'Tech',
      description: 'Technical focus for IT and software roles'
    }
  ];

  const handleInputChange = (field: keyof CoverLetterData, value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCoverLetter = async () => {
    if (!coverLetterData.companyName || !coverLetterData.jobTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in the company name and job title to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const generatedContent = {
      introduction: `Dear ${coverLetterData.recipientName || 'Hiring Manager'},\n\nI am writing to express my strong interest in the ${coverLetterData.jobTitle} position at ${coverLetterData.companyName}. With my background in relevant experience and passion for the industry, I am excited about the opportunity to contribute to your team.`,
      
      body: `In my previous roles, I have developed skills that directly align with the requirements for this position. My experience includes:\n\n• Leading cross-functional teams to deliver high-impact projects\n• Implementing innovative solutions that improved efficiency by 30%\n• Collaborating with stakeholders to drive strategic initiatives\n\nI am particularly drawn to ${coverLetterData.companyName} because of your commitment to innovation and excellence in the industry. Your recent achievements in market expansion align perfectly with my career goals and expertise.`,
      
      conclusion: `I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to ${coverLetterData.companyName}'s continued success. Thank you for considering my application. I look forward to hearing from you soon.\n\nSincerely,\n[Your Name]`
    };

    setCoverLetterData(prev => ({
      ...prev,
      ...generatedContent
    }));

    setIsGenerating(false);
    setActiveTab('editor');
    
    toast({
      title: "Cover Letter Generated!",
      description: "Your AI-generated cover letter is ready for review and customization.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Cover Letter Saved",
      description: "Your cover letter has been saved successfully.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Cover Letter",
      description: "Your cover letter is being prepared for download.",
    });
  };

  const getFullCoverLetter = () => {
    return `${coverLetterData.introduction}\n\n${coverLetterData.body}\n\n${coverLetterData.conclusion}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Cover Letter Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={coverLetterData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={coverLetterData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={coverLetterData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder="Hiring Manager (optional)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={coverLetterData.tone}
                    onValueChange={(value) => handleInputChange('tone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                  <Textarea
                    id="jobDescription"
                    value={coverLetterData.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    placeholder="Paste job description for better customization"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={generateCoverLetter}
                disabled={isGenerating}
                size="lg"
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Cover Letter</span>
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={coverLetterData.introduction}
                  onChange={(e) => handleInputChange('introduction', e.target.value)}
                  placeholder="Write your opening paragraph..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={coverLetterData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                  placeholder="Write the main content of your cover letter..."
                  rows={8}
                />
              </div>
              
              <div>
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={coverLetterData.conclusion}
                  onChange={(e) => handleInputChange('conclusion', e.target.value)}
                  placeholder="Write your closing paragraph..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <Button size="sm" className="w-full">
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white border rounded-lg p-8 max-w-2xl mx-auto">
              <div className="space-y-4 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap">
                  {getFullCoverLetter() || "Generate or write your cover letter to see the preview."}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Full Screen Preview
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
