// src/frontend/src/components/SkillsAssessment.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { getQuestionsBySkill } from '@/lib/assessment/questions';
import { useResumeStore } from '@/store/useResumeStore';
import type { Question } from '@/types';
import type { AssessmentLevel } from '@/store/useResumeStore';

export const SkillsAssessment: React.FC = () => {
  const { toast } = useToast();
  const setAssessmentResult = useResumeStore(s => s.setAssessmentResult);

  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isActive, setIsActive] = useState(false);

  const skillCategories = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'design', name: 'UI/UX Design', icon: '🎨' },
    { id: 'marketing', name: 'Digital Marketing', icon: '📱' },
    { id: 'data', name: 'Data Analysis', icon: '📊' },
  ];

  // Ambil 10 soal acak sesuai skill terpilih
  const questions: Question[] = useMemo(
    () => (selectedSkill ? getQuestionsBySkill(selectedSkill, 10) : []),
    [selectedSkill]
  );

  useEffect(() => {
    if (selectedSkill && questions.length > 0) {
      setAnswers(Array(questions.length).fill(undefined)); // panjangnya pas, tapi tetap gunakan "" saat render
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, questions.length]);

  const startAssessment = (skillId: string) => {
    setSelectedSkill(skillId);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(600);
    setIsActive(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft <= 0) {
      finishAssessment();
      return;
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  const handleAnswer = (answerIndex: number) => {
    const next = [...answers];
    next[currentQuestion] = answerIndex;
    setAnswers(next);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    setIsActive(false);
    setShowResults(true);

    const score = calculateScore();
    const correct = answers.filter((a, i) => a === questions[i]?.correct).length;
    const { level } = getScoreLevel(score);

    // ✅ Simpan ke store → bisa dipakai render badge di Skills
    setAssessmentResult({
      skillId: selectedSkill,
      skillName: skillCategories.find(s => s.id === selectedSkill)?.name ?? selectedSkill,
      score,
      total: questions.length,
      correct,
      level,
      dateISO: new Date().toISOString(),
    });

    toast({
      title: 'Assessment Complete!',
      description: `You scored ${score}% on the ${skillCategories.find(s => s.id === selectedSkill)?.name} assessment.`,
    });
  };

  const calculateScore = () => {
    if (questions.length === 0) return 0;
    const correct = answers.filter((a, i) => a === questions[i]?.correct).length;
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreLevel = (score: number): { level: AssessmentLevel; color: string } => {
    if (score >= 90) return { level: 'Expert', color: 'bg-green-100 text-green-800' };
    if (score >= 70) return { level: 'Advanced', color: 'bg-blue-100 text-blue-800' };
    if (score >= 50) return { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Beginner', color: 'bg-gray-100 text-gray-800' };
  };

  // ========== Pilih Skill ==========
  if (!selectedSkill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Skills Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your skills and validate your expertise with our comprehensive assessments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillCategories.map(skill => (
                <div
                  key={skill.id}
                  className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                  onClick={() => startAssessment(skill.id)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{skill.icon}</div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <div className="text-sm text-gray-600">10 questions • 10 minutes</div>
                    <Button size="sm" className="w-full">Start Assessment</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========== Hasil ==========
  if (showResults) {
    const score = calculateScore();
    const scoreLevel = getScoreLevel(score);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Assessment Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-purple-600">{score}%</div>
              <Badge className={scoreLevel.color}>{scoreLevel.level}</Badge>
              <h3 className="text-xl font-semibold">
                {skillCategories.find(s => s.id === selectedSkill)?.name} Assessment
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {answers.filter((a, i) => a === questions[i]?.correct).length}
                  </div>
                  <div className="text-sm text-green-700">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {answers.filter((a, i) => a !== questions[i]?.correct).length}
                  </div>
                  <div className="text-sm text-red-700">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={() => setSelectedSkill('')} className="w-full">
                Take Another Assessment
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  toast({ title: 'Saved', description: 'Badge will appear in your Skills section.' })
                }
              >
                Add to Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========== Kerjakan ==========
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>{skillCategories.find(s => s.id === selectedSkill)?.name} Assessment</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions available for this skill yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
              </div>
              <Progress value={((currentQuestion + 1) / questions.length) * 100} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {questions[currentQuestion]?.question}
              </h3>

              <RadioGroup
                // selalu string; jangan pernah undefined
                value={answers[currentQuestion] !== undefined ? String(answers[currentQuestion]) : ""}
                onValueChange={(v) => handleAnswer(parseInt(v, 10))}
              >
                {questions[currentQuestion]?.options.map((option, index) => {
                  const rid = `${questions[currentQuestion]?.id}-opt-${index}`; // id unik per pertanyaan
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={rid} />
                      <Label htmlFor={rid} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedSkill('')}>
                Cancel
              </Button>
              <Button onClick={nextQuestion} disabled={answers[currentQuestion] === undefined}>
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
