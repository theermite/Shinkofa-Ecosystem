# Agent Handoff Protocol

> Protocole formel de communication entre agents.

---

## Principe

Quand un agent délègue à un autre, il doit passer un **contexte structuré** pour que l'agent receveur comprenne la situation.

---

## Format Handoff

```markdown
## HANDOFF → [Agent Cible]

### Contexte Session
- **Projet** : [nom]
- **Environnement** : [PROD|LOCAL]
- **Branche** : [branch]
- **Énergie Jay** : [1-10]

### Raison Délégation
[Pourquoi cet agent est appelé]

### État Actuel
[Ce qui a été fait jusqu'ici]

### Attente
[Ce que l'agent source attend comme résultat]

### Fichiers Pertinents
- [path/file1]
- [path/file2]
```

---

## Matrice de Handoff

| Agent Source | Agent Cible | Déclencheur | Contexte Requis |
|--------------|-------------|-------------|-----------------|
| **Context-Guardian** | Build-Deploy-Test | Deploy demandé | Env, projet, branche |
| **Build-Deploy-Test** | Security-Guardian | Deploy PROD | Env=PROD confirmé |
| **Build-Deploy-Test** | Debug-Investigator | Build/test fail | Erreur, logs |
| **Code-Reviewer** | Debug-Investigator | Bug détecté | Fichier, ligne, code |
| **Code-Reviewer** | Security-Guardian | Vuln potentielle | Fichier, pattern |
| **Refactor-Safe** | Code-Reviewer | Étape terminée | Fichiers modifiés |
| **Debug-Investigator** | Refactor-Safe | Fix = refactor | Cause, scope |

---

## Handoffs Spécifiques

### Context-Guardian → Build-Deploy-Test

```markdown
## HANDOFF → Build-Deploy-Test

### Contexte Session
- **Projet** : shinkofa-platform
- **Environnement** : PROD ← VÉRIFIÉ
- **Branche** : main
- **Énergie Jay** : 7

### Raison Délégation
Jay a demandé `/deploy` et l'environnement est confirmé.

### Attente
Cycle deploy complet avec vérification post-deploy.
Retourner : SUCCESS | FAILED + détails
```

---

### Build-Deploy-Test → Security-Guardian

```markdown
## HANDOFF → Security-Guardian

### Contexte Session
- **Environnement** : PROD
- **Action** : Deploy en attente

### Raison Délégation
Deploy PROD requiert scan sécurité obligatoire.

### Attente
Scan complet OWASP.
Retourner : PASS | WARNING | BLOCKED + rapport

### Si BLOCKED
Ne PAS continuer le deploy. Retourner à Jay.
```

---

### Build-Deploy-Test → Debug-Investigator

```markdown
## HANDOFF → Debug-Investigator

### Contexte Session
- **Projet** : [nom]
- **Action** : Build/Test failed

### Raison Délégation
Erreur détectée pendant [build|test|deploy].

### Erreur
```
[Stack trace / error message complet]
```

### Fichiers Suspects
- [path/file] — Dernière modification

### Attente
Diagnostic avec PREUVE de la cause.
Retourner : Cause + Fix proposé
```

---

### Code-Reviewer → Security-Guardian

```markdown
## HANDOFF → Security-Guardian

### Contexte Session
- **Fichier** : [path]
- **Ligne** : [n]

### Raison Délégation
Pattern de sécurité suspect détecté pendant review.

### Code Suspect
```[code]```

### Pattern Détecté
[SQL injection | XSS | Secret exposé | etc.]

### Attente
Confirmation vulnérabilité + sévérité.
```

---

## Retour d'Agent

Quand un agent termine, il retourne un **résultat structuré** :

```markdown
## RETOUR ← [Agent Source]

### Résultat
[SUCCESS | FAILED | WARNING | BLOCKED]

### Résumé
[1-2 phrases]

### Détails
[Rapport complet si applicable]

### Actions Effectuées
- [x] [Action 1]
- [x] [Action 2]

### Recommandations
- [Si applicable]
```

---

## Tracking Agents (Fin de Session)

À la fin de chaque session, lister les agents utilisés :

```markdown
## 📊 Agents Utilisés Cette Session

| Agent | Invocations | Résultat |
|-------|-------------|----------|
| Context-Guardian | 1 | ✅ Session initialisée |
| Code-Reviewer | 2 | ✅ 2 reviews clean |
| Build-Deploy-Test | 1 | ✅ Deploy réussi |
| Security-Guardian | 1 | ⚠️ 2 warnings |

### Agents NON Utilisés (Applicable?)
- Debug-Investigator — Pas d'erreur
- Refactor-Safe — Pas de refactoring
```

Ceci permet de :
1. Vérifier que les agents appropriés ont été utilisés
2. Identifier si un agent a été "oublié"
3. Améliorer les triggers automatiques

---

**Version** : 1.0 | **Date** : 2026-01-24
