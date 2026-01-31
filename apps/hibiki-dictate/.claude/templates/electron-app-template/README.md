# Electron App Template

Template production-ready pour applications Electron cross-platform (Windows + Linux).

## Structure

```
app-name/
├── src/
│   ├── main/          # Processus principal Electron
│   ├── renderer/      # Interface React
│   └── shared/        # Code partagé
├── build/             # Ressources build (icons, assets)
├── dist/              # Builds compilés
└── package.json       # Configuration npm
```

## Installation

```bash
npm install
```

## Développement

```bash
npm start    # Lance app mode dev avec hot reload
```

## Build Production

```bash
npm run build      # Build renderer + main
npm run package    # Package app (Windows + Linux)
npm run make       # Crée installeurs distribués
```

## Fonctionnalités Incluses

- ✅ Architecture sécurisée (context isolation)
- ✅ IPC secure via preload script
- ✅ React 18+ frontend moderne
- ✅ Vite bundler rapide
- ✅ Auto-updates (electron-updater)
- ✅ Menu application custom
- ✅ Packaging multi-platform
- ✅ Hot reload développement
- ✅ TypeScript support (optionnel)

## Sécurité

- Context isolation activée
- Node integration désactivée renderer
- Preload script secure IPC
- CSP (Content Security Policy) headers
- HTTPS/SSL obligatoire production

## Packaging

**Windows**:
- `.exe` portable
- Installeur NSIS

**Linux**:
- `.AppImage` portable
- `.deb` package (Debian/Ubuntu)

## License

MIT
