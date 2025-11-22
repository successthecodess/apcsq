'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { UnitCard } from '@/components/dashboard/UnitCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, BookOpen } from 'lucide-react';
import type { Unit, UserProgress } from '@/types';

export default function PracticePage() {
  const { user } = useUser();
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockUnits: Unit[] = [
      {
        id: '1',
        unitNumber: 1,
        name: 'Primitive Types',
        description: 'Variables, data types, arithmetic operators, and compound assignment',
        icon: '🔢',
        color: '#3B82F6',
        isActive: true,
      },
      {
        id: '2',
        unitNumber: 2,
        name: 'Using Objects',
        description: 'Object instantiation, calling methods, String and Math classes',
        icon: '📦',
        color: '#10B981',
        isActive: true,
      },
      {
        id: '3',
        unitNumber: 3,
        name: 'Boolean Expressions and if Statements',
        description: 'Boolean expressions, conditional statements, and compound booleans',
        icon: '🔀',
        color: '#F59E0B',
        isActive: true,
      },
      {
        id: '4',
        unitNumber: 4,
        name: 'Iteration',
        description: 'While loops, for loops, and nested iteration',
        icon: '🔄',
        color: '#8B5CF6',
        isActive: true,
      },
      {
        id: '5',
        unitNumber: 5,
        name: 'Writing Classes',
        description: 'Class design, constructors, methods, encapsulation, and scope',
        icon: '🏗️',
        color: '#EC4899',
        isActive: true,
      },
      {
        id: '6',
        unitNumber: 6,
        name: 'Array',
        description: 'One-dimensional arrays, array algorithms, and traversals',
        icon: '📊',
        color: '#06B6D4',
        isActive: true,
      },
      {
        id: '7',
        unitNumber: 7,
        name: 'ArrayList',
        description: 'ArrayList class, methods, and algorithms',
        icon: '📝',
        color: '#14B8A6',
        isActive: true,
      },
      {
        id: '8',
        unitNumber: 8,
        name: '2D Array',
        description: 'Two-dimensional arrays and 2D array algorithms',
        icon: '🎯',
        color: '#F97316',
        isActive: true,
      },
      {
        id: '9',
        unitNumber: 9,
        name: 'Inheritance',
        description: 'Superclasses, subclasses, method overriding, and polymorphism',
        icon: '🌳',
        color: '#84CC16',
        isActive: true,
      },
      {
        id: '10',
        unitNumber: 10,
        name: 'Recursion',
        description: 'Recursive methods and recursive algorithms',
        icon: '♾️',
        color: '#A855F7',
        isActive: true,
      },
    ];

    const mockProgress: UserProgress[] = [
      {
        id: '1',
        unitId: '1',
        masteryLevel: 85,
        totalAttempts: 45,
        correctAttempts: 38,
        currentDifficulty: 'MEDIUM',
      },
      {
        id: '2',
        unitId: '2',
        masteryLevel: 60,
        totalAttempts: 30,
        correctAttempts: 22,
        currentDifficulty: 'EASY',
      },
      {
        id: '3',
        unitId: '3',
        masteryLevel: 45,
        totalAttempts: 20,
        correctAttempts: 12,
        currentDifficulty: 'EASY',
      },
    ];

    setUnits(mockUnits);
    setProgress(mockProgress);
    setLoading(false);
  }, []);

  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Practice by Unit</h1>
          <p className="mt-2 text-gray-600">
            Select a unit to start practicing. Questions adapt to your skill level.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Info Card */}
      <Card className="border-indigo-200 bg-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-indigo-100 p-3">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">How It Works</h3>
            <p className="mt-1 text-sm text-indigo-700">
              Start with any unit and answer questions. Our AI adapts the difficulty based on your performance,
              helping you build mastery progressively. Track your progress and identify areas for improvement.
            </p>
          </div>
        </div>
      </Card>

      {/* Units Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.map((unit) => {
          const unitProgress = progress.find((p) => p.unitId === unit.id);
          const isLocked = false; // Implement locking logic based on prerequisites
          
          return (
            <UnitCard
              key={unit.id}
              unit={unit}
              progress={unitProgress}
              isLocked={isLocked}
            />
          );
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">No units found matching your search.</p>
        </div>
      )}
    </div>
  );
}