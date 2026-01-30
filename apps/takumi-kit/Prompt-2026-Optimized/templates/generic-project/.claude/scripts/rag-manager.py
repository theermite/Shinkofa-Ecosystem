#!/usr/bin/env python3
"""
RAG Manager - Consultation Automatique Documentation

Script pour gérer la consultation intelligente de la documentation projet
avant chaque action significative.

Usage:
    python rag-manager.py check [action]
    python rag-manager.py read [file]
    python rag-manager.py search [keywords]
    python rag-manager.py status
"""

import sys
import os
import re
from pathlib import Path
from typing import List, Dict, Optional


# Mapping actions → fichiers documentation pertinents
ACTION_TO_DOCS = {
    "architecture": ["ARCHITECTURE.md", "CONTEXT.md"],
    "api": ["API_REFERENCE.md", "ARCHITECTURE.md"],
    "database": ["DATABASE_SCHEMA.md", "ARCHITECTURE.md"],
    "bug": ["KNOWN_ISSUES.md"],
    "feature": ["CONTEXT.md", "ARCHITECTURE.md", "CODING_STANDARDS.md"],
    "code": ["CODING_STANDARDS.md"],
    "test": ["TESTING_GUIDE.md", "CODING_STANDARDS.md"],
    "release": ["CHANGELOG.md", "KNOWN_ISSUES.md"],
    "deploy": ["ARCHITECTURE.md"],
    "refactor": ["ARCHITECTURE.md", "CODING_STANDARDS.md"],
}


def get_project_root() -> Path:
    """Trouve la racine du projet (où se trouve .claude/)."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".claude").exists():
            return current
        current = current.parent
    return Path.cwd()


def get_docs_dir() -> Path:
    """Retourne le chemin vers .claude/docs/."""
    return get_project_root() / ".claude" / "docs"


def get_lessons_dir() -> Path:
    """Retourne le chemin vers lessons learned."""
    # Chercher d'abord localement, sinon dans Instruction-Claude-Code
    local_lessons = get_project_root() / ".claude" / "lessons"
    if local_lessons.exists():
        return local_lessons

    # Chercher dans le dépôt global
    global_lessons = Path(__file__).parent.parent.parent.parent.parent / "infrastructure" / "lessons"
    if global_lessons.exists():
        return global_lessons

    return local_lessons  # Retourner local par défaut


def check_docs_exist() -> Dict[str, bool]:
    """Vérifie quels fichiers documentation existent."""
    docs_dir = get_docs_dir()

    standard_docs = [
        "ARCHITECTURE.md",
        "API_REFERENCE.md",
        "DATABASE_SCHEMA.md",
        "CODING_STANDARDS.md",
        "TESTING_GUIDE.md",
        "CONTEXT.md",
        "CHANGELOG.md",
        "KNOWN_ISSUES.md",
    ]

    return {
        doc: (docs_dir / doc).exists()
        for doc in standard_docs
    }


def get_relevant_docs(action: str) -> List[str]:
    """Retourne la liste des docs pertinents pour une action."""
    action_lower = action.lower()

    # Chercher correspondance exacte
    if action_lower in ACTION_TO_DOCS:
        return ACTION_TO_DOCS[action_lower]

    # Chercher correspondance partielle
    for key, docs in ACTION_TO_DOCS.items():
        if key in action_lower or action_lower in key:
            return docs

    # Par défaut, retourner ARCHITECTURE + CODING_STANDARDS
    return ["ARCHITECTURE.md", "CODING_STANDARDS.md"]


def read_doc_sections(doc_path: Path, keywords: Optional[List[str]] = None) -> str:
    """Lit un document et extrait les sections pertinentes."""
    if not doc_path.exists():
        return f"❌ Document non trouvé: {doc_path}"

    try:
        content = doc_path.read_text(encoding="utf-8")

        if not keywords:
            # Retourner résumé (table des matières)
            lines = content.split("\n")
            toc = [line for line in lines if line.startswith("#")]
            return "\n".join(toc[:20])  # Max 20 headers

        # Extraire sections contenant keywords
        sections = []
        current_section = []
        current_header = ""

        for line in content.split("\n"):
            if line.startswith("#"):
                # Nouvelle section
                if current_section and any(kw.lower() in " ".join(current_section).lower() for kw in keywords):
                    sections.append(current_header + "\n" + "\n".join(current_section))
                current_section = []
                current_header = line
            else:
                current_section.append(line)

        # Dernière section
        if current_section and any(kw.lower() in " ".join(current_section).lower() for kw in keywords):
            sections.append(current_header + "\n" + "\n".join(current_section))

        if sections:
            return "\n\n---\n\n".join(sections)
        else:
            return f"ℹ️ Aucune section trouvée avec keywords: {', '.join(keywords)}"

    except Exception as e:
        return f"❌ Erreur lecture {doc_path}: {e}"


def search_lessons(keywords: List[str]) -> str:
    """Recherche dans les lessons learned."""
    lessons_dir = get_lessons_dir()

    if not lessons_dir.exists():
        return f"ℹ️ Répertoire lessons non trouvé: {lessons_dir}"

    results = []

    for lesson_file in lessons_dir.glob("*.md"):
        if lesson_file.name == "README.md":
            continue

        try:
            content = lesson_file.read_text(encoding="utf-8")

            # Chercher keywords
            for keyword in keywords:
                if keyword.lower() in content.lower():
                    # Extraire contexte autour du keyword
                    lines = content.split("\n")
                    for i, line in enumerate(lines):
                        if keyword.lower() in line.lower():
                            context_start = max(0, i - 2)
                            context_end = min(len(lines), i + 5)
                            context = "\n".join(lines[context_start:context_end])
                            results.append(f"📁 {lesson_file.name}:\n{context}\n")
                            break  # Une occurrence par fichier suffit
        except Exception as e:
            continue

    if results:
        return "\n---\n".join(results[:5])  # Max 5 résultats
    else:
        return f"ℹ️ Aucune leçon trouvée pour: {', '.join(keywords)}"


def cmd_check(action: str):
    """Vérifie quelle documentation consulter pour une action."""
    print(f"🔍 Vérification documentation pour action: '{action}'\n")

    relevant_docs = get_relevant_docs(action)
    docs_status = check_docs_exist()

    print("📚 Documentation pertinente:\n")

    for doc in relevant_docs:
        status = "✅" if docs_status.get(doc, False) else "❌"
        print(f"  {status} {doc}")

    missing = [doc for doc in relevant_docs if not docs_status.get(doc, False)]

    if missing:
        print(f"\n⚠️ Documentation manquante: {', '.join(missing)}")
        print("💡 Utilise: /init-rag pour initialiser la structure")
    else:
        print("\n✅ Toute la documentation requise est présente")

    print("\n💡 Pour lire un document:")
    print(f"   python rag-manager.py read {relevant_docs[0]}")


def cmd_read(doc_name: str, *keywords):
    """Lit un document documentation."""
    docs_dir = get_docs_dir()
    doc_path = docs_dir / doc_name

    if not doc_path.exists():
        print(f"❌ Document non trouvé: {doc_path}")
        print(f"💡 Documents disponibles dans {docs_dir}:")
        for doc in docs_dir.glob("*.md"):
            print(f"   - {doc.name}")
        return

    print(f"📖 Lecture: {doc_name}\n")

    content = read_doc_sections(doc_path, list(keywords) if keywords else None)
    print(content)


def cmd_search(*keywords):
    """Recherche dans documentation + lessons learned."""
    if not keywords:
        print("❌ Usage: python rag-manager.py search [keywords...]")
        return

    print(f"🔍 Recherche: {' '.join(keywords)}\n")

    # 1. Chercher dans docs projet
    print("📚 Documentation Projet:\n")
    docs_dir = get_docs_dir()
    found_in_docs = False

    for doc in docs_dir.glob("*.md"):
        content = read_doc_sections(doc, list(keywords))
        if not content.startswith("ℹ️") and not content.startswith("❌"):
            print(f"📄 {doc.name}:")
            print(content[:500])  # Limit output
            print("\n---\n")
            found_in_docs = True

    if not found_in_docs:
        print("ℹ️ Rien trouvé dans la documentation projet\n")

    # 2. Chercher dans lessons learned
    print("📖 Lessons Learned:\n")
    lessons_results = search_lessons(list(keywords))
    print(lessons_results)


def cmd_status():
    """Affiche le statut de la documentation projet."""
    print("📊 Statut Documentation Projet\n")

    docs_dir = get_docs_dir()
    print(f"📁 Répertoire: {docs_dir}\n")

    docs_status = check_docs_exist()

    present = [doc for doc, exists in docs_status.items() if exists]
    missing = [doc for doc, exists in docs_status.items() if not exists]

    print(f"✅ Présents ({len(present)}/8):\n")
    for doc in present:
        doc_path = docs_dir / doc
        size = doc_path.stat().st_size if doc_path.exists() else 0
        print(f"   ✅ {doc} ({size:,} bytes)")

    if missing:
        print(f"\n❌ Manquants ({len(missing)}/8):\n")
        for doc in missing:
            print(f"   ❌ {doc}")
        print("\n💡 Utilise: /init-rag pour initialiser")

    # Vérifier lessons learned
    lessons_dir = get_lessons_dir()
    if lessons_dir.exists():
        lesson_count = len(list(lessons_dir.glob("*.md")))
        print(f"\n📖 Lessons Learned: {lesson_count} fichiers dans {lessons_dir}")
    else:
        print(f"\n⚠️ Lessons Learned non trouvé: {lessons_dir}")

    # Score global
    score = (len(present) / len(docs_status)) * 100
    print(f"\n📊 Score Documentation: {score:.0f}%")

    if score == 100:
        print("🎉 Documentation complète!")
    elif score >= 75:
        print("✅ Documentation bonne, quelques fichiers manquants")
    elif score >= 50:
        print("⚠️ Documentation incomplète, à compléter")
    else:
        print("❌ Documentation insuffisante, initialisation recommandée")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python rag-manager.py check [action]     - Vérifie docs pour une action")
        print("  python rag-manager.py read [file]        - Lit un document")
        print("  python rag-manager.py search [keywords]  - Recherche dans docs")
        print("  python rag-manager.py status             - Statut documentation")
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == "check":
        if not args:
            print("❌ Usage: python rag-manager.py check [action]")
            sys.exit(1)
        cmd_check(args[0])

    elif command == "read":
        if not args:
            print("❌ Usage: python rag-manager.py read [file] [keywords...]")
            sys.exit(1)
        cmd_read(*args)

    elif command == "search":
        if not args:
            print("❌ Usage: python rag-manager.py search [keywords...]")
            sys.exit(1)
        cmd_search(*args)

    elif command == "status":
        cmd_status()

    else:
        print(f"❌ Commande inconnue: {command}")
        print("Commandes disponibles: check, read, search, status")
        sys.exit(1)


if __name__ == "__main__":
    main()
