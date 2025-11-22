'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function QuestionSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-32 bg-gray-200 rounded" />
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <div className="h-6 w-full bg-gray-200 rounded mb-3" />
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-6 w-5/6 bg-gray-200 rounded" />
      </div>

      {/* Code Snippet Placeholder */}
      <div className="mb-6 rounded-lg bg-gray-100 p-4">
        <div className="h-4 w-16 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-4/6 bg-gray-200 rounded" />
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full rounded-lg border-2 border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 pt-1">
                <div className="h-4 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="h-12 w-full bg-gray-200 rounded-lg" />
    </Card>
  );
}