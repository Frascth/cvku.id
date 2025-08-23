// src/frontend/src/components/ResumeScore.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

// Tipe BE (dari .did) untuk bantu konversi
import type {
  ScoreCategory as BEScoreCategory,
  Improvement as BEImprovement,
  Priority as BEPriority,
} from '../../../declarations/resume_score_service/resume_score_service.did';

// Tipe FE (dari store) agar konsisten dan aman secara TS
import type { ScoreCategoryFE, ImprovementFE } from '../store/useResumeStore';

// BE Priority -> FE string
const priorityToString = (p: BEPriority): ImprovementFE['priority'] =>
  'High' in p ? 'High' : 'Medium' in p ? 'Medium' : 'Low';

// BE -> FE mappers
const toFECategory = (c: BEScoreCategory): ScoreCategoryFE => ({
  name: c.name,
  score: Number(c.score),
  maxScore: Number(c.maxScore),
  suggestions: c.suggestions,
});

const toFEImprovement = (i: BEImprovement): ImprovementFE => ({
  title: i.title,
  description: i.description,
  example: i.example,
  priority: priorityToString(i.priority),
});

export const ResumeScore: React.FC = () => {
  const { toast } = useToast();

  // ====== Ambil data resume utk analisis
  const resumeData = useResumeStore((s) => s.resumeData);

  // ====== Ambil state hasil analisis dari store (persisted)
  const overall = useResumeStore((s) => s.resumeScoreOverall);
  const categories = useResumeStore((s) => s.resumeScoreCategories);
  const improvements = useResumeStore((s) => s.resumeScoreImprovements);
  const setResumeScore = useResumeStore((s) => s.setResumeScore);

  const { scoreHandler : scorer } = useResumeStore();

  // Hanya status UI lokal
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!scorer) {
      toast({ title: 'Not ready', description: 'Auth belum siap. Coba lagi sebentar.' });
      return;
    }
    setIsAnalyzing(true);
    try {
      // Panggil BE via handler
      const report = await scorer.analyze(resumeData);
      // Map BE -> FE
      const feOverall = Number(report.overall);
      const feCategories: ScoreCategoryFE[] = (report.categories ?? []).map(toFECategory);
      const feImprovements: ImprovementFE[] = (report.improvements ?? []).map(toFEImprovement);

      // Simpan ke store (persist)
      setResumeScore({
        overall: feOverall,
        categories: feCategories,
        improvements: feImprovements,
      });

      toast({
        title: 'Resume Analysis Complete',
        description: `Your resume scored ${feOverall}/100. Check the detailed breakdown for improvement suggestions.`,
      });
    } catch (e) {
      console.error('ResumeScore analyze error:', e);
      toast({
        title: 'Error',
        description: 'Failed to analyze resume. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeVariant = (score: number): 'default' | 'secondary' =>
    score >= 80 ? 'default' : 'secondary';

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

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

          {/* Overall Score */}
          <TabsContent value="score" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-5xl font-bold ${getScoreColor(overall ?? 0)}`}>
                  {overall ?? 0}
                </div>
                <div className="text-lg text-gray-600">{getScoreLabel(overall ?? 0)}</div>
                <Progress value={overall ?? 0} className="w-full h-3" />
              </div>

              <Button onClick={handleAnalyze} disabled={isAnalyzing || !scorer} className="w-full" size="lg">
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
                <div className="text-xl font-bold text-blue-600">Top 15%</div>
                <div className="text-sm text-blue-700">Industry Ranking</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600">ATS Ready</div>
                <div className="text-sm text-green-700">Compatibility Score</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Quick Tip</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Resumes with scores above 80 are 3x more likely to get interview callbacks. Focus on the
                    improvements tab for personalized suggestions.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            {(categories ?? []).length > 0 ? (
              (categories ?? []).map((category, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getScoreColor(category.score)}`}>
                        {category.score}/{category.maxScore}
                      </span>
                      <Badge variant={getBadgeVariant(category.score)}>
                        {category.score >= 80 ? 'Good' : 'Needs Work'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.score} className="w-full" />
                  <div className="space-y-1">
                    {category.suggestions.map((sug, i) => (
                      <div key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Run analysis to see detailed breakdown.</p>
            )}
          </TabsContent>

          {/* Improvements */}
          <TabsContent value="improvements" className="space-y-4">
            {(improvements ?? []).length > 0 ? (
              (improvements ?? []).map((impr, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{impr.title}</h3>
                    <Badge
                      variant={
                        impr.priority === 'High'
                          ? 'destructive'
                          : impr.priority === 'Medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {impr.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-gray-600">{impr.description}</p>
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-700">Example:</p>
                    <p className="text-sm text-gray-600 mt-1">{impr.example}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Run analysis to see improvement suggestions.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
