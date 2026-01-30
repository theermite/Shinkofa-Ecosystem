"""
Profile Export Service
Shinkofa Platform - Shizen AI

Exports holistic profile to Markdown and PDF formats
"""
from typing import Dict, Optional
from datetime import datetime
import logging
import os

from app.models.holistic_profile import HolisticProfile

logger = logging.getLogger(__name__)


class ProfileExportService:
    """
    Profile export service

    Generates Markdown and PDF exports of holistic profiles
    """

    def __init__(self):
        """Initialize Profile Export service"""
        self.export_dir = os.getenv("EXPORT_DIR", "./exports")
        os.makedirs(self.export_dir, exist_ok=True)
        logger.info("📄 Profile Export Service initialized")

    def export_markdown(self, profile: HolisticProfile) -> str:
        """
        Export holistic profile to Markdown format

        Args:
            profile: HolisticProfile instance

        Returns:
            Markdown content as string
        """
        try:
            # Build markdown content
            md_content = f"""# 🌟 Profil Holistique Shinkofa

**Généré le** : {profile.generated_at.strftime("%d/%m/%Y à %H:%M")}
**Utilisateur** : {profile.user_id}

---

## 📊 Design Humain

**Type** : {profile.design_human.get('type', 'N/A').title()}
**Autorité** : {profile.design_human.get('authority', 'N/A').title()}
**Profil** : {profile.design_human.get('profile', 'N/A')}
**Stratégie** : {profile.design_human.get('strategy', 'N/A')}
**Signature** : {profile.design_human.get('signature', 'N/A')}
**Not-Self** : {profile.design_human.get('not_self', 'N/A')}

**Centres définis** : {', '.join([c.replace('_', ' ').title() for c in profile.design_human.get('defined_centers', [])])}

---

## ✨ Astrologie Occidentale

**Soleil** : {profile.astrology_western.get('sun_sign', 'N/A').title()}
**Lune** : {profile.astrology_western.get('moon_sign', 'N/A').title()}
**Ascendant** : {profile.astrology_western.get('ascendant', 'N/A').title()}
**Élément dominant** : {profile.astrology_western.get('dominant_element', 'N/A').title()}
**Modalité dominante** : {profile.astrology_western.get('dominant_modality', 'N/A').title()}

---

## 🐉 Astrologie Chinoise

**Signe animal** : {profile.astrology_chinese.get('animal_sign', 'N/A').title()}
**Élément** : {profile.astrology_chinese.get('element', 'N/A').title()}
**Yin/Yang** : {profile.astrology_chinese.get('yin_yang', 'N/A').title()}

---

## 🔢 Numérologie

**Chemin de vie** : {profile.numerology.get('life_path', 'N/A')}
**Expression** : {profile.numerology.get('expression', 'N/A')}
**Soul Urge** : {profile.numerology.get('soul_urge', 'N/A')}
**Personnalité** : {profile.numerology.get('personality', 'N/A')}
**Année personnelle** : {profile.numerology.get('personal_year', 'N/A')}

---

## 🧠 Profil Psychologique

### MBTI

**Type** : {profile.psychological_analysis.get('mbti', {}).get('type', 'N/A')}
**Description** : {profile.psychological_analysis.get('mbti', {}).get('description', 'N/A')}

### Big Five (OCEAN)

- **Ouverture** : {profile.psychological_analysis.get('big_five', {}).get('openness', 'N/A')}/100
- **Conscience** : {profile.psychological_analysis.get('big_five', {}).get('conscientiousness', 'N/A')}/100
- **Extraversion** : {profile.psychological_analysis.get('big_five', {}).get('extraversion', 'N/A')}/100
- **Agréabilité** : {profile.psychological_analysis.get('big_five', {}).get('agreeableness', 'N/A')}/100
- **Neuroticisme** : {profile.psychological_analysis.get('big_five', {}).get('neuroticism', 'N/A')}/100

### Ennéagramme

**Type** : {profile.psychological_analysis.get('enneagram', {}).get('type', 'N/A')}
**Aile** : {profile.psychological_analysis.get('enneagram', {}).get('wing', 'N/A')}
**Tritype** : {profile.psychological_analysis.get('enneagram', {}).get('tritype', 'N/A')}

### PNL Méta-programmes

- **Toward/Away** : {profile.psychological_analysis.get('pnl', {}).get('toward_away', 'N/A')}
- **Internal/External** : {profile.psychological_analysis.get('pnl', {}).get('internal_external', 'N/A')}
- **Options/Procedures** : {profile.psychological_analysis.get('pnl', {}).get('options_procedures', 'N/A')}

### PCM

**Type dominant** : {profile.psychological_analysis.get('pcm', {}).get('dominant_type', 'N/A').title()}

### VAKOG

**Canal dominant** : {profile.psychological_analysis.get('vakog', {}).get('dominant_channel', 'N/A').title()}

### Langages d'amour

**Primaire** : {profile.psychological_analysis.get('love_languages', {}).get('primary', 'N/A').replace('_', ' ').title()}
**Secondaire** : {profile.psychological_analysis.get('love_languages', {}).get('secondary', 'N/A').replace('_', ' ').title()}

---

## 🧬 Neurodivergence

### TDAH

**Score** : {profile.neurodivergence_analysis.get('adhd', {}).get('score', 'N/A')}/100

### HPI (Haut Potentiel Intellectuel)

**Score** : {profile.neurodivergence_analysis.get('hpi', {}).get('score', 'N/A')}/100

### Hypersensibilité

**Score** : {profile.neurodivergence_analysis.get('hypersensitivity', {}).get('score', 'N/A')}/100

---

## 🌈 Dimensions Shinkofa

### Roue de vie

{self._format_life_wheel(profile.shinkofa_analysis.get('life_wheel', {}))}

### Archétypes

**Primaire** : {profile.shinkofa_analysis.get('archetypes', {}).get('primary', 'N/A').title()}
**Secondaire** : {profile.shinkofa_analysis.get('archetypes', {}).get('secondary', 'N/A').title()}
**Tertiaire** : {profile.shinkofa_analysis.get('archetypes', {}).get('tertiary', 'N/A').title()}

---

## 📝 Synthèse IA

{profile.synthesis or 'Synthèse non disponible'}

---

## 💡 Recommandations

{self._format_recommendations(profile.recommendations or {})}

---

**Profil généré par SHIZEN AI** - La Voie Shinkofa
Copyright © {datetime.now().year} La Voie Shinkofa - Tous droits réservés
"""

            logger.info(f"✅ Markdown exported ({len(md_content)} characters)")
            return md_content

        except Exception as e:
            logger.error(f"❌ Markdown export error: {e}")
            return f"# Erreur export\n\nErreur lors de l'export : {str(e)}"

    def save_markdown(self, profile: HolisticProfile) -> str:
        """
        Save holistic profile as Markdown file

        Args:
            profile: HolisticProfile instance

        Returns:
            File path of saved Markdown
        """
        try:
            md_content = self.export_markdown(profile)

            filename = f"profile_{profile.user_id}_{profile.id[:8]}.md"
            filepath = os.path.join(self.export_dir, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(md_content)

            logger.info(f"✅ Markdown saved: {filepath}")
            return filepath

        except Exception as e:
            logger.error(f"❌ Markdown save error: {e}")
            raise Exception(f"Failed to save Markdown: {str(e)}")

    def export_pdf(self, profile: HolisticProfile) -> bytes:
        """
        Export holistic profile to PDF format

        Args:
            profile: HolisticProfile instance

        Returns:
            PDF content as bytes

        Note:
            Requires reportlab or fpdf library
            For now, returns placeholder - implement with reportlab if needed
        """
        # TODO: Implement PDF export with reportlab
        # For MVP, we can use markdown2pdf conversion or simple text PDF
        logger.warning("⚠️ PDF export not yet implemented - returning placeholder")

        placeholder_text = f"""
        Profil Holistique Shinkofa

        User: {profile.user_id}
        Generated: {profile.generated_at}

        PDF export coming soon...
        Use Markdown export for now.
        """

        return placeholder_text.encode('utf-8')

    def _format_life_wheel(self, life_wheel: Dict) -> str:
        """Format life wheel dimensions"""
        if not life_wheel:
            return "Non disponible"

        lines = []
        for dimension, score in life_wheel.items():
            bar = "█" * int(score) + "░" * (10 - int(score))
            lines.append(f"- **{dimension.title()}** : {bar} {score}/10")

        return "\n".join(lines)

    def _format_recommendations(self, recommendations: Dict) -> str:
        """Format recommendations"""
        if not recommendations:
            return "Aucune recommandation disponible"

        sections = []

        for category, items in recommendations.items():
            if not items:
                continue

            section = f"### {category.replace('_', ' ').title()}\n\n"
            for item in items:
                if isinstance(item, dict):
                    rec = item.get("recommendation", "")
                    section += f"- {rec}\n"
                else:
                    section += f"- {item}\n"

            sections.append(section)

        return "\n".join(sections) if sections else "Aucune recommandation disponible"


# Singleton instance
_export_service: Optional[ProfileExportService] = None


def get_profile_export_service() -> ProfileExportService:
    """Get or create Profile Export service singleton"""
    global _export_service
    if _export_service is None:
        _export_service = ProfileExportService()
    return _export_service
