import prisma from '../config/database.js';
import questionService from './questionService.js';
import adaptiveLearningService from './adaptiveLearningService.js';
import { AppError } from '../middleware/errorHandler.js';

export class PracticeSessionService {
  private readonly QUESTIONS_PER_SESSION = 40;

  /**
   * Ensure user exists in database (create if not)
   */
  private async ensureUserExists(userId: string, userEmail?: string, userName?: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('Creating new user in database:', userId);
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail || `${userId}@clerk.user`,
          name: userName,
          password: 'clerk-managed',
        },
      });
    }

    return user;
  }

  /**
   * Get all questions user has answered for this unit (across all sessions)
   */
  private async getUserAnsweredQuestions(userId: string, unitId: string): Promise<string[]> {
    const responses = await prisma.questionResponse.findMany({
      where: {
        userId,
        question: { unitId },
      },
      select: {
        questionId: true,
      },
    });

    return responses.map(r => r.questionId);
  }

  /**
   * Start a new practice session with target of 40 questions
   */
  async startSession(userId: string, unitId: string, topicId?: string, userEmail?: string, userName?: string) {
    console.log('🎯 Starting practice session:', { userId, unitId, topicId });

    try {
      // Ensure user exists in database
      await this.ensureUserExists(userId, userEmail, userName);

      // Verify unit exists
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        throw new AppError('Unit not found', 404);
      }

      console.log('✅ Unit found:', unit.name);

      // Get all previously answered questions for this unit
      const globalAnsweredQuestions = await this.getUserAnsweredQuestions(userId, unitId);
      console.log(`📊 User has answered ${globalAnsweredQuestions.length} questions for this unit`);

      // Get current progress and recommended difficulty
      const recommendedDifficulty = await adaptiveLearningService.getRecommendedDifficulty(
        userId,
        unitId,
        topicId
      );

      console.log('📊 Recommended difficulty:', recommendedDifficulty);

      // Create session with target questions
      const session = await prisma.studySession.create({
        data: {
          userId,
          unitId,
          topicId: topicId === undefined ? null : topicId,
          sessionType: 'PRACTICE',
          totalQuestions: 0,
          correctAnswers: 0,
          targetQuestions: this.QUESTIONS_PER_SESSION,
        },
      });

      console.log('✅ Session created:', session.id);

      // Get first question (excluding globally answered questions)
      const question = await questionService.getRandomQuestion(
        unitId, 
        recommendedDifficulty, 
        globalAnsweredQuestions
      );

      if (!question) {
        console.log('⚠️ No new questions available, generating one...');
        const result = await questionService.generateAndStoreQuestion({
          unitId,
          topicId,
          type: 'MULTIPLE_CHOICE',
          difficulty: recommendedDifficulty,
          autoApprove: true,
        });
        
        console.log('✅ Question generated:', result.question.id);

        return {
          session,
          question: result.question,
          recommendedDifficulty,
          questionsRemaining: this.QUESTIONS_PER_SESSION - 1,
          totalQuestions: this.QUESTIONS_PER_SESSION,
        };
      }

      console.log('✅ Question found:', question.id);

      return {
        session,
        question,
        recommendedDifficulty,
        questionsRemaining: this.QUESTIONS_PER_SESSION - 1,
        totalQuestions: this.QUESTIONS_PER_SESSION,
      };
    } catch (error) {
      console.error('❌ Error in startSession:', error);
      throw error;
    }
  }

  /**
   * Get next question in session (no repeats globally)
   */
  async getNextQuestion(
    userId: string,
    sessionId: string,
    unitId: string,
    answeredQuestionIds: string[],
    topicId?: string
  ) {
    console.log('🎯 Getting next question:', { 
      userId, 
      sessionId, 
      unitId, 
      sessionAnswered: answeredQuestionIds.length,
      remaining: this.QUESTIONS_PER_SESSION - answeredQuestionIds.length
    });

    try {
      // Check if session is complete
      const session = await prisma.studySession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      if (session.totalQuestions >= this.QUESTIONS_PER_SESSION) {
        console.log('✅ Session complete!');
        return null;
      }

      // Get all previously answered questions for this unit (global)
      const globalAnsweredQuestions = await this.getUserAnsweredQuestions(userId, unitId);
      console.log(`📊 Total questions answered for unit: ${globalAnsweredQuestions.length}`);

      // Get recommended difficulty based on current progress
      const recommendedDifficulty = await adaptiveLearningService.getRecommendedDifficulty(
        userId,
        unitId,
        topicId
      );

      console.log('📊 Recommended difficulty:', recommendedDifficulty);

      // Get question at recommended difficulty (excluding all answered globally)
      let question = await questionService.getRandomQuestion(
        unitId,
        recommendedDifficulty,
        globalAnsweredQuestions
      );

      // If no question at recommended difficulty, try other difficulties
      if (!question) {
        console.log('⚠️ No new questions at recommended difficulty, trying others...');
        const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
        
        for (const difficulty of difficulties) {
          if (difficulty === recommendedDifficulty) continue;
          
          question = await questionService.getRandomQuestion(
            unitId,
            difficulty as any,
            globalAnsweredQuestions
          );
          
          if (question) {
            console.log(`✅ Found new question at ${difficulty} difficulty`);
            break;
          }
        }
      }

      // If still no question, generate one
      if (!question) {
        console.log('⚠️ No new questions available in database, generating...');
        const result = await questionService.generateAndStoreQuestion({
          unitId,
          topicId,
          type: 'MULTIPLE_CHOICE',
          difficulty: recommendedDifficulty,
          autoApprove: true,
        });
        
        console.log('✅ Question generated:', result.question.id);
        return result.question;
      }

      console.log('✅ New question found:', question.id);
      return question;
    } catch (error) {
      console.error('❌ Error in getNextQuestion:', error);
      throw error;
    }
  }

  // ... rest of the methods stay the same (submitAnswer, endSession)
  
  /**
   * Submit answer and get feedback
   */
  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent?: number
  ) {
    console.log('🎯 Submitting answer:', { userId, sessionId, questionId, userAnswer });

    try {
      // Get question details
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { unit: true, topic: true },
      });

      if (!question) {
        throw new AppError('Question not found', 404);
      }

      // Check answer
      const result = await questionService.submitAnswer(userId, questionId, userAnswer, timeSpent);

      console.log('✅ Answer checked:', result.isCorrect ? 'Correct' : 'Incorrect');

      // Update progress and get difficulty adjustment
      const progressUpdate = await adaptiveLearningService.updateProgress(
        userId,
        question.unitId,
        result.isCorrect,
        timeSpent,
        question.topicId ?? undefined
      );

      console.log('📊 Progress updated:', progressUpdate);

      // Update session statistics
      const updatedSession = await prisma.studySession.update({
        where: { id: sessionId },
        data: {
          totalQuestions: { increment: 1 },
          correctAnswers: result.isCorrect ? { increment: 1 } : undefined,
        },
      });

      // Store response with session link
      await prisma.questionResponse.update({
        where: { id: result.id },
        data: { sessionId },
      });

      // Check if session is complete
      const isComplete = updatedSession.totalQuestions >= this.QUESTIONS_PER_SESSION;

      return {
        ...result,
        progress: progressUpdate,
        difficultyChanged: progressUpdate.currentDifficulty !== question.difficulty,
        questionsRemaining: this.QUESTIONS_PER_SESSION - updatedSession.totalQuestions,
        isSessionComplete: isComplete,
      };
    } catch (error) {
      console.error('❌ Error in submitAnswer:', error);
      throw error;
    }
  }

  /**
   * End practice session and return summary
   */
  async endSession(sessionId: string) {
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          include: {
            question: {
              include: {
                topic: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Calculate session statistics
    const totalTime = session.responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const averageTime = session.totalQuestions > 0 ? totalTime / session.totalQuestions : 0;
    const accuracyRate = session.totalQuestions > 0 
      ? (session.correctAnswers / session.totalQuestions) * 100 
      : 0;

    // Calculate topic breakdown
    const topicStats: Record<string, { correct: number; total: number }> = {};
    for (const response of session.responses) {
      const topicName = response.question.topic?.name || 'General';
      if (!topicStats[topicName]) {
        topicStats[topicName] = { correct: 0, total: 0 };
      }
      topicStats[topicName].total++;
      if (response.isCorrect) {
        topicStats[topicName].correct++;
      }
    }

    // Calculate difficulty breakdown
    const difficultyStats: Record<string, { correct: number; total: number }> = {};
    for (const response of session.responses) {
      const difficulty = response.question.difficulty;
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { correct: 0, total: 0 };
      }
      difficultyStats[difficulty].total++;
      if (response.isCorrect) {
        difficultyStats[difficulty].correct++;
      }
    }

    // Update session
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        totalDuration: totalTime,
        averageTime,
        accuracyRate,
        goalAchieved: accuracyRate >= 80,
      },
    });

    return {
      session: updatedSession,
      summary: {
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        accuracyRate: Math.round(accuracyRate),
        totalTime,
        averageTime: Math.round(averageTime),
        topicBreakdown: topicStats,
        difficultyBreakdown: difficultyStats,
        targetQuestions: this.QUESTIONS_PER_SESSION,
        completionPercentage: Math.round((session.totalQuestions / this.QUESTIONS_PER_SESSION) * 100),
      },
    };
  }
}

export default new PracticeSessionService();