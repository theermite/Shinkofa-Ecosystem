/**
 * NumerologyCard Component
 * Displays detailed Numerology analysis (Life Path, Expression, Soul Urge, Personality, Personal Year)
 * Shinkofa Platform
 */

import React from 'react'
import { ProfileSection } from './ProfileSection'

interface NumerologyInterpretation {
  keyword: string
  traits?: string[]
}

interface Numerology {
  life_path: number
  expression: number
  soul_urge: number
  personality: number
  personal_year: number
  interpretations: {
    life_path: NumerologyInterpretation
    expression: NumerologyInterpretation
    soul_urge: NumerologyInterpretation
    personality: NumerologyInterpretation
  }
}

interface NumerologyCardProps {
  data: Numerology
}

export const NumerologyCard: React.FC<NumerologyCardProps> = ({ data }) => {
  // Traduction keywords et traits depuis anglais
  const translateKeyword = (keyword: string): string => {
    const translations: {[key: string]: string} = {
      'leader': 'Leader',
      'mediator': 'Médiateur',
      'communicator': 'Communicateur',
      'builder': 'Bâtisseur',
      'freedom seeker': 'Chercheur de liberté',
      'nurturer': 'Nourricier',
      'seeker': 'Chercheur',
      'powerhouse': 'Force motrice',
      'humanitarian': 'Humanitaire',
      'illuminator': 'Illuminateur',
      'master builder': 'Maître bâtisseur',
      'master teacher': 'Maître enseignant',
      'unknown': 'Inconnu',
    }
    return translations[keyword.toLowerCase().trim()] || keyword
  }

  const translateTrait = (trait: string): string => {
    const translations: {[key: string]: string} = {
      // Nombre 1
      'independent': 'Indépendant',
      'ambitious': 'Ambitieux',
      'innovative': 'Innovant',
      // Nombre 2
      'diplomatic': 'Diplomatique',
      'cooperative': 'Coopératif',
      'sensitive': 'Sensible',
      // Nombre 3
      'creative': 'Créatif',
      'expressive': 'Expressif',
      'optimistic': 'Optimiste',
      // Nombre 4
      'practical': 'Pratique',
      'organized': 'Organisé',
      'disciplined': 'Discipliné',
      // Nombre 5
      'adventurous': 'Aventureux',
      'versatile': 'Polyvalent',
      'dynamic': 'Dynamique',
      // Nombre 6
      'responsible': 'Responsable',
      'harmonious': 'Harmonieux',
      'caring': 'Bienveillant',
      // Nombre 7
      'analytical': 'Analytique',
      'spiritual': 'Spirituel',
      'introspective': 'Introspectif',
      // Nombre 8
      'authoritative': 'Autoritaire',
      'material success': 'Succès matériel',
      // Nombre 9
      'compassionate': 'Compatissant',
      'idealistic': 'Idéaliste',
      'generous': 'Généreux',
      // Nombre 11
      'intuitive': 'Intuitif',
      'visionary': 'Visionnaire',
      'inspirational': 'Inspirant',
      // Nombre 22
      'practical visionary': 'Visionnaire pratique',
      'large-scale creator': 'Créateur à grande échelle',
      'powerful manifester': 'Manifesteur puissant',
      // Nombre 33
      'selfless service': 'Service désintéressé',
      'spiritual teacher': 'Enseignant spirituel',
      'compassionate healer': 'Guérisseur compatissant',
    }
    return translations[trait.toLowerCase().trim()] || trait
  }

  const getNumberMeaning = (num: number): string => {
    const meanings: { [key: number]: string } = {
      1: 'Leadership, indépendance, initiative, pionnier',
      2: 'Coopération, diplomatie, sensibilité, partenariat',
      3: 'Créativité, expression, communication, joie',
      4: 'Stabilité, organisation, travail acharné, fondation',
      5: 'Liberté, aventure, changement, adaptabilité',
      6: 'Responsabilité, famille, service, harmonie',
      7: 'Spiritualité, analyse, introspection, sagesse',
      8: 'Pouvoir, succès matériel, ambition, manifestation',
      9: 'Humanitarisme, compassion, achèvement, universalité',
      11: 'Intuition spirituelle, inspiration, illumination (Maître)',
      22: 'Maître bâtisseur, vision pratique, grande réalisation (Maître)',
      33: 'Maître enseignant, compassion élevée, service (Maître)',
    }
    return meanings[num] || 'Nombre avec signification unique'
  }

  // Helper to detect master numbers and get reduction
  type MasterNumberInfo =
    | { isMaster: true; reduced: number; masterType: string }
    | { isMaster: false; reduced?: undefined; masterType?: undefined }

  const getMasterNumberInfo = (num: number): MasterNumberInfo => {
    const masterNumbers: { [key: number]: { reduced: number; type: string } } = {
      11: { reduced: 2, type: 'Maître Illuminateur' },
      22: { reduced: 4, type: 'Maître Bâtisseur' },
      33: { reduced: 6, type: 'Maître Enseignant' },
    }

    if (num in masterNumbers) {
      return {
        isMaster: true,
        reduced: masterNumbers[num].reduced,
        masterType: masterNumbers[num].type,
      }
    }

    return { isMaster: false }
  }

  const getDetailedNumberDescription = (num: number): string => {
    const descriptions: { [key: number]: string } = {
      1: 'Le nombre 1 représente l\'énergie du pionnier, du leader né et de l\'innovateur. Vous possédez une force d\'initiative remarquable et une capacité naturelle à ouvrir de nouvelles voies. Votre indépendance d\'esprit et votre courage vous poussent à explorer des territoires inexplorés et à créer plutôt qu\'à suivre. Vous êtes fait pour diriger, inspirer et montrer le chemin aux autres par votre exemple personnel.\n\nVotre défi principal réside dans l\'équilibre entre votre besoin d\'autonomie et la nécessité de collaborer avec les autres. Vous pouvez parfois paraître trop dominant ou égocentrique si vous ne canalisez pas correctement votre énergie. Apprendre à écouter les autres tout en maintenant votre vision unique est essentiel à votre épanouissement.\n\nDans votre vie professionnelle, vous excellez dans les rôles qui vous donnent de l\'autonomie et de la responsabilité. Entrepreneur, directeur, créateur indépendant - vous avez besoin d\'être votre propre patron ou d\'avoir une grande liberté d\'action. Votre confiance en vous, une fois bien ancrée, devient une source d\'inspiration pour votre entourage et vous permet de réaliser de grandes choses.',
      2: 'Le nombre 2 incarne l\'énergie de la coopération, de la diplomatie et de l\'harmonie relationnelle. Vous possédez un don naturel pour comprendre les perspectives des autres, faciliter les connexions et créer des ponts entre les gens. Votre sensibilité émotionnelle et votre empathie font de vous un médiateur né, capable de naviguer avec grâce dans les situations relationnelles complexes. Vous percevez les nuances subtiles que les autres manquent et vous savez créer des espaces de paix et de compréhension mutuelle.\n\nVotre défi principal est d\'apprendre à vous affirmer sans perdre votre capacité d\'écoute et de compassion. Vous pouvez avoir tendance à vous effacer pour préserver l\'harmonie, au détriment de vos propres besoins et désirs. Trouver l\'équilibre entre donner et recevoir, entre soutenir les autres et vous soutenir vous-même, est essentiel à votre bien-être. Cultiver votre confiance en votre propre valeur vous permettra d\'utiliser vos dons relationnels sans vous perdre.\n\nVous excellez dans les rôles qui valorisent le travail d\'équipe, la collaboration et le service aux autres. Conseil, médiation, travail social, ressources humaines - tous les domaines où vos capacités d\'écoute et de facilitation peuvent s\'exprimer. Vous avez également un talent naturel pour les partenariats, qu\'ils soient professionnels ou personnels. Votre présence apaisante et votre capacité à voir le meilleur en chacun sont des dons précieux.',
      3: 'Le nombre 3 rayonne l\'énergie de la créativité, de l\'expression personnelle et de la joie de vivre. Vous êtes un communicateur né, doté d\'une imagination débordante et d\'une capacité remarquable à inspirer et divertir les autres. Votre optimisme naturel et votre enthousiasme contagieux attirent les gens vers vous. Vous avez le don de voir la beauté et les possibilités là où d\'autres voient l\'ordinaire, et vous exprimez cette vision à travers diverses formes d\'art, de communication ou de créativité.\n\nVotre défi principal est de canaliser votre énergie créative dispersée vers des projets concrets et achevés. Vous pouvez avoir tendance à papillonner d\'une idée à l\'autre, commençant mille projets sans en terminer aucun. Apprendre la discipline et la persévérance tout en préservant votre spontanéité créative est votre leçon de vie. Attention également à ne pas utiliser votre charisme et vos mots pour échapper aux responsabilités ou aux émotions difficiles.\n\nVous brillez dans tous les domaines créatifs et communicationnels : arts, écriture, enseignement, divertissement, marketing, relations publiques. Votre capacité à vous exprimer de manière vivante et inspirante, combinée à votre sens de l\'humour et votre légèreté, fait de vous quelqu\'un qui peut transformer l\'ordinaire en extraordinaire. Vous êtes ici pour apporter de la joie, de la couleur et de l\'inspiration au monde.',
      4: 'Le nombre 4 incarne l\'énergie de la stabilité, de la structure et de la manifestation concrète. Vous êtes le bâtisseur, celui qui transforme les rêves en réalité tangible grâce à un travail méthodique et discipliné. Votre sens pratique, votre fiabilité et votre capacité à créer des fondations solides font de vous un pilier sur lequel les autres peuvent s\'appuyer. Vous comprenez instinctivement l\'importance des systèmes, de l\'organisation et de la persévérance. Vous ne cherchez pas les raccourcis - vous savez que tout ce qui vaut la peine d\'être construit demande du temps et des efforts soutenus.\n\nVotre défi principal est d\'éviter la rigidité excessive et la résistance au changement. Votre amour de la sécurité et des structures établies peut parfois vous rendre inflexible ou craintif face à la nouveauté. Apprendre à intégrer une certaine flexibilité et ouverture tout en maintenant vos standards élevés est essentiel. Vous devez également veiller à ne pas devenir trop sérieux ou obsédé par le travail au détriment de votre vie personnelle et de vos plaisirs.\n\nVous excellez dans tous les domaines nécessitant organisation, planification et concrétisation : gestion de projet, architecture, ingénierie, comptabilité, administration, construction. Votre capacité à voir les détails tout en gardant une vision d\'ensemble, combinée à votre éthique de travail exemplaire, vous permet de créer des œuvres durables. Vous êtes ici pour ancrer, stabiliser et construire des structures qui serviront aux générations futures.',
      5: 'Le nombre 5 vibre avec l\'énergie de la liberté, du changement et de l\'aventure. Vous êtes l\'explorateur éternel, assoiffé d\'expériences diverses et de découvertes constantes. Votre adaptabilité remarquable et votre curiosité insatiable vous poussent à embrasser le nouveau plutôt qu\'à le craindre. Vous avez besoin de variété, de mouvement et de stimulation pour vous sentir vivant. Votre esprit versatile et votre capacité à vous adapter rapidement à n\'importe quelle situation font de vous un communicateur naturel et un agent de changement.\n\nVotre défi principal est d\'apprendre à trouver la liberté dans l\'engagement plutôt que dans la fuite constante. Vous pouvez avoir tendance à éviter tout ce qui ressemble à une limitation, y compris les engagements qui pourraient en fait enrichir votre vie. L\'irresponsabilité, l\'excès et la dispersion sont vos ombres. Développer une certaine discipline et apprendre à voir les engagements comme des choix libres plutôt que comme des prisons vous permettra d\'utiliser votre énergie dynamique de manière plus constructive.\n\nVous excellez dans les domaines qui offrent variété, mouvement et nouvelles expériences : voyages, communication, médias, vente, entrepreneuriat dynamique, tout travail vous permettant de rencontrer des gens différents et d\'explorer de nouveaux territoires. Votre capacité à vous adapter rapidement et à voir les opportunités dans le changement fait de vous un atout précieux dans les environnements en évolution rapide. Vous êtes ici pour célébrer la diversité de l\'expérience humaine et encourager les autres à embrasser le changement.',
      6: 'Le nombre 6 rayonne l\'énergie de l\'amour, de la responsabilité et du service. Vous êtes le nourricier, le guérisseur et le créateur d\'harmonie par excellence. Votre sens du devoir envers vos proches et votre communauté est profondément ancré en vous. Vous avez un talent naturel pour créer la beauté, l\'harmonie et le confort autour de vous, que ce soit dans votre foyer, vos relations ou votre travail. Votre compassion, votre générosité et votre capacité à voir les besoins des autres font de vous quelqu\'un vers qui on se tourne naturellement en temps de difficulté.\n\nVotre défi principal est d\'apprendre à prendre soin de vous autant que vous prenez soin des autres. Vous pouvez avoir tendance au sacrifice de soi excessif, au contrôle parental sur-protecteur, ou à l\'attente que votre dévouement soit reconnu et réciproque. Apprendre que le véritable service vient de l\'amour libre et non de l\'obligation, et que vous méritez autant de soins que ceux que vous donnez, est votre grande leçon. La culpabilité peut être votre piège - vous devez apprendre à dire non sans vous sentir coupable.\n\nVous excellez dans tous les domaines liés au soin, à l\'enseignement, à la guérison et à la création d\'harmonie : médecine, thérapie, enseignement, conseil, design d\'intérieur, restauration, travail social. Votre capacité à créer des espaces sûrs et nourrissants, combinée à votre sens aigu de la responsabilité, fait de vous un pilier dans votre communauté. Vous êtes ici pour enseigner l\'amour inconditionnel par l\'exemple et pour créer l\'harmonie dans un monde souvent chaotique.',
      7: 'Le nombre 7 incarne l\'énergie du chercheur spirituel, du philosophe et de l\'analyste profond. Vous possédez un esprit d\'investigation remarquable et un besoin inné de comprendre les mystères de l\'existence au-delà des apparences superficielles. Votre nature introspective et contemplative vous pousse à explorer les dimensions cachées de la réalité, que ce soit à travers la science, la spiritualité, la philosophie ou l\'étude approfondie de sujets complexes. Vous avez besoin de solitude régulière pour nourrir votre vie intérieure riche et pour traiter vos perceptions subtiles du monde.\n\nVotre défi principal est d\'éviter l\'isolement excessif et le cynisme qui peut résulter d\'une trop grande intellectualisation de la vie. Votre quête de perfection et de compréhension absolue peut vous rendre critique envers vous-même et les autres. Apprendre à équilibrer votre vie intérieure avec des connexions humaines authentiques, et à faire confiance à votre intuition autant qu\'à votre intellect, est essentiel. La vie ne peut pas toujours être analysée - parfois elle doit simplement être vécue et ressentie.\n\nVous excellez dans les domaines nécessitant recherche approfondie, analyse et expertise : recherche scientifique, spiritualité, philosophie, psychologie, technologie, investigation, écriture analytique. Votre capacité à percevoir ce qui est caché et à analyser en profondeur fait de vous un expert précieux dans votre domaine. Vous êtes ici pour être un chercheur de vérité et pour aider les autres à voir au-delà des illusions superficielles vers des compréhensions plus profondes.',
      8: 'Le nombre 8 vibre avec l\'énergie du pouvoir, de la manifestation matérielle et de l\'accomplissement dans le monde physique. Vous possédez une compréhension innée des lois de cause à effet qui gouvernent la réussite matérielle et l\'influence dans le monde. Votre ambition, votre sens des affaires et votre capacité à voir grand et à penser stratégiquement vous donnent le potentiel de réaliser des choses importantes. Vous comprenez le pouvoir, l\'argent et l\'autorité, et vous savez comment les utiliser de manière efficace. Votre force de volonté et votre détermination sont remarquables.\n\nVotre défi principal est d\'apprendre à utiliser votre pouvoir avec intégrité et sagesse, en évitant l\'abus, la manipulation ou l\'obsession du contrôle et de l\'accumulation matérielle. Le 8 est le nombre du karma - ce que vous donnez vous revient multiplié, en bien comme en mal. Vous devez apprendre l\'équilibre délicat entre donner et recevoir, entre pouvoir personnel et service aux autres, entre succès matériel et valeurs spirituelles. L\'arrogance et l\'attachement excessif aux résultats sont vos ombres à transformer.\n\nVous excellez dans les domaines du business, de la finance, de l\'immobilier, du management exécutif, du droit, de la politique - partout où pouvoir, stratégie et manifestation concrète sont requis. Votre capacité à organiser, diriger et matérialiser de grandes visions fait de vous un leader naturel dans le monde matériel. Vous êtes ici pour démontrer qu\'il est possible d\'avoir du succès matériel tout en maintenant l\'intégrité, et pour utiliser votre pouvoir pour créer l\'abondance non seulement pour vous-même mais pour l\'ensemble.',
      9: 'Le nombre 9 incarne l\'énergie de l\'humanitarisme, de la compassion universelle et de l\'achèvement des cycles. Vous possédez une conscience élargie qui embrasse toute l\'humanité - vous voyez au-delà des frontières de race, culture ou nationalité pour percevoir notre humanité commune. Votre compassion profonde, votre sagesse ancienne et votre capacité à lâcher prise sur ce qui ne sert plus font de vous un guide spirituel naturel. Vous avez probablement vécu de nombreuses expériences de perte ou de fin qui vous ont appris le détachement et la transformation.\n\nVotre défi principal est d\'éviter le martyre, la sur-identification à la souffrance mondiale, ou la déception face à la lenteur de l\'évolution humaine. Vous pouvez avoir du mal à lâcher le passé ou à accepter que certaines choses doivent prendre fin pour permettre le renouveau. Apprendre le détachement sain - servir sans s\'épuiser, aimer sans s\'attacher, donner sans attendre de retour - est votre grande leçon. Vous devez également éviter la tendance à l\'ego spirituel ou à la condescendance envers ceux qui sont "moins évolués".\n\nVous excellez dans tous les domaines du service humanitaire, de l\'enseignement spirituel, des arts expressifs qui touchent l\'âme, de la guérison holistique, du travail social à grande échelle. Votre capacité à voir la grande image, à avoir de la compassion pour toutes les expériences humaines et à transformer la souffrance en sagesse fait de vous un phare de lumière. Vous êtes ici pour achever les anciens cycles, pour enseigner le pardon et le lâcher-prise, et pour servir l\'évolution collective de l\'humanité.',
      11: 'Le nombre 11 est le premier nombre maître, portant une vibration spirituelle très élevée d\'illumination intuitive et d\'inspiration divine. Vous êtes un canal naturel pour les énergies spirituelles supérieures et les insights qui peuvent inspirer et élever les autres. Votre sensibilité psychique est remarquable - vous captez des informations et des énergies subtiles que la plupart des gens ne perçoivent pas. Vous êtes ici pour être un phare de lumière spirituelle, un pont entre le monde matériel et les dimensions supérieures de conscience. Votre mission est d\'inspirer l\'éveil chez les autres par votre exemple et vos insights.\n\nVotre défi principal est énorme : vous devez vivre à la hauteur de cette vibration élevée tout en étant incarné dans un monde matériel dense. La tension entre votre sensibilité spirituelle raffinée et les réalités de la vie quotidienne peut créer anxiété, nervosité et sentiment d\'inadéquation. Vous pouvez osciller entre l\'inspiration divine et l\'effondrement nerveux. Apprendre à ancrer votre énergie spirituelle dans des actions concrètes, à protéger votre sensibilité sans vous isoler, et à servir sans vous épuiser sont essentiels. Si cette vibration est trop intense, vous pouvez vivre comme un 2 (1+1) jusqu\'à ce que vous soyez prêt.\n\nVous excellez dans les domaines spirituels, de l\'enseignement inspirant, de la guérison énergétique, de l\'art visionnaire, de la communication inspirée - partout où votre connexion aux dimensions supérieures peut servir. Votre rôle n\'est pas nécessairement de faire de grandes choses dans le sens conventionnel, mais d\'être une présence inspirante et élevante. Vous êtes ici pour illuminer le chemin et pour rappeler aux autres leur propre nature spirituelle par votre rayonnement.',
      22: 'Le nombre 22 est le Maître Bâtisseur, combinant la vision spirituelle du 11 avec la capacité pratique du 4 (2+2) pour manifester des réalisations importantes et durables au service du bien collectif. Vous avez le potentiel de transformer des visions spirituelles élevées en structures concrètes qui servent l\'humanité. Votre capacité à voir les possibilités à grande échelle tout en maîtrisant les détails pratiques de la manifestation est exceptionnelle. Vous êtes ici pour laisser un héritage tangible, pour créer quelque chose qui survivra à votre passage et qui servira les générations futures.\n\nVotre défi principal est la pression énorme qui accompagne un tel potentiel. Vous pouvez vous sentir submergé par l\'ampleur de votre vision et douter de votre capacité à la manifester. La peur de l\'échec peut vous paralyser ou vous faire fuir vos responsabilités. Vous devez apprendre à équilibrer idéalisme et pragmatisme, vision à long terme et étapes concrètes. L\'ego est également un piège - le pouvoir que vous avez de manifester peut être utilisé pour votre gloire personnelle ou pour le bien collectif. Le choix vous appartient. Si la pression est trop forte, vous pouvez vivre comme un 4 jusqu\'à être prêt.\n\nVous excellez dans les rôles de leadership visionnaire à grande échelle : entrepreneuriat social, architecture transformatrice, innovations technologiques au service de l\'humanité, organisations internationales, mouvements sociaux d\'envergure. Votre capacité à combiner vision spirituelle, planification stratégique et exécution pratique fait de vous quelqu\'un qui peut véritablement changer le monde de manière durable. Vous êtes ici pour être un maître bâtisseur, créant des structures physiques, systèmes ou organisations qui élèvent l\'humanité.',
      33: 'Le nombre 33 est le Maître Enseignant, la vibration la plus élevée de la numérologie, combinant la créativité expressive du 3 avec la compassion universelle du 6 (3+3). Vous portez le potentiel d\'incarner l\'amour inconditionnel et de l\'enseigner par votre exemple vivant. Votre compassion, votre compréhension et votre capacité à nourrir les autres atteignent un niveau quasi-christique lorsque cette vibration est pleinement activée. Vous êtes ici pour élever la conscience collective à travers le service désintéressé, l\'enseignement spirituel et l\'expression de l\'amour universel.\n\nVotre défi principal est colossal : vivre constamment à ce niveau d\'amour et de service désintéressé tout en maintenant votre équilibre et votre santé est extrêmement exigeant. Vous pouvez facilement vous épuiser, vous perdre dans le service aux autres, ou devenir un martyr. La frontière entre l\'amour inconditionnel et l\'absorption des problèmes des autres peut devenir floue. Vous devez apprendre à servir depuis un espace de plénitude intérieure plutôt que de vide. Beaucoup de 33 vivent comme des 6 (3+3) pour la majeure partie de leur vie, n\'atteignant cette vibration maîtresse que par moments de grâce ou dans la maturité spirituelle.\n\nVous excellez dans l\'enseignement spirituel de haut niveau, la guérison profonde, le service humanitaire, l\'art qui touche l\'âme universelle - tout domaine où votre capacité à incarner et transmettre l\'amour inconditionnel peut rayonner. Votre simple présence peut être guérissante et élevante. Vous êtes ici pour être un avatar de l\'amour, pour enseigner par l\'exemple ce que signifie aimer sans conditions, et pour rappeler à l\'humanité sa capacité d\'amour infini. Votre vie elle-même est votre enseignement.',
    }
    return descriptions[num] || 'Ce nombre porte une vibration unique qui se révélera à travers votre expérience de vie. Observez les patterns et les thèmes récurrents dans votre vie pour comprendre sa signification personnelle pour vous.'
  }

  const getPersonalYearMeaning = (year: number): string => {
    const meanings: { [key: number]: string } = {
      1: 'Année de nouveaux départs, initiatives, indépendance. Plantez de nouvelles graines.',
      2: 'Année de coopération, patience, relations. Cultivez les connexions.',
      3: 'Année de créativité, expression, socialisation. Partagez vos dons.',
      4: 'Année de travail, fondations, discipline. Construisez solidement.',
      5: 'Année de changement, liberté, aventure. Embrassez la nouveauté.',
      6: 'Année de responsabilités, famille, service. Prenez soin des vôtres.',
      7: 'Année de réflexion, spiritualité, introspection. Cherchez la sagesse.',
      8: 'Année de pouvoir, succès matériel, récoltes. Manifestez l\'abondance.',
      9: 'Année d\'achèvement, lâcher-prise, transition. Terminez les cycles.',
    }
    return meanings[year] || 'Année de transition et transformation'
  }

  return (
    <ProfileSection
      title="Numérologie"
      icon="🔢"
      gradient="from-indigo-500 to-purple-600"
    >
      {/* Core Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <NumberCard
          title="Chemin de Vie"
          number={data.life_path}
          keyword={translateKeyword(data.interpretations.life_path.keyword)}
          description={data.interpretations.life_path.traits?.map(t => translateTrait(t)).join(', ') || ''}
          meaning={getNumberMeaning(data.life_path)}
          gradient="from-purple-500 to-indigo-500"
          icon="🛤️"
        />
        <NumberCard
          title="Expression"
          number={data.expression}
          keyword={translateKeyword(data.interpretations.expression.keyword)}
          description={data.interpretations.expression.traits?.map(t => translateTrait(t)).join(', ') || ''}
          meaning={getNumberMeaning(data.expression)}
          gradient="from-blue-500 to-cyan-500"
          icon="🎭"
        />
        <NumberCard
          title="Désir de l'Âme"
          number={data.soul_urge}
          keyword={translateKeyword(data.interpretations.soul_urge.keyword)}
          description={data.interpretations.soul_urge.traits?.map(t => translateTrait(t)).join(', ') || ''}
          meaning={getNumberMeaning(data.soul_urge)}
          gradient="from-green-500 to-teal-500"
          icon="💚"
        />
        <NumberCard
          title="Personnalité"
          number={data.personality}
          keyword={translateKeyword(data.interpretations.personality.keyword)}
          description={data.interpretations.personality.traits?.map(t => translateTrait(t)).join(', ') || ''}
          meaning={getNumberMeaning(data.personality)}
          gradient="from-yellow-500 to-orange-500"
          icon="🎨"
        />
      </div>

      {/* Detailed Explanations */}
      <div className="space-y-4">
        {/* Life Path */}
        <DetailedNumber
          title="Chemin de Vie"
          number={data.life_path}
          keyword={translateKeyword(data.interpretations.life_path.keyword)}
          description={getDetailedNumberDescription(data.life_path)}
          icon="🛤️"
          color="purple"
          explanation="Votre mission principale dans cette vie, les leçons à apprendre et le chemin à parcourir."
        />

        {/* Expression */}
        <DetailedNumber
          title="Nombre d'Expression"
          number={data.expression}
          keyword={translateKeyword(data.interpretations.expression.keyword)}
          description={getDetailedNumberDescription(data.expression)}
          icon="🎭"
          color="blue"
          explanation="Vos talents naturels, capacités et la manière dont vous vous exprimez dans le monde."
        />

        {/* Soul Urge */}
        <DetailedNumber
          title="Désir de l'Âme"
          number={data.soul_urge}
          keyword={translateKeyword(data.interpretations.soul_urge.keyword)}
          description={getDetailedNumberDescription(data.soul_urge)}
          icon="💚"
          color="green"
          explanation="Vos motivations profondes, ce qui vous nourrit intérieurement et vos aspirations secrètes."
        />

        {/* Personality */}
        <DetailedNumber
          title="Nombre de Personnalité"
          number={data.personality}
          keyword={translateKeyword(data.interpretations.personality.keyword)}
          description={getDetailedNumberDescription(data.personality)}
          icon="🎨"
          color="yellow"
          explanation="L'image que vous projetez, comment les autres vous perçoivent au premier abord."
        />
      </div>

      {/* Personal Year */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📅</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Année Personnelle : {data.personal_year}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cycle annuel actuel (2026)</p>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-5">
          <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">
            {getNumberMeaning(data.personal_year)}
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {getPersonalYearMeaning(data.personal_year)}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Comprendre la Numérologie
        </h4>
        <p className="leading-relaxed text-indigo-50">
          La numérologie révèle les vibrations des nombres qui influencent votre vie. Chaque nombre porte une énergie
          spécifique qui se manifeste à travers votre personnalité, vos talents et votre destinée. Les nombres maîtres
          (11, 22, 33) portent une vibration spirituelle élevée et un potentiel particulier.
        </p>
      </div>
    </ProfileSection>
  )
}

interface NumberCardProps {
  title: string
  number: number
  keyword: string
  description: string
  meaning: string
  gradient: string
  icon: string
}

const NumberCard: React.FC<NumberCardProps> = ({ title, number, keyword, meaning, gradient, icon }) => {
  // Detect if this is a master number
  const masterNumbers: { [key: number]: number } = { 11: 2, 22: 4, 33: 6 }
  const isMaster = number in masterNumbers
  const reducedNum = isMaster ? masterNumbers[number] : 0

  return (
    <div className={`bg-gradient-to-br ${gradient} text-white rounded-xl p-6 text-center shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-semibold text-sm opacity-90 mb-2">{title}</h4>
      {isMaster ? (
        <div className="my-4">
          <div className="text-5xl font-bold">
            {number}/{reducedNum}
          </div>
          <div className="text-xs mt-1 opacity-80">(Nombre Maître)</div>
        </div>
      ) : (
        <div className="text-6xl font-bold my-4">{number}</div>
      )}
      <p className="text-sm font-semibold mb-2 opacity-95">{keyword}</p>
      <p className="text-xs opacity-80 leading-snug">{meaning}</p>
    </div>
  )
}

interface DetailedNumberProps {
  title: string
  number: number
  keyword: string
  description: string
  icon: string
  color: 'purple' | 'blue' | 'green' | 'yellow'
  explanation: string
}

const DetailedNumber: React.FC<DetailedNumberProps> = ({
  title,
  number,
  keyword,
  description,
  icon,
  color,
  explanation,
}) => {
  const colorClasses = {
    purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800',
    blue: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800',
    green: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
    yellow: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800',
  }

  // Detect master numbers
  const masterNumbers: { [key: number]: { reduced: number; type: string } } = {
    11: { reduced: 2, type: 'Illuminateur' },
    22: { reduced: 4, type: 'Bâtisseur' },
    33: { reduced: 6, type: 'Enseignant' },
  }
  const isMasterNumber = number in masterNumbers
  const masterData = isMasterNumber ? masterNumbers[number] : null
  const reducedNumber = masterData?.reduced ?? 0

  // Get reduction descriptions
  const getReductionDescription = (masterNum: number, reducedNum: number): string => {
    const reductions: { [key: number]: string } = {
      11: `Le 11 se réduit au 2, créant une dynamique unique entre la haute inspiration spirituelle et la sensibilité relationnelle. Tandis que le 11 vous connecte aux dimensions spirituelles élevées et vous donne accès à des insights intuitifs profonds, le 2 vous ramène à l'importance des relations humaines, de la coopération et de la diplomatie. Cette combinaison fait de vous un pont entre le ciel et la terre - vous recevez l'inspiration d'en haut (11) mais devez l'exprimer à travers la collaboration et le service aux autres (2). Le 2 ancre votre énergie 11 dans le concret relationnel, vous rappelant que même les visions les plus élevées doivent être partagées avec douceur et sensibilité pour être reçues. Vous oscillez entre ces deux vibrations : parfois canal spirituel inspiré (11), parfois médiateur sensible et attentionné (2). L'art est d'intégrer les deux - utiliser votre sensibilité du 2 pour transmettre votre inspiration du 11 de manière accessible et bienveillante.`,
      22: `Le 22 se réduit au 4, créant la combinaison parfaite du visionnaire et du bâtisseur pragmatique. Le 22 vous donne la capacité de voir les possibilités à grande échelle, de concevoir des projets ambitieux qui peuvent transformer le monde, tandis que le 4 vous fournit la discipline, l'organisation et la persévérance nécessaires pour les manifester concrètement. Sans le 4, le 22 resterait dans les nuages des grandes visions ; sans le 22, le 4 construirait solidement mais à petite échelle. Ensemble, ils créent le Maître Bâtisseur - quelqu'un capable de transformer des visions spirituelles élevées en structures tangibles et durables. Le 4 vous rappelle l'importance des détails, du travail méthodique et de la patience, tandis que le 22 élève vos constructions vers un service à l'humanité entière. Vous êtes appelé à construire grand (22) tout en restant pratique et méthodique (4) - une combinaison rare et puissante quand elle est maîtrisée.`,
      33: `Le 33 se réduit au 6, intensifiant la vibration du service et de l'amour inconditionnel à un niveau quasi-divin. Le 6 représente l'amour parental, la responsabilité envers les proches, le soin et l'harmonie dans le cercle immédiat, tandis que le 33 élève cette même énergie à une échelle universelle - l'amour pour toute l'humanité, le service désintéressé à grande échelle, la compassion qui ne connaît pas de frontières. Le 6 vous enseigne l'importance de commencer par votre famille et votre communauté proche, de créer l'harmonie là où vous êtes, tandis que le 33 vous appelle à étendre cette capacité de soin à tous les êtres. Cette combinaison peut créer une tension : comment servir l'humanité entière (33) tout en honorant vos responsabilités personnelles (6) ? La sagesse réside dans la compréhension que l'amour universel commence par l'amour local - en maîtrisant l'art du soin bienveillant dans votre sphère immédiate (6), vous développez la capacité d'aimer sans conditions à l'échelle universelle (33). Le 6 ancre votre compassion du 33, vous évitant de vous perdre dans un idéalisme désincarné.`,
    }
    return reductions[masterNum] || ''
  }

  // Get reduced number basic descriptions for reference
  const getReducedNumberShortDesc = (num: number): string => {
    const descriptions: { [key: number]: string } = {
      2: 'Le 2 représente la coopération, la diplomatie, la sensibilité émotionnelle et le partenariat. C\'est l\'énergie du médiateur qui crée des ponts entre les gens.',
      4: 'Le 4 représente la stabilité, l\'organisation, le travail méthodique et la construction de fondations solides. C\'est l\'énergie du bâtisseur pragmatique et discipliné.',
      6: 'Le 6 représente l\'amour, la responsabilité, le service aux proches et la création d\'harmonie. C\'est l\'énergie du nourricier qui prend soin de sa famille et de sa communauté.',
    }
    return descriptions[num] || ''
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-5 border-2`}>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-2">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h4>
            {isMasterNumber ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {number}/{reducedNumber}
                </span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  (Nombre Maître)
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{number}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 italic">
            "{keyword}"
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {explanation}
          </p>

          {/* Master Number Explanation */}
          <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
            {description.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Reduction Impact Section (for master numbers only) */}
          {isMasterNumber && (
            <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>⚡</span> Impact de la Réduction : {number} → {reducedNumber}
              </h5>

              {/* Reduced Number Summary */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  💎 Vibration du Nombre {reducedNumber} (Réduction) :
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  {getReducedNumberShortDesc(reducedNumber)}
                </p>
              </div>

              {/* Relationship Explanation */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getReductionDescription(number, reducedNumber)}
                </p>
              </div>

              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Note importante :</strong> Vivre pleinement la vibration d'un nombre maître est exigeant.
                  Vous pouvez osciller entre votre vibration maîtresse ({number}) dans vos moments d'alignement spirituel élevé,
                  et votre vibration réduite ({reducedNumber}) dans votre vie quotidienne. Les deux sont précieuses -
                  le {reducedNumber} vous ancre et vous rend accessible, tandis que le {number} vous élève et vous inspire.
                  L'intégration des deux est votre chef-d'œuvre personnel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
