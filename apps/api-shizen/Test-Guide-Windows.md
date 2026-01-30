# Guide de Test Journals & Rituals - Windows

## 🎯 Objectif

Tester les endpoints Journals et Rituals de l'API Shizen-Planner depuis Windows.

## 📍 URL de l'API

**Base URL**: `https://alpha.shinkofa.com/api/shizen`

## 🛠️ Méthodes de Test

### Option 1: PowerShell (Natif Windows)

#### Test 1: Créer un Journal
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-User-ID" = "jay"
}

$body = @{
    date = (Get-Date -Format "yyyy-MM-dd")
    energy_morning = 7
    energy_evening = 6
    intentions = "Tester l'API Journals"
    gratitudes = @("Tests fonctionnels", "API stable", "Documentation claire")
    successes = @("52 tests passent", "Documentation complète", "Commit réussi")
    learning = "Les endpoints fonctionnent parfaitement"
    adjustments = "Continuer les tests"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://alpha.shinkofa.com/api/shizen/journals/" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### Test 2: Lister les Journals
```powershell
$headers = @{
    "X-User-ID" = "jay"
}

Invoke-RestMethod -Uri "https://alpha.shinkofa.com/api/shizen/journals/?limit=5" `
    -Method GET `
    -Headers $headers
```

#### Test 3: Créer un Ritual (Morning Meditation)
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-User-ID" = "jay"
}

$body = @{
    label = "Morning meditation"
    icon = "🧘"
    completed = $false
    category = "morning"
    order = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://alpha.shinkofa.com/api/shizen/rituals/" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### Test 4: Lister les Rituals
```powershell
$headers = @{
    "X-User-ID" = "jay"
}

Invoke-RestMethod -Uri "https://alpha.shinkofa.com/api/shizen/rituals/" `
    -Method GET `
    -Headers $headers
```

#### Test 5: Réinitialiser tous les Rituals
```powershell
$headers = @{
    "X-User-ID" = "jay"
}

Invoke-RestMethod -Uri "https://alpha.shinkofa.com/api/shizen/rituals/reset" `
    -Method POST `
    -Headers $headers
```

---

### Option 2: curl (Windows avec curl installé)

#### Test 1: Créer un Journal
```bash
curl -X POST "https://alpha.shinkofa.com/api/shizen/journals/" ^
  -H "Content-Type: application/json" ^
  -H "X-User-ID: jay" ^
  -d "{\"date\":\"2026-01-07\",\"energy_morning\":7,\"energy_evening\":6,\"intentions\":\"Tester l'API\",\"gratitudes\":[\"Test 1\",\"Test 2\",\"Test 3\"],\"successes\":[\"Success 1\",\"Success 2\",\"Success 3\"],\"learning\":\"Apprentissage\",\"adjustments\":\"Ajustements\"}"
```

#### Test 2: Lister les Journals
```bash
curl "https://alpha.shinkofa.com/api/shizen/journals/?limit=5" ^
  -H "X-User-ID: jay"
```

#### Test 3: Créer un Ritual
```bash
curl -X POST "https://alpha.shinkofa.com/api/shizen/rituals/" ^
  -H "Content-Type: application/json" ^
  -H "X-User-ID: jay" ^
  -d "{\"label\":\"Morning meditation\",\"icon\":\"🧘\",\"completed\":false,\"category\":\"morning\",\"order\":1}"
```

#### Test 4: Lister les Rituals
```bash
curl "https://alpha.shinkofa.com/api/shizen/rituals/" ^
  -H "X-User-ID: jay"
```

#### Test 5: Réinitialiser tous les Rituals
```bash
curl -X POST "https://alpha.shinkofa.com/api/shizen/rituals/reset" ^
  -H "X-User-ID: jay"
```

---

### Option 3: Postman / Insomnia (GUI)

#### Configuration
1. **Base URL**: `https://alpha.shinkofa.com/api/shizen`
2. **Header requis**: `X-User-ID: jay`
3. **Content-Type**: `application/json` (pour POST/PUT)

#### Collections à créer

**Journals Collection**:
- `POST /journals/` - Create Journal
- `GET /journals/` - List Journals
- `GET /journals/date/{date}` - Get Journal by Date
- `PUT /journals/{journal_id}` - Update Journal
- `DELETE /journals/{journal_id}` - Delete Journal

**Rituals Collection**:
- `POST /rituals/` - Create Ritual
- `GET /rituals/` - List Rituals
- `GET /rituals/?category=morning` - Filter by Category
- `PUT /rituals/{ritual_id}` - Update Ritual
- `DELETE /rituals/{ritual_id}` - Delete Ritual
- `POST /rituals/reset` - Reset All Rituals

#### Exemple de requête Postman (Create Journal)

**Method**: POST
**URL**: `https://alpha.shinkofa.com/api/shizen/journals/`

**Headers**:
```
Content-Type: application/json
X-User-ID: jay
```

**Body** (raw JSON):
```json
{
  "date": "2026-01-07",
  "energy_morning": 7,
  "energy_evening": 6,
  "intentions": "Tester l'API Journals",
  "gratitudes": ["Test 1", "Test 2", "Test 3"],
  "successes": ["Success 1", "Success 2", "Success 3"],
  "learning": "Les endpoints fonctionnent bien",
  "adjustments": "Continuer les tests"
}
```

---

## 📚 Documentation Complète

Pour plus de détails sur tous les endpoints disponibles:
- **Fichier**: `apps/api-shizen-planner/docs/API-JOURNALS-RITUALS.md`
- **Contenu**: Spécifications complètes, exemples curl, use cases, patterns

## ✅ Résultats Attendus

### Create Journal (POST /journals/)
**Status**: `201 Created`
```json
{
  "id": "journal-abc-123",
  "date": "2026-01-07",
  "energy_morning": 7,
  "energy_evening": 6,
  "intentions": "Tester l'API Journals",
  "gratitudes": ["Test 1", "Test 2", "Test 3"],
  "successes": ["Success 1", "Success 2", "Success 3"],
  "learning": "Les endpoints fonctionnent bien",
  "adjustments": "Continuer les tests",
  "user_id": "jay"
}
```

### List Journals (GET /journals/)
**Status**: `200 OK`
```json
[
  {
    "id": "journal-abc-123",
    "date": "2026-01-07",
    "energy_morning": 7,
    "energy_evening": 6,
    ...
  }
]
```

### Create Ritual (POST /rituals/)
**Status**: `201 Created`
```json
{
  "id": "ritual-xyz-456",
  "label": "Morning meditation",
  "icon": "🧘",
  "completed": false,
  "category": "morning",
  "order": 1,
  "user_id": "jay"
}
```

### List Rituals (GET /rituals/)
**Status**: `200 OK`
```json
[
  {
    "id": "ritual-xyz-456",
    "label": "Morning meditation",
    "icon": "🧘",
    "completed": false,
    "category": "morning",
    "order": 1,
    "user_id": "jay"
  }
]
```

### Reset Rituals (POST /rituals/reset)
**Status**: `200 OK`
```json
{
  "message": "All rituals reset successfully"
}
```

---

## 🔍 Troubleshooting

### Erreur 401 Unauthorized
**Cause**: Header `X-User-ID` manquant
**Solution**: Ajouter `-H "X-User-ID: jay"` à toutes les requêtes

### Erreur 400 Bad Request (Duplicate Date)
**Cause**: Un journal existe déjà pour cette date
**Solution**: Utiliser une autre date ou supprimer le journal existant

### Erreur 422 Validation Error
**Cause**: Données invalides (ex: energy > 10, category invalide)
**Solution**: Vérifier les valeurs (energy: 0-10, category: morning|evening|daily|custom)

### Erreur 404 Not Found
**Cause**: Ressource inexistante ou appartient à un autre user
**Solution**: Vérifier l'ID de la ressource et le user_id

---

**Version**: 1.0.0
**Date**: 2026-01-07
**Tests Coverage**: 52/52 tests passing (100%)
