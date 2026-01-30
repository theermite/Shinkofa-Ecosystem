"""
Name Holistic Analysis Service
Shinkofa Platform - Shizen AI

Provides comprehensive name analysis across 3 dimensions:
1. Etymology (linguistic origin, historical meaning)
2. Anthroponymy (cultural patterns, social symbolism, archetypes)
3. Energetic Weight (vibrational analysis, phonetic resonance, harmony)

Integrates NameEtymologyService + LLM-powered cultural and energetic analysis
"""
import logging
from typing import Dict, Any, Optional
import asyncio

from app.services.name_etymology_service import get_name_etymology_service
from app.services.hybrid_llm_service import HybridLLMService

logger = logging.getLogger(__name__)


class NameHolisticAnalysisService:
    """
    Holistic name analysis service

    Orchestrates etymology, anthroponymy, and energetic weight analysis
    to provide comprehensive understanding of a person's name
    """

    def __init__(self):
        """Initialize Name Holistic Analysis service"""
        self.etymology_service = get_name_etymology_service()
        self.llm = HybridLLMService()
        logger.info("🌟 Name Holistic Analysis Service initialized")

    async def analyze_anthroponymy(
        self,
        first_name: str,
        last_name: str,
    ) -> str:
        """
        Generate anthroponymic analysis (cultural and social study of names)

        Analyzes:
        - Cultural patterns and identity
        - Social symbolism and perceptions
        - Historical/mythological archetypes
        - International variations

        Args:
            first_name: The first name to analyze
            last_name: The last name to analyze

        Returns:
            Detailed anthroponymic analysis (4-6 sentences)
        """
        try:
            system_prompt = """Tu es un expert en anthroponomie (étude scientifique des noms propres).
Ton rôle est d'analyser la dimension culturelle, sociale et symbolique des noms.

INSTRUCTIONS:
- Identifie les patterns culturels et l'identité associée au nom
- Explique la symbolique sociale (connotations, perceptions, valeurs véhiculées)
- Mentionne les archétypes historiques, mythologiques ou figures emblématiques portant ce nom
- Indique les variations internationales pertinentes et leur signification
- Analyse comment le nom reflète ou influence l'identité sociale
- Fournis 4 à 6 phrases détaillées selon la richesse du nom
- Ton ton est analytique, érudit mais accessible"""

            user_prompt = f"""Analyse anthroponymique complète de : {first_name} {last_name}

Fournis une analyse détaillée incluant :
1. Patterns culturels et construction identitaire associée au nom
2. Symbolique sociale (perceptions, connotations, valeurs)
3. Archétypes emblématiques (figures historiques, mythologiques, personnalités célèbres)
4. Variations internationales et leur signification culturelle
5. Impact du nom sur l'identité sociale

Format: 4 à 6 phrases riches et détaillées."""

            analysis = await self.llm.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.4,  # Factual but allows cultural interpretation
                max_tokens=500,
            )

            logger.info(f"✅ Anthroponymic analysis generated for: {first_name} {last_name}")
            return analysis.strip()

        except Exception as e:
            logger.error(f"❌ Anthroponymic analysis failed for '{first_name} {last_name}': {e}")
            # Fallback
            return f"L'analyse anthroponymique de '{first_name} {last_name}' n'est pas disponible pour le moment."

    async def analyze_energetic_weight(
        self,
        first_name: str,
        last_name: str,
        numerology_data: Dict[str, Any],
    ) -> str:
        """
        Generate energetic weight analysis (vibrational and phonetic analysis)

        Analyzes:
        - Global vibration (expression number interpretation)
        - Dominant letters (consonants vs vowels, master letters)
        - Phonetic resonance (sound, impact, energy)
        - First name - last name harmony

        Args:
            first_name: The first name to analyze
            last_name: The last name to analyze
            numerology_data: Dict containing:
                - expression: Expression number (full name)
                - active: Active number (first name)
                - hereditary: Hereditary number (last name)
                - soul_urge: Soul Urge number (vowels)
                - personality: Personality number (consonants)

        Returns:
            Detailed energetic weight analysis (4-6 sentences)
        """
        try:
            # Extract numerology data - handle both dict format and direct int format
            def get_num(data: Dict, key: str) -> int:
                """Extract number from numerology data, handling both formats"""
                val = data.get(key, 0)
                if isinstance(val, dict):
                    return val.get("number", 0)
                elif isinstance(val, (int, float)):
                    return int(val)
                return 0

            expression_num = get_num(numerology_data, "expression")
            active_num = get_num(numerology_data, "active")
            hereditary_num = get_num(numerology_data, "hereditary")
            soul_urge_num = get_num(numerology_data, "soul_urge")
            personality_num = get_num(numerology_data, "personality")

            system_prompt = """Tu es un expert en analyse vibratoire des noms (numérologie et phonétique énergétique).
Ton rôle est d'expliquer l'énergie, la vibration et la résonance d'un nom.

INSTRUCTIONS:
- Explique la vibration globale du nom (basée sur le nombre d'expression fourni)
- Analyse l'équilibre entre énergie vocale (voyelles/Élan spirituel) et énergie consonantique (consonnes/Personnalité)
- Décris la résonance phonétique (sonorité, rythme, impact énergétique)
- Évalue l'harmonie vibratoire entre prénom (actif) et nom de famille (héréditaire)
- Identifie les lettres maîtresses ou dominantes si pertinent
- Fournis 4 à 6 phrases évocatrices et détaillées
- Utilise un langage énergétique mais accessible, poétique mais précis"""

            user_prompt = f"""Analyse vibratoire complète de : {first_name} {last_name}

Données numérologie:
- Nombre d'Expression (nom complet): {expression_num}
- Nombre Actif (prénom): {active_num}
- Nombre Héréditaire (nom de famille): {hereditary_num}
- Élan Spirituel (voyelles): {soul_urge_num}
- Personnalité (consonnes): {personality_num}

Fournis une analyse détaillée incluant:
1. Vibration globale du nom (interprétation énergétique du nombre d'expression)
2. Équilibre vocale/consonantique et impact sur l'énergie personnelle
3. Résonance phonétique (sonorité, rythme, qualité vibratoire)
4. Harmonie prénom-nom (synergie ou tension entre nombre actif et héréditaire)
5. Lettres dominantes ou maîtresses si pertinent

Format: 4 à 6 phrases riches, évocatrices et précises."""

            analysis = await self.llm.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.6,  # More creative for energetic interpretation
                max_tokens=500,
            )

            logger.info(f"✅ Energetic weight analysis generated for: {first_name} {last_name}")
            return analysis.strip()

        except Exception as e:
            logger.error(f"❌ Energetic weight analysis failed for '{first_name} {last_name}': {e}")
            # Fallback
            return f"L'analyse du poids énergétique de '{first_name} {last_name}' n'est pas disponible pour le moment."

    async def analyze_full_name_holistic(
        self,
        first_name: str,
        last_name: str,
        numerology_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate complete holistic name analysis

        Orchestrates all three analysis dimensions:
        1. Etymology (via NameEtymologyService)
        2. Anthroponymy (cultural/social analysis)
        3. Energetic Weight (vibrational analysis)

        Args:
            first_name: The first name to analyze
            last_name: The last name to analyze
            numerology_data: Numerology data for energetic analysis

        Returns:
            Dictionary containing:
            {
                "etymology": {
                    "first_name": "...",
                    "last_name": "..."
                },
                "anthroponymy": "...",
                "energetic_weight": "..."
            }
        """
        try:
            logger.info(f"🌟 Starting holistic name analysis for: {first_name} {last_name}")

            # Run all analyses in parallel for performance
            etymology_task = self.etymology_service.analyze_full_name(first_name, last_name)
            anthroponymy_task = self.analyze_anthroponymy(first_name, last_name)
            energetic_task = self.analyze_energetic_weight(first_name, last_name, numerology_data)

            etymology_result, anthroponymy_result, energetic_result = await asyncio.gather(
                etymology_task,
                anthroponymy_task,
                energetic_task,
                return_exceptions=True,
            )

            # Handle potential exceptions
            if isinstance(etymology_result, Exception):
                logger.error(f"Etymology analysis failed: {etymology_result}")
                etymology_result = {
                    "first_name_analysis": f"Analyse étymologique du prénom '{first_name}' non disponible.",
                    "last_name_analysis": f"Analyse étymologique du nom '{last_name}' non disponible.",
                }

            if isinstance(anthroponymy_result, Exception):
                logger.error(f"Anthroponymy analysis failed: {anthroponymy_result}")
                anthroponymy_result = f"Analyse anthroponymique non disponible pour le moment."

            if isinstance(energetic_result, Exception):
                logger.error(f"Energetic weight analysis failed: {energetic_result}")
                energetic_result = f"Analyse du poids énergétique non disponible pour le moment."

            result = {
                "etymology": {
                    "first_name": etymology_result.get("first_name_analysis", ""),
                    "last_name": etymology_result.get("last_name_analysis", ""),
                },
                "anthroponymy": anthroponymy_result,
                "energetic_weight": energetic_result,
            }

            logger.info(f"✅ Holistic name analysis completed for: {first_name} {last_name}")
            return result

        except Exception as e:
            logger.error(f"❌ Holistic name analysis failed for '{first_name} {last_name}': {e}")
            # Fallback structure
            return {
                "etymology": {
                    "first_name": f"Analyse du prénom '{first_name}' non disponible.",
                    "last_name": f"Analyse du nom '{last_name}' non disponible.",
                },
                "anthroponymy": f"Analyse anthroponymique non disponible.",
                "energetic_weight": f"Analyse du poids énergétique non disponible.",
            }


# Singleton instance
_name_holistic_analysis_service: Optional[NameHolisticAnalysisService] = None


def get_name_holistic_analysis_service() -> NameHolisticAnalysisService:
    """Get or create Name Holistic Analysis service singleton"""
    global _name_holistic_analysis_service
    if _name_holistic_analysis_service is None:
        _name_holistic_analysis_service = NameHolisticAnalysisService()
    return _name_holistic_analysis_service
