"""
Design Humain Calculation Service
Shinkofa Platform - Shizen AI

Calculates Human Design chart using Swiss Ephemeris
Determines: Type, Authority, Profile, Centers, Gates, Channels, Incarnation Cross

References:
- pyswisseph documentation: https://www.astro.com/swisseph/
- Human Design system: https://www.jovianarchive.com/
"""
import swisseph as swe
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Swiss Ephemeris file path (ephemeris data)
# By default, pyswisseph looks in current directory or /usr/share/swisseph
# You may need to download ephemeris files from https://www.astro.com/ftp/swisseph/ephe/
swe.set_ephe_path("/usr/share/swisseph")  # Linux default, adjust for Windows if needed


class DesignHumanService:
    """
    Design Humain calculation service

    Calculates complete Human Design chart from birth data
    """

    # Hexagram I-Ching correspondences (64 gates)
    GATES = list(range(1, 65))

    # Human Design Gate Wheel (I-Ching order starting from Aquarius 27° = 302°)
    # Gate 41 starts at 302°, then follows I-Ching sequence around the wheel
    # Each gate = 5.625° (360° / 64 gates)
    # Reference: https://github.com/ppo/pyhd/blob/main/pyhd/gates.py
    GATE_WHEEL = [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ]

    # Gate wheel start position (Aquarius 27° = 302°)
    GATE_WHEEL_OFFSET = 302.0

    # Centers in Human Design
    CENTERS = [
        "head", "ajna", "throat", "g_center", "heart_will",
        "solar_plexus", "sacral", "root", "spleen"
    ]

    # The 36 Human Design Channels (gate pairs)
    # A channel is defined when BOTH gates are activated
    # Reference: https://freehumandesignchart.com/human-design-channels/
    # Format: tuple of two gate numbers
    CHANNELS = [
        (1, 8), (2, 14), (3, 60), (4, 63), (5, 15), (6, 59),
        (7, 31), (9, 52), (10, 20), (10, 34), (10, 57), (11, 56),
        (12, 22), (13, 33), (16, 48), (17, 62), (18, 58), (19, 49),
        (20, 34), (20, 57), (21, 45), (23, 43), (24, 61), (25, 51),
        (26, 44), (27, 50), (28, 38), (29, 46), (30, 41), (32, 54),
        (34, 57), (35, 36), (37, 40), (39, 55), (42, 53), (47, 64)
    ]

    # Channel to Centers mapping - which two centers each channel connects
    # CRITICAL: This is the source of truth for determining connections between centers
    # Used for path finding to determine if motor centers connect to throat
    CHANNEL_CENTERS = {
        # Format: (gate1, gate2): (center1, center2)
        # Head ↔ Ajna
        (4, 63): ("ajna", "head"),
        (24, 61): ("ajna", "head"),
        (47, 64): ("ajna", "head"),
        # Ajna ↔ Throat
        (11, 56): ("ajna", "throat"),
        (17, 62): ("ajna", "throat"),
        (23, 43): ("ajna", "throat"),
        # G Center ↔ Throat
        (1, 8): ("g_center", "throat"),
        (7, 31): ("g_center", "throat"),
        (10, 20): ("g_center", "throat"),
        (13, 33): ("g_center", "throat"),
        # G Center ↔ Sacral
        (2, 14): ("g_center", "sacral"),
        (5, 15): ("g_center", "sacral"),
        (10, 34): ("g_center", "sacral"),
        (29, 46): ("g_center", "sacral"),
        # G Center ↔ Spleen
        (10, 57): ("g_center", "spleen"),
        # G Center ↔ Heart
        (25, 51): ("g_center", "heart_will"),
        # Throat ↔ Sacral (DIRECT motor-throat)
        (20, 34): ("throat", "sacral"),
        # Throat ↔ Spleen
        (16, 48): ("throat", "spleen"),
        (20, 57): ("throat", "spleen"),
        # Throat ↔ Solar Plexus (DIRECT motor-throat)
        (12, 22): ("throat", "solar_plexus"),
        (35, 36): ("throat", "solar_plexus"),
        # Throat ↔ Heart (DIRECT motor-throat)
        (21, 45): ("throat", "heart_will"),
        # Sacral ↔ Spleen
        (27, 50): ("sacral", "spleen"),
        (34, 57): ("sacral", "spleen"),
        # Sacral ↔ Root
        (3, 60): ("sacral", "root"),
        (9, 52): ("sacral", "root"),
        (42, 53): ("sacral", "root"),
        # Sacral ↔ Solar Plexus
        (6, 59): ("sacral", "solar_plexus"),
        # Spleen ↔ Root
        (18, 58): ("spleen", "root"),
        (28, 38): ("spleen", "root"),
        (32, 54): ("spleen", "root"),
        # Spleen ↔ Heart
        (26, 44): ("spleen", "heart_will"),
        # Solar Plexus ↔ Root
        (19, 49): ("solar_plexus", "root"),
        (30, 41): ("solar_plexus", "root"),
        (39, 55): ("solar_plexus", "root"),
        # Solar Plexus ↔ Heart
        (37, 40): ("solar_plexus", "heart_will"),
    }

    # Motor centers in Human Design (can initiate action)
    MOTOR_CENTERS = ["sacral", "solar_plexus", "heart_will", "root"]

    # Human Design Types
    TYPES = {
        "generator": "Generator",
        "manifesting_generator": "Manifesting Generator",
        "projector": "Projector",
        "manifestor": "Manifestor",
        "reflector": "Reflector"
    }

    # Authorities
    AUTHORITIES = [
        "emotional", "sacral", "splenic", "ego", "self_projected",
        "mental", "lunar", "none"
    ]

    # 192 Incarnation Cross names lookup table
    # Key: Personality Sun gate number
    # Value: dict with right_angle, juxtaposition, left_angle names
    # Reference: Jovian Archive, Genetic Matrix, humandesign4all.com
    INCARNATION_CROSS_NAMES = {
        1: {"right_angle": "The Sphinx", "juxtaposition": "Self-Expression", "left_angle": "Defiance"},
        2: {"right_angle": "The Sphinx", "juxtaposition": "The Driver", "left_angle": "Defiance"},
        3: {"right_angle": "Laws", "juxtaposition": "Mutation", "left_angle": "Wishes"},
        4: {"right_angle": "Explanation", "juxtaposition": "Formulization", "left_angle": "Revolution"},
        5: {"right_angle": "Consciousness", "juxtaposition": "Habits", "left_angle": "Separation"},
        6: {"right_angle": "Eden", "juxtaposition": "Conflict", "left_angle": "The Plane"},
        7: {"right_angle": "The Sphinx", "juxtaposition": "Interaction", "left_angle": "Masks"},
        8: {"right_angle": "Contagion", "juxtaposition": "Contribution", "left_angle": "Uncertainty"},
        9: {"right_angle": "Planning", "juxtaposition": "Focus", "left_angle": "Identification"},
        10: {"right_angle": "The Vessel of Love", "juxtaposition": "Behavior", "left_angle": "Prevention"},
        11: {"right_angle": "Eden", "juxtaposition": "Ideas", "left_angle": "Education"},
        12: {"right_angle": "Eden", "juxtaposition": "Articulation", "left_angle": "Education"},
        13: {"right_angle": "The Sphinx", "juxtaposition": "Listening", "left_angle": "Masks"},
        14: {"right_angle": "Contagion", "juxtaposition": "Empowering", "left_angle": "Uncertainty"},
        15: {"right_angle": "The Vessel of Love", "juxtaposition": "Extremes", "left_angle": "Prevention"},
        16: {"right_angle": "Planning", "juxtaposition": "Experimentation", "left_angle": "Identification"},
        17: {"right_angle": "Service", "juxtaposition": "Opinions", "left_angle": "Upheaval"},
        18: {"right_angle": "Service", "juxtaposition": "Correction", "left_angle": "Upheaval"},
        19: {"right_angle": "The Four Ways", "juxtaposition": "Need", "left_angle": "Refinement"},
        20: {"right_angle": "The Sleeping Phoenix", "juxtaposition": "The Now", "left_angle": "Duality"},
        21: {"right_angle": "Tension", "juxtaposition": "Control", "left_angle": "Endeavour"},
        22: {"right_angle": "Rulership", "juxtaposition": "Grace", "left_angle": "Informing"},
        23: {"right_angle": "Explanation", "juxtaposition": "Assimilation", "left_angle": "Dedication"},
        24: {"right_angle": "The Four Ways", "juxtaposition": "Rationalization", "left_angle": "Incarnation"},
        25: {"right_angle": "The Vessel of Love", "juxtaposition": "Innocence", "left_angle": "Healing"},
        26: {"right_angle": "Rulership", "juxtaposition": "The Trickster", "left_angle": "Confrontation"},
        27: {"right_angle": "The Unexpected", "juxtaposition": "Caring", "left_angle": "Alignment"},
        28: {"right_angle": "The Unexpected", "juxtaposition": "Risks", "left_angle": "Alignment"},
        29: {"right_angle": "Contagion", "juxtaposition": "Commitment", "left_angle": "Industry"},
        30: {"right_angle": "Contagion", "juxtaposition": "Fates", "left_angle": "Industry"},
        31: {"right_angle": "The Unexpected", "juxtaposition": "Influence", "left_angle": "The Alpha"},
        32: {"right_angle": "Maya", "juxtaposition": "Conservation", "left_angle": "Limitation"},
        33: {"right_angle": "The Four Ways", "juxtaposition": "Retreat", "left_angle": "Refinement"},
        34: {"right_angle": "The Sleeping Phoenix", "juxtaposition": "Power", "left_angle": "Duality"},
        35: {"right_angle": "Consciousness", "juxtaposition": "Experience", "left_angle": "Separation"},
        36: {"right_angle": "Eden", "juxtaposition": "Crisis", "left_angle": "The Plane"},
        37: {"right_angle": "Planning", "juxtaposition": "Bargains", "left_angle": "Migration"},
        38: {"right_angle": "Tension", "juxtaposition": "Opposition", "left_angle": "Individualism"},
        39: {"right_angle": "Tension", "juxtaposition": "Provocation", "left_angle": "Individualism"},
        40: {"right_angle": "Planning", "juxtaposition": "Denial", "left_angle": "Migration"},
        41: {"right_angle": "The Unexpected", "juxtaposition": "Fantasy", "left_angle": "The Alpha"},
        42: {"right_angle": "Maya", "juxtaposition": "Completion", "left_angle": "Limitation"},
        43: {"right_angle": "Explanation", "juxtaposition": "Insight", "left_angle": "Dedication"},
        44: {"right_angle": "The Four Ways", "juxtaposition": "Alertness", "left_angle": "Incarnation"},
        45: {"right_angle": "Rulership", "juxtaposition": "Possession", "left_angle": "Confrontation"},
        46: {"right_angle": "The Vessel of Love", "juxtaposition": "Serendipity", "left_angle": "Healing"},
        47: {"right_angle": "Rulership", "juxtaposition": "Oppression", "left_angle": "Informing"},
        48: {"right_angle": "Tension", "juxtaposition": "Depth", "left_angle": "Endeavour"},
        49: {"right_angle": "Explanation", "juxtaposition": "Principles", "left_angle": "Revolution"},
        50: {"right_angle": "Laws", "juxtaposition": "Values", "left_angle": "Wishes"},
        51: {"right_angle": "Penetration", "juxtaposition": "Shock", "left_angle": "The Clarion"},
        52: {"right_angle": "Service", "juxtaposition": "Stillness", "left_angle": "Demands"},
        53: {"right_angle": "Penetration", "juxtaposition": "Beginnings", "left_angle": "Cycles"},
        54: {"right_angle": "Penetration", "juxtaposition": "Ambition", "left_angle": "Cycles"},
        55: {"right_angle": "The Sleeping Phoenix", "juxtaposition": "Moods", "left_angle": "Spirit"},
        56: {"right_angle": "Laws", "juxtaposition": "Stimulation", "left_angle": "Distraction"},
        57: {"right_angle": "Penetration", "juxtaposition": "Intuition", "left_angle": "The Clarion"},
        58: {"right_angle": "Service", "juxtaposition": "Vitality", "left_angle": "Demands"},
        59: {"right_angle": "The Sleeping Phoenix", "juxtaposition": "Strategy", "left_angle": "Spirit"},
        60: {"right_angle": "Laws", "juxtaposition": "Limitation", "left_angle": "Distraction"},
        61: {"right_angle": "Maya", "juxtaposition": "Thinking", "left_angle": "Obscuration"},
        62: {"right_angle": "Maya", "juxtaposition": "Detail", "left_angle": "Obscuration"},
        63: {"right_angle": "Consciousness", "juxtaposition": "Doubts", "left_angle": "Dominion"},
        64: {"right_angle": "Consciousness", "juxtaposition": "Confusion", "left_angle": "Dominion"},
    }

    def __init__(self):
        """Initialize Design Humain service"""
        # Validate Swiss Ephemeris availability
        try:
            swe_version = swe.version
            logger.info(f"✅ Swiss Ephemeris v{swe_version} loaded successfully")
        except Exception as e:
            logger.error(f"❌ Swiss Ephemeris initialization failed: {e}")
            raise RuntimeError(
                "Swiss Ephemeris library is required for Design Humain calculations. "
                "Please ensure pyswisseph is installed: pip install pyswisseph"
            )

        logger.info("🔮 Design Humain Service initialized")

    def _parse_timezone_offset(self, offset: str) -> float:
        """
        Parse timezone offset string to hours

        Args:
            offset: Timezone offset string (e.g., "+01:00", "-05:30", "+00:00")

        Returns:
            Offset in hours (e.g., 1.0, -5.5, 0.0)

        Examples:
            "+01:00" -> 1.0
            "-05:30" -> -5.5
            "+00:00" -> 0.0
        """
        try:
            # Handle various formats
            offset = offset.strip()

            # Remove 'UTC' prefix if present
            if offset.upper().startswith('UTC'):
                offset = offset[3:]

            # Default to 0 if empty
            if not offset or offset == 'Z':
                return 0.0

            # Parse sign
            sign = 1
            if offset.startswith('-'):
                sign = -1
                offset = offset[1:]
            elif offset.startswith('+'):
                offset = offset[1:]

            # Parse hours and minutes
            if ':' in offset:
                parts = offset.split(':')
                hours = int(parts[0])
                minutes = int(parts[1]) if len(parts) > 1 else 0
            else:
                # Handle format like "+01" without minutes
                hours = int(offset)
                minutes = 0

            return sign * (hours + minutes / 60.0)

        except Exception as e:
            logger.warning(f"⚠️ Could not parse timezone offset '{offset}': {e}, defaulting to 0")
            return 0.0

    def calculate_chart(
        self,
        birth_date: str,  # YYYY-MM-DD
        birth_time: str,  # HH:MM:SS
        latitude: float,
        longitude: float,
        timezone_offset: str = "+00:00"  # e.g., "+01:00"
    ) -> Dict:
        """
        Calculate complete Human Design chart

        Args:
            birth_date: Birth date (YYYY-MM-DD)
            birth_time: Birth time (HH:MM:SS in LOCAL time)
            latitude: Birth location latitude
            longitude: Birth location longitude
            timezone_offset: Timezone offset from UTC (e.g., "+01:00", "-05:00")

        Returns:
            Complete Human Design chart dictionary

        Example:
            ```python
            chart = service.calculate_chart(
                birth_date="1990-06-15",
                birth_time="14:30:00",
                latitude=48.8566,
                longitude=2.3522,
                timezone_offset="+01:00"
            )
            ```

        Note:
            The birth_time is expected in LOCAL time. The timezone_offset is used
            to convert to UTC for accurate Swiss Ephemeris calculations.
        """
        try:
            # Parse birth datetime (local time)
            dt_str = f"{birth_date} {birth_time}"
            birth_dt_local = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")

            # CRITICAL: Convert local time to UTC using timezone offset
            # The Swiss Ephemeris requires UTC time for accurate calculations
            utc_offset_hours = self._parse_timezone_offset(timezone_offset)
            birth_dt_utc = birth_dt_local - timedelta(hours=utc_offset_hours)

            logger.info(f"📅 Birth time conversion: {birth_dt_local} (local, {timezone_offset}) -> {birth_dt_utc} (UTC)")

            # Convert to Julian Day (used by Swiss Ephemeris) - NOW IN UTC
            jd_personality = self._datetime_to_jd(birth_dt_utc)

            # Calculate Design date (88° solar arc before birth - NOT 88 days!)
            jd_design = self._calculate_design_time(jd_personality)

            # Calculate planetary positions
            personality_planets = self._calculate_planetary_positions(jd_personality)
            design_planets = self._calculate_planetary_positions(jd_design)

            # Extract gates from planetary positions
            personality_gates = self._planets_to_gates(personality_planets)
            design_gates = self._planets_to_gates(design_planets)

            # CRITICAL FIX: Update side for design gates (they're marked "personality" by default in _planets_to_gates)
            for gate in design_gates:
                gate["side"] = "design"

            # Determine defined centers
            all_gates = personality_gates + design_gates
            defined_centers = self._determine_centers(all_gates)

            # Determine type based on centers AND gates (to check motor-throat channels)
            chart_type = self._determine_type(defined_centers, all_gates)

            # Determine authority
            authority = self._determine_authority(defined_centers, all_gates)

            # Determine profile (based on Sun/Earth gates)
            profile = self._determine_profile(personality_gates, design_gates)

            # Determine channels
            channels = self._determine_channels(all_gates)

            # Calculate Variable (4 arrows)
            variable = self._calculate_variable(personality_gates, design_gates)

            # Build complete chart
            chart = {
                "type": chart_type,
                "authority": authority,
                "profile": profile,
                "definition": self._determine_definition(defined_centers, channels),
                "strategy": self._get_strategy(chart_type),
                "signature": self._get_signature(chart_type),
                "not_self": self._get_not_self(chart_type),
                "defined_centers": defined_centers,
                "open_centers": [c for c in self.CENTERS if c not in defined_centers],
                "gates": all_gates,
                "channels": channels,
                "incarnation_cross": self._determine_incarnation_cross(personality_gates, design_gates, profile),
                "variable": variable,
                "personality_planets": personality_planets,
                "design_planets": design_planets,
            }

            logger.info(f"✅ Design Humain chart calculated: Type={chart_type}, Authority={authority}")
            return chart

        except Exception as e:
            logger.error(f"❌ Design Humain calculation error: {e}")
            raise Exception(f"Design Humain calculation failed: {str(e)}")

    def _datetime_to_jd(self, dt: datetime) -> float:
        """Convert datetime to Julian Day"""
        return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0 + dt.second/3600.0)

    def _calculate_design_time(self, jd_personality: float) -> float:
        """
        Calculate Design Time using 88° solar arc (Newton-Raphson)

        Design time is NOT 88 days before birth, but the moment when
        the Sun was 88° of solar arc before its birth position.

        This is critical for accurate Human Design calculation.
        The Sun moves at varying speeds (~0.95-1.02°/day), so we need
        iterative calculation to find the exact moment.

        Args:
            jd_personality: Julian Day of birth (personality)

        Returns:
            Julian Day of design moment (typically ~88-89 days before birth)

        References:
            - PyHD implementation: https://github.com/ppo/pyhd
            - Human Design system: Sun position exactly 88° before birth
        """
        # Get Sun position at birth
        sun_birth = swe.calc_ut(jd_personality, swe.SUN)[0][0]

        # Target: Sun position 88° before birth position
        target_position = (sun_birth - 88.0) % 360.0

        # Initial guess: ~88 days before birth (Sun moves ~1°/day)
        jd_design = jd_personality - 88.0

        # Newton-Raphson iteration
        max_iterations = 20
        tolerance = 0.0001  # 0.0001° precision (~0.36 arcseconds)

        for i in range(max_iterations):
            # Current Sun position
            sun_current = swe.calc_ut(jd_design, swe.SUN)[0][0]

            # Calculate angular difference (handle 360° wrap)
            diff = (target_position - sun_current + 180.0) % 360.0 - 180.0

            # Check convergence
            if abs(diff) < tolerance:
                logger.info(f"✅ Design Time converged in {i+1} iterations (diff={diff:.6f}°)")
                return jd_design

            # Sun's daily motion (varies 0.95-1.02°/day)
            # Calculate speed at current time
            sun_speed = swe.calc_ut(jd_design, swe.SUN)[0][3]  # [0][3] = speed in °/day

            # Newton-Raphson step: adjust jd by (difference / speed)
            jd_design += diff / sun_speed

        logger.warning(f"⚠️ Design Time did not fully converge after {max_iterations} iterations")
        return jd_design

    def _calculate_planetary_positions(self, jd: float) -> List[Dict]:
        """
        Calculate planetary positions at given Julian Day

        Returns list of planets with their positions in zodiac degrees
        """
        planets = []

        # Planets used in Human Design (Swiss Ephemeris constants)
        planet_ids = [
            (swe.SUN, "sun"),
            (swe.EARTH, "earth"),  # Note: Earth not directly in swisseph, calculate as Sun + 180°
            (swe.MOON, "moon"),
            (swe.MERCURY, "mercury"),
            (swe.VENUS, "venus"),
            (swe.MARS, "mars"),
            (swe.JUPITER, "jupiter"),
            (swe.SATURN, "saturn"),
            (swe.URANUS, "uranus"),
            (swe.NEPTUNE, "neptune"),
            (swe.PLUTO, "pluto"),
            (swe.TRUE_NODE, "north_node"),  # Dragon's Head (Rahu) - True Node for substructure accuracy
            (None, "south_node"),  # Dragon's Tail (Ketu) - calculated as North Node + 180°
        ]

        for planet_id, planet_name in planet_ids:
            try:
                # Calculate position
                if planet_name == "earth":
                    # Earth = Sun + 180°
                    sun_pos = swe.calc_ut(jd, swe.SUN)[0][0]
                    position = (sun_pos + 180.0) % 360.0
                elif planet_name == "south_node":
                    # South Node = North Node + 180°
                    north_node_pos = swe.calc_ut(jd, swe.TRUE_NODE)[0][0]
                    position = (north_node_pos + 180.0) % 360.0
                else:
                    position = swe.calc_ut(jd, planet_id)[0][0]  # [0][0] = longitude

                planets.append({
                    "name": planet_name,
                    "position_degrees": position,
                })

            except Exception as e:
                logger.warning(f"⚠️ Could not calculate {planet_name}: {e}")
                continue

        return planets

    def _planets_to_gates(self, planets: List[Dict]) -> List[Dict]:
        """
        Convert planetary zodiac positions to Human Design gates

        Uses correct I-Ching wheel order starting from Aquarius 27° (302°)
        Gate 41 is at 302°-307.625°, then follows GATE_WHEEL sequence

        Each gate = 5.625° (360° / 64 gates)
        Each line = 0.9375° (5.625° / 6 lines)

        References:
            - PyHD gate mapping: https://github.com/ppo/pyhd
            - Human Design gate wheel starts at Aquarius 27° (302°)
        """
        gates = []

        for planet in planets:
            degrees = planet["position_degrees"]

            # Adjust degrees to Human Design wheel (start at 302°)
            adjusted_degrees = (degrees - self.GATE_WHEEL_OFFSET) % 360.0

            # Find position in gate wheel (0-63)
            wheel_index = int(adjusted_degrees / 5.625)

            # Get gate number from wheel
            gate_number = self.GATE_WHEEL[wheel_index]

            # Calculate line within gate (1-6)
            degrees_in_gate = adjusted_degrees % 5.625
            line_within_gate = int(degrees_in_gate / 0.9375) + 1

            # Calculate Color and Tone (substructure)
            # Each line = 0.9375°, each color = 0.15625° (0.9375/6), each tone = 0.026041666...° (0.9375/36)
            degrees_in_line = degrees_in_gate % 0.9375
            color_size = 0.9375 / 6  # 0.15625° exactly
            color_index = min(int(degrees_in_line / color_size), 5)  # 0-5, clamped
            color = color_index + 1  # Convert to 1-6

            degrees_in_color = degrees_in_line - color_index * color_size
            tone_size = color_size / 6  # 0.9375/36 = 0.026041666...° (exact division)
            tone_index = min(int(degrees_in_color / tone_size), 5)  # 0-5, clamped
            tone = tone_index + 1  # Convert to 1-6

            gates.append({
                "number": gate_number,
                "line": line_within_gate,
                "color": color,
                "tone": tone,
                "planet": planet["name"],
                "side": "personality",  # Will be updated by caller
            })

        return gates

    def _determine_centers(self, gates: List[Dict]) -> List[str]:
        """
        Determine which centers are defined based on activated channels

        CRITICAL: A center is defined ONLY if at least one COMPLETE CHANNEL
        connects it to another center. A channel is complete when BOTH gates
        are activated.

        Individual gates alone do NOT define a center.
        """
        # Gate to Center mapping (all 64 gates)
        gate_to_center = {
            # Head Center (Pressure)
            64: "head", 61: "head", 63: "head",

            # Ajna Center (Mind)
            47: "ajna", 24: "ajna", 4: "ajna", 17: "ajna", 43: "ajna", 11: "ajna",

            # Throat Center (Communication)
            62: "throat", 23: "throat", 56: "throat", 16: "throat", 20: "throat",
            31: "throat", 8: "throat", 33: "throat", 45: "throat", 12: "throat", 35: "throat",

            # G Center (Identity)
            7: "g_center", 1: "g_center", 13: "g_center", 10: "g_center",
            15: "g_center", 46: "g_center", 25: "g_center", 2: "g_center",

            # Heart/Will Center (Ego)
            51: "heart_will", 21: "heart_will", 40: "heart_will", 26: "heart_will",

            # Solar Plexus (Emotions)
            6: "solar_plexus", 37: "solar_plexus", 22: "solar_plexus", 36: "solar_plexus",
            30: "solar_plexus", 55: "solar_plexus", 49: "solar_plexus",

            # Sacral (Life Force)
            5: "sacral", 14: "sacral", 29: "sacral", 59: "sacral", 9: "sacral",
            3: "sacral", 42: "sacral", 27: "sacral", 34: "sacral",

            # Root (Pressure)
            53: "root", 60: "root", 52: "root", 19: "root", 39: "root",
            41: "root", 58: "root", 38: "root", 54: "root",

            # Spleen (Intuition)
            48: "spleen", 57: "spleen", 44: "spleen", 50: "spleen", 32: "spleen", 28: "spleen", 18: "spleen",
        }

        # Get set of activated gate numbers
        activated_gates = {gate["number"] for gate in gates}

        # Determine which channels are complete (both gates activated)
        defined_centers = set()

        for gate1, gate2 in self.CHANNELS:
            if gate1 in activated_gates and gate2 in activated_gates:
                # Channel is complete - define both connected centers
                center1 = gate_to_center.get(gate1)
                center2 = gate_to_center.get(gate2)

                if center1:
                    defined_centers.add(center1)
                if center2:
                    defined_centers.add(center2)

                logger.info(f"✅ Channel {gate1}-{gate2} complete: {center1} ↔ {center2}")

        return list(defined_centers)

    def _determine_type(self, defined_centers: List[str], gates: List[Dict] = None) -> str:
        """
        Determine Human Design type based on defined centers and channel connections

        Logic:
        - Reflector: No centers defined
        - Manifestor: Throat defined + motor connected to throat (not via Sacral)
        - Manifesting Generator: Sacral defined + Sacral connected to Throat (direct or indirect)
        - Generator: Sacral defined, Sacral NOT connected to Throat
        - Projector: No Sacral, no motor to throat

        CRITICAL: Uses path finding (BFS) to detect ANY connection path between centers,
        not just direct channels. This correctly identifies MGs with indirect connections
        (e.g., Sacral → G Center → Throat via channels 34-10 and 10-20).
        """
        if not defined_centers:
            return "reflector"

        sacral_defined = "sacral" in defined_centers
        throat_defined = "throat" in defined_centers

        # Build graph of connected centers based on active channels
        active_channels = self._get_active_channels(gates) if gates else []
        center_connections = self._build_center_graph(active_channels)

        # Check if Sacral is connected to Throat (for MG determination)
        sacral_to_throat = self._has_path_between_centers(
            "sacral", "throat", center_connections
        ) if sacral_defined and throat_defined else False

        # Check if any motor (not Sacral) is connected to Throat (for Manifestor)
        other_motor_to_throat = False
        if throat_defined and not sacral_defined:
            for motor in ["solar_plexus", "heart_will", "root"]:
                if motor in defined_centers:
                    if self._has_path_between_centers(motor, "throat", center_connections):
                        other_motor_to_throat = True
                        logger.info(f"🔗 Motor-Throat path found: {motor} → throat")
                        break

        # Determine type
        if sacral_defined:
            if sacral_to_throat:
                logger.info("✅ Type: Manifesting Generator (Sacral connected to Throat)")
                return "manifesting_generator"
            else:
                logger.info("✅ Type: Generator (Sacral defined, no throat connection)")
                return "generator"

        if throat_defined and other_motor_to_throat:
            logger.info("✅ Type: Manifestor (Motor connected to Throat, no Sacral)")
            return "manifestor"

        logger.info("✅ Type: Projector (no Sacral, no motor-throat connection)")
        return "projector"

    def _get_active_channels(self, gates: List[Dict]) -> List[Tuple[int, int]]:
        """
        Get list of active channels based on activated gates

        A channel is active when BOTH of its gates are activated.
        """
        activated_gate_numbers = {gate["number"] for gate in gates}
        active_channels = []

        for channel in self.CHANNELS:
            gate1, gate2 = channel
            if gate1 in activated_gate_numbers and gate2 in activated_gate_numbers:
                active_channels.append(channel)

        return active_channels

    def _build_center_graph(self, active_channels: List[Tuple[int, int]]) -> Dict[str, set]:
        """
        Build adjacency graph of centers based on active channels

        Returns dict where key is center name and value is set of connected centers
        """
        graph = {center: set() for center in self.CENTERS}

        for channel in active_channels:
            # Normalize channel tuple for lookup (smaller gate first)
            channel_key = tuple(sorted(channel))

            if channel_key in self.CHANNEL_CENTERS:
                center1, center2 = self.CHANNEL_CENTERS[channel_key]
                graph[center1].add(center2)
                graph[center2].add(center1)
                logger.debug(f"📊 Channel {channel}: connects {center1} ↔ {center2}")

        return graph

    def _has_path_between_centers(
        self, start: str, end: str, graph: Dict[str, set]
    ) -> bool:
        """
        Check if there's a path between two centers using BFS

        This correctly handles indirect connections through intermediate centers.
        For example: Sacral → G Center → Throat is detected as a valid path.
        """
        if start == end:
            return True

        if start not in graph or end not in graph:
            return False

        # BFS to find path
        visited = set()
        queue = [start]

        while queue:
            current = queue.pop(0)

            if current == end:
                logger.info(f"🔗 Path found: {start} → ... → {end}")
                return True

            if current in visited:
                continue

            visited.add(current)

            for neighbor in graph[current]:
                if neighbor not in visited:
                    queue.append(neighbor)

        return False

    def _determine_authority(self, defined_centers: List[str], gates: List[Dict]) -> str:
        """
        Determine decision-making authority

        Priority order:
        1. Emotional (Solar Plexus defined)
        2. Sacral (Sacral defined, no Solar Plexus)
        3. Splenic (Spleen defined, no Sacral/Solar Plexus)
        4. Ego (Heart defined, Generators/Manifestors)
        5. Self-Projected (G center to Throat, Projectors)
        6. Mental (Ajna/Head to Throat, Projectors)
        7. Lunar (Reflectors - moon cycle)
        8. None (rare)
        """
        if "solar_plexus" in defined_centers:
            return "emotional"

        if "sacral" in defined_centers:
            return "sacral"

        if "spleen" in defined_centers:
            return "splenic"

        if "heart_will" in defined_centers:
            return "ego"

        if "g_center" in defined_centers and "throat" in defined_centers:
            return "self_projected"

        if ("ajna" in defined_centers or "head" in defined_centers) and "throat" in defined_centers:
            return "mental"

        if not defined_centers:
            return "lunar"

        return "none"

    def _determine_profile(self, personality_gates: List[Dict], design_gates: List[Dict]) -> str:
        """
        Determine profile (e.g., "1/3", "5/1")

        Based on Sun gate line (Personality) and Sun gate line (Design)
        """
        # Get Sun gate lines
        personality_sun = next((g for g in personality_gates if g["planet"] == "sun"), None)
        design_sun = next((g for g in design_gates if g["planet"] == "sun"), None)

        if personality_sun and design_sun:
            return f"{personality_sun['line']}/{design_sun['line']}"

        return "Unknown"

    def _determine_channels(self, gates: List[Dict]) -> List[Dict]:
        """
        Determine activated channels (pairs of connected gates)

        A channel is activated when both gates are present
        """
        # Complete list of 36 Human Design channels with names
        channel_definitions = [
            ([1, 8], "Inspiration"), ([2, 14], "Beat"), ([3, 60], "Mutation"),
            ([4, 63], "Logic"), ([5, 15], "Rhythm"), ([6, 59], "Intimacy"),
            ([7, 31], "Leadership"), ([9, 52], "Concentration"), ([10, 20], "Awakening"),
            ([10, 34], "Exploration"), ([10, 57], "Perfected Form"), ([11, 56], "Curiosity"),
            ([12, 22], "Openness"), ([13, 33], "Prodigal"), ([16, 48], "Wavelength"),
            ([17, 62], "Acceptance"), ([18, 58], "Judgment"), ([19, 49], "Synthesis"),
            ([20, 34], "Charisma"), ([20, 57], "Brainwave"), ([21, 45], "Money"),
            ([23, 43], "Structuring"), ([24, 61], "Awareness"), ([25, 51], "Initiation"),
            ([26, 44], "Surrender"), ([27, 50], "Preservation"), ([28, 38], "Struggle"),
            ([29, 46], "Discovery"), ([30, 41], "Recognition"), ([32, 54], "Transformation"),
            ([34, 57], "Power"), ([35, 36], "Transitoriness"), ([37, 40], "Community"),
            ([39, 55], "Emoting"), ([42, 53], "Maturation"), ([47, 64], "Abstraction")
        ]

        gate_numbers = {g["number"] for g in gates}
        channels = []

        for gates_pair, name in channel_definitions:
            if all(g in gate_numbers for g in gates_pair):
                channels.append({
                    "gates": gates_pair,
                    "name": name,
                })

        return channels

    def _determine_definition(self, defined_centers: List[str], channels: List[Dict] = None) -> str:
        """
        Determine definition type based on connectivity of defined centers

        Definition is determined by how many separate groups of connected centers exist:
        - None: No defined centers
        - Single: All defined centers connected in one group
        - Split: Two separate groups of connected centers
        - Triple: Three separate groups
        - Quadruple: Four separate groups

        Args:
            defined_centers: List of defined center names
            channels: List of active channels connecting centers

        Returns:
            Definition type string
        """
        if not defined_centers:
            return "none"

        # If no channels provided, fall back to simple count-based logic
        if not channels:
            count = len(defined_centers)
            if count <= 3:
                return "single"
            elif count <= 5:
                return "split"
            elif count <= 7:
                return "triple"
            else:
                return "quadruple"

        # Build center-to-center connections from channels
        # Each channel connects two centers
        gate_to_center = {
            # Head Center
            64: "head", 61: "head", 63: "head",
            # Ajna Center
            47: "ajna", 24: "ajna", 4: "ajna", 17: "ajna", 43: "ajna", 11: "ajna",
            # Throat Center
            62: "throat", 23: "throat", 56: "throat", 16: "throat", 20: "throat",
            31: "throat", 8: "throat", 33: "throat", 45: "throat", 12: "throat", 35: "throat",
            # G Center
            7: "g_center", 1: "g_center", 13: "g_center", 10: "g_center",
            15: "g_center", 46: "g_center", 25: "g_center", 2: "g_center",
            # Heart/Will Center
            51: "heart_will", 21: "heart_will", 40: "heart_will", 26: "heart_will",
            # Solar Plexus
            6: "solar_plexus", 37: "solar_plexus", 22: "solar_plexus", 36: "solar_plexus",
            30: "solar_plexus", 55: "solar_plexus", 49: "solar_plexus",
            # Sacral
            5: "sacral", 14: "sacral", 29: "sacral", 59: "sacral", 9: "sacral",
            3: "sacral", 42: "sacral", 27: "sacral", 34: "sacral",
            # Root
            53: "root", 60: "root", 52: "root", 19: "root", 39: "root",
            41: "root", 58: "root", 38: "root", 54: "root",
            # Spleen
            48: "spleen", 57: "spleen", 44: "spleen", 50: "spleen", 32: "spleen", 28: "spleen", 18: "spleen",
        }

        # Build adjacency list of connected centers
        connections = {center: set() for center in defined_centers}

        for channel in channels:
            gate1, gate2 = channel["gates"]
            center1 = gate_to_center.get(gate1)
            center2 = gate_to_center.get(gate2)

            if center1 in defined_centers and center2 in defined_centers:
                connections[center1].add(center2)
                connections[center2].add(center1)

        # Find connected components using DFS
        visited = set()
        num_groups = 0

        def dfs(center):
            """Depth-first search to visit all connected centers"""
            visited.add(center)
            for neighbor in connections[center]:
                if neighbor not in visited:
                    dfs(neighbor)

        for center in defined_centers:
            if center not in visited:
                dfs(center)
                num_groups += 1

        # Map number of groups to definition type
        if num_groups == 0:
            return "none"
        elif num_groups == 1:
            return "single"
        elif num_groups == 2:
            return "split"
        elif num_groups == 3:
            return "triple"
        else:
            return "quadruple"

    def _determine_incarnation_cross(self, personality_gates: List[Dict], design_gates: List[Dict], profile: str = None) -> str:
        """
        Determine Incarnation Cross

        Based on Sun/Earth gates in Personality and Design
        The cross type (Right/Left/Juxtaposition) is determined by the profile:
        - Right Angle: Profiles 1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6 (personal destiny)
        - Left Angle: Profiles 5/1, 5/2, 6/2, 6/3 (transpersonal destiny)
        - Juxtaposition: Profile 4/1 only (fixed fate)

        Format: [Type] Angle Cross of [Name] ([Pers Sun]/[Pers Earth] | [Design Sun]/[Design Earth])
        Example: "Left Angle Cross of Cycles (54/53 | 32/42)"
        """
        pers_sun = next((g for g in personality_gates if g["planet"] == "sun"), None)
        pers_earth = next((g for g in personality_gates if g["planet"] == "earth"), None)
        des_sun = next((g for g in design_gates if g["planet"] == "sun"), None)
        des_earth = next((g for g in design_gates if g["planet"] == "earth"), None)

        if not (pers_sun and pers_earth and des_sun and des_earth):
            return "Unknown"

        # Determine cross type based on profile
        cross_type = "Right Angle"  # Default

        if profile:
            # Extract first number from profile (e.g., "5/1" -> 5)
            try:
                first_line = int(profile.split("/")[0])

                if first_line == 4:
                    # Special case: 4/1 is Juxtaposition, others starting with 4 are Right Angle
                    second_line = int(profile.split("/")[1])
                    if second_line == 1:
                        cross_type = "Juxtaposition"
                    else:
                        cross_type = "Right Angle"
                elif first_line in [5, 6]:
                    cross_type = "Left Angle"
                else:  # 1, 2, 3
                    cross_type = "Right Angle"
            except (ValueError, IndexError):
                logger.warning(f"⚠️ Could not parse profile: {profile}")

        # Build cross gates string
        gates_str = f"{pers_sun['number']}/{pers_earth['number']} | {des_sun['number']}/{des_earth['number']}"

        # Look up cross name from the 192-entry table
        cross_entry = self.INCARNATION_CROSS_NAMES.get(pers_sun["number"])
        if cross_entry:
            if cross_type == "Right Angle":
                cross_name = cross_entry["right_angle"]
            elif cross_type == "Left Angle":
                cross_name = cross_entry["left_angle"]
            else:  # Juxtaposition
                cross_name = cross_entry["juxtaposition"]
        else:
            cross_name = f"Gate {pers_sun['number']}"

        return f"{cross_type} Cross of {cross_name} ({gates_str})"

    def _calculate_variable(self, personality_gates: List[Dict], design_gates: List[Dict]) -> str:
        """
        Calculate Variable (4 arrows)

        The Variable encodes 4 arrows based on TONE values of Sun and Node:

        Format: "P[a][b] D[c][d]" where:
        - P = Personality side (fixed label)
        - a = Personality Sun Tone → L (1-3) or R (4-6) = Motivation
        - b = Personality Node Tone → L (1-3) or R (4-6) = Perspective
        - D = Design side (fixed label)
        - c = Design Sun Tone → L (1-3) or R (4-6) = Digestion/Determination
        - d = Design Node Tone → L (1-3) or R (4-6) = Environment

        Arrow positions:
        - Top-right (Personality Sun): Motivation/Awareness
        - Bottom-right (Personality Node): Perspective/View
        - Top-left (Design Sun): Digestion/Determination (PHS)
        - Bottom-left (Design Node): Environment

        16 possible combinations from "PLL DLL" (quad-left) to "PRR DRR" (quad-right).

        CRITICAL: Uses TRUE_NODE (not MEAN_NODE) for accurate Tone calculation.
        Tone changes ~every 38 minutes, so precision is essential.

        Example: "PLR DLL" (Ange), "PRL DLR" (Jay)

        References:
            - Jovian Archive: https://jovianarchive.com/Stories/102/A_Simple_Guide_to_Variable
            - https://freehumandesignchart.com/human-design-variable/
            - https://www.emmadunwoody.com/four-arrows-cheat-sheet
        """
        # Extract required gates
        pers_sun = next((g for g in personality_gates if g["planet"] == "sun"), None)
        pers_node = next((g for g in personality_gates if g["planet"] == "north_node"), None)
        des_sun = next((g for g in design_gates if g["planet"] == "sun"), None)
        des_node = next((g for g in design_gates if g["planet"] == "north_node"), None)

        if not all([pers_sun, pers_node, des_sun, des_node]):
            return "Unknown"

        try:
            # Extract Tone values (1-6)
            pers_sun_tone = pers_sun.get("tone", 1)
            pers_node_tone = pers_node.get("tone", 1)
            des_sun_tone = des_sun.get("tone", 1)
            des_node_tone = des_node.get("tone", 1)

            # Arrow direction: Tone 1-3 = Left, Tone 4-6 = Right
            def tone_to_lr(tone: int) -> str:
                return "L" if tone <= 3 else "R"

            # Build Variable string
            motivation = tone_to_lr(pers_sun_tone)      # Personality Sun Tone
            perspective = tone_to_lr(pers_node_tone)     # Personality Node Tone
            digestion = tone_to_lr(des_sun_tone)         # Design Sun Tone
            environment = tone_to_lr(des_node_tone)      # Design Node Tone

            return f"P{motivation}{perspective} D{digestion}{environment}"

        except (KeyError, TypeError, ValueError) as e:
            logger.warning(f"⚠️ Could not calculate Variable: {e}")
            return "Unknown"

    def _get_strategy(self, chart_type: str) -> str:
        """Get strategy for type"""
        strategies = {
            "manifestor": "Inform before acting",
            "generator": "Wait to respond",
            "manifesting_generator": "Wait to respond, then inform",
            "projector": "Wait for invitation",
            "reflector": "Wait 28 days (lunar cycle)",
        }
        return strategies.get(chart_type, "Unknown")

    def _get_signature(self, chart_type: str) -> str:
        """Get signature (success state) for type"""
        signatures = {
            "manifestor": "Peace",
            "generator": "Satisfaction",
            "manifesting_generator": "Satisfaction",
            "projector": "Success",
            "reflector": "Surprise",
        }
        return signatures.get(chart_type, "Unknown")

    def _get_not_self(self, chart_type: str) -> str:
        """Get not-self theme (resistance state) for type"""
        not_self = {
            "manifestor": "Anger",
            "generator": "Frustration",
            "manifesting_generator": "Frustration/Anger",
            "projector": "Bitterness",
            "reflector": "Disappointment",
        }
        return not_self.get(chart_type, "Unknown")


# Singleton instance
_design_human_service: Optional[DesignHumanService] = None


def get_design_human_service() -> DesignHumanService:
    """Get or create Design Humain service singleton"""
    global _design_human_service
    if _design_human_service is None:
        _design_human_service = DesignHumanService()
    return _design_human_service
