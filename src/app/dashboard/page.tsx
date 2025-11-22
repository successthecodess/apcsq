import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Clock, Award, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // In real implementation, fetch this from your API
  const stats = {
    questionsCompleted: 127,
    accuracy: 82,
    studyTime: 450, // minutes
    currentStreak: 5,
  };

  const recentUnits = [
    { id: '1', name: 'Primitive Types', progress: 85, color: '#3B82F6' },
    { id: '2', name: 'Using Objects', progress: 60, color: '#10B981' },
    { id: '3', name: 'Boolean Expressions', progress: 45, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back! 👋</h1>
        <p className="mt-2 text-gray-600">Here's your learning progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Questions Completed"
          value={stats.questionsCompleted}
          icon={Target}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${stats.accuracy}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Study Time"
          value={`${Math.floor(stats.studyTime / 60)}h ${stats.studyTime % 60}m`}
          icon={Clock}
          description="This week"
        />
        <StatsCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon={Award}
          description="Keep it up!"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/practice" className="block">
            <Button className="h-24 w-full flex-col gap-2" size="lg">
              <Zap className="h-6 w-6" />
              <span>Start Practice</span>
            </Button>
          </Link>
          <Link href="/dashboard/exams" className="block">
            <Button className="h-24 w-full flex-col gap-2" size="lg" variant="outline">
              <Target className="h-6 w-6" />
              <span>Take Practice Exam</span>
            </Button>
          </Link>
          <Link href="/dashboard/progress" className="block">
            <Button className="h-24 w-full flex-col gap-2" size="lg" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <span>View Progress</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Continue Learning */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
          <Link href="/dashboard/practice">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recentUnits.map((unit) => (
            <Link key={unit.id} href={`/dashboard/practice?unit=${unit.id}`}>
              <div className="group cursor-pointer rounded-lg border p-4 transition-all hover:border-indigo-500 hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg"
                      style={{ backgroundColor: unit.color + '20' }}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center text-lg font-bold"
                        style={{ color: unit.color }}
                      >
                        {unit.id}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                        Unit {unit.id}: {unit.name}
                      </h3>
                      <p className="text-sm text-gray-500">{unit.progress}% complete</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                </div>
                <Progress value={unit.progress} className="h-2" />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}