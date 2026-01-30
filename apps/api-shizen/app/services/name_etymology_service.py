"""
Name Etymology Analysis Service
Shinkofa Platform - Shizen AI

Generates etymological analysis for first names and last names using LLM
Provides origin, meaning, historical context, and cultural significance
"""
import logging
from typing import Dict, Optional
from app.services.hybrid_llm_service import HybridLLMService

logger = logging.getLogger(__name__)


class NameEtymologyService:
    """
    Name etymology analysis service using AI

    Generates comprehensive etymological analysis for first names and surnames
    """

    def __init__(self):
        """Initialize Name Etymology service"""
        self.llm = HybridLLMService()
        logger.info("📚 Name Etymology Service initialized")

    async def analyze_first_name(self, first_name: str) -> str:
        """
        Generate etymological analysis for a first name

        Args:
            first_name: The first name to analyze

        Returns:
            Detailed etymological analysis string

        Example:
            >>> analysis = await service.analyze_first_name("Marie")
            >>> print(analysis)
            "Marie vient de l'hébreu Myriam (מרים), signifiant 'celle qui élève'..."
        """
        try:
            system_prompt = """Tu es un expert en étymologie et onomastique (étude des noms propres).
Ton rôle est de fournir une analyse étymologique détaillée et précise des prénoms.

INSTRUCTIONS:
- Indique l'origine linguistique (hébreu, grec, latin, germanique, arabe, etc.)
- Explique la signification originelle
- Mentionne le contexte historique ou culturel si pertinent
- Sois précis et concis (2-3 phrases maximum)
- Ton ton est informatif mais accessible
- Si le prénom a plusieurs origines possibles, mentionne la plus courante
- NE mentionne PAS de numérologie ou vibrations - UNIQUEMENT l'étymologie historique"""

            user_prompt = f"""Analyse étymologique du prénom : {first_name}

Fournis une analyse étymologique complète incluant :
1. Origine linguistique (langue d'origine)
2. Signification originelle
3. Contexte historique ou culturel bref

Format: 2-3 phrases maximum, style informatif."""

            analysis = await self.llm.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.3,  # Low temperature for factual accuracy
                max_tokens=300,
            )

            logger.info(f"✅ Etymology analysis generated for first name: {first_name}")
            return analysis.strip()

        except Exception as e:
            logger.error(f"❌ Etymology analysis failed for '{first_name}': {e}")
            # Fallback: Return basic info
            return f"Prénom '{first_name}' - Analyse étymologique non disponible pour le moment."

    async def analyze_last_name(self, last_name: str) -> str:
        """
        Generate etymological analysis for a last name (surname)

        Args:
            last_name: The last name to analyze

        Returns:
            Detailed etymological analysis string

        Example:
            >>> analysis = await service.analyze_last_name("Dupont")
            >>> print(analysis)
            "Dupont est un nom d'origine toponymique française signifiant 'du pont'..."
        """
        try:
            system_prompt = """Tu es un expert en étymologie et onomastique, spécialisé dans les noms de famille.
Ton rôle est de fournir une analyse étymologique détaillée et précise des noms de famille.

INSTRUCTIONS:
- Indique la catégorie du nom : toponymique (lieu), patronymique (père), métier, sobriquet (surnom), etc.
- Explique l'origine et la signification
- Mentionne la région géographique d'origine si pertinent
- Sois précis et concis (2-3 phrases maximum)
- Ton ton est informatif mais accessible
- NE mentionne PAS de numérologie ou vibrations - UNIQUEMENT l'étymologie historique"""

            user_prompt = f"""Analyse étymologique du nom de famille : {last_name}

Fournis une analyse étymologique complète incluant :
1. Catégorie du nom (toponymique, patronymique, métier, sobriquet)
2. Origine et signification
3. Contexte géographique ou historique bref

Format: 2-3 phrases maximum, style informatif."""

            analysis = await self.llm.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.3,  # Low temperature for factual accuracy
                max_tokens=300,
            )

            logger.info(f"✅ Etymology analysis generated for last name: {last_name}")
            return analysis.strip()

        except Exception as e:
            logger.error(f"❌ Etymology analysis failed for '{last_name}': {e}")
            # Fallback: Return basic info
            return f"Nom '{last_name}' - Analyse étymologique non disponible pour le moment."

    async def analyze_full_name(self, first_name: str, last_name: str) -> Dict[str, str]:
        """
        Generate etymological analysis for both first name and last name

        Args:
            first_name: The first name to analyze
            last_name: The last name to analyze

        Returns:
            Dictionary with 'first_name_analysis' and 'last_name_analysis'

        Example:
            >>> analysis = await service.analyze_full_name("Marie", "Dupont")
            >>> print(analysis['first_name_analysis'])
            >>> print(analysis['last_name_analysis'])
        """
        try:
            # Analyze both names concurrently for performance
            import asyncio
            first_analysis, last_analysis = await asyncio.gather(
                self.analyze_first_name(first_name),
                self.analyze_last_name(last_name),
                return_exceptions=True,
            )

            # Handle potential exceptions
            if isinstance(first_analysis, Exception):
                logger.error(f"First name analysis failed: {first_analysis}")
                first_analysis = f"Prénom '{first_name}' - Analyse étymologique non disponible."

            if isinstance(last_analysis, Exception):
                logger.error(f"Last name analysis failed: {last_analysis}")
                last_analysis = f"Nom '{last_name}' - Analyse étymologique non disponible."

            return {
                "first_name_analysis": first_analysis,
                "last_name_analysis": last_analysis,
            }

        except Exception as e:
            logger.error(f"❌ Full name etymology analysis failed: {e}")
            return {
                "first_name_analysis": f"Prénom '{first_name}' - Analyse étymologique non disponible.",
                "last_name_analysis": f"Nom '{last_name}' - Analyse étymologique non disponible.",
            }


# Singleton instance
_name_etymology_service: Optional[NameEtymologyService] = None


def get_name_etymology_service() -> NameEtymologyService:
    """Get or create Name Etymology service singleton"""
    global _name_etymology_service
    if _name_etymology_service is None:
        _name_etymology_service = NameEtymologyService()
    return _name_etymology_service
