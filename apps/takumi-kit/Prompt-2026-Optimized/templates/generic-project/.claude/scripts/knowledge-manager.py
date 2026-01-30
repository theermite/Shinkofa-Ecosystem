#!/usr/bin/env python3
"""
Knowledge Library Manager

Gère la base de connaissances personnalisée pour enrichir le contexte Claude.

Workflow 5-phase:
1. DISCOVER  - Scanner documents disponibles
2. CONFIGURE - Configurer catégories et métadonnées
3. INGEST    - Extraire texte, chunker, indexer
4. ENRICH    - Tags auto, relations, embeddings
5. GENERATE  - Consultation automatique (intégré Claude)

Usage:
    python knowledge-manager.py init
    python knowledge-manager.py ingest <file> --category <cat>
    python knowledge-manager.py search <query>
    python knowledge-manager.py stats
"""

import sys
import os
import json
import re
import hashlib
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from collections import Counter


# ==============================================
# Configuration
# ==============================================

DEFAULT_CHUNK_SIZE = 800
DEFAULT_CHUNK_OVERLAP = 100

SUPPORTED_FORMATS = {
    '.md': 'markdown',
    '.txt': 'text',
    '.pdf': 'pdf',  # Nécessite PyPDF2 ou pdfplumber
    '.docx': 'docx'  # Nécessite python-docx
}

DEFAULT_CATEGORIES = {
    'coaching': 'Frameworks et méthodologies coaching',
    'business': 'Business plan, stratégie, master plan',
    'technical': 'Architecture et décisions techniques'
}


# ==============================================
# Helpers
# ==============================================

def get_project_root() -> Path:
    """Trouve la racine du projet (où se trouve .claude/)."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".claude").exists():
            return current
        current = current.parent
    return Path.cwd()


def get_knowledge_dir() -> Path:
    """Retourne le chemin vers .claude/knowledge/."""
    return get_project_root() / ".claude" / "knowledge"


def get_config_path() -> Path:
    """Retourne chemin config.json."""
    return get_knowledge_dir() / "config.json"


def get_index_path() -> Path:
    """Retourne chemin index.json."""
    return get_knowledge_dir() / "index.json"


def load_config() -> Dict:
    """Charge configuration."""
    config_path = get_config_path()
    if not config_path.exists():
        return create_default_config()

    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Erreur lecture config: {e}")
        return create_default_config()


def save_config(config: Dict):
    """Sauvegarde configuration."""
    config_path = get_config_path()
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"❌ Erreur sauvegarde config: {e}")


def create_default_config() -> Dict:
    """Crée configuration par défaut."""
    return {
        "version": "1.0",
        "chunk_size": DEFAULT_CHUNK_SIZE,
        "chunk_overlap": DEFAULT_CHUNK_OVERLAP,
        "categories": {
            cat: {"description": desc, "enabled": True, "auto_tags": True}
            for cat, desc in DEFAULT_CATEGORIES.items()
        },
        "auto_enrich": True,
        "embeddings": {
            "enabled": False,
            "provider": "openai",
            "model": "text-embedding-3-small"
        }
    }


def load_index() -> Dict:
    """Charge index."""
    index_path = get_index_path()
    if not index_path.exists():
        return {"documents": [], "chunks": [], "stats": {}}

    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ Erreur lecture index: {e}")
        return {"documents": [], "chunks": [], "stats": {}}


def save_index(index: Dict):
    """Sauvegarde index."""
    index_path = get_index_path()
    try:
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"❌ Erreur sauvegarde index: {e}")


def file_hash(file_path: Path) -> str:
    """Calcule hash MD5 d'un fichier."""
    md5 = hashlib.md5()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5.update(chunk)
        return md5.hexdigest()
    except Exception:
        return ""


# ==============================================
# Phase 1: DISCOVER
# ==============================================

def discover_documents(path: str, recursive: bool = False) -> List[Path]:
    """
    Scanner documents dans un chemin.

    Args:
        path: Chemin dossier ou fichier
        recursive: Recherche récursive

    Returns:
        Liste de fichiers supportés trouvés
    """
    path_obj = Path(path).expanduser().resolve()

    if not path_obj.exists():
        print(f"❌ Chemin introuvable: {path}")
        return []

    files = []

    if path_obj.is_file():
        if path_obj.suffix in SUPPORTED_FORMATS:
            files.append(path_obj)
    elif path_obj.is_dir():
        pattern = "**/*" if recursive else "*"
        for ext in SUPPORTED_FORMATS:
            files.extend(path_obj.glob(f"{pattern}{ext}"))

    return files


def cmd_discover(path: str, recursive: bool = False):
    """Commande discover."""
    print(f"🔍 Découverte documents dans: {path}\n")

    files = discover_documents(path, recursive)

    if not files:
        print("ℹ️ Aucun document trouvé")
        return

    # Grouper par type
    by_type = {}
    for f in files:
        ftype = SUPPORTED_FORMATS.get(f.suffix, 'unknown')
        by_type.setdefault(ftype, []).append(f)

    print(f"📄 {len(files)} documents trouvés\n")

    for ftype, file_list in sorted(by_type.items()):
        print(f"  {ftype}: {len(file_list)} fichiers")
        for f in file_list[:5]:  # Max 5 exemples
            print(f"    - {f.name}")
        if len(file_list) > 5:
            print(f"    ... et {len(file_list) - 5} autres")
        print()

    print(f"💡 Pour ingérer:")
    print(f"   python knowledge-manager.py ingest {path} --category [category]")


# ==============================================
# Phase 2: CONFIGURE
# ==============================================

def cmd_init():
    """Initialise structure Knowledge Library."""
    knowledge_dir = get_knowledge_dir()

    print("🚀 Initialisation Knowledge Library\n")

    # Créer répertoire principal
    knowledge_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Créé: {knowledge_dir}")

    # Créer catégories par défaut
    for category in DEFAULT_CATEGORIES:
        cat_dir = knowledge_dir / category
        cat_dir.mkdir(exist_ok=True)
        print(f"✅ Créé catégorie: {category}/")

    # Créer config
    config = create_default_config()
    save_config(config)
    print(f"✅ Créé: config.json")

    # Créer index vide
    index = {"documents": [], "chunks": [], "stats": {}}
    save_index(index)
    print(f"✅ Créé: index.json")

    print("\n🎉 Knowledge Library initialisée !")
    print(f"\n📁 Structure créée dans: {knowledge_dir}")
    print("\n💡 Prochaines étapes:")
    print("   1. Ajouter documents dans les catégories")
    print("   2. Ingérer: python knowledge-manager.py ingest <file> --category <cat>")
    print("   3. Rechercher: python knowledge-manager.py search <query>")


def cmd_add_category(name: str, description: str):
    """Ajoute une catégorie."""
    knowledge_dir = get_knowledge_dir()
    config = load_config()

    # Créer dossier
    cat_dir = knowledge_dir / name
    cat_dir.mkdir(parents=True, exist_ok=True)

    # Ajouter à config
    config['categories'][name] = {
        "description": description,
        "enabled": True,
        "auto_tags": True
    }
    save_config(config)

    print(f"✅ Catégorie '{name}' créée")
    print(f"📁 {cat_dir}")


# ==============================================
# Phase 3: INGEST
# ==============================================

def extract_text(file_path: Path) -> str:
    """Extrait texte d'un fichier."""
    suffix = file_path.suffix

    if suffix == '.md' or suffix == '.txt':
        try:
            return file_path.read_text(encoding='utf-8')
        except Exception as e:
            print(f"❌ Erreur lecture {file_path}: {e}")
            return ""

    elif suffix == '.pdf':
        try:
            import PyPDF2
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except ImportError:
            print("⚠️ PyPDF2 non installé: pip install PyPDF2")
            return ""
        except Exception as e:
            print(f"❌ Erreur extraction PDF: {e}")
            return ""

    elif suffix == '.docx':
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except ImportError:
            print("⚠️ python-docx non installé: pip install python-docx")
            return ""
        except Exception as e:
            print(f"❌ Erreur extraction DOCX: {e}")
            return ""

    return ""


def extract_frontmatter(text: str) -> Tuple[Dict, str]:
    """Extrait frontmatter YAML d'un document Markdown."""
    frontmatter = {}
    content = text

    # Pattern frontmatter YAML
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, text, re.DOTALL)

    if match:
        yaml_text = match.group(1)
        content = text[match.end():]

        # Parse YAML simple (pas de dépendance PyYAML)
        for line in yaml_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()

                # Parse listes [a, b, c]
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip() for v in value[1:-1].split(',')]

                frontmatter[key] = value

    return frontmatter, content


def chunk_text(text: str, chunk_size: int = DEFAULT_CHUNK_SIZE,
               overlap: int = DEFAULT_CHUNK_OVERLAP) -> List[str]:
    """
    Découpe texte en chunks avec overlap.

    Args:
        text: Texte à découper
        chunk_size: Taille chunk en caractères
        overlap: Overlap entre chunks

    Returns:
        Liste de chunks
    """
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # Essayer de couper à un espace ou newline
        if end < len(text):
            # Chercher dernier espace/newline dans les 100 derniers chars
            search_start = max(end - 100, start)
            last_break = max(
                text.rfind(' ', search_start, end),
                text.rfind('\n', search_start, end)
            )
            if last_break > start:
                end = last_break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


def ingest_document(file_path: Path, category: str,
                    tags: List[str] = None, author: str = None) -> bool:
    """
    Ingère un document dans la Knowledge Library.

    Args:
        file_path: Chemin fichier
        category: Catégorie (ex: "coaching/frameworks")
        tags: Tags additionnels
        author: Auteur

    Returns:
        True si succès
    """
    if not file_path.exists():
        print(f"❌ Fichier introuvable: {file_path}")
        return False

    if file_path.suffix not in SUPPORTED_FORMATS:
        print(f"❌ Format non supporté: {file_path.suffix}")
        return False

    config = load_config()
    index = load_index()

    # Extraire texte
    print(f"📄 Extraction: {file_path.name}")
    text = extract_text(file_path)

    if not text:
        print(f"❌ Aucun texte extrait de {file_path}")
        return False

    # Extraire frontmatter (si Markdown)
    frontmatter, content = extract_frontmatter(text)

    # Métadonnées
    doc_hash = file_hash(file_path)
    doc_id = f"{category}/{file_path.stem}"

    metadata = {
        "id": doc_id,
        "file_path": str(file_path),
        "file_name": file_path.name,
        "category": category,
        "format": SUPPORTED_FORMATS[file_path.suffix],
        "hash": doc_hash,
        "size": len(text),
        "added": datetime.now().isoformat(),
        "last_updated": datetime.now().isoformat(),
        "tags": tags or frontmatter.get('tags', []),
        "author": author or frontmatter.get('author', ''),
        "title": frontmatter.get('title', file_path.stem)
    }

    # Chunker texte
    chunk_size = config['chunk_size']
    overlap = config['chunk_overlap']

    print(f"🔪 Chunking (size={chunk_size}, overlap={overlap})")
    chunks = chunk_text(content, chunk_size, overlap)
    print(f"✅ {len(chunks)} chunks créés")

    # Ajouter au index
    # Vérifier si doc existe déjà
    existing = next((d for d in index['documents'] if d['id'] == doc_id), None)

    if existing:
        print(f"⚠️ Document existe déjà, mise à jour")
        # Supprimer anciens chunks
        index['chunks'] = [c for c in index['chunks'] if c['doc_id'] != doc_id]
        # Mettre à jour metadata
        existing.update(metadata)
    else:
        # Nouveau document
        index['documents'].append(metadata)

    # Ajouter chunks
    for i, chunk in enumerate(chunks):
        chunk_data = {
            "id": f"{doc_id}_chunk_{i}",
            "doc_id": doc_id,
            "index": i,
            "text": chunk,
            "size": len(chunk)
        }
        index['chunks'].append(chunk_data)

    # Mettre à jour stats
    index['stats'] = {
        "total_documents": len(index['documents']),
        "total_chunks": len(index['chunks']),
        "total_size": sum(d['size'] for d in index['documents']),
        "last_updated": datetime.now().isoformat()
    }

    save_index(index)

    print(f"✅ Document ingéré: {doc_id}")
    return True


def cmd_ingest(path: str, category: str, tags: str = None,
               author: str = None, recursive: bool = False):
    """Commande ingest."""
    print(f"📥 Ingestion documents\n")

    # Découvrir fichiers
    files = discover_documents(path, recursive)

    if not files:
        print("❌ Aucun fichier à ingérer")
        return

    print(f"📄 {len(files)} fichiers trouvés\n")

    # Parser tags
    tag_list = [t.strip() for t in tags.split(',')] if tags else []

    # Ingérer chaque fichier
    success = 0
    for file in files:
        if ingest_document(file, category, tag_list, author):
            success += 1
        print()

    print(f"🎉 {success}/{len(files)} documents ingérés avec succès")


# ==============================================
# Phase 4: ENRICH
# ==============================================

def auto_generate_tags(text: str) -> List[str]:
    """Génère tags automatiquement depuis le texte (simple NLP)."""
    # Mots-clés fréquents (excluant stop words)
    stop_words = {'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais',
                  'de', 'du', 'pour', 'dans', 'sur', 'avec', 'est', 'sont'}

    words = re.findall(r'\b\w+\b', text.lower())
    words = [w for w in words if len(w) > 3 and w not in stop_words]

    # Top 5 mots les plus fréquents
    counter = Counter(words)
    return [word for word, count in counter.most_common(5)]


def cmd_enrich():
    """Enrichit tous les documents avec tags auto."""
    print("🎨 Enrichissement documents\n")

    index = load_index()

    for doc in index['documents']:
        # Récupérer texte depuis chunks
        doc_chunks = [c['text'] for c in index['chunks'] if c['doc_id'] == doc['id']]
        full_text = " ".join(doc_chunks)

        # Générer tags auto si pas déjà présents
        if not doc.get('tags'):
            auto_tags = auto_generate_tags(full_text)
            doc['tags'] = auto_tags
            print(f"✅ {doc['id']}: tags = {auto_tags}")

    # Sauvegarder
    save_index(index)
    print("\n🎉 Enrichissement terminé")


# ==============================================
# Recherche & Stats
# ==============================================

def search_knowledge(query: str, category: str = None,
                     limit: int = 5, context: int = 200) -> List[Dict]:
    """
    Recherche dans la Knowledge Library.

    Args:
        query: Requête recherche
        category: Filtrer par catégorie (optionnel)
        limit: Nombre max résultats
        context: Taille contexte autour du match (chars)

    Returns:
        Liste de résultats avec scores
    """
    index = load_index()
    query_lower = query.lower()

    results = []

    for chunk in index['chunks']:
        # Filtrer par catégorie
        if category:
            doc = next((d for d in index['documents'] if d['id'] == chunk['doc_id']), None)
            if not doc or not doc['category'].startswith(category):
                continue

        # Recherche simple (contains)
        if query_lower in chunk['text'].lower():
            # Score basique = nombre d'occurrences
            score = chunk['text'].lower().count(query_lower)

            # Contexte autour du match
            idx = chunk['text'].lower().find(query_lower)
            start = max(0, idx - context)
            end = min(len(chunk['text']), idx + len(query) + context)
            snippet = chunk['text'][start:end]

            if start > 0:
                snippet = "..." + snippet
            if end < len(chunk['text']):
                snippet = snippet + "..."

            doc = next((d for d in index['documents'] if d['id'] == chunk['doc_id']), None)

            results.append({
                "doc_id": chunk['doc_id'],
                "doc_title": doc['title'] if doc else chunk['doc_id'],
                "category": doc['category'] if doc else "",
                "chunk_id": chunk['id'],
                "score": score,
                "snippet": snippet
            })

    # Trier par score
    results.sort(key=lambda x: x['score'], reverse=True)

    return results[:limit]


def cmd_search(query: str, category: str = None, limit: int = 5):
    """Commande search."""
    print(f"🔍 Recherche: '{query}'\n")

    if category:
        print(f"📁 Catégorie: {category}\n")

    results = search_knowledge(query, category, limit)

    if not results:
        print("ℹ️ Aucun résultat trouvé")
        return

    print(f"📄 {len(results)} résultats trouvés\n")

    for i, result in enumerate(results, 1):
        print(f"{i}. {result['doc_title']}")
        print(f"   📁 {result['category']}")
        print(f"   📊 Score: {result['score']}")
        print(f"   📝 {result['snippet']}")
        print()


def cmd_stats():
    """Affiche statistiques Knowledge Library."""
    index = load_index()
    config = load_config()

    stats = index.get('stats', {})

    print("📊 Knowledge Library Statistics\n")
    print(f"Documents: {stats.get('total_documents', 0)}")
    print(f"Chunks: {stats.get('total_chunks', 0)}")
    print(f"Total Size: {stats.get('total_size', 0):,} chars")
    print(f"Last Updated: {stats.get('last_updated', 'Never')}\n")

    # Stats par catégorie
    by_category = {}
    for doc in index['documents']:
        cat = doc['category']
        by_category[cat] = by_category.get(cat, 0) + 1

    if by_category:
        print("📁 By Category:")
        for cat, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {count} docs")
        print()

    # Top tags
    all_tags = []
    for doc in index['documents']:
        all_tags.extend(doc.get('tags', []))

    if all_tags:
        print("🏷️ Top Tags:")
        counter = Counter(all_tags)
        for tag, count in counter.most_common(10):
            print(f"   {tag}: {count}")
        print()

    # Config
    print("⚙️ Configuration:")
    print(f"   Chunk Size: {config['chunk_size']}")
    print(f"   Overlap: {config['chunk_overlap']}")
    print(f"   Auto Enrich: {config['auto_enrich']}")
    print(f"   Embeddings: {config['embeddings']['enabled']}")


# ==============================================
# Main
# ==============================================

def show_help():
    print("""
Knowledge Library Manager

Usage:
  python knowledge-manager.py <command> [options]

Commands:
  init                                  Initialize Knowledge Library
  discover <path> [--recursive]         Discover documents
  ingest <path> --category <cat>        Ingest documents
         [--tags <tags>]                Tags (comma-separated)
         [--author <author>]            Author
         [--recursive]                  Recursive
  search <query> [--category <cat>]     Search knowledge
         [--limit N]                    Max results (default 5)
  stats                                 Show statistics
  enrich                                Auto-generate tags

Examples:
  python knowledge-manager.py init
  python knowledge-manager.py discover ~/Documents/Coaching
  python knowledge-manager.py ingest doc.md --category coaching/frameworks
  python knowledge-manager.py ingest ~/Docs/*.md --category business --tags "voschinkoff,plan"
  python knowledge-manager.py search "design humain" --category coaching
  python knowledge-manager.py stats
""")


def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)

    command = sys.argv[1]

    if command == "help" or command == "-h" or command == "--help":
        show_help()

    elif command == "init":
        cmd_init()

    elif command == "discover":
        if len(sys.argv) < 3:
            print("❌ Usage: python knowledge-manager.py discover <path> [--recursive]")
            sys.exit(1)
        path = sys.argv[2]
        recursive = "--recursive" in sys.argv
        cmd_discover(path, recursive)

    elif command == "ingest":
        if len(sys.argv) < 3:
            print("❌ Usage: python knowledge-manager.py ingest <path> --category <category>")
            sys.exit(1)

        path = sys.argv[2]

        # Parse arguments
        args = sys.argv[3:]
        category = None
        tags = None
        author = None
        recursive = False

        i = 0
        while i < len(args):
            if args[i] == "--category" and i + 1 < len(args):
                category = args[i + 1]
                i += 2
            elif args[i] == "--tags" and i + 1 < len(args):
                tags = args[i + 1]
                i += 2
            elif args[i] == "--author" and i + 1 < len(args):
                author = args[i + 1]
                i += 2
            elif args[i] == "--recursive":
                recursive = True
                i += 1
            else:
                i += 1

        if not category:
            print("❌ --category requis")
            sys.exit(1)

        cmd_ingest(path, category, tags, author, recursive)

    elif command == "search":
        if len(sys.argv) < 3:
            print("❌ Usage: python knowledge-manager.py search <query> [--category <cat>]")
            sys.exit(1)

        query = sys.argv[2]
        category = None
        limit = 5

        # Parse arguments
        args = sys.argv[3:]
        i = 0
        while i < len(args):
            if args[i] == "--category" and i + 1 < len(args):
                category = args[i + 1]
                i += 2
            elif args[i] == "--limit" and i + 1 < len(args):
                limit = int(args[i + 1])
                i += 2
            else:
                i += 1

        cmd_search(query, category, limit)

    elif command == "stats":
        cmd_stats()

    elif command == "enrich":
        cmd_enrich()

    else:
        print(f"❌ Commande inconnue: {command}")
        print("Utilise 'help' pour voir les commandes disponibles")
        sys.exit(1)


if __name__ == "__main__":
    main()
