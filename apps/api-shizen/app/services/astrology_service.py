"""
Astrology Calculation Service
Shinkofa Platform - Shizen AI

Calculates Western Astrology chart using Kerykeion library
Determines: Sun/Moon/Ascendant signs, Houses, Planets, Aspects, Elements, Modalities

References:
- Kerykeion documentation: https://github.com/g-battaglia/kerykeion
"""
from kerykeion import AstrologicalSubject
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class AstrologyService:
    """
    Western & Chinese Astrology calculation service

    Uses Kerykeion for Western astrology
    Manual calculation for Chinese astrology
    """

    # Zodiac signs
    SIGNS = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
    ]

    # Chinese zodiac animals (12-year cycle starting from 1924 = Rat)
    CHINESE_ANIMALS = [
        "rat", "ox", "tiger", "rabbit", "dragon", "snake",
        "horse", "goat", "monkey", "rooster", "dog", "pig"
    ]

    # Chinese elements (5-year cycle)
    CHINESE_ELEMENTS = ["wood", "fire", "earth", "metal", "water"]

    # Planets
    PLANETS = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto"
    ]

    # Houses (1-12)
    HOUSES = list(range(1, 13))

    # Elements
    ELEMENTS = ["fire", "earth", "air", "water"]

    # Modalities
    MODALITIES = ["cardinal", "fixed", "mutable"]

    # Aspect types
    ASPECTS = [
        "conjunction", "opposition", "trine", "square", "sextile",
        "quincunx", "semi-sextile"
    ]

    # Timezone normalization map (non-IANA to IANA)
    TIMEZONE_NORMALIZE = {
        "Greenwich Mean Time": "UTC",
        "GMT": "UTC",
        "Central European Time": "Europe/Paris",
        "CET": "Europe/Paris",
        "Eastern Standard Time": "America/New_York",
        "EST": "America/New_York",
        "Pacific Standard Time": "America/Los_Angeles",
        "PST": "America/Los_Angeles",
    }

    def __init__(self):
        """Initialize Astrology service"""
        logger.info("✨ Astrology Service initialized")

    def _normalize_timezone(self, timezone: str) -> str:
        """
        Normalize timezone to IANA format for Kerykeion

        Args:
            timezone: Timezone string (may be non-IANA)

        Returns:
            IANA-compliant timezone string
        """
        # If already IANA format (contains /), return as-is
        if "/" in timezone:
            return timezone

        # Check normalization map
        normalized = self.TIMEZONE_NORMALIZE.get(timezone)
        if normalized:
            logger.info(f"🔄 Normalized timezone: {timezone} → {normalized}")
            return normalized

        # Default fallback to UTC
        logger.warning(f"⚠️ Unknown timezone '{timezone}', defaulting to UTC")
        return "UTC"

    def calculate_chart(
        self,
        birth_date: str,  # YYYY-MM-DD
        birth_time: str,  # HH:MM
        city: str,
        country: str = "France",
        timezone: str = "Europe/Paris",
        latitude: float = None,  # GPS latitude (optional)
        longitude: float = None,  # GPS longitude (optional)
    ) -> Dict:
        """
        Calculate complete Western Astrology natal chart

        Args:
            birth_date: Birth date (YYYY-MM-DD)
            birth_time: Birth time (HH:MM)
            city: Birth city name
            country: Birth country (default: France)
            timezone: Timezone (default: Europe/Paris)
            latitude: GPS latitude coordinate (optional, recommended for precision)
            longitude: GPS longitude coordinate (optional, recommended for precision)

        Returns:
            Complete astrology chart dictionary

        Example:
            ```python
            chart = service.calculate_chart(
                birth_date="1990-06-15",
                birth_time="14:30",
                city="Paris",
                country="France",
                timezone="Europe/Paris",
                latitude=48.8566,
                longitude=2.3522
            )
            ```
        """
        try:
            # Parse birth date and time
            year, month, day = birth_date.split("-")
            hour, minute = birth_time.split(":")

            # Normalize timezone to IANA format
            normalized_tz = self._normalize_timezone(timezone)

            # Create AstrologicalSubject (Kerykeion)
            # Use GPS coordinates if provided (recommended for precision)
            # Otherwise fallback to online geolocation
            if latitude is not None and longitude is not None:
                subject = AstrologicalSubject(
                    name="User",
                    year=int(year),
                    month=int(month),
                    day=int(day),
                    hour=int(hour),
                    minute=int(minute),
                    city=city,
                    nation=country,
                    tz_str=normalized_tz,
                    lat=latitude,
                    lng=longitude,
                    online=False  # Use provided GPS coordinates (precise)
                )
            else:
                subject = AstrologicalSubject(
                    name="User",
                    year=int(year),
                    month=int(month),
                    day=int(day),
                    hour=int(hour),
                    minute=int(minute),
                    city=city,
                    nation=country,
                    tz_str=normalized_tz,
                    online=True  # Fallback to online geolocation
                )

            # Extract chart data
            chart = {
                # Main signs
                "sun_sign": self._get_planet_sign(subject, "sun"),
                "moon_sign": self._get_planet_sign(subject, "moon"),
                "ascendant": self._get_ascendant(subject),

                # Planets in signs and houses
                "planets": self._get_planets(subject),

                # Houses cusps
                "houses": self._get_houses(subject),

                # Aspects
                "aspects": self._get_aspects(subject),

                # Dominant element and modality
                "dominant_element": self._calculate_dominant_element(subject),
                "dominant_modality": self._calculate_dominant_modality(subject),

                # Chart shape
                "chart_shape": self._determine_chart_shape(subject),

                # Additional info
                "hemisphere_emphasis": self._determine_hemisphere(subject),
            }

            logger.info(
                f"✅ Astrology chart calculated: "
                f"Sun={chart['sun_sign']}, Moon={chart['moon_sign']}, ASC={chart['ascendant']}"
            )
            return chart

        except Exception as e:
            logger.error(f"❌ Astrology calculation error: {e}")
            raise Exception(f"Astrology calculation failed: {str(e)}")

    # Chinese New Year dates (1900-2050) - Varies between Jan 21 - Feb 20
    CHINESE_NEW_YEAR_DATES = {
        1984: (2, 2), 1985: (2, 20), 1986: (2, 9), 1987: (1, 29), 1988: (2, 17), 1989: (2, 6),
        1990: (1, 27), 1991: (2, 15), 1992: (2, 4), 1993: (1, 23), 1994: (2, 10), 1995: (1, 31),
        1996: (2, 19), 1997: (2, 7), 1998: (1, 28), 1999: (2, 16), 2000: (2, 5), 2001: (1, 24),
        2002: (2, 12), 2003: (2, 1), 2004: (1, 22), 2005: (2, 9), 2006: (1, 29), 2007: (2, 18),
        2008: (2, 7), 2009: (1, 26), 2010: (2, 14), 2011: (2, 3), 2012: (1, 23), 2013: (2, 10),
        2014: (1, 31), 2015: (2, 19), 2016: (2, 8), 2017: (1, 28), 2018: (2, 16), 2019: (2, 5),
        2020: (1, 25), 2021: (2, 12), 2022: (2, 1), 2023: (1, 22), 2024: (2, 10), 2025: (1, 29),
        2026: (2, 17), 2027: (2, 6), 2028: (1, 26), 2029: (2, 13), 2030: (2, 3), 2031: (1, 23),
        2032: (2, 11), 2033: (1, 31), 2034: (2, 19), 2035: (2, 8), 2036: (1, 28), 2037: (2, 15),
        2038: (2, 4), 2039: (1, 24), 2040: (2, 12), 2041: (2, 1), 2042: (1, 22), 2043: (2, 10),
        2044: (1, 30), 2045: (2, 17), 2046: (2, 6), 2047: (1, 26), 2048: (2, 14), 2049: (2, 2),
        2050: (1, 23),
    }

    def calculate_chinese_astrology(self, birth_date: str) -> Dict:
        """
        Calculate Chinese Astrology from birth date

        Args:
            birth_date: Birth date (YYYY-MM-DD)

        Returns:
            Chinese astrology dictionary with animal, element, yin/yang

        Example:
            ```python
            chinese = service.calculate_chinese_astrology("1990-06-15")
            # Returns: {"animal_sign": "horse", "element": "metal", "yin_yang": "yang", ...}
            ```
        """
        try:
            year, month, day = birth_date.split("-")
            birth_year = int(year)
            birth_month = int(month)
            birth_day = int(day)

            # CRITICAL FIX: Use exact Chinese New Year dates
            # If born before Chinese New Year, use previous year
            cny_date = self.CHINESE_NEW_YEAR_DATES.get(birth_year)
            if cny_date:
                cny_month, cny_day = cny_date
                # Compare dates: if born before CNY, use previous year
                if (birth_month < cny_month) or (birth_month == cny_month and birth_day < cny_day):
                    birth_year -= 1
                    logger.info(f"📅 Born before CNY {cny_month}/{cny_day}, using year {birth_year}")
            else:
                # Fallback for years not in table (use Feb 4 approximation)
                logger.warning(f"⚠️ CNY date not in table for {birth_year}, using Feb 4 approximation")
                if birth_month == 1 or (birth_month == 2 and birth_day < 4):
                    birth_year -= 1

            # Calculate animal (12-year cycle, 1924 = Rat year 0)
            animal_index = (birth_year - 1924) % 12
            animal_sign = self.CHINESE_ANIMALS[animal_index]

            # Calculate element (60-year cycle: 5 elements × 12 animals)
            # Each element lasts 2 years (yin then yang)
            element_cycle = ((birth_year - 1924) % 10) // 2
            element = self.CHINESE_ELEMENTS[element_cycle]

            # Calculate yin/yang (alternates every year)
            yin_yang = "yang" if (birth_year - 1924) % 2 == 0 else "yin"

            # Compatible signs (simplified)
            compatibility_map = {
                "rat": {"compatible": ["dragon", "monkey", "ox"], "incompatible": ["horse", "rooster"]},
                "ox": {"compatible": ["rat", "snake", "rooster"], "incompatible": ["goat", "horse"]},
                "tiger": {"compatible": ["horse", "dog", "pig"], "incompatible": ["monkey", "snake"]},
                "rabbit": {"compatible": ["goat", "pig", "dog"], "incompatible": ["rooster", "rat"]},
                "dragon": {"compatible": ["rat", "monkey", "rooster"], "incompatible": ["dog", "rabbit"]},
                "snake": {"compatible": ["ox", "rooster", "monkey"], "incompatible": ["pig", "tiger"]},
                "horse": {"compatible": ["tiger", "goat", "dog"], "incompatible": ["rat", "ox"]},
                "goat": {"compatible": ["rabbit", "horse", "pig"], "incompatible": ["ox", "dog"]},
                "monkey": {"compatible": ["rat", "dragon", "snake"], "incompatible": ["tiger", "pig"]},
                "rooster": {"compatible": ["ox", "dragon", "snake"], "incompatible": ["rabbit", "dog"]},
                "dog": {"compatible": ["tiger", "rabbit", "horse"], "incompatible": ["dragon", "goat"]},
                "pig": {"compatible": ["rabbit", "goat", "tiger"], "incompatible": ["snake", "monkey"]},
            }

            compatibility = compatibility_map.get(animal_sign, {"compatible": [], "incompatible": []})

            # Traits (simplified descriptions)
            traits_map = {
                "rat": ["Intelligent", "Adaptable", "Charming", "Resourceful"],
                "ox": ["Patient", "Reliable", "Strong", "Determined"],
                "tiger": ["Brave", "Confident", "Competitive", "Charismatic"],
                "rabbit": ["Gentle", "Elegant", "Compassionate", "Artistic"],
                "dragon": ["Powerful", "Ambitious", "Lucky", "Charismatic"],
                "snake": ["Wise", "Intuitive", "Mysterious", "Elegant"],
                "horse": ["Energetic", "Independent", "Free-spirited", "Social"],
                "goat": ["Gentle", "Creative", "Calm", "Kind"],
                "monkey": ["Clever", "Curious", "Playful", "Innovative"],
                "rooster": ["Confident", "Hardworking", "Punctual", "Honest"],
                "dog": ["Loyal", "Honest", "Protective", "Faithful"],
                "pig": ["Generous", "Compassionate", "Honest", "Optimistic"],
            }

            traits = traits_map.get(animal_sign, [])

            chart = {
                "animal_sign": animal_sign,
                "element": element,
                "yin_yang": yin_yang,
                "year": birth_year,
                "compatible_signs": compatibility["compatible"],
                "incompatible_signs": compatibility["incompatible"],
                "traits": list(traits) if isinstance(traits, set) else traits,
            }

            logger.info(f"✅ Chinese Astrology calculated: {element.title()} {animal_sign.title()} ({yin_yang})")
            return chart

        except Exception as e:
            logger.error(f"❌ Chinese Astrology calculation error: {e}")
            return {
                "animal_sign": "unknown",
                "element": "unknown",
                "yin_yang": "unknown",
                "year": 0,
                "compatible_signs": [],
                "incompatible_signs": [],
                "traits": [],
            }

    def _get_planet_sign(self, subject: AstrologicalSubject, planet: str) -> str:
        """Get planet's zodiac sign"""
        try:
            planet_data = getattr(subject, planet, None)
            if planet_data:
                return planet_data.get("sign", "unknown").lower()
        except Exception:
            pass
        return "unknown"

    def _get_ascendant(self, subject: AstrologicalSubject) -> str:
        """Get Ascendant (Rising sign)"""
        try:
            return subject.first_house.get("sign", "unknown").lower()
        except Exception:
            return "unknown"

    def _get_planets(self, subject: AstrologicalSubject) -> List[Dict]:
        """
        Get all planets with their signs, houses, and degrees

        Returns list of planet dictionaries
        """
        planets = []

        for planet_name in self.PLANETS:
            try:
                planet_data = getattr(subject, planet_name, None)
                if planet_data:
                    planets.append({
                        "name": planet_name,
                        "sign": planet_data.get("sign", "").lower(),
                        "house": planet_data.get("house", 0),
                        "degree": planet_data.get("position", 0),
                        "retrograde": planet_data.get("retrograde", False),
                    })
            except Exception as e:
                logger.warning(f"⚠️ Could not get planet {planet_name}: {e}")
                continue

        return planets

    def _get_houses(self, subject: AstrologicalSubject) -> List[Dict]:
        """
        Get houses cusps (1-12) with their signs

        Returns list of house dictionaries
        """
        houses = []
        house_names = "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth".split()

        for i in range(1, 13):
            try:
                house_attr = getattr(subject, f"{house_names[i-1]}_house", None)
                if house_attr:
                    houses.append({
                        "number": i,
                        "sign": house_attr.get("sign", "").lower(),
                        "degree": house_attr.get("position", 0),
                    })
            except Exception as e:
                logger.warning(f"⚠️ Could not get house {i}: {e}")
                continue

        return houses

    def _get_aspects(self, subject: AstrologicalSubject) -> List[Dict]:
        """
        Get planetary aspects (conjunction, opposition, trine, etc.)

        Returns list of aspect dictionaries
        """
        aspects = []

        try:
            # Kerykeion provides aspects list
            aspects_list = subject.aspects_list if hasattr(subject, "aspects_list") else []

            for aspect in aspects_list:
                aspects.append({
                    "planet1": aspect.get("p1_name", "").lower(),
                    "planet2": aspect.get("p2_name", "").lower(),
                    "type": aspect.get("aspect", "").lower(),
                    "orb": aspect.get("orbit", 0),
                    "applying": aspect.get("aid", 0) < 0,  # Aspect applying or separating
                })

        except Exception as e:
            logger.warning(f"⚠️ Could not calculate aspects: {e}")

        return aspects

    def _calculate_dominant_element(self, subject: AstrologicalSubject) -> str:
        """
        Calculate dominant element (Fire, Earth, Air, Water)

        Based on planets' signs distribution
        """
        element_scores = {
            "fire": 0,
            "earth": 0,
            "air": 0,
            "water": 0,
        }

        # Element mapping
        element_map = {
            "aries": "fire", "leo": "fire", "sagittarius": "fire",
            "taurus": "earth", "virgo": "earth", "capricorn": "earth",
            "gemini": "air", "libra": "air", "aquarius": "air",
            "cancer": "water", "scorpio": "water", "pisces": "water",
        }

        # Count planets in each element
        for planet_name in self.PLANETS + ["ascendant"]:
            sign = self._get_planet_sign(subject, planet_name)
            element = element_map.get(sign)
            if element:
                # Weight: Sun/Moon/ASC = 2 points, others = 1 point
                weight = 2 if planet_name in ["sun", "moon", "ascendant"] else 1
                element_scores[element] += weight

        # Get dominant element
        dominant = max(element_scores, key=element_scores.get)
        return dominant

    def _calculate_dominant_modality(self, subject: AstrologicalSubject) -> str:
        """
        Calculate dominant modality (Cardinal, Fixed, Mutable)

        Based on planets' signs distribution
        """
        modality_scores = {
            "cardinal": 0,
            "fixed": 0,
            "mutable": 0,
        }

        # Modality mapping
        modality_map = {
            "aries": "cardinal", "cancer": "cardinal", "libra": "cardinal", "capricorn": "cardinal",
            "taurus": "fixed", "leo": "fixed", "scorpio": "fixed", "aquarius": "fixed",
            "gemini": "mutable", "virgo": "mutable", "sagittarius": "mutable", "pisces": "mutable",
        }

        # Count planets in each modality
        for planet_name in self.PLANETS + ["ascendant"]:
            sign = self._get_planet_sign(subject, planet_name)
            modality = modality_map.get(sign)
            if modality:
                # Weight: Sun/Moon/ASC = 2 points, others = 1 point
                weight = 2 if planet_name in ["sun", "moon", "ascendant"] else 1
                modality_scores[modality] += weight

        # Get dominant modality
        dominant = max(modality_scores, key=modality_scores.get)
        return dominant

    def _determine_chart_shape(self, subject: AstrologicalSubject) -> str:
        """
        Determine chart shape pattern

        Patterns: Splash, Bundle, Bowl, Bucket, Locomotive, Seesaw, Splay
        (Simplified implementation)
        """
        # This requires complex analysis of planet distribution
        # Simplified version - return "undetermined" for now
        # Full implementation would analyze planet arc spans
        return "undetermined"

    def _determine_hemisphere(self, subject: AstrologicalSubject) -> Dict[str, str]:
        """
        Determine hemisphere emphasis

        - Eastern (houses 10-3): Self-motivated
        - Western (houses 4-9): Other-oriented
        - Northern (houses 1-6): Private/subjective
        - Southern (houses 7-12): Public/objective
        """
        planets = self._get_planets(subject)

        eastern = sum(1 for p in planets if p["house"] in [10, 11, 12, 1, 2, 3])
        western = sum(1 for p in planets if p["house"] in [4, 5, 6, 7, 8, 9])
        northern = sum(1 for p in planets if p["house"] in [1, 2, 3, 4, 5, 6])
        southern = sum(1 for p in planets if p["house"] in [7, 8, 9, 10, 11, 12])

        return {
            "horizontal": "eastern" if eastern > western else "western",
            "vertical": "northern" if northern > southern else "southern",
        }


# Singleton instance
_astrology_service: Optional[AstrologyService] = None


def get_astrology_service() -> AstrologyService:
    """Get or create Astrology service singleton"""
    global _astrology_service
    if _astrology_service is None:
        _astrology_service = AstrologyService()
    return _astrology_service
