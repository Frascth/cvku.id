
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Target, FileText, Zap } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const ATSOptimization: React.FC = () => {
  const { resumeData } = useResumeStore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(78);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate ATS analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAtsScore(Math.floor(Math.random() * 30) + 70);
    setIsAnalyzing(false);
    toast({
      title: "ATS Analysis Complete",
      description: "Your resume has been analyzed for ATS compatibility.",
    });
  };

  const atsChecks = [
    {
      category: "Format & Structure",
      checks: [
        { name: "Uses standard fonts", passed: true, tip: "Use Arial, Calibri, or Times New Roman" },
        { name: "No images or graphics", passed: false, tip: "Remove images and graphics for better ATS parsing" },
        { name: "Simple formatting", passed: true, tip: "Avoid complex tables and columns" },
        { name: "Standard section headers", passed: true, tip: "Use conventional headers like 'Experience', 'Education'" }
      ]
    },
    {
      category: "Keywords & Content",
      checks: [
        { name: "Industry keywords present", passed: true, tip: "Include relevant industry keywords from job descriptions" },
        { name: "Skills section optimized", passed: true, tip: "List skills that match job requirements" },
        { name: "Job titles match industry standards", passed: false, tip: "Use standard job titles that ATS can recognize" },
        { name: "Consistent date formatting", passed: true, tip: "Use MM/YYYY format consistently" }
      ]
    },
    {
      category: "Technical Requirements",
      checks: [
        { name: "File format compatible", passed: true, tip: "Use .docx or .pdf format" },
        { name: "No headers/footers", passed: true, tip: "Avoid headers and footers that ATS might ignore" },
        { name: "Text is selectable", passed: true, tip: "Ensure all text can be selected and copied" },
        { name: "No special characters", passed: false, tip: "Avoid bullets, symbols, and special characters" }
      ]
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span>ATS Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="score" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="score">ATS Score</TabsTrigger>
            <TabsTrigger value="checks">Compatibility Checks</TabsTrigger>
            <TabsTrigger value="tips">Optimization Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                  {atsScore}/100
                </div>
                <div className="text-lg text-gray-600">
                  {getScoreLabel(atsScore)}
                </div>
              </div>
              
              <Progress value={atsScore} className="w-full" />
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {atsChecks.flatMap(cat => cat.checks).filter(check => check.passed).length}
                </div>
                <div className="text-sm text-green-700">Passed Checks</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {atsChecks.flatMap(cat => cat.checks).filter(check => !check.passed).length}
                </div>
                <div className="text-sm text-red-700">Failed Checks</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {atsChecks.flatMap(cat => cat.checks).length}
                </div>
                <div className="text-sm text-blue-700">Total Checks</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checks" className="space-y-4">
            {atsChecks.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-lg">{category.category}</h3>
                <div className="space-y-2">
                  {category.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {check.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">{check.name}</span>
                      </div>
                      <Badge variant={check.passed ? "default" : "destructive"}>
                        {check.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="space-y-4">
              {atsChecks.flatMap(cat => cat.checks).filter(check => !check.passed).map((check, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">{check.name}</h4>
                    <p className="text-sm text-yellow-700 mt-1">{check.tip}</p>
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
