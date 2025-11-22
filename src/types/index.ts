export interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  unitId: string;
  orderIndex: number;
}

export interface Question {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options?: string[];
  type: 'MULTIPLE_CHOICE' | 'FREE_RESPONSE' | 'CODE_ANALYSIS' | 'CODE_COMPLETION' | 'TRUE_FALSE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  unit: Unit;
  topic?: Topic;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  progress: ProgressMetrics;
  difficultyChanged: boolean;
}

export interface ProgressMetrics {
  currentDifficulty: string;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: number;
}

export interface UserProgress {
  id: string;
  unitId: string;
  topicId?: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  currentDifficulty: string;
}
export interface PracticeSession {
  id: string;
  userId: string;
  unitId: string;
  topicId?: string;
  totalQuestions: number;
  correctAnswers: number;
  targetQuestions?: number;
  startedAt: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  progress: ProgressMetrics;
  difficultyChanged: boolean;
  questionsRemaining: number;
  isSessionComplete: boolean;
}

export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  totalTime: number;
  averageTime: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  difficultyBreakdown: Record<string, { correct: number; total: number }>;
  targetQuestions: number;
  completionPercentage: number;
}