# Guide de Contribution - Shinkofa Ecosystem

> Comment contribuer au MonoRepo Shinkofa

## 🎯 Workflow Git

### Branches

- `main` - Production (shinkofa.com, app.shinkofa.com)
- `develop` - Développement (local)
- `feature/*` - Nouvelles fonctionnalités
- `fix/*` - Corrections de bugs
- `hotfix/*` - Corrections urgentes production

### Créer une Feature

```bash
# Depuis develop
git checkout develop
git pull origin develop

# Créer branche
git checkout -b feature/ma-nouvelle-feature

# Développer
# ... code ...

# Commit (voir Conventions ci-dessous)
git add .
git commit -m "feat(michi): add user profile page"

# Push
git push origin feature/ma-nouvelle-feature

# Créer PR sur GitHub vers develop
```

---

## 📝 Conventions de Commit

Utiliser **Conventional Commits**:

```
type(scope): description

[corps optionnel]

[footer optionnel]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring (ni feat ni fix)
- `perf`: Amélioration performance
- `test`: Ajout/modification tests
- `chore`: Tâches diverses (build, deps)
- `ci`: CI/CD

### Scopes

- `site-vitrine`: Site marketing
- `michi`: Plateforme app.shinkofa.com
- `api-shizen`: API Backend
- `ui`: Package @shinkofa/ui
- `types`: Package @shinkofa/types
- `morphic`: Package @shinkofa/morphic-engine
- Etc.

### Exemples

```bash
feat(michi): add Design Humain questionnaire page
fix(api-shizen): correct task priority calculation
docs(readme): update installation instructions
refactor(ui): extract Button component variants
perf(michi): optimize profile page rendering
test(api-shizen): add unit tests for rituals endpoint
chore(deps): update Next.js to 15.1.0
```

---

## 🏗️ Ajouter une Nouvelle App

### 1. Consulter PORTS.md

```bash
cat PORTS.md
# Choisir port disponible (ex: 3016)
```

### 2. Créer Structure

```bash
mkdir -p apps/mon-app
cd apps/mon-app
```

### 3. package.json

```json
{
  "name": "@shinkofa/mon-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@shinkofa/types": "workspace:*",
    "@shinkofa/ui": "workspace:*",
    "@shinkofa/utils": "workspace:*"
  },
  "devDependencies": {
    "@shinkofa/tsconfig": "workspace:*"
  }
}
```

### 4. Mettre à Jour PORTS.md

```markdown
| **3016** | `@shinkofa/mon-app` | http://localhost:3016 | ✅ | Description |
```

### 5. Installer

```bash
cd ../..  # Retour racine MonoRepo
pnpm install
```

---

## 📦 Ajouter un Package Partagé

### 1. Créer Structure

```bash
mkdir -p packages/mon-package/src
cd packages/mon-package
```

### 2. package.json

```json
{
  "name": "@shinkofa/mon-package",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "@shinkofa/tsconfig": "workspace:*",
    "typescript": "^5.3.3"
  }
}
```

### 3. tsconfig.json

```json
{
  "extends": "@shinkofa/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## 🧪 Tests

### Lancer Tests

```bash
# Tous les tests
pnpm test

# App spécifique
pnpm --filter @shinkofa/michi test

# Avec coverage
pnpm test:coverage
```

### Écrire Tests

```typescript
// apps/michi/tests/profile.test.ts
import { render, screen } from '@testing-library/react';
import ProfilePage from '../src/app/[locale]/profile/page';

describe('ProfilePage', () => {
  it('renders profile title', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
  });
});
```

---

## 🎨 Design System

### Utiliser @shinkofa/ui

```typescript
import { Button, Card, Input } from '@shinkofa/ui';

function MyComponent() {
  return (
    <Card variant="elevated" padding="lg">
      <Input label="Email" type="email" />
      <Button variant="primary">Valider</Button>
    </Card>
  );
}
```

### Couleurs Shinkofa

```css
/* Dans Tailwind */
<div className="bg-bleu-profond text-blanc-pur">
<Button className="bg-accent-lumineux hover:bg-accent-doux">
```

---

## 🌍 Internationalisation

### Ajouter Traductions

```typescript
// apps/mon-app/src/locales/fr.json
{
  "welcome": "Bienvenue",
  "profile": {
    "title": "Mon Profil"
  }
}
```

### Utiliser dans Code

```typescript
import { useTranslation } from '@shinkofa/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('welcome')}</h1>;
}
```

---

## 🔍 Code Review Checklist

### Avant de Soumettre PR

- [ ] Code lint sans erreurs (`pnpm lint`)
- [ ] Types corrects (`pnpm type-check`)
- [ ] Build réussit (`pnpm build`)
- [ ] Tests passent (`pnpm test`)
- [ ] Commits suivent conventions
- [ ] README.md mis à jour si nécessaire
- [ ] PORTS.md mis à jour si nouveau port

### Ce qu'on Vérifie en Review

- **Fonctionnel**: Fait ce qui est demandé
- **Qualité**: Code propre, lisible
- **Performance**: Pas de ralentissements
- **Sécurité**: Pas de vulnérabilités
- **Accessibilité**: WCAG 2.1 AA respecté
- **Tests**: Couverture adéquate
- **Documentation**: Code commenté si complexe

---

## 🚀 Déploiement

Voir **[DEPLOYMENT.md](./DEPLOYMENT.md)** pour guide complet.

---

## 📞 Aide

- **Issues GitHub**: Pour bugs et features
- **Discussions**: Pour questions générales
- **Discord Shinkofa**: Pour support communauté

---

**Merci de contribuer à l'écosystème Shinkofa!** 🙏
