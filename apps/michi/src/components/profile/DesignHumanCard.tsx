/**
 * DesignHumanCard Component
 * Displays detailed Human Design analysis (Type, Authority, Profile, Centers, Gates, Channels)
 * Shinkofa Platform - Version Française Complète
 */

import React from 'react'
import { ProfileSection } from './ProfileSection'

interface DesignHumanGate {
  number: number
  line: number
  color?: number
  tone?: number
  planet: string
  side: 'personality' | 'design'
}

interface DesignHumanChannel {
  gates: number[]
  name: string
}

interface DesignHumanPlanet {
  name: string
  position_degrees: number
}

interface DesignHuman {
  type: string
  authority: string
  profile: string
  definition?: string
  strategy: string
  signature: string
  not_self: string
  variable?: string
  defined_centers: string[]
  open_centers: string[]
  incarnation_cross?: string
  channels?: DesignHumanChannel[]
  gates?: DesignHumanGate[]
  personality_planets?: DesignHumanPlanet[]
  design_planets?: DesignHumanPlanet[]
}

// Planet name translations (English -> French)
const PLANET_NAMES_FR: Record<string, { name: string; icon: string }> = {
  sun: { name: 'Soleil', icon: '\u2609' },
  earth: { name: 'Terre', icon: '\u2641' },
  moon: { name: 'Lune', icon: '\u263D' },
  mercury: { name: 'Mercure', icon: '\u263F' },
  venus: { name: 'V\u00e9nus', icon: '\u2640' },
  mars: { name: 'Mars', icon: '\u2642' },
  jupiter: { name: 'Jupiter', icon: '\u2643' },
  saturn: { name: 'Saturne', icon: '\u2644' },
  uranus: { name: 'Uranus', icon: '\u2645' },
  neptune: { name: 'Neptune', icon: '\u2646' },
  pluto: { name: 'Pluton', icon: '\u2647' },
  north_node: { name: 'Noeud Nord', icon: '\u260A' },
  south_node: { name: 'Noeud Sud', icon: '\u260B' },
}

// HD Color names (1-6)
const COLOR_NAMES: Record<number, string> = {
  1: 'App\u00e9tit',
  2: 'Go\u00fbt',
  3: 'Soif',
  4: 'Toucher',
  5: 'Son',
  6: 'Lumi\u00e8re',
}

// HD Tone names (1-6)
const TONE_NAMES: Record<number, string> = {
  1: 'Odorat',
  2: 'Go\u00fbt',
  3: 'Vision Ext\u00e9rieure',
  4: 'Vision Int\u00e9rieure',
  5: 'Ressenti',
  6: 'Toucher',
}

// 64 Gates: keywords and short descriptions in French
const GATES_DATA: Record<number, { keyword_fr: string; description_fr: string }> = {
  1: { keyword_fr: "L'Expression de Soi", description_fr: "Cr\u00e9ativit\u00e9 individuelle et expression unique de l'identit\u00e9." },
  2: { keyword_fr: "La Direction", description_fr: "R\u00e9ceptivit\u00e9 et orientation par la connaissance int\u00e9rieure." },
  3: { keyword_fr: "L'Ordre", description_fr: "Difficult\u00e9 initiale et potentiel de mise en ordre apr\u00e8s le chaos." },
  4: { keyword_fr: "La Formulation", description_fr: "R\u00e9ponses mentales et formulation logique des solutions." },
  5: { keyword_fr: "Les Habitudes", description_fr: "Rythmes fixes et patience d'attendre le bon moment." },
  6: { keyword_fr: "La Friction", description_fr: "Intimit\u00e9 \u00e9motionnelle et r\u00e9solution des conflits." },
  7: { keyword_fr: "Le R\u00f4le du Soi", description_fr: "Leadership d\u00e9mocratique et direction par l'exemple." },
  8: { keyword_fr: "La Contribution", description_fr: "Contribution cr\u00e9ative individuelle au collectif." },
  9: { keyword_fr: "La Concentration", description_fr: "Pouvoir de concentration et attention aux d\u00e9tails." },
  10: { keyword_fr: "Le Comportement", description_fr: "Amour de soi et comportement authentique." },
  11: { keyword_fr: "Les Id\u00e9es", description_fr: "Id\u00e9es, paix et harmonie stimul\u00e9es par l'interaction." },
  12: { keyword_fr: "La Prudence", description_fr: "Expression prudente et articulation au bon moment." },
  13: { keyword_fr: "L'\u00c9coute", description_fr: "\u00c9coute profonde et t\u00e9moignage des exp\u00e9riences." },
  14: { keyword_fr: "La Prosp\u00e9rit\u00e9", description_fr: "Comp\u00e9tences de puissance et abondance mat\u00e9rielle." },
  15: { keyword_fr: "Les Extr\u00eames", description_fr: "Magn\u00e9tisme humain et amour de l'humanit\u00e9 dans sa diversit\u00e9." },
  16: { keyword_fr: "L'Enthousiasme", description_fr: "S\u00e9lectivit\u00e9 dans l'expression des talents et comp\u00e9tences." },
  17: { keyword_fr: "Les Opinions", description_fr: "Opinions organis\u00e9es et pens\u00e9e logique structur\u00e9e." },
  18: { keyword_fr: "La Correction", description_fr: "Jugement intuitif et d\u00e9sir de corriger les imperfections." },
  19: { keyword_fr: "Le Besoin", description_fr: "Sensibilit\u00e9 aux besoins des autres et approche respectueuse." },
  20: { keyword_fr: "Le Maintenant", description_fr: "Contemplation et pr\u00e9sence dans l'instant." },
  21: { keyword_fr: "Le Contr\u00f4le", description_fr: "Contr\u00f4le mat\u00e9riel et gestion des ressources." },
  22: { keyword_fr: "La Gr\u00e2ce", description_fr: "Ouverture \u00e9motionnelle et gr\u00e2ce sous pression." },
  23: { keyword_fr: "L'Assimilation", description_fr: "Communication d'insights uniques et individuels." },
  24: { keyword_fr: "La Rationalisation", description_fr: "Retour mental et rationalisation des exp\u00e9riences." },
  25: { keyword_fr: "L'Innocence", description_fr: "Amour universel et innocence spirituelle." },
  26: { keyword_fr: "La Persuasion", description_fr: "Persuasion et capacit\u00e9 de transmission convaincante." },
  27: { keyword_fr: "La Bienveillance", description_fr: "Soin nourricier et prise en charge des autres." },
  28: { keyword_fr: "Le Joueur", description_fr: "Lutte pour trouver un sens et un but \u00e0 la vie." },
  29: { keyword_fr: "L'Engagement", description_fr: "Pers\u00e9v\u00e9rance et engagement total dans l'exp\u00e9rience." },
  30: { keyword_fr: "Les D\u00e9sirs", description_fr: "D\u00e9sir ardent et intensit\u00e9 \u00e9motionnelle des sentiments." },
  31: { keyword_fr: "L'Influence", description_fr: "Leadership par l'influence d\u00e9mocratique naturelle." },
  32: { keyword_fr: "La Continuit\u00e9", description_fr: "Instinct de transformation durable et continuit\u00e9." },
  33: { keyword_fr: "La Retraite", description_fr: "Retrait strat\u00e9gique et m\u00e9moire des exp\u00e9riences." },
  34: { keyword_fr: "La Puissance", description_fr: "Puissance brute et \u00e9nergie sacrale disponible." },
  35: { keyword_fr: "Le Progr\u00e8s", description_fr: "D\u00e9sir d'exp\u00e9riences nouvelles et de progr\u00e8s." },
  36: { keyword_fr: "La Crise", description_fr: "Exploration \u00e9motionnelle et gestion de la crise." },
  37: { keyword_fr: "L'Amiti\u00e9", description_fr: "Communaut\u00e9 et accords \u00e9motionnels au sein du groupe." },
  38: { keyword_fr: "L'Opposition", description_fr: "Combat pour un but individuel et opposition cr\u00e9ative." },
  39: { keyword_fr: "La Provocation", description_fr: "Provocation spirituelle pour \u00e9veiller l'\u00e9motion." },
  40: { keyword_fr: "La D\u00e9livrance", description_fr: "Solitude n\u00e9cessaire et volont\u00e9 de contribuer au groupe." },
  41: { keyword_fr: "La Contraction", description_fr: "Imagination et d\u00e9sir d'exp\u00e9riences \u00e9motionnelles nouvelles." },
  42: { keyword_fr: "La Croissance", description_fr: "Compl\u00e9tion des cycles et croissance par l'ach\u00e8vement." },
  43: { keyword_fr: "La Perc\u00e9e", description_fr: "Insight unique et perc\u00e9e mentale individuelle." },
  44: { keyword_fr: "La Vigilance", description_fr: "M\u00e9moire instinctive des patterns et vigilance." },
  45: { keyword_fr: "Le Rassemblement", description_fr: "Rassemblement mat\u00e9riel et leadership communautaire." },
  46: { keyword_fr: "L'Amour du Corps", description_fr: "D\u00e9termination du soi et d\u00e9couverte par l'exp\u00e9rience." },
  47: { keyword_fr: "La R\u00e9alisation", description_fr: "Compr\u00e9hension abstraite et transformation mentale." },
  48: { keyword_fr: "La Profondeur", description_fr: "Profondeur de talent et ma\u00eetrise par la pratique." },
  49: { keyword_fr: "La R\u00e9volution", description_fr: "Principes et potentiel r\u00e9volutionnaire du rejet." },
  50: { keyword_fr: "Les Valeurs", description_fr: "Responsabilit\u00e9 et \u00e9tablissement des lois et valeurs." },
  51: { keyword_fr: "Le Choc", description_fr: "Initiative et comp\u00e9tition guid\u00e9e par le c\u0153ur." },
  52: { keyword_fr: "L'Immobilit\u00e9", description_fr: "Concentration et calme int\u00e9rieur face \u00e0 la pression." },
  53: { keyword_fr: "Le Commencement", description_fr: "D\u00e9but des cycles et pression de d\u00e9marrer." },
  54: { keyword_fr: "L'Ambition", description_fr: "Ambition et d\u00e9sir d'\u00e9l\u00e9vation mat\u00e9rielle et spirituelle." },
  55: { keyword_fr: "L'Abondance", description_fr: "Abondance \u00e9motionnelle et esprit cr\u00e9atif." },
  56: { keyword_fr: "Le Conteur", description_fr: "Stimulation par le r\u00e9cit et le partage d'histoires." },
  57: { keyword_fr: "L'Intuition", description_fr: "Intuition douce et clart\u00e9 p\u00e9n\u00e9trante dans l'instant." },
  58: { keyword_fr: "La Joie", description_fr: "Joie de vivre et vitalit\u00e9 qui am\u00e9liore la vie." },
  59: { keyword_fr: "L'Intimit\u00e9", description_fr: "Intimit\u00e9 g\u00e9n\u00e9tique et strat\u00e9gie de fertilit\u00e9." },
  60: { keyword_fr: "La Limitation", description_fr: "Acceptation des limites et potentiel de mutation." },
  61: { keyword_fr: "Le Myst\u00e8re", description_fr: "Inspiration int\u00e9rieure et pression de conna\u00eetre la v\u00e9rit\u00e9." },
  62: { keyword_fr: "Les D\u00e9tails", description_fr: "Pr\u00e9cision dans l'expression des faits et d\u00e9tails." },
  63: { keyword_fr: "Le Doute", description_fr: "Doute logique et questionnement avant compr\u00e9hension." },
  64: { keyword_fr: "La Confusion", description_fr: "Pression mentale de donner sens au pass\u00e9." },
}

// 36 Channels: descriptions and connected centers
// Sources: emmanuellesimonet.com, designhumainpourtous.com, timetowakeup.net, virginiepetitjean.fr
const CHANNELS_DATA: Record<string, { name_fr: string; description_fr: string; centers: [string, string] }> = {
  "1-8": { name_fr: "L'Inspiration", description_fr: "Donner l'exemple et inspirer les autres en montrant qui on est, dans son expressivit\u00e9 et sa cr\u00e9ativit\u00e9 authentiques.", centers: ["g_center", "throat"] },
  "2-14": { name_fr: "L'Alchimiste", description_fr: "Capacit\u00e9 \u00e0 g\u00e9n\u00e9rer et g\u00e9rer les ressources en r\u00e9ponse. Acc\u00e8s \u00e0 l'\u00e9nergie n\u00e9cessaire pour l'\u00e9volution mat\u00e9rielle et le changement de direction.", centers: ["g_center", "sacral"] },
  "3-60": { name_fr: "La Mutation", description_fr: "Transformer l'ancien en nouveau, innover et vivre de grands changements. Pulsation impr\u00e9visible qui pousse du chaos vers l'ordre.", centers: ["sacral", "root"] },
  "4-63": { name_fr: "L'Esprit Logique", description_fr: "L'esprit logique qui remet tout en question, avec une qu\u00eate constante de r\u00e9ponses et la capacit\u00e9 de se questionner pour le collectif.", centers: ["ajna", "head"] },
  "5-15": { name_fr: "Le Rythme", description_fr: "Capacit\u00e9 \u00e0 vivre au rythme de la vie, dans le flux naturel des choses et en synchronicit\u00e9 avec son propre tempo.", centers: ["g_center", "sacral"] },
  "6-59": { name_fr: "L'Union", description_fr: "\u00c9nergie vitale de procr\u00e9ation et de cr\u00e9ation, avec une facilit\u00e9 naturelle \u00e0 cr\u00e9er de fortes connexions intimes.", centers: ["solar_plexus", "sacral"] },
  "7-31": { name_fr: "La Dominance", description_fr: "Le canal du leadership par excellence. Mener et guider la soci\u00e9t\u00e9 par l'influence d\u00e9mocratique vers un futur meilleur.", centers: ["g_center", "throat"] },
  "9-52": { name_fr: "La Concentration", description_fr: "Capacit\u00e9 \u00e0 rester focalis\u00e9, \u00e0 se concentrer intens\u00e9ment sur les d\u00e9tails et \u00e0 se tenir \u00e9loign\u00e9 des distractions.", centers: ["sacral", "root"] },
  "10-20": { name_fr: "L'\u00c9veil", description_fr: "S'accueillir, s'aimer et vivre avec authenticit\u00e9 chaque instant. Exprimer qui vous \u00eates avec int\u00e9grit\u00e9, sans filtre.", centers: ["g_center", "throat"] },
  "10-34": { name_fr: "L'Exploration", description_fr: "\u00c9nergie et besoin de constamment explorer et exp\u00e9rimenter soi-m\u00eame et la vie, favorisant la r\u00e9alisation de soi par l'action.", centers: ["g_center", "sacral"] },
  "10-57": { name_fr: "La Forme Parfaite", description_fr: "Talent intuitif pour am\u00e9liorer et perfectionner sa propre vie et celle des autres, bas\u00e9 sur une connaissance int\u00e9rieure profonde.", centers: ["g_center", "spleen"] },
  "11-56": { name_fr: "La Curiosit\u00e9", description_fr: "Stimuler les id\u00e9es et partager des histoires. Z\u00e8le pour acqu\u00e9rir un maximum de connaissances et de nouvelles exp\u00e9riences.", centers: ["ajna", "throat"] },
  "12-22": { name_fr: "L'Ouverture", description_fr: "Mettre en action ses humeurs de fa\u00e7on cr\u00e9ative. L'ouverture d\u00e9pend de l'humeur et peut \u00e9mouvoir les autres par ses vagues \u00e9motionnelles.", centers: ["throat", "solar_plexus"] },
  "13-33": { name_fr: "Le Prodigue", description_fr: "\u00c9couter et retenir les r\u00e9cits, rassembler les informations et partager les le\u00e7ons au moment propice.", centers: ["g_center", "throat"] },
  "16-48": { name_fr: "Le Talent", description_fr: "Exprimer ses talents de mani\u00e8re unique avec enthousiasme, se perfectionner \u00e0 travers la r\u00e9p\u00e9tition et la pratique.", centers: ["throat", "spleen"] },
  "17-62": { name_fr: "L'Acceptation", description_fr: "Organiser l'information \u00e0 partir de d\u00e9tails et exprimer des opinions logiques structur\u00e9es. Canal de la preuve et de la pr\u00e9diction.", centers: ["ajna", "throat"] },
  "18-58": { name_fr: "Le Jugement", description_fr: "Perfectionnisme en recherche d'am\u00e9lioration constante. Envie insatiable de d\u00e9fier, corriger et parfaire tout sch\u00e9ma.", centers: ["spleen", "root"] },
  "19-49": { name_fr: "La Sensibilit\u00e9", description_fr: "Transformer la pression des besoins en sensibilit\u00e9 aux principes. Harmoniser les besoins humains avec les valeurs de la communaut\u00e9.", centers: ["root", "solar_plexus"] },
  "20-34": { name_fr: "Le Charisme", description_fr: "Forte \u00e9nergie de manifestation guid\u00e9e par la r\u00e9ponse sacrale. Potentiel d'action puissant vers une activit\u00e9 satisfaisante.", centers: ["throat", "sacral"] },
  "20-57": { name_fr: "L'Onde C\u00e9r\u00e9brale", description_fr: "Grande intuition dans le moment pr\u00e9sent, savoir les choses instinctivement sans passer par le mental.", centers: ["throat", "spleen"] },
  "21-45": { name_fr: "L'Argent", description_fr: "La volont\u00e9 de gagner de l'argent et d'apporter les ressources mat\u00e9rielles \u00e0 sa communaut\u00e9 avec autorit\u00e9 et ind\u00e9pendance.", centers: ["heart_will", "throat"] },
  "23-43": { name_fr: "La Structuration", description_fr: "Assimiler et expliquer clairement les id\u00e9es venues de l'intuition. Apporter un point de vue visionnaire, en avance sur les autres.", centers: ["ajna", "throat"] },
  "24-61": { name_fr: "Le Penseur", description_fr: "Mental toujours occup\u00e9 dans de profondes r\u00e9flexions sur les myst\u00e8res de la vie, con\u00e7u pour inspirer par sa sagesse unique.", centers: ["ajna", "head"] },
  "25-51": { name_fr: "L'Initiation", description_fr: "Invitation \u00e0 voir la beaut\u00e9 dans tout ce qui existe. La comp\u00e9titivit\u00e9 transcende les limites cr\u00e9atives et initie les autres.", centers: ["g_center", "heart_will"] },
  "26-44": { name_fr: "L'Esprit d'Initiative", description_fr: "Transformer l'instinct de survie en pouvoir de persuasion. Don de persuader et savoir ce dont les autres ont besoin.", centers: ["heart_will", "spleen"] },
  "27-50": { name_fr: "La Pr\u00e9servation", description_fr: "Instinct de protection et de soin, \u00e9nergie pour nourrir et pr\u00e9server ce qui a de la valeur dans la communaut\u00e9.", centers: ["sacral", "spleen"] },
  "28-38": { name_fr: "La Lutte", description_fr: "\u00c2me guerri\u00e8re et courageuse, lutter pour trouver un sens \u00e0 sa vie. D\u00e9termination \u00e0 franchir les obstacles.", centers: ["spleen", "root"] },
  "29-46": { name_fr: "La D\u00e9couverte", description_fr: "S'engager pleinement dans les exp\u00e9riences qui r\u00e9v\u00e8lent l'amour de soi et la direction de vie.", centers: ["sacral", "g_center"] },
  "30-41": { name_fr: "La Reconnaissance", description_fr: "Pression d'avancer vers de nouvelles exp\u00e9riences, en lien avec l'imagination et les d\u00e9sirs. \u00c9nergie cr\u00e9ative et visionnaire.", centers: ["solar_plexus", "root"] },
  "32-54": { name_fr: "La Transformation", description_fr: "L'ambition soutenue par l'effort constant. D\u00e9sir d'\u00eatre reconnu et d'am\u00e9liorer sa vie \u00e0 travers la pers\u00e9v\u00e9rance.", centers: ["spleen", "root"] },
  "34-57": { name_fr: "Le Pouvoir", description_fr: "Combine force instinctive et intuition, cr\u00e9ant une puissance d'action guid\u00e9e par la sagesse du corps dans l'instant.", centers: ["sacral", "spleen"] },
  "35-36": { name_fr: "La Versatilit\u00e9", description_fr: "D\u00e9sir de vivre des exp\u00e9riences \u00e9motionnelles fortes et besoin de stimulation. Pression vers de nouvelles transformations.", centers: ["throat", "solar_plexus"] },
  "37-40": { name_fr: "La Communaut\u00e9", description_fr: "Importance de la famille et des relations bas\u00e9es sur la confiance. \u00c9quilibre entre engagement \u00e9motionnel et besoin de solitude.", centers: ["solar_plexus", "heart_will"] },
  "39-55": { name_fr: "L'\u00c9motivit\u00e9", description_fr: "Pics \u00e9motionnels tr\u00e8s intenses, oscillant entre grande joie et forte m\u00e9lancolie. Capacit\u00e9 \u00e0 faire ressortir la nature profonde des \u00e9motions.", centers: ["root", "solar_plexus"] },
  "42-53": { name_fr: "La Maturation", description_fr: "Encha\u00eenement de nouveaux cycles, vivre des exp\u00e9riences et les mener jusqu'au bout pour en acqu\u00e9rir la sagesse.", centers: ["sacral", "root"] },
  "47-64": { name_fr: "L'Abstraction", description_fr: "Pression constante \u00e0 donner du sens aux exp\u00e9riences pass\u00e9es. Mental tr\u00e8s actif cherchant \u00e0 r\u00e9soudre les images du pass\u00e9.", centers: ["ajna", "head"] },
}

interface DesignHumanCardProps {
  data: DesignHuman
}

export const DesignHumanCard: React.FC<DesignHumanCardProps> = ({ data }) => {
  // Traduction Type anglais → français (case-insensitive)
  const translateType = (type: string): string => {
    const translations: {[key: string]: string} = {
      'manifestor': 'Manifesteur',
      'generator': 'Générateur',
      'manifesting generator': 'Générateur Manifesteur',
      'manifesting_generator': 'Générateur Manifesteur',
      'projector': 'Projecteur',
      'reflector': 'Réflecteur',
    }
    return translations[type.toLowerCase().trim()] || type
  }

  // Traduction Autorité anglais → français (case-insensitive)
  const translateAuthority = (authority: string): string => {
    const translations: {[key: string]: string} = {
      'emotional': 'Émotionnelle',
      'sacral': 'Sacrale',
      'splenic': 'Splénique',
      'ego': 'Ego',
      'self-projected': 'Auto-Projetée',
      'self_projected': 'Auto-Projetée',
      'environment': 'Environnement',
      'lunar': 'Lunaire',
      'mental': 'Mentale',
      'none': 'Aucune',
    }
    return translations[authority.toLowerCase().trim()] || authority
  }

  // Traduction Centre anglais → français (case-insensitive)
  const translateCenter = (center: string): string => {
    const translations: {[key: string]: string} = {
      'head': 'Tête',
      'ajna': 'Ajna',
      'throat': 'Gorge',
      'g': 'G (Identité)',
      'g_center': 'G (Identité)',
      'heart': 'Cœur',
      'heart_will': 'Cœur (Volonté)',
      'sacral': 'Sacral',
      'solar plexus': 'Plexus Solaire',
      'solar_plexus': 'Plexus Solaire',
      'spleen': 'Rate',
      'root': 'Racine',
    }
    return translations[center.toLowerCase().trim()] || center
  }

  const getTypeDescription = (type: string): string => {
    const typeKey = type.toLowerCase().replace('_', ' ').trim()
    const descriptions: { [key: string]: string } = {
      'manifestor': 'Type énergétique rare (~9%) qui initie l\'action de manière indépendante. Les Manifesteurs sont des pionniers naturels qui ont le pouvoir de commencer de nouvelles choses et d\'impacter les autres. Ils génèrent du mouvement et ouvrent de nouvelles voies.',
      'generator': 'Type énergétique le plus commun (~70%) qui répond à la vie. Les Générateurs ont une énergie vitale soutenue pour travailler sur ce qui les allume vraiment. Leur moteur sacral leur donne l\'endurance nécessaire pour construire et créer.',
      'manifesting generator': 'Hybride rare entre Manifesteur et Générateur (~33%). Multitâches rapides et efficaces qui répondent ET initient simultanément. Ils ont besoin de variété, de vitesse et peuvent sauter des étapes en chemin vers leurs objectifs.',
      'projector': 'Type non-énergétique (~20%) qui guide et dirige les énergies des autres. Les Projecteurs excellent dans la gestion des systèmes et la vision stratégique. Ils voient profondément dans les autres et apportent efficacité et sagesse.',
      'reflector': 'Type le plus rare (~1%) qui reflète l\'état de santé de leur environnement et des personnes autour d\'eux. Les Réflecteurs sont des baromètres ultra-sensibles de la santé collective et nécessitent un environnement sain.',
    }
    return descriptions[typeKey] || 'Type unique avec ses propres caractéristiques.'
  }

  const getDetailedTypeInfo = (type: string): { description: string, strategy: string, signature: string, notSignature: string, advice: string } => {
    const typeKey = type.toLowerCase().replace('_', ' ').trim()
    const infos: { [key: string]: { description: string, strategy: string, signature: string, notSignature: string, advice: string } } = {
      'manifestor': {
        description: 'Les Manifesteurs représentent environ 9% de la population mondiale. Ils sont les seuls capables d\'initier l\'action de manière autonome sans attendre d\'invitations ou de réponses externes. Leur aura est fermée et repoussante, ce qui leur permet de créer un espace pour agir librement. Les Manifesteurs sont ici pour impacter, initier et mettre les choses en mouvement. Ils possèdent une énergie d\'impact puissante qui peut surprendre ou déranger les autres s\'ils ne sont pas informés à l\'avance.',
        strategy: 'Informer avant d\'agir. C\'est la clé pour éviter la résistance des autres et fluidifier votre impact. En informant les personnes affectées par vos actions, vous minimisez les obstacles et créez la coopération. Ne demandez pas la permission, ne cherchez pas l\'accord - informez simplement. Cela libère votre pouvoir tout en maintenant l\'harmonie relationnelle.',
        signature: 'Paix. Quand vous vivez selon votre design, vous ressentez une profonde paix intérieure. Cette paix vient de la liberté d\'initier sans résistance, de l\'espace pour être vous-même sans contraintes, et du respect que vous recevez quand vous informez les autres. La paix est le signe que vous êtes aligné avec votre nature de Manifesteur.',
        notSignature: 'Colère. La colère surgit quand vous rencontrez trop de résistance, quand votre liberté est entravée, ou quand vous êtes constamment contrôlé. C\'est le signal que vous n\'informez pas assez, ou que vous êtes dans un environnement qui ne respecte pas votre besoin d\'autonomie. La colère chronique indique que vous ne vivez pas selon votre stratégie.',
        advice: 'Embrassez votre pouvoir d\'initier, mais n\'oubliez jamais d\'informer ceux qui seront affectés par vos actions. Créez-vous des espaces de solitude pour vous ressourcer - votre aura fermée a besoin de temps seul. Ne laissez pas les autres vous contrôler ou vous micromanager. Trouvez des environnements et des relations qui honorent votre besoin de liberté et d\'autonomie.'
      },
      'generator': {
        description: 'Les Générateurs représentent environ 37% de la population mondiale (70% si on inclut les Générateurs Manifesteurs). Ils sont les bâtisseurs et créateurs de ce monde, possédant une énergie vitale sacrale inépuisable quand ils travaillent sur ce qui les allume vraiment. Leur aura est ouverte et enveloppante, attirant naturellement les opportunités vers eux. Les Générateurs sont ici pour maîtriser ce qu\'ils aiment, construire avec leur énergie, et trouver une satisfaction profonde dans leur travail.',
        strategy: 'Répondre à la vie. Attendez que quelque chose se présente à vous (opportunité, question, situation) et écoutez votre réponse sacrale. Ne cherchez pas à initier - laissez la vie venir à vous et répondez avec vos sons viscéraux. Cette stratégie protège votre énergie et vous garantit d\'investir votre force vitale dans ce qui est correct pour vous.',
        signature: 'Satisfaction. Quand vous répondez correctement à la vie et travaillez sur ce qui vous allume, vous ressentez une satisfaction profonde et durable. Cette satisfaction vient de l\'utilisation correcte de votre énergie sacrale, du sentiment d\'accomplissement, et de la maîtrise progressive de ce que vous aimez. La satisfaction est le signe que vous êtes sur le bon chemin.',
        notSignature: 'Frustration. La frustration apparaît quand vous initiez au lieu de répondre, ou quand vous travaillez sur des choses qui ne vous allument pas vraiment. C\'est le signal que vous gaspillez votre précieuse énergie sur ce qui n\'est pas correct pour vous. La frustration chronique indique que vous ne respectez pas votre stratégie de réponse.',
        advice: 'Soyez patient et attendez que la vie vous présente des opportunités. Écoutez vos réponses sacrales (sons gut "uh-huh" pour oui, "uh-uh" pour non). Travaillez sur ce qui vous allume vraiment et arrêtez ce qui vous frustre. Votre énergie est énorme mais pas illimitée - utilisez-la sagement. Épuisez-vous physiquement chaque jour pour bien dormir, mais assurez-vous que cet épuisement vienne de ce qui vous satisfait.'
      },
      'manifesting generator': {
        description: 'Les Générateurs Manifesteurs représentent environ 33% de la population mondiale. Ils sont un hybride unique entre Manifesteur et Générateur, possédant à la fois l\'énergie sacrale du Générateur ET la capacité d\'impacter comme un Manifesteur. Ils sont les multitâches ultimes, capables de jongler entre plusieurs projets simultanément. Les MG sont rapides, efficaces, et peuvent sauter des étapes en chemin vers leurs objectifs. Leur aura est ouverte comme les Générateurs, mais avec une qualité repoussante supplémentaire.',
        strategy: 'Répondre, puis informer. Comme les Générateurs, ils doivent d\'abord répondre à ce qui se présente. Une fois qu\'ils ont leur réponse sacrale, ils doivent informer (comme les Manifesteurs) avant d\'agir. Cette double stratégie leur permet d\'utiliser leur énergie correctement tout en minimisant la résistance des autres à leur vitesse et leur impact.',
        signature: 'Satisfaction ET Paix. Les MG ont une double signature : la satisfaction qui vient de répondre correctement et d\'utiliser leur énergie sacrale, ET la paix qui vient d\'informer avant d\'agir rapidement. Quand ils ressentent les deux, ils savent qu\'ils vivent selon leur design unique.',
        notSignature: 'Frustration ET Colère. Les MG peuvent expérimenter à la fois la frustration (quand ils n\'attendent pas de répondre ou travaillent sur ce qui ne les allume pas) ET la colère (quand leur vitesse et leur nature multitâche rencontrent trop de résistance ou de contrôle). Cette double signature négative indique qu\'ils ne respectent pas leur stratégie.',
        advice: 'Acceptez votre nature multitâche et votre vitesse - c\'est votre superpouvoir. Attendez de répondre sacralement, puis informez avant de foncer. Ne vous comparez pas aux Générateurs purs (vous êtes plus rapides) ni aux Manifesteurs purs (vous devez quand même répondre). Trouvez des environnements qui apprécient votre efficacité et votre capacité à gérer plusieurs projets. N\'ayez pas peur de sauter des étapes si votre sacral dit oui - vous avez une voie directe vers vos objectifs.'
      },
      'projector': {
        description: 'Les Projecteurs représentent environ 20% de la population mondiale. Ils sont les guides, les directeurs et les maîtres de systèmes de l\'humanité. Sans centre Sacral défini, ils n\'ont pas d\'énergie vitale constante et sont conçus pour travailler avec et gérer l\'énergie des autres. Leur aura est focalisée et pénétrante, leur permettant de voir profondément dans les autres et les systèmes. Les Projecteurs sont ici pour guider les énergies vers une plus grande efficacité et succès.',
        strategy: 'Attendre l\'invitation pour les grandes décisions de vie (travail, relations, déménagement, partenariats importants). Cette stratégie protège votre énergie et garantit que vous êtes reconnu et apprécié pour vos dons uniques. Les invitations correctes vous donnent accès à l\'énergie dont vous avez besoin pour accomplir votre rôle de guide.',
        signature: 'Succès. Quand vous êtes correctement invité et reconnu, vous expérimentez le succès - non pas comme une accumulation de réalisations, mais comme un sentiment d\'être vu, apprécié et efficace dans votre guidance. Le succès vient de l\'invitation correcte, de la reconnaissance de votre sagesse, et de l\'impact positif de vos conseils.',
        notSignature: 'Amertume. L\'amertume surgit quand vous n\'êtes pas invité, reconnu ou apprécié pour votre guidance. Elle apparaît quand vous essayez de forcer votre sagesse sur les autres, ou quand vous travaillez trop dur pour "prouver" votre valeur. L\'amertume chronique indique que vous ne respectez pas votre stratégie d\'attendre l\'invitation.',
        advice: 'Arrêtez d\'essayer de travailler comme un Générateur - vous n\'avez pas cette énergie. Focalisez-vous sur maîtriser vos systèmes d\'intérêt et devenir expert. Soyez visible pour attirer les bonnes invitations. Reposez-vous BEAUCOUP - sans Sacral, vous absorbez l\'énergie des autres et avez besoin de solitude pour la décharger. N\'acceptez que les invitations qui reconnaissent vraiment vos dons. Votre succès vient de la qualité de vos invitations, pas de la quantité de votre travail.'
      },
      'reflector': {
        description: 'Les Réflecteurs représentent environ 1% de la population mondiale. Ils sont les plus rares de tous les types, avec aucun centre défini. Leur design ouvert les rend ultra-sensibles à leur environnement et aux personnes autour d\'eux. Ils sont comme des miroirs cosmiques, reflétant l\'état de santé de leur communauté et de leur environnement. Leur aura est résistante et échantillonnante, goûtant constamment l\'énergie environnante. Les Réflecteurs sont ici pour évaluer la santé collective et apporter une perspective objective unique.',
        strategy: 'Attendre un cycle lunaire complet (28 jours) avant de prendre une décision majeure. Cette stratégie leur permet d\'expérimenter toutes les perspectives possibles à travers les 64 portes activées par la Lune transiteuse. En attendant, ils peuvent voir leur décision sous tous les angles et ressentir ce qui est vraiment correct pour eux.',
        signature: 'Surprise. Quand un Réflecteur est dans le bon environnement avec les bonnes personnes, la vie le surprend continuellement de manière positive. Cette surprise vient de la découverte constante de nouvelles perspectives, de synchronicités magiques, et d\'un sentiment d\'émerveillement face à la vie. La surprise positive indique qu\'ils sont dans le bon environnement.',
        notSignature: 'Déception. La déception surgit quand l\'environnement n\'est pas sain ou quand les personnes autour d\'eux ne sont pas alignées. Les Réflecteurs reflétant tout, ils ressentent profondément la dysfonction collective. La déception chronique indique qu\'ils ont besoin de changer d\'environnement ou d\'entourage pour trouver un espace plus sain.',
        advice: 'Votre environnement est TOUT pour vous. Choisissez-le avec un soin extrême - vivez là où vous vous sentez bien. Entourez-vous de personnes saines et conscientes. Ne vous pressez jamais pour décider - prenez vos 28 jours complets. Tenez un journal lunaire pour suivre vos ressentis à travers le cycle. Votre sagesse est précieuse mais rare - partagez-la avec discernement. Vous n\'êtes pas ici pour absorber les problèmes des autres, mais pour refléter objectivement la santé collective.'
      },
    }
    return infos[typeKey] || {
      description: 'Type unique avec ses propres caractéristiques.',
      strategy: 'Explorez votre stratégie personnelle selon votre type.',
      signature: 'Observez vos émotions positives récurrentes.',
      notSignature: 'Notez vos émotions négatives récurrentes.',
      advice: 'Consultez un analyste en Design Humain pour des conseils personnalisés.'
    }
  }

  const getAuthorityDescription = (authority: string): string => {
    const descriptions: { [key: string]: string } = {
      'Emotional': 'Autorité basée sur la clarté émotionnelle. Vous devez attendre de traverser votre vague émotionnelle (plusieurs heures à plusieurs jours) avant de prendre une décision importante. Il n\'y a pas de vérité dans l\'instant pour vous.',
      'Sacral': 'Autorité basée sur les réponses viscérales et corporelles immédiates. Écoutez vos "oui/non" physiques spontanés (sons gutturaux, sensations dans le ventre). La réponse correcte vient instantanément du corps.',
      'Splenic': 'Autorité basée sur l\'intuition instantanée et les instincts de survie. Faites confiance à votre première impression subtile - elle ne se répète pas. Cette autorité fonctionne dans le moment présent uniquement.',
      'Ego': 'Autorité basée sur la volonté personnelle et les désirs du cœur. Décidez en fonction de ce que VOUS voulez vraiment et de ce à quoi vous êtes prêt à vous engager. Votre pouvoir vient de suivre vos propres désirs.',
      'Self-Projected': 'Autorité basée sur ce que vous entendez sortir de votre propre bouche en parlant. Parlez à voix haute avec quelqu\'un de confiance et écoutez-vous. La vérité émerge de votre expression verbale.',
      'Environment': 'Autorité basée sur votre environnement physique. Le bon lieu, les bonnes personnes et la bonne atmosphère vous apportent la clarté. Vous devez être dans le bon espace pour décider correctement.',
      'Lunar': 'Autorité basée sur le cycle lunaire complet (28 jours). Vous devez attendre un cycle lunaire entier avant de prendre une décision majeure, en observant comment vous vous sentez à travers différents environnements et perspectives.',
    }
    return descriptions[authority] || 'Autorité unique nécessitant une exploration approfondie.'
  }

  const getCenterDescription = (center: string): string => {
    const frenchCenter = translateCenter(center)
    const descriptions: { [key: string]: string} = {
      'Tête': 'Centre de l\'inspiration, des questions et de la pression mentale. Génère les idées et questions qui poussent à comprendre.',
      'Ajna': 'Centre de la conceptualisation et du traitement mental. Transforme les questions de la Tête en concepts organisés et perspectives.',
      'Gorge': 'Centre de la manifestation, communication et action. Point de transformation où l\'énergie interne devient expression externe visible.',
      'G (Identité)': 'Centre de l\'identité, direction et amour de soi. Gouverne votre sens du "Je suis" et votre direction dans la vie.',
      'Cœur': 'Centre de la volonté, ego et force de volonté. Source de détermination, promesses et estime de soi.',
      'Sacral': 'Centre de l\'énergie vitale, force de vie et sexualité. Moteur puissant qui génère l\'énergie pour travailler et créer.',
      'Plexus Solaire': 'Centre émotionnel et de la conscience des sentiments. Crée des vagues émotionnelles qui fluctuent entre haut et bas.',
      'Rate': 'Centre de l\'intuition instantanée, survie et système immunitaire. Fonctionne dans le moment présent avec une conscience spontanée.',
      'Racine': 'Centre de la pression de stress et pression à l\'action. Génère l\'adrénaline et la pression pour agir, évoluer et commencer.',
    }
    return descriptions[frenchCenter] || frenchCenter
  }

  const getProfileDescription = (profile: string): { title: string, description: string, impact: string } => {
    const profiles: {[key: string]: { title: string, description: string, impact: string }} = {
      '1/3': {
        title: 'Investigateur / Martyr',
        description: 'Ligne 1 (Investigateur) : Besoin de bases solides et de maîtrise par l\'étude approfondie. Ligne 3 (Martyr) : Apprentissage par l\'expérience directe et l\'essai-erreur.',
        impact: 'Vous avez besoin de rechercher en profondeur avant d\'agir, puis d\'expérimenter concrètement pour découvrir ce qui fonctionne ou non. Vous êtes fait pour devenir expert par l\'étude ET l\'expérience pratique.'
      },
      '1/4': {
        title: 'Investigateur / Opportuniste',
        description: 'Ligne 1 (Investigateur) : Fondations solides par l\'étude. Ligne 4 (Opportuniste) : Influence à travers votre réseau de relations proches.',
        impact: 'Vous bâtissez votre autorité par l\'expertise approfondie, puis partagez cette connaissance à travers votre cercle de confiance. Votre réseau personnel est essentiel à votre succès.'
      },
      '2/4': {
        title: 'Ermite / Opportuniste',
        description: 'Ligne 2 (Ermite) : Talents naturels qui se révèlent dans la solitude. Ligne 4 (Opportuniste) : Besoin de connexions relationnelles stables.',
        impact: 'Vous alternez entre besoin de solitude pour développer vos dons naturels et besoin de connexion avec votre cercle proche. Les opportunités viennent par vos relations quand vous êtes "appelé".'
      },
      '2/5': {
        title: 'Ermite / Hérétique',
        description: 'Ligne 2 (Ermite) : Talents innés qui émergent naturellement. Ligne 5 (Hérétique) : Projection universelle d\'attentes et solutions pratiques.',
        impact: 'Vous avez des dons naturels que les autres voient avant vous. On vous projette des attentes de "sauveur". Votre défi est de ne répondre qu\'aux appels qui résonnent vraiment avec vos talents.'
      },
      '3/5': {
        title: 'Martyr / Hérétique',
        description: 'Ligne 3 (Martyr) : Apprentissage par essai-erreur et expérimentation. Ligne 5 (Hérétique) : Attentes projetées de solutions pratiques universelles.',
        impact: 'Vous apprenez en testant ce qui marche et ne marche pas, tout en portant la projection des autres d\'être celui qui a les solutions. Votre sagesse vient de vos "erreurs" devenues leçons.'
      },
      '3/6': {
        title: 'Martyr / Modèle de Rôle',
        description: 'Ligne 3 (Martyr) : Expérimentation jusqu\'à 30 ans environ. Ligne 6 (Modèle) : Phase de recul (30-50 ans), puis incarnation du modèle (50+).',
        impact: 'Votre vie a 3 phases : expérimentation intense (0-30), observation sur le toit (30-50), descente comme modèle de sagesse (50+). Vous êtes fait pour devenir un exemple vivant de votre expérience.'
      },
      '4/6': {
        title: 'Opportuniste / Modèle de Rôle',
        description: 'Ligne 4 (Opportuniste) : Influence par le réseau relationnel. Ligne 6 (Modèle) : Évolution vers modèle de rôle à travers 3 phases de vie.',
        impact: 'Vous influencez à travers vos relations stables tout en évoluant vers devenir un modèle pour les autres. Votre réseau devient votre plateforme d\'influence en mûrissant.'
      },
      '4/1': {
        title: 'Opportuniste / Investigateur',
        description: 'Ligne 4 (Opportuniste) : Connexions et réseau comme base. Ligne 1 (Investigateur) : Besoin de fondations solides par l\'étude.',
        impact: 'Vous créez des opportunités par votre réseau mais avez besoin de bases solides et d\'expertise pour vous sentir sûr. Votre influence croît avec votre maîtrise du sujet.'
      },
      '5/1': {
        title: 'Hérétique / Investigateur',
        description: 'Ligne 5 (Hérétique) : Projection d\'attentes de solutions universelles. Ligne 1 (Investigateur) : Besoin de fondations profondes.',
        impact: 'On vous projette des attentes de sauveur, mais vous avez besoin de bases solides pour pouvoir livrer des solutions pratiques durables. Votre recherche nourrit vos solutions.'
      },
      '5/2': {
        title: 'Hérétique / Ermite',
        description: 'Ligne 5 (Hérétique) : Attentes universelles et solutions pratiques. Ligne 2 (Ermite) : Talents naturels qui nécessitent solitude.',
        impact: 'Vous portez de grandes projections mais avez besoin de temps seul pour développer les talents naturels qui vous permettront de livrer. Équilibre entre visibilité et retrait essentiel.'
      },
      '6/2': {
        title: 'Modèle de Rôle / Ermite',
        description: 'Ligne 6 (Modèle) : Évolution en 3 phases vers modèle de sagesse. Ligne 2 (Ermite) : Talents naturels qui se développent dans la solitude.',
        impact: 'Vous devenez un modèle de rôle objectif en mûrissant, tout en ayant besoin de solitude pour développer vos dons naturels. Votre retrait nourrit votre capacité à inspirer.'
      },
      '6/3': {
        title: 'Modèle de Rôle / Martyr',
        description: 'Ligne 6 (Modèle) : 3 phases de vie (essai 0-30, retrait 30-50, modèle 50+). Ligne 3 (Martyr) : Apprentissage par expérimentation.',
        impact: 'Votre jeunesse est marquée par l\'expérimentation intense. Vous montez sur le toit pour observer, puis redescendez comme modèle vivant de la sagesse acquise par l\'expérience.'
      },
    }
    return profiles[profile] || {
      title: `Profil ${profile}`,
      description: 'Combinaison unique de lignes apportant des qualités spécifiques.',
      impact: 'Votre profil détermine comment vous interagissez avec le monde et évoluez à travers la vie.'
    }
  }

  // Definition helpers
  const translateDefinition = (def: string): string => {
    const translations: {[key: string]: string} = {
      'single': 'Simple',
      'split': 'Double (Split)',
      'triple': 'Triple',
      'quadruple': 'Quadruple',
      'none': 'Aucune',
    }
    return translations[def.toLowerCase()] || def
  }

  const getDefinitionDescription = (def: string): string => {
    const descriptions: {[key: string]: string} = {
      'single': 'Tous vos centres d\u00e9finis sont connect\u00e9s en un seul circuit continu. Votre \u00e9nergie circule de mani\u00e8re fluide et constante. Vous \u00eates autonome \u00e9nerg\u00e9tiquement et n\'avez pas besoin des autres pour vous sentir complet.',
      'split': 'Vos centres d\u00e9finis forment deux groupes s\u00e9par\u00e9s. Il existe un espace entre ces deux circuits qui cr\u00e9e une tension cr\u00e9ative. Vous pouvez inconsciemment chercher l\'autre personne ou environnement qui \"comble\" cette s\u00e9paration.',
      'triple': 'Vos centres d\u00e9finis forment trois groupes distincts. Vous avez plusieurs facettes \u00e9nerg\u00e9tiques qui fonctionnent ind\u00e9pendamment. Cela cr\u00e9e une grande polyvalence mais aussi un besoin de connexions vari\u00e9es.',
      'quadruple': 'Vos centres d\u00e9finis forment quatre groupes s\u00e9par\u00e9s. C\'est la d\u00e9finition la plus fragment\u00e9e et la plus rare. Vous \u00eates extr\u00eamement flexible et adaptable, attirant des personnes tr\u00e8s diff\u00e9rentes.',
    }
    return descriptions[def.toLowerCase()] || 'D\u00e9finition unique n\u00e9cessitant une exploration approfondie.'
  }

  const getDefinitionAdvice = (def: string): string => {
    const advice: {[key: string]: string} = {
      'single': '\ud83d\udca1 Conseil : Vous \u00eates fait pour fonctionner de mani\u00e8re ind\u00e9pendante. Faites confiance \u00e0 votre flux interne \u2014 vous n\'avez pas besoin d\'attendre que les autres vous compl\u00e8tent.',
      'split': '\ud83d\udca1 Conseil : Acceptez cette dualit\u00e9 int\u00e9rieure. Ne cherchez pas une seule personne pour combler le pont \u2014 diff\u00e9rentes personnes et exp\u00e9riences activent diff\u00e9rentes parties de vous.',
      'triple': '\ud83d\udca1 Conseil : Entourez-vous de personnes et d\'environnements vari\u00e9s. Chaque groupe de centres a ses propres besoins \u2014 honorez cette complexit\u00e9.',
      'quadruple': '\ud83d\udca1 Conseil : Vous avez besoin de beaucoup de mouvement social et de diversit\u00e9 relationnelle. Chaque connexion r\u00e9v\u00e8le une facette diff\u00e9rente de qui vous \u00eates.',
    }
    return advice[def.toLowerCase()] || ''
  }

  // Variable (4 Arrows) helpers
  const getVariableArrows = (variable: string): { icon: string, label: string, direction: string, description: string }[] => {
    // Format: "PLR DLL" -> P[motivation][perspective] D[digestion][environment]
    // Positions: P=0, motivation=1, perspective=2, space=3, D=4, digestion=5, environment=6
    if (variable.length < 7) return []

    const arrows = [
      {
        icon: '\ud83e\udde0',
        label: 'Motivation (Esprit Conscient)',
        direction: variable[1] === 'L' ? 'Left' : 'Right',
        description: variable[1] === 'L'
          ? 'Esprit strat\u00e9gique. Vous \u00eates motiv\u00e9 par une approche r\u00e9fl\u00e9chie et sp\u00e9cifique. Vous fonctionnez mieux quand vous pouvez analyser et planifier.'
          : 'Esprit r\u00e9ceptif. Vous \u00eates motiv\u00e9 par une approche ouverte et globale. Vous fonctionnez mieux quand vous laissez les id\u00e9es venir \u00e0 vous sans forcer.'
      },
      {
        icon: '\ud83d\udc41\ufe0f',
        label: 'Perspective (Vision du Monde)',
        direction: variable[2] === 'L' ? 'Left' : 'Right',
        description: variable[2] === 'L'
          ? 'Vision focalis\u00e9e. Vous percevez le monde \u00e0 travers un regard concentr\u00e9 et d\u00e9taill\u00e9. Vous excellez dans l\'observation pr\u00e9cise.'
          : 'Vision p\u00e9riph\u00e9rique. Vous percevez le monde de mani\u00e8re large et panoramique. Vous captez l\'atmosph\u00e8re et les dynamiques d\'ensemble.'
      },
      {
        icon: '\ud83c\udf3f',
        label: 'Digestion (Corps Design)',
        direction: variable[5] === 'L' ? 'Left' : 'Right',
        description: variable[5] === 'L'
          ? 'Digestion s\u00e9lective. Votre corps assimile mieux en alternant \u2014 un type d\'aliment \u00e0 la fois, un environnement calme et sp\u00e9cifique pour manger.'
          : 'Digestion ouverte. Votre corps assimile mieux avec de la vari\u00e9t\u00e9 \u2014 diff\u00e9rents aliments, diff\u00e9rents contextes, stimulation pendant les repas.'
      },
      {
        icon: '\ud83c\udfe0',
        label: 'Environnement (Espace Id\u00e9al)',
        direction: variable[6] === 'L' ? 'Left' : 'Right',
        description: variable[6] === 'L'
          ? 'Environnement s\u00e9lectif. Vous vous \u00e9panouissez dans un espace sp\u00e9cifique et choisi. Votre lieu de vie et de travail doit \u00eatre intentionnel et personnel.'
          : 'Environnement ouvert. Vous vous \u00e9panouissez dans des espaces partag\u00e9s et vivants. Vous avez besoin de mouvement, de diversit\u00e9 et de stimulation dans votre environnement.'
      },
    ]
    return arrows
  }

  // Get Color/Tone details for Variable arrows from gates data
  const getVariableColorTone = () => {
    if (!data.gates) return null
    const persSun = data.gates.find(g => g.planet === 'sun' && g.side === 'personality')
    const persNode = data.gates.find(g => g.planet === 'north_node' && g.side === 'personality')
    const desSun = data.gates.find(g => g.planet === 'sun' && g.side === 'design')
    const desNode = data.gates.find(g => g.planet === 'north_node' && g.side === 'design')
    if (!persSun || !persNode || !desSun || !desNode) return null
    return {
      motivation: { color: persSun.color, tone: persSun.tone },
      perspective: { color: persNode.color, tone: persNode.tone },
      digestion: { color: desSun.color, tone: desSun.tone },
      environment: { color: desNode.color, tone: desNode.tone },
    }
  }

  // Get planet gate info for the planets table
  const getPlanetGates = (side: 'personality' | 'design') => {
    if (!data.gates) return []
    const planetOrder = ['sun', 'earth', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'north_node', 'south_node']
    return planetOrder
      .map(planet => {
        const gate = data.gates!.find(g => g.planet === planet && g.side === side)
        if (!gate) return null
        const planetInfo = PLANET_NAMES_FR[planet]
        const gateData = GATES_DATA[gate.number]
        return {
          planet: planetInfo?.name || planet,
          icon: planetInfo?.icon || '',
          gate: gate.number,
          line: gate.line,
          color: gate.color,
          tone: gate.tone,
          keyword: gateData?.keyword_fr || '',
        }
      })
      .filter(Boolean) as { planet: string; icon: string; gate: number; line: number; color?: number; tone?: number; keyword: string }[]
  }

  const translatedType = translateType(data.type)
  const translatedAuthority = translateAuthority(data.authority)
  const profileInfo = getProfileDescription(data.profile)

  return (
    <ProfileSection
      title="Design Humain"
      icon="⚡"
      gradient="from-purple-500 to-pink-600"
    >
      {/* Type & Core Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🔮</span>
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Type : {translatedType}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Profil {data.profile} - {profileInfo.title}
            </p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-base">
          {getTypeDescription(data.type)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBox
            icon="🎯"
            label="Stratégie"
            value={data.strategy}
            color="blue"
            description="Comment interagir correctement avec la vie"
          />
          <InfoBox
            icon="✨"
            label="Signature"
            value={data.signature}
            color="green"
            description="État émotionnel quand vous vivez aligné"
          />
          <InfoBox
            icon="⚠️"
            label="Non-Soi"
            value={data.not_self}
            color="red"
            description="Signal que vous n'êtes pas aligné"
          />
          <InfoBox
            icon="🔑"
            label="Autorité"
            value={translatedAuthority}
            color="purple"
            description="Comment prendre des décisions justes"
          />
        </div>
      </div>

      {/* Type Details - Section Détaillée */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">📖</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comprendre votre Type : {translatedType}
          </h3>
        </div>
        <div className="space-y-5">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5">
            <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3 text-lg flex items-center gap-2">
              <span>🌟</span> Qu'est-ce que le Type {translatedType} ?
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {getDetailedTypeInfo(data.type).description}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-3 text-lg flex items-center gap-2">
              <span>🎯</span> Votre Stratégie
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {getDetailedTypeInfo(data.type).strategy}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-5">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-3 text-lg flex items-center gap-2">
                <span>✨</span> Signature (Alignement)
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {getDetailedTypeInfo(data.type).signature}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg p-5">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-3 text-lg flex items-center gap-2">
                <span>⚠️</span> Non-Soi (Désalignement)
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {getDetailedTypeInfo(data.type).notSignature}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-5">
            <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-3 text-lg flex items-center gap-2">
              <span>💡</span> Conseils Pratiques
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {getDetailedTypeInfo(data.type).advice}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details - Section Détaillée */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">👤</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Votre Profil : {data.profile} - {profileInfo.title}
          </h3>
        </div>
        <div className="space-y-5">
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-lg flex items-center gap-2">
              <span>📚</span> Composition de votre Profil
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {profileInfo.description}
            </p>
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                💡 Le profil est composé de deux lignes qui définissent votre rôle dans la vie. La première ligne représente votre approche consciente (ce que vous savez de vous), la seconde votre approche inconsciente (ce que les autres voient en vous).
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-5">
            <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3 text-lg flex items-center gap-2">
              <span>💫</span> Impact sur votre Vie
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {profileInfo.impact}
            </p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-3 text-lg flex items-center gap-2">
              <span>🎭</span> Dynamique de vos Deux Lignes
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Votre profil {data.profile} crée une dynamique unique entre votre approche consciente (première ligne) et inconsciente (seconde ligne).
              Ces deux facettes travaillent ensemble pour vous permettre de vivre votre rôle de manière authentique.
              Comprendre comment ces deux lignes interagissent est essentiel pour embrasser pleinement votre design unique et naviguer vos relations, votre travail et votre croissance personnelle.
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-5">
            <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-3 text-lg flex items-center gap-2">
              <span>🔑</span> Conseils pour Vivre votre Profil
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Honorez les besoins de vos deux lignes - ne privilégiez pas l'une au détriment de l'autre</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Observez comment les autres perçoivent votre seconde ligne (elle est souvent invisible pour vous)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Acceptez que votre manière d'opérer soit différente des autres profils - c'est votre force unique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                <span>Utilisez la compréhension de votre profil pour mieux communiquer vos besoins aux autres</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Authority Details */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🔑</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Autorité : {translatedAuthority}
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
          {getAuthorityDescription(data.authority)}
        </p>
      </div>

      {/* Centers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">⚙️</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Centres Énergétiques
          </h3>
        </div>

        {/* Defined Centers */}
        <div className="mb-6">
          <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">✅</span> Centres Définis ({data.defined_centers.length}/9)
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
            Les centres définis représentent des énergies fiables et constantes en vous. C'est là que vous êtes cohérent et prévisible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.defined_centers.map((center, idx) => (
              <CenterCard
                key={idx}
                name={translateCenter(center)}
                description={getCenterDescription(center)}
                isDefined={true}
              />
            ))}
          </div>
        </div>

        {/* Open Centers */}
        <div>
          <h4 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">⬜</span> Centres Ouverts ({data.open_centers.length}/9)
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
            Les centres ouverts sont des zones où vous êtes réceptif et où vous absorbez les énergies des autres.
            Ce sont vos lieux de sagesse potentielle, mais aussi de conditionnement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.open_centers.map((center, idx) => (
              <CenterCard
                key={idx}
                name={translateCenter(center)}
                description={getCenterDescription(center)}
                isDefined={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Definition */}
      {data.definition && data.definition !== 'none' && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔗</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              D&eacute;finition : {translateDefinition(data.definition)}
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {getDefinitionDescription(data.definition)}
          </p>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
            <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">
              {getDefinitionAdvice(data.definition)}
            </p>
          </div>
        </div>
      )}

      {/* Variable (4 Arrows) with Color/Tone enrichment */}
      {data.variable && data.variable !== 'Unknown' && (() => {
        const colorTone = getVariableColorTone()
        const arrowKeys = ['motivation', 'perspective', 'digestion', 'environment'] as const
        const arrowColorTone = colorTone ? [colorTone.motivation, colorTone.perspective, colorTone.digestion, colorTone.environment] : []
        return (
          <div className="bg-gradient-to-br from-rose-50 to-fuchsia-50 dark:from-rose-900/20 dark:to-fuchsia-900/20 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🏹</span>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Variable : {data.variable}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
              Les 4 fl&egrave;ches de votre Variable r&eacute;v&egrave;lent comment votre corps et votre esprit sont con&ccedil;us pour fonctionner au quotidien.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getVariableArrows(data.variable).map((arrow, idx) => (
                <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{arrow.icon}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{arrow.label}</h4>
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      arrow.direction === 'Left'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                    }`}>
                      {arrow.direction === 'Left' ? 'Gauche' : 'Droite'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                    {arrow.description}
                  </p>
                  {arrowColorTone[idx] && arrowColorTone[idx].color && arrowColorTone[idx].tone && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        Color {arrowColorTone[idx].color} ({COLOR_NAMES[arrowColorTone[idx].color!] || arrowColorTone[idx].color}) &middot; Tone {arrowColorTone[idx].tone} ({TONE_NAMES[arrowColorTone[idx].tone!] || arrowColorTone[idx].tone})
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Channels with descriptions and centers */}
      {data.channels && data.channels.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 rounded-xl p-6 border-2 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔀</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Canaux Activ&eacute;s ({data.channels.length})
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Les canaux repr&eacute;sentent des flux d&apos;&eacute;nergie fixes entre deux centres. Ils d&eacute;finissent vos talents fiables et votre mani&egrave;re d&apos;agir naturelle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.channels.map((channel, idx) => {
              const channelKey = `${channel.gates[0]}-${channel.gates[1]}`
              const channelInfo = CHANNELS_DATA[channelKey]
              return (
                <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm whitespace-nowrap">
                      {channel.gates[0]}-{channel.gates[1]}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {channelInfo?.name_fr || channel.name}
                    </span>
                  </div>
                  {channelInfo && (
                    <>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug mb-2">
                        {channelInfo.description_fr}
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                        {translateCenter(channelInfo.centers[0])} ↔ {translateCenter(channelInfo.centers[1])}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Incarnation Cross (if available) */}
      {data.incarnation_cross && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">&#10013;&#65039;</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Croix d&apos;Incarnation
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-3">
            {data.incarnation_cross}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Votre Croix d&apos;Incarnation repr&eacute;sente votre th&egrave;me de vie et votre contribution unique au monde.
            Elle est d&eacute;termin&eacute;e par les positions du Soleil et de la Terre dans votre carte de naissance (Personnalit&eacute; et Design).
          </p>
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              {data.incarnation_cross.includes('Right Angle')
                ? '\ud83d\udca1 Angle Droit : Votre destin\u00e9e est personnelle. Votre chemin de vie est principalement guid\u00e9 par vos propres exp\u00e9riences et d\u00e9couvertes int\u00e9rieures.'
                : data.incarnation_cross.includes('Left Angle')
                ? '\ud83d\udca1 Angle Gauche : Votre destin\u00e9e est transpersonnelle. Votre chemin de vie se r\u00e9alise \u00e0 travers les relations et l\'impact que vous avez sur les autres.'
                : data.incarnation_cross.includes('Juxtaposition')
                ? '\ud83d\udca1 Juxtaposition : Votre destin\u00e9e est fixe et unique. Vous avez un r\u00f4le tr\u00e8s sp\u00e9cifique \u00e0 jouer qui ne d\u00e9pend ni de vous seul, ni des autres, mais d\'un axe fixe entre les deux.'
                : '\ud83d\udca1 Votre croix d\u00e9finit le th\u00e8me fondamental de votre incarnation.'}
            </p>
          </div>
        </div>
      )}

      {/* Planets Tables */}
      {data.gates && data.gates.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🪐</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Plan&egrave;tes &amp; Portes Activ&eacute;es
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
            Chaque plan&egrave;te active une porte sp&eacute;cifique dans votre carte. Le c&ocirc;t&eacute; Personnalit&eacute; (conscient) repr&eacute;sente ce que vous reconnaissez en vous, le c&ocirc;t&eacute; Design (inconscient) repr&eacute;sente ce que les autres voient.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personality Planets */}
            <div>
              <h4 className="text-lg font-bold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                <span>☀️</span> Personnalit&eacute; (Conscient)
              </h4>
              <div className="space-y-1.5">
                {getPlanetGates('personality').map((p, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg w-6 text-center" title={p.planet}>{p.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 shrink-0">{p.planet}</span>
                    <span className="text-sm font-bold text-violet-700 dark:text-violet-300 w-16 shrink-0">
                      Porte {p.gate}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12 shrink-0">L.{p.line}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={p.keyword}>
                      {p.keyword}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Planets */}
            <div>
              <h4 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <span>🌙</span> Design (Inconscient)
              </h4>
              <div className="space-y-1.5">
                {getPlanetGates('design').map((p, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-lg w-6 text-center" title={p.planet}>{p.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 shrink-0">{p.planet}</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 w-16 shrink-0">
                      Porte {p.gate}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12 shrink-0">L.{p.line}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={p.keyword}>
                      {p.keyword}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activated Gates with descriptions */}
      {data.gates && data.gates.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🚪</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portes Activ&eacute;es ({new Set(data.gates.map(g => g.number)).size})
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
            Les portes repr&eacute;sentent des th&egrave;mes &eacute;nerg&eacute;tiques sp&eacute;cifiques dans votre carte. Chaque porte correspond &agrave; un hexagramme du I-Ching.
          </p>

          {/* Personality Gates */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
              <span>☀️</span> Portes Personnalit&eacute;
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.gates.filter(g => g.side === 'personality').map((gate, idx) => {
                const gateInfo = GATES_DATA[gate.number]
                const planetInfo = PLANET_NAMES_FR[gate.planet]
                return (
                  <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                        Porte {gate.number}.{gate.line}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {planetInfo?.icon} {planetInfo?.name || gate.planet}
                      </span>
                    </div>
                    {gateInfo && (
                      <>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {gateInfo.keyword_fr}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1">
                          {gateInfo.description_fr}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Design Gates */}
          <div>
            <h4 className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
              <span>🌙</span> Portes Design
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.gates.filter(g => g.side === 'design').map((gate, idx) => {
                const gateInfo = GATES_DATA[gate.number]
                const planetInfo = PLANET_NAMES_FR[gate.planet]
                return (
                  <div key={idx} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                        Porte {gate.number}.{gate.line}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {planetInfo?.icon} {planetInfo?.name || gate.planet}
                      </span>
                    </div>
                    {gateInfo && (
                      <>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {gateInfo.keyword_fr}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1">
                          {gateInfo.description_fr}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Comprendre le Design Humain
        </h4>
        <p className="leading-relaxed text-purple-50">
          Le Design Humain est un système qui combine astrologie, I Ching, Kabbale et chakras.
          Votre bodygraph révèle votre configuration énergétique unique et comment naviguer la vie de manière alignée.
          Vivre selon votre stratégie et autorité vous permet d'expérimenter votre signature et de minimiser le non-soi.
        </p>
      </div>
    </ProfileSection>
  )
}

interface InfoBoxProps {
  icon: string
  label: string
  value: string
  color: 'blue' | 'green' | 'red' | 'purple'
  description: string
}

const InfoBox: React.FC<InfoBoxProps> = ({ icon, label, value, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border-2`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{label}</h4>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

interface CenterCardProps {
  name: string
  description: string
  isDefined: boolean
}

const CenterCard: React.FC<CenterCardProps> = ({ name, description, isDefined }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isDefined
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
      }`}
    >
      <h5 className={`font-bold mb-1 ${isDefined ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
        {name}
      </h5>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
        {description}
      </p>
    </div>
  )
}
