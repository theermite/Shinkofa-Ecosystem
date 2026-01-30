"""
Shizen Context Service
Shinkofa Platform - Adaptive Context for Shizen AI

Handles:
- Loading user holistic profile for adaptive style
- Building dynamic system prompts based on DH type + neurodivergence
- Conversation context memory (summarization, key facts extraction)
"""
from typing import Dict, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
import json

from app.models.holistic_profile import HolisticProfile
from app.services.conversation_service import get_conversation_service
from app.services.ollama_service import get_ollama_service

logger = logging.getLogger(__name__)


# === Design Humain Style Adaptations ===

DH_STYLE_ADAPTATIONS = {
    "generator": {
        "strategy": "Répondre",
        "style": "questions fermées pour valider le gut feeling",
        "communication": "Propositions directes avec options claires",
        "energy": "Accompagne l'énergie sacrale disponible",
        "avoid": "Ne pas sur-solliciter sans réponse gut"
    },
    "manifesting_generator": {
        "strategy": "Informer puis répondre",
        "style": "propositions claires avec espace pour réaction viscérale",
        "communication": "Questions qui permettent de tester la réponse sacrale",
        "energy": "Respecte les changements de direction rapides",
        "avoid": "Ne pas forcer à finir ce qui n'a plus de jus"
    },
    "projector": {
        "strategy": "Attendre l'invitation",
        "style": "suggestions douces, jamais d'imposition",
        "communication": "Je te propose... Que penses-tu de... Si tu le souhaites...",
        "energy": "Respecte les besoins de repos et de retrait",
        "avoid": "Jamais de langage directif (tu dois, il faut)"
    },
    "manifestor": {
        "strategy": "Informer",
        "style": "communication directe, respect de l'autonomie",
        "communication": "Informations claires sans attente de permission",
        "energy": "Respecte les cycles d'action/repos imprévisibles",
        "avoid": "Ne pas demander permission ou attendre validation"
    },
    "reflector": {
        "strategy": "Attendre le cycle lunaire",
        "style": "patience, perspectives multiples offertes",
        "communication": "Exploration sans pression de décision immédiate",
        "energy": "Sensible à l'environnement, propose des espaces neutres",
        "avoid": "Ne pas presser pour des décisions rapides"
    }
}


# === Neurodivergence Style Adaptations ===

NEURO_STYLE_ADAPTATIONS = {
    "tdah": {
        "length": "messages courts et structurés",
        "format": "bullet points, étapes numérotées",
        "energy": "micro-tâches, célébration des petites victoires",
        "reminders": "rappels fréquents et bienveillants",
        "avoid": "longs paragraphes, instructions complexes"
    },
    "tsa": {  # TSA / Autisme
        "length": "précision et clarté",
        "format": "langage littéral, pas d'ambiguïté",
        "energy": "routines prévisibles, structure claire",
        "communication": "pas de sous-entendus, explicite",
        "avoid": "métaphores confuses, changements soudains"
    },
    "hpi": {
        "length": "profondeur analytique appréciée",
        "format": "connexions entre concepts, meta-réflexion",
        "energy": "défis intellectuels, complexité ajustable",
        "communication": "nuances et subtilités bienvenues",
        "avoid": "simplification excessive, répétitions"
    },
    "hypersensible": {
        "length": "ton doux et apaisant",
        "format": "validation émotionnelle d'abord",
        "energy": "esthétique soignée, choix proposés",
        "communication": "empathie explicite, reformulation",
        "avoid": "critique directe, ton sec"
    },
    "multipotentiel": {
        "length": "adaptable selon le sujet",
        "format": "connexions interdisciplinaires",
        "energy": "variété, exploration multiple",
        "communication": "encouragement de la diversité d'intérêts",
        "avoid": "pression à se spécialiser"
    }
}


class ShizenContextService:
    """
    Service for building adaptive context for Shizen AI
    """

    def __init__(self):
        self.ollama = get_ollama_service()
        self.conv_service = get_conversation_service()
        logger.info("🧠 Shizen Context Service initialized")

    async def get_user_profile_context(
        self,
        user_id: str,
        db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Load user's holistic profile and extract relevant context for Shizen

        Returns dict with:
        - dh_type: Design Humain type
        - dh_authority: Authority
        - dh_profile: Profile (e.g., 1/3, 4/6)
        - neuro_profile: List of neurodivergence indicators
        - name: User's name for personalization
        """
        try:
            # Query active profile
            result = await db.execute(
                select(HolisticProfile)
                .where(HolisticProfile.user_id == user_id)
                .where(HolisticProfile.is_active == True)
                .order_by(HolisticProfile.generated_at.desc())
                .limit(1)
            )
            profile = result.scalar_one_or_none()

            if not profile:
                logger.debug(f"No profile found for user {user_id}")
                return None

            # Extract Design Humain
            dh_data = profile.design_human or {}
            dh_type = dh_data.get("type", "").lower().replace(" ", "_")
            dh_authority = dh_data.get("authority", "")
            dh_profile = dh_data.get("profile", "")

            # Extract neurodivergence indicators
            neuro_data = profile.neurodivergence_analysis or {}
            neuro_profile = []

            # Check each neurodivergence type
            neuro_checks = {
                "tdah": ["tdah", "adhd"],
                "tsa": ["tsa", "autism", "autisme"],
                "hpi": ["hpi", "gifted"],
                "hypersensible": ["hypersensible", "hypersensitivity", "hsp"],
                "multipotentiel": ["multipotentiel", "multipotentiality"]
            }

            for neuro_key, aliases in neuro_checks.items():
                for alias in aliases:
                    if alias in neuro_data:
                        detection = neuro_data[alias]
                        # Check if detected (various formats)
                        if isinstance(detection, dict):
                            score = detection.get("score_global", detection.get("score", 0))
                            detected = detection.get("detected", score >= 3)
                        else:
                            detected = bool(detection)

                        if detected:
                            neuro_profile.append(neuro_key)
                            break

            # Extract name from synthesis or numerology
            name = None
            if profile.numerology and isinstance(profile.numerology, dict):
                name = profile.numerology.get("full_name", profile.numerology.get("first_name"))

            return {
                "dh_type": dh_type,
                "dh_authority": dh_authority,
                "dh_profile": dh_profile,
                "neuro_profile": neuro_profile,
                "name": name,
            }

        except Exception as e:
            logger.error(f"Error loading profile context: {e}")
            return None

    def build_adaptive_prompt_section(
        self,
        profile_context: Optional[Dict[str, Any]]
    ) -> str:
        """
        Build adaptive prompt section based on user profile

        Returns a string to inject into the system prompt
        """
        if not profile_context:
            return ""

        sections = []

        # Personalization
        name = profile_context.get("name")
        if name:
            sections.append(f"**UTILISATEUR** : {name}")

        # Design Humain adaptation
        dh_type = profile_context.get("dh_type", "")
        if dh_type and dh_type in DH_STYLE_ADAPTATIONS:
            dh_style = DH_STYLE_ADAPTATIONS[dh_type]
            type_display = dh_type.replace("_", " ").title()
            sections.append(f"""
**ADAPTATION DESIGN HUMAIN ({type_display})** :
- Stratégie : {dh_style['strategy']}
- Style de communication : {dh_style['style']}
- Formulations : {dh_style['communication']}
- Énergie : {dh_style['energy']}
- À ÉVITER : {dh_style['avoid']}""")

        # Neurodivergence adaptation
        neuro_profile = profile_context.get("neuro_profile", [])
        if neuro_profile:
            neuro_sections = []
            for neuro_type in neuro_profile:
                if neuro_type in NEURO_STYLE_ADAPTATIONS:
                    neuro_style = NEURO_STYLE_ADAPTATIONS[neuro_type]
                    neuro_sections.append(f"""
  • {neuro_type.upper()} :
    - Messages : {neuro_style['length']}
    - Format : {neuro_style['format']}
    - À éviter : {neuro_style['avoid']}""")

            if neuro_sections:
                sections.append(f"""
**ADAPTATION NEURODIVERGENCE** :{''.join(neuro_sections)}""")

        return "\n".join(sections)

    async def get_conversation_context(
        self,
        conversation_id: str,
        db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Load conversation context (stored summary, key facts, preferences)
        """
        try:
            conversation = await self.conv_service.get_conversation(conversation_id, db)
            if conversation and conversation.context:
                return conversation.context
            return None
        except Exception as e:
            logger.error(f"Error loading conversation context: {e}")
            return None

    async def summarize_and_update_context(
        self,
        conversation_id: str,
        recent_messages: List[Dict],
        db: AsyncSession
    ) -> bool:
        """
        Summarize recent conversation and update context
        Called periodically (e.g., every 10 messages)

        Extracts:
        - Summary of discussion
        - User preferences mentioned
        - Goals identified
        - Emotional state observed
        """
        try:
            if len(recent_messages) < 5:
                return False  # Not enough to summarize

            # Build conversation text
            conv_text = "\n".join([
                f"{msg['role'].upper()}: {msg['content']}"
                for msg in recent_messages[-10:]
            ])

            # Use LLM to extract context
            summary_prompt = f"""Analyse cette conversation et extrais les informations clés.

CONVERSATION:
{conv_text}

Réponds en JSON avec ces champs:
{{
    "summary": "résumé de 2-3 phrases de ce qui a été discuté",
    "user_preferences": ["liste de préférences ou besoins exprimés"],
    "goals_identified": ["objectifs ou souhaits mentionnés"],
    "emotional_state": "état émotionnel observé (ex: motivé, fatigué, anxieux, curieux)",
    "topics_discussed": ["sujets abordés"]
}}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après."""

            response = await self.ollama.generate(
                prompt=summary_prompt,
                temperature=0.3,  # Low temperature for consistency
            )

            response_text = response.get("response", "")

            # Parse JSON response
            try:
                # Try to extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    context_data = json.loads(json_match.group())
                else:
                    logger.warning("Could not extract JSON from summary response")
                    return False
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse summary JSON: {response_text[:200]}")
                return False

            # Update conversation context
            success = await self.conv_service.update_conversation_context(
                conversation_id=conversation_id,
                context_updates=context_data,
                db=db
            )

            if success:
                logger.info(f"📝 Updated context for conversation {conversation_id}")

            return success

        except Exception as e:
            logger.error(f"Error summarizing conversation: {e}")
            return False


# Singleton instance
_shizen_context_service: Optional[ShizenContextService] = None


def get_shizen_context_service() -> ShizenContextService:
    """Get or create Shizen Context Service singleton"""
    global _shizen_context_service
    if _shizen_context_service is None:
        _shizen_context_service = ShizenContextService()
    return _shizen_context_service
