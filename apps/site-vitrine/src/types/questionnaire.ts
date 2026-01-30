/**
 * Types TypeScript pour le système de questionnaire Shinkofa
 */

/**
 * Type de question possible dans le questionnaire
 */
export type QuestionType =
  | 'text'          // Texte court
  | 'textarea'      // Texte long
  | 'radio'         // Choix unique
  | 'checkbox'      // Choix multiples
  | 'scale'         // Échelle numérique (1-10)
  | 'number'        // Nombre (âge, etc.)
  | 'likert-pairs'  // Échelles Likert bipolaires
  | 'date';         // Date

/**
 * Option pour les questions à choix multiples ou uniques
 */
export interface QuestionOption {
  value: string;
  label: string;
}

/**
 * Paire Likert pour les échelles bipolaires
 */
export interface LikertPair {
  left: string;
  right: string;
}

/**
 * Structure d'une question du questionnaire
 */
export interface Question {
  id: string;
  type: QuestionType;
  title: string;                      // Label principal (anciennement label dans V5)
  description?: string;               // Annotation/aide contextuelle
  required: boolean;
  options?: QuestionOption[] | string[];  // Pour radio et checkbox (string[] pour compatibilité V5)
  pairs?: LikertPair[];               // Pour likert-pairs
  min?: number;                       // Pour scale et number
  max?: number;                       // Pour scale et number
  placeholder?: string;               // Pour text et textarea
  comment?: boolean;                  // Si true, ajoute un champ texte libre optionnel
}

/**
 * Section du questionnaire (groupe de questions)
 */
export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

/**
 * Questionnaire complet
 */
export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  sections: QuestionnaireSection[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Réponse à une question
 */
export interface QuestionAnswer {
  questionId: string;
  value: string | string[] | number;
  answeredAt: string;
}

/**
 * Progression du questionnaire sauvegardée
 */
export interface QuestionnaireProgress {
  questionnaireId: string;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: QuestionAnswer[];
  startedAt: string;
  lastUpdatedAt: string;
  completed: boolean;
  completedAt?: string;
}

/**
 * Données à envoyer via Brevo
 */
export interface BrevoQuestionnaireSubmission {
  email: string;
  name?: string;
  questionnaireId: string;
  answers: QuestionAnswer[];
  completedAt: string;
}
