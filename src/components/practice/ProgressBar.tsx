'use client';

import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap } from 'lucide-react';

interface ProgressBarProps {
  totalQuestions: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  masteryLevel: number;
}

export function ProgressBar({
  totalQuestions,
  correctAnswers,
  consecutiveCorrect,
  masteryLevel,
}: ProgressBarProps) {
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-xs text-gray-600">Questions</div>
            <div className="text-lg font-bold text-gray-900">{totalQuestions}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <div>
            <div className="text-xs text-gray-600">Accuracy</div>
            <div className="text-lg font-bold text-gray-900">{Math.round(accuracy)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-xs text-gray-600">Streak</div>
            <div className="text-lg font-bold text-gray-900">{consecutiveCorrect}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">Mastery Level</span>
          <span className="font-semibold text-gray-900">{Math.round(masteryLevel)}%</span>
        </div>
        <Progress value={masteryLevel} className="h-3" />
      </div>
    </div>
  );
}