---
title: Guide Workflow Quotidien - Développement Shinkofa
version: 1.0
created: 2026-01-30
status: actif
type: Guide
usage: Référence rapide pour le développement quotidien
---

# Guide Workflow Quotidien

> Comment utiliser Claude Code efficacement pour développer l'écosystème Shinkofa.

---

## Démarrage Rapide

### Lancer une session de dev

```bash
# Option 1 : Depuis la racine du monorepo
cd D:\30-Dev-Projects\Shinkofa-Ecosystem
claude

# Option 2 : Depuis une app spécifique
cd D:\30-Dev-Projects\Shinkofa-Ecosystem\apps\michi
claude
```

### Première phrase à dire

| Tu veux... | Dis... |
|------------|--------|
| Travailler sur Michi | "Je veux travailler sur Michi" |
| Développer Shizen | "Je veux développer Shizen (prompts, RAG)" |
| Corriger un bug | "Il y a un bug sur [description]" |
| Ajouter une feature | "Je veux ajouter [feature]" |
| Faire un audit | "/audit" |
| Déployer | "/deploy" |

---

## Commandes Slash Utiles

### Développement

| Commande | Action |
|----------|--------|
| `/audit` | Audit qualité complet (conventions, structure, code) |
| `/pre-commit` | Review obligatoire avant commit |
| `/deploy` | Cycle deploy complet avec vérifications |
| `/debug` | Investigation bug avec preuves |

### Documentation

| Commande | Action |
|----------|--------|
| `/doc-generate` | Générer documentation complète |
| `/doc-update` | Mise à jour incrémentielle |
| `/doc-check` | Vérifier docs obsolètes |

### Planification

| Commande | Action |
|----------|--------|
| `/plan-project <desc>` | Générer plan d'implémentation |

---

## Workflow Standard

```
1. AUDIT   → Claude lit les fichiers, comprend le contexte
2. PLAN    → Claude propose 2-3 options, TU VALIDES
3. CODE    → Petits commits, tests inclus
4. BILAN   → Résumé des changements, next steps
```

**Point clé** : Claude te demande toujours "Valides-tu ce plan ?" avant de coder.

---

## Structure du Monorepo

```
Shinkofa-Ecosystem/
├── apps/
│   ├── michi/           # Plateforme coaching (Next.js)
│   ├── api-auth/        # API authentification (FastAPI)
│   ├── api-shizen/      # API Shizen IA (FastAPI)
│   ├── slf-esport/      # Académie gaming (React + FastAPI)
│   ├── takumi-kit/      # Toolbox (en dev)
│   └── [autres stubs]/  # Projets futurs
├── docker/              # Docker configs production
├── docs/                # Documentation centralisée
└── .claude/             # Instructions Claude
```

---

## Développer Shizen (IA)

Shizen utilise DeepSeek API. Le développement = **prompting + RAG**.

### Fichiers clés

```
apps/api-shizen/app/services/
├── shizen_agent_service.py  # 🧠 Logique + prompts
├── shizen_tools.py          # 🔧 Outils/capacités
├── deepseek_service.py      # 🤖 Intégration LLM
└── conversation_service.py  # 💬 Gestion conversations
```

### Ce que tu fais

| Tâche | Où |
|-------|-----|
| Modifier la personnalité | `shizen_agent_service.py` |
| Ajouter des connaissances | RAG / base de données |
| Ajouter des capacités | `shizen_tools.py` |

---

## Déploiement VPS

### Depuis local vers production

```bash
# 1. Local : commit et push
git add . && git commit -m "feat: description" && git push

# 2. VPS : pull et redémarrer
ssh vps
cd ~/Shinkofa-Ecosystem
git pull
cd docker && docker compose -f docker-compose.prod.yml up -d --build
```

### Commandes VPS utiles

```bash
# État des services
docker ps

# Logs d'un service
docker logs -f shinkofa_web_prod

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart web
```

---

## Conventions à Respecter

### Nommage fichiers (.md)

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| `Guide-Workflow.md` | `GUIDE-WORKFLOW.md` |
| `Session-Notes.md` | `session-notes.md` |

**Règle** : Title-Kebab-Case (jamais TOUT EN MAJUSCULES)

### Commits

```bash
# Format
<type>: <description courte>

# Types
feat:     Nouvelle fonctionnalité
fix:      Correction bug
docs:     Documentation
refactor: Refactoring sans changement fonctionnel
chore:    Maintenance, config
```

---

## Agents Disponibles

| Agent | Quand | Déclencheur |
|-------|-------|-------------|
| **Quality-Auditor** | Audit complet | `/audit` |
| **Code-Reviewer** | Avant commit | `/pre-commit` |
| **Debug-Investigator** | Bug à résoudre | `/debug` |
| **Build-Deploy-Test** | Déploiement | `/deploy` |
| **Security-Guardian** | Deploy PROD | Automatique |
| **Project-Planner** | Nouvelle feature | `/plan-project` |

---

## Bonnes Pratiques

### Ce que Claude fait automatiquement

- ✅ Respecte les conventions de nommage
- ✅ Propose un plan AVANT de coder
- ✅ Fait des petits commits
- ✅ Vérifie la sécurité (OWASP)
- ✅ Teste avant de livrer

### Ce que TU dois faire

- ✅ Valider les plans proposés
- ✅ Donner du contexte sur ce que tu veux
- ✅ Dire quand tu es fatigué (Claude adapte)
- ✅ Relire les changements importants

---

## En cas de problème

### Claude ne comprend pas

```
"Attends, je reformule : [explication plus claire]"
```

### Claude fait une erreur

```
"Stop. Tu as fait [erreur]. Corrige en faisant [correction]."
```

### Besoin de contexte

```
"Lis d'abord [fichier] pour comprendre le contexte."
```

---

## Checklist Début de Session

```
□ Je suis dans le bon dossier (monorepo ou app spécifique)
□ J'ai dit à Claude sur quoi je veux travailler
□ J'ai donné le contexte nécessaire
□ Je suis prêt à valider les plans proposés
```

---

*Guide vivant - Mis à jour selon les besoins*
