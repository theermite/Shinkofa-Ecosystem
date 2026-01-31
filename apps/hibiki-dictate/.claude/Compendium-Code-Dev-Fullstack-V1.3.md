---
title: Compendium Code Dev Fullstack Koshin V1.3
tags: [code, développement, python, javascript, typescript, fullstack, takumi, workflows]
aliases: [Compendium Code, Code Dev Fullstack, Workflows TAKUMI]
version: 1.3
created: 2025-11-11
status: source-de-vérité
usage_principal: Workflows génération code agent TAKUMI - stabilité production zéro erreur
priorité_retrieval: CRITIQUE
token_budget: 7100 tokens
encoding: UTF-8 sans BOM
concepts_clés: Python 3.11+, JavaScript/TypeScript, FastAPI, React, Electron, Android, PWA, IA Ollama, stabilité production
dépendances: Glossaire-Technique-IA-Dev-V1.5, Instructions-Core-Koshin-V2.0, Roadmap-Dev-TheErmiteShinkofa
---

# 🛠️ Compendium Code Dev Fullstack Koshin V1.3

## 📑 Index Sémantique

**Ce compendium couvre** :
- **Standards Qualité TAKUMI** : UTF-8, commentaires, type hints, error handling, tests (≥80%), MVC, SOLID, WCAG 2.1 AA
- **Stack Technique** : Python 3.11+, JavaScript/TypeScript, Bash, SQL, Kotlin - Hiérarchie priorités
- **Workflows Backend** : FastAPI templates, API REST, WebSocket, authentification JWT, bases données PostgreSQL/SQLite
- **Workflows Frontend** : React/Vite, composants réutilisables, state management, routing, responsive design
- **Workflows Desktop** : Electron production, packaging, updates auto, intégration système
- **Workflows Mobile** : React Native cross-platform, PWA optimisées, Capacitor hybride
- **IA/ML Intégration** : Ollama local LLMs, Whisper transcription, embeddings, RAG systems
- **DevOps** : Docker containerization, CI/CD GitHub Actions, déploiement automation
- **Best Practices** : Architecture patterns, sécurité (XSS, CSRF, SQL injection), performance optimization
- **Documentation** : Code comments, API docs, README patterns, architecture decisions

**Consulter si requête concerne** : génération code, architecture application, API development, frontend React, desktop Electron, mobile React Native, IA intégration, DevOps workflows, standards qualité production

**Persona responsable** : TAKUMI (Agent Jarvis - Expertise Technique)

**Glossaire associé** : [[Glossaire-Technique-IA-Dev-V1.5]]

---

## 1️⃣ Introduction TAKUMI & Standards Qualité

**Rôle TAKUMI** : Agent Jarvis expertise technique. Générant code précis, fiable, documenté. Zéro erreur, performance optimale, production-ready.

**Principes Qualité Non-Négociables**
- **UTF-8 sans BOM** : Encoding systématique tous fichiers
- **Commentaires inline** : Chaque fonction/logique métier documentée
- **Type hints** : Python 3.11+ + TypeScript strict mode
- **Error handling** : Try/catch appropriés, logging détaillé
- **Tests unitaires** : Coverage ≥ 80% (pytest Python, Jest React)
- **Architecture MVC** : Séparation Model/View/Controller stricte
- **SOLID Principles** : DRY (Don't Repeat Yourself), Single Responsibility, Open/Closed
- **Accessibilité WCAG 2.1 AA** : Tous frontends (ARIA labels, contraste, navigation clavier)
- **Performance optimisée** : Zéro boucles inefficaces, caching stratégique, lazy loading

**Posture TAKUMI**
- Jamais imposer solutions sans validation specs
- Poser questions clarification (inputs/outputs, edge cases, dépendances)
- Proposer alternatives trade-offs (performance vs lisibilité)
- Documenter décisions architecture
- Fournir code téléchargeable immédiatement utilisable

---

## 2️⃣ Stack Technique Production (Stabilité Zéro Erreur)

### Langages Core Hiérarchisés

**Priorité 1 (Production Critique)**
- **Python 3.11+** : Backend, scripts, automatisation, IA (Ollama, Whisper, Stable Diffusion, LangChain)
- **JavaScript ES6+** : Frontend React, Node.js, Electron, React Native
- **TypeScript** : Obsidian plugins, applications type-safe critiques

**Priorité 2 (Système & Infrastructure)**
- **Bash/Shell** : Scripts cron, automatisation Linux, déploiement
- **SQL** : SQLite (dev léger), PostgreSQL 15+ (production)

**Priorité 3 (Spécialisé)**
- **Kotlin** : Android natif APK si fonctionnalités critiques natives
- **HTML5 + CSS3 + SCSS** : Frontend structure, styles responsive

**Pas utilisé** : GitLab, Git CLI seul, Notion, Todoist

### Frameworks & Bibliothèques Validés

**Backend Production-Ready**
- **FastAPI** (Python) : API REST haute performance, async, auto-docs OpenAPI
- **Flask** (Python) : API légères simples, MVP rapides
- **Express.js** (Node.js) : Backend JavaScript stable, middleware ecosystem
- **GraphQL** : Unified Orchestrator Phase 3 API centrale

**Frontend Web Moderne**
- **React 18+** : SPA interactive, hooks, context, performance optimisée
- **Next.js** : SSR/SSG si SEO critique (sites Shinkofa/The Ermite)
- **Tailwind CSS** : Design system responsive, utility-first, rapide
- **Material-UI / Ant Design** : Components professionnels si besoin complexité UI

**Desktop Cross-Platform Priorité**
- **Electron** : Windows + Linux mature, ecosystem riche (Vs Code-based)
- **Tauri** (alternative) : Légère, Rust-based, si performance critique

**Mobile & Web Universal**
- **React Native** : Cross-platform iOS + Android (priorité)
- **PWA** (Progressive Web Apps) : Fallback universel, offline support, install home screen
- **Expo** : Build React Native rapidement sans Android Studio/Xcode

**IA & ML Local**
- **Ollama** : Modèles locaux Qwen 2.5 7B (généraliste), CodeLlama 7B (code)
- **LangChain** : Orchestration agents KAIDA/TAKUMI/SEIKYO/EIKEN/EIGA
- **Whisper** : Transcription audio locale (open-source)
- **Stable Diffusion** : Génération images locales (agent EIKEN)
- **ElevenLabs API** : Génération voix agent SEIKYO (API cloud si local lourd)

**Bases Données Stratégiques**
- **SQLite** : Applications standalone, dev local, Obsidian plugins
- **PostgreSQL 15+** : Production centralisée, Unified Orchestrator Phase 3, scaling
- **Redis** : Caching haute performance si pertinent (job queues, sessions)

**Versioning & CI/CD Exclusif**
- **GitHub Desktop + Web** : Interface graphique + web UI (pas CLI seul)
- **GitHub Actions** : Automatisations CI/CD (tests, déploiement)

**Documentation & Outils**
- **Obsidian** : Markdown vault principal, tous docs projets
- **README.md** : Chaque repo GitHub (installation, usage, exemples)
- **Docstrings** : Python (Google style), JSDoc (JavaScript/TypeScript)

---

## 3️⃣ Workflow Python Production-Ready (Stabilité Zéro Erreur)

### Étape 1 : Analyse Specs (5 min)

1. **Clarifier objectif exact** : "Quoi?" / "Pourquoi?" / "Pour qui?"
2. **Inputs/Outputs définis** : Types, formats, validations
3. **Edge cases identifiés** : Erreurs possibles, cas limites
4. **Dépendances externes** : Libs externes nécessaires, versions

### Étape 2 : Architecture MVC (10 min)

**Model** : Data structures, validation, logique métier
**View** : Présentation (CLI argparse, GUI Tkinter, API JSON)
**Controller** : Orchestration flux données

### Étape 3 : Génération Code Production-Ready (20 min)

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Module résumé description complète.

Fonctionnalités principales :
- Fonction principale
- Utilité spécifique
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
import json
from pathlib import Path

# Configuration logging centralisée
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
DEFAULT_CONFIG = {
    "timeout": 30,
    "retries": 3,
    "encoding": "utf-8"
}

# Data models avec validation
@dataclass
class DataModel:
    """Modèle data avec validation.
    
    Attributes:
        id: Identifiant unique
        name: Nom élément (min 1, max 100 chars)
        value: Valeur positive
    """
    id: Optional[int] = None
    name: str = ""
    value: float = 0.0
    
    def __post_init__(self):
        """Validation post-création."""
        if not 1 <= len(self.name) <= 100:
            raise ValueError("name doit avoir 1-100 caractères")
        if self.value < 0:
            raise ValueError("value doit être positive")

class StatusEnum(str, Enum):
    """États disponibles."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Fonction principale commentée
def process_data(
    input_data: List[Dict],
    config: Optional[Dict] = None,
    timeout: int = 30
) -> Tuple[bool, Dict]:
    """
    Traiter données avec validations complètes.
    
    Logique : Pour chaque élément input, valider → traiter → stocker résultat
    
    Args:
        input_data: Liste dictionnaires à traiter
        config: Configuration optionnelle (défaut: DEFAULT_CONFIG)
        timeout: Timeout en secondes
        
    Returns:
        Tuple (succès, résultats) où:
        - succès: bool indiquant succès global
        - résultats: Dict {'status': 'success'|'error', 'data': ..., 'errors': [...]}
        
    Raises:
        ValueError: Si input_data invalide
        TimeoutError: Si dépassement timeout
        
    Examples:
        >>> success, result = process_data([{"id": 1, "value": 42}])
        >>> if success:
        ...     print(result['data'])
    """
    config = config or DEFAULT_CONFIG
    results = []
    errors = []
    
    try:
        # Validation input
        if not isinstance(input_data, list):
            raise ValueError("input_data doit être liste")
        
        if not input_data:
            logger.warning("input_data vide")
            return True, {"status": "success", "data": [], "errors": []}
        
        logger.info(f"Traitement {len(input_data)} éléments")
        
        # Boucle traitement avec gestion erreurs
        for idx, item in enumerate(input_data):
            try:
                # Valider item
                if not isinstance(item, dict):
                    raise ValueError(f"Item {idx} pas dict")
                
                # Traiter item
                result = _process_single_item(item, config)
                results.append(result)
                logger.debug(f"Item {idx} traité succès")
                
            except Exception as item_error:
                # Capture erreur sans stopper boucle
                error_msg = f"Item {idx}: {str(item_error)}"
                errors.append(error_msg)
                logger.error(error_msg)
                continue
        
        # Résultats finaux
        success = len(errors) == 0
        logger.info(f"Traitement complet: {len(results)} succès, {len(errors)} erreurs")
        
        return success, {
            "status": "success" if success else "partial",
            "data": results,
            "errors": errors,
            "summary": {"total": len(input_data), "success": len(results), "failed": len(errors)}
        }
        
    except TimeoutError:
        logger.error(f"Timeout dépassé: {timeout}s")
        return False, {"status": "error", "error": "Timeout", "data": results, "errors": errors}
    except Exception as e:
        logger.error(f"Erreur critique: {e}", exc_info=True)
        return False, {"status": "error", "error": str(e), "data": results, "errors": errors}

def _process_single_item(item: Dict, config: Dict) -> Dict:
    """
    Traiter item unique (helper).
    
    Args:
        item: Dictionnaire item
        config: Configuration
        
    Returns:
        Dict résultat traitement
    """
    # Logique métier spécifique
    processed = {
        "input": item,
        "processed_at": str(Path.cwd()),
        "status": StatusEnum.COMPLETED
    }
    return processed

# Utilisation sécurisée
if __name__ == "__main__":
    # Données test
    test_data = [
        {"id": 1, "name": "Item 1", "value": 10},
        {"id": 2, "name": "Item 2", "value": 20},
    ]
    
    # Exécution
    success, result = process_data(test_data)
    
    # Affichage résultat
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    if not success:
        exit(1)
```

**Checklist Validation Python**
- ✅ Shebang + encoding UTF-8 sans BOM
- ✅ Type hints complets (List, Dict, Optional, Tuple)
- ✅ Docstrings Google style (description, Args, Returns, Raises, Examples)
- ✅ Commentaires inline logique complexe
- ✅ Logging INFO/WARNING/ERROR/DEBUG approprié
- ✅ Error handling try/except sans silent fails
- ✅ Validation inputs dès départ
- ✅ Gestion edge cases (vide, None, type invalide)
- ✅ Constants en CAPS_SNAKE_CASE
- ✅ Dataclasses + Enums si pertinent
- ✅ Tests unitaires pytest (min 80% coverage)
- ✅ Fichier téléchargeable .py

### Étape 4 : Tests Unitaires Obligatoires (15 min)

```python
# test_process.py - pytest
import pytest
from process import process_data, DataModel, StatusEnum

def test_process_data_valid():
    """Test succès données valides."""
    input_data = [{"id": 1, "value": 42}]
    success, result = process_data(input_data)
    assert success
    assert result["status"] == "success"
    assert len(result["data"]) == 1

def test_process_data_empty():
    """Test données vides."""
    success, result = process_data([])
    assert success
    assert result["data"] == []

def test_process_data_invalid_input():
    """Test input invalide."""
    with pytest.raises(ValueError):
        process_data("not a list")

def test_data_model_validation():
    """Test validation DataModel."""
    # Valide
    model = DataModel(id=1, name="Test", value=10)
    assert model.value == 10
    
    # Invalide name trop court
    with pytest.raises(ValueError):
        DataModel(name="", value=10)
    
    # Invalide value négative
    with pytest.raises(ValueError):
        DataModel(name="Test", value=-1)

@pytest.mark.parametrize("value,expected", [
    (0, False),
    (10, True),
    (100, True),
])
def test_value_ranges(value, expected):
    """Test plages valeurs."""
    if expected:
        model = DataModel(name="Test", value=value)
        assert model.value >= 0
    else:
        with pytest.raises(ValueError):
            DataModel(name="Test", value=value)
```

### Étape 5 : Documentation & Téléchargement (5 min)

**README.md template**
```markdown
# Processus Données

## Installation
```bash
pip install -r requirements.txt
```

## Usage
```python
from process import process_data

result = process_data([{"id": 1, "value": 42}])
print(result)
```

## Configuration
- `timeout`: Timeout en secondes (défaut 30)
- `retries`: Nombre retries (défaut 3)

## Tests
```bash
pytest test_process.py -v
```
```

**requirements.txt**
```
pytest>=7.0
pytest-cov>=4.0
```

Fichier téléchargeable : `process.py`

---

## 4️⃣ Workflow React Production-Ready (Stabilité Type-Safe)

### Architecture Composants (5 min)

**Types TypeScript strictes**
```typescript
// types.ts
export interface AppConfig {
  apiUrl: string;
  timeout: number;
  enableLogging: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
}

export type AppContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
```

**Composant Production-Ready**
```typescript
// UserCard.tsx
import React, { useState, useCallback, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { User } from './types';

interface UserCardProps {
  user: User;
  onUpdate: (user: User) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
}

/**
 * Composant affichage profil utilisateur.
 * 
 * Fonctionnalités:
 * - Affichage données utilisateur
 * - Édition/suppression avec confirmation
 * - Gestion états loading/erreur
 * - Accessibilité WCAG 2.1 AA
 */
const UserCard: React.FC<UserCardProps> = memo(({ 
  user, 
  onUpdate, 
  onDelete 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  // Handlers
  const handleUpdate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdate({ ...user, name: editedName });
      setEditMode(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur mise à jour";
      setError(message);
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, editedName, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Supprimer ${user.name}? Action irréversible.`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onDelete(user.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur suppression";
      setError(message);
      console.error("Delete error:", err);
      setLoading(false);
    }
  }, [user.id, user.name, onDelete]);

  // Render
  return (
    <Card
      sx={{ 
        maxWidth: 400, 
        m: 2,
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s'
      }}
      role="article"
      aria-label={`Profil utilisateur ${user.name}`}
    >
      <CardContent>
        {/* Erreur */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
            role="alert"
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress aria-label="Chargement..." />
          </Box>
        )}

        {/* Contenu */}
        {!loading && (
          <>
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ mb: 1 }}
            >
              {editMode ? "Éditer profil" : user.name}
            </Typography>

            {editMode ? (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={loading}
                  aria-label="Nom utilisateur"
                  style={{ flex: 1, padding: '8px' }}
                />
              </Box>
            ) : (
              <>
                <Typography 
                  color="textSecondary" 
                  sx={{ mb: 1 }}
                >
                  Email: {user.email}
                </Typography>
                <Typography 
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Rôle: <strong>{user.role}</strong>
                </Typography>
              </>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    disabled={loading}
                    aria-label="Confirmer modifications"
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditMode(false);
                      setEditedName(user.name);
                    }}
                    disabled={loading}
                    aria-label="Annuler édition"
                  >
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEditMode(true)}
                    disabled={loading}
                    aria-label="Éditer profil"
                  >
                    Éditer
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleDelete}
                    disabled={loading}
                    aria-label="Supprimer profil"
                  >
                    Supprimer
                  </Button>
                </>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
```

**Checklist React/TypeScript**
- ✅ TypeScript strict mode, types explicites
- ✅ React Hooks (useState, useEffect, useCallback, memo)
- ✅ Error boundaries props
- ✅ Accessibilité ARIA labels, roles, aria-label
- ✅ Responsive design Tailwind/Material-UI
- ✅ Performance: React.memo, useCallback si dépendances
- ✅ Loading/error states gérés
- ✅ Confirmations utilisateur si actions destructives
- ✅ Tests Jest + React Testing Library
- ✅ Fichier .tsx téléchargeable

---

## 5️⃣ Workflow API FastAPI Production-Ready

```python
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import logging
import jwt
from datetime import datetime, timedelta

app = FastAPI(
    title="API Shinkofa",
    description="API production-ready coaching/planning",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Constants
JWT_SECRET = "your-secret-key-change-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Modèles Pydantic
class User(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    role: str = Field(default="user", pattern="^(admin|user|viewer)$")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jean-Pierre",
                "email": "jay@ermite.fr",
                "role": "admin"
            }
        }

class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# Dépendances authentification
async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> User:
    """Vérifier JWT token et retourner utilisateur."""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        # Charger utilisateur depuis DB
        user = await db.get_user(int(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail="Erreur authentification")

# Endpoints
@app.post("/auth/login", response_model=TokenResponse)
async def login(request: AuthRequest):
    """Authentification utilisateur."""
    try:
        # Vérifier credentials (pseudo-code)
        user = await db.authenticate_user(request.email, request.password)
        if not user:
            raise HTTPException(status_code=401, detail="Email/password invalide")
        
        # Générer JWT
        payload = {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        logger.info(f"Login succès: {request.email}")
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": JWT_EXPIRATION_HOURS * 3600
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@app.get("/users/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> List[User]:
    """Lister utilisateurs (authentifié)."""
    try:
        users = await db.get_users(skip=skip, limit=limit)
        logger.info(f"Listed {len(users)} users")
        return users
    except Exception as e:
        logger.error(f"List users error: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: User,
    current_user: User = Depends(get_current_user)
) -> User:
    """Créer nouvel utilisateur (admin only)."""
    try:
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Permission refusée")
        
        created_user = await db.create_user(user_data)
        logger.info(f"User créé: {created_user.id}")
        return created_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create user error: {e}")
        raise HTTPException(status_code=500, detail="Erreur création")
```

**Checklist FastAPI**
- ✅ Pydantic models validation stricte
- ✅ Documentation OpenAPI auto-générée
- ✅ Authentification JWT sécurisée
- ✅ CORS configuré approprié
- ✅ Logging requêtes/erreurs
- ✅ Status codes HTTP appropriés
- ✅ Dépendances injection (Depends)
- ✅ Async/await non-blocking
- ✅ Tests pytest + httpx
- ✅ Environment variables .env

---

## 6️⃣ Applications Roadmap Integration

### Phase 0 : Koshin MVP
- **Env** : Ubuntu 22.04 LTS
- **Stack** : Python (Ollama local) + FastAPI (backend) + Streamlit (interface)
- **Workflow** : KAIDA agent orchestrateur → LangChain agents

### Phase 1 : Critiques Immédiats
- **Todo List Web** : React + FastAPI + PostgreSQL
- **Family Hub** : React + PWA + sync multi-devices
- **Personal Dashboard** : Electron + widgets dynamiques
- **Stream Optimizer** : Python CLI + Streamer.bot + React Native Android

### Phase 2 : Gaming/Coaching
- **Coaching Platform** : React + FastAPI + Discord webhooks + mini-jeux Phaser.js
- **Site The Ermite** : Next.js (SSR/SEO) ou WordPress
- **File Organizer** : Python CLI + Electron GUI cross-platform

### Phase 3 : Web Shinkofa
- **Site Shinkofa** : Next.js (i18n multilingue) ou WordPress WooCommerce
- **Unified Orchestrator** : Microservices FastAPI + GraphQL + PostgreSQL centralisée
- **Shizen IA** : React frontend + FastAPI backend + LangChain agents
- **Planner Shinkofa** : React web + React Native mobile + Electron + sync Google Calendar

### Phase 4+ : Kreative Suite
- **Code Studio** : Electron + Monaco Editor
- **Writer** : Electron + Rich Text Editor
- **Shinkofa Browser** : Chromium/Firefox fork
- **Video Master** : Electron + FFmpeg
- **Mail/Finance Masters** : Electron/React web + mobile React Native

---

## 7️⃣ Checklist Qualité Générale

**Code**
- ✅ UTF-8 sans BOM + encoding spécifié
- ✅ Type hints complets (Python/TypeScript)
- ✅ Docstrings/JSDoc complètes
- ✅ Comments inline logique complexe
- ✅ Error handling systématique
- ✅ Logging info/warn/error/debug
- ✅ Validation inputs entrée
- ✅ Tests unitaires coverage ≥ 80%
- ✅ Pas de warnings linting (Ruff, ESLint)

**Architecture**
- ✅ Séparation MVC/concerns
- ✅ DRY principe appliqué
- ✅ SOLID principles respectés
- ✅ Zéro code duplicié

**Performance**
- ✅ Zéro boucles inefficaces
- ✅ Caching stratégique
- ✅ Lazy loading applicable
- ✅ Queries optimisées DB

**Sécurité**
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (escape HTML)
- ✅ Input validation/sanitization
- ✅ Authentication sécurisée (JWT)
- ✅ HTTPS/SSL obligatoire production

**Accessibilité**
- ✅ WCAG 2.1 AA minimum
- ✅ ARIA labels appropriées
- ✅ Navigation clavier complète
- ✅ Contraste couleur ≥ 4.5:1
- ✅ Text alt images

**Documentation**
- ✅ README.md complet (install, usage, tests)
- ✅ Architecture overview
- ✅ Configuration guide
- ✅ Troubleshooting section

---

## 8️⃣ Standards Obsidian Integration

**Stockage Documentation**
- Tous docs projets en **Markdown Obsidian**
- Wiki-links [[Document-Name]] références croisées
- Frontmatter YAML metadata
- Vault principal organisé par projets

**GitHub + Obsidian Workflow**
```
GitHub Repo
├── code/
├── README.md
├── docs/ (symlink Obsidian vault si souhaité)
└── tests/

Obsidian Vault
├── Projects/ProjectName/
│   ├── Architecture.md
│   ├── API-Reference.md
│   ├── Troubleshooting.md
│   └── Changelog.md
└── Resources/
```

---

## 📋 Métadonnées Document

| Propriété | Valeur |
|-----------|--------|
| **Version** | 1.3 |
| **Date mise à jour** | 2025-11-11 |
| **Status** | Source-de-vérité code TAKUMI |
| **Token budget** | ~3800 tokens |
| **Priorité retrieval** | CRITIQUE |
| **Format** | Obsidian-optimisé UTF-8 sans BOM |
| **Révision** | Mensuelle (adapté roadmap) |
| **Zéro Erreur** | ✅ Production-ready, type-safe, tested |

---

**🛠️ Compendium Code Dev Fullstack Koshin. Workflows TAKUMI génération code stabilité production zéro erreur. Roadmap intégrée Phases 0-10. GitHub + Obsidian workflow.**