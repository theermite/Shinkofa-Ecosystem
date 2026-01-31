# 📦 Template .claude pour projets TAKUMI

Ce dossier contient tous les fichiers nécessaires pour travailler avec TAKUMI (Claude Code) dans n'importe quel repo GitHub.

## 🚀 Utilisation

**1. Créer nouveau repo GitHub privé pour ton projet**

**2. Copier ce template**
```bash
# Dans ton nouveau repo
cp -r /chemin/vers/Instruction-Claude-Code/.claude-template/ .claude/
git add .claude/
git commit -m "chore: Add TAKUMI instructions"
git push
```

**3. Ouvrir le repo dans Claude Code Web**
- TAKUMI lira automatiquement `.claude/CLAUDE.md`
- Tous les workflows, standards, et commandes seront appliqués

## 📁 Contenu

```
.claude/
├── CLAUDE.md                        # Instructions complètes TAKUMI v1.5
├── SESSION-CHECKLIST.md             # Protocole début de session (OBLIGATOIRE)
├── BEST-PRACTICES-WEB.md            # Standards sites web (React + FastAPI)
├── BEST-PRACTICES-DESKTOP.md        # Patterns desktop apps (CustomTkinter + Electron)
├── BEST-PRACTICES-SHIZEN-KOSHIN.md  # Architecture multi-agents IA
├── RAG-OPTIMIZATION-2025.md         # Techniques RAG 2025 (Self-RAG, CRAG, etc.)
├── PROJECT-HISTORY.md               # Leçons projets précédents
├── templates/                       # Templates COPYRIGHT, USER-GUIDE, etc.
└── commands/                        # Slash commands personnalisés
```

## 🎯 Workflow

1. Jay crée repo + copie `.claude-template/` → `.claude/`
2. TAKUMI développe directement dans le repo
3. Livraison : App 100% fonctionnelle avec max features
4. Déploiement VPS OVH (recommandé) ou o2Switch (statique)

## 💡 Philosophie

> "Livrer une solution COMPLÈTE et FONCTIONNELLE avec le maximum de features demandées, pas un MVP minimal."

## ✨ Nouveautés v1.5 (2025-12-11)

### 📋 Session Start Protocol
- **SESSION-CHECKLIST.md** : Questionnaire OBLIGATOIRE au début de chaque session
  - Détecte environnement (Windows/VPS/Kubuntu)
  - Adapte commandes, chemins, outils automatiquement
  - Évalue énergie Jay (sessions adaptées)

### 📚 Best Practices Complètes
- **BEST-PRACTICES-WEB.md** : Standards web obligatoires
  - Toggle dark/light theme (MANDATORY)
  - Password reveal toggle
  - Full responsive (mobile-first)
  - WCAG AAA contrast (7:1 ratio)
  - Full-width navigation menu

- **BEST-PRACTICES-DESKTOP.md** : Patterns desktop (WinAdminTE lessons)
  - Threading patterns (GUI non-bloquante)
  - Lambda scope fix (CRITICAL bug pattern)
  - PowerShell > WMIC (Windows 11)
  - PyInstaller build process

- **BEST-PRACTICES-SHIZEN-KOSHIN.md** : Architecture multi-agents
  - SHIZEN (coach user-facing) / KAIDA (orchestrator) / TAKUMI (code)
  - LangChain + Ollama setup
  - RAG avec Obsidian vault
  - Kubuntu CPU optimizations

### 🔬 RAG Optimization 2025
- **RAG-OPTIMIZATION-2025.md** : Dernières techniques recherche
  - Self-RAG (+10-15% accuracy)
  - Long RAG (contexte 100K-200K tokens)
  - CRAG (correction automatique, +22% accuracy)
  - Adaptive Retrieval (retrieval pendant génération)
  - Hybrid Retrieval (Dense + Sparse, +18% accuracy)

### 📖 Project History
- **PROJECT-HISTORY.md** : Leçons projets complétés
  - WinAdminTE (Desktop CustomTkinter)
  - Les Petits Liens (React + FastAPI)
  - SLF-Esport (WebSocket, real-time)
  - Website-Shinkofa (WordPress)
  - Patterns réussis + anti-patterns à éviter

### 🔧 Architecture Agents Corrigée
- SHIZEN = User-facing coach (parle directement à Jay)
- KAIDA = Background orchestrator (jamais visible)
- TAKUMI = Code specialist (délégué par KAIDA)

### 🌍 Multi-Environment Support
- Windows CLI (PowerShell, PyInstaller, admin rights)
- VPS SSH (Bash, nginx, systemd, Docker)
- Kubuntu CLI (Ollama, LangChain, CPU-optimized)

---

**Version 1.5 | 2025-12-11 | TAKUMI**
