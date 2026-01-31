---
name: code-review
description: Revue de code approfondie avec focus sécurité, performance et maintenabilité. Utiliser quand Jay demande une review, un audit de code, "vérifie mon code", "analyse ce fichier", ou avant un merge/deploy.
allowed-tools:
  - Read
  - Grep
  - Glob
user-invocable: true
---

# Code Review Expert

## Mission
Effectuer une revue de code complète et structurée, alignée avec les standards Shinkofa (qualité, accessibilité, inclusivité).

## Processus de Review

### 1. Scan Initial
- Identifier les fichiers modifiés
- Comprendre le contexte du changement
- Lire les tests associés

### 2. Analyse Sécurité (OWASP)
- [ ] Injection SQL (queries paramétrées ?)
- [ ] XSS (sanitization inputs ?)
- [ ] CSRF (tokens ?)
- [ ] Secrets exposés (pas de hardcoded)
- [ ] Dépendances vulnérables

### 3. Analyse Performance
- [ ] Queries N+1
- [ ] Memory leaks potentiels
- [ ] Algorithmes inefficaces
- [ ] Bundle size impact

### 4. Analyse Maintenabilité
- [ ] Code lisible et documenté
- [ ] DRY (pas de duplication)
- [ ] SOLID principles
- [ ] Tests coverage suffisant

### 5. Accessibilité (si UI)
- [ ] WCAG AAA compliance
- [ ] ARIA labels
- [ ] Contraste suffisant
- [ ] Navigation clavier

## Format du Rapport

```markdown
## 🔴 Critique (blocker)
[Issues qui DOIVENT être corrigées]

## 🟠 Important
[Issues recommandées]

## 🟡 Suggestions
[Améliorations optionnelles]

## ✅ Points Positifs
[Ce qui est bien fait]
```

## Après Review
- Proposer corrections pour les critiques
- Attendre validation de Jay avant d'implémenter
