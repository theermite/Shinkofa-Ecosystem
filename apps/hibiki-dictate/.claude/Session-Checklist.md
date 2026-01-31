# Session Start Checklist - TAKUMI Agent

<metadata>
Type: Session Protocol
Owner: Jay The Ermite (TAKUMI Agent)
Version: 1.0
Updated: 2025-12-11
Usage: Exécuter SYSTÉMATIQUEMENT au début de chaque session Claude Code
</metadata>

## 🚀 Protocole Début de Session (OBLIGATOIRE)

<protocole_start>
**⚠️ À CHAQUE nouvelle session, AVANT tout développement, exécuter ce questionnaire** :

### Questionnaire Standard

```
📋 SESSION START CHECKLIST - TAKUMI Agent
═══════════════════════════════════════════════════════

📍 1. ENVIRONNEMENT DE TRAVAIL ?
   [ ] A. Windows CLI (Ermite-Game, Claude Pro Desktop)
   [ ] B. VPS SSH (OVH, production remote)
   [ ] C. Kubuntu CLI (Dell-Ermite, dev local IA)

   Réponse : [A/B/C]

🎯 2. TYPE DE PROJET ?
   [ ] A. Personnel (Copyright "Jay The Ermite")
   [ ] B. Shinkofa (Copyright "La Voie Shinkofa")

   Réponse : [A/B]

🏗️ 3. NATURE DU PROJET ?
   [ ] A. Desktop App (Python GUI, Electron, cross-platform)
   [ ] B. Web App (React + FastAPI, sites fullstack)
   [ ] C. Mobile App (React Native, Android/iOS)
   [ ] D. CLI Tool / Script (Python, Bash automation)
   [ ] E. Shizen-Koshin (IA multi-agents, RAG, LangChain)
   [ ] F. Autre (préciser)

   Réponse : [A/B/C/D/E/F]

📂 4. ÉTAT DU PROJET ?
   [ ] A. Nouveau (setup initial, scaffold)
   [ ] B. En cours (reprise développement, features)
   [ ] C. Maintenance / Debug (fix bugs, refactoring)
   [ ] D. Optimisation (performance, tests, docs)

   Réponse : [A/B/C/D]

⚡ 5. NIVEAU ÉNERGIE JAY (1-10) ?
   Score : [__]

   Interprétation :
   - 1-3 : 🔴 Énergie basse → Sessions courtes (30-45 min), tâches simples
   - 4-6 : 🟡 Énergie modérée → Sessions normales (60-90 min), équilibre
   - 7-10 : 🟢 Énergie haute → Hyperfocus possible, tâches complexes OK

🎯 6. OBJECTIF SESSION (1 phrase claire) ?
   [Réponse Jay : _______________________________________]

═══════════════════════════════════════════════════════
```
</protocole_start>

## 🔧 Adaptations Selon Environnement

<adaptations_env>
### A. Windows CLI (Ermite-Game)

**Caractéristiques** :
- OS : Windows 11 Pro
- Shell : PowerShell (prioritaire), Git Bash (secondaire)
- Chemins : Backslash `\` (ex: `D:\30-Dev-Projects\`)
- Python : `python` (pas `python3`)
- Admin rights : Disponibles si besoin (Pyinstaller, registry tweaks)

**Commandes Adaptées** :
```powershell
# Activation venv
venv\Scripts\activate

# Créer dossier
New-Item -ItemType Directory -Path ".\newfolder"

# Lister fichiers
Get-ChildItem -Recurse

# Variables d'environnement
$env:VARIABLE_NAME = "value"

# PowerShell > WMIC (déprécié Windows 11)
Get-LocalUser  # Au lieu de: wmic useraccount get name
```

**Outils Spécifiques** :
- **PyInstaller** : Build .exe desktop apps
- **GitHub Desktop** : Interface Git (préféré vs CLI)
- **VS Code** : Éditeur principal
- **Docker Desktop** : Containerization Windows
- **OBS Studio** : Streaming (si projet Stream Optimizer)

**Patterns Desktop** :
- CustomTkinter pour GUI Python
- Threading obligatoire (évite freeze UI)
- Lambda scope fix (capture variables avant lambda)
- Registry tweaks via `winreg` module

---

### B. VPS SSH (OVH Production)

**Caractéristiques** :
- OS : Ubuntu Server 22.04 / 24.04 LTS
- Shell : Bash
- Chemins : Forward slash `/` (ex: `/var/www/myapp/`)
- Python : `python3` (Python 3.11+)
- User : `www-data` ou user custom
- Permissions : Sudo required pour nginx, systemd

**Commandes Adaptées** :
```bash
# Activation venv
source venv/bin/activate

# Permissions
sudo chown -R www-data:www-data /var/www/myapp
sudo chmod -R 755 /var/www/myapp

# Services
sudo systemctl restart myapp
sudo systemctl status nginx
sudo journalctl -u myapp -f  # Logs temps réel

# Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

**Stack Production** :
- **FastAPI** : Backend API (uvicorn)
- **PostgreSQL** : Database production
- **Redis** : Cache (optionnel)
- **Nginx** : Reverse proxy + SSL
- **Systemd** : Service management
- **Certbot** : SSL/TLS (Let's Encrypt)

**Deployment Checklist** :
- [ ] `.env` configuré (secrets, DB credentials)
- [ ] Migrations DB exécutées (`alembic upgrade head`)
- [ ] Service systemd créé et enabled
- [ ] Nginx config avec reverse proxy
- [ ] SSL certificate installé (Certbot)
- [ ] Firewall configuré (ufw)
- [ ] Logs monitoring (`journalctl`)

---

### C. Kubuntu CLI (Dell-Ermite)

**Caractéristiques** :
- OS : Kubuntu 24.04 LTS (Ubuntu + KDE Plasma)
- Shell : Zsh (Oh My Zsh), Bash fallback
- Chemins : Forward slash `/` (ex: `/home/jay/projects/`)
- Python : `python3` (Python 3.11+)
- Hardware : i5-6300U (2 cores, 4 threads), 32GB RAM, Intel HD 520 (CPU only)
- Mission : **Shizen-Koshin IA locale** (Ollama, LangChain, RAG)

**Commandes Adaptées** :
```bash
# Ollama
ollama --version
ollama list
ollama pull qwen2.5:7b
ollama run qwen2.5:7b "Test prompt"

# Python venv
python3 -m venv venv
source venv/bin/activate

# Obsidian Vault Path (example)
VAULT_PATH="/home/jay/Documents/KnowledgeBase-CoachingShinkofa"

# ChromaDB persistence
mkdir -p ./chroma_db
```

**Stack IA Locale** :
- **Ollama** : LLMs locaux (Qwen 2.5 7B, CodeLlama 7B)
- **LangChain** : Orchestration agents
- **ChromaDB** : Vectorstore RAG
- **Sentence-Transformers** : Embeddings CPU-optimized
- **Streamlit** : Interface web MVP
- **Obsidian Vault** : Docs source RAG

**Optimisations CPU** :
```bash
# Ollama env vars (~/.bashrc ou ~/.zshrc)
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_THREADS=4

# Python CPU threads
export OMP_NUM_THREADS=4
export MKL_NUM_THREADS=4
```

**Shizen-Koshin Checklist** :
- [ ] Ollama installé + modèles téléchargés
- [ ] Vault Obsidian accessible (chemin absolu)
- [ ] ChromaDB persisté (indexation complète)
- [ ] Embeddings model téléchargé (sentence-transformers)
- [ ] Agents SHIZEN/KAIDA/TAKUMI implémentés
- [ ] RAG Hybrid (Dense + Sparse) configuré
- [ ] Streamlit app fonctionnelle (`streamlit run app.py`)
- [ ] Tests coverage ≥ 80% (`pytest tests/`)
</adaptations_env>

## 📋 Actions Post-Questionnaire

<actions_post_questionnaire>
### Selon Réponses

**1. Environnement détecté** :
- Adapter syntaxe commandes (PowerShell vs Bash)
- Adapter chemins (`\` vs `/`)
- Adapter outils (PyInstaller vs systemd)

**2. Type projet détecté** :
- **Personnel** → Copier `.claude/templates/COPYRIGHT-PERSONNEL.md`
- **Shinkofa** → Copier `.claude/templates/COPYRIGHT-SHINKOFA.md`

**3. Nature projet détectée** :
- **Desktop** → Référencer `BEST-PRACTICES-DESKTOP.md`
- **Web** → Référencer `BEST-PRACTICES-WEB.md`
- **Shizen-Koshin** → Référencer `BEST-PRACTICES-SHIZEN-KOSHIN.md` + `RAG-OPTIMIZATION-2025.md`

**4. État projet** :
- **Nouveau** → Scaffold structure, setup Git, init dependencies
- **En cours** → `git status`, lire derniers commits, reprendre où arrêté
- **Maintenance** → Identifier bugs, lire logs, debug
- **Optimisation** → Profiling, tests, refactoring

**5. Niveau énergie** :
- **1-3 (Bas)** :
  - ⚠️ Alerte : "Énergie basse détectée"
  - Proposer : Tâches simples, sessions courtes (30-45 min)
  - Éviter : Nouvelles fonctionnalités complexes, refactoring lourd
  - Suggérer : Documentation, petits fixes, tests unitaires simples

- **4-6 (Modéré)** :
  - ✅ Normal : Sessions 60-90 min
  - Équilibre : Features moyennes, debug standard
  - Pauses : Rappel toutes les 60 min

- **7-10 (Élevé)** :
  - 🚀 Hyperfocus : Tâches complexes OK
  - Sessions : Jusqu'à 90-120 min possible
  - Pauses : Rappel toutes les 90 min

**6. Objectif session clair** :
- Découper en sous-tâches (TodoWrite tool)
- Estimer temps/coût
- Demander confirmation avant démarrer
</actions_post_questionnaire>

## 🗂️ Templates à Copier Selon Contexte

<templates>
### Copyright Templates

**Personnel** (`.claude/templates/COPYRIGHT-PERSONNEL.md`) :
```markdown
# Copyright & Mentions Légales

## Copyright
© 2025 Jay The Ermite - Tous droits réservés

## Licence
Ce logiciel est développé pour un usage personnel.
Aucune redistribution, modification ou usage commercial n'est autorisé sans permission explicite.

## Contact
Pour toute question : [email]
```

**Shinkofa** (`.claude/templates/COPYRIGHT-SHINKOFA.md`) :
```markdown
# Copyright & Mentions Légales

## Copyright
© 2025 La Voie Shinkofa - Tous droits réservés

## Licence
Ce projet fait partie de l'écosystème Shinkofa.
[Détails licence à compléter selon projet]

## À Propos
La Voie Shinkofa est une méthode de coaching holistique intégrant Design Humain, neurodiversité et transformation personnelle.

## Contact
Site web : https://shinkofa.com
Email : contact@shinkofa.com
```

### README Template Structure

```markdown
# [Nom Projet]

## Description
[1-2 phrases décrivant le projet]

## Features
- [ ] Feature 1
- [ ] Feature 2

## Installation

### Prérequis
- Python 3.11+ / Node.js 18+
- [Autres dépendances]

### Setup
\`\`\`bash
# Clone repo
git clone https://github.com/user/project.git
cd project

# Install dependencies
[commandes installation]

# Configure environment
cp .env.example .env
# Éditer .env avec vos valeurs

# Run
[commande lancement]
\`\`\`

## Usage
[Exemples d'utilisation]

## Tests
\`\`\`bash
# Run tests
[commande tests]
\`\`\`

## Déploiement
[Instructions déploiement production]

## Architecture
[Brève description architecture]

## Contribuer
[Si applicable]

## Licence
Voir COPYRIGHT.md

## Contact
[Informations contact]
```
</templates>

## ✅ Validation Checklist Avant Coder

<validation_avant_coder>
- [ ] **Environnement confirmé** (Windows/VPS/Kubuntu)
- [ ] **Type projet confirmé** (Personnel/Shinkofa)
- [ ] **Nature projet confirmée** (Desktop/Web/Mobile/CLI/Koshin)
- [ ] **État projet évalué** (Nouveau/En cours/Maintenance/Opti)
- [ ] **Niveau énergie Jay connu** (adapter intensité tâches)
- [ ] **Objectif session clair** (1 phrase)
- [ ] **Best practices référencées** (BEST-PRACTICES-*.md selon nature)
- [ ] **Copyright template sélectionné** (COPYRIGHT-*.md)
- [ ] **Git status vérifié** (si projet existant)
- [ ] **Estimation coût proposée** (si nouveau développement)
- [ ] **Confirmation Jay obtenue** (avant coder si estimation > 50$)

**Une fois checklist complète** → ✅ Démarrer développement
</validation_avant_coder>

---

**Version 1.0 | 2025-12-11 | TAKUMI Session Start Checklist**
**Usage** : Exécuter systématiquement au début de chaque nouvelle session Claude Code
