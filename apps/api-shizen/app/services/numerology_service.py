"""
Numerology Calculation Service
Shinkofa Platform - Shizen AI

Calculates Numerology using the Kabbalistic method with Master Number preservation.
Determines: Life Path, Expression, Soul Urge, Personality, Challenges, Cycles, Personal Year

IMPORTANT - Calculation Method (KABBALE):
- Uses direct addition of all digits (not component-by-component reduction)
- Master Numbers (11, 22, 33) are ALWAYS preserved, NEVER reduced
- Checks for Master Numbers at EVERY step of reduction
- More inclusive detection of Master Numbers than Pythagorean method

Master Number Notation:
- 11/2: The Illuminator (base vibration 2) - Spiritual insight, intuition
- 22/4: The Master Builder (base vibration 4) - Manifesting dreams into reality
- 33/6: The Master Teacher (base vibration 6) - Selfless service, healing

Method Difference (Kabbale vs Pythagorean):
- Pythagorean: Reduces each component (month, day, year) separately, then sums
- Kabbale: Adds ALL digits directly, then reduces (preserving Master Numbers at each step)

Example: Birth date 1989-11-29
- Kabbale: 1+9+8+9+1+1+2+9 = 40 -> 4+0 = 4 OR check intermediate: 29 -> 11 (Master!)
- We use the most Master-Number-inclusive approach

References:
- Kabbalistic numerology traditions
- Master numbers: 11, 22, 33 (ALWAYS preserved)
"""
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union
import logging
import re

logger = logging.getLogger(__name__)


class NumerologyNumber:
    """
    Represents a numerology number with Master Number awareness.

    Provides proper notation (11/2, 22/4, 33/6) and indicates if it's a Master Number.
    """
    MASTER_BASES = {11: 2, 22: 4, 33: 6}

    def __init__(self, value: int):
        self.value = value
        self.is_master = value in self.MASTER_BASES
        self.base = self.MASTER_BASES.get(value, value)

    def __str__(self) -> str:
        if self.is_master:
            return f"{self.value}/{self.base}"
        return str(self.value)

    def __repr__(self) -> str:
        return f"NumerologyNumber({self.value})"

    def __int__(self) -> int:
        return self.value

    def __eq__(self, other) -> bool:
        if isinstance(other, NumerologyNumber):
            return self.value == other.value
        return self.value == other

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "value": self.value,
            "display": str(self),
            "is_master_number": self.is_master,
            "base_number": self.base if self.is_master else None,
        }


class NumerologyService:
    """
    Kabbalistic Numerology calculation service with Master Number preservation

    Calculates all major numerology numbers from birth date and full name.
    Uses a hybrid approach that checks BOTH direct addition (Kabbale) AND
    component-by-component methods to maximize Master Number detection.

    All Master Numbers (11, 22, 33) are ALWAYS preserved and displayed as 11/2, 22/4, 33/6.
    """

    # Letter to number mapping (Pythagorean system)
    LETTER_VALUES = {
        'A': 1, 'J': 1, 'S': 1,
        'B': 2, 'K': 2, 'T': 2,
        'C': 3, 'L': 3, 'U': 3,
        'D': 4, 'M': 4, 'V': 4,
        'E': 5, 'N': 5, 'W': 5,
        'F': 6, 'O': 6, 'X': 6,
        'G': 7, 'P': 7, 'Y': 7,
        'H': 8, 'Q': 8, 'Z': 8,
        'I': 9, 'R': 9,
    }

    # Master numbers (not reduced)
    MASTER_NUMBERS = [11, 22, 33]

    # Number interpretations (simplified)
    INTERPRETATIONS = {
        1: {"keyword": "Leader", "traits": ["Independent", "Ambitious", "Innovative"]},
        2: {"keyword": "Mediator", "traits": ["Diplomatic", "Cooperative", "Sensitive"]},
        3: {"keyword": "Communicator", "traits": ["Creative", "Expressive", "Optimistic"]},
        4: {"keyword": "Builder", "traits": ["Practical", "Organized", "Disciplined"]},
        5: {"keyword": "Freedom Seeker", "traits": ["Adventurous", "Versatile", "Dynamic"]},
        6: {"keyword": "Nurturer", "traits": ["Responsible", "Harmonious", "Caring"]},
        7: {"keyword": "Seeker", "traits": ["Analytical", "Spiritual", "Introspective"]},
        8: {"keyword": "Powerhouse", "traits": ["Ambitious", "Authoritative", "Material success"]},
        9: {"keyword": "Humanitarian", "traits": ["Compassionate", "Idealistic", "Generous"]},
        11: {"keyword": "Illuminator", "traits": ["Intuitive", "Visionary", "Inspirational"]},
        22: {"keyword": "Master Builder", "traits": ["Practical visionary", "Large-scale creator", "Powerful manifester"]},
        33: {"keyword": "Master Teacher", "traits": ["Selfless service", "Spiritual teacher", "Compassionate healer"]},
    }

    def __init__(self):
        """Initialize Numerology service"""
        logger.info("🔢 Numerology Service initialized")

    def calculate_chart(
        self,
        full_name: str,
        birth_date: str,  # YYYY-MM-DD
    ) -> Dict:
        """
        Calculate complete numerology chart

        Args:
            full_name: Full birth name (e.g., "Jean Pierre Martin")
            birth_date: Birth date (YYYY-MM-DD)

        Returns:
            Complete numerology chart dictionary

        Example:
            ```python
            chart = service.calculate_chart(
                full_name="Jean Pierre Martin",
                birth_date="1990-06-15"
            )
            ```
        """
        try:
            # Parse birth date
            year, month, day = map(int, birth_date.split("-"))
            birth_dt = datetime(year, month, day)

            # Calculate all numbers (as NumerologyNumber for proper Master Number notation)
            life_path = self._reduce_to_numerology_number(
                self._calculate_life_path_raw(year, month, day)
            )
            expression = self._reduce_to_numerology_number(
                self._calculate_expression_raw(full_name)
            )
            soul_urge = self._reduce_to_numerology_number(
                self._calculate_soul_urge_raw(full_name)
            )
            personality = self._reduce_to_numerology_number(
                self._calculate_personality_raw(full_name)
            )
            maturity = self._reduce_to_numerology_number(
                int(life_path) + int(expression)
            )

            # Active and Hereditary numbers
            first_name = full_name.split()[0] if full_name.split() else ""
            last_name = full_name.split()[-1] if len(full_name.split()) > 1 else ""
            active = self._reduce_to_numerology_number(
                self._name_to_number_raw(first_name)
            )
            hereditary = self._reduce_to_numerology_number(
                self._name_to_number_raw(last_name)
            )

            # Challenges (don't use NumerologyNumber - challenges are always 0-8)
            challenges = self._calculate_challenges(month, day, year)

            # Cycles (Formative, Productive, Harvest) - can have master numbers
            cycles = self._calculate_cycles_with_master(year, month, day)

            # Personal Year
            current_year = datetime.now().year
            personal_year = self._reduce_to_numerology_number(
                self._calculate_personal_year_raw(month, day, current_year)
            )

            # Build complete chart with proper notation
            active_interp = self._get_interpretation(int(active))
            hereditary_interp = self._get_interpretation(int(hereditary))

            chart = {
                # Core numbers with Master Number notation
                "life_path": life_path.to_dict(),
                "expression": expression.to_dict(),
                "soul_urge": soul_urge.to_dict(),
                "personality": personality.to_dict(),
                "maturity": maturity.to_dict(),
                "active": active.to_dict(),
                "hereditary": hereditary.to_dict(),
                "challenges": challenges,
                "cycles": cycles,
                "personal_year": personal_year.to_dict(),
                "interpretations": {
                    "life_path": self._get_interpretation(int(life_path)),
                    "expression": self._get_interpretation(int(expression)),
                    "soul_urge": self._get_interpretation(int(soul_urge)),
                    "personality": self._get_interpretation(int(personality)),
                    "active": active_interp,
                    "hereditary": hereditary_interp,
                },
                # V5.0: Text analysis for first/last names (using display notation)
                "first_name_analysis": f"Prénom '{first_name}' → Nombre Actif {active} ({active_interp.get('keyword', 'Unknown')}) : {', '.join(active_interp.get('traits', [])[:3])}",
                "last_name_analysis": f"Nom '{last_name}' → Nombre Héréditaire {hereditary} ({hereditary_interp.get('keyword', 'Unknown')}) : {', '.join(hereditary_interp.get('traits', [])[:3])}",
            }

            logger.info(
                f"✅ Numerology chart calculated: "
                f"Life Path={life_path}, Expression={expression}, Soul Urge={soul_urge}"
            )
            return chart

        except Exception as e:
            logger.error(f"❌ Numerology calculation error: {e}")
            raise Exception(f"Numerology calculation failed: {str(e)}")

    def _reduce_to_single_digit(self, number: int, keep_master: bool = True) -> int:
        """
        Reduce number to single digit (1-9) or master number (11, 22, 33)

        Args:
            number: Number to reduce
            keep_master: If True, keep master numbers (11, 22, 33)

        Returns:
            Reduced number (int)
        """
        while number > 9:
            # Check for master numbers BEFORE reducing
            if keep_master and number in self.MASTER_NUMBERS:
                return number

            # Reduce by summing digits
            number = sum(int(digit) for digit in str(number))

        return number

    def _reduce_to_numerology_number(self, number: int, keep_master: bool = True) -> NumerologyNumber:
        """
        Reduce number and return as NumerologyNumber with proper notation

        Args:
            number: Number to reduce
            keep_master: If True, keep master numbers (11, 22, 33)

        Returns:
            NumerologyNumber with proper display (e.g., 11/2, 22/4, 33/6)
        """
        reduced = self._reduce_to_single_digit(number, keep_master)
        return NumerologyNumber(reduced)

    def _calculate_life_path_raw(self, year: int, month: int, day: int) -> int:
        """
        Calculate Life Path using KABBALE method (direct digit addition)

        Method: Kabbale (add ALL digits directly, check for Master Numbers at each step)
        - Adds all digits of day, month, and year together
        - Checks for Master Numbers (11, 22, 33) at EVERY intermediate sum
        - More inclusive Master Number detection than Pythagorean method

        Example: 1990-06-15
        - Direct sum: 1+9+9+0+0+6+1+5 = 31 -> 3+1 = 4

        Example: 1989-11-29 (Master Number case)
        - Direct sum: 1+9+8+9+1+1+2+9 = 40 -> 4+0 = 4
        - BUT day 29 -> 2+9 = 11 (Master!) - we check this too

        We use BOTH methods and return Master Number if EITHER detects one:
        1. Direct addition of all digits
        2. Component-by-component (catches day=29->11, month=11, etc.)
        """
        # Method 1: Direct addition of ALL digits (Kabbale pure)
        date_string = f"{year:04d}{month:02d}{day:02d}"
        direct_sum = sum(int(digit) for digit in date_string)
        direct_result = self._reduce_to_single_digit(direct_sum)

        # Method 2: Component-by-component (catches intermediate Masters)
        month_reduced = self._reduce_to_single_digit(month)
        day_reduced = self._reduce_to_single_digit(day)
        year_reduced = self._reduce_to_single_digit(year)
        component_sum = month_reduced + day_reduced + year_reduced
        component_result = self._reduce_to_single_digit(component_sum)

        # Return Master Number if EITHER method finds one
        if direct_result in self.MASTER_NUMBERS:
            logger.info(f"🔢 Life Path Master Number {direct_result} found via direct addition")
            return direct_result
        if component_result in self.MASTER_NUMBERS:
            logger.info(f"🔢 Life Path Master Number {component_result} found via component method")
            return component_result

        # If no Master Number, return the direct addition result (Kabbale method)
        return direct_result

    def _calculate_life_path(self, year: int, month: int, day: int) -> int:
        """
        Calculate Life Path number from birth date (backwards compatible)
        """
        total = self._calculate_life_path_raw(year, month, day)
        return self._reduce_to_single_digit(total)

    def _name_to_number_raw(self, name: str, vowels_only: bool = False, consonants_only: bool = False) -> int:
        """
        Convert name to raw sum (for Master Number detection)

        Args:
            name: Name to convert
            vowels_only: If True, only count vowels (for Soul Urge)
            consonants_only: If True, only count consonants (for Personality)

        Returns:
            Raw sum before reduction
        """
        # Remove special characters and spaces
        name = re.sub(r'[^A-Za-z]', '', name.upper())

        vowels = set('AEIOUY')
        total = 0

        for letter in name:
            is_vowel = letter in vowels

            if vowels_only and not is_vowel:
                continue
            if consonants_only and is_vowel:
                continue

            total += self.LETTER_VALUES.get(letter, 0)

        return total

    def _name_to_number(self, name: str, vowels_only: bool = False, consonants_only: bool = False) -> int:
        """
        Convert name to numerology number (backwards compatible)
        """
        total = self._name_to_number_raw(name, vowels_only, consonants_only)
        return self._reduce_to_single_digit(total)

    def _calculate_expression_raw(self, full_name: str) -> int:
        """Calculate Expression Number raw sum (for Master Number detection)"""
        return self._name_to_number_raw(full_name)

    def _calculate_expression(self, full_name: str) -> int:
        """Calculate Expression Number (Destiny Number) - sum of all letters"""
        return self._name_to_number(full_name)

    def _calculate_soul_urge_raw(self, full_name: str) -> int:
        """Calculate Soul Urge raw sum (for Master Number detection)"""
        return self._name_to_number_raw(full_name, vowels_only=True)

    def _calculate_soul_urge(self, full_name: str) -> int:
        """Calculate Soul Urge Number (Heart's Desire) - sum of vowels"""
        return self._name_to_number(full_name, vowels_only=True)

    def _calculate_personality_raw(self, full_name: str) -> int:
        """Calculate Personality raw sum (for Master Number detection)"""
        return self._name_to_number_raw(full_name, consonants_only=True)

    def _calculate_personality(self, full_name: str) -> int:
        """Calculate Personality Number - sum of consonants"""
        return self._name_to_number(full_name, consonants_only=True)

    def _calculate_maturity(self, life_path: int, expression: int) -> int:
        """
        Calculate Maturity Number

        Sum of Life Path + Expression
        """
        return self._reduce_to_single_digit(life_path + expression)

    def _calculate_challenges(self, month: int, day: int, year: int) -> List[Dict]:
        """
        Calculate the 4 challenges

        - Minor Challenge 1: |Month - Day|
        - Minor Challenge 2: |Day - Year|
        - Major Challenge: |Minor1 - Minor2|
        - Life Challenge: |Month - Year|
        """
        month_reduced = self._reduce_to_single_digit(month, keep_master=False)
        day_reduced = self._reduce_to_single_digit(day, keep_master=False)
        year_reduced = self._reduce_to_single_digit(year, keep_master=False)

        minor1 = abs(month_reduced - day_reduced)
        minor2 = abs(day_reduced - year_reduced)
        major = abs(minor1 - minor2)
        life_challenge = abs(month_reduced - year_reduced)

        return [
            {"type": "minor_1", "value": minor1, "ages": "0-28"},
            {"type": "minor_2", "value": minor2, "ages": "28-56"},
            {"type": "major", "value": major, "ages": "56+"},
            {"type": "life", "value": life_challenge, "ages": "All life"},
        ]

    def _calculate_cycles(self, full_name: str, year: int, month: int, day: int) -> List[Dict]:
        """
        Calculate the 3 life cycles (backwards compatible)

        - Formative (0-28): Birth month
        - Productive (28-56): Birth day
        - Harvest (56+): Birth year
        """
        month_reduced = self._reduce_to_single_digit(month, keep_master=False)
        day_reduced = self._reduce_to_single_digit(day, keep_master=False)
        year_reduced = self._reduce_to_single_digit(year, keep_master=False)

        return [
            {"type": "formative", "value": month_reduced, "ages": "0-28"},
            {"type": "productive", "value": day_reduced, "ages": "28-56"},
            {"type": "harvest", "value": year_reduced, "ages": "56+"},
        ]

    def _calculate_cycles_with_master(self, year: int, month: int, day: int) -> List[Dict]:
        """
        Calculate the 3 life cycles with Master Number support

        Note: Some numerologists keep Master Numbers in cycles, others don't.
        We keep them for consistency with the Pythagorean tradition.
        """
        month_num = self._reduce_to_numerology_number(month)
        day_num = self._reduce_to_numerology_number(day)
        year_num = self._reduce_to_numerology_number(year)

        return [
            {"type": "formative", **month_num.to_dict(), "ages": "0-28"},
            {"type": "productive", **day_num.to_dict(), "ages": "28-56"},
            {"type": "harvest", **year_num.to_dict(), "ages": "56+"},
        ]

    def _calculate_personal_year_raw(self, birth_month: int, birth_day: int, current_year: int) -> int:
        """Calculate Personal Year raw sum (for Master Number detection)"""
        month_reduced = self._reduce_to_single_digit(birth_month)
        day_reduced = self._reduce_to_single_digit(birth_day)
        year_reduced = self._reduce_to_single_digit(current_year)

        return month_reduced + day_reduced + year_reduced

    def _calculate_personal_year(self, birth_month: int, birth_day: int, current_year: int) -> int:
        """Calculate Personal Year number (backwards compatible)"""
        total = self._calculate_personal_year_raw(birth_month, birth_day, current_year)
        return self._reduce_to_single_digit(total)

    def _get_interpretation(self, number: int) -> Dict:
        """Get interpretation for a number"""
        return self.INTERPRETATIONS.get(number, {
            "keyword": "Unknown",
            "traits": []
        })


# Singleton instance
_numerology_service: Optional[NumerologyService] = None


def get_numerology_service() -> NumerologyService:
    """Get or create Numerology service singleton"""
    global _numerology_service
    if _numerology_service is None:
        _numerology_service = NumerologyService()
    return _numerology_service
