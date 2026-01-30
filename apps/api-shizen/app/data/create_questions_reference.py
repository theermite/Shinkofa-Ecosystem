#!/usr/bin/env python3
"""
Crée un index de référence lisible de toutes les questions du questionnaire
Format markdown propre et numéroté pour faciliter la maintenance
"""

import json
from pathlib import Path

def create_reference_index():
    """Génère un fichier markdown de référence avec toutes les questions numérotées"""
    script_dir = Path(__file__).parent
    json_file = script_dir / 'questions-index.json'
    output_file = script_dir / 'QUESTIONS-INDEX-REFERENCE.md'

    # Lire l'index JSON
    with open(json_file, 'r', encoding='utf-8') as f:
        index = json.load(f)

    questions = index['questions']

    # Générer le markdown
    lines = []
    lines.append("# 📚 INDEX DE RÉFÉRENCE - QUESTIONS QUESTIONNAIRE SHINKOFA\n")
    lines.append(f"**Version** : {index['version']}\n")
    lines.append(f"**Total questions** : {index['total_questions']}\n")
    lines.append(f"**Généré** : Script automatique\n")
    lines.append("\n---\n\n")

    current_bloc = None

    for q in questions:
        # Nouveau bloc
        if q['bloc'] != current_bloc:
            current_bloc = q['bloc']
            lines.append(f"\n## {current_bloc}\n\n")

        # Nouveau module
        if q.get('module'):
            # Vérifier si c'est le premier du module
            prev_q = questions[questions.index(q) - 1] if questions.index(q) > 0 else None
            if not prev_q or prev_q.get('module') != q['module']:
                lines.append(f"\n### {q['module']}\n\n")

        # Question
        lines.append(f"**Q{q['number']}** (Ligne {q['line_number']}) : {q['text']}\n")

        # Type
        if q['type']:
            lines.append(f"- *Type* : {q['type']}\n")

        # Options (abrégées si trop longues)
        if q['options']:
            options_text = q['options']
            if len(options_text) > 150:
                options_text = options_text[:147] + "..."
            lines.append(f"- *Options* : {options_text}\n")

        # Annotation
        if q['annotation']:
            annotation_text = q['annotation']
            if len(annotation_text) > 200:
                annotation_text = annotation_text[:197] + "..."
            lines.append(f"- *Annotation* : {annotation_text}\n")

        # Commentaire libre
        if q['commentaire_libre']:
            lines.append(f"- *Commentaire* : {q['commentaire_libre']}\n")

        lines.append("\n")

    # Écrire le fichier
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"✅ Index de référence créé : {output_file}")
    print(f"📊 {len(questions)} questions indexées")

    # Statistiques par bloc
    blocs = {}
    for q in questions:
        bloc = q.get('bloc', 'Sans bloc')
        blocs[bloc] = blocs.get(bloc, 0) + 1

    print(f"\n📈 Répartition par bloc :")
    for bloc, count in blocs.items():
        print(f"  - {bloc}: {count} questions")

if __name__ == '__main__':
    create_reference_index()
