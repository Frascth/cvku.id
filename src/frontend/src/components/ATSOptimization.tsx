import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertCircle, Target, Zap } from "lucide-react";
import { useResumeStore } from "../store/useResumeStore";
import { useToast } from "@/hooks/use-toast";
import { createAtsHandler } from "@/lib/atsHandler";
import { AuthClient } from "@dfinity/auth-client";

export const ATSOptimization: React.FC = () => {
  // ⬇️ ambil dari store (persisted)
  const resumeData = useResumeStore(s => s.resumeData);
  const atsScore = useResumeStore(s => s.atsScore);
  const atsCategories = useResumeStore(s => s.atsCategories);
  const setAtsReport = useResumeStore(s => s.setAtsReport);

  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { atsHandler : ats } = useResumeStore();

  const handleAnalyze = async () => {
    if (!ats) {
      toast({ title: "Not ready", description: "Auth belum siap. Coba lagi sebentar." });
      return;
    }
    setIsAnalyzing(true);
    try {
      const atsResult = await ats.analyze(resumeData);
      if (!atsResult) throw new Error("Analysis result is empty.");

      // ⬇️ simpan ke store (persisted)
      setAtsReport({
        score: Number(atsResult.score),
        categories: atsResult.categories,
      });

      toast({
        title: "ATS Analysis Complete",
        description: "Your resume has been analyzed for ATS compatibility."
      });
    } catch (e) {
      console.error("Error fetching ATS report:", e);
      toast({
        title: "Error",
        description: "Failed to analyze resume. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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

          {/* Score Tab */}
          <TabsContent value="score" className="space-y-4">
            <div className="text-center space-y-4">
              {atsScore !== null ? (
                <>
                  <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                    {atsScore}/100
                  </div>
                  <div className="text-lg text-gray-600">
                    {getScoreLabel(atsScore)}
                  </div>
                  <Progress value={atsScore} className="w-full" />
                </>
              ) : (
                <p className="text-gray-500">Click analyze to get your ATS score.</p>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !ats}
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

            {atsCategories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {atsCategories.flatMap(cat => cat.checks).filter(check => check.passed).length}
                  </div>
                  <div className="text-sm text-green-700">Passed Checks</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {atsCategories.flatMap(cat => cat.checks).filter(check => !check.passed).length}
                  </div>
                  <div className="text-sm text-red-700">Failed Checks</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {atsCategories.flatMap(cat => cat.checks).length}
                  </div>
                  <div className="text-sm text-blue-700">Total Checks</div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Checks Tab */}
          <TabsContent value="checks" className="space-y-4">
            {atsCategories.length > 0 ? (
              atsCategories.map((category, index) => (
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
              ))
            ) : (
              <p className="text-gray-500">No checks available yet. Run analysis first.</p>
            )}
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-4">
            {atsCategories.length > 0 ? (
              atsCategories
                .flatMap(cat => cat.checks)
                .filter(check => !check.passed)
                .map((check, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">{check.name}</h4>
                      <p className="text-sm text-yellow-700 mt-1">{check.tip}</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">Run analysis to see improvement tips.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};