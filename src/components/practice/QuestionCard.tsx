'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string, timeSpent: number) => void;
  isSubmitting: boolean;
}

export function QuestionCard({ question, onSubmit, isSubmitting }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(selectedAnswer, timeSpent);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      EASY: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-orange-100 text-orange-800',
      EXPERT: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          Unit {question.unit.unitNumber}: {question.unit.name}
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.questionText}
        </h3>

        {/* Code Snippet */}
        {question.codeSnippet && (
          <div className="mt-4 rounded-lg bg-gray-900 p-4">
            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <Code2 className="h-4 w-4" />
              <span className="text-xs font-medium">Code</span>
            </div>
            <pre className="overflow-x-auto text-sm text-gray-100">
              <code>{question.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Answer Options */}
      {question.options && (
        <div className="mb-6 space-y-3">
          {(question.options as string[]).map((option, index) => {
            const letter = option.charAt(0);
            const text = option.substring(3);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedAnswer(letter)}
                disabled={isSubmitting}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedAnswer === letter
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold ${
                      selectedAnswer === letter
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 pt-1 text-gray-900">{text}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Free Response Input */}
      {question.type === 'FREE_RESPONSE' && (
        <div className="mb-6">
          <textarea
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your answer here..."
            className="w-full rounded-lg border-2 border-gray-200 p-4 font-mono text-sm focus:border-indigo-500 focus:outline-none"
            rows={8}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedAnswer || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </Card>
  );
}