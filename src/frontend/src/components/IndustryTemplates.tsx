
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Palette, TrendingUp, Stethoscope, Briefcase, GraduationCap, Building } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  preview: string;
  premium: boolean;
}

export const IndustryTemplates: React.FC = () => {
  const { setTemplate } = useResumeStore();
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const templates: IndustryTemplate[] = [
    {
      id: 'tech-modern',
      name: 'Tech Modern',
      industry: 'Technology',
      icon: Code,
      description: 'Clean, modern design perfect for software developers and tech professionals',
      features: ['GitHub integration', 'Skills visualization', 'Project showcase', 'ATS optimized'],
      preview: 'Modern layout with technical skills prominence',
      premium: false
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio',
      industry: 'Design',
      icon: Palette,
      description: 'Visual-focused template for designers and creative professionals',
      features: ['Portfolio gallery', 'Color customization', 'Creative layouts', 'Visual hierarchy'],
      preview: 'Creative design with visual portfolio section',
      premium: true
    },
    {
      id: 'business-executive',
      name: 'Executive',
      industry: 'Business',
      icon: Briefcase,
      description: 'Professional template for executives and business leaders',
      features: ['Leadership focus', 'Achievement highlights', 'Executive summary', 'Clean design'],
      preview: 'Professional two-column layout',
      premium: false
    },
    {
      id: 'marketing-dynamic',
      name: 'Marketing Pro',
      industry: 'Marketing',
      icon: TrendingUp,
      description: 'Dynamic template highlighting marketing achievements and campaigns',
      features: ['Campaign showcase', 'Metrics display', 'Social proof', 'ROI highlights'],
      preview: 'Results-focused layout with metrics',
      premium: true
    },
    {
      id: 'healthcare-professional',
      name: 'Healthcare',
      industry: 'Healthcare',
      icon: Stethoscope,
      description: 'Professional template for healthcare workers and medical professionals',
      features: ['Certification focus', 'Clinical experience', 'Medical format', 'Trust building'],
      preview: 'Clean medical professional layout',
      premium: false
    },
    {
      id: 'academic-research',
      name: 'Academic',
      industry: 'Education',
      icon: GraduationCap,
      description: 'Comprehensive template for academics and researchers',
      features: ['Publication list', 'Research focus', 'Academic achievements', 'Conference talks'],
      preview: 'Academic CV format with publications',
      premium: true
    },
    {
      id: 'consulting-minimal',
      name: 'Consulting',
      industry: 'Consulting',
      icon: Building,
      description: 'Minimal, professional template for consultants',
      features: ['Client focus', 'Project outcomes', 'Industry expertise', 'Problem-solving'],
      preview: 'Minimal professional consulting layout',
      premium: false
    }
  ];

  const industries = [
    { id: 'all', name: 'All Industries' },
    { id: 'Technology', name: 'Technology' },
    { id: 'Design', name: 'Design & Creative' },
    { id: 'Business', name: 'Business & Finance' },
    { id: 'Marketing', name: 'Marketing & Sales' },
    { id: 'Healthcare', name: 'Healthcare' },
    { id: 'Education', name: 'Education & Research' },
    { id: 'Consulting', name: 'Consulting' }
  ];

  const filteredTemplates = selectedIndustry === 'all' 
    ? templates 
    : templates.filter(template => template.industry === selectedIndustry);

  const handleSelectTemplate = (template: IndustryTemplate) => {
    if (template.premium) {
      toast({
        title: "Premium Template",
        description: "This template requires a premium subscription to use.",
        variant: "destructive",
      });
      return;
    }

    setTemplate('modern'); // For now, use modern template
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to your resume.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <span>Industry Templates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="guide">Industry Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {industries.map((industry) => (
                <Button
                  key={industry.id}
                  variant={selectedIndustry === industry.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIndustry(industry.id)}
                >
                  {industry.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{template.name}</h3>
                        </div>
                        {template.premium && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600">{template.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Features:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                        {template.preview}
                      </div>
                      
                      <Button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full"
                        variant={template.premium ? "outline" : "default"}
                      >
                        {template.premium ? "Upgrade to Use" : "Use Template"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <div className="space-y-6">
              {industries.slice(1).map((industry) => (
                <div key={industry.id} className="space-y-3">
                  <h3 className="text-lg font-semibold">{industry.name}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Elements to Include:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {industry.id === 'Technology' && (
                            <>
                              <li>• Technical skills and programming languages</li>
                              <li>• GitHub portfolio and project links</li>
                              <li>• Open source contributions</li>
                              <li>• Technical certifications</li>
                            </>
                          )}
                          {industry.id === 'Design' && (
                            <>
                              <li>• Portfolio of design work</li>
                              <li>• Design tools and software</li>
                              <li>• Creative process examples</li>
                              <li>• Client testimonials</li>
                            </>
                          )}
                          {industry.id === 'Business' && (
                            <>
                              <li>• Leadership experience</li>
                              <li>• Business achievements and metrics</li>
                              <li>• Strategic initiatives</li>
                              <li>• Team management experience</li>
                            </>
                          )}
                          {industry.id === 'Healthcare' && (
                            <>
                              <li>• Medical licenses and certifications</li>
                              <li>• Clinical experience</li>
                              <li>• Patient care focus</li>
                              <li>• Medical specializations</li>
                            </>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Format Tips:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {industry.id === 'Technology' && (
                            <>
                              <li>• Use clean, modern layouts</li>
                              <li>• Highlight technical skills prominently</li>
                              <li>• Include links to projects</li>
                              <li>• Keep it concise and scannable</li>
                            </>
                          )}
                          {industry.id === 'Design' && (
                            <>
                              <li>• Showcase visual design skills</li>
                              <li>• Use creative but readable fonts</li>
                              <li>• Include portfolio thumbnails</li>
                              <li>• Balance creativity with professionalism</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
