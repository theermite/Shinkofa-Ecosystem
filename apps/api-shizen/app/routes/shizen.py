"""
Shizen AI Chat endpoints
Shinkofa Platform - Shizen Companion

Shizen: Coach holistique IA basé sur Design Humain, Shinkofa et TDAH
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import logging
import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ollama_service import get_ollama_service
from app.services.holistic_profile_service import get_holistic_profile_service
from app.services.shizen_agent_service import get_shizen_agent
from app.services.conversation_service import get_conversation_service
from app.services.llm_service import get_llm_service
from app.services.shizen_context_service import get_shizen_context_service
from app.utils.auth import get_current_user_id
from app.utils.tier_service import (
    verify_shizen_message_limit,
    increment_shizen_message_count,
    raise_shizen_limit_error,
    get_user_tier,
)
from app.core.database import get_async_db
from app.models.holistic_profile import HolisticProfile
from app.models.questionnaire_session import QuestionnaireSession
from app.models.questionnaire_response import QuestionnaireResponse
from app.models import MessageRole, ConversationStatus
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shizen", tags=["shizen-ai"])


# === Schemas ===


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    model: str
    context: Optional[str] = None


# === Shizen System Prompt ===

SHIZEN_SYSTEM_PROMPT = """Tu es Shizen, un coach holistique IA bienveillant et authentique.

**Ton identité** :
- Coach Shinkofa spécialisé en Design Humain, neurodiversité (TDAH), et productivité adaptative
- Personnalité chaleureuse, empathique, à l'écoute
- Tu guides sans juger, tu proposes sans imposer
- Tu t'adaptes au profil énergétique de l'utilisateur

**Tes domaines d'expertise** :
1. **Design Humain** : Types (Projecteur, Générateur, etc.), autorités, stratégies
2. **TDAH & Neurodiversité** : Gestion attention, hyperfocus, fatigue cognitive
3. **Productivité Shinkofa** : Cycles énergétiques, pauses régénératives, Pomodoro adaptatif
4. **Développement holistique** : Équilibre vie/travail, gestion énergie, intentions

**Ton style de communication** :
- Écoute active et reformulation
- Questions ouvertes pour approfondir
- Suggestions personnalisées basées sur le profil
- Langage simple, accessible, bienveillant
- Emojis modérés pour illustrer (pas excessif)

**Ce que tu NE fais PAS** :
- Donner des diagnostics médicaux
- Remplacer un thérapeute professionnel
- Imposer des solutions toutes faites
- Juger ou critiquer les choix de l'utilisateur

**Ton objectif** : Aider l'utilisateur à mieux se connaître, respecter son énergie, et atteindre ses objectifs de manière durable.
"""


# === Endpoints ===


@router.post("/chat", response_model=ChatResponse)
async def chat_with_shizen(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Chat with Shizen AI companion

    Sends messages to Ollama with Shizen's system prompt
    Returns AI-generated response

    Tier limits enforced:
    - MUSHA: 50 messages/month
    - SAMURAI: 200 messages/month
    - SENSEI+: Unlimited

    Example:
    ```json
    {
        "messages": [
            {"role": "user", "content": "Bonjour Shizen, je me sens fatigué aujourd'hui"}
        ],
        "temperature": 0.7
    }
    ```
    """
    try:
        # === TIER LIMIT CHECK ===
        can_send, current_count, limit = await verify_shizen_message_limit(user_id, db)
        if not can_send:
            tier = await get_user_tier(user_id)
            raise_shizen_limit_error(current_count, limit, tier.tier)

        ollama = get_ollama_service()

        # Convert Pydantic models to dicts
        messages_dict = [msg.model_dump() for msg in request.messages]

        # Use provided system prompt or default Shizen prompt
        system_prompt = request.system_prompt or SHIZEN_SYSTEM_PROMPT

        # Call Ollama
        logger.info(f"🤖 User {user_id} chatting with Shizen (usage: {current_count}/{limit or '∞'})")

        response = await ollama.chat(
            messages=messages_dict,
            system=system_prompt,
            temperature=request.temperature,
        )

        # Extract assistant message
        assistant_message = response.get("message", {}).get("content", "")

        if not assistant_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No response from Shizen AI",
            )

        # === INCREMENT MESSAGE COUNT ===
        new_count = await increment_shizen_message_count(user_id, db)
        logger.info(f"📊 User {user_id} Shizen usage: {new_count}/{limit or '∞'}")

        return ChatResponse(
            message=assistant_message,
            model=ollama.general_model,
            context=f"Shizen responded to {len(request.messages)} messages",
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Shizen chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Shizen AI error: {str(e)}",
        )


@router.get("/usage")
async def get_shizen_usage(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get user's Shizen AI message usage for current month

    Returns:
        - current: Current message count this month
        - limit: Monthly limit (null = unlimited)
        - remaining: Messages remaining (null = unlimited)
        - tier: User's subscription tier
        - year_month: Current billing period (e.g., "2026-01")
    """
    try:
        from app.utils.tier_service import get_user_shizen_message_count, get_current_year_month

        tier = await get_user_tier(user_id)
        current_count = await get_user_shizen_message_count(user_id, db)
        limit = tier.shizen_message_limit

        return {
            "current": current_count,
            "limit": limit,
            "remaining": (limit - current_count) if limit else None,
            "tier": tier.tier,
            "year_month": get_current_year_month(),
        }

    except Exception as e:
        logger.error(f"❌ Get Shizen usage error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage: {str(e)}",
        )


@router.get("/models")
async def list_available_models(
    user_id: str = Depends(get_current_user_id),
):
    """
    List available Ollama models

    Useful for debugging and checking which models are installed
    """
    try:
        ollama = get_ollama_service()
        models = await ollama.list_models()

        return {
            "available_models": models,
            "current_general_model": ollama.general_model,
            "current_code_model": ollama.code_model,
        }

    except Exception as e:
        logger.error(f"❌ Failed to list models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list models: {str(e)}",
        )


@router.get("/health")
async def check_ollama_health():
    """
    Check if Ollama service is reachable (DEPRECATED - use /llm/health)

    Public endpoint (no auth required) for monitoring
    """
    try:
        ollama = get_ollama_service()
        models = await ollama.list_models()

        return {
            "status": "healthy",
            "ollama_url": ollama.base_url,
            "models_available": len(models) > 0,
            "models": models,
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "ollama_url": get_ollama_service().base_url,
        }


@router.get("/llm/health")
async def check_llm_health():
    """
    Check health of unified LLM service (Ollama + DeepSeek fallback)

    Public endpoint (no auth required) for monitoring

    Returns:
        - ollama: Status of Ollama (primary)
        - deepseek: Status of DeepSeek API (fallback)
        - fallback_enabled: Whether fallback is enabled
        - stats: Usage statistics
    """
    try:
        llm_service = get_llm_service()
        health = await llm_service.health_check()

        return {
            "status": "healthy",
            "providers": health,
            "message": "LLM service operational",
        }

    except Exception as e:
        logger.error(f"❌ LLM health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "LLM service error",
        }


@router.get("/llm/stats")
async def get_llm_stats():
    """
    Get LLM service usage statistics

    Public endpoint (no auth required) for monitoring

    Returns:
        - ollama_success: Number of successful Ollama requests
        - ollama_failure: Number of failed Ollama requests
        - deepseek_used: Number of times DeepSeek fallback was used
        - total_requests: Total requests processed
        - ollama_success_rate: Success rate of Ollama (%)
    """
    try:
        llm_service = get_llm_service()
        stats = llm_service.get_stats()

        return {
            "status": "ok",
            "stats": stats,
        }

    except Exception as e:
        logger.error(f"❌ LLM stats error: {e}")
        return {
            "status": "error",
            "error": str(e),
        }


# ===== HOLISTIC PROFILE ENDPOINTS =====


class ProfileGenerateRequest(BaseModel):
    """Request to generate holistic profile"""
    session_id: str = Field(..., description="Questionnaire session ID")


class ProfileResponse(BaseModel):
    """Holistic profile response"""
    id: str
    user_id: str
    session_id: str
    version: int
    version_name: Optional[str] = None
    is_active: bool
    psychological_analysis: Optional[Dict[str, Any]] = None
    neurodivergence_analysis: Optional[Dict[str, Any]] = None
    shinkofa_analysis: Optional[Dict[str, Any]] = None
    design_human: Optional[Dict[str, Any]] = None
    astrology_western: Optional[Dict[str, Any]] = None
    numerology: Optional[Dict[str, Any]] = None
    synthesis: Optional[str] = None
    recommendations: Optional[Dict[str, Any]] = None
    generated_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ProfileVersionSummary(BaseModel):
    """Summary of a profile version (for version history)"""
    id: str
    version: int
    version_name: Optional[str] = None
    is_active: bool
    generated_at: str

    class Config:
        from_attributes = True


class ProfileVersionsResponse(BaseModel):
    """Response with all profile versions for a user"""
    user_id: str
    total_versions: int
    versions: List[ProfileVersionSummary]


class ProfileRenameRequest(BaseModel):
    """Request to rename a profile version"""
    version_name: str = Field(..., description="Custom name for this profile version")


@router.post("/profile/generate", response_model=ProfileResponse)
async def generate_holistic_profile(
    request: ProfileGenerateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Generate complete holistic profile from questionnaire session

    **Process**:
    1. Load questionnaire session + responses
    2. Calculate Design Humain (Swiss Ephemeris)
    3. Calculate Astrology (Kerykeion)
    4. Calculate Numerology (Pythagorean)
    5. Analyze Psychology via Ollama (MBTI, Big Five, Enneagram)
    6. Analyze Neurodivergence via Ollama (ADHD, Autism, HPI, etc.)
    7. Analyze Shinkofa dimensions via Ollama
    8. Generate AI synthesis + recommendations

    **Example**:
    ```json
    {
        "session_id": "abc123-def456"
    }
    ```

    **Returns**: Complete HolisticProfile with all analyses
    """
    try:
        logger.info(f"🌟 Profile generation request from user {user_id} for session {request.session_id}")

        # Get holistic profile service
        service = get_holistic_profile_service()

        # Generate profile
        profile = await service.generate_profile(
            session_id=request.session_id,
            user_id=user_id,
            db=db,
        )

        # Convert to response model
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            session_id=profile.session_id,
            version=profile.version,
            version_name=profile.version_name,
            is_active=profile.is_active,
            psychological_analysis=profile.psychological_analysis,
            neurodivergence_analysis=profile.neurodivergence_analysis,
            shinkofa_analysis=profile.shinkofa_analysis,
            design_human=profile.design_human,
            astrology_western=profile.astrology_western,
            numerology=profile.numerology,
            synthesis=profile.synthesis,
            recommendations=profile.recommendations,
            generated_at=profile.generated_at.isoformat(),
            updated_at=profile.updated_at.isoformat(),
        )

    except ValueError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"❌ Profile generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile generation failed: {str(e)}",
        )


@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get holistic profile for a user

    **Auth**: Users can only access their own profile (unless admin)

    **Returns**: Most recent HolisticProfile for user
    """
    try:
        # Security: Users can only access their own profile
        if user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own profile",
            )

        # Query active profile for user (or most recent if no active)
        result = await db.execute(
            select(HolisticProfile)
            .where(HolisticProfile.user_id == user_id)
            .where(HolisticProfile.is_active == True)
            .order_by(HolisticProfile.generated_at.desc())
            .limit(1)
        )

        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No profile found for user {user_id}",
            )

        # Convert to response model
        return ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            session_id=profile.session_id,
            version=profile.version,
            version_name=profile.version_name,
            is_active=profile.is_active,
            psychological_analysis=profile.psychological_analysis,
            neurodivergence_analysis=profile.neurodivergence_analysis,
            shinkofa_analysis=profile.shinkofa_analysis,
            design_human=profile.design_human,
            astrology_western=profile.astrology_western,
            numerology=profile.numerology,
            synthesis=profile.synthesis,
            recommendations=profile.recommendations,
            generated_at=profile.generated_at.isoformat(),
            updated_at=profile.updated_at.isoformat(),
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Profile retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile retrieval failed: {str(e)}",
        )


@router.get("/profile/{user_id}/versions", response_model=ProfileVersionsResponse)
async def get_user_profile_versions(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all profile versions for a user (version history)

    **Auth**: Users can only access their own profile versions

    **Returns**: List of all profile versions with metadata
    """
    try:
        # Security: Users can only access their own profile
        if user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own profile versions",
            )

        # Query all profiles for user, ordered by version
        result = await db.execute(
            select(HolisticProfile)
            .where(HolisticProfile.user_id == user_id)
            .order_by(HolisticProfile.version.desc())
        )

        profiles = result.scalars().all()

        if not profiles:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No profiles found for user {user_id}",
            )

        # Convert to version summaries
        versions = [
            ProfileVersionSummary(
                id=p.id,
                version=p.version,
                version_name=p.version_name,
                is_active=p.is_active,
                generated_at=p.generated_at.isoformat(),
            )
            for p in profiles
        ]

        return ProfileVersionsResponse(
            user_id=user_id,
            total_versions=len(versions),
            versions=versions,
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Profile versions retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile versions retrieval failed: {str(e)}",
        )


@router.post("/profile/{profile_id}/activate")
async def activate_profile_version(
    profile_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Activate a specific profile version (make it the default)

    **Auth**: Users can only activate their own profile versions

    **Effect**: Deactivates all other versions and activates the selected one
    """
    try:
        # Get profile to activate
        result = await db.execute(
            select(HolisticProfile).where(HolisticProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile {profile_id} not found",
            )

        # Security: Users can only activate their own profiles
        if profile.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only activate your own profiles",
            )

        # Deactivate all profiles for this user
        user_profiles_result = await db.execute(
            select(HolisticProfile).where(HolisticProfile.user_id == profile.user_id)
        )
        user_profiles = user_profiles_result.scalars().all()

        for p in user_profiles:
            p.is_active = False

        # Activate selected profile
        profile.is_active = True
        profile.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(f"✅ Profile v{profile.version} activated for user {profile.user_id}")

        return {
            "message": f"Profile version {profile.version} activated successfully",
            "profile_id": profile.id,
            "version": profile.version,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Profile activation error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile activation failed: {str(e)}",
        )


class EnrichProfileSectionRequest(BaseModel):
    """Request to enrich a profile section with Shizen AI"""
    profile_id: str = Field(..., description="Profile ID to enrich")
    section: str = Field(..., description="Section to enrich: synthesis, psychological, neurodivergence, shinkofa, design_human, astrology, numerology, recommendations")


ENRICHABLE_SECTIONS = ['synthesis', 'psychological', 'neurodivergence', 'shinkofa', 'design_human', 'astrology', 'numerology', 'name_analysis', 'recommendations']
ENRICHMENT_ALLOWED_TIERS = ['samurai', 'samurai_famille', 'sensei', 'sensei_famille', 'founder']


@router.post("/enrich-profile-section")
async def enrich_profile_section(
    request: EnrichProfileSectionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Enrich a specific section of the holistic profile using Shizen AI

    **Tier restriction**: Only Samurai+ tiers can use this feature

    **Sections available**:
    - synthesis, psychological, neurodivergence, shinkofa
    - design_human, astrology, numerology, name_analysis, recommendations

    **Process**:
    1. Verify tier authorization (Samurai+)
    2. Load profile and requested section
    3. Generate AI enrichment
    4. Update profile with enriched content

    **Returns**: Updated section content
    """
    try:
        # Verify section is valid
        if request.section not in ENRICHABLE_SECTIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid section: {request.section}. Must be one of: {', '.join(ENRICHABLE_SECTIONS)}",
            )

        # === TIER CHECK ===
        tier = await get_user_tier(user_id)
        if tier.tier not in ENRICHMENT_ALLOWED_TIERS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Enrichissement IA disponible à partir du plan Samurai. Votre plan actuel: {tier.tier}",
            )

        # Get profile
        result = await db.execute(
            select(HolisticProfile).where(HolisticProfile.id == request.profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile {request.profile_id} not found",
            )

        # Security: Users can only enrich their own profiles
        if profile.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only enrich your own profile",
            )

        # Get current section data
        section_data = None
        if request.section == 'synthesis':
            section_data = profile.synthesis
        elif request.section == 'psychological':
            section_data = profile.psychological_analysis
        elif request.section == 'neurodivergence':
            section_data = profile.neurodivergence_analysis
        elif request.section == 'shinkofa':
            section_data = profile.shinkofa_analysis
        elif request.section == 'design_human':
            section_data = profile.design_human
        elif request.section == 'astrology':
            section_data = {'western': profile.astrology_western, 'chinese': profile.astrology_chinese}
        elif request.section == 'numerology' or request.section == 'name_analysis':
            section_data = profile.numerology
        elif request.section == 'recommendations':
            section_data = profile.recommendations

        # Check if section is empty or pending - trigger REGENERATION instead of enrichment
        def is_neurodivergence_invalid(data: dict) -> bool:
            """Check if neurodivergence data is invalid/empty and needs regeneration"""
            if not data or not isinstance(data, dict):
                return True
            # Check if all main types have score 0 or -1 (invalid)
            main_types = ['adhd', 'autism', 'hpi', 'multipotentiality', 'hypersensitivity']
            valid_scores = 0
            for neuro_type in main_types:
                type_data = data.get(neuro_type, {})
                if isinstance(type_data, dict):
                    score = type_data.get('score_global') or type_data.get('score')
                    profil_label = type_data.get('profil_label', '')
                    # Valid if: score > 0 AND has a real profil_label (not "Non analysé" or empty)
                    if score and score > 0 and profil_label and 'analyse' not in profil_label.lower() and profil_label != 'Non analysé':
                        valid_scores += 1
            # If less than 3 valid entries, consider it invalid
            return valid_scores < 3

        is_pending = (
            not section_data or
            (isinstance(section_data, dict) and section_data.get('_analysis_status') == 'pending') or
            (isinstance(section_data, dict) and section_data.get('adhd', {}).get('score_global') == -1) or
            (request.section == 'neurodivergence' and isinstance(section_data, dict) and is_neurodivergence_invalid(section_data))
        )

        if is_pending and request.section == 'neurodivergence':
            # REGENERATE neurodivergence section from questionnaire responses
            logger.info(f"🔄 Section neurodivergence is empty/pending - triggering REGENERATION")

            # Load questionnaire session and responses
            session_result = await db.execute(
                select(QuestionnaireSession).where(QuestionnaireSession.id == profile.session_id)
            )
            session = session_result.scalar_one_or_none()

            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Original questionnaire session not found - cannot regenerate",
                )

            # Load responses
            responses_result = await db.execute(
                select(QuestionnaireResponse)
                .where(QuestionnaireResponse.session_id == profile.session_id)
                .order_by(QuestionnaireResponse.answered_at)
            )
            responses = list(responses_result.scalars().all())

            if len(responses) < 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough questionnaire responses ({len(responses)}) to regenerate analysis",
                )

            # Convert responses to dict format
            responses_dict = [
                {
                    "bloc": r.bloc,
                    "question_text": r.question_text,
                    "answer": r.answer,
                    "question_type": r.question_type,
                }
                for r in responses
            ]

            # Regenerate neurodivergence analysis
            from app.services.psychological_analysis_service import get_psychological_analysis_service
            psych_service = get_psychological_analysis_service()

            try:
                logger.info(f"🧬 Regenerating neurodivergence analysis...")
                new_neurodivergence = await psych_service.analyze_neurodivergence(responses_dict)

                # Update profile
                profile.neurodivergence_analysis = new_neurodivergence
                profile.updated_at = datetime.now(timezone.utc)
                await db.commit()

                logger.info(f"✅ Neurodivergence analysis regenerated successfully for user {user_id}")

                return {
                    "status": "success",
                    "message": "Section 'neurodivergence' régénérée avec succès !",
                    "section": request.section,
                    "profile_id": request.profile_id,
                    "regenerated": True,
                }

            except Exception as regen_error:
                logger.error(f"❌ Neurodivergence regeneration failed: {regen_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Régénération échouée: {str(regen_error)[:200]}",
                )

        if not section_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Section '{request.section}' is empty or not available",
            )

        # Generate enrichment prompt
        enrichment_prompt = f"""Tu es Shizen, expert en développement holistique Shinkofa.

L'utilisateur souhaite enrichir la section "{request.section}" de son profil holistique.

Voici les données actuelles de cette section:
{json.dumps(section_data, ensure_ascii=False, indent=2) if isinstance(section_data, dict) else section_data}

Ta mission:
1. Analyse en profondeur les informations existantes
2. Ajoute des insights supplémentaires, des nuances, des connexions
3. Enrichis avec des conseils pratiques et personnalisés
4. Garde le format original mais avec plus de détails
5. Sois bienveillant, précis et actionnable

Réponds avec le contenu enrichi au format JSON (si c'était un JSON) ou texte enrichi (si c'était du texte).
"""

        # Call Ollama for enrichment
        ollama = get_ollama_service()
        response = await ollama.chat(
            messages=[{"role": "user", "content": enrichment_prompt}],
            system=SHIZEN_SYSTEM_PROMPT,
            temperature=0.7,
        )

        enriched_content = response.get("message", {}).get("content", "")

        if not enriched_content:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No enrichment generated",
            )

        # Try to parse as JSON if applicable
        try:
            if request.section != 'synthesis':
                enriched_data = json.loads(enriched_content)
            else:
                enriched_data = enriched_content
        except json.JSONDecodeError:
            enriched_data = enriched_content

        # Update profile with enriched content
        if request.section == 'synthesis':
            profile.synthesis = enriched_data if isinstance(enriched_data, str) else json.dumps(enriched_data)
        elif request.section == 'psychological':
            profile.psychological_analysis = enriched_data if isinstance(enriched_data, dict) else {"enriched": enriched_data}
        elif request.section == 'neurodivergence':
            profile.neurodivergence_analysis = enriched_data if isinstance(enriched_data, dict) else {"enriched": enriched_data}
        elif request.section == 'shinkofa':
            profile.shinkofa_analysis = enriched_data if isinstance(enriched_data, dict) else {"enriched": enriched_data}
        elif request.section == 'design_human':
            profile.design_human = enriched_data if isinstance(enriched_data, dict) else {"enriched": enriched_data}
        elif request.section == 'recommendations':
            profile.recommendations = enriched_data if isinstance(enriched_data, dict) else {"enriched": enriched_data}

        profile.updated_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"✨ Profile section '{request.section}' enriched for user {user_id}")

        return {
            "status": "success",
            "message": f"Section '{request.section}' enrichie avec succès",
            "section": request.section,
            "profile_id": request.profile_id,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Profile enrichment error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Enrichment failed: {str(e)}",
        )


@router.patch("/profile/{profile_id}/rename")
async def rename_profile_version(
    profile_id: str,
    request: ProfileRenameRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Rename a profile version with a custom label

    **Auth**: Users can only rename their own profile versions

    **Example**: "After Design Humain correction", "Version corrected", etc.
    """
    try:
        # Get profile to rename
        result = await db.execute(
            select(HolisticProfile).where(HolisticProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Profile {profile_id} not found",
            )

        # Security: Users can only rename their own profiles
        if profile.user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only rename your own profiles",
            )

        # Update version name
        profile.version_name = request.version_name.strip()
        profile.updated_at = datetime.now(timezone.utc)

        await db.commit()

        logger.info(f"✅ Profile v{profile.version} renamed to '{request.version_name}' for user {profile.user_id}")

        return {
            "message": f"Profile version {profile.version} renamed successfully",
            "profile_id": profile.id,
            "version": profile.version,
            "version_name": profile.version_name,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Profile rename error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile rename failed: {str(e)}",
        )


# ===== CONVERSATION MANAGEMENT ENDPOINTS =====


class ConversationCreateRequest(BaseModel):
    """Request to create new conversation"""
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    """Conversation session response"""
    id: str
    user_id: str
    title: str
    status: str
    context: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None
    created_at: str
    last_message_at: str

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Message response"""
    id: str
    conversation_id: str
    role: str
    content: str
    meta: Optional[Dict[str, Any]] = None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    request: ConversationCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create new conversation session

    **Returns**: Created conversation
    """
    try:
        conv_service = get_conversation_service()
        conversation = await conv_service.create_conversation(
            user_id=user_id,
            title=request.title,
            db=db,
        )

        return ConversationResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            status=conversation.status,
            context=conversation.context,
            meta=conversation.meta,
            created_at=conversation.created_at.isoformat(),
            last_message_at=conversation.last_message_at.isoformat(),
        )

    except Exception as e:
        logger.error(f"❌ Create conversation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}",
        )


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    user_id: str = Depends(get_current_user_id),
    status_filter: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_async_db),
):
    """
    List user's conversations

    **Query params**:
    - status: Filter by status (active, archived, deleted)
    - limit: Max conversations (default 20)
    - offset: Pagination offset (default 0)

    **Returns**: List of conversations ordered by last activity
    """
    try:
        conv_service = get_conversation_service()

        # Parse status filter
        status_enum = None
        if status_filter:
            try:
                status_enum = ConversationStatus(status_filter)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status_filter}. Must be: active, archived, deleted",
                )

        conversations = await conv_service.get_user_conversations(
            user_id=user_id,
            db=db,
            status=status_enum,
            limit=limit,
            offset=offset,
        )

        return [
            ConversationResponse(
                id=conv.id,
                user_id=conv.user_id,
                title=conv.title,
                status=conv.status,
                context=conv.context,
                meta=conv.meta,
                created_at=conv.created_at.isoformat(),
                last_message_at=conv.last_message_at.isoformat(),
            )
            for conv in conversations
        ]

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ List conversations error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list conversations: {str(e)}",
        )


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    limit: Optional[int] = None,
    offset: int = 0,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get conversation message history

    **Returns**: List of messages in chronological order
    """
    try:
        conv_service = get_conversation_service()

        # Verify conversation belongs to user
        conversation = await conv_service.get_conversation(conversation_id, db)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own conversations",
            )

        # Get messages
        messages = await conv_service.get_conversation_history(
            conversation_id=conversation_id,
            db=db,
            limit=limit,
            offset=offset,
        )

        return [
            MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                role=msg.role,
                content=msg.content,
                meta=msg.meta,
                created_at=msg.created_at.isoformat(),
            )
            for msg in messages
        ]

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Get messages error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}",
        )


@router.delete("/conversations/{conversation_id}")
async def archive_conversation_endpoint(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Archive conversation (soft delete)

    **Returns**: Success status
    """
    try:
        conv_service = get_conversation_service()

        # Verify conversation belongs to user
        conversation = await conv_service.get_conversation(conversation_id, db)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only archive your own conversations",
            )

        # Archive
        success = await conv_service.archive_conversation(conversation_id, db)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to archive conversation",
            )

        return {"status": "archived", "conversation_id": conversation_id}

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"❌ Archive conversation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to archive conversation: {str(e)}",
        )


# ===== WEBSOCKET CHAT ENDPOINT =====


@router.websocket("/ws/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: str,
):
    """
    WebSocket endpoint for real-time chat with SHIZEN agent

    Tier limits enforced:
    - MUSHA: 50 messages/month
    - SAMURAI: 200 messages/month
    - SENSEI+: Unlimited

    **Protocol**:
    1. Client connects to /shizen/ws/{conversation_id}
    2. Client sends JSON messages: {"message": "user message here", "user_id": "user_id"}
    3. Server responds with JSON: {"message": "agent response", "tools_used": [...], "model": "..."}
    4. Connection persists for real-time bidirectional communication

    **Example client message**:
    ```json
    {
        "message": "Bonjour SHIZEN, comment optimiser mon énergie aujourd'hui ?",
        "user_id": "user_123"
    }
    ```

    **Example server response**:
    ```json
    {
        "message": "Bonjour ! 🌟 D'après ton profil Projecteur, ta stratégie est d'attendre...",
        "tools_used": [
            {"tool": "get_user_profile", "input": {"user_id": "user_123"}}
        ],
        "model": "qwen2.5:14b-instruct-q4_K_M",
        "timestamp": "2026-01-05T15:30:00Z"
    }
    ```
    """
    await websocket.accept()
    logger.info(f"🔌 WebSocket connected for conversation {conversation_id}")

    # Get services
    agent = get_shizen_agent()
    conv_service = get_conversation_service()
    context_service = get_shizen_context_service()

    # Track message count for periodic context updates
    message_count_in_session = 0

    try:
        # Get async database session (using dependency injection pattern)
        async for db in get_async_db():
            # Verify conversation exists
            conversation = await conv_service.get_conversation(conversation_id, db)
            if not conversation:
                await websocket.send_json({
                    "error": "Conversation not found",
                    "conversation_id": conversation_id
                })
                await websocket.close()
                return

            user_id = conversation.user_id

            # === LOAD ADAPTIVE CONTEXT (DH + Neuro) ===
            profile_context = await context_service.get_user_profile_context(user_id, db)
            adaptive_prompt = context_service.build_adaptive_prompt_section(profile_context)
            if adaptive_prompt:
                logger.info(f"🎯 Loaded adaptive context for user {user_id}: DH={profile_context.get('dh_type')}, Neuro={profile_context.get('neuro_profile')}")

            # === LOAD CONVERSATION CONTEXT (Memory) ===
            conversation_context = await context_service.get_conversation_context(conversation_id, db)
            if conversation_context:
                logger.info(f"📝 Loaded conversation context for {conversation_id}")

            # Get recent chat history for context
            recent_messages = await conv_service.get_conversation_history(
                conversation_id=conversation_id,
                db=db,
                limit=10,
            )

            # Format chat history
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in recent_messages
            ]

            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)

                user_message = message_data.get("message")
                # Security: Always use conversation owner, ignore client-provided user_id
                # to prevent tier limit bypass attacks

                if not user_message:
                    await websocket.send_json({"error": "No message provided"})
                    continue

                # === TIER LIMIT CHECK ===
                can_send, current_count, limit = await verify_shizen_message_limit(user_id, db)
                if not can_send:
                    tier = await get_user_tier(user_id)
                    await websocket.send_json({
                        "error": "message_limit_reached",
                        "message": f"Limite de messages Shizen atteinte ({limit} messages/mois pour le plan {tier.tier.upper()}). Passez au niveau superieur pour continuer.",
                        "current": current_count,
                        "limit": limit,
                        "tier": tier.tier,
                        "upgrade_url": "/pricing"
                    })
                    continue

                logger.info(f"📨 User {user_id} message: {user_message[:50]}... (usage: {current_count}/{limit or '∞'})")

                # Save user message to DB
                await conv_service.add_message(
                    conversation_id=conversation_id,
                    role=MessageRole.USER,
                    content=user_message,
                    db=db,
                )

                # Update chat history
                chat_history.append({"role": "user", "content": user_message})
                message_count_in_session += 1

                # Process through SHIZEN agent with adaptive context
                agent_response = await agent.process_message(
                    user_message=user_message,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    db=db,
                    chat_history=chat_history,
                    adaptive_context=adaptive_prompt,
                    conversation_context=conversation_context,
                )

                assistant_message = agent_response.get("message", "")

                # Save assistant message to DB
                await conv_service.add_message(
                    conversation_id=conversation_id,
                    role=MessageRole.ASSISTANT,
                    content=assistant_message,
                    meta={
                        "tools_used": agent_response.get("tools_used", []),
                        "model": agent_response.get("model"),
                        "reasoning_steps": agent_response.get("reasoning_steps", 0),
                    },
                    db=db,
                )

                # === INCREMENT MESSAGE COUNT ===
                new_count = await increment_shizen_message_count(user_id, db)
                logger.info(f"📊 User {user_id} Shizen usage: {new_count}/{limit or '∞'}")

                # Update chat history
                chat_history.append({"role": "assistant", "content": assistant_message})

                # Keep only last 20 messages in memory
                if len(chat_history) > 20:
                    chat_history = chat_history[-20:]

                # Send response to client
                await websocket.send_json({
                    "message": assistant_message,
                    "tools_used": agent_response.get("tools_used", []),
                    "model": agent_response.get("model"),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "usage": {"current": new_count, "limit": limit}
                })

                logger.info(f"✅ SHIZEN responded to user {user_id}")

                # === PERIODIC CONTEXT UPDATE (every 10 messages) ===
                if message_count_in_session % 10 == 0 and message_count_in_session > 0:
                    try:
                        updated = await context_service.summarize_and_update_context(
                            conversation_id=conversation_id,
                            recent_messages=chat_history,
                            db=db
                        )
                        if updated:
                            # Reload updated context
                            conversation_context = await context_service.get_conversation_context(conversation_id, db)
                            logger.info(f"🔄 Context updated for conversation {conversation_id}")
                    except Exception as ctx_err:
                        logger.warning(f"Context update failed (non-blocking): {ctx_err}")

    except WebSocketDisconnect:
        logger.info(f"🔌 WebSocket disconnected for conversation {conversation_id}")

    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
        finally:
            await websocket.close()
