import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Target, TrendingUp, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">AP CS Question Bank</span>
            </div>
            <div className="flex gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Master AP Computer Science A
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Adaptive AI-powered question bank that grows with you. Practice, learn, and ace your AP exam with personalized difficulty progression.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg">
                Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-8 py-20 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-yellow-500" />}
            title="AI-Powered Generation"
            description="Get unlimited practice questions generated specifically for your learning level"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-green-500" />}
            title="Adaptive Difficulty"
            description="Questions automatically adjust based on your performance"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-blue-500" />}
            title="Practice Exams"
            description="Full-length AP-style exams with detailed analytics and AP score prediction"
          />
          <FeatureCard
            icon={<Code className="h-8 w-8 text-purple-500" />}
            title="Complete Coverage"
            description="All 10 units of AP CS A curriculum with targeted practice"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}