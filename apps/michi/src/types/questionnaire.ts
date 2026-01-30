/**
 * Questionnaire Types - Shinkofa Platform
 * Type-safe interfaces for questionnaire data structures
 */

export type QuestionType = 'radio' | 'checkbox' | 'likert_5' | 'likert_10' | 'text' | 'number';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string | string[];  // Can be comma-separated string or array
  items: string | string[];    // Can be comma-separated string or array
  scale_labels: string;
  annotation: string;
  comment_allowed: boolean;
  required: boolean;
}

export interface Module {
  id: string;
  title: string;
  questions: Question[];
}

export interface Bloc {
  id: string;
  title: string;
  emoji: string;
  modules: Module[];
  total_questions: number;
}

export interface QuestionnaireStructure {
  metadata: {
    title: string;
    version: string;
    total_estimated_questions: number;
    estimated_duration_minutes: string;
    creator: string;
    purpose: string;
  };
  introduction: string; // Full introduction text (markdown format) - V5.0
  total_questions: number;
  total_blocs: number;
  blocs: Bloc[];
}

export interface AnswerValue {
  value: any; // Main answer value (string, string[], number, object for Likert)
  comment?: string; // Optional free-form comment (V5.0)
}

export interface Answer {
  question_id: string;
  bloc: string;
  question_text: string;
  answer: AnswerValue; // Structured answer with value + optional comment
  question_type: string;
  is_required: string;
}

export interface QuestionnaireSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  current_bloc: string | null;
  current_module: string | null;
  progress_percentage: number;
  is_completed: boolean;
  metadata: Record<string, any>;
  answers?: Answer[];  // Optional field for session restoration
}

export interface SessionStatus {
  session: QuestionnaireSession;
  total_answers: number;
  answers_by_bloc: Record<string, number>;
  completion_rate: number;
  estimated_remaining_minutes: number;
}
