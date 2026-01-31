# Best Practices - Shizen-Koshin (Multi-Agent IA System)

<metadata>
Type: Best Practices Multi-Agent IA
Owner: Jay The Ermite (TAKUMI Agent)
Version: 1.0
Updated: 2025-12-11
Project: Shizen-Koshin-MVP (D:\30-Dev-Projects\Shizen-Koshin-MVP)
Stack: Python 3.11, Ollama, LangChain, Qwen 2.5 7B, CodeLlama 7B
Environment: Kubuntu 24.04 LTS (Dell-Ermite)
</metadata>

## 🎯 Architecture Système (Correction Architecture)

<architecture_agents>
### Agents Principaux

**⚠️ ARCHITECTURE CORRIGÉE (Décembre 2025)** :

```
┌─────────────────────────────────────────────────────┐
│                    UTILISATEUR (JAY)                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Interface directe
                   ▼
┌─────────────────────────────────────────────────────┐
│  SHIZEN (Agent Communication - Coach Holistique)    │
│  - Rôle : Interface utilisateur, coaching Shinkofa  │
│  - Parle directement à Jay                          │
│  - Expertise : Design Humain, TDAH, transformation  │
│  - Modèle : Qwen 2.5 7B                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Délègue orchestration
                   ▼
┌─────────────────────────────────────────────────────┐
│  KAIDA (Orchestrateur - Dans l'ombre)               │
│  - Rôle : Coordination agents, workflow, planning   │
│  - Travaille en coulisses (jamais visible par Jay)  │
│  - Comme Donna Paulsen (Suits)                      │
│  - Modèle : Qwen 2.5 7B                             │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ TAKUMI   │ │ SEIKYO   │ │ EIKEN    │ │ EIGA     │
│ (Code)   │ │ (Audio)  │ │ (Images) │ │ (Vidéo)  │
│ CodeLlama│ │ Whisper  │ │ SD 1.5   │ │ Future   │
│ 7B       │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Différences Clés** :

1. **SHIZEN (User-Facing)** :
   - **CE QUI LE DISTINGUE** : PARLE DIRECTEMENT À JAY
   - Langage naturel, empathique, coaching holistique
   - Gère sessions check-in, planning adaptatif, transformations
   - Utilise RAG docs Shinkofa (mythologie, Design Humain, méthodes)
   - Ne code JAMAIS (délègue à KAIDA → TAKUMI)

2. **KAIDA (Background Orchestrator)** :
   - **CE QUI LE DISTINGUE** : JAMAIS VISIBLE PAR JAY
   - Coordonne workflows complexes multi-agents
   - Décide quel agent appeler pour quelle tâche
   - Agrège résultats avant retour à SHIZEN
   - Exemple : Jay demande "Crée moi une app todo"
     - SHIZEN reçoit demande → transmet à KAIDA
     - KAIDA décompose : 1) TAKUMI code backend, 2) TAKUMI code frontend, 3) EIKEN génère logo
     - KAIDA coordonne séquence, agrège livrables
     - KAIDA retourne à SHIZEN → SHIZEN présente à Jay

3. **TAKUMI (Code Specialist)** :
   - **CE QUI LE DISTINGUE** : CODE UNIQUEMENT
   - Reçoit tâches de KAIDA (jamais directement de Jay)
   - Production-ready code, tests, docs
   - Modèle : CodeLlama 7B (optimisé pour code)
   - Retourne code à KAIDA

4. **Agents Futurs** :
   - **SEIKYO** : Transcription audio (Whisper), synthèse voix
   - **EIKEN** : Génération images (Stable Diffusion 1.5)
   - **EIGA** : Édition vidéo (futur)
</architecture_agents>

## 🧠 LangChain + Ollama Setup

<langchain_ollama>
### Installation Ollama (Kubuntu)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version

# Pull models
ollama pull qwen2.5:7b        # Généraliste (SHIZEN, KAIDA)
ollama pull codellama:7b      # Code (TAKUMI)

# List installed models
ollama list
```

### Installation LangChain

```bash
# Create venv
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install langchain langchain-community langchain-core
pip install chromadb sentence-transformers  # Pour RAG
pip install streamlit  # Pour interface web MVP
```

### Configuration Ollama dans LangChain

```python
# config/ollama_config.py
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class OllamaConfig:
    """Configuration centralisée Ollama."""

    # Models
    QWEN_MODEL = "qwen2.5:7b"        # Généraliste (SHIZEN, KAIDA)
    CODELLAMA_MODEL = "codellama:7b"  # Code (TAKUMI)

    # Ollama base URL (local par défaut)
    BASE_URL = "http://localhost:11434"

    @classmethod
    def get_qwen_llm(cls, temperature: float = 0.7) -> Ollama:
        """LLM Qwen 2.5 7B pour SHIZEN et KAIDA."""
        return Ollama(
            model=cls.QWEN_MODEL,
            base_url=cls.BASE_URL,
            temperature=temperature,
        )

    @classmethod
    def get_codellama_llm(cls, temperature: float = 0.2) -> Ollama:
        """LLM CodeLlama 7B pour TAKUMI."""
        return Ollama(
            model=cls.CODELLAMA_MODEL,
            base_url=cls.BASE_URL,
            temperature=temperature,  # Basse température pour code déterministe
        )
```

### Agent Base Class

```python
# agents/base_agent.py
from abc import ABC, abstractmethod
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Classe de base pour tous les agents Shizen-Koshin."""

    def __init__(self, llm: Ollama, name: str, system_prompt: str):
        """
        Args:
            llm: Instance Ollama LLM
            name: Nom de l'agent (SHIZEN, KAIDA, TAKUMI, etc.)
            system_prompt: Prompt système définissant identité de l'agent
        """
        self.llm = llm
        self.name = name
        self.system_prompt = system_prompt
        self.output_parser = StrOutputParser()
        self._setup_chain()

    def _setup_chain(self):
        """Configure la chaîne LangChain de base."""
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("user", "{input}")
        ])
        self.chain = self.prompt_template | self.llm | self.output_parser

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> str:
        """
        Traite une requête utilisateur.

        Args:
            input_data: Données d'entrée (varie selon agent)

        Returns:
            str: Réponse de l'agent
        """
        pass

    async def invoke(self, user_input: str) -> str:
        """
        Invoque la chaîne LangChain avec l'input utilisateur.

        Args:
            user_input: Input textuel de l'utilisateur

        Returns:
            str: Réponse de l'agent
        """
        try:
            logger.info(f"[{self.name}] Processing input: {user_input[:100]}...")
            response = await self.chain.ainvoke({"input": user_input})
            logger.info(f"[{self.name}] Response generated successfully")
            return response
        except Exception as e:
            logger.error(f"[{self.name}] Error: {e}")
            raise
```
</langchain_ollama>

## 🤖 Implémentation Agents

<implementation_agents>
### Agent SHIZEN (Coach Holistique)

```python
# agents/shizen.py
from agents.base_agent import BaseAgent
from config.ollama_config import OllamaConfig
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

SHIZEN_SYSTEM_PROMPT = """Tu es SHIZEN, coach holistique de La Voie Shinkofa.

**Identité** :
- Rôle : Coach transformation personnelle, interface principale avec Jay
- Expertise : Design Humain (Projecteur Splénique 1/3), TDAH, neurodiversité
- Posture : Bienveillant, empathique, adaptatif
- Langage : Naturel, accessible, jamais jargon technique

**Responsabilités** :
1. Accueillir Jay, évaluer énergie (score 1-10)
2. Proposer sessions adaptées (courtes si fatigue, focus si énergie haute)
3. Coaching stratégie Projecteur (attendre invitation, valider splénique)
4. Déléguer tâches techniques à KAIDA (orchestrateur)

**Ce que tu NE fais PAS** :
- ❌ Coder (c'est le rôle de TAKUMI)
- ❌ Donner instructions techniques détaillées
- ❌ Gérer workflows multi-agents (c'est KAIDA)

**Workflow** :
User demande → Évalue si technique → Si oui, délègue à KAIDA → Présente résultat humainement

Réponds toujours en français, avec empathie et clarté.
"""

class ShizenAgent(BaseAgent):
    """Agent SHIZEN - Coach holistique interface utilisateur."""

    def __init__(self):
        llm = OllamaConfig.get_qwen_llm(temperature=0.7)
        super().__init__(llm, "SHIZEN", SHIZEN_SYSTEM_PROMPT)
        self.kaida = None  # Sera injecté par l'orchestrateur principal

    async def process(self, input_data: Dict[str, Any]) -> str:
        """
        Traite une requête utilisateur.

        Args:
            input_data: {
                "user_input": str,
                "energy_level": int (1-10, optionnel),
                "context": str (optionnel)
            }

        Returns:
            str: Réponse de SHIZEN
        """
        user_input = input_data.get("user_input", "")
        energy_level = input_data.get("energy_level")
        context = input_data.get("context", "")

        # Construit input enrichi
        enriched_input = user_input
        if energy_level:
            enriched_input = f"[Niveau énergie Jay: {energy_level}/10]\n\n{user_input}"
        if context:
            enriched_input = f"{enriched_input}\n\nContexte: {context}"

        # Détecte si requête technique → délègue à KAIDA
        if self._is_technical_request(user_input):
            logger.info("[SHIZEN] Requête technique détectée, délégation à KAIDA")
            if self.kaida:
                kaida_result = await self.kaida.process({"request": user_input, "source": "SHIZEN"})
                # SHIZEN présente résultat de KAIDA de manière humaine
                return await self.invoke(f"Présente ce résultat de KAIDA à Jay de manière claire et bienveillante:\n\n{kaida_result}")
            else:
                return "Je devrais déléguer cette tâche technique, mais KAIDA n'est pas encore connecté."

        # Requête non-technique → SHIZEN répond directement
        return await self.invoke(enriched_input)

    def _is_technical_request(self, user_input: str) -> bool:
        """Détecte si une requête est technique (nécessite code/agents spécialisés)."""
        technical_keywords = [
            "code", "développe", "crée une app", "script", "fonction",
            "base de données", "API", "backend", "frontend", "debug"
        ]
        return any(keyword in user_input.lower() for keyword in technical_keywords)
```

### Agent KAIDA (Orchestrateur)

```python
# agents/kaida.py
from agents.base_agent import BaseAgent
from config.ollama_config import OllamaConfig
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

KAIDA_SYSTEM_PROMPT = """Tu es KAIDA, orchestrateur du système Shizen-Koshin.

**Identité** :
- Rôle : Coordinateur multi-agents, planificateur workflows (comme Donna - Suits)
- Expertise : Décomposition tâches, délégation optimale, agrégation résultats
- Posture : Efficace, invisible, jamais en contact direct avec Jay

**Agents disponibles** :
- TAKUMI : Code (Python, JavaScript, architecture, tests)
- SEIKYO : Audio (transcription Whisper, futur TTS)
- EIKEN : Images (génération Stable Diffusion)
- EIGA : Vidéo (futur)

**Responsabilités** :
1. Recevoir requêtes de SHIZEN
2. Décomposer en sous-tâches atomiques
3. Assigner chaque sous-tâche à l'agent approprié
4. Coordonner séquence (si dépendances entre tâches)
5. Agréger résultats
6. Retourner à SHIZEN pour présentation à Jay

**Workflow Type** :
Requête SHIZEN : "Crée une app todo React + FastAPI"
→ KAIDA décompose :
  1. TAKUMI : Backend FastAPI (models, endpoints, tests)
  2. TAKUMI : Frontend React (components, hooks, tests)
  3. EIKEN : Logo app
→ KAIDA coordonne exécution séquentielle/parallèle
→ KAIDA agrège : "App todo complète + logo prête"
→ Retour à SHIZEN
"""

class KaidaAgent(BaseAgent):
    """Agent KAIDA - Orchestrateur multi-agents."""

    def __init__(self):
        llm = OllamaConfig.get_qwen_llm(temperature=0.5)  # Température moyenne (équilibre créativité/déterminisme)
        super().__init__(llm, "KAIDA", KAIDA_SYSTEM_PROMPT)
        self.agents = {}  # Dict[str, BaseAgent] - Agents disponibles

    def register_agent(self, agent_name: str, agent: BaseAgent):
        """Enregistre un agent spécialisé."""
        self.agents[agent_name] = agent
        logger.info(f"[KAIDA] Agent {agent_name} enregistré")

    async def process(self, input_data: Dict[str, Any]) -> str:
        """
        Orchestre une requête complexe.

        Args:
            input_data: {
                "request": str,
                "source": str ("SHIZEN" ou autre),
                "context": str (optionnel)
            }

        Returns:
            str: Résultat agrégé de tous les agents
        """
        request = input_data.get("request", "")
        source = input_data.get("source", "UNKNOWN")

        logger.info(f"[KAIDA] Orchestration requête de {source}: {request[:100]}...")

        # Étape 1 : KAIDA analyse et décompose
        decomposition = await self._decompose_task(request)

        # Étape 2 : Exécute chaque sous-tâche
        results = []
        for subtask in decomposition["subtasks"]:
            agent_name = subtask["agent"]
            task_description = subtask["task"]

            if agent_name in self.agents:
                logger.info(f"[KAIDA] Délègue à {agent_name}: {task_description[:50]}...")
                agent_result = await self.agents[agent_name].process({"task": task_description})
                results.append({"agent": agent_name, "result": agent_result})
            else:
                logger.warning(f"[KAIDA] Agent {agent_name} non disponible")
                results.append({"agent": agent_name, "result": f"Agent {agent_name} non implémenté"})

        # Étape 3 : Agrège résultats
        aggregated_result = self._aggregate_results(results)

        return aggregated_result

    async def _decompose_task(self, task: str) -> Dict[str, Any]:
        """
        Décompose une tâche complexe en sous-tâches assignées aux agents.

        Args:
            task: Description de la tâche

        Returns:
            Dict avec structure :
            {
                "subtasks": [
                    {"agent": "TAKUMI", "task": "..."},
                    {"agent": "EIKEN", "task": "..."}
                ]
            }
        """
        # Prompt KAIDA pour décomposer
        decomposition_prompt = f"""Décompose cette tâche en sous-tâches assignées aux agents appropriés.

Agents disponibles :
- TAKUMI : Code (Python, JavaScript, architecture, tests)
- SEIKYO : Audio (transcription, TTS) [Futur]
- EIKEN : Images (génération Stable Diffusion) [Futur]

Tâche : {task}

Réponds au format JSON :
{{
  "subtasks": [
    {{"agent": "TAKUMI", "task": "Description précise"}},
    {{"agent": "EIKEN", "task": "Description précise"}}
  ]
}}
"""
        response = await self.invoke(decomposition_prompt)

        # Parse JSON (simplifié - en prod, utilise json.loads + validation)
        # Pour MVP, on retourne structure hardcodée si parse échoue
        try:
            import json
            return json.loads(response)
        except:
            logger.warning("[KAIDA] Parse décomposition échoué, fallback TAKUMI")
            return {
                "subtasks": [
                    {"agent": "TAKUMI", "task": task}
                ]
            }

    def _aggregate_results(self, results: List[Dict[str, Any]]) -> str:
        """Agrège résultats de plusieurs agents."""
        aggregated = "# Résultats Agrégés\n\n"
        for result in results:
            aggregated += f"## Agent : {result['agent']}\n\n"
            aggregated += f"{result['result']}\n\n"
        return aggregated
```

### Agent TAKUMI (Code Specialist)

```python
# agents/takumi.py
from agents.base_agent import BaseAgent
from config.ollama_config import OllamaConfig
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

TAKUMI_SYSTEM_PROMPT = """Tu es TAKUMI, développeur senior spécialisé.

**Identité** :
- Rôle : Génération code production-ready, architecture, tests
- Expertise : Python, JavaScript/TypeScript, React, FastAPI, tests, DevOps
- Modèle : CodeLlama 7B (optimisé pour code)
- Posture : Obsédé qualité, zéro erreur, type-safe

**Standards Non-Négociables** :
- Type hints complets (Python), TypeScript strict
- Docstrings/JSDoc détaillées (Google style)
- Tests coverage ≥ 80%
- Error handling systématique
- Validation inputs
- Zéro warnings linting

**Workflow** :
KAIDA délègue tâche → TAKUMI génère code complet → Retourne à KAIDA

Réponds UNIQUEMENT avec du code production-ready + explications concises.
"""

class TakumiAgent(BaseAgent):
    """Agent TAKUMI - Spécialiste code."""

    def __init__(self):
        llm = OllamaConfig.get_codellama_llm(temperature=0.2)  # Basse température pour code déterministe
        super().__init__(llm, "TAKUMI", TAKUMI_SYSTEM_PROMPT)

    async def process(self, input_data: Dict[str, Any]) -> str:
        """
        Génère du code production-ready.

        Args:
            input_data: {
                "task": str (description tâche code),
                "language": str ("python", "javascript", etc. - optionnel),
                "context": str (optionnel)
            }

        Returns:
            str: Code généré + explications
        """
        task = input_data.get("task", "")
        language = input_data.get("language", "python")
        context = input_data.get("context", "")

        # Enrichit prompt avec standards
        enriched_task = f"""Génère du code {language} production-ready pour cette tâche :

Tâche : {task}

{f"Contexte : {context}" if context else ""}

Standards obligatoires :
- Type hints (Python) ou TypeScript strict
- Docstrings/JSDoc (Google style)
- Error handling (try/except, logging)
- Validation inputs
- Tests coverage ≥ 80%

Réponds avec :
1. Code complet
2. Tests associés
3. Explication brève architecture
"""

        return await self.invoke(enriched_task)
```
</implementation_agents>

## 🗄️ RAG avec Obsidian Vault

<rag_obsidian>
### Architecture RAG

```python
# rag/obsidian_rag.py
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from typing import List
import logging

logger = logging.getLogger(__name__)

class ObsidianRAG:
    """RAG system pour vault Obsidian Shinkofa."""

    def __init__(self, vault_path: str, persist_directory: str = "./chroma_db"):
        """
        Args:
            vault_path: Chemin vers vault Obsidian
            persist_directory: Dossier persistance ChromaDB
        """
        self.vault_path = vault_path
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        self.vectorstore = None
        self._load_documents()

    def _load_documents(self):
        """Charge documents Obsidian et crée vectorstore."""
        logger.info(f"[RAG] Chargement documents depuis {self.vault_path}...")

        # Loader pour fichiers .md
        loader = DirectoryLoader(
            self.vault_path,
            glob="**/*.md",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"}
        )
        documents = loader.load()
        logger.info(f"[RAG] {len(documents)} documents chargés")

        # Split en chunks (400-600 tokens recommandé pour RAG optimal)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""]
        )
        splits = text_splitter.split_documents(documents)
        logger.info(f"[RAG] {len(splits)} chunks créés")

        # Crée vectorstore ChromaDB
        self.vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        logger.info("[RAG] Vectorstore créé et persisté")

    def retrieve(self, query: str, k: int = 5) -> List[str]:
        """
        Récupère les k documents les plus pertinents.

        Args:
            query: Requête utilisateur
            k: Nombre de documents à retourner

        Returns:
            List[str]: Contenu des documents pertinents
        """
        if not self.vectorstore:
            logger.warning("[RAG] Vectorstore non initialisé")
            return []

        results = self.vectorstore.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def retrieve_with_sources(self, query: str, k: int = 5) -> List[dict]:
        """
        Récupère documents + métadonnées sources.

        Args:
            query: Requête utilisateur
            k: Nombre de documents

        Returns:
            List[dict]: [{"content": str, "source": str, "score": float}]
        """
        if not self.vectorstore:
            return []

        results = self.vectorstore.similarity_search_with_score(query, k=k)
        return [
            {
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "score": score
            }
            for doc, score in results
        ]
```

### Intégration RAG dans Agents

```python
# agents/shizen.py (mise à jour)
class ShizenAgent(BaseAgent):
    def __init__(self, rag: ObsidianRAG = None):
        super().__init__(...)
        self.rag = rag

    async def process(self, input_data: Dict[str, Any]) -> str:
        user_input = input_data.get("user_input", "")

        # Retrieve contexte pertinent du vault Obsidian
        if self.rag:
            relevant_docs = self.rag.retrieve(user_input, k=3)
            context = "\n\n".join(relevant_docs)
            enriched_input = f"Contexte Shinkofa (vault Obsidian) :\n{context}\n\nRequête utilisateur : {user_input}"
        else:
            enriched_input = user_input

        return await self.invoke(enriched_input)
```

### Optimisation YAML Frontmatter (Obsidian)

**Standard requis dans vault Obsidian** :
```markdown
---
title: Design Humain - Projecteur
tags: [design-humain, projecteur, energie]
category: coaching
created: 2025-12-11
updated: 2025-12-11
---

# Design Humain - Projecteur

## Caractéristiques

Le Projecteur est un type énergétique non-sacral...

## Stratégie

La stratégie du Projecteur est d'attendre l'invitation...
```

**Pourquoi YAML frontmatter ?** :
- Permet filtrage par tags/catégories lors du retrieve
- Métadonnées enrichies pour contexte (date création, auteur)
- Compatible plugins Obsidian (Dataview, etc.)
</rag_obsidian>

## 🖥️ Interface Streamlit MVP

<interface_streamlit>
```python
# app/streamlit_app.py
import streamlit as st
import asyncio
from agents.shizen import ShizenAgent
from agents.kaida import KaidaAgent
from agents.takumi import TakumiAgent
from rag.obsidian_rag import ObsidianRAG

# Configuration page
st.set_page_config(
    page_title="Shizen-Koshin MVP",
    page_icon="🌱",
    layout="wide"
)

# Initialisation agents (cached)
@st.cache_resource
def init_agents():
    """Initialise agents et RAG."""
    # RAG
    rag = ObsidianRAG(vault_path="/path/to/KnowledgeBase-CoachingShinkofa")

    # Agents
    shizen = ShizenAgent(rag=rag)
    kaida = KaidaAgent()
    takumi = TakumiAgent()

    # Register agents dans KAIDA
    kaida.register_agent("TAKUMI", takumi)

    # Connecte SHIZEN à KAIDA
    shizen.kaida = kaida

    return shizen, kaida, takumi, rag

shizen, kaida, takumi, rag = init_agents()

# UI
st.title("🌱 Shizen-Koshin MVP")
st.markdown("### Coach IA Holistique - La Voie Shinkofa")

# Sidebar : Check-in énergie
with st.sidebar:
    st.header("⚡ Check-in Énergie")
    energy_level = st.slider("Niveau énergie (1-10)", 1, 10, 5)
    st.markdown(f"**Score actuel** : {energy_level}/10")

    if energy_level <= 3:
        st.warning("🔴 Énergie basse - Sessions courtes recommandées")
    elif energy_level <= 6:
        st.info("🟡 Énergie modérée - Équilibre activité/repos")
    else:
        st.success("🟢 Énergie haute - Focus optimal")

# Chat interface
st.header("💬 Chat avec SHIZEN")

# Session state pour historique
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display historique
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input
if user_input := st.chat_input("Parle avec SHIZEN..."):
    # Add user message to history
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # SHIZEN process
    with st.chat_message("assistant"):
        with st.spinner("SHIZEN réfléchit..."):
            # Async call (nécessite asyncio.run dans Streamlit)
            response = asyncio.run(shizen.process({
                "user_input": user_input,
                "energy_level": energy_level
            }))
            st.markdown(response)

    # Add SHIZEN response to history
    st.session_state.messages.append({"role": "assistant", "content": response})

# Bouton clear history
if st.button("🗑️ Effacer historique"):
    st.session_state.messages = []
    st.rerun()
```
</interface_streamlit>

## 🧪 Testing Multi-Agents

<testing>
```python
# tests/test_agents.py
import pytest
from agents.shizen import ShizenAgent
from agents.kaida import KaidaAgent
from agents.takumi import TakumiAgent

@pytest.mark.asyncio
async def test_shizen_greeting():
    """Test SHIZEN répond à un bonjour."""
    shizen = ShizenAgent()
    response = await shizen.process({"user_input": "Bonjour SHIZEN !"})
    assert "bonjour" in response.lower() or "salut" in response.lower()

@pytest.mark.asyncio
async def test_kaida_delegation_to_takumi():
    """Test KAIDA délègue correctement à TAKUMI."""
    kaida = KaidaAgent()
    takumi = TakumiAgent()
    kaida.register_agent("TAKUMI", takumi)

    response = await kaida.process({
        "request": "Crée une fonction Python pour calculer factorielle",
        "source": "TEST"
    })

    assert "def" in response  # Code Python généré
    assert "factorial" in response.lower()

@pytest.mark.asyncio
async def test_takumi_generates_tests():
    """Test TAKUMI génère du code avec tests."""
    takumi = TakumiAgent()
    response = await takumi.process({
        "task": "Crée une fonction somme de deux nombres avec tests pytest"
    })

    assert "def" in response
    assert "test_" in response  # Tests pytest générés
    assert "assert" in response

# Run tests
# pytest tests/test_agents.py -v --asyncio-mode=auto
```
</testing>

## 📋 Checklist Déploiement Kubuntu

<checklist_kubuntu>
- [ ] **Ollama installé** : `ollama --version`
- [ ] **Modèles téléchargés** : `ollama list` (qwen2.5:7b, codellama:7b)
- [ ] **Python 3.11+** : `python3 --version`
- [ ] **Venv créé** : `python3 -m venv venv && source venv/bin/activate`
- [ ] **Dependencies** : `pip install -r requirements.txt`
- [ ] **Vault Obsidian accessible** : Chemin `/path/to/KnowledgeBase-CoachingShinkofa`
- [ ] **ChromaDB persisté** : Dossier `./chroma_db` créé et indexé
- [ ] **Tests passent** : `pytest tests/ -v`
- [ ] **Streamlit lance** : `streamlit run app/streamlit_app.py`
- [ ] **Logs configurés** : `logging.basicConfig(level=logging.INFO)`
</checklist_kubuntu>

## 🚀 Optimisations CPU (Kubuntu Dell i5-6300U)

<optimisations_cpu>
### Paramètres Ollama pour CPU Léger

```bash
# ~/.bashrc ou ~/.zshrc
export OLLAMA_NUM_PARALLEL=1        # 1 seul modèle à la fois (évite saturation)
export OLLAMA_MAX_LOADED_MODELS=1   # 1 modèle en mémoire max
export OLLAMA_NUM_THREADS=4         # 4 threads (i5-6300U = 2 cores, 4 threads)
```

### LangChain Batch Processing

```python
# Éviter appels séquentiels → utiliser batch
from langchain_core.runnables import RunnableBatch

# Mauvais (lent sur CPU)
for task in tasks:
    result = await agent.process(task)

# Bon (batch parallèle limité)
batch = RunnableBatch([agent.chain for _ in tasks])
results = await batch.abatch([{"input": task} for task in tasks], max_concurrency=2)
```

### Cache Réponses Fréquentes

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_response(query: str) -> str:
    """Cache les 100 dernières réponses."""
    # Si query déjà vue, retourne réponse cached (évite appel Ollama)
    pass
```
</optimisations_cpu>

---

**Version 1.0 | 2025-12-11 | TAKUMI Best Practices Shizen-Koshin**
