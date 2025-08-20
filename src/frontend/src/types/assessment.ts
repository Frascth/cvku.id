// src/types/assessment.ts
export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;   // index jawaban benar di `options`
  category?: string; // opsional (mis. "javascript", "react", dll.)
}
