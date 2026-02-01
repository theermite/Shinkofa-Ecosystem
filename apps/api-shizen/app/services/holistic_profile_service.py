"""
Holistic Profile Generation Service
Shinkofa Platform - Shizen AI

Orchestrates complete holistic profile generation:
1. Design Humain calculation (Swiss Ephemeris)
2. Astrology calculation (Kerykeion)
3. Numerology calculation (Pythagorean)
4. Psychological analysis (Ollama - MBTI, Big Five, Enneagram)
5. Neurodivergence analysis (Ollama - ADHD, Autism, HPI)
6. Shinkofa dimensions (Ollama - Life wheel, Archetypes)
7. AI Synthesis (Ollama - integrated recommendations)

Saves complete profile to database (HolisticProfile model)
"""
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime, timezone
import logging
import uuid
import asyncio
import traceback

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.questionnaire_session import QuestionnaireSession, SessionStatus
from app.models.questionnaire_response import QuestionnaireResponse
from app.models.holistic_profile import HolisticProfile
from app.models.uploaded_chart import UploadedChart, ChartType, ChartStatus

from app.services.design_human_service import get_design_human_service
from app.services.astrology_service import get_astrology_service
from app.services.numerology_service import get_numerology_service
from app.services.psychological_analysis_service import get_psychological_analysis_service
from app.services.name_holistic_analysis_service import get_name_holistic_analysis_service

logger = logging.getLogger(__name__)


class HolisticProfileService:
    """
    Holistic Profile generation orchestrator

    Coordinates all calculation and analysis services to generate complete profile
    """

    def __init__(self):
        """Initialize Holistic Profile service"""
        self.dh_service = get_design_human_service()
        self.astro_service = get_astrology_service()
        self.num_service = get_numerology_service()
        self.psych_service = get_psychological_analysis_service()
        self.name_holistic_service = get_name_holistic_analysis_service()

        logger.info("🌟 Holistic Profile Service initialized")

    async def _retry_with_backoff(
        self,
        func: Callable,
        *args,
        max_retries: int = 3,
        initial_delay: float = 2.0,
        backoff_factor: float = 2.0,
        operation_name: str = "LLM operation",
        **kwargs
    ) -> Any:
        """
        Retry async function with exponential backoff

        Args:
            func: Async function to retry
            max_retries: Maximum number of retry attempts
            initial_delay: Initial delay in seconds before first retry
            backoff_factor: Multiplier for delay after each retry
            operation_name: Name of operation for logging

        Returns:
            Result of successful function call

        Raises:
            Exception if all retries fail
        """
        last_error = None
        delay = initial_delay

        for attempt in range(max_retries):
            try:
                logger.info(f"🔄 {operation_name} - Attempt {attempt + 1}/{max_retries}")
                result = await func(*args, **kwargs)
                if attempt > 0:
                    logger.info(f"✅ {operation_name} succeeded on retry {attempt + 1}")
                return result

            except Exception as e:
                last_error = e
                error_msg = f"{type(e).__name__}: {str(e)}"
                logger.warning(f"⚠️ {operation_name} failed (attempt {attempt + 1}/{max_retries}): {error_msg}")

                if attempt < max_retries - 1:
                    logger.info(f"⏳ Retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                    delay *= backoff_factor
                else:
                    logger.error(f"❌ {operation_name} failed after {max_retries} attempts")
                    logger.error(f"   Final traceback:\n{traceback.format_exc()}")

        raise Exception(f"{operation_name} failed after {max_retries} attempts: {last_error}")

    async def generate_profile(
        self,
        session_id: str,
        user_id: str,
        db: AsyncSession,
    ) -> HolisticProfile:
        """
        Generate complete holistic profile from questionnaire session

        Args:
            session_id: Questionnaire session ID
            user_id: User ID
            db: Database session

        Returns:
            Complete HolisticProfile instance

        Raises:
            Exception if session not found or incomplete

        Example:
            ```python
            profile = await service.generate_profile(
                session_id="abc123",
                user_id="user456",
                db=db_session
            )
            ```
        """
        logger.info(f"🌟 Starting holistic profile generation for session {session_id}")

        try:
            # 1. Load questionnaire session
            session = await self._load_session(session_id, db)

            if not session:
                raise ValueError(f"Questionnaire session {session_id} not found")

            # Allow ANALYZED status for regeneration (admin can regenerate already-analyzed sessions)
            if session.status not in [SessionStatus.COMPLETED, SessionStatus.IN_PROGRESS, SessionStatus.ANALYZED]:
                raise ValueError(f"Questionnaire session {session_id} not completed (status: {session.status})")

            # 2. Load responses
            responses = await self._load_responses(session_id, db)

            logger.info(f"📋 Loaded {len(responses)} responses")

            # 3. Load uploaded charts (if any)
            uploaded_charts = await self._load_uploaded_charts(session_id, db)

            # 4. Extract birth data
            birth_data = session.birth_data or {}

            # 4b. Extract full name (priority: session.full_name > Question 1 answer > "Unknown")
            full_name = session.full_name
            if not full_name or full_name.strip() == "" or full_name == "Unknown":
                # Try to get name from Question 1 answer
                q1_response = next((r for r in responses if "nom complet" in r.question_text.lower() or "nom de famille" in r.question_text.lower()), None)
                if q1_response and q1_response.answer:
                    answer = q1_response.answer
                    # Handle AnswerValue format
                    if isinstance(answer, dict) and 'value' in answer:
                        full_name = str(answer['value']).strip()
                    else:
                        full_name = str(answer).strip()
                    logger.info(f"📛 Extracted full_name from Q1: '{full_name}'")

            if not full_name or full_name.strip() == "":
                full_name = "Unknown"
                logger.warning("⚠️ No full_name found in session or Q1 response")

            # 5. Design Humain - Use uploaded chart OR calculate
            if uploaded_charts["design_human"] and uploaded_charts["design_human"].extracted_data:
                logger.info("📊 Using uploaded Design Humain chart (AI-analyzed)")
                design_human = uploaded_charts["design_human"].extracted_data
            else:
                logger.info("🔮 Calculating Design Humain from birth data...")
                design_human = self._calculate_design_human(birth_data)

            # 6. Western Astrology - Use uploaded chart OR calculate
            if uploaded_charts["birth_chart"] and uploaded_charts["birth_chart"].extracted_data:
                logger.info("📊 Using uploaded Birth Chart (AI-analyzed)")
                astrology_western = uploaded_charts["birth_chart"].extracted_data
            else:
                logger.info("✨ Calculating Western Astrology from birth data...")
                astrology_western = self._calculate_astrology(birth_data)

            logger.info("🐉 Calculating Chinese Astrology...")
            astrology_chinese = self._calculate_chinese_astrology(birth_data)

            # 6. Calculate Numerology with Etymology
            logger.info("🔢 Calculating Numerology with etymological analysis...")
            numerology = await self._calculate_numerology(full_name, birth_data)

            # 7. Analyze Psychology (Ollama) - WITH RETRY
            logger.info("🧠 Analyzing psychology (MBTI, Big Five, Enneagram)...")
            psychological_analysis = await self._retry_with_backoff(
                self._analyze_psychology,
                responses,
                max_retries=3,
                initial_delay=2.0,
                operation_name="Psychology Analysis"
            )

            # 8. Analyze Neurodivergence (Ollama) - WITH RETRY + GRACEFUL FALLBACK
            logger.info("🧬 Analyzing neurodivergence patterns...")
            try:
                neurodivergence_analysis = await self._retry_with_backoff(
                    self._analyze_neurodivergence,
                    responses,
                    max_retries=3,
                    initial_delay=2.0,
                    operation_name="Neurodivergence Analysis"
                )
            except Exception as neuro_error:
                # Graceful fallback: don't fail entire profile if neurodivergence fails
                logger.error(f"❌ Neurodivergence analysis failed after all retries: {neuro_error}")
                logger.warning("⚠️ Using fallback neurodivergence profile - will show as 'analysis pending'")
                neurodivergence_analysis = self._get_fallback_neurodivergence_with_message(
                    error_msg=str(neuro_error)
                )

            # 9. Analyze Shinkofa dimensions (Ollama) - WITH RETRY
            logger.info("🌈 Analyzing Shinkofa dimensions...")
            shinkofa_analysis = await self._retry_with_backoff(
                self._analyze_shinkofa,
                responses,
                max_retries=3,
                initial_delay=2.0,
                operation_name="Shinkofa Analysis"
            )

            # 9b. Extract Current Situation (Module A3) - V5.0 for coaching
            logger.info("📍 Extracting current situation (challenges, aspirations)...")
            current_situation = self._extract_current_situation(responses)

            # 9c. Extract Spiritual Abilities (Module H3) - V5.0
            logger.info("✨ Extracting spiritual abilities and experiences...")
            spiritual_abilities = self._extract_spiritual_abilities(responses)

            # 10. Generate AI Synthesis (Ollama) - WITH RETRY (most critical operation)
            logger.info(f"📝 Generating AI synthesis for {full_name} (V5.0 - this may take 90-180s)...")
            synthesis = await self._retry_with_backoff(
                self.psych_service.generate_synthesis,
                psychological_profile=psychological_analysis,
                neurodivergence_profile=neurodivergence_analysis,
                shinkofa_profile=shinkofa_analysis,
                design_human=design_human,
                astrology=astrology_western,
                numerology=numerology,
                full_name=full_name,
                current_situation=current_situation,  # V5.0: Add current situation for coaching
                spiritual_abilities=spiritual_abilities,  # V5.0: Add spiritual abilities
                max_retries=3,
                initial_delay=5.0,
                backoff_factor=3.0,
                operation_name="AI Synthesis Generation"
            )

            # 11. Generate recommendations
            recommendations = self._generate_recommendations(
                psychological_analysis,
                neurodivergence_analysis,
                shinkofa_analysis,
                design_human,
            )

            # 12. Handle versioning - Check for existing profiles
            existing_profiles_result = await db.execute(
                select(HolisticProfile)
                .where(HolisticProfile.user_id == user_id)
                .order_by(HolisticProfile.version.desc())
            )
            existing_profiles = existing_profiles_result.scalars().all()

            # Calculate new version number
            if existing_profiles:
                latest_version = existing_profiles[0].version
                new_version = latest_version + 1
                logger.info(f"🔄 Existing profiles found. Creating version {new_version}")

                # Deactivate all previous versions
                for old_profile in existing_profiles:
                    old_profile.is_active = False
            else:
                new_version = 1
                logger.info(f"✨ First profile generation. Creating version {new_version}")

            # 13. Create HolisticProfile instance with versioning
            profile = HolisticProfile(
                id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                version=new_version,
                version_name=None,  # User can customize later via PATCH endpoint
                is_active=True,  # New version is always active
                psychological_analysis=psychological_analysis,
                neurodivergence_analysis=neurodivergence_analysis,
                shinkofa_analysis=shinkofa_analysis,
                design_human=design_human,
                astrology_western=astrology_western,
                astrology_chinese=astrology_chinese,
                numerology=numerology,
                synthesis=synthesis,
                recommendations=recommendations,
                generated_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )

            # 14. Save to database
            db.add(profile)

            # 15. Update session status
            session.status = SessionStatus.ANALYZED
            session.analyzed_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(profile)

            logger.info(f"✅ Holistic profile v{new_version} generated successfully (ID: {profile.id})")
            return profile

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Holistic profile generation error: {error_msg}")
            logger.error(f"   Session ID: {session_id}")
            logger.error(f"   User ID: {user_id}")
            logger.error(f"   Full traceback:\n{traceback.format_exc()}")
            await db.rollback()
            raise Exception(f"Profile generation failed: {error_msg}")

    async def _load_session(self, session_id: str, db: AsyncSession) -> Optional[QuestionnaireSession]:
        """Load questionnaire session from database"""
        result = await db.execute(
            select(QuestionnaireSession).where(QuestionnaireSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def _load_responses(self, session_id: str, db: AsyncSession) -> List[QuestionnaireResponse]:
        """Load all responses for session"""
        result = await db.execute(
            select(QuestionnaireResponse)
            .where(QuestionnaireResponse.session_id == session_id)
            .order_by(QuestionnaireResponse.answered_at)
        )
        return list(result.scalars().all())

    async def _load_uploaded_charts(self, session_id: str, db: AsyncSession) -> Dict[str, Optional[UploadedChart]]:
        """
        Load uploaded charts for session (Design Humain and/or Birth Chart)

        Returns:
            Dict with:
            {
                "design_human": UploadedChart or None,
                "birth_chart": UploadedChart or None
            }
        """
        result = await db.execute(
            select(UploadedChart)
            .where(UploadedChart.session_id == session_id)
            .where(UploadedChart.status == ChartStatus.PROCESSED)  # Only PROCESSED charts
        )
        charts = list(result.scalars().all())

        charts_dict = {
            "design_human": None,
            "birth_chart": None
        }

        for chart in charts:
            if chart.chart_type == ChartType.DESIGN_HUMAN:
                charts_dict["design_human"] = chart
                logger.info(f"✅ Found uploaded Design Humain chart (ID: {chart.id})")
            elif chart.chart_type == ChartType.BIRTH_CHART:
                charts_dict["birth_chart"] = chart
                logger.info(f"✅ Found uploaded Birth Chart (ID: {chart.id})")

        return charts_dict

    def _calculate_design_human(self, birth_data: Dict) -> Dict:
        """Calculate Design Humain chart"""
        try:
            if not birth_data:
                logger.warning("⚠️ No birth data - returning empty Design Humain")
                return {}

            return self.dh_service.calculate_chart(
                birth_date=birth_data.get("date", "1990-01-01"),
                birth_time=birth_data.get("time", "12:00:00"),
                latitude=birth_data.get("latitude", 48.8566),
                longitude=birth_data.get("longitude", 2.3522),
                timezone_offset=birth_data.get("utc_offset", "+00:00"),
            )

        except Exception as e:
            logger.error(f"❌ Design Humain calculation error: {e}")
            return {}

    def _calculate_astrology(self, birth_data: Dict) -> Dict:
        """Calculate Western Astrology chart"""
        try:
            if not birth_data:
                logger.warning("⚠️ No birth data - returning empty Astrology")
                return {}

            return self.astro_service.calculate_chart(
                birth_date=birth_data.get("date", "1990-01-01"),
                birth_time=birth_data.get("time", "12:00")[:5],  # HH:MM only
                city=birth_data.get("city", "Paris"),
                country=birth_data.get("country", "France"),
                timezone=birth_data.get("timezone", "Europe/Paris"),
                latitude=birth_data.get("latitude"),  # GPS coordinates for precision
                longitude=birth_data.get("longitude"),
            )

        except Exception as e:
            logger.error(f"❌ Astrology calculation error: {e}")
            return {}

    def _calculate_chinese_astrology(self, birth_data: Dict) -> Dict:
        """Calculate Chinese Astrology"""
        try:
            if not birth_data:
                logger.warning("⚠️ No birth data - returning empty Chinese Astrology")
                return {}

            return self.astro_service.calculate_chinese_astrology(
                birth_date=birth_data.get("date", "1990-01-01"),
            )

        except Exception as e:
            logger.error(f"❌ Chinese Astrology calculation error: {e}")
            return {}

    async def _calculate_numerology(self, full_name: str, birth_data: Dict) -> Dict:
        """Calculate Numerology chart with holistic name analysis (etymology + anthroponymy + energetic weight)"""
        try:
            if not full_name or not birth_data:
                logger.warning("⚠️ Missing name or birth data - returning empty Numerology")
                return {}

            # Calculate basic numerology chart
            numerology = self.num_service.calculate_chart(
                full_name=full_name,
                birth_date=birth_data.get("date", "1990-01-01"),
            )

            # Extract first and last names
            name_parts = full_name.strip().split()
            if len(name_parts) >= 1:
                first_name = name_parts[0]
                last_name = name_parts[-1] if len(name_parts) > 1 else ""

                # Generate holistic name analysis (etymology + anthroponymy + energetic weight)
                logger.info(f"🌟 Generating holistic name analysis for {first_name} {last_name}...")
                name_holistic_analysis = await self.name_holistic_service.analyze_full_name_holistic(
                    first_name=first_name,
                    last_name=last_name,
                    numerology_data={
                        "expression": numerology.get("expression", {}),
                        "active": numerology.get("active", {}),
                        "hereditary": numerology.get("hereditary", {}),
                        "soul_urge": numerology.get("soul_urge", {}),
                        "personality": numerology.get("personality", {}),
                    },
                )

                # Enrich numerology data with holistic name analysis AND explicit names
                numerology["name_holistic_analysis"] = name_holistic_analysis
                numerology["first_name"] = first_name
                numerology["last_name"] = last_name

                logger.info("✅ Holistic name analysis added to numerology chart")

            return numerology

        except Exception as e:
            logger.error(f"❌ Numerology calculation error: {e}")
            return {}

    async def _analyze_psychology(self, responses: List[QuestionnaireResponse]) -> Dict:
        """Analyze psychology (MBTI, Big Five, Enneagram, PNL, PCM, VAKOG, Love Languages) using Ollama"""
        try:
            # Convert responses to dict format for analysis
            responses_dict = [
                {
                    "bloc": r.bloc,
                    "question_text": r.question_text,
                    "answer": r.answer,
                    "question_type": r.question_type,
                }
                for r in responses
            ]

            # Run all analyses (sequential to avoid overwhelming Ollama)
            logger.info("  → Analyzing MBTI...")
            mbti = await self.psych_service.analyze_mbti(responses_dict)

            logger.info("  → Analyzing Big Five...")
            big_five = await self.psych_service.analyze_big_five(responses_dict)

            logger.info("  → Analyzing Enneagram...")
            enneagram = await self.psych_service.analyze_enneagram(responses_dict)

            logger.info("  → Analyzing PNL meta-programs...")
            pnl = await self.psych_service.analyze_pnl_meta_programs(responses_dict)

            logger.info("  → Analyzing PCM...")
            pcm = await self.psych_service.analyze_pcm(responses_dict)

            logger.info("  → Analyzing VAKOG...")
            vakog = await self.psych_service.analyze_vakog(responses_dict)

            logger.info("  → Analyzing Love Languages...")
            love_languages = await self.psych_service.analyze_love_languages(responses_dict)

            return {
                "mbti": mbti,
                "big_five": big_five,
                "enneagram": enneagram,
                "pnl": pnl,
                "pcm": pcm,
                "vakog": vakog,
                "love_languages": love_languages,
            }

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Psychology analysis error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            # Re-raise to trigger retry mechanism
            raise Exception(f"Psychology analysis failed: {error_msg}")

    async def _analyze_neurodivergence(self, responses: List[QuestionnaireResponse]) -> Dict:
        """Analyze neurodivergence patterns using Ollama"""
        try:
            responses_dict = [
                {
                    "bloc": r.bloc,
                    "question_text": r.question_text,
                    "answer": r.answer,
                    "question_type": r.question_type,
                }
                for r in responses
            ]

            return await self.psych_service.analyze_neurodivergence(responses_dict)

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Neurodivergence analysis error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            # Re-raise to trigger retry mechanism
            raise Exception(f"Neurodivergence analysis failed: {error_msg}")

    async def _analyze_shinkofa(self, responses: List[QuestionnaireResponse]) -> Dict:
        """Analyze Shinkofa dimensions using Ollama"""
        try:
            responses_dict = [
                {
                    "bloc": r.bloc,
                    "question_text": r.question_text,
                    "answer": r.answer,
                    "question_type": r.question_type,
                }
                for r in responses
            ]

            return await self.psych_service.analyze_shinkofa_dimensions(responses_dict)

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Shinkofa analysis error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            # Re-raise to trigger retry mechanism
            raise Exception(f"Shinkofa analysis failed: {error_msg}")

    def _extract_current_situation(self, responses: List[QuestionnaireResponse]) -> Dict:
        """
        Extract current situation data from Module A3 responses (V5.0)

        Returns structured dict with:
        - challenges: List of current challenges
        - obstacles: List of obstacles preventing goals
        - aspirations: List of 12-month aspirations
        - satisfaction_level: Overall satisfaction (1-10)
        - raw_comments: Free-form comments for context
        """
        current_situation = {
            "challenges": [],
            "obstacles": [],
            "aspirations": [],
            "satisfaction_level": None,
            "raw_comments": []
        }

        # Filter responses from Module A3 (Current Situation & Aspirations)
        a3_responses = [r for r in responses if r.bloc == "A"]

        for response in a3_responses:
            question_text = response.question_text.lower()
            answer = response.answer

            # Extract answer value (handle new AnswerValue format)
            if isinstance(answer, dict) and 'value' in answer:
                answer_value = answer['value']
                answer_comment = answer.get('comment', '')
            else:
                answer_value = answer
                answer_comment = ''

            # Collect free-form comments
            if answer_comment:
                current_situation["raw_comments"].append({
                    "question": response.question_text,
                    "comment": answer_comment
                })

            # Identify question types
            if "principaux défis" in question_text or "challenges" in question_text:
                if isinstance(answer_value, list):
                    current_situation["challenges"] = answer_value
                elif answer_value:
                    current_situation["challenges"] = [answer_value]

            elif "empêche" in question_text or "obstacles" in question_text:
                if isinstance(answer_value, list):
                    current_situation["obstacles"] = answer_value
                elif answer_value:
                    current_situation["obstacles"] = [answer_value]

            elif "aspirations" in question_text or "objectifs" in question_text:
                if isinstance(answer_value, list):
                    current_situation["aspirations"] = answer_value
                elif answer_value:
                    current_situation["aspirations"] = [answer_value]

            elif "où en êtes-vous" in question_text or "satisfaction" in question_text:
                if isinstance(answer_value, (int, float)):
                    current_situation["satisfaction_level"] = answer_value

        logger.info(f"   ✓ Current situation extracted: "
                   f"{len(current_situation['challenges'])} challenges, "
                   f"{len(current_situation['aspirations'])} aspirations")

        return current_situation

    def _extract_spiritual_abilities(self, responses: List[QuestionnaireResponse]) -> Dict:
        """
        Extract spiritual abilities from Module H3 responses (V5.0)

        Returns structured dict with:
        - unusual_experiences: List of spiritual experiences
        - daily_perceptions: List of daily intuitive perceptions
        - energy_practices: Relationship with energy practices
        - resonating_abilities: Abilities that resonate with user
        - raw_comments: Free-form comments for context
        """
        spiritual_abilities = {
            "unusual_experiences": [],
            "daily_perceptions": [],
            "energy_practices": [],
            "resonating_abilities": [],
            "raw_comments": []
        }

        # Filter responses from Module H3 (Spiritual Abilities)
        h3_responses = [r for r in responses if r.bloc == "H"]

        for response in h3_responses:
            question_text = response.question_text.lower()
            answer = response.answer

            # Extract answer value (handle new AnswerValue format)
            if isinstance(answer, dict) and 'value' in answer:
                answer_value = answer['value']
                answer_comment = answer.get('comment', '')
            else:
                answer_value = answer
                answer_comment = ''

            # Collect free-form comments
            if answer_comment:
                spiritual_abilities["raw_comments"].append({
                    "question": response.question_text,
                    "comment": answer_comment
                })

            # Identify question types
            if "expériences" in question_text and "inhabituelles" in question_text:
                if isinstance(answer_value, list):
                    spiritual_abilities["unusual_experiences"] = answer_value
                elif answer_value:
                    spiritual_abilities["unusual_experiences"] = [answer_value]

            elif "quotidien" in question_text or "il vous arrive" in question_text:
                if isinstance(answer_value, list):
                    spiritual_abilities["daily_perceptions"] = answer_value
                elif answer_value:
                    spiritual_abilities["daily_perceptions"] = [answer_value]

            elif "rapport aux pratiques" in question_text or "pratiques énergétiques" in question_text:
                if isinstance(answer_value, list):
                    spiritual_abilities["energy_practices"] = answer_value
                elif answer_value:
                    spiritual_abilities["energy_practices"] = [answer_value]

            elif "capacités" in question_text and ("résonnent" in question_text or "intéressent" in question_text):
                if isinstance(answer_value, list):
                    spiritual_abilities["resonating_abilities"] = answer_value
                elif answer_value:
                    spiritual_abilities["resonating_abilities"] = [answer_value]

        logger.info(f"   ✓ Spiritual abilities extracted: "
                   f"{len(spiritual_abilities['unusual_experiences'])} experiences, "
                   f"{len(spiritual_abilities['daily_perceptions'])} daily perceptions")

        return spiritual_abilities

    def _generate_recommendations(
        self,
        psychological: Dict,
        neurodivergence: Dict,
        shinkofa: Dict,
        design_human: Dict,
    ) -> Dict:
        """
        Generate actionable recommendations based on profile

        Returns structured recommendations for:
        - Daily routines
        - Energy management
        - Task organization
        - Relationship strategies
        - Growth areas
        """
        recommendations = {
            "energy_management": [],
            "task_organization": [],
            "relationship_strategies": [],
            "growth_areas": [],
            "daily_rituals": [],
        }

        # Design Humain recommendations
        if design_human:
            dh_type = design_human.get("type", "")
            authority = design_human.get("authority", "")

            if dh_type == "projector":
                recommendations["energy_management"].append({
                    "category": "Design Humain",
                    "recommendation": "Respecter les invitations - Ne pas forcer l'action",
                    "rationale": f"Type Projecteur avec autorité {authority}",
                })

            if authority == "splenic":
                recommendations["decision_making"] = [{
                    "category": "Design Humain",
                    "recommendation": "Écouter ressenti corporel instantané pour décisions",
                    "rationale": "Autorité Splénique - intuition du moment",
                }]

        # Helper to get score from both old (score) and new (score_global) formats
        def get_neuro_score(data: Dict, key: str) -> int:
            item = data.get(key, {})
            return item.get("score_global") or item.get("score") or 0

        # ADHD recommendations
        if get_neuro_score(neurodivergence, "adhd") > 60:
            recommendations["task_organization"].append({
                "category": "TDAH",
                "recommendation": "Pomodoro adaptatif (25 min focus + 5 min pause)",
                "rationale": "Score TDAH élevé - besoin de pauses fréquentes",
            })

        # HPI recommendations
        if get_neuro_score(neurodivergence, "hpi") > 70:
            recommendations["growth_areas"].append({
                "category": "HPI",
                "recommendation": "Stimulation intellectuelle quotidienne + projets complexes",
                "rationale": "Haut Potentiel Intellectuel - besoin de défi mental",
            })

        return recommendations

    def _get_fallback_neurodivergence_with_message(self, error_msg: str = "") -> Dict:
        """
        Create informative fallback neurodivergence profile when analysis fails

        Unlike the empty fallback, this one provides context to the user about why
        the analysis is pending and suggests regeneration.

        Args:
            error_msg: Error message for logging/debugging

        Returns:
            Dict with fallback profile containing informative messages
        """
        # Informative profile that explains the situation
        pending_profile = {
            "score_global": -1,  # -1 indicates "pending analysis" (not 0 which means "absent")
            "score": -1,
            "profil": "analysis_pending",
            "profil_label": "Analyse en attente - veuillez régénérer le profil",
            "profile": "Analyse en attente",
            "dimensions": {},
            "manifestations_principales": [
                "L'analyse de cette section n'a pas pu être complétée.",
                "Cliquez sur 'Enrichir avec Shizen' pour relancer l'analyse.",
            ],
            "manifestations": [],
            "strategies_adaptation": [
                "Régénérez votre profil pour obtenir une analyse complète.",
                "Si le problème persiste, contactez le support.",
            ],
            "strategies": [],
            "_error": error_msg[:200] if error_msg else "Analysis timeout or LLM error",
            "_pending": True,
        }

        logger.warning(f"⚠️ Creating fallback neurodivergence profile due to: {error_msg[:100]}")

        return {
            "adhd": {**pending_profile, "profil_label": "TDAH - Analyse en attente"},
            "autism": {**pending_profile, "profil_label": "TSA - Analyse en attente"},
            "hpi": {**pending_profile, "profil_label": "HPI - Analyse en attente"},
            "multipotentiality": {**pending_profile, "profil_label": "Multipotentialité - Analyse en attente"},
            "hypersensitivity": {**pending_profile, "profil_label": "Hypersensibilité - Analyse en attente", "types": []},
            "toc": {**pending_profile, "profil_label": "TOC - Analyse en attente"},
            "dys": {**pending_profile, "profil_label": "Dys - Analyse en attente", "types_detectes": []},
            "anxiety": {**pending_profile, "profil_label": "Anxiété - Analyse en attente"},
            "bipolar": {**pending_profile, "profil_label": "Bipolarité - Analyse en attente"},
            "ptsd": {**pending_profile, "profil_label": "PTSD - Analyse en attente"},
            "eating_disorder": {**pending_profile, "profil_label": "Troubles alimentaires - Analyse en attente", "types_detectes": []},
            "sleep_disorder": {**pending_profile, "profil_label": "Troubles sommeil - Analyse en attente", "types_detectes": []},
            "_analysis_status": "pending",
            "_error_summary": error_msg[:200] if error_msg else "LLM analysis failed",
        }


# Singleton instance
_holistic_service: Optional[HolisticProfileService] = None


def get_holistic_profile_service() -> HolisticProfileService:
    """Get or create Holistic Profile service singleton"""
    global _holistic_service
    if _holistic_service is None:
        _holistic_service = HolisticProfileService()
    return _holistic_service
