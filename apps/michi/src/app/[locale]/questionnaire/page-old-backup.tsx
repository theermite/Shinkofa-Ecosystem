'use client';

/**
 * Questionnaire Page - Shinkofa Platform
 * Main questionnaire interface with 155 questions across 9 blocs
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuestionnaireStructure, startQuestionnaireSession, submitAnswer, getErrorMessage } from '@/lib/api';
import type { QuestionnaireStructure, Question, Answer } from '@/types/questionnaire';

// Components
import QuestionText from '@/components/questionnaire/QuestionText';
import QuestionNumber from '@/components/questionnaire/QuestionNumber';
import QuestionRadio from '@/components/questionnaire/QuestionRadio';
import QuestionCheckbox from '@/components/questionnaire/QuestionCheckbox';
import QuestionLikert from '@/components/questionnaire/QuestionLikert';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import Navigation from '@/components/questionnaire/Navigation';

export default function QuestionnairePage() {
  const router = useRouter();

  // State
  const [structure, setStructure] = useState<QuestionnaireStructure | null>(null);
  const [flatQuestions, setFlatQuestions] = useState<(Question & { blocId: string })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questionnaire structure
  useEffect(() => {
    loadQuestionnaire();
  }, []);

  async function loadQuestionnaire() {
    try {
      setIsLoading(true);
      setError(null);

      // Get questionnaire structure
      const data = await getQuestionnaireStructure();
      setStructure(data);

      // Flatten all questions with their bloc IDs
      const flat: (Question & { blocId: string })[] = [];
      data.blocs.forEach((bloc) => {
        bloc.modules.forEach((module) => {
          module.questions.forEach((question) => {
            flat.push({ ...question, blocId: bloc.id });
          });
        });
      });
      setFlatQuestions(flat);

      // Start session
      const userId = 'test-user-' + Date.now(); // TODO: Replace with real user ID
      const session = await startQuestionnaireSession(userId);
      setSessionId(session.id);

      setIsLoading(false);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  // Current question
  const currentQuestion = flatQuestions[currentIndex];
  const isLastQuestion = currentIndex === flatQuestions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion || !sessionId) return;

    // Save current answer
    await saveCurrentAnswer();

    // Go to next question
    if (currentIndex < flatQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      setIsSaving(true);

      // Save last answer
      await saveCurrentAnswer();

      // Redirect to complete page with chart upload & analysis
      router.push(`/questionnaire/complete?sessionId=${sessionId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  async function saveCurrentAnswer() {
    if (!currentQuestion || !sessionId || !currentAnswer) return;

    try {
      const answer: Answer = {
        question_id: currentQuestion.id,
        bloc: currentQuestion.blocId,
        question_text: currentQuestion.text,
        answer: { value: currentAnswer },
        question_type: currentQuestion.type,
        is_required: currentQuestion.required ? 'true' : 'false',
      };

      await submitAnswer(sessionId, answer);
    } catch (err) {
      console.error('Error saving answer:', err);
      // Don't block navigation on save error
    }
  }

  // Answer handlers
  const handleAnswerChange = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du questionnaire...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadQuestionnaire}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // No questions
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Aucune question disponible</p>
      </div>
    );
  }

  // Find current bloc info
  const currentBloc = structure?.blocs.find((b) => b.id === currentQuestion.blocId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Questionnaire Holistique Shizen
          </h1>
          <p className="text-sm text-gray-600">
            {structure?.metadata.purpose}
          </p>

          {/* Progress */}
          <div className="mt-6">
            <ProgressBar
              current={currentIndex + 1}
              total={flatQuestions.length}
              blocTitle={currentBloc ? `${currentBloc.emoji} Bloc ${currentBloc.id}: ${currentBloc.title}` : undefined}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {currentQuestion.type === 'text' && (
            <QuestionText
              question={currentQuestion}
              value={currentAnswer || ''}
              onChange={handleAnswerChange}
            />
          )}

          {currentQuestion.type === 'number' && (
            <QuestionNumber
              question={currentQuestion}
              value={currentAnswer || ''}
              onChange={handleAnswerChange}
            />
          )}

          {currentQuestion.type === 'radio' && (
            <QuestionRadio
              question={currentQuestion}
              value={currentAnswer || ''}
              onChange={handleAnswerChange}
            />
          )}

          {currentQuestion.type === 'checkbox' && (
            <QuestionCheckbox
              question={currentQuestion}
              value={currentAnswer || []}
              onChange={handleAnswerChange}
            />
          )}

          {(currentQuestion.type === 'likert_5' || currentQuestion.type === 'likert_10') && (
            <QuestionLikert
              question={currentQuestion}
              value={currentAnswer || {}}
              onChange={handleAnswerChange}
            />
          )}

          {/* Navigation */}
          <Navigation
            canGoPrevious={currentIndex > 0}
            canGoNext={!!currentAnswer}
            isLastQuestion={isLastQuestion}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 La Voie Shinkofa - Questionnaire Holistique V{structure?.metadata.version}</p>
        </div>
      </div>
    </div>
  );
}
