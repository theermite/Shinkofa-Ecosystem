# Kosei - Profil Holistique Builder

> Construction et gestion du profil holistique (Design Humain + Neurodivergence)

## 🎯 Description

Kosei Builder permet de créer, visualiser et gérer ton profil holistique Shinkofa. Il intègre:
- **Design Humain** (Type, Autorité, Profil, Centres définis, Portes)
- **Neurodivergence** (TDAH, TSA, HPI, Hypersensible, Multipotentiel)
- **Préférences Morphiques** (Theme, accessibilité, cycles énergétiques)

## 🚀 Développement

```bash
# Depuis la racine du MonoRepo
pnpm install

# Lancer Kosei en dev
pnpm --filter @shinkofa/kosei dev

# Build production
pnpm --filter @shinkofa/kosei build
```

## 📦 Dépendances

- **@shinkofa/morphic-engine** - Génération profil morphique
- **@shinkofa/ui** - Composants UI
- **@shinkofa/i18n** - Multilingue (FR/EN/ES)
- **@shinkofa/types** - Types profil holistique

## 🎨 Features

- ✅ Formulaire création profil Design Humain
- ✅ Sélection neurodivergences multiples
- ✅ Configuration préférences morphiques
- ✅ Visualisation profil holistique complet
- ⏳ Calcul automatique Design Humain (date/heure/lieu naissance)
- ⏳ Export/Import profil (JSON)
- ⏳ Intégration Shizen API

## 📁 Structure

```
kosei/
├── src/
│   ├── pages/          # Pages formulaire & profil
│   ├── components/     # Composants spécifiques Kosei
│   ├── locales/        # Traductions
│   └── ...
└── package.json
```

## 🌐 URLs

- **Dev**: http://localhost:3001
- **ALPHA**: https://kosei.alpha.shinkofa.com (à venir)
- **PROD**: https://kosei.shinkofa.com (à venir)
