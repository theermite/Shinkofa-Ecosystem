---
name: session-manager
description: Gestion optimale des sessions de travail. Utiliser en début ("nouvelle session"), en fin ("on arrête", "clôture session", "/session-end"), ou quand Jay mentionne son énergie.
allowed-tools:
  - Read
  - Write
  - Bash
user-invocable: true
---

# Session Manager

## Mission
Optimiser les sessions de travail en respectant l'énergie de Jay et en maintenant la continuité entre sessions.

## Commandes Rapides

| Trigger | Action |
|---------|--------|
| "nouvelle session" / "on commence" | Démarrage structuré |
| "on arrête" / "pause" / "clôture" | Fin de session complète |
| "/session-end" | Clôture rapide avec commit/push |
| "énergie X" | Adaptation mode travail |

---

## Début de Session

### Questions Obligatoires
```
📍 1. Environnement ?
   [ ] Windows CLI (Ermite-Game)
   [ ] VPS SSH (OVH)
   [ ] Kubuntu CLI (Dell-Ermite)

🎯 2. Type projet ?
   [ ] Personnel (Copyright The Ermite)
   [ ] Shinkofa (Copyright La Voie Shinkofa)

🏗️ 3. Nature ?
   [ ] Desktop App
   [ ] Web App
   [ ] CLI Tool
   [ ] Shizen-Koshin (IA)

📂 4. État ?
   [ ] Nouveau
   [ ] En cours (lire PLAN-DEV-TEMPORAIRE.md)
   [ ] Debug
   [ ] Refactoring

⚡ 5. Énergie (1-10) ?
   1-4 → Session courte (30-45 min)
   5-7 → Session normale (60-90 min)
   8-10 → Session longue possible

🎯 6. Objectif session ?
```

### Adaptation Automatique

| Énergie | Mode | Checkpoints | Tâches |
|---------|------|-------------|--------|
| 1-4 | Basse | 15 min | Simples uniquement |
| 5-7 | Normale | 30 min | Features, refactor moyen |
| 8-10 | Haute | 60 min | Architecture, grosses features |

### Si Projet En Cours
```bash
# Vérifier automatiquement
1. Lire PLAN-DEV-TEMPORAIRE.md si existe
2. git status
3. Proposer: continuer le plan OU nouveau plan
```

---

## Fin de Session — Protocole Complet

### Commande: "/session-end" ou "clôture session"

**Workflow automatique** :

```
┌─────────────────────────────────────────────────┐
│           CLÔTURE SESSION                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. 📊 BILAN                                    │
│     → Résumer ce qui a été fait                 │
│     → Lister ce qui reste                       │
│                                                  │
│  2. 📝 DOCUMENTATION                            │
│     → Mettre à jour PLAN-DEV-TEMPORAIRE.md      │
│     → Capturer leçons si pertinent              │
│                                                  │
│  3. 💾 GIT                                      │
│     → git status                                │
│     → Commit si changements stables             │
│     → Push si validé par Jay                    │
│                                                  │
│  4. 📋 NEXT STEPS                               │
│     → Actions prioritaires pour prochaine fois  │
│                                                  │
│  5. 🔄 REGISTRE (si pertinent)                  │
│     → Mettre à jour Projects-Registry.md        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Format Output Clôture

```markdown
## 🏁 Clôture Session — [DATE]

### 📊 Bilan
**Durée estimée** : ~Xh
**Projet** : [nom-projet]
**Branche** : [branch]
**Environnement** : [PROD|ALPHA|LOCAL]

#### ✅ Accompli
- [x] [Tâche 1]
- [x] [Tâche 2]
- [x] [Tâche 3]

#### 🚧 En cours / Incomplet
- [ ] [Tâche avec état actuel]

### 🤖 Agents Utilisés Cette Session

| Agent | Invocations | Résultat |
|-------|-------------|----------|
| Context-Guardian | [n] | ✅/⚠️/❌ [résumé] |
| Code-Reviewer | [n] | ✅/⚠️/❌ [résumé] |
| Build-Deploy-Test | [n] | ✅/⚠️/❌ [résumé] |
| Security-Guardian | [n] | ✅/⚠️/❌ [résumé] |
| Debug-Investigator | [n] | ✅/⚠️/❌ [résumé] |
| Refactor-Safe | [n] | ✅/⚠️/❌ [résumé] |

**Agents manquants ?** : [Si un agent aurait dû être utilisé mais ne l'a pas été]

### 💾 Git Status
```
[output git status]
```

**Commit suggéré** : `[TYPE] description`
**Prêt à push** : Oui/Non

### 📋 Next Steps (Prochaine Session)
1. **Priorité haute** : [action]
2. **Priorité moyenne** : [action]
3. **Si temps** : [action]

### 💡 Leçons / Notes
- [Si quelque chose d'important appris]
- **À documenter dans Lessons-Learned.md ?** : Oui/Non

### ⚠️ Points d'Attention
- [Problèmes non résolus]
- [Dépendances bloquantes]

---
*PLAN-DEV-TEMPORAIRE.md mis à jour : ✅/❌*
*session-state.md mis à jour : ✅/❌*
*Commit effectué : ✅/❌*
*Push effectué : ✅/❌*
*Leçons documentées : ✅/❌/N/A*
```

### Questions de Clôture

Claude demande :
```
1. Je commit les changements ? (Oui/Non/Seulement certains)
2. Je push vers origin ? (Oui/Non)
3. Des leçons à documenter ? (Description ou Non)
4. Mettre à jour le registre projets ? (Oui si changement significatif)
```

---

## Fichiers État

### PLAN-DEV-TEMPORAIRE.md
**Emplacement** : Racine du projet actif

```markdown
# Plan Dev Temporaire - [NOM_PROJET]

> Continuité entre sessions. Supprimer après feature complète.

## État Actuel
- **Dernière session** : [DATE HEURE]
- **Branch** : [nom-branch]
- **Statut** : [En cours / Bloqué / À valider]
- **Contexte utilisé** : [X]% (pour info)

## Objectif en Cours
[Description claire]

## Décisions Prises Cette Session
- [Décision 1 + raison]
- [Décision 2 + raison]

## Next Steps Immédiats
1. [ ] [Étape 1]
2. [ ] [Étape 2]
3. [ ] [Étape 3]

## Questions Ouvertes
- [ ] [Question nécessitant réponse]

## Notes Techniques
[Snippets, commandes, références utiles]

## Fichiers Modifiés
- `path/file1.ts` : [résumé changement]
- `path/file2.py` : [résumé changement]
```

**Règles** :
- Créer dès feature multi-sessions
- NE PAS committer (dans .gitignore)
- Supprimer après merge feature

---

## Gestion Interruptions

Si Jay doit partir soudainement :

```
1. Sauvegarder immédiatement
   → Créer/màj PLAN-DEV-TEMPORAIRE.md

2. Commit WIP si code compilable
   → git add -A && git commit -m "[WIP] [description état]"

3. Résumé ultra-rapide
   → "État: [X], Next: [Y], Attention: [Z]"

4. Rassurer
   → "Pas de souci, tout est sauvé, on reprend quand tu veux"
```

---

## Intégration Autres Skills

| Situation | Skill à Invoquer |
|-----------|------------------|
| Leçon à documenter | Knowledge-Capture |
| Registre à màj | Project-Registry-Update |
| Erreur résolue | Knowledge-Capture |
| Avant deploy | Deployment (checklist) |

---

## Contraintes

- TOUJOURS proposer commit avant de quitter
- JAMAIS push sans confirmation explicite
- Résumé clair même si session courte
- Mettre à jour PLAN-DEV-TEMPORAIRE.md systématiquement
