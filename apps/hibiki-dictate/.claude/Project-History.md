# Project History - Lessons Learned

<metadata>
Type: Project History & Lessons
Owner: Jay The Ermite (TAKUMI Agent)
Version: 1.0
Updated: 2025-12-11
Projects Documented: WinAdminTE, Les Petits Liens, SLF-Esport, Website-Shinkofa
Purpose: Éviter erreurs passées, capitaliser sur patterns réussis
</metadata>

## 🎯 Projets Complétés - Vue d'Ensemble

<overview>
| Projet           | Type        | Stack                | Status      | Location                                |
|------------------|-------------|----------------------|-------------|-----------------------------------------|
| **WinAdminTE**   | Desktop App | Python, CustomTkinter| ✅ Complet  | `D:\30-Dev-Projects\WinAdminTE`         |
| **Les Petits Liens** | Web App | React, FastAPI      | ✅ Complet  | `D:\30-Dev-Projects\LesPetitsLiens`     |
| **SLF-Esport**   | Web App     | React, FastAPI       | ✅ Complet  | `D:\30-Dev-Projects\SLF-Esport`         |
| **Website-Shinkofa** | Website | WordPress            | ✅ Complet  | `D:\30-Dev-Projects\Website-Shinkofa`   |
</overview>

## 🖥️ WinAdminTE (Desktop App)

<winadminte>
### Description

Application Windows 11 pour gestion système : installation apps (Winget, NPM), tweaks registry (taskbar, widgets), gestion utilisateurs, drivers.

**Stack** :
- Python 3.11
- CustomTkinter (GUI)
- PyInstaller (build exe)
- PowerShell (commandes système)
- winreg (registry operations)

**Durée** : 3 semaines (novembre-décembre 2025)

### ✅ Succès & Patterns Réussis

**1. Architecture MVC Claire** :
```
core/           # Business logic
gui/frames/     # Views
main.py         # Entry point
```
- **Avantage** : Séparation concerns, tests unitaires faciles
- **Réutilisable** : Pattern applicable à tout projet desktop

**2. Threading Systématique** :
- Toutes opérations longues (Winget install, PowerShell commands) dans threads
- GUI jamais bloquée
- User peut continuer navigation pendant installations

**3. PowerShell > WMIC** :
- WMIC déprécié Windows 11 → migration PowerShell 100%
- **Leçon** : Toujours utiliser PowerShell pour commandes système Windows moderne

**4. Error Handling Robuste** :
- Try/except sur toutes opérations I/O, subprocess, registry
- Messages erreur français, clairs pour utilisateur
- Logging détaillé (debug facile)

**5. Progress Feedback** :
- Callbacks progress pour opérations longues
- Progress bar temps réel installation apps
- **Leçon** : Toujours donner feedback visuel (user patience++)

### ⚠️ Problèmes Rencontrés & Solutions

**1. Lambda Scope Bug (CRITIQUE)** :

**Problème** :
```python
# ❌ Crash aléatoire
except Exception as e:
    self.after(0, lambda: self.show_error(str(e)))
    # → "e" n'existe plus quand lambda s'exécute!
```

**Solution** :
```python
# ✅ Fix définitif
except Exception as e:
    error_msg = str(e)  # Capture AVANT lambda
    self.after(0, lambda: self.show_error(error_msg))
```

**Impact** : Bug silencieux, difficile à débugger. **OBLIGATOIRE** de suivre pattern.

**2. PyInstaller Hidden Imports** :

**Problème** : Modules CustomTkinter, PIL non détectés → crash exe.

**Solution** :
```python
# app.spec
hiddenimports=[
    'customtkinter',
    'PIL',
    'PIL._tkinter_finder',
]
```

**3. Admin Rights Detection** :

**Problème** : Registry tweaks échouent sans admin → message erreur générique.

**Solution** :
```python
import ctypes

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except:
        return False

# Check au démarrage, warning si pas admin
if not is_admin():
    show_warning("Certaines fonctionnalités nécessitent droits Admin")
```

### 📚 Leçons Clés

1. **Threading obligatoire** : GUI desktop = threading mandatory
2. **Lambda scope** : Pattern CRITIQUE à suivre systématiquement
3. **PowerShell > WMIC** : Toujours PowerShell sur Windows 11
4. **Error messages français** : User français → messages français
5. **Progress feedback** : Jamais laisser user dans le vide
6. **Testing manuel GUI** : Tests unitaires 80% backend, GUI manuel (pas automatisation UI)

### 📂 Fichiers Référence

- `core/tweaks.py` : Registry operations, PowerShell commands
- `core/package_mgr.py` : Winget wrapper, threading callbacks
- `gui/frames/configuration.py` : Threading + lambda scope fix pattern
- `build_exe.bat` : Build script complet
- `winadmin.spec` : PyInstaller config
</winadminte>

## 🌐 Les Petits Liens (Web App)

<lespetitsliens>
### Description

Gestionnaire liens personnels avec catégories, tags, recherche, drag-and-drop. Interface moderne, responsive, dark mode.

**Stack** :
- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite
- **Backend** : FastAPI, PostgreSQL, SQLAlchemy
- **Deployment** : o2Switch (frontend static), VPS OVH (backend API)

**Durée** : 2 semaines (octobre 2025)

### ✅ Succès & Patterns Réussis

**1. Dark Mode Toggle** :
- Implémentation localStorage + Tailwind dark: class
- Transition smooth 0.3s
- **Réutilisable** : Pattern utilisé dans tous projets web suivants

**2. Drag & Drop (react-beautiful-dnd)** :
- Réorganisation liens par drag & drop
- Persistance ordre en DB
- **Leçon** : UX intuitive > forms complexes

**3. Infinite Scroll** :
- Pagination backend (limit/offset)
- Frontend : react-infinite-scroll-component
- **Performance** : Charge seulement 20 items à la fois

**4. OAuth Google** :
- Login Google simplifié
- Réduit friction onboarding
- **Leçon** : OAuth social = conversion++

**5. JWT Auth** :
- Access token localStorage
- Refresh token httpOnly cookie
- Interceptor Axios auto-refresh

### ⚠️ Problèmes Rencontrés & Solutions

**1. Infinite Scroll sans Pagination Backend** :

**Problème** : Frontend infinite scroll, backend retourne TOUS les liens → lag 1000+ items.

**Solution** :
```python
# FastAPI endpoint avec pagination
@router.get("/links")
def get_links(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    links = db.query(Link).offset(skip).limit(limit).all()
    return links
```

**Leçon** : TOUJOURS paginer backend, même si infinite scroll frontend.

**2. CORS Issues** :

**Problème** : Frontend localhost:5173, backend localhost:8000 → CORS blocked.

**Solution** :
```python
# FastAPI main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**3. Drag & Drop State Persistence** :

**Problème** : Drag & drop visuel OK, mais ordre pas sauvé → refresh = perte.

**Solution** :
- Ajouter colonne `order` (INTEGER) en DB
- À chaque drop, update `order` pour tous items concernés
- Backend : `ORDER BY order ASC`

### 📚 Leçons Clés

1. **Pagination obligatoire** : Backend TOUJOURS paginer (même si infinite scroll)
2. **CORS config** : Définir origins AVANT première requête (debug difficile sinon)
3. **OAuth social** : Réduit friction, améliore conversion
4. **Drag & drop** : UX intuitive mais persistance DB complexe (anticiper)
5. **Dark mode** : Standard moderne, implémenter dès le début
6. **TypeScript** : Évite bugs runtime, worth overhead

### 📂 Fichiers Référence

- `frontend/src/hooks/useTheme.ts` : Dark mode hook
- `frontend/src/components/ThemeToggle.tsx` : Toggle component
- `frontend/src/services/api.ts` : Axios instance + interceptors
- `backend/app/api/v1/links.py` : Pagination endpoint
</lespetitsliens>

## ⚽ SLF-Esport (Web App)

<slf_esport>
### Description

Plateforme esport : dashboard équipes, calendrier matchs, classement, notifications temps réel, upload images joueurs.

**Stack** :
- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite
- **Backend** : FastAPI, PostgreSQL, WebSocket (notifications)
- **Storage** : MinIO (images)
- **Deployment** : VPS OVH (Docker Compose)

**Durée** : 3 semaines (novembre 2025)

### ✅ Succès & Patterns Réussis

**1. WebSocket Notifications Temps Réel** :
- FastAPI WebSocket endpoint
- Frontend : useWebSocket hook
- **Use case** : Notifications matchs, scores live

**2. Upload Images avec Preview** :
- Frontend : File input → preview instant (URL.createObjectURL)
- Backend : MinIO storage
- **UX** : User voit image avant upload

**3. Filtres Avancés** :
- react-select pour multi-select
- Backend : Filtres dynamiques SQLAlchemy
- **Example** : Filtrer matchs par équipe, date, statut

**4. Dashboard Temps Réel** :
- Refresh automatique toutes les 30s (react-query)
- WebSocket pour updates instantanées
- **Performance** : Évite polling trop fréquent

**5. Docker Compose Production** :
- Services : frontend (nginx), backend (uvicorn), postgres, minio
- Un seul `docker-compose up` → app complète

### ⚠️ Problèmes Rencontrés & Solutions

**1. WebSocket Reconnection** :

**Problème** : WebSocket déconnecté après idle ou network issue → notifications arrêtées.

**Solution** :
```typescript
// Frontend : Auto-reconnect avec backoff
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectInterval = useRef(1000);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectInterval.current = 1000;  // Reset backoff
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        reconnectTimeout = setTimeout(() => {
          reconnectInterval.current = Math.min(reconnectInterval.current * 2, 30000);  // Exponential backoff max 30s
          connect();
        }, reconnectInterval.current);
      };

      setSocket(ws);
    };

    connect();

    return () => {
      ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [url]);

  return socket;
};
```

**Leçon** : WebSocket = TOUJOURS implémenter reconnection + backoff.

**2. Upload Images Timeout** :

**Problème** : Upload gros fichiers (>5MB) → timeout FastAPI default (30s).

**Solution** :
```python
# FastAPI : Augmenter timeout
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        timeout_keep_alive=120  # 2 minutes
    )
```

**3. CORS Preflight avec WebSocket** :

**Problème** : WebSocket bloqué par CORS malgré config CORS HTTP.

**Solution** :
```python
# FastAPI WebSocket endpoint : Pas de CORS (pas HTTP)
# Mais origin check manuel :
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    origin = websocket.headers.get("origin")
    if origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008)  # Policy violation
        return

    await websocket.accept()
    # ...
```

### 📚 Leçons Clés

1. **WebSocket reconnection** : OBLIGATOIRE (exponential backoff)
2. **Upload timeout** : Augmenter timeout backend si gros fichiers
3. **react-query** : Invalide cache automatiquement (données fraîches)
4. **Docker Compose** : Simplifie déploiement (1 commande = app complète)
5. **MinIO** : Alternative S3 self-hosted, performant
6. **Filtres multi-select** : react-select meilleure UX que checkboxes multiples

### 📂 Fichiers Référence

- `frontend/src/hooks/useWebSocket.ts` : WebSocket hook avec reconnection
- `frontend/src/components/ImageUpload.tsx` : Upload + preview
- `backend/app/api/v1/websocket.py` : WebSocket endpoint
- `docker-compose.yml` : Stack complète (frontend, backend, postgres, minio)
</slf_esport>

## 🌱 Website-Shinkofa (WordPress)

<website_shinkofa>
### Description

Site vitrine La Voie Shinkofa : présentation méthode, blog, SEO optimisé.

**Stack** :
- WordPress 6.4
- Theme : Astra (customisé)
- Plugins : Yoast SEO, WP Rocket, Elementor
- Hosting : o2Switch (cPanel)

**Durée** : 1 semaine (septembre 2025)

### ✅ Succès & Patterns Réussis

**1. SEO Optimisé (Yoast SEO)** :
- Meta descriptions toutes pages
- Schema.org markup
- Sitemap XML auto-généré
- **Résultat** : Google indexation <48h

**2. Cache Agressif (WP Rocket)** :
- Page cache + browser cache
- Lazy loading images
- Minify CSS/JS
- **Performance** : <1s load time (GTmetrix A)

**3. Responsive Design** :
- Astra theme responsive natif
- Elementor pour customisations mobiles
- **Test** : Mobile-friendly Google test ✅

**4. CDN CloudFlare** :
- DNS + CDN gratuit
- SSL auto (Let's Encrypt)
- **Bonus** : DDoS protection

### ⚠️ Problèmes Rencontrés & Solutions

**1. WordPress Lourd** :

**Problème** : WordPress + plugins = 20+ requêtes HTTP, 2MB+ page.

**Solution** :
- WP Rocket cache
- Lazy loading images
- Minify + combine CSS/JS
- **Mais** : Toujours plus lourd que React SPA

**Leçon** : WordPress OK pour sites vitrines simples, mais React + Next.js meilleur si performance critique.

**2. Plugin Conflicts** :

**Problème** : Yoast SEO + Rank Math = conflit → site down.

**Solution** :
- Désactiver un des deux
- Tester en staging avant prod
- **Leçon** : 1 plugin par fonction (pas 2 SEO plugins)

**3. PHP Version** :

**Problème** : Theme nécessite PHP 8.0+, serveur en PHP 7.4 → erreurs.

**Solution** :
- cPanel → PHP Selector → PHP 8.1
- **Leçon** : Vérifier requirements PHP AVANT installer theme/plugins

### 📚 Leçons Clés

1. **WordPress lourd** : OK sites vitrines, mais React meilleur si perfs critiques
2. **SEO dès le début** : Yoast SEO depuis jour 1 (pas après)
3. **Cache obligatoire** : WP Rocket ou W3 Total Cache minimum
4. **CloudFlare gratuit** : CDN + SSL + DDoS protection gratis
5. **Staging environment** : Tester plugins/updates en staging d'abord
6. **1 plugin par fonction** : Éviter doublons (2 SEO plugins = conflit)

### 📂 Fichiers Référence

- N/A (WordPress = GUI configuration, pas fichiers code)
- Documentation : o2Switch cPanel screenshots + Yoast config
</website_shinkofa>

## 📊 Patterns Transverses (Tous Projets)

<patterns_transverses>
### 1. Git Workflow

**Pattern réussi** :
- Commits atomiques toutes les 15-20 min
- Format : `type(scope): description` (feat, fix, docs, refactor)
- Push immédiat après commit (résistance déconnexions)

**Example** :
```bash
git add core/tweaks.py
git commit -m "feat(tweaks): Add user rename functionality via PowerShell"
git push origin main
```

### 2. Error Handling

**Pattern réussi** :
```python
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Context: {e}")
    return False, f"User-friendly message français"
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return False, "Erreur inattendue, vérifier les logs"
```

**Leçons** :
- Catch exceptions spécifiques d'abord
- Logging technique (anglais, détaillé)
- Message user (français, clair, actionnable)

### 3. Environment Variables

**Pattern réussi** :
```bash
# .env (jamais commité)
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=random_secret_key_here
API_KEY=xxx

# .env.example (commité)
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your_secret_key_here
API_KEY=your_api_key_here
```

**Leçon** : `.env.example` avec placeholders OBLIGATOIRE (doc pour futurs devs).

### 4. Documentation

**Pattern réussi** :
- `README.md` : Installation, usage, architecture
- `USER-GUIDE.md` : Documentation end-user (non-technique)
- `COPYRIGHT.md` : Licence, mentions légales
- `CHANGELOG.md` : Historique versions

**Leçon** : README technique != USER-GUIDE non-technique (2 docs séparées).

### 5. Testing

**Pattern réussi** :
- Backend : pytest, coverage ≥ 80%
- Frontend : Vitest + React Testing Library, coverage ≥ 80%
- Desktop GUI : Tests unitaires core (80%), tests manuels GUI (checklist)

**Leçon** : GUI automation coûteuse en temps, tests manuels pragmatiques suffisent.
</patterns_transverses>

## 🚫 Anti-Patterns à Éviter

<anti_patterns>
### 1. Dupliquer Code

**Mauvais** :
```python
# 3 fonctions identiques dans 3 fichiers différents
def format_date_file1(date):
    return date.strftime("%Y-%m-%d")

def format_date_file2(date):
    return date.strftime("%Y-%m-%d")
```

**Bon** :
```python
# utils/formatters.py
def format_date(date):
    return date.strftime("%Y-%m-%d")

# Importer partout
from utils.formatters import format_date
```

### 2. Hardcoder Secrets

**Mauvais** :
```python
API_KEY = "sk-1234567890abcdef"  # ❌ Hardcodé dans code
```

**Bon** :
```python
import os
API_KEY = os.getenv("API_KEY")  # ✅ .env
```

### 3. Pas de Logging

**Mauvais** :
```python
try:
    result = api_call()
except:
    pass  # ❌ Erreur silencieuse, impossible debug
```

**Bon** :
```python
import logging
logger = logging.getLogger(__name__)

try:
    result = api_call()
except Exception as e:
    logger.error(f"API call failed: {e}")  # ✅ Tracé
    raise
```

### 4. Git Commits Massifs

**Mauvais** :
```bash
# 1 commit après 2 jours de dev
git add .
git commit -m "stuff"
git push
```

**Bon** :
```bash
# Commits atomiques toutes les 15-20 min
git add core/tweaks.py
git commit -m "feat(tweaks): Add registry set_value method"
git push

# 10 min plus tard
git add tests/test_tweaks.py
git commit -m "test(tweaks): Add tests for set_value (85% coverage)"
git push
```

### 5. Ignorer Performance

**Mauvais** :
```python
# Charge 10000 items en mémoire
all_items = db.query(Item).all()  # ❌ OOM si 100k+ items
```

**Bon** :
```python
# Pagination
items = db.query(Item).offset(skip).limit(20).all()  # ✅ 20 items max
```
</anti_patterns>

## 📋 Checklist Nouveau Projet (Template)

<checklist_nouveau_projet>
Avant démarrer nouveau projet, vérifier :

### Setup Projet
- [ ] **Git repo créé** (GitHub privé)
- [ ] **README.md** avec structure template
- [ ] **.gitignore** configuré (Python/Node selon stack)
- [ ] **.env.example** créé (si variables env)
- [ ] **COPYRIGHT.md** copié (Personnel vs Shinkofa)

### Architecture
- [ ] **MVC pattern** défini (models, views, controllers)
- [ ] **Logging** configuré (INFO level minimum)
- [ ] **Error handling** stratégie définie
- [ ] **Testing** framework choisi (pytest, Vitest)

### Standards Qualité
- [ ] **Type hints** (Python) ou TypeScript strict
- [ ] **Docstrings/JSDoc** (Google style)
- [ ] **Linting** configuré (Ruff, ESLint)
- [ ] **Coverage target** 80% minimum

### Web Specific
- [ ] **Dark mode toggle** planifié dès début
- [ ] **Password reveal toggle** si auth
- [ ] **Responsive breakpoints** définis (Tailwind)
- [ ] **WCAG AAA contrast** vérifié (7:1 ratio)
- [ ] **CORS** configuré (si backend séparé)
- [ ] **JWT auth** pattern défini (access + refresh tokens)

### Desktop Specific
- [ ] **Threading** pattern défini (GUI non-bloquante)
- [ ] **Lambda scope fix** pattern documenté équipe
- [ ] **PyInstaller spec** créé dès début
- [ ] **Resources path** strategy définie (bundling)
- [ ] **Admin rights** requirements identifiés

### Deployment
- [ ] **Hosting** choisi (o2Switch, VPS OVH, Vercel)
- [ ] **CI/CD** configuré (GitHub Actions)
- [ ] **SSL** planifié (Certbot, CloudFlare)
- [ ] **Monitoring** défini (logs, erreurs)
</checklist_nouveau_projet>

---

**Version 1.0 | 2025-12-11 | TAKUMI Project History**
**Projets documentés** : WinAdminTE, Les Petits Liens, SLF-Esport, Website-Shinkofa
**Usage** : Référence patterns réussis, éviter erreurs passées
