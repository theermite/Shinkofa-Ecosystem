# Known Issues - [Nom Projet]

> Liste des bugs connus, limitations et workarounds disponibles.

**Dernière mise à jour** : [DATE]

---

## 🚨 Issues Critiques

### Issue #1 : [Titre Issue Critique]

**Sévérité** : 🔴 CRITIQUE

**Description** :
[Description détaillée du problème]

**Impact** :
- [Impact 1]
- [Impact 2]

**Reproduction** :
```
1. [Step 1]
2. [Step 2]
3. [Résultat attendu vs obtenu]
```

**Workaround** :
```bash
# Solution temporaire
[commande ou code workaround]
```

**Status** : 🚧 En cours de fix
**ETA Fix** : [DATE estimée]
**Tracking** : Issue #XXX

---

## ⚠️ Issues Majeures

### Issue #2 : Performance lente sur endpoint /api/posts?limit=1000

**Sévérité** : 🟡 MAJEUR

**Description** :
Endpoint `/api/posts` avec limit > 500 prend >5 secondes à répondre.

**Impact** :
- Timeout clients
- Mauvaise UX pour pagination

**Cause** :
Query DB charge toutes les relations (N+1 problem).

**Reproduction** :
```bash
curl "http://localhost:8000/api/posts?limit=1000"
# Temps réponse : 5-8 secondes
```

**Workaround** :
Limiter requests à max 100 items par page :
```typescript
// Client side
const MAX_LIMIT = 100;
const safeLimit = Math.min(userLimit, MAX_LIMIT);
```

**Fix Planifié** :
- Ajouter indexes DB sur foreign keys
- Implémenter eager loading avec select_related()
- Pagination cursor-based au lieu offset-based

**Status** : 📅 Planifié pour v1.6.0
**Tracking** : Issue #245

---

### Issue #3 : [Autre Issue Majeure]

[Même structure...]

---

## 🔵 Issues Mineures

### Issue #4 : Bouton disabled reste gris sur hover (UI)

**Sévérité** : 🔵 MINEUR

**Description** :
Boutons disabled ne changent pas visuellement sur hover, pas clair qu'ils sont disabled.

**Impact** :
- UX légèrement dégradée
- Utilisateurs tentent de cliquer plusieurs fois

**Workaround** :
Aucun workaround nécessaire (cosmétique).

**Fix Planifié** :
Ajouter cursor `not-allowed` et opacity 0.5 :
```css
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

**Status** : 📝 Backlog
**Tracking** : Issue #312

---

## 🐛 Bugs Spécifiques Environnement

### Bug : Docker volume permissions sur Windows

**Environnement** : Windows + Docker Desktop

**Description** :
Volumes montés ont permissions incorrectes, app crash au démarrage.

**Reproduction** :
```bash
# Sur Windows
docker-compose up
# Error: Permission denied: '/app/data'
```

**Workaround** :
Utiliser named volumes au lieu bind mounts :
```yaml
# docker-compose.yml
volumes:
  - app-data:/app/data  # ✅ Named volume

# ❌ Au lieu de :
# volumes:
#   - ./data:/app/data  # Bind mount
```

**Référence** : [Lessons Learned - Docker](../../infrastructure/lessons/docker.md)

---

### Bug : Tests E2E fail sur Safari

**Environnement** : Safari 16+ sur macOS

**Description** :
Tests Playwright timeout sur Safari uniquement.

**Cause** :
Safari bloque WebSocket connections en test mode.

**Workaround** :
Skip tests Safari temporairement :
```typescript
// e2e/tests.spec.ts
test.skip(browserName === 'webkit', 'Skip on Safari due to WebSocket issue');
```

**Fix Planifié** : Configurer Playwright pour permettre WebSocket en test

**Status** : 📝 Backlog
**Tracking** : Issue #401

---

## 🚧 Limitations Connues

### Limitation 1 : Pas de support fichiers > 10MB

**Description** :
Upload fichiers limité à 10MB pour éviter timeout.

**Raison** :
Infrastructure actuelle (VPS) a bande passante limitée.

**Plan Futur** :
- Phase 1 : Augmenter à 50MB (v2.0)
- Phase 2 : Support chunked upload pour fichiers >50MB (v2.5)

---

### Limitation 2 : Recherche fulltext anglais uniquement

**Description** :
Moteur recherche optimisé pour anglais, pas de stemming français/espagnol.

**Impact** :
Recherche "développement" ne trouve pas "développer".

**Workaround** :
Utiliser recherche partielle :
```
"dével*"  # Trouve : développement, développer, développeur
```

**Plan Futur** :
Implémenter PostgreSQL full-text search multi-langues (v1.8).

---

## 🔒 Vulnérabilités Connues

### CVE-2025-XXXXX : [Titre Vulnérabilité]

**Sévérité** : 🔴 HAUTE

**Description** :
[Description vulnérabilité]

**Affected Versions** : v1.0.0 - v1.4.2

**Fixed In** : v1.5.0

**Action Requise** :
```bash
# Upgrade immédiatement vers v1.5.0+
npm install [package]@1.5.0
```

**Référence** : [CVE-2025-XXXXX](https://cve.mitre.org/...)

---

## 📊 Issues par Catégorie

| Catégorie | Critiques | Majeures | Mineures | Total |
|-----------|-----------|----------|----------|-------|
| **Backend** | 0 | 1 | 2 | 3 |
| **Frontend** | 0 | 0 | 3 | 3 |
| **Database** | 0 | 1 | 0 | 1 |
| **Infra** | 1 | 0 | 1 | 2 |
| **Security** | 0 | 0 | 0 | 0 |
| **Total** | 1 | 2 | 6 | **9** |

---

## 📋 Comment Reporter un Bug

### Template Bug Report

```markdown
**Titre** : [Description courte]

**Sévérité** : CRITIQUE / MAJEUR / MINEUR

**Description** :
[Description détaillée]

**Steps to Reproduce** :
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior** :
[Ce qui devrait se passer]

**Actual Behavior** :
[Ce qui se passe réellement]

**Environment** :
- OS : [Windows 11 / macOS 13 / Ubuntu 22.04]
- Browser : [Chrome 120 / Firefox 121]
- Version App : [v1.5.2]

**Logs/Screenshots** :
[Logs d'erreur ou screenshots]

**Workaround (if any)** :
[Solution temporaire si trouvée]
```

### Où Reporter

- **GitHub Issues** : [lien repo]
- **Email** : bugs@domain.com
- **Slack** : #bugs channel

---

## 🔄 Process de Fix

```
1. Bug reporté → Triage (24h)
   ↓
2. Assigné sévérité + priorité
   ↓
3. Investigation
   ↓
4. Fix développé + tests
   ↓
5. Review code
   ↓
6. Merge + Deploy
   ↓
7. Vérification fix en prod
   ↓
8. Update KNOWN_ISSUES.md (archiver)
   ↓
9. Notifier reporter
```

---

## 📜 Issues Archivées (Résolues)

### ✅ [RÉSOLU] Issue #150 : Memory leak sur endpoint /api/users

**Résolu dans** : v1.4.0 (2025-11-15)

**Description** :
Memory usage augmentait continuellement.

**Fix** :
Ajout cleanup listeners EventEmitter.

**Référence** : [Commit abc1234](https://github.com/...)

---

### ✅ [RÉSOLU] Issue #201 : SQL injection sur /search

**Résolu dans** : v1.2.0 (2025-10-15)

**Description** :
Paramètre search pas sanitized.

**Fix** :
Migration vers parameterized queries ORM.

**Référence** : [Security Advisory](https://github.com/.../security/advisories/...)

---

## 🔗 Voir Aussi

- [CHANGELOG.md](CHANGELOG.md) - Historique versions et fixes
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comment tester avant reporter
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture pour context debugging
- [Lessons Learned](../../infrastructure/lessons/) - Solutions erreurs communes

---

**Maintenu par** : [Équipe]
**Revue recommandée** : Hebdomadaire (triage nouveaux bugs)

---

## 🏷️ Labels Sévérité

| Label | Signification | SLA Fix |
|-------|---------------|---------|
| 🔴 **CRITIQUE** | Bloque production, data loss | <24h |
| 🟡 **MAJEUR** | Feature cassée, workaround existe | <1 semaine |
| 🔵 **MINEUR** | UX dégradée, cosmétique | Backlog |
| 🟢 **TRIVIAL** | Typos, style | Contributions welcome |

---

## 📊 Statistiques

**Dernière semaine** :
- Nouveaux bugs : [X]
- Bugs résolus : [Y]
- Bugs ouverts : [Z]

**Temps moyen résolution** :
- Critiques : [X heures]
- Majeurs : [Y jours]
- Mineurs : [Z semaines]
