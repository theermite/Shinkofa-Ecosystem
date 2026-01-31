# Lessons Learned - Frontend & UI

> Leçons apprises liées au frontend, React, Next.js, CSS, UI/UX.

---

## 📊 Statistiques

**Leçons documentées** : 8
**Dernière mise à jour** : 2026-01-29

---

## Leçons

### 1. React Key Prop avec Index vs Unique ID

**Contexte** : Listes dynamiques avec map() dans React

**Problème** :
```tsx
// ❌ Using array index as key (bug si liste modifiée)
{items.map((item, index) => (
  <ListItem key={index} data={item} />
))}
```

**Symptômes** :
- 🐛 Composants gardent ancien state après tri
- 🐛 Input focus perdu après insertion
- 🐛 Animations incorrectes

**Exemple concret** :
```tsx
// Items: [{id: 1, text: "A"}, {id: 2, text: "B"}]
// Utilisateur clique "delete B"
// React voit: index 0 et 1 existent toujours
// → Supprime index 1, garde composant index 0 AVEC SON STATE
// → Si input avait focus, focus perdu
```

**Solution** :
```tsx
// ✅ Using unique stable ID
{items.map((item) => (
  <ListItem key={item.id} data={item} />
))}

// Si pas d'ID, générer UUID à la création
import { v4 as uuidv4 } from 'uuid';
const newItem = { id: uuidv4(), ...data };
```

**Impact** :
- ✅ React réconciliation correcte
- ✅ State préservé lors tri/filtrage
- ✅ Performance optimisée (pas de re-render inutile)

**Catégorie** : Bug Fix
**Tags** : react, keys, state, reconciliation

---

### 2. useState vs useRef pour Valeurs Non-Render

**Contexte** : Stocker valeurs qui ne déclenchent pas re-render

**Problème** :
```tsx
// ❌ useState pour timer ID (re-render inutile)
const [timerId, setTimerId] = useState<number | null>(null);

useEffect(() => {
  const id = setTimeout(() => console.log("tick"), 1000);
  setTimerId(id);  // ⚠️ Re-render alors que UI ne change pas
  return () => clearTimeout(timerId!);
}, []);
```

**Coût** :
- 🐌 Re-render inutile à chaque update
- 🐌 Composants enfants re-render aussi

**Solution** :
```tsx
// ✅ useRef pour valeurs non-UI
const timerIdRef = useRef<number | null>(null);

useEffect(() => {
  timerIdRef.current = setTimeout(() => console.log("tick"), 1000);
  return () => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
  };
}, []);
```

**Règle** :
- **useState** : Valeur affecte UI → re-render nécessaire
- **useRef** : Valeur interne (timer, DOM ref, previous value) → pas de re-render

**Impact** :
- ✅ Performance optimisée (moins de renders)
- ✅ Code intention claire

**Catégorie** : Performance
**Tags** : react, hooks, useRef, useState, optimization

---

### 3. CSS-in-JS Runtime vs Zero-Runtime (Tailwind)

**Contexte** : Styling dans React apps

**Problème** :
```tsx
// ❌ CSS-in-JS runtime (Styled Components, Emotion)
import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? '#007acc' : '#ccc'};
  padding: 8px 16px;
  border-radius: 4px;
`;

// ⚠️ JS exécuté à chaque render pour générer CSS
// ⚠️ Bundle size +50KB (runtime library)
```

**Coût** :
- 🐌 Overhead runtime (parsing, injection CSS)
- 📦 Bundle size inflated
- 🐌 First Contentful Paint retardé

**Solution** :
```tsx
// ✅ Zero-runtime CSS (Tailwind, CSS Modules)
<button className={cn(
  "px-4 py-2 rounded",
  primary ? "bg-blue-600" : "bg-gray-300"
)}>
  Click me
</button>

// CSS généré au BUILD, pas au runtime
// Purge classes inutilisées → bundle optimisé
```

**Impact** :
- ✅ Pas de JS runtime pour styles
- ✅ Bundle -50KB typical
- ✅ FCP improved (~200ms faster)

**Trade-offs** :
- ❌ Moins de flexibilité dynamique (mais 95% use cases OK)
- ✅ Performance > Developer Experience (Shinkofa: accessibilité > DX)

**Catégorie** : Architecture
**Tags** : css, tailwind, performance, bundle-size

---

### 4. Form Validation Côté Client (react-hook-form + zod)

**Contexte** : Formulaires avec validation

**Problème** :
```tsx
// ❌ Validation manuelle (verbose, non-réutilisable)
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (!email) {
    setEmailError('Email required');
    return;
  }
  if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(email)) {
    setEmailError('Invalid email format');
    return;
  }
  // Submit...
};
```

**Problèmes** :
- 🐛 Validation dupliquée pour chaque field
- 🐛 Pas de validation temps réel
- 🐛 Pas de TypeScript safety

**Solution** :
```tsx
// ✅ react-hook-form + zod (déclaratif, type-safe)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+').max(120),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Data déjà validé et typé
    api.submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

**Impact** :
- ✅ Validation centralisée (réutilisable backend si zod server-side)
- ✅ TypeScript inference automatique
- ✅ Validation temps réel + onBlur + onSubmit
- ✅ UX améliorée (feedback immédiat)

**Catégorie** : Best Practice
**Tags** : react, forms, validation, zod, react-hook-form

---

### 5. Mobile Drawer z-index et Positionnement Hors Parent

**Date** : 2026-01-29 | **Projet** : Shinkofa | **Sévérité** : 🟠 Élevé

**Contexte** : Menu drawer mobile dans une navbar avec z-index

**Problème** :
```tsx
// ❌ Drawer INSIDE nav element (stacking context issues)
<nav className="z-50">
  <div className="max-w-7xl mx-auto">
    {/* navbar content */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-40">  {/* Backdrop */}</div>
      <div className="fixed right-0 z-50">  {/* Drawer - même z que nav! */}</div>
    )}
  </div>
</nav>
```

**Symptômes** :
- 🐛 Drawer invisible ou partiellement visible
- 🐛 Backdrop ne couvre pas tout l'écran
- 🐛 Clics ne fonctionnent pas

**Solution** :
```tsx
// ✅ Drawer OUTSIDE nav element (React Fragment)
<>
  <nav className="z-50">
    {/* navbar content only */}
  </nav>

  {/* Drawer separate, high z-index */}
  {isMobileMenuOpen && (
    <div className="md:hidden">
      <div className="fixed inset-0 z-[9998] bg-black/60" />
      <div className="fixed inset-y-0 right-0 z-[9999] bg-white">
        {/* drawer content */}
      </div>
    </div>
  )}
</>
```

**Impact** :
- ✅ Drawer toujours au-dessus de tout
- ✅ Pas de conflits de stacking context
- ✅ Backdrop couvre correctement

**Catégorie** : Bug Fix
**Tags** : react, css, z-index, mobile, drawer

---

### 6. Race Condition AuthContext isLoading

**Date** : 2026-01-29 | **Projet** : Shinkofa | **Sévérité** : 🟠 Élevé

**Contexte** : Page qui redirige selon état auth (homepage, dashboard)

**Problème** :
```tsx
// ❌ Ne vérifie pas isLoading
export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    return <Redirect to="/dashboard" />
  }

  // ⚠️ Premier render: isAuthenticated=false (auth pas chargée)
  // → Affiche page login même si user connecté
  return <LoginPage />
}
```

**Symptômes** :
- 🐛 Flash de page login pour users connectés
- 🐛 Redirect vers login alors qu'on est authentifié
- 🐛 Intermittent (dépend de vitesse réseau)

**Solution** :
```tsx
// ✅ Toujours vérifier isLoading d'abord
export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()

  // 1. Loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // 2. Auth check (après loading terminé)
  if (isAuthenticated && user) {
    return <Redirect to="/dashboard" />
  }

  // 3. Non authentifié (certain)
  return <LoginPage />
}
```

**Règle** : Pattern à suivre pour TOUTE page avec logique auth :
```tsx
const { isAuthenticated, isLoading } = useAuth()
if (isLoading) return <Loading />
if (isAuthenticated) { /* logique auth */ }
```

**Catégorie** : Bug Fix
**Tags** : react, auth, race-condition, isLoading, context

---

### 7. Logo Href Dynamique Selon Auth

**Date** : 2026-01-29 | **Projet** : Shinkofa | **Sévérité** : 🟡 Moyen

**Contexte** : Logo cliquable dans navbar, comportement selon auth

**Problème** :
```tsx
// ❌ Logo toujours vers "/" (homepage)
<Link href="/">
  <Logo />
</Link>

// Si user connecté:
// 1. Clic logo → "/" (homepage)
// 2. Homepage vérifie auth → redirect "/dashboard"
// 3. Race condition possible (voir leçon #6)
```

**Solution** :
```tsx
// ✅ Logo direct vers destination correcte
<Link href={isAuthenticated ? "/dashboard" : "/"}>
  <Logo />
</Link>

// User connecté: logo → /dashboard (direct)
// User non connecté: logo → / (homepage/landing)
```

**Impact** :
- ✅ Pas de redirect intermédiaire
- ✅ Évite race condition homepage
- ✅ UX plus rapide (1 navigation au lieu de 2)

**Catégorie** : UX Improvement
**Tags** : react, navigation, auth, ux

---

### 8. Nginx Cache Headers pour Next.js

**Date** : 2026-01-29 | **Projet** : Shinkofa | **Sévérité** : 🟠 Élevé

**Contexte** : Users voient ancienne version du site malgré déploiement

**Problème** :
```nginx
# ❌ Pas de headers cache explicites
location / {
    proxy_pass http://localhost:3000;
}
# → Navigateur cache HTML pages
# → Users ne voient pas les mises à jour
```

**Solution** :
```nginx
# ✅ Cache différencié HTML vs assets
# Static assets - cache agressif (fichiers avec hash)
location /_next/static/ {
    proxy_pass http://localhost:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML pages - pas de cache (toujours vérifier)
location / {
    proxy_pass http://localhost:3000;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
}
```

**Logique** :
- **Assets JS/CSS** : Noms avec hash (`chunk-abc123.js`) → cache 1 an OK
- **HTML** : Référence les assets → doit être frais pour pointer vers nouveaux assets

**Impact** :
- ✅ Users obtiennent nouvelle version immédiatement
- ✅ Assets toujours cachés (performance)
- ✅ Pas besoin de "vider le cache" côté user

**Catégorie** : DevOps
**Tags** : nginx, cache, next.js, deployment

---

## 💡 Patterns Communs

**State Management** :
- `useState` pour UI state
- `useRef` pour valeurs non-render (timers, refs)
- Context pour state global léger
- Zustand/Redux si state complexe (>5 contexts)

**Performance** :
- Keys avec ID unique, pas index
- Tailwind > CSS-in-JS (bundle size)
- `React.memo()` sur composants lourds avec props stables
- `useMemo/useCallback` si calculs coûteux

**Validation** :
- react-hook-form + zod (forms complexes)
- Zod schema partagé frontend/backend (DRY)
- Validation côté client + backend (défense en profondeur)

**Accessibilité** :
- ARIA labels sur inputs (<label> ou aria-label)
- Focus management (modals, navigation)
- Keyboard navigation (Tab, Enter, Escape)
- Contraste WCAG AA minimum (4.5:1)

---

## 🔗 Voir Aussi

- [deps.md](deps.md) - Dépendances frontend
- [performance.md](performance.md) - Performance UI

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
