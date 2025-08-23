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
    {
      id: "js-3",
      question: "Which operator checks both value and type equality?",
      options: ["==", "===", "!=", ">="],
      correct: 1,
      category: "javascript",
    },
    {
      id: "js-4",
      question: "What does Array.prototype.map() return?",
      options: [
        "A new array",
        "The sum of elements",
        "A single boolean",
        "The original array modified",
      ],
      correct: 0,
      category: "javascript",
    },
    {
      id: "js-5",
      question: "Which keyword creates a block-scoped variable?",
      options: ["var", "let", "function", "with"],
      correct: 1,
      category: "javascript",
    },
    {
      id: "js-6",
      question: "In arrow functions, 'this' is bound to...",
      options: [
        "the surrounding (lexical) scope",
        "a new object",
        "the global object",
        "undefined always",
      ],
      correct: 0,
      category: "javascript",
    },
    {
      id: "js-7",
      question: "Which Promise method runs regardless of fulfillment or rejection?",
      options: ["then", "catch", "finally", "all"],
      correct: 2,
      category: "javascript",
    },
    {
      id: "js-8",
      question: "In a function parameter list, what does `...args` represent?",
      options: ["Spread syntax", "Rest parameter", "Gather operator", "Varargs"],
      correct: 1,
      category: "javascript",
    },
    {
      id: "js-9",
      question: "Which method converts a JSON string to an object?",
      options: ["JSON.parse", "JSON.stringify", "toJSON", "parseJSON"],
      correct: 0,
      category: "javascript",
    },
    {
      id: "js-10",
      question: "Which method removes the last element of an array?",
      options: ["pop()", "shift()", "slice()", "map()"],
      correct: 0,
      category: "javascript",
    },
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
    {
      id: "react-3",
      question: "What does useState return?",
      options: [
        "Only the current state",
        "Only a setter function",
        "A pair: [state, setState]",
        "A function that triggers re-render only",
      ],
      correct: 2,
      category: "react",
    },
    {
      id: "react-4",
      question: "Why are 'key' props important when rendering lists?",
      options: [
        "They help React identify items for efficient updates",
        "They add automatic ordering",
        "They apply default styles",
        "They force components to re-render",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-5",
      question: "A controlled component is...",
      options: [
        "An input whose value is controlled by React state",
        "A form that manages its own state in the DOM",
        "Any component using useRef",
        "A server component",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-6",
      question: "useMemo is primarily used to...",
      options: [
        "Memoize the result of an expensive calculation",
        "Manage side effects",
        "Store mutable values without re-render",
        "Schedule state updates",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-7",
      question: "Which hook consumes a value from React Context?",
      options: ["useReducer", "useContext", "useId", "useLayoutEffect"],
      correct: 1,
      category: "react",
    },
    {
      id: "react-8",
      question: "A common use of useRef is to...",
      options: [
        "Store a mutable value without causing a re-render",
        "Trigger state updates",
        "Fetch remote data",
        "Memoize derived values",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-9",
      question: "What does an empty dependency array ([]) mean in useEffect?",
      options: [
        "Run once after the first render",
        "Run after every render",
        "Never run",
        "Run only on unmount",
      ],
      correct: 0,
      category: "react",
    },
    {
      id: "react-10",
      question: "What is JSX?",
      options: [
        "A JavaScript syntax extension for describing UI",
        "A JSON variant",
        "A templating engine unrelated to JavaScript",
        "A CSS preprocessor",
      ],
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
    {
      id: "py-3",
      question: "What does a list comprehension produce?",
      options: ["A new list", "A generator", "A tuple", "A set"],
      correct: 0,
      category: "python",
    },
    {
      id: "py-4",
      question: "Which file mode opens a text file for reading?",
      options: ["'r'", "'w'", "'a'", "'x'"],
      correct: 0,
      category: "python",
    },
    {
      id: "py-5",
      question: "What does len({a:1, b:2}) evaluate to in Python?",
      options: ["1", "2", "3", "Raises an error"],
      correct: 1,
      category: "python",
    },
    {
      id: "py-6",
      question: "Which keyword creates an anonymous function?",
      options: ["anon", "lambda", "def", "func"],
      correct: 1,
      category: "python",
    },
    {
      id: "py-7",
      question: "Which tool installs Python packages from PyPI?",
      options: ["pip", "conda", "make", "brew"],
      correct: 0,
      category: "python",
    },
    {
      id: "py-8",
      question: "What do *args and **kwargs represent?",
      options: [
        "Positional args and keyword args",
        "Lists and dicts",
        "Required and optional args",
        "Local and global vars",
      ],
      correct: 0,
      category: "python",
    },
    {
      id: "py-9",
      question: "Which operator checks object identity (same object in memory)?",
      options: ["==", "is", "in", "!="],
      correct: 1,
      category: "python",
    },
    {
      id: "py-10",
      question: "What does my_list[::-1] return?",
      options: [
        "A reversed copy of the list",
        "The list sorted ascending",
        "Every other element",
        "An in-place reversal",
      ],
      correct: 0,
      category: "python",
    },
  ],
  design: [
    {
      id: "design-1",
      question: "What is the primary purpose of a wireframe?",
      options: [
        "Show structure/layout without visual detail",
        "Define brand voice",
        "Test server performance",
        "Export production assets",
      ],
      correct: 0,
      category: "design",
    },
    {
      id: "design-2",
      question: "Which color model is standard for digital screens?",
      options: ["RGB", "CMYK", "Pantone", "RYB"],
      correct: 0,
      category: "design",
    },
    {
      id: "design-3",
      question: "The main goal of contrast in UI is to...",
      options: [
        "Establish visual hierarchy and readability",
        "Make designs more colorful",
        "Reduce whitespace",
        "Ensure brand consistency only",
      ],
      correct: 0,
      category: "design",
    },
    {
      id: "design-4",
      question: "A user persona is...",
      options: [
        "A fictional archetype based on research",
        "A real individual tester",
        "A stakeholder map",
        "A UI style guide",
      ],
      correct: 0,
      category: "design",
    },
    {
      id: "design-5",
      question: "In usability testing, the think-aloud method helps to...",
      options: [
        "Reveal users' reasoning in real time",
        "Measure heart rate",
        "Require a large sample size",
        "Eliminate all bias",
      ],
      correct: 0,
      category: "design",
    },
    {
      id: "design-6",
      question: "Responsive design means...",
      options: [
        "Layouts adapt to different screen sizes",
        "Only mobile screens are supported",
        "Using CSS frameworks only",
        "Scaling images to 2x",
      ],
      correct: 0,
      category: "design",
    },
  ],
  marketing: [
    {
      id: "marketing-1",
      question: "What is the purpose of A/B testing?",
      options: [
        "Compare two variants to see which performs better",
        "Increase traffic instantly",
        "Replace qualitative research",
        "Eliminate seasonality",
      ],
      correct: 0,
      category: "marketing",
    },
    {
      id: "marketing-2",
      question: "CTA stands for...",
      options: [
        "Call To Action",
        "Content Trend Analysis",
        "Customer Trust Audit",
        "Click Through Average",
      ],
      correct: 0,
      category: "marketing",
    },
    {
      id: "marketing-3",
      question: "Organic traffic refers to...",
      options: [
        "Visitors from unpaid search results",
        "Traffic from paid ads",
        "Referral traffic only",
        "Direct traffic only",
      ],
      correct: 0,
      category: "marketing",
    },
    {
      id: "marketing-4",
      question: "CTR (Click-Through Rate) measures...",
      options: [
        "Clicks divided by impressions",
        "Purchases divided by sessions",
        "Revenue per visitor",
        "Bounce rate",
      ],
      correct: 0,
      category: "marketing",
    },
    {
      id: "marketing-5",
      question: "STP in marketing stands for...",
      options: [
        "Segmentation, Targeting, Positioning",
        "Sales, Traffic, Profit",
        "Strategy, Tactics, Planning",
        "Search, Tagging, Promotion",
      ],
      correct: 0,
      category: "marketing",
    },
    {
      id: "marketing-6",
      question: "Which is a common funnel order?",
      options: [
        "Awareness → Consideration → Conversion → Retention",
        "Conversion → Awareness → Retention → Consideration",
        "Consideration → Retention → Awareness → Conversion",
        "Retention → Conversion → Awareness → Consideration",
      ],
      correct: 0,
      category: "marketing",
    },
  ],
  data: [
    {
      id: "data-1",
      question: "Which measure of central tendency is most robust to outliers?",
      options: ["Mean", "Median", "Mode", "Range"],
      correct: 1,
      category: "data",
    },
    {
      id: "data-2",
      question: "SQL GROUP BY is used to...",
      options: [
        "Group rows that share values so aggregates can be computed",
        "Sort rows alphabetically",
        "Filter rows before aggregation",
        "Join multiple tables",
      ],
      correct: 0,
      category: "data",
    },
    {
      id: "data-3",
      question: "Recall measures...",
      options: [
        "Share of actual positives correctly identified",
        "Share of predicted positives that are correct",
        "Overall accuracy",
        "The F1 score",
      ],
      correct: 0,
      category: "data",
    },
    {
      id: "data-4",
      question: "A correlation coefficient (r) ranges between...",
      options: ["-1 and 1", "0 and 1", "-∞ and ∞", "-10 and 10"],
      correct: 0,
      category: "data",
    },
    {
      id: "data-5",
      question: "A histogram is best for visualizing...",
      options: [
        "Distribution of a single numeric variable",
        "Relationship between two categorical variables",
        "Time series trending",
        "Geospatial clusters",
      ],
      correct: 0,
      category: "data",
    },
    {
      id: "data-6",
      question: "Why split data into train/validation/test sets?",
      options: [
        "To estimate performance and tune without overfitting",
        "To increase data volume",
        "To randomize row order",
        "To improve CPU utilization",
      ],
      correct: 0,
      category: "data",
    },
  ],
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

// (opsional) export BANK jika butuh akses penuh di tempat lain
export { BANK };
