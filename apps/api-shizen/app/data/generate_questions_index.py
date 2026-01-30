#!/usr/bin/env python3
"""
Script de génération d'index des questions du questionnaire Shinkofa
Extrait toutes les questions avec leurs métadonnées pour faciliter la navigation
"""

import re
import json
from pathlib import Path

def parse_questionnaire(file_path):
    """Parse le fichier markdown et extrait toutes les questions"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    current_module = None
    current_bloc = None
    question_number = 0

    lines = content.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Détecter les blocs (BLOC A, BLOC B, etc.)
        if line.startswith('###') and 'BLOC' in line:
            current_bloc = line.replace('#', '').strip()

        # Détecter les modules (#### Module)
        elif line.startswith('####') and 'Module' in line:
            current_module = line.replace('#', '').strip()

        # Détecter une question (ligne qui commence et finit par ** ou :**)
        elif line.startswith('**') and (line.endswith(':**') or line.endswith('**')):
            # Exclure les titres de blocs/modules et copyright
            if 'BLOC' in line or 'Module' in line or 'Copyright' in line or '©' in line:
                i += 1
                continue

            question_number += 1
            question_text = line.replace('**', '').replace(':**', '').replace(':', '').strip()

            # Extraire les métadonnées (Type, Options, Annotation)
            metadata = {
                'number': question_number,
                'text': question_text,
                'bloc': current_bloc,
                'module': current_module,
                'line_number': i + 1,
                'type': None,
                'options': [],
                'annotation': None,
                'commentaire_libre': None
            }

            # Parser les lignes suivantes pour les métadonnées
            j = i + 1
            definitions = []  # Collecter les définitions
            annotation_parts = []  # Collecter les parties d'annotation

            while j < len(lines) and j < i + 20:  # Augmenté à 20 lignes pour capturer les définitions
                next_line = lines[j].strip()

                if next_line.startswith('- *Type :*'):
                    metadata['type'] = next_line.replace('- *Type :*', '').strip()

                elif next_line.startswith('- *Options :*'):
                    metadata['options'] = next_line.replace('- *Options :*', '').strip()

                elif next_line.startswith('- *Annotation :*'):
                    annotation_parts.append(next_line.replace('- *Annotation :*', '').strip())

                elif next_line.startswith('**Définition -'):
                    # Capturer la définition (format: **Définition - Terme** : Description)
                    definitions.append(next_line)

                elif next_line.startswith('- *Commentaire libre :*') or next_line.startswith('- *Commentaire* :'):
                    metadata['commentaire_libre'] = next_line.replace('- *Commentaire libre :*', '').replace('- *Commentaire* :', '').strip()

                # Arrêter si on trouve une nouvelle question
                elif next_line.startswith('**') and (next_line.endswith(':**') or next_line.endswith('**')):
                    # Ne pas s'arrêter sur les titres de blocs/modules ou définitions
                    if 'BLOC' not in next_line and 'Module' not in next_line and 'Définition' not in next_line:
                        break

                j += 1

            # Combiner annotation et définitions
            if annotation_parts or definitions:
                combined = []
                if annotation_parts:
                    combined.extend(annotation_parts)
                if definitions:
                    combined.append('')  # Saut de ligne avant les définitions
                    combined.extend(definitions)
                metadata['annotation'] = '\n'.join(combined)

            questions.append(metadata)

        i += 1

    return questions

def generate_index():
    """Génère l'index JSON des questions"""
    script_dir = Path(__file__).parent
    markdown_file = script_dir / 'Liste-Question-Questionnaire-Shizen-Complet.md'
    output_file = script_dir / 'questions-index.json'

    print(f"📖 Lecture du questionnaire : {markdown_file}")
    questions = parse_questionnaire(markdown_file)

    print(f"✅ {len(questions)} questions extraites")

    # Générer l'index
    index = {
        'version': '1.0.0',
        'total_questions': len(questions),
        'generated_at': None,  # Sera ajouté par le backend
        'questions': questions
    }

    # Sauvegarder en JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"💾 Index sauvegardé : {output_file}")

    # Afficher un résumé
    print(f"\n📊 Résumé:")
    blocs = {}
    for q in questions:
        bloc = q.get('bloc', 'Sans bloc')
        blocs[bloc] = blocs.get(bloc, 0) + 1

    for bloc, count in blocs.items():
        print(f"  - {bloc}: {count} questions")

    return index

if __name__ == '__main__':
    generate_index()
