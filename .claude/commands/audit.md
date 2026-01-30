# /audit

Lance un audit qualité complet du projet courant : conventions, structure, cohérence, fichiers orphelins.

## Description

Cette commande invoque l'agent **Quality-Auditor** pour effectuer une vérification exhaustive du projet. L'audit est méticuleux, précis, et ne laisse rien passer.

## Usage

```bash
/audit                    # Audit complet
/audit conventions        # Vérifier nommage fichiers/dossiers
/audit structure          # Vérifier organisation projet
/audit orphans            # Chercher fichiers orphelins
/audit --full             # Rapport exhaustif avec tous détails
/audit --fix              # Proposer corrections automatiques
```

## Catégories Auditées

### 1. Conventions Nommage

**Fichiers .md** : `Title-Kebab-Case.md`
- ✅ `Audit-Rapport.md`, `Migration-Guide.md`
- ❌ `AUDIT-RAPPORT.md`, `audit_rapport.md`
- Exceptions : `README.md`, `CHANGELOG.md`, `LICENSE`

**Dossiers** : `Title-Kebab-Case/`
- ✅ `Content-Strategy/`, `Quick-Refs/`
- ❌ `content-strategy/`, `CONTENT-STRATEGY/`
- Exceptions : `src/`, `docs/`, `tests/`, `node_modules/`

### 2. Structure Projet

- `.claude/` présent avec `CLAUDE.md`
- `README.md` informatif (pas placeholder)
- Organisation cohérente (pas de fichiers éparpillés)
- Pas de dossiers vides injustifiés

### 3. Fichiers Orphelins

Détection automatique :
- `*.backup`, `*.old`, `*.bak`
- Dossiers `_old/`, `_backup/`, `.archive/`
- Fichiers temporaires `temp_*`, `*.tmp`
- Configurations dupliquées (`.env.backup`)

### 4. Cohérence Instructions

- CLAUDE.md à jour (version synchronisée)
- Pas de divergence entre projets
- session-state.md présent si requis

### 5. Configuration

- Namespace cohérent (`@namespace/*`)
- Workspace PNPM/Turbo correct
- Dépendances à jour

## Scoring

| Score | Status | Signification |
|-------|--------|---------------|
| 95-100 | ✅ Excellent | Projet exemplaire |
| 85-94 | ✅ Bon | Ajustements mineurs |
| 70-84 | ⚠️ Acceptable | Corrections nécessaires |
| 50-69 | ⚠️ Problématique | Corrections urgentes |
| 0-49 | ❌ Critique | Refonte nécessaire |

## Output

Rapport structuré :

```markdown
# Rapport Audit — [Projet]

## Score Global : XX/100

| Catégorie | Score | Status |
|-----------|-------|--------|
| Conventions | XX/100 | ✅/⚠️/❌ |
| Structure | XX/100 | ✅/⚠️/❌ |
| Orphelins | XX/100 | ✅/⚠️/❌ |
| Cohérence | XX/100 | ✅/⚠️/❌ |

## Problèmes Détectés

### Sévérité HAUTE
| # | Chemin | Problème | Correction |
|---|--------|----------|------------|

### Sévérité MOYENNE
...

## Recommandations
1. Priorité 1 : [Actions urgentes]
2. Priorité 2 : [Actions importantes]
```

## Exemples

### Audit Complet
```bash
/audit
```
→ Génère rapport complet toutes catégories

### Audit Conventions Uniquement
```bash
/audit conventions
```
→ Vérifie nommage fichiers/dossiers, ignore le reste

### Proposer Corrections
```bash
/audit --fix
```
→ Génère script de renommage/suppression

## Périodicité Recommandée

| Type Projet | Fréquence |
|-------------|-----------|
| En développement actif | Hebdomadaire |
| En maintenance | Mensuel |
| Avant release | Obligatoire |
| Après migration | Obligatoire |

## Agent Associé

**Quality-Auditor** (`agents/Quality-Auditor/AGENT.md`)

---

**Version** : 1.0 | **Date** : 2026-01-30
