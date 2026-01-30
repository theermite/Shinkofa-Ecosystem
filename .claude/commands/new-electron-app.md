# /new-electron-app

> Scaffold une application Electron desktop production-ready.

**Version** : 1.0.0
**Durée** : ~2 minutes

---

## 🎯 Objectif

Application Electron multi-plateforme (Windows, macOS, Linux) avec :
- **Main Process** : Node.js + TypeScript
- **Renderer** : React 18 + TypeScript
- **Database** : SQLite (better-sqlite3)
- **IPC** : Type-safe communication
- **Build** : electron-builder
- **Tests** : Vitest + Playwright for Electron

---

## 📋 Usage

```bash
/new-electron-app my-desktop-app
/new-electron-app my-app --skip-install
```

---

## 🔧 Workflow

```bash
# 1. Copy template
cp -r Prompt-2026-Optimized/templates/electron-app/ ./<project-name>/

# 2. Replace placeholders
cd <project-name>
sed -i "s/my-electron-app/<project-name>/g" package.json
find .claude/docs -type f -name "*.md" -exec sed -i "s/\[Nom Electron App\]/<ProjectName>/g" {} +

# 3. Install (if not --skip-install)
npm install

# 4. Run dev
npm run dev
```

---

## 🚀 Next Steps

```markdown
✅ Created: <project-name>

Dev:
  npm run dev

Build distributables:
  npm run dist          # All platforms
  npm run dist:win      # Windows installer
  npm run dist:mac      # macOS DMG
  npm run dist:linux    # AppImage + deb

Output: dist/
```

---

**Version** : 1.0.0
