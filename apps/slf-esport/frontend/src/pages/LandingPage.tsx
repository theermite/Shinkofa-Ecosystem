/**
 * Landing Page - Public showcase for La Salade de Fruits E-Sport
 * Version 2.0 - December 2025
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import ThemeToggle from '@/components/ui/ThemeToggle'
import BackToTop from '@/components/ui/BackToTop'
import VisionModal from '@/components/modals/VisionModal'
import StaffModal from '@/components/modals/StaffModal'
import recruitmentService from '@/services/recruitmentService'

// Vision data
const visionData = [
  {
    icon: '🏆',
    title: 'Excellence Compétitive',
    summary: 'Entraînement structuré et coaching professionnel pour atteindre le plus haut niveau sur Honor of Kings.',
    description: `Nous visons l'excellence compétitive à travers un entraînement rigoureux et structuré.

Notre équipe s'engage dans des sessions d'entraînement intensives 4-5 fois par semaine, analyse approfondie de replays et développement de stratégies d'équipe sophistiquées.

Avec un coaching professionnel individualisé et collectif, nous participons activement aux tournois officiels Honor of Kings avec un objectif clair : intégrer le Top 10 France, puis viser les compétitions internationales.`,
    methods: [
      'Sessions d\'entraînement intensives (macro/micro gameplay)',
      'Drills mécaniques et exercices de réaction',
      'Scrims contre équipes compétitives',
      'Feedback vidéo détaillé post-match',
      'Coaching individuel et stratégies d\'équipe',
    ],
    details: [
      'Entraînement structuré 4-5x par semaine',
      'Analyse de replays et stratégies d\'équipe',
      'Coaching professionnel individuel et collectif',
      'Participation aux tournois Honor of Kings officiels',
      'Objectif : Top 10 France, puis compétitions internationales',
    ],
  },
  {
    icon: '🧠',
    title: 'Développement Holistique',
    summary: 'Coaching mental, gestion du stress, exercices cognitifs et bien-être pour des performances optimales.',
    description: `Le développement holistique est au cœur de notre philosophie.

Nous croyons qu'un joueur performant est un joueur équilibré. Notre approche intègre le coaching mental pour gérer le stress et développer la confiance, des exercices cognitifs ciblés pour améliorer les réflexes et la mémoire de travail, ainsi qu'un accompagnement sur le bien-être physique (nutrition, sommeil, pauses actives).

Nous aidons chaque joueur à trouver son équilibre entre vie personnelle (études/travail) et e-sport, en respectant les rythmes et la neurodiversité de chacun.`,
    methods: [
      'Mini-jeux cognitifs (vision périphérique, multitâche)',
      'Sessions de respiration et gestion émotionnelle',
      'Suivi progression personnalisé',
      'Bibliothèque d\'exercices sur plateforme',
      'Coaching adapté aux neurodiversités (TDAH, HPI)',
    ],
    details: [
      'Coaching mental : gestion du stress, confiance, mindset',
      'Exercices cognitifs : réflexes, mémoire de travail, attention',
      'Bien-être physique : nutrition, sommeil, pauses actives',
      'Équilibre vie-gaming : études/travail + e-sport',
    ],
  },
  {
    icon: '🤝',
    title: 'Esprit d\'Équipe',
    summary: 'Communication, cohésion et soutien mutuel pour créer une équipe soudée et performante.',
    description: `L'esprit d'équipe est notre fondation.

Nous cultivons une communication efficace in-game et hors-game, organisons des activités de team-building et créons un environnement de soutien mutuel où chaque victoire est célébrée ensemble et chaque défaite devient une opportunité d'apprentissage.

Notre culture valorise le respect, l'inclusion de toutes les neurodiversités et rythmes personnels, la progression collective plutôt que la performance individuelle, et le feedback constructif dans la transparence.`,
    methods: [
      'Communication in-game optimisée',
      'Team-building réguliers',
      'Feedback constructif et transparent',
      'Sessions de cohésion d\'équipe',
      'Culture positive et bienveillante',
    ],
    details: [
      'Respect et inclusion (neurodiversité, rythmes variés)',
      'Progression collective > performances individuelles',
      'Feedback constructif et transparent',
      'Engagement et discipline partagés',
    ],
  },
]

// Staff data
const staffData = [
  {
    name: 'Gautier-Landry Sodart',
    role: 'Manager & Créateur',
    nickname: 'Le-Blond',
    photo: '/team-gautier.png',
    fruit: 'Kiwi 🥝 (Petit mais puissant !)',
    animal: 'Loup 🐺',
    quote: 'Bâtir une équipe, c\'est cultiver un jardin de talents',
    vision: 'Créer une équipe e-sport ambitieuse et bienveillante qui respecte l\'équilibre de vie de chaque joueur tout en visant l\'excellence compétitive.',
    roleInTeam: 'Gestion administrative, logistique, budget, communication externe, et développement de la marque LSLF. Je m\'assure que l\'équipe dispose de toutes les ressources nécessaires pour performer.',
    funFact: 'Adore les kiwis (d\'où le fruit totem) et les stratégies à long terme. Fan de séries fantastiques et amateur de cuisine fruitée !',
  },
  {
    name: 'Jaypee Goncalves',
    role: 'Coach Principal',
    nickname: 'The-Ermite',
    photo: '/team-jay.png',
    fruit: 'Mangue 🥭 (Doux mais structuré !)',
    animal: 'Tortue 🐢',
    quote: 'La performance naît de l\'équilibre entre intensité et repos',
    expertise: 'Coaching holistique, Design Humain, accompagnement des neurodiversités (TDAH/HPI). Spécialisé dans le développement de routines adaptées et l\'optimisation des performances en respectant les rythmes naturels.',
    roleInTeam: 'Coaching mental et stratégique, développement d\'exercices cognitifs, suivi de progression individualisé, et création de plans d\'entraînement adaptés. J\'accompagne chaque joueur dans son développement personnel et compétitif.',
    funFact: 'Passionné de pop culture, jeux vidéo, et stratégie. Expert en coaching et amélioration continue, toujours à la recherche de la meilleure optimisation pour performer ! Adepte de la philosophie Shinkofa.',
  },
]

// Players data
const playersData = [
  {
    name: 'Andreas',
    nickname: 'Meruem D. の実',
    role: 'Roam/Support',
    icon: '🛡️',
    photo: '/team-andreas.png',
    fruit: 'Fruit de la Passion 💜',
    animal: 'Lynx 🐱',
    bio: 'Stratège patient avec une vision d\'équipe exceptionnelle. Maître du peel et des engages calculés.',
  },
  {
    name: 'Fantantenana',
    nickname: 'Karma D. の実',
    role: 'ADC',
    icon: '🏹',
    photo: '/team-karma.png',
    fruit: 'Litchi 🍒',
    animal: 'Faucon 🦅',
    bio: 'Précision chirurgicale et réflexes fulgurants. Expert du positionnement et du DPS optimal.',
  },
  {
    name: 'Enzo',
    nickname: 'Soulz D. の実',
    role: 'Jungle',
    icon: '🌲',
    photo: '/team-enzo.png',
    fruit: 'Prune Noire 🍇',
    animal: 'Tigre Blanc 🐯',
    bio: 'Agressif et méthodique, contrôle absolu de la map. Spécialiste des ganks imprévisibles.',
  },
  {
    name: 'Omar',
    nickname: 'Tempest D. の実',
    role: 'Clash Lane',
    icon: '⚔️',
    photo: '/team-omar.png',
    fruit: 'Yuzu 🍋',
    animal: 'Aigle 🦅',
    bio: 'Pression constante et mécanique irréprochable. Dominant en 1v1 et expert du split-push.',
  },
]

export default function LandingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pseudo: '',
    email: '',
    age: '',
    country: '',
    languages: '',
    motivation: '',
    availability: '',
    status: '',
    interviewAvailability: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Modal states
  const [activeVisionModal, setActiveVisionModal] = useState<number | null>(null)
  const [activeStaffModal, setActiveStaffModal] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      await recruitmentService.submitApplication({
        first_name: formData.firstName,
        last_name: formData.lastName,
        pseudo: formData.pseudo,
        email: formData.email,
        age: formData.age,
        country: formData.country,
        languages: formData.languages,
        motivation: formData.motivation,
        availability: formData.availability,
        current_status: formData.status,
        interview_availability: formData.interviewAvailability,
        source: 'website'
      })

      setSubmitMessage('✅ Candidature envoyée avec succès ! Nous te contacterons bientôt sur Discord.')
      setFormData({
        firstName: '',
        lastName: '',
        pseudo: '',
        email: '',
        age: '',
        country: '',
        languages: '',
        motivation: '',
        availability: '',
        status: '',
        interviewAvailability: '',
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.'
      setSubmitMessage(`❌ ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo */}
            <a href="#hero" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo-lslf-sigle.png" alt="LSLF" className="h-12 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-primary-900 dark:text-white font-sans">
                  La Salade de Fruits
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">E-Sport Team</p>
              </div>
            </a>

            {/* Center: Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
              <a
                href="#about"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                À propos
              </a>
              <a
                href="#esport"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                eSport
              </a>
              <a
                href="#vision"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Vision
              </a>
              <a
                href="#team"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Équipe
              </a>
              <a
                href="#recruit"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Nous rejoindre
              </a>
            </div>

            {/* Right: Theme Toggle */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="/logo-lslf-full.png"
            alt="La Salade de Fruits E-Sport"
            className="h-48 mx-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-5xl lg:text-7xl font-bold text-primary-900 dark:text-white mb-6 font-sans">
            La Salade de Fruits
          </h1>
          <p className="text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-4">
            Équipe E-Sport Honor of Kings 🎮
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Une équipe dédiée à l'excellence compétitive, au développement holistique des joueurs
            et à la passion du gaming. <span className="font-semibold text-primary-600 dark:text-primary-400">Une recette gagnante de talents frais ! 🥗</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#recruit">
              <Button variant="primary" size="lg">
                🍓 Nous rejoindre
              </Button>
            </a>
            <a href="#team">
              <Button variant="outline" size="lg">
                👥 Découvrir l'équipe
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What is eSport Section */}
      <section id="esport" className="py-20 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              🎮 Qu'est-ce que l'eSport ?
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Bienvenue dans l'univers de la compétition gaming professionnelle
            </p>
            <div className="mt-8 flex justify-center">
              <img
                src="/hok-logo.png"
                alt="Honor of Kings"
                className="h-20 w-auto drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-3">Compétition de Haut Niveau</h3>
              <p className="text-primary-100 leading-relaxed">
                L'eSport (sport électronique) désigne la pratique compétitive de jeux vidéo,
                organisée en tournois professionnels avec équipes, entraîneurs, et stratégies élaborées.
                Comme dans le sport traditionnel, l'excellence requiert entraînement, discipline et esprit d'équipe.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-3">Un Phénomène Mondial</h3>
              <p className="text-primary-100 leading-relaxed">
                L'eSport rassemble des millions de fans à travers le monde, avec des compétitions
                diffusées en streaming et des prize pools impressionnants. En France, l'industrie
                est en plein essor avec des structures professionnelles reconnues.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">Honor of Kings : Notre Jeu</h3>
              <p className="text-primary-100 leading-relaxed">
                Honor of Kings est un MOBA 5v5 stratégique mobile, l'un des jeux les plus joués au monde.
                Il combine réflexes, stratégie d'équipe, et mécanique individuelle. Chaque rôle (Support, ADC, Jungle, Lane)
                est crucial pour la victoire.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold mb-3">Entraînement Structuré</h3>
              <p className="text-primary-100 leading-relaxed">
                Comme tout sport, l'eSport exige un entraînement régulier : drills mécaniques,
                analyse de replays, coaching mental, exercices cognitifs, et scrims contre d'autres équipes.
                La performance optimale naît de l'équilibre entre intensité et récupération.
              </p>
            </div>
          </div>

          {/* HOK ESport Hero Image */}
          <div className="mb-12">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/hok-esport.jpg"
                alt="Honor of Kings eSport Competition"
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent flex items-end">
                <div className="p-8 w-full">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    L'Excellence Compétitive Honor of Kings
                  </h3>
                  <p className="text-xl text-primary-100">
                    Rejoignez l'arène et écrivez votre légende avec La Salade de Fruits
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-primary-100 mb-6">
              <span className="font-semibold">La Salade de Fruits</span> cultive ces principes pour devenir
              une référence de l'eSport français sur Honor of Kings 🥗🏆
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section with Modals */}
      <section id="vision" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
              🎯 Notre Vision
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Développer les talents, cultiver l'excellence comme on cultive un verger 🌳
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visionData.map((vision, index) => (
              <button
                key={index}
                onClick={() => setActiveVisionModal(index)}
                className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-8 text-center transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
              >
                <div className="text-6xl mb-4">{vision.icon}</div>
                <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-3">
                  {vision.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {vision.summary}
                </p>
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  Cliquer pour en savoir plus →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Staff + Players */}
      <section id="team" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
              👥 Notre Équipe
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Les fruits qui composent notre salade gagnante 🥗
            </p>
          </div>

          {/* Staff Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-primary-900 dark:text-white text-center mb-8">
              🎯 Le Staff
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {staffData.map((member, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStaffModal(index)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer text-left"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-32 h-32 rounded-xl object-cover shadow-medium"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-2xl font-bold text-primary-900 dark:text-white mb-1">
                        {member.name}
                      </h4>
                      <p className="text-lg text-secondary-600 dark:text-secondary-400 font-semibold mb-1">
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">
                        "{member.nickname}"
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full">
                          {member.fruit}
                        </span>
                        <span className="text-xs bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300 px-3 py-1 rounded-full">
                          {member.animal}
                        </span>
                      </div>
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        Cliquer pour en savoir plus →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Players Section */}
          <div>
            <h3 className="text-3xl font-bold text-primary-900 dark:text-white text-center mb-8">
              🎮 Les Joueurs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {playersData.map((player, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                >
                  <div className="text-center mb-4">
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="w-32 h-32 rounded-xl object-cover shadow-medium mx-auto mb-4"
                    />
                    <div className="text-5xl mb-3">{player.icon}</div>
                    <h4 className="text-xl font-bold text-primary-900 dark:text-white mb-1">
                      {player.name}
                    </h4>
                    <p className="text-secondary-600 dark:text-secondary-400 font-semibold mb-1">
                      {player.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">
                      "{player.nickname}"
                    </p>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-primary-700 dark:text-primary-300">
                        {player.fruit}
                      </p>
                      <p className="text-xs text-secondary-700 dark:text-secondary-300">
                        {player.animal}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {player.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Section */}
      <section id="recruit" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
              🍓 Nous Rejoindre
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tu es passionné par Honor of Kings ? Ajoute ta touche fruitée à notre équipe ! 🥗
            </p>
          </div>

          {/* Discord CTA */}
          <div className="bg-gradient-to-r from-[#5865F2] to-[#7289DA] rounded-xl p-8 mb-8 text-center text-white shadow-lg">
            <h3 className="text-2xl font-bold mb-4">
              🍇 Rejoins la Salade de Fruits sur Discord !
            </h3>
            <p className="text-lg mb-6 text-blue-50">
              Découvre notre philosophie Shinkofa, échange avec l'équipe, et participe à nos événements communautaires.
            </p>
            <a
              href="https://discord.gg/fBdqpKZUht"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="bg-white text-[#5865F2] hover:bg-gray-100 font-bold">
                💬 Rejoindre le Discord LSLF
              </Button>
            </a>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
              Ce que nous recherchons
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-3">✓</span>
                <span>Passion pour Honor of Kings et l'e-sport compétitif</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-3">✓</span>
                <span>Motivation pour progresser et s'entraîner régulièrement</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-3">✓</span>
                <span>Esprit d'équipe et communication positive</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-3">✓</span>
                <span>Disponibilité pour les sessions d'entraînement et compétitions</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
              Formulaire de candidature
            </h3>

            {submitMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
                {submitMessage}
              </div>
            )}

            <div className="space-y-6">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ton prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ton nom"
                  />
                </div>
              </div>

              {/* Pseudo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pseudo (in-game) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pseudo}
                  onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ton pseudo de jeu"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ton.email@exemple.com"
                />
              </div>

              {/* Âge et Pays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Âge *
                  </label>
                  <input
                    type="number"
                    required
                    min="13"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pays de résidence *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="France"
                  />
                </div>
              </div>

              {/* Langues parlées */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Langues parlées *
                </label>
                <input
                  type="text"
                  required
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Français, Anglais, Espagnol..."
                />
              </div>

              {/* Motivation & Objectifs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivation & Objectifs (perso/jeu) *
                </label>
                <textarea
                  required
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Pourquoi veux-tu rejoindre la team ? Quels sont tes objectifs personnels et dans le jeu ?"
                />
              </div>

              {/* Disponibilités entraînement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disponibilités entraînement *
                </label>
                <textarea
                  required
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Lundi-Vendredi 18h-22h, Week-end flexible..."
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner ton statut</option>
                  <option value="Étudiant">Étudiant</option>
                  <option value="Salarié">Salarié</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Disponibilités entretien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disponibilités entretien *
                </label>
                <textarea
                  required
                  value={formData.interviewAvailability}
                  onChange={(e) => setFormData({ ...formData, interviewAvailability: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Disponible cette semaine en soirée, ou week-end..."
                />
              </div>

              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                Envoyer ma candidature 🚀
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 font-sans">La Salade de Fruits</h3>
              <p className="text-primary-200">
                Équipe E-Sport Honor of Kings dédiée à l'excellence et au développement des talents.
                Cultivons la victoire ensemble ! 🥗🏆
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Navigation</h3>
              <ul className="space-y-2 text-primary-200">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#esport" className="hover:text-white transition-colors">
                    eSport
                  </a>
                </li>
                <li>
                  <a href="#vision" className="hover:text-white transition-colors">
                    Vision
                  </a>
                </li>
                <li>
                  <a href="#team" className="hover:text-white transition-colors">
                    Équipe
                  </a>
                </li>
                <li>
                  <a href="#recruit" className="hover:text-white transition-colors">
                    Nous rejoindre
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-white transition-colors font-semibold text-accent-400">
                    🎮 Accès Plateforme
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <div className="space-y-3 text-primary-200">
                <div>
                  <p className="font-semibold text-white mb-1">Manager</p>
                  <p className="text-sm">Gautier - Le Blond</p>
                  <p className="text-sm">Discord: <span className="text-accent-500">@the_ermite_bagh</span></p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Coach</p>
                  <p className="text-sm">Jay - The Ermite</p>
                  <p className="text-sm">Discord: <span className="text-accent-500">@theermite</span></p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-300">
            <p>© 2025 La Salade de Fruits E-Sport. Tous droits réservés. 🥗</p>
            <p className="text-sm mt-2">Cultivons l'excellence, récoltons les victoires 🏆</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Vision Modals */}
      {visionData.map((vision, index) => (
        <VisionModal
          key={index}
          isOpen={activeVisionModal === index}
          onClose={() => setActiveVisionModal(null)}
          title={vision.title}
          icon={vision.icon}
          description={vision.description}
          methods={vision.methods}
          details={vision.details}
        />
      ))}

      {/* Staff Modals */}
      {staffData.map((member, index) => (
        <StaffModal
          key={index}
          isOpen={activeStaffModal === index}
          onClose={() => setActiveStaffModal(null)}
          {...member}
        />
      ))}
    </div>
  )
}
