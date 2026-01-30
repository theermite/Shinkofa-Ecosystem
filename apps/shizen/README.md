# Shizen - Compagnon IA Personnalisé

> Compagnon IA adaptatif de l'écosystème Shinkofa

## 🎯 Description

Shizen est l'assistant IA personnel qui s'adapte à ton profil holistique (Design Humain + neurodivergence) pour t'accompagner au quotidien. Il utilise le **Morphic Engine** pour personnaliser ses réponses et recommandations.

## 🚀 Développement

```bash
# Depuis la racine du MonoRepo
pnpm install

# Lancer Shizen en dev
pnpm --filter @shinkofa/shizen dev

# Build production
pnpm --filter @shinkofa/shizen build

# Lint
pnpm --filter @shinkofa/shizen lint
```

## 📦 Dépendances

- **@shinkofa/ui** - Composants UI Shinkofa
- **@shinkofa/morphic-engine** - Adaptation morphique
- **@shinkofa/i18n** - Système multilingue (FR/EN/ES)
- **@shinkofa/types** - Types TypeScript partagés
- **@shinkofa/utils** - Utilitaires communs

## 🎨 Features

- ✅ Adaptation morphique selon profil holistique
- ✅ Multilingue (FR/EN/ES)
- ✅ Indicateur niveau d'énergie temps réel
- ✅ Guidance Design Humain contextuelle
- ⏳ Interface chat IA (à venir)
- ⏳ Intégration Shizen AI API (à venir)

## 📁 Structure

```
shizen/
├── src/
│   ├── pages/          # Pages React Router
│   ├── locales/        # Traductions (fr/en/es)
│   ├── styles/         # Styles globaux
│   ├── App.tsx         # App principale
│   └── main.tsx        # Point d'entrée
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🌐 URLs

- **Dev**: http://localhost:3000
- **ALPHA**: https://shizen.alpha.shinkofa.com (à venir)
- **PROD**: https://shizen.shinkofa.com (à venir)

## 🔧 Configuration

L'app utilise les configurations partagées:
- **ESLint**: `@shinkofa/config/eslint`
- **Prettier**: `@shinkofa/config/prettier`
- **Tailwind**: `@shinkofa/config/tailwind`
- **TypeScript**: `@shinkofa/tsconfig/react`

## 📝 Notes

- Vite 5 avec cache busting automatique (hash dans noms fichiers)
- Support dark mode via Morphic Engine
- Accessibilité WCAG 2.1 AA (reduced motion, contrast, keyboard navigation)
