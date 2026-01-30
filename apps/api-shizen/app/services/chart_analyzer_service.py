"""
Chart Analyzer Service - AI-powered analysis of uploaded charts
Shinkofa Platform - Shizen AI

Analyzes Design Humain and Astrology charts from OCR-extracted text
Uses Hybrid LLM (DeepSeek + Ollama) for intelligent interpretation
"""
import logging
import traceback
from typing import Dict, Optional
from app.services.hybrid_llm_service import get_hybrid_llm_service
from app.models.uploaded_chart import ChartType

logger = logging.getLogger(__name__)


class ChartAnalyzerService:
    """
    AI-powered chart analysis service

    Analyzes uploaded Design Humain and Astrology charts
    Extracts structured data from OCR text and generates interpretations
    """

    def __init__(self):
        """Initialize Chart Analyzer service"""
        self.llm = get_hybrid_llm_service()
        logger.info("📊 Chart Analyzer Service initialized")

    async def analyze_chart(
        self,
        chart_type: ChartType,
        ocr_text: str,
        questionnaire_context: Optional[Dict] = None
    ) -> Dict:
        """
        Analyze uploaded chart using AI

        Args:
            chart_type: Type of chart (design_human or birth_chart)
            ocr_text: Raw text extracted from OCR
            questionnaire_context: Optional context from questionnaire responses

        Returns:
            Dict with:
            {
                "extracted_data": {structured data from chart},
                "interpretation": "Long-form AI analysis",
                "integration_notes": "How this connects with questionnaire",
                "recommendations": ["action 1", "action 2"],
                "confidence": "high/medium/low"
            }
        """
        try:
            logger.info(f"🔮 Analyzing {chart_type.value} chart (OCR text: {len(ocr_text)} chars)")

            if chart_type == ChartType.DESIGN_HUMAN:
                return await self._analyze_design_human(ocr_text, questionnaire_context)
            elif chart_type == ChartType.BIRTH_CHART:
                return await self._analyze_birth_chart(ocr_text, questionnaire_context)
            else:
                raise ValueError(f"Unknown chart type: {chart_type}")

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ Chart analysis error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            raise Exception(f"Chart analysis failed: {error_msg}")

    async def _analyze_design_human(
        self,
        ocr_text: str,
        questionnaire_context: Optional[Dict]
    ) -> Dict:
        """
        Analyze Design Humain chart from OCR text

        Extracts: Type, Authority, Profile, Centers, Gates, Channels
        """
        prompt = f"""Tu es un expert en Design Humain (Human Design). Analyse le texte OCR suivant d'un bodygraph et extrais les informations structurées.

**TEXTE OCR DU CHART** :
{ocr_text[:3000]}  {f"... (texte tronqué, {len(ocr_text)} chars total)" if len(ocr_text) > 3000 else ""}

**CONSIGNES** :
1. **Extraction structurée** : Identifie et extrais :
   - Type énergétique (Generator, Manifestor, Projector, Reflector, Manifesting Generator)
   - Autorité (Emotional, Sacral, Splenic, Ego, Self-Projected, Mental, Lunar, None)
   - Profil (ex: 1/3, 5/1, 6/2)
   - Centres définis (Head, Ajna, Throat, G Center, Heart/Will, Solar Plexus, Sacral, Root, Spleen)
   - Gates activées (numéros 1-64)
   - Channels (paires de gates connectées)
   - Définition (Single, Split, Triple, Quadruple)

2. **Interprétation** : Génère une analyse personnalisée (300-500 mots) :
   - Signification du Type et Autorité
   - Stratégie de vie recommandée
   - Forces et défis spécifiques
   - Comment utiliser cette énergie au quotidien

3. **Recommandations pratiques** : 3-5 actions concrètes basées sur le design

4. **Confidence** : Estime la qualité du texte OCR (high/medium/low)

**FORMAT RÉPONSE - JSON UNIQUEMENT** :
{{
  "extracted_data": {{
    "type": "manifesting_generator",
    "authority": "emotional",
    "profile": "5/1",
    "defined_centers": ["sacral", "throat", "solar_plexus"],
    "open_centers": ["head", "ajna", "g_center", "heart_will", "root", "spleen"],
    "gates": [1, 8, 13, 25, 30, 36, 37, 55],
    "channels": [
      {{"gates": [1, 8], "name": "Inspiration"}},
      {{"gates": [13, 33], "name": "Prodigal"}}
    ],
    "definition": "split",
    "strategy": "Wait to respond, then inform",
    "signature": "Satisfaction",
    "not_self": "Frustration/Anger"
  }},
  "interpretation": "En tant que Générateur Manifesteur avec autorité émotionnelle...",
  "integration_notes": "{f"Connexions avec le questionnaire : {questionnaire_context}" if questionnaire_context else "Pas de contexte questionnaire disponible"}",
  "recommendations": [
    "Respecte ton autorité émotionnelle - attends la clarté avant de décider",
    "Informe les autres avant d'agir pour éviter la résistance",
    "Écoute ton sacral (réponses gut) pour les opportunités"
  ],
  "confidence": "high"
}}

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte explicatif avant ou après.
"""

        try:
            logger.info("📤 Sending Design Humain analysis request to LLM...")

            result_text = await self.llm.generate(
                prompt=prompt,
                system="Tu es un expert en Design Humain. Analyse les charts avec précision et bienveillance. Retourne UNIQUEMENT du JSON valide.",
                temperature=0.3,  # Lower temperature for factual extraction
                max_tokens=3000
            )

            # Parse JSON response
            import json
            analysis = self._parse_json_response(result_text)

            logger.info(f"✅ Design Humain analysis complete (Type: {analysis.get('extracted_data', {}).get('type')})")
            return analysis

        except Exception as e:
            logger.error(f"❌ Design Humain analysis failed: {e}")
            raise

    async def _analyze_birth_chart(
        self,
        ocr_text: str,
        questionnaire_context: Optional[Dict]
    ) -> Dict:
        """
        Analyze Astrology birth chart from OCR text

        Extracts: Sun, Moon, Ascendant, Planets, Houses, Aspects
        """
        prompt = f"""Tu es un expert en astrologie occidentale. Analyse le texte OCR suivant d'une carte du ciel et extrais les informations structurées.

**TEXTE OCR DU CHART** :
{ocr_text[:3000]}  {f"... (texte tronqué, {len(ocr_text)} chars total)" if len(ocr_text) > 3000 else ""}

**CONSIGNES** :
1. **Extraction structurée** : Identifie et extrais :
   - Soleil (signe + maison)
   - Lune (signe + maison)
   - Ascendant (signe)
   - Planètes (Mars, Vénus, Mercure, Jupiter, Saturne, Uranus, Neptune, Pluton) avec signes + maisons
   - Aspects majeurs (conjonction, opposition, trigone, carré, sextile)
   - Éléments dominants (Feu, Terre, Air, Eau)
   - Modalités dominantes (Cardinal, Fixe, Mutable)

2. **Interprétation** : Génère une analyse personnalisée (300-500 mots) :
   - Synthèse Soleil/Lune/Ascendant (trinité de base)
   - Tempérament et personnalité
   - Forces naturelles et zones de croissance
   - Thèmes de vie principaux

3. **Recommandations pratiques** : 3-5 actions concrètes basées sur le thème natal

4. **Confidence** : Estime la qualité du texte OCR (high/medium/low)

**FORMAT RÉPONSE - JSON UNIQUEMENT** :
{{
  "extracted_data": {{
    "sun": {{"sign": "scorpio", "house": 10, "degree": 25.4}},
    "moon": {{"sign": "aquarius", "house": 3, "degree": 12.8}},
    "ascendant": {{"sign": "aquarius", "degree": 18.2}},
    "planets": [
      {{"name": "mars", "sign": "sagittarius", "house": 11, "degree": 5.6}},
      {{"name": "venus", "sign": "libra", "house": 9, "degree": 22.1}}
    ],
    "aspects": [
      {{"planets": ["sun", "moon"], "type": "square", "orb": 2.3}},
      {{"planets": ["venus", "mars"], "type": "trine", "orb": 1.5}}
    ],
    "dominant_element": "air",
    "dominant_modality": "fixed",
    "chart_shape": "bowl"
  }},
  "interpretation": "Avec un Soleil en Scorpion en maison 10, une Lune en Verseau et un Ascendant Verseau...",
  "integration_notes": "{f"Connexions avec le questionnaire : {questionnaire_context}" if questionnaire_context else "Pas de contexte questionnaire disponible"}",
  "recommendations": [
    "Équilibre entre profondeur émotionnelle (Scorpion) et détachement mental (Verseau)",
    "Exploite ta capacité à voir les systèmes (Verseau) pour transformer (Scorpion)",
    "Cultive relations authentiques qui honorent ton besoin d'indépendance"
  ],
  "confidence": "high"
}}

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte explicatif avant ou après.
"""

        try:
            logger.info("📤 Sending Birth Chart analysis request to LLM...")

            result_text = await self.llm.generate(
                prompt=prompt,
                system="Tu es un expert en astrologie occidentale. Analyse les cartes du ciel avec précision et bienveillance. Retourne UNIQUEMENT du JSON valide.",
                temperature=0.3,  # Lower temperature for factual extraction
                max_tokens=3000
            )

            # Parse JSON response
            import json
            analysis = self._parse_json_response(result_text)

            logger.info(f"✅ Birth Chart analysis complete (Sun: {analysis.get('extracted_data', {}).get('sun', {}).get('sign')})")
            return analysis

        except Exception as e:
            logger.error(f"❌ Birth Chart analysis failed: {e}")
            raise

    def _parse_json_response(self, response: str) -> Dict:
        """
        Parse JSON from LLM response (handles extra text before/after JSON)
        """
        import json

        try:
            # Try direct parse first
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            start = response.find("{")
            end = response.rfind("}") + 1

            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)

            # Fallback: return error structure
            logger.warning(f"⚠️ Could not parse JSON from response: {response[:200]}")
            return {
                "extracted_data": {},
                "interpretation": "Erreur: Impossible de parser la réponse IA",
                "integration_notes": "",
                "recommendations": [],
                "confidence": "low"
            }


# Singleton instance
_chart_analyzer_service: Optional[ChartAnalyzerService] = None


def get_chart_analyzer_service() -> ChartAnalyzerService:
    """Get or create Chart Analyzer service singleton"""
    global _chart_analyzer_service
    if _chart_analyzer_service is None:
        _chart_analyzer_service = ChartAnalyzerService()
    return _chart_analyzer_service
