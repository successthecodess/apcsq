'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import type { AnswerResult } from '@/types';

interface FeedbackCardProps {
  result: AnswerResult;
  onNext: () => void;
  isLoadingNext: boolean;
}

export function FeedbackCard({ result, onNext, isLoadingNext }: FeedbackCardProps) {
  const getDifficultyLevel = (difficulty: string): number => {
    const levels: Record<string, number> = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3,
      EXPERT: 4,
    };
    return levels[difficulty] || 0;
  };

  // Determine if difficulty increased or decreased
  const difficultyChanged = result.difficultyChanged;
  const currentLevel = getDifficultyLevel(result.progress.currentDifficulty);
  const difficultyIncreased = difficultyChanged && currentLevel >= 3; // HARD or EXPERT
  const difficultyDecreased = difficultyChanged && currentLevel <= 2; // EASY or MEDIUM

  return (
    <Card className={`p-6 ${result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      {/* Result Header */}
      <div className="mb-6 flex items-center gap-4">
        {result.isCorrect ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
            <XCircle className="h-8 w-8 text-white" />
          </div>
        )}
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {result.isCorrect ? 'Correct!' : 'Incorrect'}
          </h3>
          <p className="text-gray-600">
            {result.isCorrect
              ? 'Great job! Keep up the excellent work.'
              : "Don't worry, let's learn from this."}
          </p>
        </div>
      </div>

      {/* Difficulty Change Alert */}
      {difficultyChanged && (
        <div className={`mb-6 rounded-lg p-4 ${
          difficultyIncreased
            ? 'bg-indigo-100 border-2 border-indigo-300'
            : 'bg-blue-100 border-2 border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {difficultyIncreased ? (
              <>
                <TrendingUp className="h-5 w-5 text-indigo-700" />
                <span className="font-semibold text-indigo-900">Difficulty Increased!</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-blue-700" />
                <span className="font-semibold text-blue-900">Difficulty Adjusted</span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm">
            {difficultyIncreased
              ? `Excellent work! Moving to ${result.progress.currentDifficulty} difficulty to challenge you more.`
              : `Adjusting to ${result.progress.currentDifficulty} difficulty to help build your confidence and understanding.`
            }
          </p>
        </div>
      )}

      {/* Correct Answer */}
      {!result.isCorrect && (
        <div className="mb-4 rounded-lg bg-white p-4 border-2 border-green-200">
          <div className="mb-2 flex items-center gap-2 text-gray-700">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Correct Answer</span>
          </div>
          <p className="text-lg font-medium text-gray-900">{result.correctAnswer}</p>
        </div>
      )}

      {/* Explanation */}
      <div className="mb-6 rounded-lg bg-white p-4 border-2 border-amber-200">
        <div className="mb-2 flex items-center gap-2 text-gray-700">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <span className="font-semibold">Explanation</span>
        </div>
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{result.explanation}</p>
      </div>

      {/* Progress Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 border">
          <div className="text-sm text-gray-600">Streak</div>
          <div className="flex items-center gap-1">
            <div className="text-2xl font-bold text-gray-900">
              {result.progress.consecutiveCorrect}
            </div>
            {result.progress.consecutiveCorrect >= 3 && (
              <span className="text-lg">🔥</span>
            )}
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 border">
          <div className="text-sm text-gray-600">Mastery</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(result.progress.masteryLevel)}%
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 border">
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-2xl font-bold text-gray-900">
            {result.progress.totalAttempts > 0 
              ? Math.round((result.progress.correctAttempts / result.progress.totalAttempts) * 100)
              : 0}%
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 border">
          <div className="text-sm text-gray-600">Difficulty</div>
          <div className="flex items-center gap-1">
            <div className="text-lg font-bold text-gray-900 capitalize">
              {result.progress.currentDifficulty.toLowerCase()}
            </div>
            {difficultyChanged && (
              difficultyIncreased ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-blue-600" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Streak Milestone Celebration */}
      {result.isCorrect && result.progress.consecutiveCorrect > 0 && (
        <div className="mb-6">
          {result.progress.consecutiveCorrect === 3 && (
            <div className="rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 p-4 border-2 border-yellow-300">
              <p className="text-center text-lg font-semibold text-orange-900">
                🎉 3 in a row! You're on fire! 🔥
              </p>
            </div>
          )}
          {result.progress.consecutiveCorrect === 5 && (
            <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-2 border-purple-300">
              <p className="text-center text-lg font-semibold text-purple-900">
                🌟 5 streak! Amazing performance! 🌟
              </p>
            </div>
          )}
          {result.progress.consecutiveCorrect === 10 && (
            <div className="rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 p-4 border-2 border-green-300">
              <p className="text-center text-lg font-semibold text-green-900">
                🏆 10 streak! You're unstoppable! 🏆
              </p>
            </div>
          )}
        </div>
      )}

      {/* Performance Encouragement */}
      {!result.isCorrect && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> {
              result.progress.consecutiveWrong >= 2 
                ? "Consider taking a short break and reviewing the explanations. Understanding why answers are correct helps more than rushing through questions."
                : "Review the explanation carefully. Understanding the 'why' behind correct answers is key to mastery."
            }
          </p>
        </div>
      )}

      {/* Questions Remaining */}
      {result.questionsRemaining > 0 && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-indigo-600">{result.questionsRemaining}</span> questions remaining
          </p>
        </div>
      )}

      {/* Session Complete Message */}
      {result.isSessionComplete && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
          <p className="text-center text-lg font-bold text-white">
            🎊 Session Complete! Click Next to see your results 🎊
          </p>
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={isLoadingNext}
        className="w-full relative overflow-hidden"
        size="lg"
      >
        {isLoadingNext ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Loading Next Question...
          </>
        ) : result.isSessionComplete ? (
          'View Results'
        ) : (
          'Next Question'
        )}
      </Button>
    </Card>
  );
}