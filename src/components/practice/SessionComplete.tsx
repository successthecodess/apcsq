'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import type { SessionSummary } from '@/types';

interface SessionCompleteProps {
  summary: SessionSummary;
  onRestart: () => void;
  onBackToUnits: () => void;
}

export function SessionComplete({ summary, onRestart, onBackToUnits }: SessionCompleteProps) {
  const isPerfect = summary.accuracyRate === 100;
  const isExcellent = summary.accuracyRate >= 85;
  const isGood = summary.accuracyRate >= 70;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {isPerfect ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                <Trophy className="h-12 w-12 text-yellow-900" />
              </div>
            ) : isExcellent ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-400 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-green-900" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-400 shadow-lg">
                <Target className="h-12 w-12 text-blue-900" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            {isPerfect && '🎉 Perfect Score!'}
            {isExcellent && !isPerfect && '🌟 Excellent Work!'}
            {isGood && !isExcellent && '👏 Great Job!'}
            {!isGood && '💪 Good Effort!'}
          </h2>
          <p className="mt-2 text-lg text-gray-700">
            You completed {summary.totalQuestions} questions
          </p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.correctAnswers}/{summary.totalQuestions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.accuracyRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(summary.averageTime / 60)}:{String(summary.averageTime % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Topic Breakdown */}
      {Object.keys(summary.topicBreakdown).length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance by Topic</h3>
          <div className="space-y-4">
            {Object.entries(summary.topicBreakdown).map(([topic, stats]) => {
              const accuracy = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={topic}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {stats.correct}/{stats.total}
                      </span>
                      <Badge variant={accuracy >= 80 ? 'default' : 'secondary'}>
                        {accuracy}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Difficulty Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Performance by Difficulty</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const).map((difficulty) => {
            const stats = summary.difficultyBreakdown[difficulty];
            if (!stats) return null;
            const accuracy = Math.round((stats.correct / stats.total) * 100);
            
            return (
              <div key={difficulty} className="text-center">
                <Badge className="mb-2">{difficulty}</Badge>
                <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
                <p className="text-sm text-gray-600">
                  {stats.correct}/{stats.total}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={onRestart} size="lg" className="flex-1 gap-2">
          <RotateCcw className="h-5 w-5" />
          Practice Again
        </Button>
        <Button onClick={onBackToUnits} size="lg" variant="outline" className="flex-1 gap-2">
          Back to Units
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}