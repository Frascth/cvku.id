// src/lib/assessment/questions.ts
import type { Question } from "../../types";

// Bank soal per skillId
const BANK: Record<string, Question[]> = {
  javascript: [
    {
      id: "js-1",
      question: "Which method adds an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct: 0,
      category: "javascript",
    },
    {
      id: "js-2",
      question: "What is the result of `typeof NaN`?",
      options: ["'number'", "'NaN'", "'undefined'", "'object'"],
      correct: 0,
      category: "javascript",
    },
    // tambah lagi...
  ],
  react: [
    {
      id: "react-1",
      question: "What is the Virtual DOM?",
      options: [
        "A copy of the real DOM kept in memory",
        "A browser API",
        "A CSS framework",
        "A database",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-2",
      question: "Which hook is used for side effects?",
      options: ["useEffect", "useMemo", "useReducer", "useRef"],
      correct: 0,
      category: "react",
    },
  ],
  python: [
    {
      id: "py-1",
      question: "Which library is commonly used for data manipulation?",
      options: ["NumPy", "Pandas", "Matplotlib", "All of the above"],
      correct: 3,
      category: "python",
    },
    {
      id: "py-2",
      question: "What keyword defines a function in Python?",
      options: ["func", "def", "function", "lambda"],
      correct: 1,
      category: "python",
    },
  ],
  // tambahkan skill lain: design, marketing, data, dst.
};

// helper shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ambil N soal acak untuk skill tertentu
export function getQuestionsBySkill(skillId: string, count = 10): Question[] {
  const pool = BANK[skillId] ?? [];
  if (pool.length <= count) return [...pool];
  return shuffle(pool).slice(0, count);
}

// opsional: list skill yang tersedia
export const SKILL_IDS = Object.keys(BANK);
