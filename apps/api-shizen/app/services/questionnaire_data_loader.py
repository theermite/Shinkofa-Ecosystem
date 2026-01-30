"""
Questionnaire Data Loader - Parse Markdown questions to JSON
Shinkofa Platform - Holistic Questionnaire (144 questions - V5.1 optimized)
"""
import re
from typing import List, Dict, Any, Optional
from pathlib import Path


class QuestionnaireDataLoader:
    """
    Parser pour le questionnaire holistique Shizen (format Markdown → JSON)

    Source: code-existant/Website-Shinkofa/Ressources/Liste-Question-Questionnaire-Shizen-Complet.md
    """

    def __init__(self, markdown_file_path: str):
        """
        Initialize loader with markdown file path

        Args:
            markdown_file_path: Path to markdown file containing questions
        """
        self.markdown_file_path = Path(markdown_file_path)
        if not self.markdown_file_path.exists():
            raise FileNotFoundError(f"Markdown file not found: {markdown_file_path}")

    def load_questions(self) -> Dict[str, Any]:
        """
        Load all questions from markdown file and parse to structured JSON

        Returns:
            Dict with structure:
            {
                "metadata": {...},
                "introduction": "Full introduction text (markdown format)",
                "blocs": [
                    {
                        "id": "A",
                        "title": "CONTEXTE DE VIE",
                        "emoji": "🏠",
                        "modules": [
                            {
                                "id": "A1",
                                "title": "Informations personnelles",
                                "questions": [...]
                            }
                        ]
                    }
                ]
            }
        """
        with open(self.markdown_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove metadata section at the end (after last "---")
        # This prevents parsing "🎯 OBJECTIFS ATTEINTS :" as a question
        last_separator_index = content.rfind('\n---\n')
        if last_separator_index != -1:
            # Keep only content before the last separator
            content = content[:last_separator_index]

        # Extract metadata from header
        metadata = self._extract_metadata(content)

        # Extract introduction (everything before first ### BLOC)
        introduction = self._extract_introduction(content)

        # Extract blocs
        blocs = self._extract_blocs(content)

        return {
            "metadata": metadata,
            "introduction": introduction,
            "total_questions": sum(
                len(q)
                for bloc in blocs
                for module in bloc.get("modules", [])
                for q in [module.get("questions", [])]
            ),
            "total_blocs": len(blocs),
            "blocs": blocs
        }

    def _extract_metadata(self, content: str) -> Dict[str, Any]:
        """Extract metadata from markdown header"""
        metadata = {
            "title": "Questionnaire Holistique Shizen",
            "version": "5.1",
            "total_estimated_questions": 144,
            "estimated_duration_minutes": "40-55",
            "creator": "La Voie Shinkofa",
            "purpose": "Analyse holistique complète (psychologie + neurodivergences + Shinkofa)"
        }

        # Extract version if present
        version_match = re.search(r'V(\d+\.\d+)', content)
        if version_match:
            metadata["version"] = version_match.group(1)

        # Extract total questions if present
        total_match = re.search(r'\*\*TOTAL ESTIMÉ :\*\* \*\*(\d+) questions\*\*', content)
        if total_match:
            metadata["total_estimated_questions"] = int(total_match.group(1))

        return metadata

    def _extract_introduction(self, content: str) -> str:
        """
        Extract introduction text (everything before first ### BLOC)

        Returns:
            Introduction text in markdown format (includes title, welcome message, instructions)
        """
        # Find first bloc marker (### emoji BLOC X)
        first_bloc_match = re.search(r'### . BLOC [A-I]', content)

        if first_bloc_match:
            # Return everything before first bloc
            introduction = content[:first_bloc_match.start()].strip()
        else:
            # No blocs found - return empty string
            introduction = ""

        return introduction

    def _extract_blocs(self, content: str) -> List[Dict[str, Any]]:
        """Extract all blocs from markdown content"""
        blocs = []

        # Pattern pour les blocs : ### 🏠 BLOC A : TITRE
        # Capture tout le contenu jusqu'au prochain bloc (###) ou fin de fichier
        bloc_pattern = r'### (.) BLOC ([A-I]) : (.+?)(?=\n### |\Z)'

        for bloc_match in re.finditer(bloc_pattern, content, re.DOTALL):
            emoji = bloc_match.group(1).strip()
            bloc_id = bloc_match.group(2).strip()
            # Remove newlines from title
            bloc_title = bloc_match.group(3).strip().split('\n')[0].strip()
            # Get full bloc content (including modules)
            bloc_content = bloc_match.group(0)

            # Extract modules within this bloc
            modules = self._extract_modules(bloc_content, bloc_id)

            blocs.append({
                "id": bloc_id,
                "title": bloc_title,
                "emoji": emoji,
                "modules": modules,
                "total_questions": sum(len(m.get("questions", [])) for m in modules)
            })

        return blocs

    def _extract_modules(self, bloc_content: str, bloc_id: str) -> List[Dict[str, Any]]:
        """Extract modules within a bloc"""
        modules = []

        # Pattern pour les modules : #### Module A1 : Titre
        # Capture tout le contenu jusqu'au prochain module (####) ou bloc (###) ou fin
        module_pattern = r'#### Module ([A-I]\d+) : (.+?)(?=\n####|\n### |\Z)'

        for module_match in re.finditer(module_pattern, bloc_content, re.DOTALL):
            module_id = module_match.group(1).strip()
            # Remove newlines from title
            module_title = module_match.group(2).strip().split('\n')[0].strip()
            # Get full module content (including questions)
            module_content = module_match.group(0)

            # Extract questions within this module
            questions = self._extract_questions(module_content, module_id)

            modules.append({
                "id": module_id,
                "title": module_title,
                "questions": questions
            })

        return modules

    def _extract_questions(self, module_content: str, module_id: str) -> List[Dict[str, Any]]:
        """Extract questions within a module"""
        questions = []
        question_counter = 1

        # Pattern pour les questions : **Texte question ?** OU **Texte question :**
        # Suivi par les métadonnées (Type, Options, Annotation, etc.)
        lines = module_content.split('\n')

        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Check if this is a question (starts with ** and ends with ** and contains ? or :)
            if line.startswith('**') and line.endswith('**') and ('?' in line or line.endswith(':**')):
                # Extract question text
                question_text = line.strip('*').strip()

                # Parse metadata for this question
                metadata, next_index = self._parse_question_metadata(lines, i + 1)

                # Generate question ID
                question_id = f"{module_id}_Q{question_counter:02d}"

                question = {
                    "id": question_id,
                    "text": question_text,
                    "type": metadata.get("type", "text"),
                    "options": metadata.get("options", []),
                    "items": metadata.get("items", []),
                    "scale_labels": metadata.get("scale_labels", ""),
                    "annotation": metadata.get("annotation", ""),
                    "comment_allowed": metadata.get("comment_allowed", False),
                    "required": metadata.get("required", False)
                }

                questions.append(question)
                question_counter += 1
                i = next_index
            else:
                i += 1

        return questions

    def _parse_question_metadata(self, lines: List[str], start_index: int) -> tuple[Dict[str, Any], int]:
        """
        Parse question metadata (Type, Options, Annotation, etc.)

        Returns:
            Tuple of (metadata dict, next_line_index)
        """
        metadata = {
            "type": "text",
            "options": [],
            "items": [],
            "scale_labels": "",
            "annotation": "",
            "comment_allowed": False,
            "required": False
        }

        i = start_index
        while i < len(lines):
            line = lines[i].strip()

            # Stop if we hit next question or empty lines
            if line.startswith('**') and '?' in line:
                break
            if not line or line.startswith('###') or line.startswith('####'):
                break

            # Parse Type
            if line.startswith('- *Type :*'):
                type_text = line.replace('- *Type :*', '').strip()
                metadata["type"] = self._parse_question_type(type_text)

                # For Likert scales, extract scale labels if present in parentheses
                # Example: "Likert 5 points (Très difficiles → Très harmonieuses)"
                if "likert" in type_text.lower():
                    scale_labels_match = re.search(r'\((.*?)\)', type_text)
                    if scale_labels_match:
                        scale_labels_text = scale_labels_match.group(1).strip()
                        # Store as single item for simple Likert scales
                        # This will be overwritten if explicit Items line exists
                        if '→' in scale_labels_text or '=' in scale_labels_text:
                            metadata["scale_labels"] = scale_labels_text

            # Parse Options
            elif line.startswith('- *Options :*'):
                options_text = line.replace('- *Options :*', '').strip()
                metadata["options"] = self._parse_options(options_text)

            # Parse Items (for Likert scales)
            elif line.startswith('- *Items :*'):
                items_text = line.replace('- *Items :*', '').strip()
                metadata["items"] = [item.strip() for item in items_text.split(',')]

            # Parse Paires (for Likert pairs)
            elif line.startswith('- *Paires :*'):
                pairs_text = line.replace('- *Paires :*', '').strip()
                metadata["items"] = [pair.strip() for pair in pairs_text.split(',')]

            # Parse Annotation
            elif line.startswith('- *Annotation :*'):
                annotation_parts = [line.replace('- *Annotation :*', '').strip()]
                definitions = []

                # Look ahead for definitions (multi-line annotations)
                # Definitions can appear after annotation AND after other metadata like Commentaire libre
                j = i + 1
                while j < len(lines) and j < i + 30:  # Limit search to 30 lines
                    next_line = lines[j].strip()

                    # Capture definitions (format: **Définition - Terme** : Description)
                    if next_line.startswith('**Définition -'):
                        definitions.append(next_line)
                        j += 1
                    # Stop at next question (** with ? or ending with :**)
                    elif next_line.startswith('**') and ('?' in next_line or next_line.endswith(':**')):
                        # Make sure it's not a definition
                        if not next_line.startswith('**Définition -'):
                            break
                        else:
                            j += 1
                    # Stop at section headers
                    elif next_line.startswith('###') or next_line.startswith('####'):
                        break
                    # Continue for empty lines and metadata (don't stop on - *)
                    else:
                        j += 1

                # Combine annotation and definitions with newlines
                if definitions:
                    combined = annotation_parts + [''] + definitions
                    metadata["annotation"] = '\n'.join(combined)
                else:
                    metadata["annotation"] = annotation_parts[0] if annotation_parts and annotation_parts[0] else ''

            # Parse Commentaire libre
            elif line.startswith('- *Commentaire libre :*'):
                comment_text = line.replace('- *Commentaire libre :*', '').strip().lower()
                metadata["comment_allowed"] = "optionnel" in comment_text or "oui" in comment_text

            # Parse Obligatoire
            elif line.startswith('- *Obligatoire :*'):
                required_text = line.replace('- *Obligatoire :*', '').strip().lower()
                metadata["required"] = "oui" in required_text or "true" in required_text

            i += 1

        return metadata, i

    def _parse_options(self, options_text: str) -> List[str]:
        """
        Parse options from text, handling quoted strings and commas within options

        Examples:
            '"Option 1", "Option 2, with comma", "Option 3"' -> ['Option 1', 'Option 2, with comma', 'Option 3']
            'Option A, Option B - detail1, detail2, Option C' -> ['Option A', 'Option B - detail1, detail2', 'Option C']

        Strategy:
            - If options are in quotes: split by '", "' and remove quotes
            - Otherwise: split by ', ' but try to detect pattern (capital letter after comma = new option)
        """
        if not options_text:
            return []

        # Case 1: Options in double quotes (e.g., "Option 1", "Option 2")
        if options_text.startswith('"') and '", "' in options_text:
            # Split by '", "' and clean quotes
            options = options_text.split('", "')
            return [opt.strip().strip('"') for opt in options]

        # Case 2: Regular options - smart split
        # We need to detect actual option boundaries vs internal commas
        # Heuristic: New option starts with capital letter or after standard patterns

        # First, try simple split and see if it makes sense
        simple_split = [opt.strip() for opt in options_text.split(', ')]

        # Quick check: if all options start with capital letter (not counting very short ones), it's probably correct
        # But we need to be careful with short words that might be continuations
        capitals_only = [opt for opt in simple_split if opt and len(opt) >= 4]
        if capitals_only and all(opt[0].isupper() for opt in capitals_only):
            # All significant options start with capital, but we still need to check for dash patterns
            # If there's a dash in the text, we might have continuations
            if ' - ' not in options_text:
                return simple_split

        # Otherwise, merge options that don't start with capital (they're probably continuations)
        merged_options = []
        current_option = ""

        for i, opt in enumerate(simple_split):
            opt = opt.strip()
            if not opt:
                continue

            # Detect if this is likely a continuation (not a new option)
            is_continuation = False

            if current_option:
                # Common continuation patterns:
                # 1. Lowercase word (unless it's first)
                # 2. Very short words that are part of enumerations (etc., gaz, lieu)
                # 3. Words that don't start with capital and aren't common option starters
                opt_lower = opt.lower()

                # Check if previous option has dash (e.g., "Option - detail1, detail2, etc.")
                has_dash_before = '-' in current_option

                if has_dash_before and not opt[0].isupper():
                    # Part of dash enumeration
                    is_continuation = True
                elif opt_lower in ['etc.', 'gaz', 'lieu', 'amis', 'famille']:
                    # Known continuation words
                    is_continuation = True
                elif not opt[0].isupper() and not opt.startswith('et '):
                    # Lowercase and not starting with "et "
                    is_continuation = True

            if is_continuation:
                # Continue previous option
                current_option += ", " + opt
            else:
                # Start new option
                if current_option:
                    merged_options.append(current_option)
                current_option = opt

        # Add last option
        if current_option:
            merged_options.append(current_option)

        return merged_options

    def _parse_question_type(self, type_text: str) -> str:
        """
        Parse question type from text

        Examples:
            "Radio" -> "radio"
            "Checkbox (choix multiples)" -> "checkbox"
            "Likert 5 points" -> "likert_5"
            "Champ numérique (16-100)" -> "number"
        """
        type_text_lower = type_text.lower()

        if "radio" in type_text_lower:
            return "radio"
        elif "checkbox" in type_text_lower or "choix multiples" in type_text_lower:
            return "checkbox"
        elif "likert" in type_text_lower:
            # Extract scale if present (e.g., "Likert 5 points" -> "likert_5")
            scale_match = re.search(r'(\d+)\s*points?', type_text_lower)
            if scale_match:
                return f"likert_{scale_match.group(1)}"
            return "likert_5"  # Default to 5-point scale
        elif "numérique" in type_text_lower or "number" in type_text_lower:
            return "number"
        elif "texte" in type_text_lower or "text" in type_text_lower:
            return "text"
        else:
            return "text"  # Default


# Singleton instance for global access
_loader_instance: Optional[QuestionnaireDataLoader] = None


def get_questionnaire_data() -> Dict[str, Any]:
    """
    Get questionnaire data (singleton pattern)

    Returns:
        Structured questionnaire data as JSON
    """
    global _loader_instance

    if _loader_instance is None:
        # Path from app/data directory (accessible in Docker)
        # File copied from: code-existant/Website-Shinkofa/Ressources/
        markdown_path = Path(__file__).parent.parent / "data" / \
                       "Liste-Question-Questionnaire-Shizen-Complet.md"

        _loader_instance = QuestionnaireDataLoader(str(markdown_path))

    return _loader_instance.load_questions()


def get_bloc_questions(bloc_id: str) -> Optional[Dict[str, Any]]:
    """
    Get questions for a specific bloc

    Args:
        bloc_id: Bloc ID (A-I)

    Returns:
        Bloc data with questions or None if not found
    """
    data = get_questionnaire_data()

    for bloc in data.get("blocs", []):
        if bloc.get("id") == bloc_id.upper():
            return bloc

    return None


def get_module_questions(module_id: str) -> Optional[Dict[str, Any]]:
    """
    Get questions for a specific module

    Args:
        module_id: Module ID (e.g., "A1", "B2")

    Returns:
        Module data with questions or None if not found
    """
    data = get_questionnaire_data()

    for bloc in data.get("blocs", []):
        for module in bloc.get("modules", []):
            if module.get("id") == module_id.upper():
                return module

    return None
