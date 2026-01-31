# /check-duplicate

Vérifie si une fonction, table, endpoint ou pattern existe déjà avant de le créer.

## Usage

```bash
/check-duplicate "nom_fonction"
/check-duplicate "create_user"
/check-duplicate "upload_avatar" --type function
```

## Description

Évite la duplication de code en vérifiant automatiquement dans tous les registres si quelque chose de similaire existe déjà.

## Pourquoi C'est Critique

❌ **Sans /check-duplicate** :
- Duplication de code
- Maintenance complexe
- Incohérences
- Bugs synchronisation

✅ **Avec /check-duplicate** :
- Réutilisation garantie
- Code DRY (Don't Repeat Yourself)
- Maintenance simplifiée
- Cohérence assurée

## Workflow

```
1. Developer veut créer "upload_avatar()"

2. /check-duplicate "upload_avatar"

3. Claude vérifie dans :
   - Code projet existant (src/, app/)
   - Lessons learned (patterns similaires)
   - (Future: registres functions/)

4. Si TROUVÉ :
   ✅ "Fonction similaire existe : src/utils/upload.ts:42"
   📖 Affiche code existant
   💡 Suggère : RÉUTILISER ou ÉTENDRE

5. Si PAS TROUVÉ :
   ✅ "Aucun doublon détecté"
   💡 "Sécuritaire de créer upload_avatar()"
```

## Implémentation

### Phase 1 : Recherche dans Code Projet

```bash
# Recherche dans fichiers code
grep -r -i -n "upload.*avatar\|avatar.*upload" src/ app/ \
  --include="*.ts" --include="*.tsx" --include="*.py" --include="*.js" \
  | head -10
```

### Phase 2 : Recherche dans Lessons

```bash
# Recherche patterns similaires documentés
grep -r -i -n "upload.*avatar\|avatar.*upload" \
  Prompt-2026-Optimized/infrastructure/lessons/ \
  | head -5
```

### Phase 3 : Analyse Similarité

```python
# Pseudo-code
similar_names = [
  "upload_file", "upload_image", "save_avatar",
  "store_avatar", "handle_upload"
]

for name in similar_names:
  if name in codebase:
    return f"⚠️ Fonction similaire trouvée : {name}"
```

## Exemples

### Exemple 1 : Doublon Trouvé

```bash
/check-duplicate "create_user"
```

**Résultat** :
```
🔍 Vérification : "create_user"

⚠️ DOUBLON DÉTECTÉ

📍 src/services/user.ts:85
async function createUser(email: string, password: string) {
  // Création utilisateur avec hash password
  // Envoi email confirmation
  // Création session
}

📍 Leçon similaire : infrastructure/lessons/backend.md
Pattern de création utilisateur avec validation

💡 RECOMMANDATION :
  ✅ RÉUTILISER la fonction existante
  ✅ OU ÉTENDRE si besoin features additionnelles
  ❌ NE PAS créer doublon

Actions suggérées :
  1. Utiliser createUser() existante
  2. Si besoin différent → Renommer : "createAdminUser()"
  3. Extraire logique commune dans "validateUser()"
```

### Exemple 2 : Pas de Doublon

```bash
/check-duplicate "generate_thumbnail"
```

**Résultat** :
```
🔍 Vérification : "generate_thumbnail"

✅ AUCUN DOUBLON DÉTECTÉ

Recherché dans :
  - Code projet (src/, app/) : 0 résultat
  - Lessons learned : 0 résultat

💡 Fonctions similaires trouvées :
  - process_image() : src/utils/image.ts:34
  - resize_image() : src/utils/image.ts:78

Sécuritaire de créer generate_thumbnail()

📝 Suggestions :
  - Placer dans : src/utils/image.ts
  - Utiliser resize_image() si applicable
  - Documenter dans lessons si complexe
```

### Exemple 3 : Similarité Partielle

```bash
/check-duplicate "send_email"
```

**Résultat** :
```
🔍 Vérification : "send_email"

⚠️ FONCTIONS SIMILAIRES DÉTECTÉES

📍 src/services/email.ts:42
async function sendWelcomeEmail(user: User) { ... }

📍 src/services/email.ts:89
async function sendResetPasswordEmail(email: string) { ... }

💡 RECOMMANDATION :
  ❓ Est-ce que send_email() est générique ou spécifique ?

Si générique :
  ✅ Créer send_email(type, recipient, data)
  ✅ Refactoriser fonctions existantes pour utiliser

Si spécifique :
  ✅ Nommer plus précisément : sendOrderConfirmationEmail()
  ✅ Suivre pattern existant
```

## Types de Vérification

| Type | Recherche | Fichiers |
|------|-----------|----------|
| `function` | Fonctions, méthodes | `*.ts, *.tsx, *.py, *.js` |
| `table` | Tables DB | `*.sql, migrations/` |
| `endpoint` | Routes API | `routes/, api/` |
| `component` | Composants React | `*.tsx, components/` |
| `pattern` | Patterns documentés | `lessons/*.md` |

## Options

```bash
/check-duplicate "nom" --type [function|table|endpoint|component]
/check-duplicate "nom" --strict  # Recherche exacte uniquement
/check-duplicate "nom" --suggest # Suggère noms alternatifs
```

## Intégration Workflow

### AVANT Créer Fonction

```
1. /check-duplicate "nom_fonction"
2. Lire résultats
3. SI doublon → RÉUTILISER ou RENOMMER
4. SI pas doublon → CRÉER
5. Hook auto-documente dans registry approprié
```

### AVANT Créer Table DB

```
1. /check-duplicate "nom_table" --type table
2. Vérifier schema existant
3. SI similaire → ÉTENDRE table existante
4. SI nouveau → CRÉER
```

### AVANT Créer Endpoint

```
1. /check-duplicate "endpoint_path" --type endpoint
2. Vérifier routes existantes
3. SI existe → RÉUTILISER ou CONSOLIDER
4. SI nouveau → CRÉER
```

## Règles

1. ⚠️ **TOUJOURS** vérifier avant de créer
2. ✅ **RÉUTILISER** code existant plutôt que dupliquer
3. 📝 **DOCUMENTER** si pattern complexe
4. 🔄 **REFACTORISER** si duplication détectée après coup

## Cas d'Usage

### ✅ Quand Utiliser

- Avant toute création de fonction
- Avant toute création de table
- Avant toute création d'endpoint
- Avant d'implémenter un pattern
- Quand on hésite si ça existe déjà

### ❌ Quand Ne Pas Utiliser

- Pour code one-off très spécifique
- Pour prototypes jetables
- Pour tests unitaires

## Future: Auto-Categorization

Quand hook détecte nouvelle fonction, il :
1. Vérifie duplications
2. Catégorise automatiquement
3. Update registry modulaire approprié
4. Génère documentation

## Voir Aussi

- `/search-registry` - Recherche dans registres
- [Modular Registries](../../Prompt-2026-Optimized/infrastructure/lessons/README.md)
- [Code-Reviewer Agent](../../Prompt-2026-Optimized/agents/Code-Reviewer/AGENT.md)

---

**Version** : 1.0
**Créé** : 2026-01-26
**Impact** : CRITIQUE - Évite duplication code
