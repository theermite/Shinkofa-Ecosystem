# Lessons Learned - IA & LLM

> Leçons apprises liées à l'IA, LLM, Ollama, RAG, embeddings.

---

## 📊 Statistiques

**Leçons documentées** : 1
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [IA] [OLLAMA] Modèle pas chargé, timeout
**Date** : 2026-01-12 | **Projet** : Shizen-Koshin-MVP | **Sévérité** : 🟡

**Contexte** :
Premier appel au modèle très lent (timeout).

**Erreur** :
Ollama charge le modèle en mémoire au premier appel.

**Solution** :
```python
# Warmup au démarrage de l'app
async def warmup_model():
    try:
        await llm.ainvoke("test")  # Premier appel charge le modèle
    except:
        pass  # Ignorer erreur warmup

# Au startup
asyncio.create_task(warmup_model())
```

**Prévention** :
1. Warmup au démarrage de l'application
2. Timeout généreux pour premier appel (60s+)
3. Vérifier que Ollama tourne : `curl http://localhost:11434/api/tags`

**Fichiers/Commandes Clés** :
- `curl http://localhost:11434/api/tags` - Vérifier Ollama
- `ollama list` - Lister modèles installés
- `ollama pull llama2` - Télécharger modèle

---

## 💡 Patterns Communs

### Pattern 1 : Warmup Ollama
```python
import asyncio
from langchain.llms import Ollama

async def warmup_ollama(model_name: str = "llama2"):
    """Warmup Ollama model au démarrage"""
    try:
        llm = Ollama(model=model_name)
        _ = await llm.ainvoke("test", timeout=60)
        print(f"✅ Ollama {model_name} warmed up")
    except Exception as e:
        print(f"⚠️ Warmup failed: {e}")

# Au démarrage
asyncio.create_task(warmup_ollama())
```

### Pattern 2 : RAG avec Retry
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def query_rag(question: str):
    """Query RAG avec retry automatique"""
    docs = retriever.get_relevant_documents(question)
    context = "\n".join([doc.page_content for doc in docs])

    response = await llm.ainvoke(
        f"Context: {context}\n\nQuestion: {question}"
    )
    return response
```

### Pattern 3 : Chunking Documents
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_document(text: str, chunk_size: int = 1000, overlap: int = 200):
    """Chunk document pour RAG"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = splitter.split_text(text)
    return chunks
```

---

## 🤖 Checklist LLM Integration

- [ ] Warmup model au démarrage
- [ ] Timeout généreux (60s+)
- [ ] Retry logic pour robustesse
- [ ] Streaming pour UX (si applicable)
- [ ] Rate limiting (éviter surcharge)
- [ ] Logging prompts + responses
- [ ] Error handling graceful
- [ ] Fallback si LLM down
- [ ] Monitoring performance (latence)
- [ ] Cost tracking (si API externe)

---

## 📊 Performance Ollama

| Modèle | Taille | RAM Requis | Vitesse | Use Case |
|--------|--------|------------|---------|----------|
| llama2:7b | 3.8GB | 8GB | Rapide | Chat, QA |
| llama2:13b | 7.3GB | 16GB | Moyen | Qualité > Vitesse |
| mistral:7b | 4.1GB | 8GB | Rapide | Code, reasoning |
| codellama:7b | 3.8GB | 8GB | Rapide | Code generation |

---

## 🔗 Voir Aussi

- Infrastructure: [LOCAL-AI-INFRA.md](../LOCAL-AI-INFRA.md)
- Projects: [Shizen-Koshin-MVP](../../../Shizen-Koshin-MVP/)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
