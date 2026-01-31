# /new-react-component

> Scaffold un composant React production-ready avec tests et styles.

**Version** : 1.0.0
**Durée** : ~30 secondes

---

## 🎯 Objectif

Composant React avec :
- **TypeScript** : Types + interfaces
- **Tests** : Vitest + React Testing Library
- **Styles** : TailwindCSS ou CSS Module
- **Storybook** : Story file (optionnel)

---

## 📋 Usage

```bash
/new-react-component UserProfile
/new-react-component Button --atomic  # Atomic design
/new-react-component LoginForm --with-story
```

---

## 🔧 Workflow

### 1. Déterminer Emplacement

**Atomic Design** :
- `--atomic` → `src/components/atoms/`
- `--molecule` → `src/components/molecules/`
- `--organism` → `src/components/organisms/`
- Par défaut → `src/components/`

---

### 2. Créer Fichiers

```typescript
// src/components/UserProfile.tsx
import { FC } from 'react';

interface UserProfileProps {
  userId: number;
  name: string;
}

export const UserProfile: FC<UserProfileProps> = ({ userId, name }) => {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <p>ID: {userId}</p>
    </div>
  );
};
```

```typescript
// src/components/UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user name', () => {
    render(<UserProfile userId={1} name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

```css
/* src/components/UserProfile.module.css (si pas Tailwind) */
.user-profile {
  padding: 1rem;
  border: 1px solid #ccc;
}
```

---

### 3. Story File (si --with-story)

```typescript
// src/components/UserProfile.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserProfile } from './UserProfile';

const meta: Meta<typeof UserProfile> = {
  component: UserProfile,
  title: 'Components/UserProfile',
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
  args: {
    userId: 1,
    name: 'John Doe',
  },
};
```

---

## 🚀 Next Steps

```markdown
✅ Component created: <ComponentName>

Files:
  - <ComponentName>.tsx
  - <ComponentName>.test.tsx
  - <ComponentName>.module.css (if not Tailwind)
  - <ComponentName>.stories.tsx (if --with-story)

Test:
  npm test <ComponentName>

Storybook:
  npm run storybook
```

---

**Version** : 1.0.0
