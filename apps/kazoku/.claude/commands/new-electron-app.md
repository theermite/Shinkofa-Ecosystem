---
description: Scaffold une application Electron production-ready cross-platform (Windows + Linux)
---

# Nouvelle Application Electron

Génère une application Electron production-ready complète avec :

**Arguments** : `<app-name>` (kebab-case)

**Structure générée** :
```
<app-name>/
├── src/
│   ├── main/
│   │   ├── main.js           # Processus principal Electron
│   │   ├── preload.js        # Script preload secure IPC
│   │   └── menu.js           # Menu application
│   ├── renderer/
│   │   ├── index.html        # HTML principal
│   │   ├── App.jsx           # Composant React principal
│   │   ├── styles/           # Styles CSS/SCSS
│   │   └── components/       # Composants React
│   └── shared/
│       ├── constants.js      # Constants partagées
│       └── utils.js          # Utilitaires communs
├── build/                    # Ressources build (icons, etc.)
├── dist/                     # Builds compilés
├── package.json              # Config npm + scripts
├── electron-builder.json     # Config packaging
├── forge.config.js           # Config Electron Forge
└── README.md                 # Documentation complète
```

**Fonctionnalités incluses** :
- Architecture processus principal + renderer sécurisée
- IPC (Inter-Process Communication) secure via preload script
- Context isolation activée (sécurité)
- React frontend moderne (hooks, TypeScript optionnel)
- Menu application custom (File, Edit, View, Help)
- Auto-updates (electron-updater)
- Packaging Windows (.exe, installer NSIS) + Linux (.AppImage, .deb)
- Intégration système (notifications, tray icon)
- Dev tools activés développement
- Hot reload development

**Scripts package.json** :
- `npm start` : Lance app mode développement
- `npm run build` : Build production (renderer + main)
- `npm run package` : Package app (Windows + Linux)
- `npm run make` : Crée installeurs distribués
- `npm test` : Lance tests

**Template inclus** :
- Electron latest stable
- React 18+ frontend
- Vite bundler rapide
- electron-builder packaging multi-platform
- Sécurité : contextIsolation, nodeIntegration disabled, preload secure
- Auto-updates intégré
- Icon set (Windows .ico, Linux .png)

**Standards qualité** :
- Sécurité Electron best practices
- Performance optimisée (lazy loading, code splitting)
- Cross-platform compatible (Windows 11 + Linux)
- README complet (install, dev, build, distribute)
- Tests Electron + React

**Exemple utilisation** :
```bash
/new-electron-app personal-dashboard
```

Génère app Electron complète prête à développer.

**Référence template** : `.claude/templates/electron-app-template/`
