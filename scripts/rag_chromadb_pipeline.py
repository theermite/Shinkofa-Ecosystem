#!/usr/bin/env python3
"""
Pipeline RAG ChromaDB - KnowledgeBase Coaching Shinkofa
========================================================

Script d'ingestion et retrieval pour Koshin AI System.

Auteur: TAKUMI Agent
Date: 2026-01-30
Projet: Shinkofa Ecosystem - Koshin AI
Infrastructure: ChromaDB + sentence-transformers + FastAPI

Usage:
    python rag_chromadb_pipeline.py --ingest  # Ingérer KnowledgeBase
    python rag_chromadb_pipeline.py --query "Comment gérer TDAH gaming?"  # Test retrieval
"""

import os
import glob
import yaml
import argparse
from typing import List, Dict, Tuple
from pathlib import Path

# ChromaDB
import chromadb
from chromadb.config import Settings

# Embeddings
from sentence_transformers import SentenceTransformer

# Text processing
from langchain.text_splitter import RecursiveCharacterTextSplitter

# ============================================================================
# CONFIGURATION
# ============================================================================

# Chemins
KNOWLEDGEBASE_PATH = "D:/30-Dev-Projects/KnowledgeBase-CoachingShinkofa"
CHROMADB_PATH = "./koshin_chromadb"

# Modèle embeddings (multilingual, local)
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"

# Mapping catégories → collections ChromaDB
COLLECTION_MAPPING = {
    "01-Philosophies-Fondatrices": "philosophie_shinkofa",
    "02-Design-Humain-Astrologie": "design_humain_architecture",
    "03-Coaching-Tridimensionnel": "coaching_transformation",
    "04-Tests-Personnalite": "tests_personnalite_frameworks",
    "05-Neurodiversite-Neuroatypie": "neurodiversite_neuroatypie",
    "06-Pedagogie-Apprentissage": "apprentissage_pedagogie",
    "07-E-Sport-Gaming-Holistique": "gaming_esport_holistique",
    "08-Outils-Methodologies": "outils_methodologies",
    "09-Correlations-Transversales": "correlations_transversales",
    "10-Ressources-Bibliographie": "ressources_references"
}

# Chunking strategy (par type document)
CHUNK_STRATEGIES = {
    "narratif": {"size": 3000, "overlap": 600},  # Philosophies, résumés livres
    "technique": {"size": 600, "overlap": 100},  # Exercices, stratégies
    "reference": {"size": 300, "overlap": 50},   # Listes, tableaux
    "integratif": {"size": 1500, "overlap": 400} # Corrélations, profil Jay
}

# ============================================================================
# CLASSES
# ============================================================================

class ChromaDBManager:
    """Gestionnaire ChromaDB pour Koshin AI."""

    def __init__(self, persist_directory: str = CHROMADB_PATH):
        """Initialiser ChromaDB client."""
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=persist_directory,
            anonymized_telemetry=False
        ))
        print(f"✅ ChromaDB initialisé: {persist_directory}")

    def create_collections(self):
        """Créer les 10 collections thématiques."""
        for category, collection_name in COLLECTION_MAPPING.items():
            try:
                collection = self.client.create_collection(
                    name=collection_name,
                    metadata={
                        "description": f"Collection {category}",
                        "hnsw_space": "cosine",
                        "embedding_model": EMBEDDING_MODEL
                    }
                )
                print(f"✅ Collection créée: {collection_name}")
            except Exception as e:
                print(f"⚠️  Collection {collection_name} existe déjà ou erreur: {e}")

    def get_collection(self, collection_name: str):
        """Récupérer une collection."""
        return self.client.get_collection(collection_name)

    def delete_all_collections(self):
        """Supprimer toutes les collections (reset)."""
        for collection_name in COLLECTION_MAPPING.values():
            try:
                self.client.delete_collection(collection_name)
                print(f"🗑️  Collection supprimée: {collection_name}")
            except Exception as e:
                print(f"⚠️  Erreur suppression {collection_name}: {e}")


class KnowledgeBaseIngester:
    """Ingestion KnowledgeBase → ChromaDB."""

    def __init__(self, chroma_manager: ChromaDBManager, kb_path: str = KNOWLEDGEBASE_PATH):
        self.chroma = chroma_manager
        self.kb_path = kb_path
        self.model = SentenceTransformer(EMBEDDING_MODEL)
        print(f"✅ Modèle embeddings chargé: {EMBEDDING_MODEL}")

    def extract_frontmatter(self, content: str) -> Tuple[Dict, str]:
        """Extraire YAML frontmatter d'un fichier markdown."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                try:
                    metadata = yaml.safe_load(parts[1])
                    body = parts[2].strip()
                    return metadata or {}, body
                except yaml.YAMLError:
                    pass
        return {}, content

    def chunk_markdown(self, file_path: str, strategy: str = "technique") -> List[Dict]:
        """Chunker fichier markdown avec métadonnées enrichies."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extraire frontmatter
        metadata, body = self.extract_frontmatter(content)

        # Déterminer stratégie chunking
        chunk_config = CHUNK_STRATEGIES.get(strategy, CHUNK_STRATEGIES["technique"])

        # Splitter texte
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_config["size"],
            chunk_overlap=chunk_config["overlap"],
            separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""],
            length_function=lambda x: len(x.split())  # Token count approximatif
        )
        chunks = splitter.split_text(body)

        # Enrichir métadonnées chaque chunk
        enriched_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **metadata,
                "chunk_id": i,
                "total_chunks": len(chunks),
                "source_file": file_path,
                "token_count": len(chunk.split()),
                "category": metadata.get("category", "unknown"),
                "subcategory": metadata.get("subcategory", ""),
                "relevance_jay": metadata.get("relevance_jay", "MEDIUM"),
                "priority_retrieval": metadata.get("priority_retrieval", "MOYENNE"),
                "keywords": metadata.get("concepts_clés", [])
            }
            enriched_chunks.append({
                "text": chunk,
                "metadata": chunk_metadata
            })

        return enriched_chunks

    def ingest_category(self, category: str, collection_name: str):
        """Ingérer une catégorie complète dans ChromaDB."""
        category_path = os.path.join(self.kb_path, category)
        if not os.path.exists(category_path):
            print(f"⚠️  Catégorie introuvable: {category_path}")
            return

        collection = self.chroma.get_collection(collection_name)
        total_chunks = 0

        # Parcourir tous les .md
        md_files = glob.glob(f"{category_path}/**/*.md", recursive=True)
        print(f"\n📂 Ingestion {category} → {collection_name}")
        print(f"   Fichiers trouvés: {len(md_files)}")

        for md_file in md_files:
            try:
                # Chunker
                chunks = self.chunk_markdown(md_file, strategy="technique")

                if not chunks:
                    continue

                # Générer embeddings
                texts = [c["text"] for c in chunks]
                embeddings = self.model.encode(texts, show_progress_bar=False)

                # IDs uniques
                file_basename = os.path.basename(md_file).replace(".md", "")
                ids = [f"{file_basename}_{i}" for i in range(len(chunks))]

                # Ajouter à ChromaDB
                collection.add(
                    embeddings=embeddings.tolist(),
                    documents=texts,
                    metadatas=[c["metadata"] for c in chunks],
                    ids=ids
                )

                total_chunks += len(chunks)
                print(f"   ✅ {os.path.basename(md_file)}: {len(chunks)} chunks")

            except Exception as e:
                print(f"   ❌ Erreur {os.path.basename(md_file)}: {e}")

        print(f"   📊 Total chunks ingérés: {total_chunks}\n")

    def ingest_all(self):
        """Ingérer toute la KnowledgeBase."""
        print("\n" + "=" * 60)
        print("🚀 INGESTION COMPLÈTE KNOWLEDGEBASE")
        print("=" * 60)

        for category, collection_name in COLLECTION_MAPPING.items():
            self.ingest_category(category, collection_name)

        print("=" * 60)
        print("✅ INGESTION TERMINÉE")
        print("=" * 60 + "\n")


class RAGRetriever:
    """Retrieval RAG avec ChromaDB."""

    def __init__(self, chroma_manager: ChromaDBManager):
        self.chroma = chroma_manager
        self.model = SentenceTransformer(EMBEDDING_MODEL)

    def query(
        self,
        query_text: str,
        collections: List[str] = None,
        top_k: int = 10,
        filter_jay_relevant: bool = True
    ) -> List[Dict]:
        """
        Requête RAG sémantique.

        Args:
            query_text: Question utilisateur
            collections: Liste collections à interroger (None = toutes)
            top_k: Nombre de chunks à retourner
            filter_jay_relevant: Filtrer chunks HIGH/CRITIQUE pour Jay

        Returns:
            Liste chunks avec métadonnées + scores
        """
        if collections is None:
            collections = list(COLLECTION_MAPPING.values())

        # Générer embedding requête
        query_embedding = self.model.encode([query_text])[0]

        # Interroger chaque collection
        all_results = []
        for collection_name in collections:
            try:
                collection = self.chroma.get_collection(collection_name)

                # Filter Jay-relevant si activé
                where_filter = None
                if filter_jay_relevant:
                    where_filter = {"relevance_jay": {"$in": ["HIGH", "CRITIQUE"]}}

                results = collection.query(
                    query_embeddings=[query_embedding.tolist()],
                    n_results=top_k,
                    where=where_filter
                )

                # Parser résultats
                if results["ids"] and results["ids"][0]:
                    for i in range(len(results["ids"][0])):
                        all_results.append({
                            "collection": collection_name,
                            "id": results["ids"][0][i],
                            "document": results["documents"][0][i],
                            "metadata": results["metadatas"][0][i],
                            "distance": results["distances"][0][i],
                            "similarity": 1 - results["distances"][0][i]  # Cosine similarity
                        })

            except Exception as e:
                print(f"⚠️  Erreur collection {collection_name}: {e}")

        # Trier par similarité décroissante
        all_results.sort(key=lambda x: x["similarity"], reverse=True)

        return all_results[:top_k]

    def pretty_print_results(self, results: List[Dict]):
        """Afficher résultats retrieval formatés."""
        print("\n" + "=" * 80)
        print(f"🔍 RÉSULTATS RETRIEVAL ({len(results)} chunks)")
        print("=" * 80 + "\n")

        for i, result in enumerate(results, 1):
            print(f"📄 Chunk {i}/{len(results)}")
            print(f"   Collection: {result['collection']}")
            print(f"   Source: {result['metadata'].get('source_file', 'N/A')}")
            print(f"   Similarité: {result['similarity']:.3f}")
            print(f"   Relevance Jay: {result['metadata'].get('relevance_jay', 'N/A')}")
            print(f"   Tokens: {result['metadata'].get('token_count', 'N/A')}")
            print(f"\n   Extrait:")
            print(f"   {result['document'][:300]}...")
            print("\n" + "-" * 80 + "\n")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Pipeline RAG ChromaDB Koshin AI")
    parser.add_argument("--reset", action="store_true", help="Supprimer toutes les collections (reset)")
    parser.add_argument("--create", action="store_true", help="Créer collections vides")
    parser.add_argument("--ingest", action="store_true", help="Ingérer KnowledgeBase complète")
    parser.add_argument("--query", type=str, help="Requête RAG test")
    parser.add_argument("--top-k", type=int, default=10, help="Nombre chunks à retourner (défaut: 10)")
    parser.add_argument("--collections", nargs="+", help="Collections à interroger (défaut: toutes)")

    args = parser.parse_args()

    # Initialiser ChromaDB
    chroma = ChromaDBManager()

    # Reset
    if args.reset:
        confirm = input("⚠️  Supprimer TOUTES les collections ? (yes/no): ")
        if confirm.lower() == "yes":
            chroma.delete_all_collections()
            print("✅ Reset terminé")
        else:
            print("❌ Reset annulé")
        return

    # Créer collections
    if args.create:
        chroma.create_collections()
        return

    # Ingestion
    if args.ingest:
        ingester = KnowledgeBaseIngester(chroma)
        ingester.ingest_all()
        return

    # Query
    if args.query:
        retriever = RAGRetriever(chroma)
        results = retriever.query(
            query_text=args.query,
            collections=args.collections,
            top_k=args.top_k
        )
        retriever.pretty_print_results(results)
        return

    # Si aucun argument, afficher aide
    parser.print_help()


if __name__ == "__main__":
    main()


# ============================================================================
# EXEMPLES USAGE
# ============================================================================
"""
# 1. Créer collections vides
python rag_chromadb_pipeline.py --create

# 2. Ingérer KnowledgeBase complète
python rag_chromadb_pipeline.py --ingest

# 3. Test retrieval (toutes collections)
python rag_chromadb_pipeline.py --query "Comment gérer l'hyperfocus TDAH en gaming compétitif ?"

# 4. Test retrieval (collections spécifiques)
python rag_chromadb_pipeline.py --query "Projecteur 1/3 stratégies" --collections design_humain_architecture correlations_transversales

# 5. Retrieval avec top-k custom
python rag_chromadb_pipeline.py --query "Techniques coaching somatique trauma" --top-k 5

# 6. Reset complet (supprimer tout)
python rag_chromadb_pipeline.py --reset
"""
