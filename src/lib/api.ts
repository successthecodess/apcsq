const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  async getUnits() {
    const response = await fetch(`${API_BASE_URL}/units`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch units' }));
      throw new Error(error.message || 'Failed to fetch units');
    }
    return response.json();
  },

  async getUnitById(unitId: string) {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch unit' }));
      throw new Error(error.message || 'Failed to fetch unit');
    }
    return response.json();
  },

  async startPracticeSession(
    userId: string, 
    unitId: string, 
    topicId?: string,
    userEmail?: string,
    userName?: string
  ) {
    try {
      console.log('Starting practice session:', { userId, unitId, topicId });
      
      const url = `${API_BASE_URL}/practice/start`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, unitId, topicId, userEmail, userName }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `Failed to start session (${response.status})`);
      }

      return response.json();
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  },

  // ... rest of the methods stay the same
  async getNextQuestion(
    userId: string,
    sessionId: string,
    unitId: string,
    answeredQuestionIds: string[],
    topicId?: string
  ) {
    try {
      const url = `${API_BASE_URL}/practice/next-question`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, unitId, answeredQuestionIds, topicId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to get next question');
      }

      return response.json();
    } catch (error) {
      console.error('Get next question error:', error);
      throw error;
    }
  },

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent?: number
  ) {
    try {
      const url = `${API_BASE_URL}/practice/submit-answer`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, questionId, userAnswer, timeSpent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to submit answer');
      }

      return response.json();
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  async endPracticeSession(sessionId: string) {
    try {
      const url = `${API_BASE_URL}/practice/${sessionId}/end`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to end session');
      }

      return response.json();
    } catch (error) {
      console.error('End session error:', error);
      throw error;
    }
  },
// Add to existing api object
async getLearningInsights(userId: string, unitId: string) {
  const url = `${API_BASE_URL}/insights/${userId}/unit/${unitId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  return response.json();
},

async getPerformancePatterns(userId: string, unitId: string) {
  const url = `${API_BASE_URL}/insights/${userId}/patterns/${unitId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch patterns');
  }
  return response.json();
},

async getReviewNeeded(userId: string) {
  const url = `${API_BASE_URL}/insights/${userId}/review-needed`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch review needed');
  }
  return response.json();
},
  async getUserProgress(userId: string) {
    const url = `${API_BASE_URL}/units/progress/${userId}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch progress' }));
      throw new Error(error.message || 'Failed to fetch progress');
    }
    return response.json();
  },
};
