/**
 * Page de remerciement après complétion du questionnaire
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { questionnaireDataV5 as questionnaireData } from '../data/questionnaireDataV5';
import { generateAIPrompt, generateInstructions } from '../services/promptGenerator';
import type { QuestionnaireProgress } from '../types/questionnaire';

const STORAGE_KEY = 'shinkofa-questionnaire-progress';

export function ThankYou() {
  const [progress] = useLocalStorage<QuestionnaireProgress | null>(STORAGE_KEY, null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instructions' | 'prompt'>('instructions');

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Générer le prompt IA si les réponses sont disponibles
    if (progress && progress.completed && progress.answers.length > 0) {
      // Créer une map des questions
      const questionsMap = new Map<string, { title: string; type: string }>();
      questionnaireData.sections.forEach(section => {
        section.questions.forEach(q => {
          questionsMap.set(q.id, { title: q.title, type: q.type });
        });
      });

      // Récupérer les informations utilisateur
      const emailAnswer = progress.answers.find(a => a.questionId === 'email');
      const prenomAnswer = progress.answers.find(a => a.questionId === 'prenom');
      const nomAnswer = progress.answers.find(a => a.questionId === 'nom');

      const userInfo = {
        email: emailAnswer?.value as string || 'non-renseigné@email.com',
        prenom: prenomAnswer?.value as string || 'Utilisateur',
        nom: nomAnswer?.value as string || 'Shinkofa',
      };

      // Générer le prompt et les instructions
      const generatedPrompt = generateAIPrompt(userInfo, progress.answers, questionsMap);
      const generatedInstructions = generateInstructions(userInfo);

      setAiPrompt(generatedPrompt);
      setInstructions(generatedInstructions);
    }
  }, [progress]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
      alert('Impossible de copier. Veuillez sélectionner et copier manuellement (Ctrl+C).');
    }
  };

  return (
    <div className="container-shinkofa py-12">
      <div className="max-w-5xl mx-auto text-center">
        {/* Animation de succès */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-lumineux to-dore-principal rounded-full flex items-center justify-center text-6xl animate-bounce">
            ✨
          </div>
        </div>

        {/* Message principal */}
        <h1 className="text-4xl md:text-5xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
          Merci infiniment ! 🙏
        </h1>

        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-8">
          Ton voyage vers la compréhension de ton profil unique commence maintenant !
        </p>

        {/* Carte d'information avec onglets */}
        <div className="card text-left mb-8">
          <h2 className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-6">
            Et maintenant ? Génère ta Synthèse Holistique ! 🎯
          </h2>

          {/* Onglets */}
          <div className="flex border-b border-beige-sable dark:border-bleu-fonce mb-6">
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'instructions'
                  ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                  : 'text-bleu-profond/60 dark:text-blanc-pur/60 hover:text-accent-lumineux'
              }`}
            >
              📖 Instructions
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'prompt'
                  ? 'border-b-2 border-accent-lumineux text-accent-lumineux'
                  : 'text-bleu-profond/60 dark:text-blanc-pur/60 hover:text-accent-lumineux'
              }`}
            >
              🤖 Prompt IA
            </button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'instructions' ? (
            <div className="space-y-4 text-bleu-profond/70 dark:text-blanc-pur/70">
              <div className="bg-accent-lumineux/10 dark:bg-accent-lumineux/20 p-4 rounded-shinkofa-md mb-4">
                <p className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                  📧 Tu recevras également un email avec :
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>✅ Tes réponses complètes au questionnaire</li>
                  <li>✅ Le prompt IA personnalisé (onglet ci-dessus)</li>
                  <li>✅ Les instructions détaillées</li>
                </ul>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap bg-blanc-pur dark:bg-bleu-profond p-4 rounded-shinkofa-md text-xs overflow-auto max-h-96 border border-beige-sable dark:border-bleu-fonce">
                  {instructions || 'Génération des instructions en cours...'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent-lumineux/10 dark:bg-accent-lumineux/20 p-4 rounded-shinkofa-md">
                <p className="font-semibold text-bleu-profond dark:text-blanc-pur mb-2">
                  🎯 Mode d'emploi rapide :
                </p>
                <ol className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 space-y-2 ml-4">
                  <li>1️⃣ Clique sur "Copier le prompt" ci-dessous</li>
                  <li>2️⃣ Génère ta <strong>Carte de Design Humain</strong> sur <a href="https://www.mybodygraph.com/" target="_blank" rel="noopener noreferrer" className="text-accent-lumineux hover:underline">mybodygraph.com</a></li>
                  <li>3️⃣ Génère ta <strong>Carte du Ciel</strong> sur <a href="https://www.astro.com/" target="_blank" rel="noopener noreferrer" className="text-accent-lumineux hover:underline">astro.com</a></li>
                  <li>4️⃣ Va sur <strong>Perplexity</strong> (<a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-accent-lumineux hover:underline">perplexity.ai</a>) avec le modèle <strong>"Claude Sonnet 4.5 (raisonnement)"</strong></li>
                  <li>5️⃣ Colle le prompt + joins tes 2 cartes</li>
                  <li>6️⃣ Lance et patiente 2-5 min ⏳</li>
                </ol>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={aiPrompt || 'Génération du prompt en cours...'}
                  className="w-full h-96 p-4 rounded-shinkofa-md border-2 border-beige-sable dark:border-bleu-fonce bg-blanc-pur dark:bg-bleu-profond text-bleu-profond dark:text-blanc-pur font-mono text-xs resize-vertical"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button
                  onClick={handleCopyPrompt}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-shinkofa-md font-semibold transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-accent-lumineux hover:bg-accent-doux text-blanc-pur'
                  }`}
                >
                  {copied ? '✓ Copié !' : '📋 Copier le prompt'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <p className="text-lg text-bleu-profond dark:text-blanc-pur font-semibold">
            Envie d'aller plus loin ?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contribuer" className="btn-primary">
              Découvrir les façons de contribuer
            </Link>
            <Link to="/" className="btn-secondary">
              Retour à l'accueil
            </Link>
          </div>
        </div>

        {/* Citation inspirante */}
        <div className="mt-12 pt-8 border-t border-beige-sable dark:border-bleu-fonce">
          <p className="text-2xl font-bold text-bleu-profond dark:text-blanc-pur mb-2">
            真の歩 (Shin-Ko-Fa)
          </p>
          <p className="text-lg text-bleu-profond/80 dark:text-blanc-pur/80 italic">
            "Chaque pas authentique sur ton chemin unique est plus précieux que mille pas empruntés sur le chemin d'un autre."
          </p>
        </div>

        {/* Note de partage */}
        <div className="mt-8 p-6 bg-accent-lumineux/10 dark:bg-accent-lumineux/20 rounded-shinkofa-lg">
          <p className="text-bleu-profond dark:text-blanc-pur font-semibold mb-2">
            💡 Tu connais quelqu'un qui pourrait bénéficier de Shinkofa ?
          </p>
          <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70 mb-4">
            Partage le questionnaire avec d'autres neurodivergents dans ton entourage !
          </p>
          <a
            href={`mailto:?subject=Découvre Shinkofa&body=Salut ! Je viens de répondre au questionnaire de Shinkofa, un projet d'écosystème adapté aux neurodivergents. Ça pourrait t'intéresser : ${window.location.origin}/questionnaire`}
            className="text-accent-lumineux hover:text-accent-doux transition-colors font-medium"
          >
            Partager par email →
          </a>
        </div>
      </div>
    </div>
  );
}
