"""
Psychological Analysis Service
Shinkofa Platform - Shizen AI

Analyzes questionnaire responses using Hybrid LLM (DeepSeek + Ollama fallback) to determine:
- MBTI type
- Big Five personality traits
- Enneagram type
- Love Languages
- PNL meta-programs
- PCM (Process Communication Model)
- VAKOG sensory preferences
- Neurodivergence patterns (ADD/ADHD, Autism, HPI, etc.)
- Shinkofa dimensions

Uses DeepSeek API (primary) with Ollama (fallback) for reliability
"""
from typing import Dict, List, Optional
import json
import logging
import re
import traceback

from app.services.hybrid_llm_service import get_hybrid_llm_service

logger = logging.getLogger(__name__)


class PsychologicalAnalysisService:
    """
    Psychological analysis service using Hybrid LLM

    Analyzes questionnaire responses to generate complete psychological profile
    Uses DeepSeek API (primary) with automatic fallback to Ollama
    """

    def __init__(self):
        """Initialize Psychological Analysis service"""
        self.llm = get_hybrid_llm_service()
        logger.info("🧠 Psychological Analysis Service initialized (Hybrid LLM)")

    async def analyze_mbti(self, responses: List[Dict]) -> Dict:
        """
        Analyze MBTI (Myers-Briggs Type Indicator) from responses

        Returns:
            {
                "type": "INTJ",
                "scores": {"E_I": -60, "S_N": 40, "T_F": 30, "J_P": -20},
                "description": "...",
                "strengths": [...],
                "challenges": [...]
            }
        """
        prompt = self._build_mbti_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("mbti"),
                temperature=0.3,  # Lower temperature for more consistent analysis
            )

            # Parse JSON response from LLM
            mbti_data = self._parse_json_response(result)
            logger.info(f"✅ MBTI analyzed: {mbti_data.get('type', 'Unknown')}")
            return mbti_data

        except Exception as e:
            logger.error(f"❌ MBTI analysis error: {e}")
            return self._get_fallback_mbti()

    async def analyze_big_five(self, responses: List[Dict]) -> Dict:
        """
        Analyze Big Five personality traits from responses

        Returns:
            {
                "openness": 85,
                "conscientiousness": 70,
                "extraversion": 40,
                "agreeableness": 75,
                "neuroticism": 55,
                "description": "..."
            }
        """
        prompt = self._build_big_five_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("big_five"),
                temperature=0.3,
            )

            big_five_data = self._parse_json_response(result)
            logger.info(f"✅ Big Five analyzed: O={big_five_data.get('openness')}, C={big_five_data.get('conscientiousness')}")
            return big_five_data

        except Exception as e:
            logger.error(f"❌ Big Five analysis error: {e}")
            return self._get_fallback_big_five()

    async def analyze_enneagram(self, responses: List[Dict]) -> Dict:
        """
        Analyze Enneagram type from responses

        Returns:
            {
                "type": 5,
                "wing": 4,
                "tritype": "531",
                "description": "...",
                "core_fear": "...",
                "core_desire": "..."
            }
        """
        prompt = self._build_enneagram_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("enneagram"),
                temperature=0.3,
            )

            enneagram_data = self._parse_json_response(result)
            logger.info(f"✅ Enneagram analyzed: Type {enneagram_data.get('type')}")
            return enneagram_data

        except Exception as e:
            logger.error(f"❌ Enneagram analysis error: {e}")
            return self._get_fallback_enneagram()

    async def analyze_neurodivergence(self, responses: List[Dict]) -> Dict:
        """
        Analyze neurodivergence patterns from responses

        Returns:
            {
                "adhd": {"score": 72, "profile": "inattention", "manifestations": [...], "strategies": [...]},
                "autism": {"score": 45, ...},
                "hpi": {"score": 85, ...},
                "multipotentiality": {"score": 70, ...},
                "hypersensitivity": {"score": 80, "types": ["emotional", "sensory"], ...},
                ...
            }
        """
        prompt = self._build_neurodivergence_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("neurodivergence"),
                temperature=0.3,
            )

            neuro_data = self._parse_json_response(result)
            logger.info(f"✅ Neurodivergence analyzed: ADHD={neuro_data.get('adhd', {}).get('score')}, HPI={neuro_data.get('hpi', {}).get('score')}")
            return neuro_data

        except Exception as e:
            logger.error(f"❌ Neurodivergence analysis error: {e}")
            return self._get_fallback_neurodivergence()

    async def analyze_pnl_meta_programs(self, responses: List[Dict]) -> Dict:
        """
        Analyze PNL (Programmation Neuro-Linguistique) meta-programs

        Returns:
            {
                "toward_away": "toward",  # Motivation: vers objectif vs éviter problème
                "internal_external": "internal",  # Référence: interne vs externe
                "options_procedures": "options",  # Préférence: options vs procédures
                "big_picture_details": "big_picture",  # Focus: vision globale vs détails
                "sameness_difference": "difference",  # Changement: stabilité vs nouveauté
                "proactive_reactive": "proactive",  # Action: proactif vs réactif
                ...
            }
        """
        prompt = self._build_pnl_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("pnl"),
                temperature=0.3,
            )

            pnl_data = self._parse_json_response(result)
            logger.info(f"✅ PNL meta-programs analyzed")
            return pnl_data

        except Exception as e:
            logger.error(f"❌ PNL analysis error: {e}")
            return self._get_fallback_pnl()

    async def analyze_pcm(self, responses: List[Dict]) -> Dict:
        """
        Analyze PCM (Process Communication Model)

        Returns:
            {
                "dominant_type": "persister",  # Empathique, Persévérant, Travaillomane, Rebelle, Promoteur, Rêveur
                "base_type": "empathique",
                "phase_type": "persister",
                "drivers": ["Sois parfait", "Fais plaisir", "Fais des efforts"],
                "communication_channels": {...},
                "stress_sequences": [...]
            }
        """
        prompt = self._build_pcm_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("pcm"),
                temperature=0.3,
            )

            pcm_data = self._parse_json_response(result)
            logger.info(f"✅ PCM analyzed: {pcm_data.get('dominant_type')}")
            return pcm_data

        except Exception as e:
            logger.error(f"❌ PCM analysis error: {e}")
            return self._get_fallback_pcm()

    async def analyze_vakog(self, responses: List[Dict]) -> Dict:
        """
        Analyze VAKOG (sensory preferences)

        Returns:
            {
                "dominant_channel": "visual",
                "scores": {
                    "visual": 85,
                    "auditory": 60,
                    "kinesthetic": 70,
                    "olfactory": 40,
                    "gustatory": 35
                },
                "learning_style": "...",
                "communication_preferences": [...]
            }
        """
        prompt = self._build_vakog_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("vakog"),
                temperature=0.3,
            )

            vakog_data = self._parse_json_response(result)
            logger.info(f"✅ VAKOG analyzed: dominant={vakog_data.get('dominant_channel')}")
            return vakog_data

        except Exception as e:
            logger.error(f"❌ VAKOG analysis error: {e}")
            return self._get_fallback_vakog()

    async def analyze_love_languages(self, responses: List[Dict]) -> Dict:
        """
        Analyze Love Languages (Gary Chapman)

        Returns:
            {
                "primary": "quality_time",
                "secondary": "words_of_affirmation",
                "scores": {
                    "words_of_affirmation": 75,
                    "quality_time": 90,
                    "receiving_gifts": 45,
                    "acts_of_service": 60,
                    "physical_touch": 70
                },
                "interpretation": "..."
            }
        """
        prompt = self._build_love_languages_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("love_languages"),
                temperature=0.3,
            )

            love_lang_data = self._parse_json_response(result)
            logger.info(f"✅ Love Languages analyzed: {love_lang_data.get('primary')}")
            return love_lang_data

        except Exception as e:
            logger.error(f"❌ Love Languages analysis error: {e}")
            return self._get_fallback_love_languages()

    async def analyze_shinkofa_dimensions(self, responses: List[Dict]) -> Dict:
        """
        Analyze Shinkofa-specific dimensions from responses

        Returns:
            {
                "life_wheel": {"spiritual": 6, "mental": 8, "emotional": 5, ...},
                "archetypes": {"primary": "guide", "secondary": "creator", ...},
                "limiting_paradigms": ["Je ne suis pas assez...", ...],
                "inner_dialogue": {"child": 60, "warrior": 75, "guide": 85, "sage": 70}
            }
        """
        prompt = self._build_shinkofa_prompt(responses)

        try:
            result = await self.llm.generate(
                prompt=prompt,
                system=self._get_system_prompt("shinkofa"),
                temperature=0.3,
            )

            shinkofa_data = self._parse_json_response(result)
            logger.info(f"✅ Shinkofa dimensions analyzed")
            return shinkofa_data

        except Exception as e:
            logger.error(f"❌ Shinkofa analysis error: {e}")
            return self._get_fallback_shinkofa()

    async def generate_synthesis(
        self,
        psychological_profile: Dict,
        neurodivergence_profile: Dict,
        shinkofa_profile: Dict,
        design_human: Dict,
        astrology: Dict,
        numerology: Dict,
        full_name: str = "Unknown",
        current_situation: Dict = None,
        spiritual_abilities: Dict = None,
    ) -> str:
        """
        Generate comprehensive synthesis of all analyses (V5.0)

        Args:
            psychological_profile: MBTI, Big Five, Enneagram, etc.
            neurodivergence_profile: ADHD, Autism, HPI, etc.
            shinkofa_profile: Life wheel, archetypes, etc.
            design_human: Human Design chart
            astrology: Astrology chart
            numerology: Numerology chart (includes name analysis)
            full_name: Full name for personalization
            current_situation: Current challenges, aspirations, obstacles (V5.0)
            spiritual_abilities: Spiritual experiences, intuitive perceptions (V5.0)

        Returns:
            Long-form text synthesis (markdown formatted)

        V5.0 Changes:
            - Explicit "Points Non Détectés" section
            - Cross-analysis synthesis (not just listing)
            - Name analysis integration
            - Current situation + personalized coaching
            - Increased timeout and max_tokens
        """
        # Build comprehensive data summary
        mbti_type = psychological_profile.get('mbti', {}).get('type', 'Non déterminé')
        big_five = psychological_profile.get('big_five', {})
        enneagram = psychological_profile.get('enneagram', {})
        pnl = psychological_profile.get('pnl', {})
        pcm = psychological_profile.get('pcm', {})
        vakog = psychological_profile.get('vakog', {})
        love_languages = psychological_profile.get('love_languages', {})

        # Neurodivergence scores
        adhd_score = neurodivergence_profile.get('adhd', {}).get('score', 0)
        autism_score = neurodivergence_profile.get('autism', {}).get('score', 0)
        hpi_score = neurodivergence_profile.get('hpi', {}).get('score', 0)
        multipotential_score = neurodivergence_profile.get('multipotentiality', {}).get('score', 0)
        hypersensitivity_score = neurodivergence_profile.get('hypersensitivity', {}).get('score', 0)
        toc_score = neurodivergence_profile.get('toc', {}).get('score', 0)
        dys_score = neurodivergence_profile.get('dys', {}).get('score', 0)
        anxiety_score = neurodivergence_profile.get('anxiety', {}).get('score', 0)
        bipolar_score = neurodivergence_profile.get('bipolar', {}).get('score', 0)
        ptsd_score = neurodivergence_profile.get('ptsd', {}).get('score', 0)
        eating_disorder_score = neurodivergence_profile.get('eating_disorder', {}).get('score', 0)
        sleep_disorder_score = neurodivergence_profile.get('sleep_disorder', {}).get('score', 0)

        # Extract current situation (V5.0)
        challenges = current_situation.get('challenges', []) if current_situation else []
        obstacles = current_situation.get('obstacles', []) if current_situation else []
        aspirations = current_situation.get('aspirations', []) if current_situation else []
        satisfaction = current_situation.get('satisfaction_level', 'Non renseigné') if current_situation else 'Non renseigné'
        raw_comments = current_situation.get('raw_comments', []) if current_situation else []

        # Extract spiritual abilities (V5.0)
        unusual_experiences = spiritual_abilities.get('unusual_experiences', []) if spiritual_abilities else []
        daily_perceptions = spiritual_abilities.get('daily_perceptions', []) if spiritual_abilities else []
        energy_practices = spiritual_abilities.get('energy_practices', []) if spiritual_abilities else []
        resonating_abilities = spiritual_abilities.get('resonating_abilities', []) if spiritual_abilities else []
        spiritual_comments = spiritual_abilities.get('raw_comments', []) if spiritual_abilities else []

        prompt = f"""Tu es Shizen, coach holistique expert de La Voie Shinkofa. Génère une synthèse HOLISTIQUE COMPLÈTE et PERSONNALISÉE pour {full_name}.

📊 **MÉTHODOLOGIE V5.0 ANTI-BIAIS** :
- Analyse basée sur comportements concrets (pas auto-catégorisation)
- Commentaires libres narratifs priorisés sur cases cochées
- Vision intégrative croisant TOUS les systèmes
- **NOUVEAU V5.0** : Coaching personnalisé basé sur situation actuelle

═══════════════════════════════════════════════════════════════

## 📋 DONNÉES BRUTES COMPLÈTES

### 📍 SITUATION ACTUELLE (Module A3)

**Défis principaux identifiés** :
{self._format_list(challenges) if challenges else "- Aucun défi spécifique mentionné"}

**Obstacles aux objectifs** :
{self._format_list(obstacles) if obstacles else "- Aucun obstacle spécifique mentionné"}

**Aspirations 12 prochains mois** :
{self._format_list(aspirations) if aspirations else "- Aucune aspiration spécifique mentionnée"}

**Niveau de satisfaction globale** : {satisfaction}/10

**Commentaires libres contextuels** :
{self._format_comments(raw_comments) if raw_comments else "Aucun commentaire additionnel"}

---

### ✨ CAPACITÉS SPIRITUELLES & ÉNERGÉTIQUES (Module H3)

**Expériences inhabituelles vécues** :
{self._format_list(unusual_experiences) if unusual_experiences else "- Aucune expérience inhabituelle rapportée"}

**Perceptions quotidiennes** :
{self._format_list(daily_perceptions) if daily_perceptions else "- Aucune perception particulière"}

**Rapport aux pratiques énergétiques** :
{self._format_list(energy_practices) if energy_practices else "- Pas de pratique énergétique"}

**Capacités qui résonnent** :
{self._format_list(resonating_abilities) if resonating_abilities else "- Aucune capacité identifiée"}

**Commentaires libres spirituels** :
{self._format_comments(spiritual_comments) if spiritual_comments else "Aucun commentaire"}

---

### 🧠 PROFIL PSYCHOLOGIQUE

**MBTI** : {mbti_type}
- Scores dimensionnels : {psychological_profile.get('mbti', {}).get('scores', {})}
- Description : {psychological_profile.get('mbti', {}).get('description', '')}

**BIG FIVE (OCEAN)** :
- Ouverture : {big_five.get('openness', 0)}/100
- Conscience : {big_five.get('conscientiousness', 0)}/100
- Extraversion : {big_five.get('extraversion', 0)}/100
- Agréabilité : {big_five.get('agreeableness', 0)}/100
- Neuroticisme : {big_five.get('neuroticism', 0)}/100
- Description : {big_five.get('description', '')}

**ENNÉAGRAMME** :
- Type : {enneagram.get('type', 'Non déterminé')} (aile {enneagram.get('wing', '')})
- Tritype : {enneagram.get('tritype', '')}
- Peur centrale : {enneagram.get('core_fear', '')}
- Désir central : {enneagram.get('core_desire', '')}

**PNL (Méta-programmes)** : {pnl}
**PCM (Process Communication)** : {pcm}
**VAKOG (Canaux sensoriels)** : Dominant {vakog.get('dominant_channel', '')} - Scores: {vakog.get('scores', {})}
**LANGAGES D'AMOUR** : Primaire {love_languages.get('primary', '')}, Secondaire {love_languages.get('secondary', '')}

---

### 🧬 NEURODIVERGENCES (Scores 0-100)

**DÉTECTÉ** (scores > 50) :
{self._format_detected_neurodiv(neurodivergence_profile)}

**NON DÉTECTÉ** (scores ≤ 50) :
- TDA(H) : {adhd_score}/100 {"✅ Pas de TDA(H) détecté" if adhd_score <= 50 else ""}
- Autisme : {autism_score}/100 {"✅ Pas de TSA détecté" if autism_score <= 50 else ""}
- HPI : {hpi_score}/100 {"✅ Pas de HPI détecté" if hpi_score <= 50 else ""}
- Multipotentialité : {multipotential_score}/100 {"✅ Pas de multipotentialité détectée" if multipotential_score <= 50 else ""}
- Hypersensibilité : {hypersensitivity_score}/100 {"✅ Pas d'hypersensibilité détectée" if hypersensitivity_score <= 50 else ""}
- TOC : {toc_score}/100 {"✅ Pas de TOC détecté" if toc_score <= 50 else ""}
- Troubles Dys- : {dys_score}/100 {"✅ Pas de troubles Dys- détectés" if dys_score <= 50 else ""}
- Anxiété généralisée : {anxiety_score}/100 {"✅ Pas d'anxiété généralisée détectée" if anxiety_score <= 50 else ""}
- Bipolarité : {bipolar_score}/100 {"✅ Pas de bipolarité détectée" if bipolar_score <= 50 else ""}
- SSPT : {ptsd_score}/100 {"✅ Pas de SSPT détecté" if ptsd_score <= 50 else ""}
- Troubles alimentaires : {eating_disorder_score}/100 {"✅ Pas de troubles alimentaires détectés" if eating_disorder_score <= 50 else ""}
- Troubles du sommeil : {sleep_disorder_score}/100 {"✅ Pas de troubles du sommeil détectés" if sleep_disorder_score <= 50 else ""}

---

### 🌟 DIMENSIONS SHINKOFA

**ROUE DE VIE (1-10)** : {shinkofa_profile.get('life_wheel', {})}

**ARCHÉTYPES PERSONNELS** :
- Primaire : {shinkofa_profile.get('archetypes', {}).get('primary', '')}
- Secondaire : {shinkofa_profile.get('archetypes', {}).get('secondary', '')}
- Contextes optimaux : {shinkofa_profile.get('archetypes', {}).get('optimal_contexts', [])}

**PARADIGMES LIMITANTS** : {shinkofa_profile.get('limiting_paradigms', [])}

**DIALOGUE INTÉRIEUR (4 voix)** : {shinkofa_profile.get('inner_dialogue', {})}

---

### 🔮 DESIGN HUMAIN

- **Type** : {design_human.get('type', 'Non déterminé')}
- **Autorité** : {design_human.get('authority', 'Non déterminée')}
- **Profil** : {design_human.get('profile', 'Non déterminé')}
- **Stratégie** : {design_human.get('strategy', '')}
- **Définition** : {design_human.get('definition', '')}
- **Centres définis** : {design_human.get('defined_centers', [])}
- **Portes activées** : {design_human.get('gates', [])}

---

### ✨ ASTROLOGIE OCCIDENTALE

**Trio Soleil-Lune-Ascendant (identité fondamentale)** :
- **Soleil en {astrology.get('sun_sign', 'inconnu').title()}** : Énergie vitale, identité consciente, expression de soi
- **Lune en {astrology.get('moon_sign', 'inconnu').title()}** : Monde émotionnel, besoins instinctifs, sécurité intérieure
- **Ascendant {astrology.get('ascendant', 'inconnu').title()}** : Masque social, première impression, approche de la vie

**Élément dominant** : {astrology.get('dominant_element', 'inconnu').title()}
- Feu : Action, passion, initiative
- Terre : Stabilité, pragmatisme, ancrage
- Air : Communication, mental, relations
- Eau : Émotions, intuition, sensibilité

**Modalité dominante** : {astrology.get('dominant_modality', 'inconnu').title()}
- Cardinal : Initiative, leadership, démarrage
- Fixe : Persévérance, stabilité, concentration
- Mutable : Adaptabilité, flexibilité, changement

**Planètes détaillées** : {astrology.get('planets', [])}
**Aspects majeurs** : {astrology.get('aspects', [])}
**Forme du thème** : {astrology.get('chart_shape', 'non déterminé')}
**Emphase hémisphère** : {astrology.get('hemisphere_emphasis', {})}

---

### 🐉 ASTROLOGIE CHINOISE

{self._format_chinese_astrology(astrology.get('chinese', {}))}

---

### 🔢 NUMÉROLOGIE

- **Chemin de vie** : {numerology.get('life_path', '')}
- **Expression** : {numerology.get('expression', '')}
- **Nombre intime** : {numerology.get('soul_urge', '')}
- **Nombre de réalisation** : {numerology.get('personality', '')}
- **Analyse du prénom** : {numerology.get('first_name_analysis', 'Non disponible')}
- **Analyse du nom** : {numerology.get('last_name_analysis', 'Non disponible')}

═══════════════════════════════════════════════════════════════

## 📝 CONSIGNES SYNTHÈSE HOLISTIQUE CROISÉE

**OBJECTIF** : Créer une synthèse narrative INTÉGRÉE qui CROISE tous les systèmes pour révéler l'individualité unique de {full_name}.

**STRUCTURE OBLIGATOIRE** :

### 1. Introduction Personnalisée (150 mots)
- Qui est {full_name} en une phrase synthétique croisant Design Humain + MBTI + Ennéagramme
- **Analyse profonde du prénom** : Étymologie (origine linguistique), signification historique, poids énergétique (consonances, vibration)
- **Résonance prénom/identité** : Intégrer la réponse sur résonance avec prénom (Module A0)
- Nombre d'expression numérologique
- Thème astrologique central

### 1b. Votre Nom & Votre Essence (200 mots) - **V5.0 NOUVEAU**
- **Étymologie complète** : Origine et signification de "{full_name}"
- **Anthroponymie** : Fréquence, répartition culturelle/géographique du prénom
- **Poids énergétique** : Analyse des sonorités (voyelles/consonnes), vibration phonétique
- **Archétypes liés** : Mythes, figures historiques, symbolisme du prénom
- **Personnalisation** : Si surnoms mentionnés (Module A0), analyser leur signification affective
- Croiser avec numérologie (nombre d'expression, chemin de vie)

### 2. Forces Principales (300 mots)
- 4-6 forces CROISÉES entre systèmes
- Exemple : "Ton MBTI INTJ + HPI + Design Humain Projecteur = vision stratégique exceptionnelle qui attend reconnaissance"
- Intégrer langages d'amour, VAKOK, archétypes Shinkofa
- Donner exemples concrets comportementaux

### 3. Défis & Zones d'Attention (300 mots)
- 4-6 défis CROISÉS entre systèmes
- Exemple : "Projecteur + Ennéagramme 5 + Introversion = risque épuisement si non-reconnaissance"
- Inclure paradigmes limitants Shinkofa
- **IMPORTANT** : Mentionner explicitement ce qui N'est PAS présent ("Pas de TOC, pas de troubles Dys- détectés - tu as cette chance")

### 4. Stratégie Énergétique Optimale (250 mots)
- Basée sur Design Humain (stratégie Type + Autorité)
- Croisée avec neurodivergences détectées
- Horaires optimaux selon astrologie + rythmes naturels
- Gestion fatigue/ressourcement selon sphères Shinkofa

### 4b. Capacités Spirituelles & Énergétiques (200 mots) - **V5.0 NOUVEAU**
- **Analyse des expériences rapportées** : Interpréter les expériences inhabituelles (Module H3)
- **Identification du clair-sens dominant** : Clairvoyance, clairaudience, clairsentience, claircognizance
- **Niveau de sensibilité énergétique** : Faible, modéré, élevé, très élevé
- **Capacités latentes/actives** : Ce qui est déjà présent vs potentiel à développer
- **Recommandations pratiques** : Protection énergétique, ancrage, développement capacités
- **Croiser avec profil** : Comment ton Design Humain + MBTI + neurodiv influence tes perceptions
- Ton neutre et validant (ni sur-valoriser ni minimiser)

### 4c. Portrait Astrologique Complet (300 mots) - **V5.0 NOUVEAU**

**ASTROLOGIE OCCIDENTALE** (150 mots) :
- **Analyse du trio fondamental** : Comment ton Soleil (identité), Lune (émotions), Ascendant (expression) créent ta personnalité unique
- **Élément dominant** : Impact sur ton tempérament et tes réactions naturelles
- **Modalité dominante** : Comment tu abordes les défis et le changement
- **Aspects majeurs** : Tensions et harmonies intérieures (carrés = défis à intégrer, trigones = talents naturels)
- **Synthèse pratique** : Périodes favorables, rythmes naturels, conseils timing

**ASTROLOGIE CHINOISE** (150 mots) :
- **Analyse de ton signe animal + élément** : Ce que signifie être un(e) [Élément] [Animal]
- **Influence Yin/Yang** : Énergie active ou réceptive et son impact sur ton approche
- **Forces du signe** : Talents naturels et atouts caractéristiques
- **Points de vigilance** : Défis typiques de ton signe à surveiller
- **Compatibilités relationnelles** : Types de personnes avec qui tu t'entends naturellement
- **Année en cours** : Comment l'année astrologique chinoise actuelle t'influence

**CROISER avec autres systèmes** : Liens entre ton signe astrologique et ton Design Humain/MBTI/Ennéagramme

### 5. Situation Actuelle & Coaching Personnalisé (400 mots) - **V5.0 NOUVEAU**
- **Analyse des défis identifiés** : Pour chaque défi, expliquer comment ton profil (MBTI + DH + neurodiv) peut l'aborder
- **Stratégies d'action concrètes** : 3-5 stratégies personnalisées selon profil holistique
- **Plan 90 jours** : Étapes prioritaires réalistes basées sur ton énergie/autorité DH
- **Points d'attention** : Ce qui pourrait saboter (paradigmes limitants Shinkofa) + comment éviter
- Ton empathique, encourageant, concret (exemples pratiques)

### 6. Recommandations Quotidiennes Concrètes (200 mots)
- 5-7 actions pratiques personnalisées
- Croiser Design Humain + VAKOG + PNL + Archétypes
- Format bullet actionnable

### 7. Message Inspirant de Conclusion (100 mots)
- Vision optimiste du potentiel unique
- Référence chemin de vie numérologique + aspirations mentionnées
- Citation Shinkofa personnalisée

**CONTRAINTES** :
- Longueur : 2200-2600 mots MINIMUM (inclut sections nom/prénom + astrologie + coaching V5.0)
- Format : Markdown avec ## headers, **gras**, listes
- Ton : Bienveillant, chaleureux, empathique, empowering, COACHING ACTIONNABLE
- Style : Narratif (pas liste sèche), exemples concrets
- Éviter : Jargon technique sans explication
- Intégrer : Prénom {full_name} naturellement dans le texte
- **NOUVEAU** : Analyse étymologique profonde du prénom (origine, signification, vibration)
- **NOUVEAU** : Section astrologie DÉVELOPPÉE avec interprétations (pas juste lister les placements)

**MÉTHODOLOGIE V5.0** :
- Priorité absolue aux patterns comportementaux observés
- Croiser minimum 3 systèmes par affirmation
- Justifier chaque déduction par données brutes ci-dessus
- Mentionner explicitement points NON détectés (important psychologiquement)
- **NOUVEAU** : Section coaching OBLIGATOIRE basée sur situation actuelle (défis, aspirations)
- **NOUVEAU** : Plan d'action 90 jours CONCRET et RÉALISTE selon profil énergétique

Génère la synthèse holistique complète MAINTENANT.
"""

        try:
            logger.info(f"🚀 Starting V5.0 holistic synthesis generation (prompt: {len(prompt)} chars)")
            logger.info(f"   Expected duration: 90-180 seconds (comprehensive cross-analysis)...")

            synthesis = await self.llm.generate(
                prompt=prompt,
                system="Tu es Shizen, coach holistique La Voie Shinkofa, expert Design Humain, neurodiversité, psychologie intégrative.",
                temperature=0.75,  # Slightly higher for creative cross-analysis
                max_tokens=6000,  # Increased for comprehensive synthesis (V5.0)
            )

            logger.info(f"✅ V5.0 Holistic synthesis generated ({len(synthesis)} characters)")
            return synthesis

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Synthesis generation error: {error_msg}")
            logger.error(f"   Full traceback:\n{traceback.format_exc()}")
            # Re-raise to trigger retry mechanism
            raise Exception(f"V5.0 Synthesis generation failed: {error_msg}")

    def _format_list(self, items: List[str]) -> str:
        """Format list of items as markdown bullet points"""
        if not items:
            return "- Aucun élément"
        return "\n".join([f"- {item}" for item in items])

    def _format_comments(self, comments: List[Dict]) -> str:
        """Format free-form comments with context"""
        if not comments:
            return "Aucun commentaire"
        formatted = []
        for comment in comments:
            formatted.append(f"- **{comment['question']}** : {comment['comment']}")
        return "\n".join(formatted)

    def _format_chinese_astrology(self, chinese: Dict) -> str:
        """Format Chinese Astrology data with interpretations"""
        if not chinese:
            return "Non disponible"

        animal = chinese.get('animal_sign', 'inconnu').title()
        element = chinese.get('element', 'inconnu').title()
        yin_yang = chinese.get('yin_yang', 'inconnu').title()
        traits = chinese.get('traits', [])
        compatible = chinese.get('compatible_signs', [])
        incompatible = chinese.get('incompatible_signs', [])

        # Element interpretations
        element_meanings = {
            'Wood': 'Croissance, créativité, flexibilité, compassion',
            'Fire': 'Passion, dynamisme, charisme, enthousiasme',
            'Earth': 'Stabilité, pragmatisme, loyauté, fiabilité',
            'Metal': 'Détermination, discipline, clarté, justice',
            'Water': 'Sagesse, intuition, adaptabilité, profondeur'
        }

        # Animal interpretations
        animal_meanings = {
            'Rat': 'Intelligence, adaptabilité, charme, débrouillardise',
            'Ox': 'Patience, fiabilité, force, détermination',
            'Tiger': 'Courage, confiance, compétitivité, charisme',
            'Rabbit': 'Gentillesse, élégance, compassion, sensibilité artistique',
            'Dragon': 'Pouvoir, ambition, chance, magnétisme',
            'Snake': 'Sagesse, intuition, mystère, élégance',
            'Horse': 'Énergie, indépendance, liberté, sociabilité',
            'Goat': 'Douceur, créativité, calme, bienveillance',
            'Monkey': 'Intelligence, curiosité, espièglerie, innovation',
            'Rooster': 'Confiance, travail acharné, ponctualité, honnêteté',
            'Dog': 'Loyauté, honnêteté, protection, fidélité',
            'Pig': 'Générosité, compassion, honnêteté, optimisme'
        }

        result = f"""**🐲 Signe animal : {element} {animal} ({yin_yang})**

**Signification de ton signe {animal}** :
{animal_meanings.get(animal, 'Qualités uniques et distinctives')}

**Influence de l'élément {element}** :
{element_meanings.get(element, 'Énergie particulière influençant ton caractère')}

**Polarité {yin_yang}** :
{"Yang = Énergie active, extravertie, initiative" if yin_yang.lower() == 'yang' else "Yin = Énergie réceptive, introspective, intuitive"}

**Traits caractéristiques** : {', '.join(traits) if traits else 'Selon ton signe'}

**Compatibilités** :
- ✅ Signes compatibles : {', '.join([s.title() for s in compatible]) if compatible else 'Non spécifié'}
- ⚠️ Signes à attention : {', '.join([s.title() for s in incompatible]) if incompatible else 'Non spécifié'}
"""
        return result

    def _format_detected_neurodiv(self, neuro_profile: Dict) -> str:
        """Format detected neurodivergences (score > 50) for synthesis prompt with prominent profile display"""
        detected = []
        threshold = 50

        # Score interpretation guide
        score_guide = {
            (51, 70): "Modéré",
            (71, 85): "Marqué",
            (86, 100): "Très marqué"
        }

        def get_intensity(score):
            for (low, high), label in score_guide.items():
                if low <= score <= high:
                    return label
            return "Modéré"

        for key, data in neuro_profile.items():
            if isinstance(data, dict):
                # Support both old format (score) and new format (score_global)
                score = data.get('score_global', data.get('score', 0))
                if score > threshold:
                    # Get profile label (new format) or profile (old format)
                    profile_label = data.get('profil_label', data.get('profile', 'Non spécifié'))
                    manifestations = data.get('manifestations_principales', data.get('manifestations', []))
                    strategies = data.get('strategies_adaptation', data.get('strategies', []))
                    dimensions = data.get('dimensions', {})
                    intensity = get_intensity(score)

                    # Build enhanced display
                    entry = f"""
**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**
### 🎯 {key.upper()} — Score : {score}/100 ({intensity})

**📌 TON PROFIL : {profile_label}**

"""
                    # Add dimensions if available
                    if dimensions:
                        entry += "**📊 Tes dimensions détaillées :**\n"
                        for dim_name, dim_score in dimensions.items():
                            bar = "█" * (dim_score // 10) + "░" * (10 - dim_score // 10)
                            entry += f"  • {dim_name.replace('_', ' ').title()} : {bar} {dim_score}/100\n"
                        entry += "\n"

                    if manifestations:
                        entry += "**🔍 Tes manifestations principales :**\n"
                        for m in manifestations[:4]:
                            entry += f"  • {m}\n"
                        entry += "\n"

                    if strategies:
                        entry += "**💡 Tes stratégies d'adaptation :**\n"
                        for s in strategies[:4]:
                            entry += f"  • {s}\n"

                    detected.append(entry)

        if detected:
            header = """
## 📊 INTERPRÉTATION DES SCORES

| Plage | Signification |
|-------|--------------|
| 51-70 | **Modéré** — Pattern identifiable, impact fonctionnel léger |
| 71-85 | **Marqué** — Pattern clair, impact fonctionnel modéré |
| 86-100 | **Très marqué** — Pattern dominant, impact significatif |

"""
            return header + "\n".join(detected)
        else:
            return "- Aucune neurodivergence significative détectée (scores ≤ 50)"

    # ===== HELPER METHODS =====

    def _build_mbti_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for MBTI analysis"""
        # Simplify responses for prompt
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer le type MBTI (Myers-Briggs Type Indicator).

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
1. Détermine les 4 dimensions MBTI :
   - E (Extraversion) vs I (Introversion)
   - S (Sensation) vs N (Intuition)
   - T (Thinking) vs F (Feeling)
   - J (Jugement) vs P (Perception)

2. Calcule un score pour chaque dimension (-100 à +100)

3. Retourne un JSON structuré **UNIQUEMENT** (pas de texte avant/après) :
{{
  "type": "INTJ",
  "scores": {{"E_I": -60, "S_N": 40, "T_F": 30, "J_P": -20}},
  "description": "Description courte du type",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "challenges": ["Défi 1", "Défi 2", "Défi 3"]
}}

IMPORTANT : Retourne UNIQUEMENT le JSON, sans aucun texte explicatif avant ou après.
"""

    def _build_big_five_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for Big Five analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer les Big Five (OCEAN).

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine les 5 traits (scores 0-100) :
- Openness (Ouverture) : Curiosité, créativité, ouverture d'esprit
- Conscientiousness (Conscience) : Organisation, discipline, fiabilité
- Extraversion : Sociabilité, énergie sociale
- Agreeableness (Agréabilité) : Empathie, coopération, altruisme
- Neuroticism (Neuroticisme) : Stabilité émotionnelle (score inversé)

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "openness": 85,
  "conscientiousness": 70,
  "extraversion": 40,
  "agreeableness": 75,
  "neuroticism": 55,
  "description": "Résumé profil en 2-3 phrases"
}}
"""

    def _build_enneagram_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for Enneagram analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer le type Ennéagramme.

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine :
- Type principal (1-9)
- Aile (wing)
- Tritype (3 chiffres)

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "type": 5,
  "wing": 4,
  "tritype": "531",
  "description": "Description courte",
  "core_fear": "Peur centrale",
  "core_desire": "Désir central"
}}
"""

    def _build_neurodivergence_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for neurodivergence analysis with multi-dimensional scoring"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour identifier les patterns de neurodivergence.

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

═══════════════════════════════════════════════════════════════
## 📊 MÉTHODOLOGIE DE SCORING (CRITIQUE - À RESPECTER)

**PRINCIPE** : Chaque neurodivergence est évaluée sur PLUSIEURS DIMENSIONS indépendantes.
Le score global est une MOYENNE PONDÉRÉE des dimensions, PAS un chiffre arbitraire.

### GRILLE DE SCORING :
- **0-25** : Absent - Aucun indicateur significatif
- **26-50** : Léger - Quelques traits présents mais non prédominants
- **51-70** : Modéré - Pattern identifiable, impact fonctionnel léger
- **71-85** : Marqué - Pattern clair, impact fonctionnel modéré
- **86-100** : Très marqué - Pattern dominant, impact fonctionnel significatif

═══════════════════════════════════════════════════════════════
## 🧠 HPI (HAUT POTENTIEL INTELLECTUEL) - ANALYSE DÉTAILLÉE

**PROFILS HPI** (choisir le plus proche) :
- **Laminaire** : Homogène, analytique, stable, carrière académique linéaire
- **Complexe** : Hétérogène, intuitif, artistique, hypersensibilité sensorielle
- **Mixte** : Combinaison des deux profils

**DIMENSIONS À SCORER SÉPARÉMENT (0-100 chaque)** :
1. **Intellectuelle** : Rapidité cognitive, pensée arborescente, besoin stimulation mentale
2. **Émotionnelle** : Intensité émotionnelle, empathie exacerbée, réactivité émotionnelle
3. **Créative** : Pensée divergente, créativité, besoin d'innovation
4. **Sensorielle** : Hypersensibilité sensorielle (sons, lumières, textures)

**CALCUL SCORE GLOBAL** : (intellectuelle * 0.4) + (émotionnelle * 0.25) + (créative * 0.2) + (sensorielle * 0.15)

═══════════════════════════════════════════════════════════════
## 🎯 TDA(H) - ANALYSE DÉTAILLÉE

**PROFILS TDAH** (choisir le plus proche) :
- **Inattention prédominante** : Difficultés concentration, oublis, désorganisation
- **Hyperactivité-impulsivité** : Agitation motrice, impulsivité, impatience
- **Combiné** : Les deux aspects présents

**DIMENSIONS À SCORER** :
1. **Inattention** : Difficultés de concentration, distraction, oublis
2. **Hyperactivité** : Agitation motrice, besoin de bouger, impatience
3. **Impulsivité** : Réactions rapides, interruptions, décisions précipitées
4. **Dysrégulation émotionnelle** : Fluctuations émotionnelles, frustration rapide

═══════════════════════════════════════════════════════════════
## 🌈 AUTISME (TSA) - ANALYSE DÉTAILLÉE

**NIVEAUX** : Traits autistiques légers / Profil autistique modéré / TSA marqué

**DIMENSIONS À SCORER** :
1. **Communication sociale** : Difficulté implicite, conversation réciproque
2. **Interactions sociales** : Préférence solitude, malaise social, codes sociaux
3. **Intérêts restreints** : Passions intenses, expertise pointue
4. **Sensorialité** : Hyper/hypo-sensibilités sensorielles
5. **Routines** : Besoin prévisibilité, résistance au changement

═══════════════════════════════════════════════════════════════
## 🔄 TOC (TROUBLES OBSESSIONNELS COMPULSIFS)

**PROFILS** : TOC léger / TOC modéré / TOC sévère

**DIMENSIONS À SCORER** :
1. **Obsessions** : Pensées intrusives récurrentes, ruminations
2. **Compulsions** : Rituels, vérifications, comportements répétitifs
3. **Impact fonctionnel** : Temps consacré, interférence vie quotidienne

═══════════════════════════════════════════════════════════════
## 📚 TROUBLES DYS- (APPRENTISSAGE)

**TYPES** : Dyslexie / Dyscalculie / Dysorthographie / Dyspraxie / Dysphasie

**DIMENSIONS À SCORER** :
1. **Lecture/écriture** : Difficultés lecture, orthographe, expression écrite
2. **Calcul/logique** : Difficultés mathématiques, raisonnement séquentiel
3. **Coordination** : Difficultés motrices, organisation spatiale
4. **Langage oral** : Difficultés expression/compréhension orale

═══════════════════════════════════════════════════════════════
## 😰 ANXIÉTÉ GÉNÉRALISÉE

**NIVEAUX** : Anxiété légère / Anxiété modérée / Anxiété sévère

**DIMENSIONS À SCORER** :
1. **Inquiétude chronique** : Préoccupations excessives, anticipation négative
2. **Symptômes physiques** : Tension musculaire, fatigue, troubles sommeil
3. **Évitement** : Comportements d'évitement, procrastination anxieuse
4. **Impact social** : Interférence relations, travail, activités

═══════════════════════════════════════════════════════════════
## 🎭 BIPOLARITÉ (TROUBLES DE L'HUMEUR)

**NIVEAUX** : Cyclothymie / Bipolarité type II / Bipolarité type I

**DIMENSIONS À SCORER** :
1. **Épisodes hauts** : Périodes d'énergie excessive, euphorie, hyperactivité
2. **Épisodes bas** : Périodes de dépression, fatigue, perte d'intérêt
3. **Cyclicité** : Fréquence et prévisibilité des cycles
4. **Impulsivité** : Décisions impulsives, dépenses excessives

═══════════════════════════════════════════════════════════════
## 💔 PTSD / SSPT (STRESS POST-TRAUMATIQUE)

**NIVEAUX** : Stress post-traumatique léger / modéré / sévère

**DIMENSIONS À SCORER** :
1. **Reviviscences** : Flashbacks, cauchemars, souvenirs intrusifs
2. **Évitement** : Évitement situations, pensées, lieux rappelant trauma
3. **Hypervigilance** : Sursauts, difficultés concentration, irritabilité
4. **Altérations cognitives** : Croyances négatives, détachement émotionnel

═══════════════════════════════════════════════════════════════
## 🍽️ TROUBLES ALIMENTAIRES

**TYPES** : Anorexie / Boulimie / Hyperphagie / Orthorexie / ARFID

**DIMENSIONS À SCORER** :
1. **Relation à la nourriture** : Restrictions, compulsions, rituels alimentaires
2. **Image corporelle** : Préoccupation poids/apparence, dysmorphie
3. **Comportements compensatoires** : Purge, exercice excessif, jeûne
4. **Impact santé** : Conséquences physiques et émotionnelles

═══════════════════════════════════════════════════════════════
## 😴 TROUBLES DU SOMMEIL

**TYPES** : Insomnie / Hypersomnie / Apnée / Parasomnies / Décalage circadien

**DIMENSIONS À SCORER** :
1. **Endormissement** : Difficultés à s'endormir, temps d'endormissement
2. **Maintien du sommeil** : Réveils nocturnes, sommeil fragmenté
3. **Qualité récupératrice** : Fatigue au réveil, sensation de repos insuffisant
4. **Rythme circadien** : Décalage horaire, chronotype perturbé

═══════════════════════════════════════════════════════════════
## 📝 FORMAT DE RÉPONSE (JSON STRICT - TOUS LES 12 TYPES)

Retourne **UNIQUEMENT** ce JSON complet, sans texte avant/après :

{{
  "adhd": {{
    "score_global": 72,
    "profil": "inattention_predominante",
    "profil_label": "TDAH type Inattention prédominante",
    "dimensions": {{"inattention": 85, "hyperactivite": 45, "impulsivite": 60, "dysregulation_emotionnelle": 70}},
    "manifestations_principales": ["Difficulté concentration", "Oublis fréquents", "Désorganisation"],
    "strategies_adaptation": ["Listes et rappels", "Fractionner tâches", "Environnement calme"]
  }},
  "autism": {{
    "score_global": 45,
    "profil": "traits_legers",
    "profil_label": "Traits autistiques légers",
    "dimensions": {{"communication_sociale": 50, "interactions_sociales": 55, "interets_restreints": 40, "sensorialite": 35, "routines": 45}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "hpi": {{
    "score_global": 82,
    "profil": "complexe",
    "profil_label": "HPI Profil Complexe",
    "dimensions": {{"intellectuelle": 90, "emotionnelle": 85, "creative": 75, "sensorielle": 70}},
    "manifestations_principales": ["Pensée arborescente", "Besoin stimulation", "Intensité émotionnelle"],
    "strategies_adaptation": ["Projets complexes", "Temps récupération", "Canaliser créativité"]
  }},
  "multipotentiality": {{
    "score_global": 70,
    "profil_label": "Multipotentiel modéré",
    "manifestations_principales": ["Intérêts multiples", "Difficulté à choisir"],
    "strategies_adaptation": ["Portfolio career", "Rotation projets"]
  }},
  "hypersensitivity": {{
    "score_global": 80,
    "types": ["emotionnelle", "sensorielle"],
    "profil_label": "Hypersensibilité émotionnelle et sensorielle",
    "dimensions": {{"emotionnelle": 85, "sensorielle": 75}},
    "manifestations_principales": ["Réactions émotionnelles intenses", "Sensibilité ambiances"],
    "strategies_adaptation": ["Temps seul", "Environnement contrôlé"]
  }},
  "toc": {{
    "score_global": 25,
    "profil_label": "Pas de TOC significatif",
    "dimensions": {{"obsessions": 20, "compulsions": 25, "impact_fonctionnel": 15}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "dys": {{
    "score_global": 30,
    "profil_label": "Pas de trouble Dys- significatif",
    "types_detectes": [],
    "dimensions": {{"lecture_ecriture": 25, "calcul_logique": 35, "coordination": 30, "langage_oral": 25}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "anxiety": {{
    "score_global": 55,
    "profil": "legere",
    "profil_label": "Anxiété légère",
    "dimensions": {{"inquietude_chronique": 60, "symptomes_physiques": 50, "evitement": 45, "impact_social": 55}},
    "manifestations_principales": ["Tendance à l'anticipation négative"],
    "strategies_adaptation": ["Techniques de relaxation", "Restructuration cognitive"]
  }},
  "bipolar": {{
    "score_global": 20,
    "profil_label": "Pas de bipolarité détectée",
    "dimensions": {{"episodes_hauts": 15, "episodes_bas": 25, "cyclicite": 10, "impulsivite": 20}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "ptsd": {{
    "score_global": 15,
    "profil_label": "Pas de SSPT détecté",
    "dimensions": {{"reviviscences": 10, "evitement": 20, "hypervigilance": 15, "alterations_cognitives": 10}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "eating_disorder": {{
    "score_global": 25,
    "profil_label": "Pas de trouble alimentaire significatif",
    "types_detectes": [],
    "dimensions": {{"relation_nourriture": 30, "image_corporelle": 25, "comportements_compensatoires": 15, "impact_sante": 20}},
    "manifestations_principales": [],
    "strategies_adaptation": []
  }},
  "sleep_disorder": {{
    "score_global": 45,
    "profil": "leger",
    "profil_label": "Difficultés de sommeil légères",
    "types_detectes": ["insomnie_legere"],
    "dimensions": {{"endormissement": 50, "maintien_sommeil": 45, "qualite_recuperatrice": 40, "rythme_circadien": 35}},
    "manifestations_principales": ["Difficultés occasionnelles d'endormissement"],
    "strategies_adaptation": ["Hygiène de sommeil", "Routine coucher régulière"]
  }}
}}

**RAPPEL CRITIQUE** :
- TOUS les 12 types DOIVENT être présents dans la réponse
- Le score global DOIT refléter la moyenne pondérée des dimensions
- Score < 50 = "Pas de X détecté" avec profil_label approprié
- Justifie chaque score par les réponses concrètes du questionnaire
"""

    def _build_shinkofa_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for Shinkofa dimensions analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer les dimensions Shinkofa.

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine :
- Roue de vie (8 dimensions, scores 0-10)
- Archétypes dominants (Guide, Guerrier, Créateur, Sage, Amoureux, Rebelle, Magicien)
- Paradigmes limitants identifiés
- Dialogue intérieur (Enfant, Guerrier, Guide, Sage - % activation)

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "life_wheel": {{"spiritual": 6, "mental": 8, "emotional": 5, "physical": 7, "social": 6, "professional": 8, "creative": 7, "financial": 5}},
  "archetypes": {{"primary": "guide", "secondary": "creator", "tertiary": "warrior"}},
  "limiting_paradigms": ["Je ne suis pas assez...", "Je dois toujours..."],
  "inner_dialogue": {{"child": 60, "warrior": 75, "guide": 85, "sage": 70}}
}}
"""

    def _build_pnl_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for PNL meta-programs analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer les méta-programmes PNL.

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine les méta-programmes PNL principaux :
1. **Toward/Away** : Motivation vers objectif vs éviter problème
2. **Internal/External** : Référence interne vs validation externe
3. **Options/Procedures** : Préférence options/possibilités vs procédures/étapes
4. **Big Picture/Details** : Vision globale vs détails précis
5. **Sameness/Difference** : Recherche stabilité vs nouveauté/changement
6. **Proactive/Reactive** : Initiative proactive vs réaction aux événements
7. **Global/Specific** : Communication globale vs spécifique
8. **Match/Mismatch** : Recherche similarités vs différences

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "toward_away": "toward",
  "internal_external": "internal",
  "options_procedures": "options",
  "big_picture_details": "big_picture",
  "sameness_difference": "difference",
  "proactive_reactive": "proactive",
  "global_specific": "global",
  "match_mismatch": "match",
  "description": "Résumé profil PNL en 2-3 phrases"
}}
"""

    def _build_pcm_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for PCM analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer le profil PCM (Process Communication Model).

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine :
1. **Type dominant** : Empathique, Travaillomane, Persévérant, Rebelle, Rêveur, Promoteur
2. **Type de base** : Type en enfance
3. **Type de phase** : Type actuel
4. **Drivers** : Messages contraignants ("Sois parfait", "Fais plaisir", "Fais des efforts", "Sois fort", "Dépêche-toi")
5. **Canaux communication** : Préférés et à éviter

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "dominant_type": "persister",
  "base_type": "empathique",
  "phase_type": "persister",
  "drivers": ["Sois parfait", "Fais plaisir"],
  "communication_channels": {{"preferred": ["Interrogatif"], "avoid": ["Directif"]}},
  "stress_sequences": ["Driver → Masque → Cave"],
  "description": "Résumé profil PCM"
}}
"""

    def _build_vakog_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for VAKOG analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer les préférences sensorielles VAKOG.

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine les canaux sensoriels dominants :
- **Visual** : Préférence images, couleurs, schémas
- **Auditory** : Préférence sons, musique, conversations
- **Kinesthetic** : Préférence mouvement, sensations, toucher
- **Olfactory** : Préférence odeurs
- **Gustatory** : Préférence goûts

Scores : 0-100 pour chaque canal

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "dominant_channel": "visual",
  "scores": {{
    "visual": 85,
    "auditory": 60,
    "kinesthetic": 70,
    "olfactory": 40,
    "gustatory": 35
  }},
  "learning_style": "Apprenant visuel - schémas, cartes mentales, vidéos",
  "communication_preferences": ["Montre-moi", "Vois-tu ce que je veux dire", "Je vois"],
  "description": "Résumé profil VAKOG"
}}
"""

    def _build_love_languages_prompt(self, responses: List[Dict]) -> str:
        """Build prompt for Love Languages analysis"""
        responses_summary = self._summarize_responses(responses)

        return f"""Analyse les réponses suivantes pour déterminer les langages d'amour (Gary Chapman).

**RÉPONSES QUESTIONNAIRE** :
{responses_summary}

**CONSIGNES** :
Détermine les 5 langages d'amour :
1. **Words of Affirmation** : Mots valorisants, compliments, encouragements
2. **Quality Time** : Temps ensemble, attention pleine
3. **Receiving Gifts** : Cadeaux attentionnés, symboles d'affection
4. **Acts of Service** : Actions concrètes pour aider
5. **Physical Touch** : Contact physique, câlins, proximité

Scores : 0-100 pour chaque langage

Retourne un JSON structuré **UNIQUEMENT** :
{{
  "primary": "quality_time",
  "secondary": "words_of_affirmation",
  "scores": {{
    "words_of_affirmation": 75,
    "quality_time": 90,
    "receiving_gifts": 45,
    "acts_of_service": 60,
    "physical_touch": 70
  }},
  "interpretation": "Priorité temps de qualité, attention pleine. Apprécie aussi mots valorisants.",
  "description": "Résumé langages d'amour"
}}
"""

    def _summarize_responses(self, responses: List[Dict], max_length: int = 8000) -> str:
        """
        Summarize questionnaire responses for prompt (V5.0)

        Args:
            responses: List of response dictionaries
            max_length: Maximum character length for summary

        Returns:
            Formatted string summary with priority to free-form comments

        V5.0 Changes:
            - Extracts and prioritizes free-form comments from answer.comment
            - Comments have PRIORITY over checkbox/radio values for AI analysis
            - Increased max_length to 8000 to accommodate narrative context
        """
        summary_lines = []
        comment_count = 0

        for resp in responses[:70]:  # Increased from 50 to 70 to include more context
            bloc = resp.get("bloc", "?")
            question = resp.get("question_text", "")[:120]  # Increased from 100
            answer = resp.get("answer", {})

            # Format answer based on type (V5.0: handle AnswerValue structure)
            if isinstance(answer, dict):
                # V5.0: Extract value and comment separately
                value = answer.get("value")
                comment = answer.get("comment", "").strip()

                # Format value (checkbox/radio/likert/text/number)
                if isinstance(value, list):
                    # Checkbox: join selected options
                    value_str = ", ".join(str(v) for v in value[:3])  # Max 3 options displayed
                    if len(value) > 3:
                        value_str += f" (+{len(value)-3} autres)"
                elif isinstance(value, dict):
                    # Likert scale: show scores
                    value_str = ", ".join(f"{k}:{v}" for k, v in value.items())
                else:
                    # Radio, text, number
                    value_str = str(value)[:80] if value else ""

                # V5.0: PRIORITIZE COMMENT over value
                if comment:
                    # Comment present: show it prominently with value as context
                    comment_count += 1
                    summary_lines.append(
                        f"[{bloc}] {question[:100]}\n"
                        f"  → Réponse: {value_str[:60]}\n"
                        f"  💬 COMMENTAIRE (prioritaire): {comment[:300]}"
                    )
                else:
                    # No comment: show value only
                    summary_lines.append(f"[{bloc}] {question[:100]} → {value_str}")
            else:
                # Legacy format (not AnswerValue): just show the answer
                answer_str = str(answer)[:80]
                summary_lines.append(f"[{bloc}] {question[:100]} → {answer_str}")

        summary = "\n".join(summary_lines)

        # Add metadata header
        summary = f"""📊 MÉTHODOLOGIE V5.0 ANTI-BIAIS :
Les commentaires libres (💬) ont PRIORITÉ sur les cases cochées pour l'analyse.
{comment_count} commentaires narratifs enrichissent l'analyse.

═════════════════════════════════════════════════════════

{summary}"""

        # Truncate if too long (preserve priority comments at top)
        if len(summary) > max_length:
            summary = summary[:max_length] + "\n... (réponses tronquées - commentaires prioritaires conservés)"

        return summary

    def _get_system_prompt(self, analysis_type: str) -> str:
        """Get system prompt for specific analysis type (V5.0)"""
        # V5.0: Enhanced prompts with comment prioritization instructions
        base_instruction = """

MÉTHODOLOGIE V5.0 ANTI-BIAIS :
- Les commentaires libres (💬 COMMENTAIRE) ont PRIORITÉ absolue sur les cases cochées
- Privilégie les descriptions comportementales concrètes aux auto-évaluations
- Les récits narratifs révèlent plus que les réponses binaires
- Si conflit entre commentaire et case cochée → fais confiance au commentaire

Retourne UNIQUEMENT un JSON valide, sans texte explicatif avant/après."""

        prompts = {
            "mbti": f"Tu es un expert en psychologie MBTI. Analyse les réponses avec rigueur.{base_instruction}",
            "big_five": f"Tu es un expert en Big Five (OCEAN). Analyse les réponses avec rigueur.{base_instruction}",
            "enneagram": f"Tu es un expert en Ennéagramme. Analyse les réponses avec rigueur.{base_instruction}",
            "neurodivergence": f"Tu es un expert en neurodivergence (TDA(H), Autisme, HPI). Analyse les patterns avec bienveillance.{base_instruction}",
            "pnl": f"Tu es un expert en PNL (Programmation Neuro-Linguistique). Analyse les méta-programmes.{base_instruction}",
            "pcm": f"Tu es un expert en PCM (Process Communication Model). Analyse les types de personnalité.{base_instruction}",
            "vakog": f"Tu es un expert en systèmes sensoriels VAKOG. Analyse les préférences.{base_instruction}",
            "love_languages": f"Tu es un expert en langages d'amour (Gary Chapman). Analyse les préférences relationnelles.{base_instruction}",
            "shinkofa": f"Tu es un expert en philosophie Shinkofa. Analyse les réponses avec sagesse.{base_instruction}",
        }
        return prompts.get(analysis_type, f"Tu es un expert en analyse psychologique.{base_instruction}")

    def _parse_json_response(self, response: str) -> Dict:
        """
        Parse JSON from LLM response

        Handles cases where LLM adds extra text before/after JSON
        and common JSON formatting issues from LLMs
        """
        def clean_json(json_str: str) -> str:
            """Clean common LLM JSON mistakes"""
            # Remove markdown code blocks
            json_str = re.sub(r'```json\s*', '', json_str)
            json_str = re.sub(r'```\s*', '', json_str)
            # Remove trailing commas before } or ]
            json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
            # Remove control characters except whitespace
            json_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', json_str)
            return json_str.strip()

        try:
            # Try direct parse first
            return json.loads(response)
        except json.JSONDecodeError:
            pass

        # Try to extract JSON from response
        start = response.find("{")
        end = response.rfind("}") + 1

        if start != -1 and end > start:
            json_str = response[start:end]
            # Try with cleaning
            try:
                return json.loads(clean_json(json_str))
            except json.JSONDecodeError:
                pass

            # Try fixing common issues more aggressively
            try:
                # Replace single quotes with double quotes (risky but sometimes needed)
                fixed_json = json_str.replace("'", '"')
                return json.loads(clean_json(fixed_json))
            except json.JSONDecodeError:
                pass

        # Fallback
        logger.warning(f"⚠️ Could not parse JSON from response: {response[:200]}")
        return {}

    # ===== FALLBACK METHODS =====

    def _get_fallback_mbti(self) -> Dict:
        """Fallback MBTI if analysis fails"""
        return {
            "type": "XXXX",
            "scores": {"E_I": 0, "S_N": 0, "T_F": 0, "J_P": 0},
            "description": "Analyse MBTI indisponible",
            "strengths": [],
            "challenges": [],
        }

    def _get_fallback_big_five(self) -> Dict:
        """Fallback Big Five if analysis fails"""
        return {
            "openness": 50,
            "conscientiousness": 50,
            "extraversion": 50,
            "agreeableness": 50,
            "neuroticism": 50,
            "description": "Analyse Big Five indisponible",
        }

    def _get_fallback_enneagram(self) -> Dict:
        """Fallback Enneagram if analysis fails"""
        return {
            "type": 0,
            "wing": 0,
            "tritype": "000",
            "description": "Analyse Ennéagramme indisponible",
            "core_fear": "",
            "core_desire": "",
        }

    def _get_fallback_neurodivergence(self) -> Dict:
        """Fallback neurodivergence if analysis fails"""
        return {
            "adhd": {"score": 0, "profile": "", "manifestations": [], "strategies": []},
            "autism": {"score": 0, "profile": "", "manifestations": [], "strategies": []},
            "hpi": {"score": 0, "profile": "", "manifestations": [], "strategies": []},
            "multipotentiality": {"score": 0, "manifestations": []},
            "hypersensitivity": {"score": 0, "types": [], "manifestations": [], "strategies": []},
        }

    def _get_fallback_shinkofa(self) -> Dict:
        """Fallback Shinkofa if analysis fails"""
        return {
            "life_wheel": {},
            "archetypes": {},
            "limiting_paradigms": [],
            "inner_dialogue": {},
        }

    def _get_fallback_pnl(self) -> Dict:
        """Fallback PNL if analysis fails"""
        return {
            "toward_away": "unknown",
            "internal_external": "unknown",
            "options_procedures": "unknown",
            "big_picture_details": "unknown",
            "sameness_difference": "unknown",
            "proactive_reactive": "unknown",
            "global_specific": "unknown",
            "match_mismatch": "unknown",
            "description": "Analyse PNL indisponible",
        }

    def _get_fallback_pcm(self) -> Dict:
        """Fallback PCM if analysis fails"""
        return {
            "dominant_type": "unknown",
            "base_type": "unknown",
            "phase_type": "unknown",
            "drivers": [],
            "communication_channels": {},
            "stress_sequences": [],
            "description": "Analyse PCM indisponible",
        }

    def _get_fallback_vakog(self) -> Dict:
        """Fallback VAKOG if analysis fails"""
        return {
            "dominant_channel": "unknown",
            "scores": {
                "visual": 50,
                "auditory": 50,
                "kinesthetic": 50,
                "olfactory": 50,
                "gustatory": 50,
            },
            "learning_style": "Style d'apprentissage indéterminé",
            "communication_preferences": [],
            "description": "Analyse VAKOG indisponible",
        }

    def _get_fallback_love_languages(self) -> Dict:
        """Fallback Love Languages if analysis fails"""
        return {
            "primary": "unknown",
            "secondary": "unknown",
            "scores": {
                "words_of_affirmation": 50,
                "quality_time": 50,
                "receiving_gifts": 50,
                "acts_of_service": 50,
                "physical_touch": 50,
            },
            "interpretation": "Langages d'amour indéterminés",
            "description": "Analyse Love Languages indisponible",
        }


# Singleton instance
_psychological_service: Optional[PsychologicalAnalysisService] = None


def get_psychological_analysis_service() -> PsychologicalAnalysisService:
    """Get or create Psychological Analysis service singleton"""
    global _psychological_service
    if _psychological_service is None:
        _psychological_service = PsychologicalAnalysisService()
    return _psychological_service
