# Knowledge Hub - Centre de Connaissances Jay

> Point central reliant infrastructure, projets, instructions et leçons apprises.
> **Objectif** : Ne jamais refaire les mêmes erreurs, capitaliser sur l'expérience.

---

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      KNOWLEDGE HUB                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ PROJETS      │    │ INFRA        │    │ INSTRUCTIONS │       │
│  │ Registry     │◄──►│ VPS/Local    │◄──►│ Claude Code  │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         └─────────┬─────────┴─────────┬─────────┘                │
│                   │                   │                          │
│                   ▼                   ▼                          │
│         ┌──────────────────────────────────┐                     │
│         │      LESSONS LEARNED             │                     │
│         │  (Erreurs → Solutions → Patterns) │                     │
│         └──────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fichiers Clés (Ce Dépôt)

### Infrastructure
| Fichier | Contenu | Mise à jour |
|---------|---------|-------------|
| `Projects-Registry.md` | Liste projets, statuts, priorités | Chaque nouveau projet |
| `Vps-Ovh-Setup.md` | Config VPS, Docker, ports, SSL | Changement infra |
| `Local-Ai-Infra.md` | Machines locales, GPU, Ollama | Changement hardware |
| `O2switch-Hosting.md` | Hébergement sites statiques | Nouveau site |
| **`Lessons-Learned.md`** | **Erreurs et solutions centralisées** | **Après chaque erreur** |

### Instructions Claude
| Fichier | Usage |
|---------|-------|
| `core/Profil-Jay.md` | Profil utilisateur (ne change pas) |
| `core/Workflow.md` | Process de travail standard |
| `core/Agent-Behavior.md` | Comment Claude doit se comporter |
| `quickrefs/Index.md` | Navigation vers toutes les refs |

---

## Liens Entre Projets

### Par Stack Technique
```
TypeScript/Next.js
├── shinkofa-platform
├── SLF-Esport
└── toolbox-theermite

Python/Desktop
├── Hibiki-Dictate (CustomTkinter)
└── WinAdminTE (en pause)

Electron/JavaScript
└── Ermite-Podcaster

Python/IA
└── Shizen-Koshin-MVP (LangChain + Ollama)
```

### Par Domaine Métier
```
Shinkofa (Marque Coaching)
├── shinkofa-platform (App principale)
├── Shizen-Koshin-MVP (IA coaching)
└── KnowledgeBase-CoachingShinkofa (en pause)

The Ermite (Personnel)
├── toolbox-theermite (Jeux cognitifs)
├── Hibiki-Dictate (Speech-to-text)
├── Ermite-Podcaster (Montage podcast)
└── Instruction-Claude-Code (Ce dépôt)

SLF Esport
└── SLF-Esport (Plateforme esport)
```

### Dépendances Croisées
```
shinkofa-platform
└── Utilise : Pattern auth de SLF-Esport

toolbox-theermite
└── Peut être intégré dans : shinkofa-platform

Shizen-Koshin-MVP
└── Backend IA pour : shinkofa-platform (futur)

Instruction-Claude-Code
└── Configure TOUS les autres projets
```

---

## Workflow de Capitalisation

### Quand Documenter une Leçon

```
TRIGGER → CAPTURE → CATEGORIZE → LINK → APPLY
```

**Triggers** (moments où capturer) :
1. ❌ Bug résolu après debug long (> 30 min)
2. 🔄 Pattern répété dans plusieurs projets
3. 💡 Solution élégante trouvée
4. ⚠️ Erreur de déploiement
5. 📚 Découverte documentation importante
6. 🔒 Faille sécurité corrigée

### Comment Capturer

**Option 1** : Dire à Claude
```
"Documente cette leçon dans Lessons-Learned.md :
[description de l'erreur et solution]"
```

**Option 2** : Utiliser le skill Knowledge-Capture
```
"Capture cette leçon" → Skill pose les bonnes questions
```

**Option 3** : Manuellement après session
```
En fin de session, revoir les problèmes rencontrés
et documenter les plus significatifs.
```

---

## Navigation Rapide

### Je cherche...

| Besoin | Fichier |
|--------|---------|
| Config d'un projet | `Projects-Registry.md` |
| Comment déployer sur VPS | `Vps-Ovh-Setup.md` + `quickrefs/dev/Docker-Basics.md` |
| Erreur déjà rencontrée | `Lessons-Learned.md` |
| Comment Claude doit m'aider | `core/Agent-Behavior.md` |
| Quickref technique | `quickrefs/Index.md` → navigation |
| Philosophie Shinkofa | `quickrefs/philosophies/Shinkofa-Vision.md` |

### Par Situation

| Situation | Action |
|-----------|--------|
| Nouveau projet | `setup-project.ps1` + `Projects-Registry.md` |
| Debug complexe | `Lessons-Learned.md` (chercher similaire) |
| Avant deploy | `checklists/Pre-Deploy.md` + `Lessons-Learned.md` (erreurs deploy) |
| Refactoring | `skills/Refactoring-Planner/` + leçons "refactoring" |
| Mise à jour deps | `agents/Dependency-Auditor.md` + leçons "migration" |

---

## Métriques Santé Écosystème

### À Vérifier Mensuellement

| Check | Commande/Action |
|-------|-----------------|
| Projets actifs à jour | Parcourir `Projects-Registry.md` |
| SSL certificates | Vérifier dates dans `Vps-Ovh-Setup.md` |
| Dépendances | Lancer Dependency-Auditor sur chaque projet |
| Leçons récentes | Relire dernières entrées `Lessons-Learned.md` |
| Instructions à jour | Vérifier version dans `CLAUDE.md` |

### KPIs Leçons Apprises

```
📊 Objectif :
- 1 leçon documentée par semaine minimum
- 0 erreur répétée (si déjà documentée)
- Consultation avant chaque nouveau projet
```

---

## Évolution Future

### Court Terme
- [ ] Ajouter tags/catégories aux leçons pour recherche
- [ ] Script de recherche dans Lessons-Learned

### Moyen Terme
- [ ] Dashboard web des projets (statuts, santé)
- [ ] Alertes automatiques (SSL expiring, deps outdated)

### Long Terme
- [ ] IA qui suggère leçons pertinentes selon contexte
- [ ] Analyse patterns récurrents automatique

---

**Dernière mise à jour** : 2026-01-20
**Responsable** : Jay (maintenu via Claude Code)
