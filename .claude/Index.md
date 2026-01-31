# Index Master — Système d'Instructions

> Répertoire complet de tous les fichiers avec mots-clés pour recherche rapide.

---

## Navigation Rapide

| Section | Fichiers | Description |
|---------|----------|-------------|
| [Core](#core) | 5 | Fondation du système |
| [Agents Core](#agents-core) | 7 | Agents spécialisés principaux |
| [Agents Spécialisés](#agents-spécialisés) | 8 | Agents domaines spécifiques |
| [Skills](#skills) | 8 | Points d'entrée commandes |
| [Templates](#templates) | 8 | Scaffolding projets |
| [Checklists](#checklists) | 4 | Processus répétables |
| [Quickrefs Dev](#quickrefs-dev) | 8 | Références techniques |
| [Quickrefs Philosophies](#quickrefs-philosophies) | 5 | Fondements Shinkofa |
| [Quickrefs Coaching](#quickrefs-coaching) | 4 | Outils accompagnement |
| [Infrastructure](#infrastructure) | 6 | Docs infra & knowledge |
| [Branding](#branding) | 2 | Chartes graphiques |
| [Meta](#meta) | 4 | Index, onboarding, migration |

**Total** : ~70 fichiers

---

## Core

| Fichier | Mots-clés | Description |
|---------|-----------|-------------|
| `core/Profil-Jay.md` | HPI, projecteur, hypersensible, Design Humain, 1/3 | Profil utilisateur complet |
| `core/WORKFLOW.md` | AUDIT, PLAN, CODE, BILAN, énergie, checkpoints | Workflow standard 4 phases |
| `core/AGENT-BEHAVIOR.md` | TAKUMI, comportement, Claude 4.x, invitation, honnêteté | Directives comportementales |
| `core/RAG-CONTEXT.md` | contexte, tokens, chargement, Adaptive RAG, économie | Gestion contexte optimisée |
| `core/Conventions.md` | nommage, commits, branches, style, linguistique | Conventions techniques |

---

## Agents Core

| Fichier | Mots-clés | Déclencheur |
|---------|-----------|-------------|
| `agents/Context-Guardian/AGENT.md` | session, environnement, énergie, PROD, LOCAL | Début session, /context |
| `agents/Build-Deploy-Test/AGENT.md` | build, deploy, test, vérification, preuves | npm build, docker, deploy |
| `agents/Code-Reviewer/AGENT.md` | review, commit, qualité, faits, objectif | Avant commit, /pre-commit |
| `agents/Debug-Investigator/AGENT.md` | debug, bug, erreur, investigation, preuves | Erreur détectée, /debug |
| `agents/Refactor-Safe/AGENT.md` | refactor, petits pas, rollback, validation | Refactor > 3 fichiers |
| `agents/Security-Guardian.md` | sécurité, OWASP, secrets, vulnérabilités | Deploy PROD, /security |
| `agents/Project-Bootstrap/AGENT.md` | nouveau projet, scaffold, structure | /new-project |

**Support** :
| `agents/AGENT-HANDOFF.md` | communication, inter-agents, protocole | Référence handoff |
| `agents/Build-Deploy-Test/error-patterns.md` | erreurs, patterns, solutions | Référence erreurs |

---

## Agents Spécialisés

| Fichier | Mots-clés | Usage |
|---------|-----------|-------|
| `agents/Ai-Ml-Agent.md` | IA, ML, Ollama, LangChain, RAG, embeddings | Projets IA/ML |
| `agents/Codebase-Explorer.md` | exploration, architecture, patterns | Comprendre codebase |
| `agents/Dependency-Auditor.md` | dépendances, versions, breaking changes | Audit deps |
| `agents/Desktop-App-Agent.md` | Electron, CustomTkinter, desktop | Apps desktop |
| `agents/Electron-Agent.md` | Electron, IPC, main/renderer | Spécifique Electron |
| `agents/Frontend-Auditor.md` | React, Vue, performance, accessibilité | Audit frontend |

---

## Skills

| Fichier | Commande | Mots-clés |
|---------|----------|-----------|
| `skills/Context/SKILL.md` | /context | session, état, environnement |
| `skills/Debug/SKILL.md` | /debug | investigation, erreur, root cause |
| `skills/Deploy/SKILL.md` | /deploy | déploiement, vérification, PROD |
| `skills/Pre-Commit/SKILL.md` | /pre-commit | review, qualité, commit |
| `skills/Session-Manager/SKILL.md` | /session-end | session, sauvegarde, résumé |
| `skills/Test-Writer/SKILL.md` | /test | tests, génération, couverture |
| `skills/Knowledge-Capture/SKILL.md` | - | leçons, documentation, capture |
| `skills/Project-Registry-Update/SKILL.md` | - | registre, projets, metadata |

---

## Templates

| Fichier | Mots-clés | Usage |
|---------|-----------|-------|
| `templates/CLAUDE-PROJECT.md` | baseline, général | Tout projet |
| `templates/CLAUDE-Fullstack.md` | Next.js, FastAPI, DB | Fullstack web |
| `templates/CLAUDE-Frontend.md` | React, Vue, TypeScript | Frontend SPA |
| `templates/CLAUDE-Desktop.md` | Electron, CustomTkinter | Apps desktop |
| `templates/CLAUDE-Coaching.md` | Shinkofa, coaching | Apps coaching |
| `templates/CLAUDE-Tooling.md` | CLI, utilitaires | Outils ligne commande |
| `templates/CLAUDE-Website.md` | statique, vitrine | Sites simples |
| `templates/session-state.md` | session, environnement, état | Template session |

---

## Checklists

| Fichier | Mots-clés | Usage |
|---------|-----------|-------|
| `checklists/Session-Start.md` | début, session, contexte | Démarrer session |
| `checklists/Pre-Commit.md` | commit, qualité, vérification | Avant commit |
| `checklists/Pre-Deploy.md` | deploy, production, vérification | Avant deploy |
| `checklists/Session-End.md` | fin, sauvegarde, résumé | Terminer session |

---

## Quickrefs Dev

| Fichier | Mots-clés |
|---------|-----------|
| `quickrefs/dev/Git-Workflow.md` | git, commits, branches, PR |
| `quickrefs/dev/Docker-Basics.md` | docker, containers, compose |
| `quickrefs/dev/Database-Patterns.md` | SQL, PostgreSQL, migrations |
| `quickrefs/dev/Testing-Strategy.md` | tests, pytest, Jest, coverage |
| `quickrefs/dev/Security-Checklist.md` | sécurité, OWASP, validation |
| `quickrefs/dev/Performance-Tips.md` | performance, optimisation |
| `quickrefs/dev/Claude-Commands.md` | commandes, raccourcis, Claude Code |
| `quickrefs/dev/Commands-Guide.md` | slash commands, skills, agents |

---

## Quickrefs Philosophies

| Fichier | Mots-clés |
|---------|-----------|
| `quickrefs/philosophies/Shinkofa-Vision.md` | Shinkofa, 5 piliers, valeurs |
| `quickrefs/philosophies/Design-Humain-Global.md` | Design Humain, types, centres |
| `quickrefs/philosophies/Spiritual-Foundations.md` | méditation, présence, spirituel |
| `quickrefs/philosophies/Bushido-Ninjutsu-Modern.md` | bushido, ninja, éthique |
| `quickrefs/philosophies/Jedi-Principles.md` | Jedi, équilibre, sagesse |

---

## Quickrefs Coaching

| Fichier | Mots-clés |
|---------|-----------|
| `quickrefs/coaching/Coaching-Ontologique.md` | ontologie, questions puissantes |
| `quickrefs/coaching/Coaching-Somatique.md` | corps, ancrage, somatique |
| `quickrefs/coaching/Psychology-Tools.md` | psychologie, CBT, patterns |
| `quickrefs/coaching/Neurodivergence-Inclusivity.md` | TDAH, HPI, autisme, accessibilité |

---

## Infrastructure

| Fichier | Mots-clés |
|---------|-----------|
| `infrastructure/VPS-OVH-SETUP.md` | VPS, OVH, serveur, ports, SSL |
| `infrastructure/Local-Ai-Infra.md` | local, RTX 3060, Ollama |
| `infrastructure/Projects-Registry.md` | projets, liste, statuts |
| `infrastructure/Lessons-Learned.md` | erreurs, solutions, patterns |
| `infrastructure/Knowledge-Hub.md` | knowledge, cross-projet |
| `infrastructure/O2Switch-Hosting.md` | O2Switch, hosting alternatif |

---

## Branding

| Fichier | Mots-clés |
|---------|-----------|
| `branding/Charte-Graphique-Shinkofa-V2.0.md` | Shinkofa, couleurs, typo, logo |
| `branding/Charte-The-Ermite-V0.3.md` | The Ermite, branding personnel |

---

## Meta

| Fichier | Mots-clés |
|---------|-----------|
| `INDEX.md` | index, recherche, navigation |
| `ONBOARDING.md` | démarrage, guide, premiers pas |
| `MIGRATION-v2-v3.md` | migration, upgrade, changements |
| `quickrefs/Index.md` | quickrefs, navigation, chargement |

---

## Recherche par Besoin

### "Je veux..."

| Besoin | Fichier(s) |
|--------|------------|
| Démarrer un projet | `templates/CLAUDE-*.md`, `agents/Project-Bootstrap/` |
| Comprendre le workflow | `core/WORKFLOW.md` |
| Faire un commit | `checklists/Pre-Commit.md`, `agents/Code-Reviewer/` |
| Déployer en prod | `checklists/Pre-Deploy.md`, `agents/Build-Deploy-Test/` |
| Débugger une erreur | `agents/Debug-Investigator/`, `/debug` |
| Refactorer du code | `agents/Refactor-Safe/` |
| Vérifier la sécurité | `agents/Security-Guardian.md` |
| Apprendre les commandes | `quickrefs/dev/Claude-Commands.md` |
| Configurer le VPS | `infrastructure/VPS-OVH-SETUP.md` |
| Voir les erreurs passées | `infrastructure/Lessons-Learned.md` |

---

## Stats

| Catégorie | Fichiers | ~Tokens |
|-----------|----------|---------|
| Core | 5 | ~5,000 |
| Agents | 15 | ~12,000 |
| Skills | 8 | ~3,000 |
| Templates | 8 | ~4,000 |
| Checklists | 4 | ~2,000 |
| Quickrefs | 17 | ~8,500 |
| Infrastructure | 6 | ~5,000 |
| Branding | 2 | ~2,000 |
| Meta | 4 | ~2,000 |
| **Total** | **~70** | **~43,500** |

---

**Version** : 1.0 | **Date** : 2026-01-24
