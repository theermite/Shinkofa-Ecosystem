# Index des Quickrefs

> Navigation rapide pour charger le bon quickref au bon moment.

---

## Comment Utiliser

Les quickrefs sont **chargés à la demande** pour économiser le contexte. Charge uniquement ce dont tu as besoin pour la tâche en cours.

**Syntaxe** : Demande à Claude de charger `quickrefs/[catégorie]/[fichier].md`

---

## Dev — Références Techniques

| Quickref | Charger Quand | Contenu Principal |
|----------|---------------|-------------------|
| `dev/Git-Workflow.md` | Commits, branches, PRs, conflits | Conventional commits, branching strategy, commandes |
| `dev/Docker-Basics.md` | Build, deploy, debug containers | Dockerfile, docker-compose, commandes essentielles |
| `dev/Database-Patterns.md` | Travail DB, migrations, queries | SQLite, PostgreSQL, Prisma, SQLAlchemy, optimisation |
| `dev/Testing-Strategy.md` | Écriture tests, coverage | Unit, integration, e2e, mocking patterns |
| `dev/Security-Checklist.md` | Audit sécurité, avant deploy prod | OWASP, validation inputs, auth, headers |
| `dev/Performance-Tips.md` | Optimisation, profiling | Frontend perf, backend perf, DB queries |
| `dev/Claude-Commands.md` | Commandes Claude Code, premiers pas | Slash commands, raccourcis, MCP, config |
| `dev/Commands-Guide.md` | Liste complète commandes slash | Tous les /commands disponibles, skills, agents |

---

## Philosophies — Fondements Shinkofa

| Quickref | Charger Quand | Contenu Principal |
|----------|---------------|-------------------|
| `philosophies/Shinkofa-Vision.md` | Développement outils Shinkofa | 5 piliers, valeurs, applications concrètes |
| `philosophies/Design-Humain-Global.md` | Personnalisation UX par type | 5 types, 9 centres, profils, autorités |
| `philosophies/Spiritual-Foundations.md` | Contenu spirituel/philosophique | Méditation, présence, non-jugement |
| `philosophies/Bushido-Ninjutsu-Modern.md` | Éthique, discipline, adaptabilité | Code guerrier moderne, principes ninja |
| `philosophies/Jedi-Principles.md` | Équilibre, sagesse, service | Code Jedi appliqué au développement |

---

## Coaching — Outils Accompagnement

| Quickref | Charger Quand | Contenu Principal |
|----------|---------------|-------------------|
| `coaching/Coaching-Ontologique.md` | Questionnaires transformation | Questions puissantes, shifts de conscience |
| `coaching/Coaching-Somatique.md` | Intégration corps, ressenti | Body-based coaching, ancrage |
| `coaching/Psychology-Tools.md` | Outils psycho, modèles mentaux | CBT, patterns comportementaux |
| `coaching/Neurodivergence-Inclusivity.md` | Design accessible tous profils | TDAH, HPI, autisme, dyslexie, design universel |

---

## Combinaisons Recommandées par Projet

### Fullstack Web (shinkofa-platform, SLF-Esport)
```
core/* (toujours)
+ dev/Git-Workflow.md
+ dev/Docker-Basics.md
+ dev/Database-Patterns.md
+ dev/Security-Checklist.md
```

### Outils Coaching (Shizen-Koshin)
```
core/* (toujours)
+ philosophies/Shinkofa-Vision.md
+ philosophies/Design-Humain-Global.md
+ coaching/Coaching-Ontologique.md
+ coaching/Neurodivergence-Inclusivity.md
```

### Site Vitrine
```
core/* (toujours)
+ dev/Git-Workflow.md
+ dev/Performance-Tips.md
```

### Desktop App (Hibiki-Dictate, Ermite-Podcaster)
```
core/* (toujours)
+ dev/Git-Workflow.md
+ dev/Testing-Strategy.md
```

### CLI / Tooling
```
core/* (toujours)
+ dev/Git-Workflow.md
+ dev/Testing-Strategy.md
```

---

## Taille Approximative

| Catégorie | Fichiers | ~Tokens Total |
|-----------|----------|---------------|
| dev/ | 8 | ~4,000 |
| philosophies/ | 5 | ~2,500 |
| coaching/ | 4 | ~2,000 |
| **Total quickrefs** | **17** | **~8,500** |

**Note** : Ne charge que ce qui est nécessaire. 2-3 quickrefs par session = optimal.

---

**Version** : 1.0 | **Dernière MAJ** : 2026-01-20
