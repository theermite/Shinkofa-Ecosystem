/**
 * API Client - Shinkofa Platform
 * Communication with FastAPI backend
 */

import axios from 'axios';
import type {
  QuestionnaireStructure,
  Bloc,
  Module,
  Answer,
  QuestionnaireSession,
  SessionStatus
} from '@/types/questionnaire';
import { getAccessToken } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://localhost:8001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for holistic analysis
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  // Get token from storage (checks both localStorage and sessionStorage)
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    // Extract user ID from token if available
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) {
        config.headers['X-User-ID'] = payload.sub;
      }
    } catch (e) {
      console.warn('Failed to extract user ID from token:', e);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// ========================================
// Questionnaire Structure Endpoints
// ========================================

/**
 * Get complete questionnaire structure (144 questions, 9 blocs)
 *
 * @param locale - Language code (fr, en, es) - defaults to French
 */
export async function getQuestionnaireStructure(locale: string = 'fr'): Promise<QuestionnaireStructure> {
  const response = await apiClient.get<QuestionnaireStructure>('/questionnaire/structure', {
    params: { locale }
  });
  return response.data;
}

/**
 * Get structure for a specific bloc (A-I)
 */
export async function getBlocStructure(blocId: string): Promise<Bloc> {
  const response = await apiClient.get<Bloc>(`/questionnaire/structure/bloc/${blocId}`);
  return response.data;
}

/**
 * Get structure for a specific module (e.g., A1, B2)
 */
export async function getModuleStructure(moduleId: string): Promise<Module> {
  const response = await apiClient.get<Module>(`/questionnaire/structure/module/${moduleId}`);
  return response.data;
}

// ========================================
// Questionnaire Session Endpoints
// ========================================

/**
 * Start a new questionnaire session
 */
export async function startQuestionnaireSession(userId: string): Promise<QuestionnaireSession> {
  const response = await apiClient.post<QuestionnaireSession>('/questionnaire/start', {
    user_id: userId,
  });
  return response.data;
}

/**
 * Get session status and progress
 */
export async function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  const response = await apiClient.get<SessionStatus>(`/questionnaire/status/${sessionId}`);
  return response.data;
}

/**
 * Submit an answer to a question
 */
export async function submitAnswer(sessionId: string, answer: Answer): Promise<{ id: string; message: string }> {
  // Backend expects batch submission format with session_id in body
  const response = await apiClient.post<any>(
    `/questionnaire/submit-answers`,
    {
      session_id: sessionId,
      answers: [answer]  // Wrap single answer in array
    }
  );
  // Return first answer response
  return response.data[0] || { id: '', message: 'Answer saved' };
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<QuestionnaireSession[]> {
  const response = await apiClient.get<QuestionnaireSession[]>(
    `/questionnaire/sessions/user/${userId}`
  );
  return response.data;  // Backend returns array directly, not { sessions: [...] }
}

// ========================================
// Error Handling Helper
// ========================================

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
