/**
 * Page Questionnaire avec sauvegarde automatique de la progression
 * Les utilisateurs peuvent reprendre où ils se sont arrêtés
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireDataV5 as questionnaireData } from '../data/questionnaireDataV5';
import type { QuestionAnswer, QuestionnaireProgress } from '../types/questionnaire';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { QuestionRenderer } from '../components/questionnaire/QuestionRenderer';
import { ProgressBar } from '../components/questionnaire/ProgressBar';
import { submitQuestionnaire, isBrevoConfigured } from '../services/brevoService';

const STORAGE_KEY = 'shinkofa-questionnaire-progress';

export function Questionnaire() {
  const navigate = useNavigate();
  const [progress, setProgress, clearProgress] = useLocalStorage<QuestionnaireProgress | null>(
    STORAGE_KEY,
    null
  );

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Restaurer la progression sauvegardée
  useEffect(() => {
    if (progress && !progress.completed) {
      setShowWelcomeBack(true);
    }
  }, []);

  const handleRestoreProgress = () => {
    if (progress) {
      setCurrentSectionIndex(progress.currentSectionIndex);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setAnswers(progress.answers);
      setShowWelcomeBack(false);
    }
  };

  const handleStartFresh = () => {
    clearProgress();
    setShowWelcomeBack(false);
  };

  // Sauvegarder automatiquement la progression
  useEffect(() => {
    if (answers.length > 0) {
      const newProgress: QuestionnaireProgress = {
        questionnaireId: questionnaireData.id,
        currentSectionIndex,
        currentQuestionIndex,
        answers,
        startedAt: progress?.startedAt || new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        completed: false
      };
      setProgress(newProgress);
    }
  }, [currentSectionIndex, currentQuestionIndex, answers]);

  const currentSection = questionnaireData.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];

  // Calculer la progression globale
  const totalQuestions = questionnaireData.sections.reduce(
    (acc, section) => acc + section.questions.length,
    0
  );
  const questionsAnswered = answers.length;

  const handleAnswer = (value: string | string[] | number) => {
    const newAnswer: QuestionAnswer = {
      questionId: currentQuestion.id,
      value,
      answeredAt: new Date().toISOString()
    };

    // Mettre à jour ou ajouter la réponse
    setAnswers(prevAnswers => {
      const existingIndex = prevAnswers.findIndex(a => a.questionId === currentQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prevAnswers];
        updated[existingIndex] = newAnswer;
        return updated;
      }
      return [...prevAnswers, newAnswer];
    });
  };

  const getCurrentAnswer = (): QuestionAnswer | undefined => {
    return answers.find(a => a.questionId === currentQuestion?.id);
  };

  const canGoNext = (): boolean => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;

    const answer = getCurrentAnswer();
    if (!answer) return false;

    // Vérifier que la réponse n'est pas vide
    if (Array.isArray(answer.value)) {
      return answer.value.length > 0;
    }
    return answer.value !== '' && answer.value !== null && answer.value !== undefined;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      alert('Merci de répondre à cette question obligatoire avant de continuer.');
      return;
    }

    // Passer à la question suivante
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < questionnaireData.sections.length - 1) {
      // Passer à la section suivante
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Questionnaire terminé
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(questionnaireData.sections[currentSectionIndex - 1].questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    // Créer une map des questions pour le service Brevo
    const questionsMap = new Map<string, { title: string; type: string }>();
    questionnaireData.sections.forEach(section => {
      section.questions.forEach(q => {
        questionsMap.set(q.id, { title: q.title, type: q.type });
      });
    });

    // Récupérer l'email et le nom depuis les réponses
    const emailAnswer = answers.find(a => a.questionId === 'email');
    const nameAnswer = answers.find(a => a.questionId === 'nom');

    const userEmail = emailAnswer?.value as string || '';
    const userName = nameAnswer?.value as string || '';

    // Marquer comme complété
    const completedProgress: QuestionnaireProgress = {
      questionnaireId: questionnaireData.id,
      currentSectionIndex,
      currentQuestionIndex,
      answers,
      startedAt: progress?.startedAt || new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      completed: true,
      completedAt: new Date().toISOString()
    };
    setProgress(completedProgress);

    // Envoyer via Brevo si configuré
    if (isBrevoConfigured() && userEmail) {
      try {
        await submitQuestionnaire(userEmail, userName, answers, questionsMap);
      } catch (error) {
        console.error('Erreur Brevo:', error);
        // On continue quand même vers la page de remerciement
        // Les données sont sauvegardées localement
      }
    }

    // Rediriger vers la page de remerciement
    navigate('/questionnaire/merci');
  };

  const canGoPrevious = currentSectionIndex > 0 || currentQuestionIndex > 0;
  const isLastQuestion =
    currentSectionIndex === questionnaireData.sections.length - 1 &&
    currentQuestionIndex === currentSection?.questions.length - 1;

  // Modal de reprise
  if (showWelcomeBack) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-lg">
          <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
            Bon retour ! 👋
          </h2>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-6">
            Nous avons sauvegardé ta progression. Tu en étais à la question {progress?.currentQuestionIndex! + 1} de la section "{questionnaireData.sections[progress?.currentSectionIndex!]?.title}".
          </p>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70 mb-8">
            Que souhaites-tu faire ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleRestoreProgress} className="btn-primary flex-1">
              Reprendre où j'en étais
            </button>
            <button onClick={handleStartFresh} className="btn-secondary flex-1">
              Recommencer à zéro
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSection || !currentQuestion) {
    return (
      <div className="container-shinkofa py-12">
        <p className="text-center text-bleu-profond dark:text-blanc-pur">
          Chargement du questionnaire...
        </p>
      </div>
    );
  }

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
            {questionnaireData.title}
          </h1>
          <p className="text-bleu-profond/70 dark:text-blanc-pur/70">
            {questionnaireData.description}
          </p>
        </div>

        {/* Barre de progression */}
        <ProgressBar current={questionsAnswered + 1} total={totalQuestions} />

        {/* Section actuelle */}
        <div className="card mb-8">
          <div className="mb-6 pb-6 border-b border-beige-sable dark:border-bleu-fonce">
            <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
              {currentSection.title}
            </h2>
            {currentSection.description && (
              <p className="text-bleu-profond/60 dark:text-blanc-pur/60">
                {currentSection.description}
              </p>
            )}
          </div>

          {/* Question actuelle */}
          <div className="space-y-4">
            <div>
              <label htmlFor={currentQuestion.id} className="block mb-2">
                <span className="text-lg font-semibold text-bleu-profond dark:text-blanc-pur">
                  {currentQuestion.title}
                  {currentQuestion.required && (
                    <span className="text-accent-lumineux ml-1" aria-label="requis">*</span>
                  )}
                </span>
              </label>
              {currentQuestion.description && (
                <p
                  id={`${currentQuestion.id}-desc`}
                  className="text-sm text-bleu-profond/60 dark:text-blanc-pur/60 mb-4"
                >
                  {currentQuestion.description}
                </p>
              )}
            </div>

            <QuestionRenderer
              question={currentQuestion}
              answer={getCurrentAnswer()}
              onChange={handleAnswer}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Envoyer' : 'Suivant →'}
          </button>
        </div>

        {/* Indicateur de sauvegarde automatique */}
        <p className="text-center text-sm text-bleu-profond/50 dark:text-blanc-pur/50 mt-6">
          💾 Ta progression est sauvegardée automatiquement
        </p>
      </div>
    </div>
  );
}
