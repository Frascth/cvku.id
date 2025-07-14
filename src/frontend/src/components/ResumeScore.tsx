
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  suggestions: string[];
}

export const ResumeScore: React.FC = () => {
  const { resumeData } = useResumeStore();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(82);

  const scoreCategories: ScoreCategory[] = [
    {
      name: "Content Quality",
      score: 85,
      maxScore: 100,
      suggestions: [
        "Add more quantifiable achievements",
        "Include specific metrics and numbers",
        "Use stronger action verbs"
      ]
    },
    {
      name: "Format & Design",
      score: 90,
      maxScore: 100,
      suggestions: [
        "Excellent use of white space",
        "Consider adding more visual hierarchy"
      ]
    },
    {
      name: "Keyword Optimization",
      score: 75,
      maxScore: 100,
      suggestions: [
        "Include more industry-specific keywords",
        "Add relevant technical skills",
        "Match job description terminology"
      ]
    },
    {
      name: "Completeness",
      score: 80,
      maxScore: 100,
      suggestions: [
        "Add professional summary",
        "Include contact information",
        "Add more work experience details"
      ]
    },
    {
      name: "ATS Compatibility",
      score: 88,
      maxScore: 100,
      suggestions: [
        "Great formatting for ATS",
        "Consider using standard section headers"
      ]
    }
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    const newScore = Math.floor(Math.random() * 20) + 75;
    setOverallScore(newScore);
    setIsAnalyzing(false);
    toast({
      title: "Resume Analysis Complete",
      description: `Your resume scored ${newScore}/100. Check the detailed breakdown for improvement suggestions.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const improvements = [
    {
      priority: "High",
      title: "Add Quantifiable Achievements",
      description: "Include specific numbers, percentages, or metrics to demonstrate your impact.",
      example: "Instead of 'Improved sales', write 'Increased sales by 25% in Q3 2023'"
    },
    {
      priority: "Medium",
      title: "Optimize Keywords",
      description: "Include relevant industry keywords that match job descriptions.",
      example: "Add technical skills and tools mentioned in your target job postings"
    },
    {
      priority: "Low",
      title: "Enhance Formatting",
      description: "Improve visual hierarchy and readability.",
      example: "Use consistent spacing and bullet points throughout"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-600" />
          <span>Resume Score</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="score" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="score">Overall Score</TabsTrigger>
            <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-lg text-gray-600">
                  {getScoreLabel(overallScore)}
                </div>
                <Progress value={overallScore} className="w-full h-3" />
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Analyze My Resume
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-blue-600">
                  Top 15%
                </div>
                <div className="text-sm text-blue-700">Industry Ranking</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">
                  ATS Ready
                </div>
                <div className="text-sm text-green-700">Compatibility Score</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Quick Tip</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Resumes with scores above 80 are 3x more likely to get interview callbacks.
                    Focus on the improvements tab for personalized suggestions.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            {scoreCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{category.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getScoreColor(category.score)}`}>
                      {category.score}/{category.maxScore}
                    </span>
                    <Badge variant={category.score >= 80 ? "default" : "secondary"}>
                      {category.score >= 80 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
                <Progress value={category.score} className="w-full" />
                <div className="space-y-1">
                  {category.suggestions.map((suggestion, suggestionIndex) => (
                    <div key={suggestionIndex} className="flex items-start space-x-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="improvements" className="space-y-4">
            {improvements.map((improvement, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{improvement.title}</h3>
                  <Badge variant={
                    improvement.priority === "High" ? "destructive" :
                    improvement.priority === "Medium" ? "default" : "secondary"
                  }>
                    {improvement.priority} Priority
                  </Badge>
                </div>
                <p className="text-gray-600">{improvement.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-700">Example:</p>
                  <p className="text-sm text-gray-600 mt-1">{improvement.example}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
