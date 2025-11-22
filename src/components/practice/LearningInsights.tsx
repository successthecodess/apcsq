'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Calendar,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

interface LearningInsightsProps {
  insights: {
    masteryLevel: number;
    currentDifficulty: string;
    accuracy: number;
    totalAttempts: number;
    averageTimePerQuestion: number;
    nextReviewDate?: Date;
    weakTopics: string[];
    strongTopics: string[];
    recommendations: string[];
  };
}

export function LearningInsights({ insights }: LearningInsightsProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Learning Insights</h3>

      {/* Mastery Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Mastery</span>
          <span className="text-2xl font-bold text-indigo-600">{insights.masteryLevel}%</span>
        </div>
        <Progress value={insights.masteryLevel} className="h-3" />
        <p className="mt-2 text-xs text-gray-500">
          {insights.masteryLevel >= 85 && '🎉 Excellent! You\'ve mastered this unit!'}
          {insights.masteryLevel >= 70 && insights.masteryLevel < 85 && '👍 Good progress! Keep practicing.'}
          {insights.masteryLevel >= 50 && insights.masteryLevel < 70 && '📈 Making progress. Focus on weak areas.'}
          {insights.masteryLevel < 50 && '💪 Keep going! Review fundamentals.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium">Accuracy</span>
          </div>
          <p className="mt-1 text-xl font-bold text-blue-900">{insights.accuracy}%</p>
        </div>

        <div className="rounded-lg bg-purple-50 p-3">
          <div className="flex items-center gap-2 text-purple-600">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Avg Time</span>
          </div>
          <p className="mt-1 text-xl font-bold text-purple-900">
            {Math.floor(insights.averageTimePerQuestion / 60)}:{String(insights.averageTimePerQuestion % 60).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Current Difficulty */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">Current Difficulty</p>
        <Badge className="text-sm">
          {insights.currentDifficulty}
        </Badge>
      </div>

      {/* Next Review (Spaced Repetition) */}
      {insights.nextReviewDate && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-3">
          <div className="flex items-center gap-2 text-yellow-700">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Next Review</span>
          </div>
          <p className="mt-1 text-sm text-yellow-900">
            {new Date(insights.nextReviewDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Weak Topics */}
      {insights.weakTopics.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Needs Attention</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.weakTopics.map((topic, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Strong Topics */}
      {insights.strongTopics.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Strengths</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.strongTopics.map((topic, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-indigo-600">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Recommendations</span>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-indigo-600">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}