// src/types/assessment.ts
export type AssessmentLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;   // index jawaban benar di `options`
  category?: string; // opsional (mis. "javascript", "react", dll.)
  level: AssessmentLevel;
}
