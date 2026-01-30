# Répartition des Ports - Shinkofa Ecosystem

> Documentation de tous les ports utilisés par les applications du MonoRepo

## 🌐 Ports Développement Local

| Port | Application | URL Dev | Status | Description |
|------|-------------|---------|--------|-------------|
| **3000** | `@shinkofa/shizen` | http://localhost:3000 | ✅ Template | Compagnon IA personnalisé (template) |
| **3001** | `@shinkofa/kosei` | http://localhost:3001 | ✅ Template | Profil holistique builder (template) |
| **3002** | `@shinkofa/site-vitrine` | http://localhost:3002 | ✅ **MIGRÉ** | Site marketing (shinkofa.com) |
| **3003** | `@shinkofa/michi` | http://localhost:3003 | ✅ **MIGRÉ** | Plateforme Michi (app.shinkofa.com) |
| **3004** | `@shinkofa/tokei` | http://localhost:3004 | ⏳ Template | Calendrier adaptatif |
| **3005** | `@shinkofa/keikaku` | http://localhost:3005 | ⏳ Template | Planner intelligent |
| **3006** | `@shinkofa/tegami` | http://localhost:3006 | ⏳ Template | Email client |
| **3007** | `@shinkofa/musubu` | http://localhost:3007 | ⏳ Template | Chat messages |
| **3008** | `@shinkofa/kaigi` | http://localhost:3008 | ⏳ Template | Visioconférence |
| **3009** | `@shinkofa/kodo` | http://localhost:3009 | ⏳ Template | Task manager |
| **3010** | `@shinkofa/kankei` | http://localhost:3010 | ⏳ Template | CRM simple |
| **3011** | `@shinkofa/jimu` | http://localhost:3011 | ⏳ Template | Documents manager |
| **3012** | `@shinkofa/dezain` | http://localhost:3012 | ⏳ Template | Design tool |
| **3013** | `@shinkofa/kura` | http://localhost:3013 | ⏳ Template | Media library |
| **3014** | `@shinkofa/tobira` | http://localhost:3014 | ⏳ Template | Streaming platform |
| **3015** | `@shinkofa/slf-esport-frontend` | http://localhost:3015 | ✅ **MIGRÉ** | SLF eSport Frontend (partenaire) |
| **3016** | `@shinkofa/sakusei` | http://localhost:3016 | ✅ **MIGRÉ** | Sakusei Studio (Social Content Master) |
| **3017** | `@shinkofa/takumi-kit` | http://localhost:3017 | ✅ **MIGRÉ** | Takumi Kit Platform (widgets/mini-apps) |
| **3018** | `@shinkofa/kazoku-frontend` | http://localhost:3018 | ✅ **MIGRÉ** | Kazoku (Family Hub) Frontend |

## 🔌 Ports Backend/API

| Port | Service | URL Dev | Status | Description |
|------|---------|---------|--------|-------------|
| **8000** | `@shinkofa/api-shizen` | http://localhost:8000 | ✅ **MIGRÉ** | API FastAPI Shizen Planner |
| **8001** | `api-auth` | http://localhost:8001 | ⏳ À migrer | API Auth & Users |
| **8002** | `api-michi` | http://localhost:8002 | ⏳ À migrer | API Michi (questionnaire DH) |
| **8003** | `api-notifications` | http://localhost:8003 | ⏳ À migrer | API Notifications (email, push) |
| **8004** | `api-media` | http://localhost:8004 | ⏳ À migrer | API Media (upload, storage) |
| **8005** | `@shinkofa/slf-esport-backend` | http://localhost:8005 | ✅ **MIGRÉ** | SLF eSport Backend (FastAPI) |
| **8006** | `@shinkofa/kazoku-backend` | http://localhost:8006 | ✅ **MIGRÉ** | Kazoku Backend (Node.js/Express) |

## 💾 Ports Database & Infrastructure

| Port | Service | Description |
|------|---------|-------------|
| **5432** | PostgreSQL | Base de données principale |
| **6379** | Redis | Cache & sessions (Sakusei workers, SLF) |
| **9200** | Elasticsearch | Recherche (optionnel) |
| **5050** | pgAdmin | Interface admin PostgreSQL |
| **3306/3307** | MySQL | Base de données Kazoku (alternative à PostgreSQL) |

## 🖥️ Applications Desktop (Pas de port web)

| Application | Type | Description |
|-------------|------|-------------|
| `@shinkofa/hibiki-dictate` | Python Desktop App | Dictée vocale intelligente avec IA |

## 🌍 Domaines Production

| Domaine | Application | Port Prod | Serveur |
|---------|-------------|-----------|---------|
| **shinkofa.com** | Site Vitrine | 443 (HTTPS) | VPS OVH |
| **app.shinkofa.com** | Plateforme Michi | 443 (HTTPS) | VPS OVH |
| **api.shinkofa.com** | API Gateway | 443 (HTTPS) | VPS OVH |
| **shizen.shinkofa.com** | Shizen AI | 443 (HTTPS) | VPS OVH (futur) |
| **kosei.shinkofa.com** | Kosei Builder | 443 (HTTPS) | VPS OVH (futur) |

## 📋 Règles de Gestion des Ports

### Développement Local
1. **Frontend Apps**: Ports 3000-3099
   - Incrémentation séquentielle (+1 par app)
   - Commencer à 3000 pour les apps priorité 1
   - Réserver 3000-3015 pour les apps principales

2. **Backend APIs**: Ports 8000-8099
   - Incrémentation séquentielle (+1 par API)
   - Port 8000 = API principale (Shizen Planner)

3. **Databases**: Ports standards
   - PostgreSQL: 5432
   - Redis: 6379

### Conflits de Ports
Si un port est déjà utilisé lors du développement:
```bash
# Vérifier quel processus utilise le port
netstat -ano | findstr :3000

# Ou utiliser la variable d'environnement dans vite.config.ts
PORT=3050 pnpm dev
```

### Ajouter une Nouvelle App
1. Assigner le prochain port disponible (ex: 3016)
2. Mettre à jour ce fichier PORTS.md
3. Configurer dans `apps/[nom-app]/vite.config.ts`:
   ```ts
   server: {
     port: 3016,
     host: true,
   }
   ```

## 🔄 Mise à Jour

**Dernière mise à jour**: 2026-01-30
**Prochaine app disponible**: Port 3019
**Prochaine API disponible**: Port 8007

---

⚠️ **IMPORTANT**: Ce fichier doit être mis à jour à chaque ajout d'application ou service pour éviter les conflits de ports.
