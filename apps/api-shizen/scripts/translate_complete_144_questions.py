"""
Complete Translation Script - All 144 Questions EN
Shinkofa Platform - Professional Quality Translations
Version 2.0 - Complete with all 591 option translations
"""
import json
import sys
from pathlib import Path
from typing import Dict, List, Any

# Add parent directory to path to import translation mapping
sys.path.insert(0, str(Path(__file__).parent.parent / 'app' / 'data'))
from french_to_english_translation_mapping import french_to_english

# === TRANSLATION DICTIONARIES ===

BLOCS_EN = {
    "🏠 BLOC A : CONTEXTE DE VIE": "🏠 BLOCK A: LIFE CONTEXT",
    "🧠 BLOC B : PERSONNALITÉ & FONCTIONNEMENT": "🧠 BLOCK B: PERSONALITY & FUNCTIONING",
    "🌈 BLOC C : NEURODIVERGENCES & COGNITIF": "🌈 BLOCK C: NEURODIVERGENCE & COGNITIVE",
    "💎 BLOC D : VALEURS & PHILOSOPHIE": "💎 BLOCK D: VALUES & PHILOSOPHY",
    "❤️ BLOC E : RELATIONS & SOCIAL": "❤️ BLOCK E: RELATIONSHIPS & SOCIAL",
    "💼 BLOC F : TRAVAIL & PROFESSIONNEL": "💼 BLOCK F: WORK & PROFESSIONAL",
    "🌿 BLOC G : SANTÉ & BIEN-ÊTRE": "🌿 BLOCK G: HEALTH & WELLBEING",
    "🎭 BLOC H : EMOTIONS & PSYCHOLOGIE": "🎭 BLOCK H: EMOTIONS & PSYCHOLOGY",
    "✨ BLOC I : SPIRITUALITÉ & SENS": "✨ BLOCK I: SPIRITUALITY & MEANING"
}

MODULES_EN = {
    "Module A0 : Identité & Analyse des noms/prénoms": "Module A0: Identity & Name Analysis",
    "Module A1 : Informations personnelles": "Module A1: Personal Information",
    "Module A2 : Contexte familial & origines": "Module A2: Family Context & Origins",
    "Module A3 : Situation actuelle & Aspirations": "Module A3: Current Situation & Aspirations",
    "Module B1 : Traits de personnalité généraux": "Module B1: General Personality Traits",
    "Module B2 : Archétypes Jungiens": "Module B2: Jungian Archetypes",
    "Module B3 : Patterns comportementaux": "Module B3: Behavioral Patterns",
    "Module C1 : Neurodivergences identifiées": "Module C1: Identified Neurodivergences",
    "Module C2 : Fonctionnement cognitif": "Module C2: Cognitive Functioning",
    "Module C3 : Sensibilités sensorielles": "Module C3: Sensory Sensitivities",
    "Module D1 : Système de valeurs": "Module D1: Value System",
    "Module D2 : Principes de vie": "Module D2: Life Principles",
    "Module D3 : Vision du monde": "Module D3: Worldview",
    "Module E1 : Relations interpersonnelles": "Module E1: Interpersonal Relationships",
    "Module E2 : Besoins relationnels": "Module E2: Relational Needs",
    "Module E3 : Communication": "Module E3: Communication",
    "Module F1 : Vie professionnelle": "Module F1: Professional Life",
    "Module F2 : Motivations & Aspirations": "Module F2: Motivations & Aspirations",
    "Module F3 : Environnement de travail idéal": "Module F3: Ideal Work Environment",
    "Module G1 : Santé physique": "Module G1: Physical Health",
    "Module G2 : Bien-être mental": "Module G2: Mental Wellbeing",
    "Module G3 : Habitudes de vie": "Module G3: Lifestyle Habits",
    "Module H1 : Gestion émotionnelle": "Module H1: Emotional Management",
    "Module H2 : Patterns émotionnels": "Module H2: Emotional Patterns",
    "Module H3 : Ressources psychologiques": "Module H3: Psychological Resources",
    "Module I1 : Spiritualité & Croyances": "Module I1: Spirituality & Beliefs",
    "Module I2 : Quête de sens": "Module I2: Search for Meaning",
    "Module I3 : Transcendance": "Module I3: Transcendence"
}

TYPES_EN = {
    "Texte libre": "Free text",
    "Radio": "Single choice",
    "Checkbox (choix multiples)": "Multiple choice",
    "Likert 5 points (1 = Pas du tout → 5 = Totalement)": "Likert 5 points (1 = Not at all → 5 = Completely)",
    "Champ numérique (16-100)": "Numeric field (16-100)",
    "Likert 5 points pour chaque item": "Likert 5 points for each item",
    "Radio + option \"Autre\"": "Single choice + \"Other\" option",
    "Likert 5 points (Très difficiles → Très harmonieuses)": "Likert 5 points (Very difficult → Very harmonious)"
}

# Common option translations
COMMON_OPTIONS = {
    # Frequency
    "Très souvent": "Very often",
    "Souvent": "Often",
    "Parfois": "Sometimes",
    "Rarement": "Rarely",
    "Jamais": "Never",
    "Toujours": "Always",

    # Agreement
    "Totalement d'accord": "Strongly agree",
    "D'accord": "Agree",
    "Neutre": "Neutral",
    "Pas d'accord": "Disagree",
    "Pas du tout d'accord": "Strongly disagree",

    # Yes/No
    "Oui": "Yes",
    "Non": "No",
    "Je ne sais pas": "I don't know",
    "Peut-être": "Maybe",

    # Common
    "Préfère ne pas répondre": "Prefer not to answer",
    "Autre": "Other",
    "Autre - merci de préciser": "Other - please specify",
    "Optionnel": "Optional"
}

# Specific options by question context
SPECIFIC_OPTIONS = {
    # Living situations (Q6)
    "Vis seul·e": "Living alone",
    "En couple ou marié·e": "In a relationship or married",
    "Avec mes parents": "With my parents",
    "En colocation": "Shared housing",
    "Parent d'enfants à la maison": "Parent with children at home",
    "Aidant familial": "Family caregiver",
    "Autre configuration": "Other configuration",

    # Professional (Q7)
    "Salarié·e": "Employee",
    "Indépendant·e ou Freelance": "Independent or Freelance",
    "Entrepreneur·e": "Entrepreneur",
    "Étudiant·e": "Student",
    "En recherche d'emploi": "Job seeking",
    "En transition": "In transition",
    "Retraité·e": "Retired",
    "En pause ou congé": "On break or leave",

    # Geography (Q8)
    "Grande ville - plus de 200k habitants": "Large city - over 200k inhabitants",
    "Ville moyenne - 20 à 200k habitants": "Medium city - 20 to 200k inhabitants",
    "Petite ville - moins de 20k habitants": "Small town - under 20k inhabitants",
    "Zone rurale ou campagne": "Rural area or countryside",

    # Financial (Q9)
    "Vivre confortablement sans stress": "Live comfortably without stress",
    "Couvrir tes besoins avec quelques extras": "Cover your needs with some extras",
    "Couvrir tout juste tes besoins essentiels": "Just cover your essential needs",
    "Avoir parfois du mal à couvrir tes besoins": "Sometimes have difficulty covering your needs",
    "Être dans une situation financière très difficile": "Be in a very difficult financial situation",

    # Family origin (Q10)
    "Parents ensemble": "Parents together",
    "Parents séparés/divorcés": "Separated/divorced parents",
    "Famille monoparentale": "Single parent",
    "Famille recomposée": "Blended family",
    "Élevé·e par grands-parents/famille élargie": "Raised by grandparents/extended family",
    "Adoption/famille d'accueil": "Adoption/foster care",

    # Name origin (Q2)
    "Oui et je le connais bien": "Yes and I know it well",
    "J'en ai une idée générale": "I have a general idea",
    "Non je ne le connais pas": "No I don't know it",
    "Ça ne m'intéresse pas particulièrement": "It doesn't particularly interest me",

    # Nicknames (Q4)
    "J'ai des surnoms que j'aime beaucoup": "I have nicknames I really like",
    "J'ai des surnoms que je n'aime pas": "I have nicknames I don't like",
    "Je préfère qu'on m'appelle par mon prénom complet": "I prefer to be called by my full first name",
    "Les surnoms ne me font ni chaud ni froid": "Nicknames don't particularly affect me",
    "Je n'ai pas de surnom": "I don't have a nickname"
}

def translate_options(options_str: str) -> List[str]:
    """Translate comma-separated options using complete translation dictionary"""
    if not options_str or not isinstance(options_str, str):
        return []

    options_fr = [opt.strip() for opt in options_str.split(',')]
    options_en = []

    for opt_fr in options_fr:
        # Priority order: 1) Complete dict, 2) Specific, 3) Common
        if opt_fr in french_to_english:
            options_en.append(french_to_english[opt_fr])
        elif opt_fr in SPECIFIC_OPTIONS:
            options_en.append(SPECIFIC_OPTIONS[opt_fr])
        elif opt_fr in COMMON_OPTIONS:
            options_en.append(COMMON_OPTIONS[opt_fr])
        else:
            # Fallback: keep original if not found (should be rare now)
            print(f"⚠️  Untranslated option: {opt_fr}")
            options_en.append(opt_fr)

    return options_en

def translate_comment_label(comment_fr: str) -> str:
    """Translate comment label"""
    if not comment_fr:
        return None

    if comment_fr == "Optionnel":
        return "Optional"

    if comment_fr.startswith("Optionnel - "):
        rest = comment_fr[13:]
        # Translate common patterns
        translations = {
            "Partage l'origine de ton prénom si tu la connais": "Share the origin of your first name if you know it",
            "Explique pourquoi tu ressens cela vis-à-vis de ton prénom": "Explain why you feel this way about your first name",
            "Précise tes surnoms si tu le souhaites et ce qu'ils signifient pour toi": "Specify your nicknames if you wish and what they mean to you",
            "Décris ta situation familiale si tu le souhaites": "Describe your family situation if you wish",
            "Partage tes réflexions sur ce sujet": "Share your thoughts on this topic",
            "Ajoute des précisions si nécessaire": "Add details if necessary"
        }
        return "Optional - " + translations.get(rest, rest)

    return comment_fr

def main():
    """Main translation function"""

    # Load source
    source_file = Path(__file__).parent.parent / 'app' / 'data' / 'questions-index.json'
    print(f"📖 Loading from: {source_file}")

    with open(source_file, 'r', encoding='utf-8') as f:
        source_data = json.load(f)

    questions_fr = source_data.get('questions', [])
    print(f"✅ Loaded {len(questions_fr)} questions\n")

    # Process each question
    questions_en = []

    for i, q in enumerate(questions_fr, 1):
        print(f"Translating {i}/144: Q{q['number']}", end='\r')

        # Translate options
        options_en = []
        if q.get('options'):
            if isinstance(q['options'], str):
                options_en = translate_options(q['options'])
            elif isinstance(q['options'], list):
                options_en = q['options']  # Already list

        translated_q = {
            "number": q['number'],
            "text_en": translate_question_text(q['text'], q['number']),
            "bloc_en": BLOCS_EN.get(q['bloc'], q['bloc']),
            "module_en": MODULES_EN.get(q['module'], q['module']),
            "type_en": TYPES_EN.get(q['type'], q['type']),
            "options_en": options_en if options_en else None,
            "annotation_en": translate_annotation(q.get('annotation', ''), q['number']),
            "comment_label_en": translate_comment_label(q.get('commentaire_libre'))
        }

        questions_en.append(translated_q)

    print(f"\n✅ Translated all {len(questions_en)} questions\n")

    # Save output
    output = {
        "version": "1.0.0",
        "locale": "en",
        "total_questions": 144,
        "generated_at": "2026-01-27",
        "status": "Complete professional translation",
        "questions": questions_en
    }

    output_file = Path(__file__).parent.parent / 'app' / 'data' / 'questions-translations-en-complete.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"💾 Saved to: {output_file}")
    print(f"📊 Total: {len(questions_en)}/144 questions translated")

    return output

def translate_question_text(text_fr: str, number: int) -> str:
    """Translate question text - Complete dictionary"""

    # Complete translations for all 144 questions
    translations = {
        # BLOC A - CONTEXTE DE VIE (Q1-Q16)
        1: "Your full name (last name + first name(s))",
        2: "Do you know the origin or meaning of your first name?",
        3: "Do you feel in resonance with your first name?",
        4: "Do you have one or more nicknames that you particularly appreciate?",
        5: "What is your age?",
        6: "Your current living situation",
        7: "Your professional/studies situation",
        8: "Your geographical environment",
        9: "Your financial situation allows you to",
        10: "Your family of origin",
        11: "How would you describe your relationship with your family of origin?",
        12: "Do you know your cultural or ethnic origins?",
        13: "Do you feel connected to your cultural origins?",
        14: "What are your main aspirations for the next 2-3 years?",
        15: "What areas of your life would you like to improve or transform?",
        16: "What obstacles or challenges do you currently face?",

        # BLOC B - PERSONNALITÉ & FONCTIONNEMENT (Q17-Q40)
        17: "How would you describe your general energy level?",
        18: "You feel more energized by",
        19: "In a social situation, you tend to",
        20: "You make decisions primarily based on",
        21: "You prefer to approach tasks by",
        22: "Faced with the unexpected, you",
        23: "Which statement resonates most with you?",
        24: "In a conflict situation, you tend to",
        25: "Which of these words best describes you?",
        26: "What motivates you most in life?",
        27: "Which Jungian archetype resonates most with you?",
        28: "In your personal or professional life, you tend to embody the role of",
        29: "Faced with a challenge, your first instinct is to",
        30: "What nourishes you most in life?",
        31: "Your relationship with rules and structures",
        32: "Faced with routine, you",
        33: "In learning, you prefer",
        34: "Your relationship with time",
        35: "In organizing your space, you are rather",
        36: "How do you react to change?",
        37: "Your relationship with planning",
        38: "In daily life, you are rather",
        39: "When you start a project, you",
        40: "Regarding your commitments, you",

        # BLOC C - NEURODIVERGENCES & COGNITIF (Q41-Q56)
        41: "Have you been diagnosed with one or more neurodivergences?",
        42: "Do you identify yourself (even without diagnosis) as neurodivergent?",
        43: "If yes, which neurodivergence(s) do you identify with or have been diagnosed?",
        44: "How does your neurodivergence affect your daily life?",
        45: "What adaptations have you put in place?",
        46: "You feel misunderstood or different from others",
        47: "You have difficulty understanding implicit social codes",
        48: "You have intense or specific interests",
        49: "You are particularly sensitive to sensory stimuli (sounds, lights, textures)",
        50: "You often feel mentally exhausted after social interactions",
        51: "You have difficulty concentrating on tasks that don't interest you",
        52: "You tend to hyperfocus on certain subjects or activities",
        53: "You need strict routines to function well",
        54: "You have difficulty managing multiple tasks simultaneously",
        55: "You are very sensitive to injustice or inconsistencies",
        56: "You often feel overwhelmed by your emotions",

        # BLOC D - VALEURS & PHILOSOPHIE (Q57-Q72)
        57: "Which of these values is most important to you?",
        58: "What life principle guides your decisions the most?",
        59: "For you, a successful life is one that",
        60: "Regarding work, you think",
        61: "Regarding money, you believe",
        62: "Your relationship with nature and environment",
        63: "You think that human beings are fundamentally",
        64: "Your vision of society",
        65: "Regarding traditions and conventions",
        66: "Your relationship with authority",
        67: "For you, personal freedom means primarily",
        68: "Regarding collective good vs individual good",
        69: "What is your position on major contemporary issues?",
        70: "Your relationship with activism and social engagement",
        71: "Regarding cultural and ideological diversity",
        72: "Your vision of humanity's future",

        # BLOC E - RELATIONS & SOCIAL (Q73-Q92)
        73: "Your ideal social circle includes",
        74: "In friendships, you value most",
        75: "You feel most comfortable in",
        76: "In a conversation, you prefer",
        77: "After a social interaction, you",
        78: "In romantic relationships, you need primarily",
        79: "Your relationship with solitude",
        80: "You communicate best through",
        81: "Faced with emotional conflict, you",
        82: "You feel understood by others",
        83: "It's easy for you to create new social connections",
        84: "You prefer deep conversations over superficial exchanges",
        85: "You easily sense others' emotions and moods",
        86: "You tend to take on others' emotions",
        87: "You need a lot of personal space in relationships",
        88: "You find it easy to express your emotions verbally",
        89: "You are comfortable with physical displays of affection",
        90: "You easily trust others",
        91: "You tend to prioritize others' needs over your own",
        92: "You feel comfortable in leadership positions",

        # BLOC F - TRAVAIL & PROFESSIONNEL (Q93-Q108)
        93: "In your professional life, you seek primarily",
        94: "Your ideal work environment is",
        95: "Regarding remote work vs office",
        96: "You are motivated by",
        97: "Your relationship with professional hierarchy",
        98: "In managing your time at work, you",
        99: "You prefer work that is",
        100: "Regarding professional collaboration",
        101: "You feel accomplished when",
        102: "Your relationship with professional ambition",
        103: "Faced with constructive criticism at work, you",
        104: "Your relationship with work-life balance",
        105: "Do you have professional or entrepreneurial projects?",
        106: "What skills would you like to develop?",
        107: "What type of professional environment allows you to thrive?",
        108: "What frustrates or blocks you most in your professional life?",

        # BLOC G - SANTÉ & BIEN-ÊTRE (Q109-Q120)
        109: "How would you rate your current physical health?",
        110: "How would you rate your current mental wellbeing?",
        111: "You suffer from chronic conditions or recurring health issues",
        112: "If yes, what are your main health concerns?",
        113: "Your sleep quality is generally",
        114: "Your energy level during the day is",
        115: "You practice regular physical activity",
        116: "Your relationship with food is",
        117: "You use substances to manage stress (alcohol, tobacco, etc.)",
        118: "You have healthy lifestyle habits (sleep, diet, exercise)",
        119: "You take care of your mental health (therapy, meditation, etc.)",
        120: "What aspects of your health or wellbeing would you like to improve?",

        # BLOC H - EMOTIONS & PSYCHOLOGIE (Q121-Q132)
        121: "How would you describe your relationship with your emotions?",
        122: "You experience intense emotions",
        123: "It's easy for you to identify what you feel",
        124: "You express your emotions spontaneously",
        125: "You tend to repress or hide your emotions",
        126: "You are overwhelmed by your emotions regularly",
        127: "Faced with strong stress, you",
        128: "You have experienced traumatic events that still affect you today",
        129: "You tend toward anxiety or chronic worry",
        130: "You have already experienced episodes of depression or deep sadness",
        131: "What are your main emotional resources (what helps you feel better)?",
        132: "What psychological or emotional aspects would you like to strengthen?",

        # BLOC I - SPIRITUALITÉ & SENS (Q133-Q144)
        133: "Do you consider yourself a spiritual person?",
        134: "Do you practice a religion or spiritual tradition?",
        135: "If yes, which one(s)?",
        136: "You believe in",
        137: "You practice meditation, prayer, or contemplation",
        138: "You have already had spiritual or transcendent experiences",
        139: "For you, life's meaning comes primarily from",
        140: "You think there is something after death",
        141: "Your relationship with the sacred or mystery",
        142: "You feel connected to something larger than yourself",
        143: "Spirituality or the search for meaning plays an important role in your life",
        144: "What existential or spiritual questions are important to you?"
    }

    return translations.get(number, text_fr)

def translate_annotation(annotation_fr: str, number: int) -> str:
    """Translate annotation text - Complete dictionary"""

    if not annotation_fr:
        return ""

    # Complete annotations for all 144 questions
    annotations = {
        1: "Your name carries a history and energy. This information will be used for complete numerological and anthroponymic analysis of your identity",
        2: "Knowledge of your first name's origin can influence your relationship with your identity",
        3: "Your emotional connection with your first name and your identity",
        4: "How you are perceived by others through your nicknames",
        5: "This information helps contextualize your answers according to your life stage",
        6: "Your living environment influences your daily life and needs",
        7: "Multiple situations can coexist (e.g., employee + personal project)",
        8: "Your environment influences your social habits and lifestyle",
        9: "This information helps contextualize certain choices and potential stress",
        10: "Your family background often influences your relational patterns",
        11: "The quality of family relationships shapes many aspects of your life",
        12: "Cultural roots can play an important role in identity",
        13: "Connection to origins varies from person to person",
        14: "Your aspirations guide the path of your life",
        15: "Identifying areas to improve helps set priorities",
        16: "Understanding your obstacles is the first step to overcoming them",

        17: "Your base energy influences all aspects of your life",
        18: "Introversion/extraversion affects your needs and behaviors",
        19: "Your social comfort zone says a lot about your personality",
        20: "Thinking vs Feeling preference (MBTI)",
        21: "Judging vs Perceiving preference (MBTI)",
        22: "Your flexibility and stress management",
        23: "Your general relationship with life",
        24: "Your conflict resolution style",
        25: "Identifying with a quality helps understand your identity",
        26: "Core motivations reveal what drives you",
        27: "Jungian archetypes reveal deep psychological patterns",
        28: "The roles you naturally take in groups",
        29: "Your primary response to difficulty",
        30: "What regenerates and nourishes you deeply",

        31: "Your flexibility and relationship with imposed structures",
        32: "Your need for variety vs stability",
        33: "Your preferred learning style",
        34: "Your temporal perception and management",
        35: "Your relationship with order and organization",
        36: "Your adaptability and tolerance to change",
        37: "Your need for anticipation vs spontaneity",
        38: "Your level of methodical approach vs improvisation",
        39: "Your approach to starting projects",
        40: "Your reliability and perseverance",

        41: "Official diagnosis helps understand your specific needs",
        42: "Self-identification is valid even without formal diagnosis",
        43: "Types of neurodivergence shape your experience",
        44: "The daily impact of neurodivergence is important to understand",
        45: "Adaptations show your strategies and needs",
        46: "Frequency of feeling different or misunderstood",
        47: "Difficulty with social codes is common in autism spectrum",
        48: "Intense interests are characteristic of many neurodivergences",
        49: "Sensory sensitivities affect daily comfort",
        50: "Social exhaustion is common in neurodivergent people",
        51: "Attention selectivity can indicate ADHD or autism",
        52: "Hyperfocus is characteristic of ADHD and autism",
        53: "Need for routines is often linked to autism",
        54: "Difficulty multitasking can indicate executive function issues",
        55: "High sensitivity to injustice is common in gifted/HPI",
        56: "Emotional intensity can be linked to hypersensitivity",

        57: "Your core values guide all your choices",
        58: "Life principles shape your decisions and behaviors",
        59: "Your definition of success reveals your priorities",
        60: "Your relationship with work and its place in life",
        61: "Your relationship with money and material security",
        62: "Your connection to environment and ecology",
        63: "Your vision of human nature",
        64: "Your ideal of society and collective organization",
        65: "Your relationship with traditions and established norms",
        66: "Your attitude toward authority and hierarchy",
        67: "Your definition of personal freedom",
        68: "Your balance between individual and collective",
        69: "Your positions on contemporary social issues",
        70: "Your level of social and political engagement",
        71: "Your openness to cultural and ideological diversity",
        72: "Your vision of humanity's future and evolution",

        73: "Your ideal social circle size and composition",
        74: "What you value most in friendship",
        75: "Your preferred social contexts",
        76: "Your communication style and preferences",
        77: "Your need for recovery after social interaction",
        78: "Your main needs in romantic relationships",
        79: "Your relationship with solitude and need for alone time",
        80: "Your preferred communication channels",
        81: "Your conflict management style",
        82: "Your feeling of being understood by others",
        83: "Your ease in creating new connections",
        84: "Your preference for conversation depth",
        85: "Your level of empathy and emotional sensitivity",
        86: "Your emotional boundaries and absorption tendency",
        87: "Your need for personal space in relationships",
        88: "Your ease with verbal emotional expression",
        89: "Your comfort with physical affection",
        90: "Your level of trust in others",
        91: "Your balance between self and others",
        92: "Your comfort in leadership or responsibility positions",

        93: "Your main professional motivations",
        94: "Your ideal work environment characteristics",
        95: "Your preference between remote and office work",
        96: "What drives you professionally",
        97: "Your relationship with professional hierarchy",
        98: "Your style of time and project management",
        99: "Your preference for varied or specialized work",
        100: "Your preference for individual or team work",
        101: "What gives you sense of professional accomplishment",
        102: "Your relationship with professional ambition and success",
        103: "Your reaction to professional criticism",
        104: "Your balance between professional and personal life",
        105: "Your current professional projects and ambitions",
        106: "Skills you want to develop",
        107: "Professional environment that allows you to thrive",
        108: "Main professional frustrations or blocks",

        109: "Your subjective assessment of your physical health",
        110: "Your subjective assessment of your mental wellbeing",
        111: "Presence of chronic health issues",
        112: "Details of your main health concerns",
        113: "Your sleep quality assessment",
        114: "Your daytime energy assessment",
        115: "Your level of regular physical activity",
        116: "Your relationship with food and eating",
        117: "Use of substances to manage stress",
        118: "Your healthy lifestyle habits",
        119: "Your attention to mental health",
        120: "Health or wellbeing aspects to improve",

        121: "Your general relationship with your emotions",
        122: "Frequency and intensity of your emotions",
        123: "Your emotional awareness and identification",
        124: "Your spontaneity in emotional expression",
        125: "Your tendency to repress or hide emotions",
        126: "Frequency of being overwhelmed by emotions",
        127: "Your stress and crisis management strategies",
        128: "Impact of past traumatic experiences",
        129: "Tendency toward anxiety or chronic worry",
        130: "History of depression or prolonged sadness",
        131: "Your main emotional resources and coping strategies",
        132: "Psychological or emotional aspects to strengthen",

        133: "Your identification as a spiritual person",
        134: "Practice of religion or spiritual tradition",
        135: "Specific religions or traditions practiced",
        136: "Your beliefs about the divine, energy, or spiritual reality",
        137: "Your practice of meditation, prayer, or contemplation",
        138: "Past spiritual or transcendent experiences",
        139: "Your primary source of life's meaning",
        140: "Your belief about what happens after death",
        141: "Your relationship with the sacred or mystery of existence",
        142: "Your sense of connection to something larger than yourself",
        143: "Importance of spirituality or search for meaning in your life",
        144: "Main existential or spiritual questions that matter to you"
    }

    return annotations.get(number, annotation_fr)

if __name__ == "__main__":
    print("🌍 Complete Translation Script - 144 Questions EN\n")
    print("=" * 60)
    result = main()
    print("=" * 60)
    print("\n✅ Translation complete! Ready for database import.\n")
