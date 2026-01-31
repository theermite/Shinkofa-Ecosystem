# 📦 Instructions TAKUMI - Claude Code Terminal

## 🎯 Version Terminal vs Web

Ce repo contient **2 versions** des instructions TAKUMI :

### 🌐 CLAUDE.md - Pour Claude Code Web
**Utiliser quand** :
- Tu travailles depuis navigateur (claude.ai/code)
- Projet sur repo GitHub distant
- Pas d'accès local nécessaire
- Développement depuis n'importe où

**Limitations** :
- ❌ Pas d'accès fichiers locaux direct
- ❌ Pas d'accès Internet
- ❌ Connaissance limitée à janvier 2025

---

### 💻 CLAUDE-TERMINAL.md - Pour Claude Code Terminal
**Utiliser quand** :
- Tu travailles depuis terminal local (Windows/Linux)
- Projet dans dossiers locaux sur tes machines
- Besoin accès Internet (docs, APIs, assets)
- Deploy direct VPS/o2Switch depuis local

**Avantages** :
- ✅ Accès DIRECT fichiers locaux
- ✅ Accès Internet (recherche docs, vérif versions, APIs)
- ✅ Connaissance novembre 2025
- ✅ Tests locaux immédiats
- ✅ Debugging complet
- ✅ Deploy SSH/FTP direct

---

## 🚀 Utilisation - Claude Code Terminal

### 1. Setup dans nouveau projet

**Windows (Ermite-Game)** :
```powershell
# Créer dossier projet
cd C:\Users\Jay\Projects
mkdir Mon-Projet
cd Mon-Projet

# Copier template Terminal
cp -r C:\Users\Jay\Projects\Instruction-Claude-Code\.claude-template .claude

# Renommer CLAUDE-TERMINAL.md → CLAUDE.md
cd .claude
mv CLAUDE-TERMINAL.md CLAUDE.md
rm CLAUDE.md  # Supprimer version Web si présente

# Init Git
cd ..
git init
git add .
git commit -m "chore: Initial commit with TAKUMI Terminal instructions"
```

**Linux (Dell-Ermite)** :
```bash
# Créer dossier projet
cd ~/Projects
mkdir Mon-Projet
cd Mon-Projet

# Copier template Terminal
cp -r ~/Projects/Instruction-Claude-Code/.claude-template .claude

# Renommer CLAUDE-TERMINAL.md → CLAUDE.md
cd .claude
mv CLAUDE-TERMINAL.md CLAUDE.md
rm CLAUDE.md  # Supprimer version Web si copiée

# Init Git
cd ..
git init
git add .
git commit -m "chore: Initial commit with TAKUMI Terminal instructions"
```

### 2. Lancer Claude Code Terminal

```bash
cd C:\Users\Jay\Projects\Mon-Projet  # Windows
# ou
cd ~/Projects/Mon-Projet  # Linux

# Lancer Claude Code Terminal
claude-code
```

### 3. TAKUMI lit automatiquement

Claude Code Terminal lit automatiquement `.claude/CLAUDE.md` (version Terminal) et applique le workflow.

---

## 📁 Structure recommandée

```
Mon-Projet/
├── .claude/
│   ├── CLAUDE.md              # CLAUDE-TERMINAL.md renommé
│   ├── templates/
│   │   ├── COPYRIGHT-PERSONNEL.md
│   │   ├── COPYRIGHT-SHINKOFA.md
│   │   ├── USER-GUIDE-template.md
│   │   └── ... (autres templates)
│   └── commands/
│       ├── lint-fix.md
│       ├── test-coverage.md
│       └── ... (slash commands)
├── src/                       # Code source
├── tests/                     # Tests
├── README.md
├── .env.example
└── ... (fichiers projet)
```

---

## 🎯 Workflow TAKUMI Terminal

1. **Setup** : Copie `.claude-template/` → `.claude/` + renommer Terminal → CLAUDE.md
2. **Dev** : TAKUMI développe directement dans dossiers locaux
3. **Tests** : Tests locaux immédiats (pytest, Jest, navigateur)
4. **Commits** : Atomiques toutes les 15-20 min, push GitHub
5. **Deploy** : Scripts SSH/FTP vers VPS OVH ou o2Switch
6. **Livraison** : App 100% fonctionnelle avec max features

---

## 💡 Philosophie TAKUMI Terminal

> "Livrer une solution COMPLÈTE et FONCTIONNELLE avec le maximum de features demandées. Utiliser l'accès local et Internet pour optimiser qualité et performance. Jay paye des crédits, il mérite le max de valeur."

---

## 🆘 Aide

**Questions sur workflow** : Consulter `.claude/CLAUDE.md` (version Terminal)
**Templates disponibles** : `.claude/templates/`
**Slash commands** : `.claude/commands/`

---

**Version 1.4-Terminal | 2025-11-14 | TAKUMI**
