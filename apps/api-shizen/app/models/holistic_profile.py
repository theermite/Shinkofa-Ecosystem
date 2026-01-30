"""
HolisticProfile model
Shinkofa Platform - Holistic Questionnaire
"""
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Text, Integer, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class HolisticProfile(Base):
    """
    Holistic profile generated from questionnaire + DH/Astro/Numerology

    Stores complete analysis:
    - Psychological (MBTI, Big Five, Enneagram, PNL, PCM, VAKOG)
    - Neurodivergences (ADHD, Autism, HPI, etc.)
    - Shinkofa dimensions (Life wheel, Archetypes, etc.)
    - Design Human (Type, Authority, Profile, Centers, Gates)
    - Astrology (Western + Chinese)
    - Numerology (Life path, Expression, etc.)
    """
    __tablename__ = "holistic_profiles"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(
        String,
        ForeignKey("questionnaire_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service

    # Versioning fields (allow multiple profile generations per session)
    version = Column(Integer, nullable=False, default=1)  # Auto-incremented version number
    version_name = Column(String, nullable=True)  # User-customizable name (e.g., "After DH correction")
    is_active = Column(Boolean, nullable=False, default=True)  # Only one active version per user

    # Psychological Analysis (Ollama-generated)
    psychological_analysis = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "mbti": {"type": "INTJ", "scores": {...}, "description": "...", "strengths": [...], "challenges": [...]},
    #     "big_five": {"openness": 85, "conscientiousness": 75, ...},
    #     "enneagram": {"type": 5, "wing": 4, "tritype": "531", ...},
    #     "pnl": {"meta_programs": {...}},
    #     "pcm": {"dominant_type": "...", "drivers": [...], ...},
    #     "vakog": {"dominant_channel": "visual", ...},
    #     "love_languages": {"primary": "quality_time", "secondary": "words_of_affirmation"}
    # }

    # Neurodivergence Analysis (Ollama-generated)
    neurodivergence_analysis = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "adhd": {"score": 72, "profile": "inattention", "manifestations": [...], "strategies": [...]},
    #     "autism": {"score": 45, "profile": {...}},
    #     "hpi": {"score": 85, "profile": {...}},
    #     "multipotentiality": {"score": 70, ...},
    #     "hypersensitivity": {"score": 80, "types": ["emotional", "sensory"], ...},
    #     "ocd": {...}, "dys": {...}, "anxiety": {...}, "bipolar": {...}, "ptsd": {...},
    #     "eating_disorders": {...}, "sleep_disorders": {...}
    # }

    # Shinkofa Dimensions (Ollama-generated)
    shinkofa_analysis = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "life_wheel": {"spiritual": 6, "mental": 8, "emotional": 5, ...},
    #     "archetypes": {"primary": "guide", "secondary": "creator", ...},
    #     "limiting_paradigms": ["Je ne suis pas assez...", ...],
    #     "inner_dialogue": {"child": 60, "warrior": 75, "guide": 85, "sage": 70}
    # }

    # Design Human (Calculated via Swiss Ephemeris)
    design_human = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "type": "projector",
    #     "authority": "splenic",
    #     "profile": "1/3",
    #     "definition": "simple",
    #     "strategy": "wait_for_invitation",
    #     "signature": "success",
    #     "not_self": "bitterness",
    #     "defined_centers": ["splenic", "ajna", ...],
    #     "open_centers": ["sacral", "emotional", ...],
    #     "gates": [{"number": 1, "line": 3, "side": "personality"}, ...],
    #     "channels": [{"gates": [1, 8], "name": "Inspiration"}, ...],
    #     "incarnation_cross": "Right Angle Cross of ..."
    # }

    # Astrology Western (Calculated via kerykeion)
    astrology_western = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "sun_sign": "libra",
    #     "moon_sign": "scorpio",
    #     "ascendant": "capricorn",
    #     "houses": [{...}, ...],
    #     "planets": [{"name": "sun", "sign": "libra", "house": 10, "degree": 22.5}, ...],
    #     "aspects": [{"planet1": "sun", "planet2": "moon", "type": "trine", "orb": 3.2}, ...],
    #     "dominant_element": "earth",
    #     "dominant_modality": "cardinal"
    # }

    # Astrology Chinese (Calculated manually)
    astrology_chinese = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "animal_sign": "horse",
    #     "element": "metal",
    #     "yin_yang": "yang",
    #     "compatible_signs": ["tiger", "dog"],
    #     "incompatible_signs": ["rat", "ox"],
    #     "traits": [...]
    # }

    # Numerology (Calculated manually - Pythagorean)
    numerology = Column(JSON, nullable=True)
    # Structure:
    # {
    #     "life_path": 7,
    #     "expression": 11,  # Master number
    #     "soul_urge": 5,
    #     "personality": 6,
    #     "active": 3,
    #     "hereditary": 4,
    #     "challenges": [{"type": "minor_1", "value": 2}, ...],
    #     "cycles": [{"type": "formative", "value": 1}, ...],
    #     "personal_year": 5,
    #     "interpretations": {...}
    # }

    # AI-Generated Synthesis (Ollama - final integration)
    synthesis = Column(Text, nullable=True)  # Long-form text synthesis by Shizen IA
    recommendations = Column(JSON, nullable=True)  # Actionable recommendations

    # Export files paths (if generated)
    pdf_export_path = Column(String, nullable=True)
    markdown_export_path = Column(String, nullable=True)

    # Timestamps (timezone-aware for consistency)
    generated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    session = relationship("QuestionnaireSession", back_populates="profile")
