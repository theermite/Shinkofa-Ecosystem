# /doc-update - Mise à Jour Documentation Incrémentielle

> Met à jour la documentation existante en analysant uniquement les fichiers modifiés.

**Agent déclenché** : `agents/Documentation-Generator/AGENT.md`
**Version** : 1.0
**Temps moyen** : 30 secondes - 2 minutes (selon nombre de changements)

---

## 🎯 Objectif

Synchroniser la documentation avec les changements récents du code de manière **incrémentielle** et **rapide** au lieu de régénérer toute la documentation.

**Avantages** :
- ⚡ **Rapide** : Analyse seulement fichiers modifiés (vs scan complet)
- 🎯 **Ciblé** : Update sections pertinentes uniquement
- 💾 **Préserve** : Garde modifications manuelles dans sections non affectées
- 🔄 **Intelligent** : Détecte type de changement (API, DB, code)

---

## 🔧 Utilisation

### Update Automatique (Défaut)

```bash
/doc-update
```

Détecte automatiquement les fichiers modifiés depuis le dernier commit et met à jour la documentation correspondante.

---

### Update Depuis Commit Spécifique

```bash
# Depuis dernier commit
/doc-update --since HEAD~1

# Depuis 3 commits
/doc-update --since HEAD~3

# Depuis commit spécifique
/doc-update --since abc123f

# Depuis branche
/doc-update --since main
```

---

### Update Fichiers Spécifiques

```bash
# Fichier unique
/doc-update --file backend/app/api/v1/users.py

# Plusieurs fichiers
/doc-update --file backend/app/api/v1/users.py,backend/app/models/user.py

# Pattern glob
/doc-update --pattern "backend/app/api/**/*.py"
```

---

### Options Avancées

```bash
# Dry run (voir ce qui sera modifié sans appliquer)
/doc-update --dry-run

# Update avec logs détaillés
/doc-update --verbose

# Forcer update même si pas de changements détectés
/doc-update --force

# Update seulement certains types de docs
/doc-update --only api,database
```

---

## 📊 Processus de Mise à Jour

### 1. DETECT (5 secondes)

```
🔍 Détection changements...

git diff main --name-only:
   ✅ backend/app/api/v1/users.py      (modified)
   ✅ backend/app/models/user.py       (modified)
   ✅ frontend/src/pages/Profile.tsx   (new)
   ✅ database/migrations/003_add_avatar.sql (new)

📊 Résumé:
   - 2 fichiers modifiés
   - 2 nouveaux fichiers
   - 0 fichiers supprimés
```

### 2. CLASSIFY (5 secondes)

```
🏷️  Classification changements...

Type: API Changes
   ├── POST /api/users (nouveau paramètre "avatar_url")
   └── GET /api/users/me (nouveau champ response)

Type: Database Changes
   ├── Table "users" → nouvelle colonne "avatar_url"
   └── Migration #003 ajoutée

Type: Frontend Changes
   └── Page Profile.tsx (pas d'impact documentation API)
```

### 3. UPDATE (30 secondes)

```
📝 Mise à jour documentation...

✅ API_REFERENCE.md
   └── Section "POST /api/users" mise à jour
       - Ajout paramètre "avatar_url" (optional, string)
       - Exemple curl mis à jour

✅ DATABASE_SCHEMA.md
   └── Table "users" mise à jour
       - Ajout colonne "avatar_url" (String, nullable)
       - ERD régénéré

✅ CHANGELOG.md
   └── Section "[Unreleased]" mise à jour
       - Added: User avatar upload feature

⏭️  ARCHITECTURE.md (pas de changements)
⏭️  CODING_STANDARDS.md (pas de changements)
⏭️  TESTING_GUIDE.md (pas de changements)
```

### 4. VALIDATE (10 secondes)

```
✅ Validation...
   ✅ Markdown syntax valid
   ✅ Internal links OK
   ✅ Code examples syntax correct

Score qualité : 94% ✅ (+2% vs avant)
```

---

## 🧠 Détection Intelligente

### Types de Changements Détectés

| Type Changement | Fichiers Affectés | Documentation Mise à Jour |
|-----------------|-------------------|---------------------------|
| **API Endpoint nouveau** | `app/api/**/*.py`, `routes/*.ts` | API_REFERENCE.md |
| **API Endpoint modifié** | Params/response changés | API_REFERENCE.md |
| **API Endpoint supprimé** | Deleted | API_REFERENCE.md (marqué deprecated) |
| **Database schema** | `migrations/*.sql`, `schema.prisma` | DATABASE_SCHEMA.md |
| **Nouvelle fonction** | `*.py`, `*.ts` | Selon visibilité (publique) |
| **Config changée** | `package.json`, `requirements.txt` | ARCHITECTURE.md |
| **Tests ajoutés** | `tests/**/*` | TESTING_GUIDE.md |
| **Décision technique** | `ADR-*.md`, comments "WHY:" | CONTEXT.md |

### Exemples de Détection

**Exemple 1 : Nouveau Endpoint API**

```python
# backend/app/api/v1/users.py (modifié)

# AVANT
@app.get("/api/users/me")
def get_current_user(current_user: User = Depends(get_current_user)):
    return current_user

# APRÈS
@app.post("/api/users/avatar")  # ← NOUVEAU ENDPOINT
async def upload_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_user)
):
    """Upload user avatar image."""
    url = await storage.upload(file)
    await db.update_user(current_user.id, avatar_url=url)
    return {"avatar_url": url}
```

**Action automatique** :
```markdown
✅ API_REFERENCE.md mis à jour

Section ajoutée:
### POST /api/users/avatar

Upload user avatar image.

**Authentication**: Required (Bearer token)

**Request**: multipart/form-data
- `file`: Image file (JPEG, PNG, max 5MB)

**Response (200)**:
```json
{"avatar_url": "https://storage.example.com/avatars/uuid.jpg"}
```

**Errors**:
- `400 Bad Request` - Invalid file format
- `413 Payload Too Large` - File > 5MB
```

---

**Exemple 2 : Migration Database**

```sql
-- database/migrations/003_add_avatar.sql (nouveau fichier)

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
CREATE INDEX idx_users_avatar ON users(avatar_url);
```

**Action automatique** :
```markdown
✅ DATABASE_SCHEMA.md mis à jour

Table "users" - colonne ajoutée:
| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| avatar_url | VARCHAR(500) | NULL | - |

Indexes ajoutés:
- `idx_users_avatar` (B-tree)
```

---

**Exemple 3 : Modification Response API**

```typescript
// backend/app/schemas/user.ts (modifié)

// AVANT
interface UserResponse {
  id: string
  email: string
  name: string
}

// APRÈS
interface UserResponse {
  id: string
  email: string
  name: string
  avatar_url?: string  // ← NOUVEAU CHAMP
  is_verified: boolean // ← NOUVEAU CHAMP
}
```

**Action automatique** :
```markdown
✅ API_REFERENCE.md mis à jour

Tous les endpoints retournant UserResponse mis à jour:
- GET /api/users/me
- GET /api/users/{id}
- POST /api/users

Response schema mis à jour avec nouveaux champs:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",  // ← NOUVEAU
  "is_verified": true            // ← NOUVEAU
}
```
```

---

## 🔄 Modes d'Update

### Mode 1 : Auto (Recommandé)

```bash
/doc-update
```

**Comportement** :
- Détecte changements via `git diff`
- Update sections affectées
- Préserve sections non affectées
- Ajoute note "[Updated: 2026-01-26]" sur sections modifiées

---

### Mode 2 : Smart Merge

```bash
/doc-update --smart-merge
```

**Comportement** :
- Détecte modifications manuelles dans docs
- Merge intelligemment avec changements code
- Demande confirmation si conflit
- Préserve formatage manuel

**Exemple conflit** :
```markdown
⚠️  Conflit détecté dans API_REFERENCE.md

Section: POST /api/users

Changement code:
+ Nouveau paramètre "avatar_url" (optional)

Modification manuelle existante:
+ Note: "This endpoint is rate limited to 10/min"

Options:
1. Garder les deux (recommandé)
2. Garder seulement changement code
3. Garder seulement modification manuelle

Choix: 1

✅ Merged: Paramètre ajouté + note préservée
```

---

### Mode 3 : Dry Run

```bash
/doc-update --dry-run
```

**Comportement** :
- Analyse changements
- Montre ce qui sera modifié
- N'applique PAS les changements
- Utile pour review avant update réel

**Output** :
```markdown
🔍 Dry Run Mode

Changements qui seraient appliqués:

API_REFERENCE.md:
   + Section "POST /api/users/avatar" (nouvelle)
   ~ Section "GET /api/users/me" (modifiée)

DATABASE_SCHEMA.md:
   ~ Table "users" (colonne ajoutée)

CHANGELOG.md:
   + Entry "[Unreleased]" (nouvelle feature)

⚠️  Aucun changement appliqué (mode dry-run)
```

---

## 🎯 Stratégies de Mise à Jour

### Stratégie 1 : Append Only

Pour sections qui grandissent (CHANGELOG, KNOWN_ISSUES) :

```markdown
# CHANGELOG.md

## [Unreleased]  ← Ajoute ici
### Added
- User avatar upload

## [2.0.0] - 2026-01-20  ← Préserve historique
### Added
- User authentication
```

### Stratégie 2 : Replace Section

Pour sections qui reflètent état actuel (DATABASE_SCHEMA) :

```markdown
# DATABASE_SCHEMA.md

### Table: users  ← Remplace section entière

| Column | Type | ... |
|--------|------|-----|
| id | UUID | ... |
| email | String | ... |
| avatar_url | String | ... |  ← Nouveau
```

### Stratégie 3 : Merge Smart

Pour sections mixtes (API_REFERENCE) :

```markdown
### POST /api/users

[Description automatique]

**Custom note (manual)** : Rate limit 10/min  ← Préservé

[Request/Response automatiques]  ← Mis à jour
```

---

## 📊 Reporting

### Output Standard

```
📊 Rapport Mise à Jour

Fichiers analysés : 4
Changements détectés : 7

Documentation mise à jour:
✅ API_REFERENCE.md
   - 1 endpoint ajouté
   - 2 endpoints modifiés

✅ DATABASE_SCHEMA.md
   - 1 table modifiée
   - 1 index ajouté

✅ CHANGELOG.md
   - 3 entrées ajoutées

Score qualité : 94% → 96% (+2%)

⏱️  Durée: 1m 23s
```

### Output Détaillé (`--verbose`)

```
🔍 Analyse détaillée

[2026-01-26 10:15:32] Scan git diff main...
[2026-01-26 10:15:33] Détecté: backend/app/api/v1/users.py (modified)
[2026-01-26 10:15:33] → Changement type: API_ENDPOINT_MODIFIED
[2026-01-26 10:15:34] → Fonction: upload_avatar (nouvelle)
[2026-01-26 10:15:34] → Endpoint: POST /api/users/avatar
[2026-01-26 10:15:35] Parsing function signature...
[2026-01-26 10:15:35] → Params: file (UploadFile), current_user (User)
[2026-01-26 10:15:36] Extraction docstring: "Upload user avatar image."
[2026-01-26 10:15:37] Génération exemple curl...
[2026-01-26 10:15:38] Update API_REFERENCE.md section...
[2026-01-26 10:15:39] ✅ Section ajoutée (ligne 234)
...
```

---

## ⚙️ Configuration

### .claude/doc-config.json

```json
{
  "update": {
    "mode": "auto",
    "smart_merge": true,
    "preserve_manual_edits": true,
    "add_update_timestamp": true,
    "git_diff_base": "main"
  },
  "detection": {
    "watch_patterns": [
      "backend/app/**/*.py",
      "frontend/src/**/*.ts",
      "database/migrations/*.sql"
    ],
    "ignore_patterns": [
      "**/*.test.ts",
      "**/__pycache__/**"
    ]
  },
  "merge_strategy": {
    "api_reference": "smart_merge",
    "database_schema": "replace",
    "changelog": "append_only",
    "context": "smart_merge"
  }
}
```

---

## 🔗 Intégration Git Workflow

### Workflow Recommandé

```
1. git checkout -b feature/avatar-upload
   ↓
2. [Développer feature]
   ↓
3. git add .
   ↓
4. /doc-update  ← Met à jour docs automatiquement
   ↓
5. git add .claude/docs/
   ↓
6. git commit -m "feat: Add avatar upload + update docs"
   ↓
7. git push origin feature/avatar-upload
```

### Pre-commit Hook (Automatique)

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "📝 Updating documentation..."

# Update docs silencieusement
/doc-update --quiet

# Stage docs modifiées
git add .claude/docs/

echo "✅ Documentation synchronized"
```

**Activation** :
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🆚 Comparaison avec /doc-generate

| Feature | /doc-generate | /doc-update |
|---------|---------------|-------------|
| **Scope** | Tout le projet | Fichiers modifiés uniquement |
| **Durée** | 3-5 min | 30s - 2 min |
| **Utilisation** | Première fois, refonte | Mises à jour régulières |
| **Préservation** | Remplace tout | Préserve édits manuels |
| **Intelligence** | Basic scan | Détection smart changements |

**Règle** :
- **Première fois / Refonte** → `/doc-generate`
- **Updates régulières** → `/doc-update`
- **Vérification** → `/doc-check` puis `/doc-update`

---

## ✅ Checklist Post-Update

- [ ] Vérifier sections modifiées (marquées "[Updated: date]")
- [ ] Valider exemples code (syntaxe correcte)
- [ ] Confirmer score qualité maintenu/amélioré
- [ ] Vérifier que modifications manuelles préservées
- [ ] Commit documentation avec code dans même commit
- [ ] Push vers remote

---

## 💡 Tips

1. **Régularité** : Update après chaque feature (pas à la fin)
2. **Commits atomiques** : Include docs dans même commit que code
3. **Dry-run** : Utiliser `--dry-run` si incertain
4. **Smart merge** : Activer pour projets avec docs manuelles
5. **Hooks** : Setup pre-commit hook pour automatisation
6. **Review** : Toujours review changes avant commit

---

## 🐛 Troubleshooting

**Problème** : Update ne détecte pas mes changements
**Solution** :
- Vérifier que fichiers sont committed (`git status`)
- Utiliser `--since HEAD~1` si changements dans commit précédent
- Vérifier patterns dans `.claude/doc-config.json`

**Problème** : Modifications manuelles écrasées
**Solution** :
- Activer `preserve_manual_edits: true` dans config
- Utiliser `--smart-merge` flag
- Wrapper modifications manuelles avec `<!-- MANUAL START/END -->`

**Problème** : Update trop lent
**Solution** :
- Utiliser `--only api,database` pour scope limité
- Vérifier `ignore_patterns` (exclude node_modules, etc.)
- Utiliser `/doc-generate` si refonte complète nécessaire

---

## 📚 Ressources

- **Agent complet** : `agents/Documentation-Generator/AGENT.md`
- **Génération complète** : `.claude/commands/doc-generate.md`
- **Vérification** : `.claude/commands/doc-check.md`
- **Configuration** : `.claude/doc-config.json`

---

**Créé** : 2026-01-26
**Version** : 1.0
**Maintenu par** : Système Agents
