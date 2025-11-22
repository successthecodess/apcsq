'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { QuestionSkeleton } from '@/components/practice/QuestionSkeleton';
import { FeedbackCard } from '@/components/practice/FeedbackCard';
import { ProgressBar } from '@/components/practice/ProgressBar';
import { LearningInsights } from '@/components/practice/LearningInsights';
import { SessionComplete } from '@/components/practice/SessionComplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, X, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Question, PracticeSession, AnswerResult, ProgressMetrics, Unit, SessionSummary } from '@/types';

const TOTAL_QUESTIONS = 40;

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const unitParam = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressMetrics | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch unit and start session
  useEffect(() => {
    if (isLoaded && user) {
      initializePractice();
    }
  }, [isLoaded, user, unitParam]);

  // Load insights when session starts
  useEffect(() => {
    if (session && unit && user) {
      loadInsights();
    }
  }, [session, unit]);

  const initializePractice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching unit with param:', unitParam);

      // Fetch all units to find the right one
      const unitsResponse = await api.getUnits();
      const units = unitsResponse.data.units;

      // Try to find unit by ID first, then by unit number
      let foundUnit = units.find((u: Unit) => u.id === unitParam);
      
      if (!foundUnit) {
        // Try parsing as unit number
        const unitNumber = parseInt(unitParam);
        if (!isNaN(unitNumber)) {
          foundUnit = units.find((u: Unit) => u.unitNumber === unitNumber);
        }
      }

      if (!foundUnit) {
        throw new Error(`Unit not found: ${unitParam}`);
      }

      console.log('Found unit:', foundUnit.name);
      setUnit(foundUnit);

      // Start practice session with the correct unit ID
      await startSession(foundUnit.id);
    } catch (error) {
      console.error('Failed to initialize practice:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize practice');
      setIsLoading(false);
    }
  };

  const startSession = async (unitId: string) => {
    try {
      console.log('Starting session for user:', user?.id, 'unit:', unitId);
      
      const response = await api.startPracticeSession(
        user!.id, 
        unitId,
        undefined, // topicId
        user?.primaryEmailAddress?.emailAddress,
        user?.fullName || user?.firstName || undefined
      );
      
      console.log('Session started:', response);
      
      setSession(response.data.session);
      setCurrentQuestion(response.data.question);
      setProgress({
        currentDifficulty: response.data.recommendedDifficulty,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        masteryLevel: 0,
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!user || !unit) return;
    
    try {
      console.log('Loading insights for user:', user.id, 'unit:', unit.id);
      const response = await api.getLearningInsights(user.id, unit.id);
      console.log('Insights loaded:', response.data);
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
      // Don't show error to user, insights are optional
    }
  };

  const loadSessionSummary = async () => {
    if (!session) return;
    
    try {
      console.log('Loading session summary...');
      const response = await api.endPracticeSession(session.id);
      console.log('Session summary:', response.data);
      setSessionSummary(response.data.summary);
      setShowCompletion(true);
    } catch (error) {
      console.error('Failed to load session summary:', error);
      setError('Failed to load session summary');
    }
  };

  const prefetchNextQuestion = async () => {
    if (!session || !user || !unit || isPrefetching) return;

    // Don't prefetch if session is about to complete
    if (session.totalQuestions >= TOTAL_QUESTIONS - 1) return;

    try {
      setIsPrefetching(true);
      console.log('🔄 Prefetching next question in background...');
      
      const response = await api.getNextQuestion(
        user.id,
        session.id,
        unit.id,
        [...answeredQuestions, currentQuestion?.id || ''].filter(Boolean)
      );

      if (response.data.question) {
        setNextQuestion(response.data.question);
        console.log('✅ Next question prefetched and ready');
      }
    } catch (error) {
      console.error('Failed to prefetch next question:', error);
      // Don't show error to user, prefetching is optional optimization
    } finally {
      setIsPrefetching(false);
    }
  };

  const handleSubmitAnswer = async (answer: string, timeSpent: number) => {
    if (!session || !currentQuestion || !user || !unit) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.submitAnswer(
        user.id,
        session.id,
        currentQuestion.id,
        answer,
        timeSpent
      );

      setAnswerResult(response.data);
      setProgress(response.data.progress);
      setAnsweredQuestions([...answeredQuestions, currentQuestion.id]);
      
      const newTotalQuestions = session.totalQuestions + 1;
      const newCorrectAnswers = session.correctAnswers + (response.data.isCorrect ? 1 : 0);
      
      setSession({
        ...session,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
      });

      // Prefetch next question in background (if not last question)
      if (!response.data.isSessionComplete && newTotalQuestions < TOTAL_QUESTIONS) {
        console.log('🚀 Starting background prefetch...');
        prefetchNextQuestion();
      }

      // Reload insights after each answer
      await loadInsights();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session || !user || !unit) return;

    // Check if session is complete
    if (session.totalQuestions >= TOTAL_QUESTIONS) {
      console.log('🎉 Session complete! Loading summary...');
      await loadSessionSummary();
      return;
    }

    try {
      setIsLoadingNext(true);
      setAnswerResult(null);
      setError(null);
      
      // Use prefetched question if available (instant transition!)
      if (nextQuestion) {
        console.log('⚡ Using prefetched question - instant load!');
        setCurrentQuestion(nextQuestion);
        setNextQuestion(null);
        setIsLoadingNext(false);
        return;
      }

      // Otherwise fetch normally (fallback)
      console.log('🔄 Fetching question (prefetch not available)...');
      const response = await api.getNextQuestion(
        user.id,
        session.id,
        unit.id,
        answeredQuestions
      );

      if (!response.data.question) {
        console.log('🎉 No more questions! Session complete.');
        await loadSessionSummary();
        return;
      }

      setCurrentQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to get next question:', error);
      setError(error instanceof Error ? error.message : 'Failed to get next question');
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleRestartSession = () => {
    setShowCompletion(false);
    setSessionSummary(null);
    setAnsweredQuestions([]);
    setAnswerResult(null);
    setCurrentQuestion(null);
    setNextQuestion(null);
    setSession(null);
    initializePractice();
  };

  const handleBackToUnits = () => {
    router.push('/dashboard/practice');
  };

  const handleEndSession = async () => {
    if (!session) return;

    if (session.totalQuestions === 0) {
      // No questions answered, just go back
      router.push('/dashboard/practice');
      return;
    }

    // Show summary if they've answered questions
    await loadSessionSummary();
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !session) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Error Loading Practice Session</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-4 flex gap-4">
                <Button onClick={initializePractice}>Try Again</Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/practice')}>
                  Back to Units
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show completion screen
  if (showCompletion && sessionSummary) {
    return (
      <SessionComplete
        summary={sessionSummary}
        onRestart={handleRestartSession}
        onBackToUnits={handleBackToUnits}
      />
    );
  }

  // Show empty state
  if (!currentQuestion || !session) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="p-6 text-center">
          <p className="text-gray-600">Failed to load question. Please try again.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={initializePractice}>Retry</Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/practice')}>
              Back to Units
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const questionsRemaining = TOTAL_QUESTIONS - session.totalQuestions;
  const sessionProgress = (session.totalQuestions / TOTAL_QUESTIONS) * 100;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/practice')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Units
            </Button>
            <Button variant="outline" onClick={handleEndSession} className="gap-2">
              <X className="h-4 w-4" />
              End Session
            </Button>
          </div>

          {/* Unit Info */}
          {unit && (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Unit {unit.unitNumber}: {unit.name}
                  </h2>
                  {unit.description && (
                    <p className="mt-1 text-sm text-gray-600">{unit.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Question</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {session.totalQuestions}/{TOTAL_QUESTIONS}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={sessionProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {progress && (
            <ProgressBar
              totalQuestions={session.totalQuestions}
              correctAnswers={session.correctAnswers}
              consecutiveCorrect={progress.consecutiveCorrect}
              masteryLevel={progress.masteryLevel}
            />
          )}

          {/* Question or Feedback or Loading Skeleton */}
          {isLoadingNext ? (
            <QuestionSkeleton />
          ) : answerResult ? (
            <FeedbackCard
              result={answerResult}
              onNext={handleNextQuestion}
              isLoadingNext={false}
            />
          ) : (
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Prefetch Status (for debugging - remove in production) */}
          {isPrefetching && (
            <div className="text-center text-xs text-gray-500">
              ⚡ Prefetching next question in background...
            </div>
          )}
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Session Progress Card */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Session Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(sessionProgress)}%
                  </span>
                </div>
                <Progress value={sessionProgress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {questionsRemaining}
                  </p>
                  <p className="text-xs text-gray-600">Remaining</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {session.totalQuestions > 0 
                      ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Learning Insights */}
          {insights && insights.status !== 'new' ? (
            <LearningInsights insights={insights} />
          ) : (
            <Card className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Learning Insights</h3>
              <p className="text-sm text-gray-600">
                Complete a few questions to see your personalized learning insights and recommendations.
              </p>
            </Card>
          )}

          {/* Quick Tips */}
          <Card className="p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>Complete all {TOTAL_QUESTIONS} questions for full insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>Questions adapt to your skill level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>3 correct in a row increases difficulty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600">•</span>
                <span>Each session gives you unique questions</span>
              </li>
            </ul>
          </Card>

          {/* Session Stats */}
          <Card className="p-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Current Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Answered</span>
                <span className="font-semibold text-gray-900">
                  {session.totalQuestions}/{TOTAL_QUESTIONS}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Correct</span>
                <span className="font-semibold text-green-600">{session.correctAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Incorrect</span>
                <span className="font-semibold text-red-600">
                  {session.totalQuestions - session.correctAnswers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Streak</span>
                <span className="font-semibold text-indigo-600">
                  {progress?.consecutiveCorrect || 0} 🔥
                </span>
              </div>
              {progress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulty</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {progress.currentDifficulty.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}