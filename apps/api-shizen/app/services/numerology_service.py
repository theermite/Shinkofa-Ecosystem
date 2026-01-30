"""
Numerology Calculation Service
Shinkofa Platform - Shizen AI

Calculates Pythagorean Numerology
Determines: Life Path, Expression, Soul Urge, Personality, Challenges, Cycles, Personal Year

References:
- Pythagorean numerology system
- Master numbers: 11, 22, 33 (not reduced)
"""
from datetime import datetime
from typing import Dict, List, Optional
import logging
import re

logger = logging.getLogger(__name__)


class NumerologyService:
    """
    Pythagorean Numerology calculation service

    Calculates all major numerology numbers from birth date and full name
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

            # Calculate all numbers
            life_path = self._calculate_life_path(year, month, day)
            expression = self._calculate_expression(full_name)
            soul_urge = self._calculate_soul_urge(full_name)
            personality = self._calculate_personality(full_name)
            maturity = self._calculate_maturity(life_path, expression)

            # Active and Hereditary numbers
            first_name = full_name.split()[0] if full_name.split() else ""
            last_name = full_name.split()[-1] if len(full_name.split()) > 1 else ""
            active = self._name_to_number(first_name)
            hereditary = self._name_to_number(last_name)

            # Challenges
            challenges = self._calculate_challenges(month, day, year)

            # Cycles (Formative, Productive, Harvest)
            cycles = self._calculate_cycles(full_name, year, month, day)

            # Personal Year
            current_year = datetime.now().year
            personal_year = self._calculate_personal_year(month, day, current_year)

            # Build complete chart
            active_interp = self._get_interpretation(active)
            hereditary_interp = self._get_interpretation(hereditary)

            chart = {
                "life_path": life_path,
                "expression": expression,
                "soul_urge": soul_urge,
                "personality": personality,
                "maturity": maturity,
                "active": active,
                "hereditary": hereditary,
                "challenges": challenges,
                "cycles": cycles,
                "personal_year": personal_year,
                "interpretations": {
                    "life_path": self._get_interpretation(life_path),
                    "expression": self._get_interpretation(expression),
                    "soul_urge": self._get_interpretation(soul_urge),
                    "personality": self._get_interpretation(personality),
                    "active": active_interp,
                    "hereditary": hereditary_interp,
                },
                # V5.0: Text analysis for first/last names
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
            Reduced number
        """
        while number > 9:
            # Check for master numbers
            if keep_master and number in self.MASTER_NUMBERS:
                return number

            # Reduce
            number = sum(int(digit) for digit in str(number))

        return number

    def _calculate_life_path(self, year: int, month: int, day: int) -> int:
        """
        Calculate Life Path number from birth date

        Example: 1990-06-15
        - Month: 6
        - Day: 15 -> 1+5 = 6
        - Year: 1990 -> 1+9+9+0 = 19 -> 1+9 = 10 -> 1+0 = 1
        - Life Path: 6 + 6 + 1 = 13 -> 1+3 = 4
        """
        month_reduced = self._reduce_to_single_digit(month)
        day_reduced = self._reduce_to_single_digit(day)
        year_reduced = self._reduce_to_single_digit(year)

        total = month_reduced + day_reduced + year_reduced
        return self._reduce_to_single_digit(total)

    def _name_to_number(self, name: str, vowels_only: bool = False, consonants_only: bool = False) -> int:
        """
        Convert name to numerology number

        Args:
            name: Name to convert
            vowels_only: If True, only count vowels (for Soul Urge)
            consonants_only: If True, only count consonants (for Personality)

        Returns:
            Numerology number
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

        return self._reduce_to_single_digit(total)

    def _calculate_expression(self, full_name: str) -> int:
        """
        Calculate Expression Number (Destiny Number)

        Sum of all letters in full birth name
        """
        return self._name_to_number(full_name)

    def _calculate_soul_urge(self, full_name: str) -> int:
        """
        Calculate Soul Urge Number (Heart's Desire)

        Sum of all vowels in full birth name
        """
        return self._name_to_number(full_name, vowels_only=True)

    def _calculate_personality(self, full_name: str) -> int:
        """
        Calculate Personality Number

        Sum of all consonants in full birth name
        """
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
        Calculate the 3 life cycles

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

    def _calculate_personal_year(self, birth_month: int, birth_day: int, current_year: int) -> int:
        """
        Calculate Personal Year number

        Sum of birth month + birth day + current year
        """
        month_reduced = self._reduce_to_single_digit(birth_month)
        day_reduced = self._reduce_to_single_digit(birth_day)
        year_reduced = self._reduce_to_single_digit(current_year)

        total = month_reduced + day_reduced + year_reduced
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
