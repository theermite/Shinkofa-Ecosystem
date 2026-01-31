# Conventions Techniques

> Règles de style et nommage applicables à tous les projets Jay/Shinkofa.

---

## Nommage des Fichiers

**Convention : Title-Kebab-Case**

| Type | Pattern | Exemple |
|------|---------|---------|
| Documentation | `Title-Kebab-Case.md` | `Best-Practices-Desktop.md` |
| Config | `kebab-case.ext` | `docker-compose.yml` |
| Code source | Selon langage | `my_module.py`, `MyComponent.tsx` |

**Règles :**
- Chaque mot commence par une majuscule
- Mots séparés par des tirets `-`
- Pas d'underscores dans les noms de fichiers `.md`
- Pas de TOUT MAJUSCULE (exceptions : `README.md`, `LICENSE`, `CHANGELOG.md`)

**Exemples :**

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| `Best-Practices.md` | `BEST-PRACTICES.md` |
| `Session-Templates.md` | `session_templates.md` |
| `Audit-Rapport-2026.md` | `AUDIT-RAPPORT-2026.md` |
| `User-Guide.md` | `USER-GUIDE.md` |

---

## Nommage des Dossiers

**Convention : Title-Kebab-Case**

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| `Quick-Refs/` | `quick-refs/`, `QuickRefs/` |
| `Best-Practices/` | `best_practices/`, `BEST-PRACTICES/` |
| `Core/` | `core/`, `CORE/` |

**Exception** : Dossiers standards du langage (`src/`, `docs/`, `tests/`, `node_modules/`, `venv/`)

---

## Commits Git

**Convention : Conventional Commits**

```
type(scope): description courte

[corps optionnel]

[footer optionnel]
```

### Types autorisés

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `style` | Formatage (pas de changement logique) |
| `refactor` | Refactoring (pas de feat/fix) |
| `perf` | Amélioration performance |
| `test` | Ajout/correction tests |
| `chore` | Maintenance, dépendances, config |

### Exemples

```bash
feat(ui): Add dark mode toggle
fix(audio): Handle variable chunk sizes for Silero VAD
docs(readme): Update installation instructions
refactor(api): Extract validation logic to separate module
chore(deps): Update FastAPI to 0.109.0
```

### Règles
- Description en anglais, impératif présent ("Add" pas "Added")
- Première lettre majuscule après le `:`
- Pas de point final
- Max 72 caractères pour la première ligne

---

## Branches Git

**Convention : type/description-courte**

| Type | Usage | Exemple |
|------|-------|---------|
| `feat/` | Nouvelle feature | `feat/energy-tracking` |
| `fix/` | Correction bug | `fix/vad-crash` |
| `refactor/` | Refactoring | `refactor/audio-module` |
| `docs/` | Documentation | `docs/api-guide` |
| `chore/` | Maintenance | `chore/update-deps` |

---

## Code Style par Langage

### Python (PEP8)

```python
# Variables et fonctions : snake_case
user_name = "Jay"
def process_audio_chunk():
    pass

# Classes : PascalCase
class AudioCapture:
    pass

# Constantes : SCREAMING_SNAKE_CASE
MAX_RETRY_COUNT = 3
DEFAULT_SAMPLE_RATE = 16000

# Fichiers : snake_case.py
# audio_capture.py, text_formatter.py
```

### TypeScript / JavaScript

```typescript
// Variables et fonctions : camelCase
const userName = "Jay";
function processAudioChunk() {}

// Classes et Composants React : PascalCase
class AudioCapture {}
const UserProfile: React.FC = () => {};

// Constantes : SCREAMING_SNAKE_CASE ou camelCase
const MAX_RETRY_COUNT = 3;
const defaultConfig = {};

// Fichiers composants : PascalCase.tsx
// UserProfile.tsx, EnergyCheckIn.tsx

// Fichiers utils : camelCase.ts
// audioUtils.ts, apiClient.ts
```

### CSS / SCSS

```css
/* Convention BEM : block__element--modifier */
.card {}
.card__header {}
.card__header--highlighted {}

.user-profile {}
.user-profile__avatar {}
.user-profile__avatar--large {}
```

---

## Tests

### Nommage fichiers

| Langage | Pattern | Exemple |
|---------|---------|---------|
| Python | `test_*.py` | `test_audio_capture.py` |
| TypeScript | `*.test.ts(x)` | `UserProfile.test.tsx` |
| JavaScript | `*.test.js` | `apiClient.test.js` |

### Nommage fonctions test

```python
# Python : test_<action>_<condition>_<expected>
def test_process_audio_with_silence_returns_empty():
    pass

def test_validate_config_missing_api_key_raises_error():
    pass
```

```typescript
// TypeScript : describe + it
describe('AudioCapture', () => {
  it('should return empty when audio is silent', () => {});
  it('should throw error when config is missing API key', () => {});
});
```

---

## Langue

| Contexte | Langue |
|----------|--------|
| Documentation (`.md`) | Français |
| UI/Plateforme/Site | Français (i18n-ready) |
| Code source | Anglais |
| Commentaires code | Anglais |
| Commits | Anglais |
| Variables/fonctions | Anglais |
| Logs applicatifs | Anglais |

**i18n-ready** : Toujours utiliser des clés de traduction, jamais de texte hardcodé.

```typescript
// ✅ Correct
t('auth.login.button')

// ❌ Incorrect
"Se connecter"
```

---

## UI/UX - Standards Obligatoires

### Accessibilité WCAG AAA

| Critère | Exigence |
|---------|----------|
| Contraste texte | Ratio minimum **7:1** (AAA) |
| Contraste grands textes | Ratio minimum **4.5:1** (AAA) |
| Focus visible | Outline clair sur tous éléments interactifs |
| Navigation clavier | 100% fonctionnel sans souris |
| ARIA labels | Sur tous éléments interactifs |

### Composants obligatoires

| Composant | Spécification |
|-----------|---------------|
| **Password toggle** | Bouton reveal/hide sur tous champs mot de passe |
| **Back to top** | Bouton flottant après 300px scroll |
| **Skip to content** | Lien accessible en premier focus |
| **Loading states** | Skeleton ou spinner sur toute action async |
| **Error messages** | Clairs, actionnables, liés au champ |

### Contraste - Exemples

```css
/* ✅ WCAG AAA compliant */
.text-primary {
  color: #1a1a1a;      /* Sur fond blanc : ratio 16:1 */
  background: #ffffff;
}

.text-on-dark {
  color: #ffffff;      /* Sur fond sombre : ratio 12:1 */
  background: #1a1a1a;
}

/* ❌ Non compliant */
.text-low-contrast {
  color: #767676;      /* Ratio 4.5:1 - AA seulement */
  background: #ffffff;
}
```

### Password Toggle Pattern

```tsx
// Composant standard
<div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    aria-describedby="password-toggle"
  />
  <button
    id="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

---

## Résumé Rapide

| Élément | Convention |
|---------|------------|
| Fichiers `.md` | `Title-Kebab-Case.md` |
| Dossiers | `Title-Kebab-Case/` |
| Commits | `type(scope): Description` |
| Branches | `type/description-courte` |
| Python | `snake_case`, `PascalCase` classes |
| TypeScript | `camelCase`, `PascalCase` composants |
| CSS | BEM `.block__element--modifier` |
| Docs | Français |
| Code | Anglais |
| Accessibilité | WCAG AAA (ratio 7:1) |

---

**Version** : 1.0 | **Date** : 2026-01-21 | **Applicabilité** : Tous projets Jay/Shinkofa
