# Infrastructure Locale

> Configuration des machines de développement.

---

## Ermite-Game (Windows 11 - Dev Principal)

### Hardware

| Spec | Valeur |
|------|--------|
| **Carte mère** | Gigabyte B450M DS3H V2 |
| **CPU** | AMD Ryzen (Family 25) @ 3.5 GHz |
| **RAM** | 49 GB (28 GB disponible) |
| **GPU** | NVIDIA GeForce RTX 3060 (12 GB VRAM) |
| **OS** | Windows 11 Pro (Build 26200) |

### Réseau
- **Ethernet** : 192.168.7.108
- **Tailscale** : 100.109.16.38

### Docker Containers Actifs

| Container | Image | Port |
|-----------|-------|------|
| shinkofa_postgres_dev | postgres:16-alpine | 5432 |
| shinkofa_redis_dev | redis:7-alpine | 6379 |
| shinkofa-postgres-dev | postgres:16-alpine | interne |
| shinkofa-redis-dev | redis:7-alpine | interne |
| family_hub_mysql | mysql:8.0 | 3307 |

### Ports Exposés

| Port | Service |
|------|---------|
| 5432 | PostgreSQL |
| 6379 | Redis |
| 3307 | MySQL |
| 11434 | Ollama API |
| 5000 | API locale |
| 7070 | Service divers |
| 3389 | Remote Desktop |

### Ollama - Modèles IA

| Modèle | Taille | Usage |
|--------|--------|-------|
| qwen2.5-coder:14b | 9 GB | Code (principal) |
| qwen2.5:14b-instruct-q4_K_M | 9 GB | Général |
| qwen2.5-coder:7b-instruct-q4_K_M | 4.7 GB | Code (léger) |
| qwen2.5:7b | 4.7 GB | Général (léger) |

**Note** : RTX 3060 12GB permet modèles jusqu'à 14B quantizés

---

## Dell-Ermite (Kubuntu 24.04 - IA Locale)

### Hardware

| Spec | Valeur |
|------|--------|
| **CPU** | Intel i5-6300U |
| **RAM** | 32 GB DDR4 |
| **GPU** | Intel HD 520 (intégré) |
| **Stockage** | 500 GB SSD |
| **OS** | Kubuntu 24.04 LTS |

### Limitations
- Pas de GPU dédié → Modèles ≤7B uniquement
- Inférence CPU seulement
- Idéal pour : Shizen-Koshin, tests locaux, mobilité

### Ollama Recommandé

| Modèle | Taille | Performance |
|--------|--------|-------------|
| qwen2.5:7b | ~4.5GB | ★★★★☆ |
| codellama:7b | ~4GB | ★★★★☆ |
| nomic-embed-text | ~300MB | ★★★★★ |

---

## Projets Locaux (D:\30-Dev-Projects)

### Actifs (récents)

| Projet | Stack | Status |
|--------|-------|--------|
| shinkofa-platform | TypeScript | En cours |
| Hibiki-Dictate | Python | En cours |
| SLF-Esport | TypeScript | En cours |
| toolbox-theermite | TypeScript | En cours |
| Ermite-Podcaster | JavaScript | En cours → Content Creation Studio |

### En pause

| Projet | Notes |
|--------|-------|
| WinAdminTE | Python - Mis en pause |
| Family-Planner-Simple | → Future Family Hub Shinkofa |
| LesPetitsLiens | En attente |
| Shizen-Koshin-MVP | À reprendre et modifier |

### Archives

| Projet | Action |
|--------|--------|
| Shizen | Obsolète |
| planner-shinkofa | Archive |
| Website-Shinkofa | Obsolète - Archive |
| TodoJayWeb | Archive - Obsolète |
| KoshinIA-Dell | Arrêté - Archive |
| Instructions-Chatbot-Koshin | Archive |
| File-Organizer | Archive |

---

## Configuration LangChain (Dell-Ermite)

```python
from langchain_ollama import OllamaLLM, OllamaEmbeddings

# LLM principal
llm = OllamaLLM(
    model="qwen2.5:7b",
    base_url="http://localhost:11434",
    temperature=0.7
)

# Embeddings pour RAG
embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434"
)
```

---

## Variables d'Environnement Communes

```bash
# .env local dev
DATABASE_URL=postgresql://user:password@localhost:5432/db
REDIS_URL=redis://localhost:6379
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

---

**Dernière mise à jour** : 2026-01-19
