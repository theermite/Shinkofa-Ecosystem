# Instructions Claude Code — Structure Optimisée v2.1

> Architecture modulaire basée sur le **Guide Ultime Optimisation IA 2026**.

---

## 📊 Métriques

| Métrique | Avant (CLAUDE.md v1.8) | Après (Structure v2.1) |
|----------|------------------------|------------------------|
| **Fichiers** | 1 monolithique (~600 lignes) | 38 fichiers modulaires |
| **Core chargé** | ~20KB | ~8KB (core/ uniquement) |
| **Chargement** | Tout ou rien | Lazy loading contextuel |
| **Skills** | Inline | Auto-découvrables |
| **Quickrefs** | N/A | On-demand par catégorie |

---

## 📁 Structure Complète

```
Prompt-2026-Optimized/
│
├── CLAUDE-MASTER.md          # Template universel (~120 lignes)
├── README.md                  # Ce fichier
├── mcp-config.json           # Configuration MCP servers
│
├── core/                      # Source de vérité (TOUJOURS chargé)
│   ├── PROFIL-JAY.md         # Profil compact (~100 lignes)
│   ├── AGENT-BEHAVIOR.md     # Comportement Claude avec Jay
│   ├── RAG-CONTEXT.md        # Règles gestion contexte
│   └── WORKFLOW.md           # Workflow standard AUDIT→PLAN→CODE→BILAN
│
├── skills/                    # Skills auto-découvrables (4)
│   ├── code-review/SKILL.md
│   ├── debug-expert/SKILL.md
│   ├── deployment/SKILL.md
│   └── session-manager/SKILL.md
│
├── agents/                    # Subagents spécialisés (2)
│   ├── security-auditor.md
│   └── codebase-explorer.md
│
├── quickrefs/                 # Références rapides ON-DEMAND (15)
│   ├── dev/                   # Développement (6)
│   │   ├── Git-Workflow.md
│   │   ├── Docker-Basics.md
│   │   ├── Database-Patterns.md
│   │   ├── Testing-Strategy.md
│   │   ├── Security-Checklist.md
│   │   └── Performance-Tips.md
│   │
│   ├── philosophies/          # Philosophies Shinkofa (5)
│   │   ├── Shinkofa-Vision.md
│   │   ├── Design-Humain-Global.md
│   │   ├── Spiritual-Foundations.md
│   │   ├── Bushido-Ninjutsu-Modern.md
│   │   └── Jedi-Principles.md
│   │
│   └── coaching/              # Méthodes coaching (4)
│       ├── Coaching-Ontologique.md
│       ├── Coaching-Somatique.md
│       ├── Psychology-Tools.md
│       └── Neurodivergence-Inclusivity.md
│
├── checklists/                # Processus répétables (4)
│   ├── PRE-COMMIT.md
│   ├── PRE-DEPLOY.md
│   ├── SESSION-START.md
│   └── SESSION-END.md
│
├── infrastructure/            # Documentation infra (3)
│   ├── PROJECTS-REGISTRY.md
│   ├── VPS-OVH-SETUP.md
│   └── LOCAL-AI-INFRA.md
│
├── hooks/
│   └── settings.json         # Configuration hooks
│
└── templates/                 # Templates par type projet (2)
    ├── CLAUDE-fullstack.md
    └── CLAUDE-coaching.md
```

**Total : 38 fichiers**

---

## 🚀 Comment Utiliser

### 1. Nouveau Projet

```bash
# Créer dossier .claude dans le projet
mkdir -p /mon-projet/.claude

# Copier le template approprié comme CLAUDE.md
cp templates/CLAUDE-fullstack.md /mon-projet/.claude/CLAUDE.md

# Copier core/ (référence)
cp -r core/ /mon-projet/.claude/

# Optionnel : copier skills et agents
cp -r skills/ /mon-projet/.claude/
cp -r agents/ /mon-projet/.claude/
```

### 2. Adapter le CLAUDE.md

Ouvrir `/mon-projet/.claude/CLAUDE.md` et remplir :
- Nom du projet
- Stack technique
- URLs (prod, staging)
- Spécificités

### 3. Session de Travail

```bash
# Début session
claude  # Claude charge automatiquement core/ + CLAUDE.md

# Entre tâches
/clear  # Reset contexte

# Contexte long
/compact  # Résumer et continuer

# Problème
/doctor  # Diagnostic
```

---

## 🎯 Hiérarchie de Chargement

```
1. core/ (TOUJOURS ~8KB)
   └── Profil Jay, Workflow, RAG, Comportement

2. CLAUDE.md du projet (~3KB)
   └── Configuration spécifique

3. skills/ (AUTO selon contexte)
   └── Détectées par mots-clés

4. infrastructure/ (SI VPS/Docker)
   └── Chargé si déploiement

5. quickrefs/ (ON-DEMAND uniquement)
   └── Chargé selon tâche

6. checklists/ (AVANT actions)
   └── PRE-COMMIT, PRE-DEPLOY, SESSION
```

---

## 🔍 Triggers Quickrefs

| Quickref | Quand charger |
|----------|---------------|
| `dev/Git-Workflow.md` | Avant commit, merge, PR |
| `dev/Docker-Basics.md` | Build, debug container |
| `dev/Database-Patterns.md` | Travail DB, migrations |
| `dev/Testing-Strategy.md` | Écriture tests |
| `dev/Security-Checklist.md` | Review sécurité, deploy |
| `dev/Performance-Tips.md` | Optimisation, debug lenteur |
| `philosophies/*` | Dev outils coaching Shinkofa |
| `coaching/*` | Dev features coaching |

---

## 📈 Avantages

1. **Économie tokens** : Core ~8KB vs ~20KB monolithique
2. **Lazy loading** : Quickrefs chargés uniquement si besoin
3. **Modularité** : Mise à jour d'un fichier sans impact global
4. **Auto-découverte** : Skills activées par contexte
5. **Lisibilité** : Fichiers courts et focalisés
6. **Maintenance** : Facile d'ajouter/modifier une section

---

## 🔄 Migration depuis v1.8

1. ✅ `core/` remplace sections identité, profil, workflow
2. ✅ `quickrefs/dev/` remplace best practices inline
3. ✅ `quickrefs/philosophies/` externalise références Shinkofa
4. ✅ `quickrefs/coaching/` externalise méthodes coaching
5. ✅ `checklists/` remplace sections checklist
6. ✅ `infrastructure/` centralise documentation infra
7. ✅ `skills/` + `agents/` ajoutent features Claude Code 2026

---

## 📚 Référence

- **Guide complet** : `Guide-Ultime-Optimisation-Chatbot-IA-2026.md`
- **Ancienne structure** : `Prompt-2026/` (Perplexity)
- **Structure actuelle CLAUDE.md** : `.claude/CLAUDE.md`

---

**Version** : 2.1.0 | **Date** : 2026-01-19 | **Auteur** : TAKUMI pour Jay
