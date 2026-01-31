---
description: Scaffold un composant React production-ready avec TypeScript, tests et styles
---

# Nouvelle Composant React

Génère un composant React production-ready complet avec :

**Arguments** : `<ComponentName>` (PascalCase)

**Fichiers générés** :
- `<ComponentName>.tsx` : Composant TypeScript avec props typées
- `<ComponentName>.module.css` : Styles CSS modules scoped
- `<ComponentName>.test.tsx` : Tests Jest + React Testing Library

**Template inclus** :
- TypeScript strict mode
- Props interface typée
- React.memo pour performance
- useState, useCallback hooks si pertinent
- Error boundary handling
- ARIA labels accessibilité WCAG 2.1 AA
- Loading/error states
- Responsive design
- Docstring JSDoc complète

**Standards qualité** :
- Type-safe complet
- Tests coverage ≥ 80%
- Accessibilité clavier + screen readers
- Contraste couleurs ≥ 4.5:1
- Performance optimisée (memo, useCallback)

**Exemple utilisation** :
```bash
/new-react-component UserCard
```

Génère :
- `UserCard.tsx`
- `UserCard.module.css`
- `UserCard.test.tsx`

**Référence template** : `.claude/templates/react-component-template.tsx`
