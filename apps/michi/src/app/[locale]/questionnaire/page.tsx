'use client';

/**
 * Questionnaire Page - Shinkofa Platform (Enhanced Design)
 * Main questionnaire interface with 144 questions across 9 blocs
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getQuestionnaireStructure, startQuestionnaireSession, submitAnswer, getErrorMessage, getUserSessions } from '@/lib/api';
import type { QuestionnaireStructure, Question, Answer, AnswerValue } from '@/types/questionnaire';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { parseMarkdown } from '@/lib/markdown';

// Components
import QuestionText from '@/components/questionnaire/QuestionText';
import QuestionNameSplit from '@/components/questionnaire/QuestionNameSplit';
import QuestionNumber from '@/components/questionnaire/QuestionNumber';
import QuestionRadio from '@/components/questionnaire/QuestionRadio';
import QuestionCheckbox from '@/components/questionnaire/QuestionCheckbox';
import QuestionLikert from '@/components/questionnaire/QuestionLikert';
import { SuperAdminQuestionsPanel } from '@/components/questionnaire/SuperAdminQuestionsPanel';

export default function QuestionnairePage() {
  return (
    <ProtectedRoute>
      <QuestionnairePageContent />
    </ProtectedRoute>
  );
}

function QuestionnairePageContent() {
  const router = useRouter();
  const t = useTranslations('questionnaire.main');
  const locale = useLocale(); // Get current locale (fr, en, es)
  const { user } = useAuth();
  const { isActive: isSuperAdminActive, session: superAdminSession } = useSuperAdmin();

  // State
  const [structure, setStructure] = useState<QuestionnaireStructure | null>(null);
  const [flatQuestions, setFlatQuestions] = useState<(Question & { blocId: string })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question number to index mapping (for super admin navigation)
  const [questionNumberMap, setQuestionNumberMap] = useState<Map<number, number>>(new Map());

  // Resume progress modal
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);

  // Save confirmation popup
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Introduction screen (V5.0) - shown before first question
  const [showIntroduction, setShowIntroduction] = useState(true);

  // Load questionnaire structure (reload when locale changes)
  useEffect(() => {
    loadQuestionnaire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  async function loadQuestionnaire() {
    try {
      setIsLoading(true);
      setError(null);

      // Get questionnaire structure with current locale
      const data = await getQuestionnaireStructure(locale);
      setStructure(data);

      // Flatten all questions with their bloc IDs
      const flat: (Question & { blocId: string })[] = [];
      const qNumMap = new Map<number, number>();
      let questionNumber = 1;

      data.blocs.forEach((bloc) => {
        bloc.modules.forEach((module) => {
          module.questions.forEach((question) => {
            const index = flat.length;
            flat.push({ ...question, blocId: bloc.id });
            qNumMap.set(questionNumber, index);
            questionNumber++;
          });
        });
      });

      setFlatQuestions(flat);
      setQuestionNumberMap(qNumMap);

      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check for existing session (includes answers by default)
      const existingSessions = await getUserSessions(user.id.toString());
      let currentSessionId: string;
      let existingAnswers: Record<string, any> = {};
      let resumeIndex = 0;

      // Check for existing session with answers
      const sessionWithAnswers = existingSessions?.find(s => s.answers && s.answers.length > 0);

      if (sessionWithAnswers) {
        // Found saved progress - show resume modal
        setSavedSession(sessionWithAnswers);
        setShowResumeModal(true);
        setIsLoading(false);
      } else {
        // No saved progress - start new session
        const session = await startQuestionnaireSession(user.id.toString());
        setSessionId(session.id);
        setIsLoading(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  // Resume progress from saved session
  async function handleResumeProgress() {
    if (!savedSession || !flatQuestions.length) return;

    const existingAnswers: Record<string, AnswerValue> = {};
    savedSession.answers.forEach((answer: any) => {
      // Normalize to AnswerValue format (support legacy format)
      if (answer.answer && typeof answer.answer === 'object') {
        // New format: { value, comment }
        if ('value' in answer.answer) {
          existingAnswers[answer.question_id] = {
            value: answer.answer.value,
            comment: answer.answer.comment || '',
          };
        } else {
          // Legacy format: just the value directly
          existingAnswers[answer.question_id] = {
            value: answer.answer,
            comment: '',
          };
        }
      } else {
        // Very old format: answer is the value directly
        existingAnswers[answer.question_id] = {
          value: answer.answer,
          comment: '',
        };
      }
    });

    // Find first unanswered question
    const resumeIndex = flatQuestions.findIndex(q => !existingAnswers[q.id]);
    const startIndex = resumeIndex === -1 ? flatQuestions.length - 1 : resumeIndex;

    setSessionId(savedSession.id);
    setAnswers(existingAnswers);
    setCurrentIndex(startIndex);
    setShowResumeModal(false);
    setShowIntroduction(false); // Skip introduction when resuming
  }

  // Start new session (discard saved progress)
  async function handleStartNew() {
    try {
      if (!user) return;
      const session = await startQuestionnaireSession(user.id.toString());
      setSessionId(session.id);
      setAnswers({});
      setCurrentIndex(0);
      setShowResumeModal(false);
      setShowIntroduction(true); // Show introduction when starting new
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Start questionnaire (hide introduction and begin questions)
  function handleStartQuestionnaire() {
    setShowIntroduction(false);
  }

  // Super Admin: Go to specific question by number
  function handleGoToQuestion(questionNumber: number) {
    // If map is empty but flatQuestions exist, the question number IS the index - 1
    if (questionNumberMap.size === 0 && flatQuestions.length > 0) {
      const index = questionNumber - 1; // Questions are 1-indexed
      if (index >= 0 && index < flatQuestions.length) {
        setCurrentIndex(index);
        setShowIntroduction(false);
        setShowResumeModal(false);
        return;
      }
    }

    const index = questionNumberMap.get(questionNumber);
    if (index !== undefined && index >= 0 && index < flatQuestions.length) {
      setCurrentIndex(index);
      setShowIntroduction(false);
      setShowResumeModal(false);
    } else {
      // Fallback: try direct index calculation
      const fallbackIndex = questionNumber - 1;
      if (fallbackIndex >= 0 && fallbackIndex < flatQuestions.length) {
        setCurrentIndex(fallbackIndex);
        setShowIntroduction(false);
        setShowResumeModal(false);
      }
    }
  }

  // Super Admin: Fill all questions with random answers
  async function handleFillRandomAnswers() {
    if (!sessionId || flatQuestions.length === 0) {
      throw new Error('Session or questions not loaded')
    }

    // Test data for realistic answers
    const testNames = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert']
    const testFirstNames = ['Marie', 'Pierre', 'Sophie', 'Jean', 'Claire']

    // Generate random answer for each question
    const randomAnswers: Record<string, AnswerValue> = {}

    for (let i = 0; i < flatQuestions.length; i++) {
      const question = flatQuestions[i]
      let randomAnswer: AnswerValue

      // Generate answer based on question type
      switch (question.type) {
        case 'text':
          // Special handling for name question (Q1)
          if (i === 0 && question.text.toLowerCase().includes('nom')) {
            const firstName = testFirstNames[Math.floor(Math.random() * testFirstNames.length)]
            const lastName = testNames[Math.floor(Math.random() * testNames.length)]
            randomAnswer = {
              value: `${firstName} ${lastName}`,
              comment: JSON.stringify({ firstName, lastName })
            }
          } else {
            randomAnswer = {
              value: `Reponse test ${i + 1} - ${question.text.substring(0, 20)}...`,
              comment: ''
            }
          }
          break

        case 'number':
          randomAnswer = {
            value: Math.floor(Math.random() * 10) + 1,
            comment: ''
          }
          break

        case 'radio':
          if (question.options && question.options.length > 0) {
            const options = Array.isArray(question.options) ? question.options : question.options.split(',').map((o: string) => o.trim())
            randomAnswer = {
              value: options[Math.floor(Math.random() * options.length)],
              comment: ''
            }
          } else {
            randomAnswer = { value: 'Option 1', comment: '' }
          }
          break

        case 'checkbox':
          if (question.options && question.options.length > 0) {
            const options = Array.isArray(question.options) ? question.options : question.options.split(',').map((o: string) => o.trim())
            // Select 1-3 random options
            const numOptions = Math.min(Math.floor(Math.random() * 3) + 1, options.length)
            const shuffled = [...options].sort(() => Math.random() - 0.5)
            randomAnswer = {
              value: shuffled.slice(0, numOptions),
              comment: ''
            }
          } else {
            randomAnswer = { value: ['Option 1'], comment: '' }
          }
          break

        case 'likert_5':
          randomAnswer = {
            value: Math.floor(Math.random() * 5) + 1,
            comment: ''
          }
          break

        case 'likert_10':
          randomAnswer = {
            value: Math.floor(Math.random() * 10) + 1,
            comment: ''
          }
          break

        default:
          // Default: pick from options if available, otherwise text
          if (question.options && question.options.length > 0) {
            const options = Array.isArray(question.options) ? question.options : question.options.split(',').map((o: string) => o.trim())
            randomAnswer = {
              value: options[Math.floor(Math.random() * options.length)],
              comment: ''
            }
          } else {
            randomAnswer = {
              value: Math.floor(Math.random() * 5) + 1,
              comment: ''
            }
          }
      }

      randomAnswers[question.id] = randomAnswer

      // Submit answer to API
      try {
        // Normalize question_type for API
        // Backend accepts: radio, checkbox, likert, text, comment
        let apiQuestionType: string = question.type
        if (question.type === 'likert_5' || question.type === 'likert_10') {
          apiQuestionType = 'likert'
        } else if (question.type === 'number') {
          apiQuestionType = 'text' // API treats number inputs as text
        }

        const answer = {
          question_id: question.id,
          bloc: question.blocId,
          question_text: question.text,
          answer: randomAnswer,
          question_type: apiQuestionType,
          is_required: question.required ? 'true' : 'false',
        }
        await submitAnswer(sessionId, answer)

      } catch (err) {
        console.error(`Error submitting Q${i + 1}:`, err)
      }
    }

    // Update local state with all answers
    setAnswers(randomAnswers)
    setCurrentIndex(flatQuestions.length - 1) // Go to last question
    setShowIntroduction(false)
  }

  // Current question
  const currentQuestion = flatQuestions[currentIndex];
  const isLastQuestion = currentIndex === flatQuestions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];

  // Check if super admin has enabled free navigation (all questions optional)
  const isSuperAdminOptional = isSuperAdminActive && superAdminSession?.questionnaire_all_optional === true;

  // Check if answer has a value (required for navigation unless super admin override)
  const hasAnswer = isSuperAdminOptional || (currentAnswer && currentAnswer.value !== undefined && currentAnswer.value !== '' && (Array.isArray(currentAnswer.value) ? currentAnswer.value.length > 0 : true));
  const progress = flatQuestions.length > 0 ? ((currentIndex + 1) / flatQuestions.length) * 100 : 0;

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion || !sessionId || !hasAnswer) return;
    await saveCurrentAnswer();
    // Afficher popup de sauvegarde discrète
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
    if (currentIndex < flatQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || !hasAnswer) return;
    try {
      setIsSaving(true);
      await saveCurrentAnswer();
      router.push(`/questionnaire/birth-info?sessionId=${sessionId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSaving(false);
    }
  };

  async function saveCurrentAnswer() {
    if (!currentQuestion || !sessionId || !currentAnswer) return;

    try {
      // Normalize question_type for API
      // Backend accepts: radio, checkbox, likert, text, comment
      let apiQuestionType: string = currentQuestion.type
      if (currentQuestion.type === 'likert_5' || currentQuestion.type === 'likert_10') {
        apiQuestionType = 'likert'
      } else if (currentQuestion.type === 'number') {
        apiQuestionType = 'text' // API treats number inputs as text
      }

      const answer: Answer = {
        question_id: currentQuestion.id,
        bloc: currentQuestion.blocId,
        question_text: currentQuestion.text,
        answer: currentAnswer, // Already in AnswerValue format { value, comment }
        question_type: apiQuestionType,
        is_required: currentQuestion.required ? 'true' : 'false',
      };
      await submitAnswer(sessionId, answer);
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  }

  const handleAnswerChange = (value: AnswerValue) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🧠</div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shinkofa-marine mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('loading')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('preparing144Questions')}</p>
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
          <div className="max-w-lg w-full mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">{t('errorTitle')}</h2>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={loadQuestionnaire}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
    );
  }

  // Introduction Screen (V5.0) - shown before first question
  if (showIntroduction && sessionId && structure) {
    // Helper function to render markdown-like content
    const renderMarkdown = (content: string) => {
      return content
        .split('\n')
        .map(line => {
          // H1 headers
          if (line.startsWith('# ')) return `<h1 class="text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-white">${line.substring(2)}</h1>`;
          // H2 headers
          if (line.startsWith('## ')) return `<h2 class="text-3xl font-bold mb-4 mt-6 text-gray-900 dark:text-white">${line.substring(3)}</h2>`;
          // H3 headers
          if (line.startsWith('### ')) return `<h3 class="text-2xl font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-200">${line.substring(4)}</h3>`;
          // Bold text
          let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
          // List items
          if (line.startsWith('- ')) return `<li class="ml-6 text-gray-700 dark:text-gray-300">${processed.substring(2)}</li>`;
          // Regular paragraphs
          if (line.trim()) return `<p class="mb-3 text-gray-700 dark:text-gray-300">${processed}</p>`;
          return '';
        })
        .join('\n');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
            {/* Introduction Content (Translated) */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
              {/* Title */}
              <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                {t('introduction.title')}
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-center mb-8 text-gray-600 dark:text-gray-400 italic">
                {t('introduction.subtitle')}
              </p>

              {/* Purpose */}
              <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
                {t('introduction.purpose')}
              </p>

              {/* What you will discover */}
              <div
                className="introduction-section mb-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(t('introduction.whatYouWillDiscover')) }}
              />

              {/* How it works */}
              <div
                className="introduction-section mb-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(t('introduction.howItWorks')) }}
              />

              {/* Important notes */}
              <div
                className="introduction-section mb-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(t('introduction.importantNotes')) }}
              />

              {/* Ready? */}
              <p className="text-xl font-bold text-center mt-8 text-gray-900 dark:text-white">
                {t('introduction.ready')}
              </p>
            </div>

            {/* Start Button */}
            <div className="mt-12 text-center">
              <button
                onClick={handleStartQuestionnaire}
                className="px-12 py-4 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                {t('startButton')}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t('estimatedDuration', { minutes: structure.metadata.estimated_duration_minutes })}
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>{t('copyright', { version: structure.metadata.version })}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">{t('noQuestions')}</p>
        </div>
    );
  }

  const currentBloc = structure?.blocs.find((b) => b.id === currentQuestion.blocId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {/* Super Admin Indicator */}
            {isSuperAdminOptional && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-800 dark:text-purple-300">
                    {t('superAdminActive')}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400">
                    {t('superAdminOptional')}
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('title')}
                </h1>
                <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                  {structure?.metadata.purpose}
                </p>
              </div>
              <div className="text-left xs:text-right">
                <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-shinkofa-marine dark:text-secondary-300">
                  {currentIndex + 1}/{flatQuestions.length}
                </div>
                <p className="text-xs xs:text-sm text-gray-500 dark:text-gray-400 mt-1">{Math.round(progress)}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange transition-all duration-500 ease-out"
                />
              </div>
              {currentBloc && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                  {currentBloc.emoji} <strong>{t('bloc', { id: currentBloc.id })}</strong>: {currentBloc.title}
                </p>
              )}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 xs:p-6 sm:p-10 mb-8 transform transition-all duration-300 hover:shadow-3xl">
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentIndex + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                  {currentQuestion.annotation && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {parseMarkdown(currentQuestion.annotation)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question Component */}
            <div className="ml-0 xs:ml-4 md:ml-16">
              {/* Special handling for Question 1 (Name question) - split into surname and first names */}
              {currentQuestion.id === 'A0_Q01' && (
                <QuestionNameSplit
                  question={currentQuestion}
                  value={currentAnswer || ''}
                  onChange={handleAnswerChange}
                />
              )}
              {currentQuestion.type === 'text' && !(currentIndex === 0 && currentQuestion.text.toLowerCase().includes('nom')) && (
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
            </div>

            {/* Navigation */}
            <div className="mt-6 xs:mt-8 sm:mt-10 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-3 xs:gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="touch-target px-4 xs:px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-sm xs:text-base"
              >
                {t('previous')}
              </button>

              <div className="hidden xs:flex flex-1 text-center">
                {currentQuestion.required && !hasAnswer && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium w-full">
                    {t('requiredQuestion')}
                  </p>
                )}
              </div>

              {/* Warning mobile - affiché au-dessus des boutons */}
              {currentQuestion.required && !hasAnswer && (
                <p className="xs:hidden text-xs text-amber-600 dark:text-amber-400 font-medium text-center">
                  {t('requiredQuestion')}
                </p>
              )}

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!hasAnswer || isSaving}
                  className="touch-target px-6 xs:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm xs:text-base"
                >
                  {isSaving ? t('finalizing') : t('finish')}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  className="touch-target px-6 xs:px-8 py-3 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm xs:text-base"
                >
                  {t('next')}
                </button>
              )}
            </div>

            {/* Save Confirmation (discreet under form) */}
            {showSaveConfirm && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2 animate-fade-in">
                <span className="text-lg">✅</span>
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                  {t('answerSaved')}
                </p>
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('autoSaveTip')}
                </p>
              </div>
            </div>
          </div>

          {/* Resume Progress Modal */}
          {showResumeModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('resumeModal.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('resumeModal.description', { count: savedSession?.answers?.length || 0 })}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleResumeProgress}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('resumeModal.resume')}
                  </button>
                  <button
                    onClick={handleStartNew}
                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                  >
                    {t('resumeModal.startNew')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>{t('copyright', { version: structure?.metadata?.version || '5.0' })}</p>
          </div>
        </div>

        {/* Super Admin Questions Panel */}
        {isSuperAdminActive && (
          <SuperAdminQuestionsPanel
            onGoToQuestion={handleGoToQuestion}
            onFillRandomAnswers={handleFillRandomAnswers}
            sessionId={sessionId}
          />
        )}
      </div>
  );
}
