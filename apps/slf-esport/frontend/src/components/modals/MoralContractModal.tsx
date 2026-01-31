/**
 * MoralContractModal - Mandatory modal displayed at first login
 * Players must read and accept the moral contract before accessing the platform
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'
import api from '@/services/api'

interface MoralContractModalProps {
  isOpen: boolean
  onAccept: () => void
  token: string
}

const MORAL_CONTRACT_CONTENT = `CONTRAT MORAL DES JOUEURS – ÉQUIPE SLF (SALADE DE FRUITS)

« Chaque joueur apporte sa propre saveur à la Salade de Fruits : ensemble, nous visons l'excellence internationale ! »


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRÉAMBULE – L'ESPRIT SLF

L'Équipe SLF incarne une vision holistique de l'esport : performance, bien-être, respect et croissance collective.

Ce contrat moral définit notre cadre de collaboration, en respectant les valeurs humaines, l'inclusion des neurodivergents et l'ambition professionnelle.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ENGAGEMENT ENVERS L'ÉQUIPE ET SES OBJECTIFS

Chaque joueur place l'intérêt collectif au cœur de son engagement, avec un taux de participation minimum de 80% aux entraînements, scrims et réunions. Toute absence doit être signalée au moins une heure à l'avance sur Discord.

Rejoindre la SLF signifie choisir l'excellence collective. Un engagement inférieur à 80% de participation peut entraîner une révision du statut au sein de l'équipe après accompagnement et dialogue.

Avant toute sanction, un entretien individuel sera organisé pour comprendre les difficultés et proposer des solutions adaptées (plan de progression personnel, aménagements, accompagnement).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. COMMUNICATION ET ESPRIT D'ÉQUIPE

La communication reste claire, respectueuse et constructive. Les échanges sur Discord privilégient la progression collective et la bienveillance.

Chaque membre s'exprime de manière inclusive, en évitant la vulgarité et les abréviations confuses. Les discussions restent centrées sur l'équipe. Les conflits sont résolus par le dialogue et la médiation.

La SLF respecte les particularités neurodivergentes (TDAH, HPI, hypersensibilité, etc.) et encourage l'adaptation des méthodes de communication selon les besoins individuels.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. DISCIPLINE ET RESPECT DE L'ENTRAÎNEMENT

PONCTUALITÉ : Arrivée 5 minutes avant chaque session obligatoire.

Le respect intégral du programme d'entraînement individuel et collectif est obligatoire :

  • Suivi quotidien des exercices via la Plateforme SLF (dashboard joueur, statistiques de progression)
  • Captures d'écran des sessions complétées postées sur Discord (#daily-training)
  • En cas de difficultés répétées, un plan de soutien personnalisé sera mis en place avant toute action disciplinaire

Les instructions du staff sont suivies dans un esprit de collaboration. Les questionnements constructifs sont encouragés ; l'opposition systématique ne l'est pas.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. BIEN-ÊTRE HOLISTIQUE ET ÉQUILIBRE

La SLF priorise l'équilibre vie professionnelle/vie personnelle, le sommeil, l'alimentation saine et la gestion du stress. Chaque joueur prend soin de sa santé mentale et physique.

  • Pauses obligatoires : 5-10 minutes toutes les heures d'entraînement
  • Déconnexion quotidienne : minimum 1 heure sans écrans (auto-rapportée dans le journal personnel)
  • Sommeil : minimum 6-8 heures par nuit (suivi via journal de la plateforme)
  • Alimentation équilibrée : hydratation, fruits, légumes, protéines
  • Demander de l'aide si stressé ou confronté à des difficultés personnelles

Le staff (coach, manager) est disponible pour accompagner chaque joueur dans la gestion de son bien-être, en offrant un soutien sans jugement.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. CONFIDENTIALITÉ ET PROPRIÉTÉ INTELLECTUELLE

Les stratégies, méthodes et contenus SLF restent confidentiels pendant et après l'implication. L'utilisation de la marque SLF nécessite une autorisation.

Les joueurs s'engagent à protéger les informations sensibles de l'équipe. L'utilisation du logo, du nom ou de l'image SLF pour des projets personnels doit être approuvée par la direction.

  • Streams personnels : libres, mention SLF appréciée mais non obligatoire
  • Réseaux sociaux : représentation positive encouragée
  • Merchandising : approbation obligatoire


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. DROITS À L'IMAGE ET RESPECT

Les joueurs autorisent l'utilisation de leur image pour la promotion SLF en respectant leur dignité. Ils peuvent refuser des utilisations spécifiques par demande écrite.

Les contenus publiés respectent la vie privée et les valeurs. Les joueurs conservent le droit de revoir et d'exiger la suppression de l'utilisation de leur image.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. DROITS ET SOUTIEN DES JOUEURS

Les joueurs bénéficient de :

  • Coaching personnalisé et collectif via la plateforme
  • Accès exclusif à la Plateforme SLF (exercices cognitifs, mini-jeux, suivi progression)
  • Formation continue : technique, mentale, communication
  • Soutien au bien-être et médiation des conflits
  • Transparence financière totale (partage des prix 70/30)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. GESTION DES CONFLITS ET SANCTIONS PROGRESSIVES

PROCESSUS DE RÉSOLUTION :

  1. Dialogue direct entre les personnes concernées
  2. Médiation du staff si nécessaire
  3. Plan de soutien personnalisé
  4. Sanctions en dernier recours : avertissement → suspension temporaire → exclusion

PRINCIPE FONDAMENTAL : Chaque situation est unique ; chaque joueur mérite d'être entendu et soutenu avant toute sanction.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. PARTAGE DES PRIX – TRANSPARENCE TOTALE

RÉPARTITION :

  • 70% aux joueurs (répartis équitablement entre les membres actifs au moment des gains)
  • 30% à la SLF (organisation, coaching, logistique, développement de la plateforme)

DÉTAILS :

  • Paiements dans un délai maximum de 30 jours après réception
  • Relevés détaillés disponibles sur demande
  • Transparence comptable totale

DÉFINITION DU MEMBRE ACTIF : Joueur présent et engagé au moment de la compétition génératrice de revenus, indépendamment des changements ultérieurs de composition.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. CE QUE REPRÉSENTE LA SLF

NOUS SOMMES :

  • Une équipe d'élite ambitieuse et bienveillante
  • Un collectif respectueux des individualités
  • Un environnement d'apprentissage et de croissance
  • Une famille esport inclusive et professionnelle

NOUS NE SOMMES PAS :

  • Un groupe occasionnel sans ambition
  • Un environnement toxique ou individualiste
  • Une structure rigide sans écoute
  • Un espace de jugement ou d'exclusion


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. UTILISATION DE LA PLATEFORME SLF

ACCÈS ET CONNEXION :

  • Chaque joueur reçoit des identifiants personnels pour accéder à la plateforme
  • Première connexion : acceptation de ce contrat moral obligatoire
  • Accès dashboard joueur personnalisé avec statistiques de progression

FONCTIONNALITÉS DISPONIBLES :

📊 DASHBOARD JOUEUR
  Suivi de ta progression en temps réel, statistiques détaillées, historique des sessions, objectifs personnels

🎮 EXERCICES COGNITIFS (5 catégories)
  • Réflexes : temps de réaction, rapidité de décision
  • Vision : vision périphérique, tracking d'objets multiples
  • Mémoire : rétention, rappel, séquences
  • Attention : concentration, focus, vigilance
  • Coordination : multi-tâches, synchronisation

🕹️ MINI-JEUX INTÉGRÉS
  • Multi-Task Test : gestion de tâches simultanées
  • Peripheral Vision Trainer : entraînement vision périphérique
  • Exercices personnalisés créés par les coachs

📅 CALENDRIER & SESSIONS
  Planning d'équipe, sessions programmées, rappels automatiques

📈 RAPPORTS & ANALYTICS
  Rapports hebdomadaires, analyses détaillées, comparaison des performances

📝 JOURNAL PERSONNEL
  Notes quotidiennes, suivi sommeil/nutrition/bien-être, auto-réflexion

RESPECT DE LA CONFIDENTIALITÉ :

  • Ne pas partager les accès à la plateforme avec des personnes extérieures
  • Respecter la confidentialité des données personnelles des autres joueurs
  • Ne pas divulguer les stratégies d'équipe en dehors du cercle autorisé

UTILISATION RESPONSABLE :

  • Utiliser la plateforme uniquement à des fins d'entraînement et de développement
  • Compléter régulièrement les exercices assignés par le coach
  • Donner du feedback sur les outils et fonctionnalités proposés

SÉCURITÉ DES COMPTES :

  • Protéger son mot de passe et ne jamais le partager
  • Signaler toute activité suspecte sur son compte
  • Déconnexion après chaque session sur appareil partagé


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12. PROGRAMME D'ENTRAÎNEMENT

ROUTINE QUOTIDIENNE OBLIGATOIRE (1,5 à 2h) :

DÉVELOPPEMENT PERSONNEL (45-65 min) :
  • Respiration et Méditation : 10-15 min (module Bien-être)
  • Auto-suggestion : 5 min (journal personnel)
  • Activité physique : 20-30 min (ressources vidéo)
  • Exercices cognitifs : 20 min (section Exercices)
  • Pratique de l'anglais : 5 min minimum

ENTRAÎNEMENT GAMING (40-60 min) :
  • Coordination : 10-15 min (Multi-Task Test, Peripheral Vision Trainer)
  • Stratégie : 10-15 min optionnel (échecs, Go, puzzles)
  • Simulations HOK : 30 min minimum (combos, synergies, optimisation)
  • Revue de jeu : 1-2 matchs analysés

ÉQUILIBRE ET RÉCUPÉRATION :
  • Nutrition équilibrée (journal personnel)
  • Pauses : 5-10 min/heure (rappels plateforme)
  • Déconnexion : 1h/jour sans écran
  • Sommeil : 6-8h/nuit

ROUTINE HEBDOMADAIRE :
  • Analyse 2 matchs pro minimum
  • Réunions d'équipe (calendrier plateforme)
  • Partage progression sur Discord
  • Veille stratégique (actualités HOK, méta)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13. ÉVOLUTION ET ADAPTATION

Ce contrat évolue avec l'équipe. Toute modification sera discutée collectivement et validée par la signature de tous les membres.

L'amélioration continue de la Plateforme SLF entraînera des mises à jour de ce contrat, en maintenant l'esprit et les valeurs SLF.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCEPTATION DU CONTRAT

En acceptant ce contrat moral, je m'engage à :

  • Respecter tous les principes énoncés dans ce document
  • Contribuer positivement à La Salade de Fruits E-Sport
  • Faire preuve de bonne foi et de bienveillance envers tous les membres
  • Communiquer rapidement toute difficulté ou situation problématique
  • Utiliser la Plateforme SLF de manière responsable et régulière
  • Suivre le programme d'entraînement quotidien et hebdomadaire
  • Représenter l'équipe SLF avec dignité en compétition et en public

Je comprends que le non-respect répété et grave de ces principes peut entraîner des sanctions, allant de l'avertissement à l'exclusion de l'équipe, après discussion avec le coach et le manager.

Je reconnais également que l'équipe s'engage à :

  • Soutenir ma progression avec des outils professionnels
  • Respecter mes droits et ma personnalité
  • Maintenir un environnement bienveillant et inclusif
  • Assurer la transparence et l'équité dans tous les domaines
  • M'accompagner en cas de difficultés, avant toute sanction


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

« Le succès est comme une salade de fruits : chaque saveur compte. »

— Jay, The Ermite – Maître Shinkofa


LA SALADE DE FRUITS E-SPORT
Cultivons l'excellence, récoltons les victoires 🥗🏆

Version 2.0 – Décembre 2025
`

export default function MoralContractModal({ isOpen, onAccept, token }: MoralContractModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasAcceptedCheckbox, setHasAcceptedCheckbox] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px tolerance
      setHasScrolledToBottom(isAtBottom)
    }
  }

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
      setHasAcceptedCheckbox(false)
      setError(null)
    }
  }, [isOpen])

  const handleAccept = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await api.post('/auth/accept-moral-contract')
      console.log('Contract accepted:', response.data)
      onAccept()
    } catch (err) {
      console.error('Error accepting contract:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const canAccept = hasScrolledToBottom && hasAcceptedCheckbox

  return (
    <>
      {/* Backdrop (non-dismissable) */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-fade-in" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-strong max-w-4xl w-full animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🥗</div>
                <h2
                  id="modal-title"
                  className="text-3xl font-bold text-primary-900 dark:text-white mb-2"
                >
                  Contrat Moral
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  La Salade de Fruits E-Sport
                </p>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div
              ref={contentRef}
              onScroll={handleScroll}
              className="px-6 py-6 max-h-[60vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
            >
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {MORAL_CONTRACT_CONTENT}
              </div>

              {!hasScrolledToBottom && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-800 pt-8 text-center">
                  <p className="text-primary-600 dark:text-primary-400 font-semibold animate-pulse">
                    ↓ Continue de lire jusqu'en bas ↓
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Acceptance */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Checkbox */}
              <div className="mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAcceptedCheckbox}
                    onChange={(e) => setHasAcceptedCheckbox(e.target.checked)}
                    disabled={!hasScrolledToBottom}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    J'ai lu et je comprends le contrat moral de La Salade de Fruits E-Sport.
                    Je m'engage à respecter les principes énoncés ci-dessus.
                  </span>
                </label>
              </div>

              {/* Accept Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleAccept}
                disabled={!canAccept || isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Acceptation en cours...' : 'Accepter le contrat moral'}
              </Button>

              {!hasScrolledToBottom && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Tu dois lire le contrat en entier avant de pouvoir l'accepter
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
