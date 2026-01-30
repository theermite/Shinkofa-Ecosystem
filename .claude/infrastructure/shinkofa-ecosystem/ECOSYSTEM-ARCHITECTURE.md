# Architecture Écosystème Shinkofa

> Vue technique complète : services, intégrations, données partagées, infrastructure.

**Créé** : 2026-01-27
**Statut** : 🚧 En construction
**Audience** : Technique (développeurs, ops)

---

## 🗺️ Vue d'Ensemble Écosystème

### Schéma Global

```mermaid
graph TB
    subgraph "Frontend Clients"
        U1[Utilisateur Web]
        U2[Utilisateur Mobile futur]
    end

    subgraph "Services Shinkofa shinkofa.com"
        APP[app.shinkofa.com<br/>Plateforme Principale]
        STUDIO[studio.shinkofa.com<br/>Social-Content-Master]
        CLOUD[cloud.shinkofa.com<br/>Cloud Storage futur]
    end

    subgraph "APIs Backend"
        MEDIA[media.shinkofa.com<br/>API Médias]
        AUTH[Service Auth SSO]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Données métier)]
        REDIS[(Redis<br/>Cache + Sessions)]
        S3[(S3/Local<br/>Fichiers médias)]
    end

    subgraph "Services Externes"
        STRIPE[Stripe<br/>Paiements]
        EMAIL[Brevo/Mailchimp<br/>Email Marketing]
        WHISPER[Whisper API<br/>Transcription]
    end

    U1 --> APP
    U1 --> STUDIO
    U1 --> CLOUD

    APP --> AUTH
    STUDIO --> AUTH
    CLOUD --> AUTH

    APP --> PG
    APP --> REDIS
    APP --> STRIPE
    APP --> EMAIL

    STUDIO --> MEDIA
    STUDIO --> REDIS
    STUDIO --> WHISPER

    CLOUD --> MEDIA

    MEDIA --> S3
    MEDIA --> PG
```

---

## 🏗️ Services Détaillés

### 1. app.shinkofa.com (Plateforme Principale)

**Rôle** : Hub central — Authentification, coaching, formations, communauté.

**Stack Technique** :
- **Frontend** : Next.js 14 (App Router), React 18, TailwindCSS
- **Backend** : Next.js API Routes
- **Auth** : NextAuth.js (JWT + OAuth Google/GitHub)
- **Database** : PostgreSQL 15 + Prisma ORM
- **Cache** : Redis (sessions, pages statiques)
- **Hosting** : Vercel (ou VPS OVH Docker)

**Fonctionnalités** :
- Authentification SSO (source de vérité pour tous services)
- Dashboard client personnalisé
- Système réservation coaching (calendrier + Stripe)
- Plateforme formations (vidéos + quiz + certificats)
- Communauté (forum ou Discord embed)
- Blog intégré (Markdown CMS)
- Email marketing (Brevo/Mailchimp API)

**Dépendances** :
- PostgreSQL (données utilisateurs, réservations, formations)
- Redis (sessions JWT, cache pages)
- Stripe (paiements coaching + formations + abonnements)
- Brevo (emails transactionnels + marketing)

**Ports** :
- Production : 443 (HTTPS)
- Dev local : 3000

**Endpoints Clés** :
```
POST /api/auth/signin          # Login
POST /api/auth/signup          # Inscription
GET  /api/user/profile         # Profil utilisateur
POST /api/booking/create       # Réserver session
POST /api/payment/checkout     # Initier paiement Stripe
GET  /api/courses/:id          # Détails formation
POST /api/community/post       # Poster dans communauté
```

---

### 2. studio.shinkofa.com (Social-Content-Master)

**Rôle** : Éditeur vidéo simplifié pour podcasters et créateurs contenu.

**Stack Technique** :
- **Frontend** : Next.js 14, React 18, TailwindCSS
- **Backend** : Node.js + Express (ou Next.js API Routes)
- **Video Processing** : FFmpeg (serveur backend)
- **Storage** : API media.shinkofa.com
- **Hosting** : VPS OVH (Docker)

**Fonctionnalités** :
- Upload vidéos/audios
- Édition timeline (découpe, transitions, texte)
- Templates podcast prédéfinis
- Transcription automatique (Whisper API)
- Export multi-formats (MP4, MOV, WebM)
- Bibliothèque assets (musiques, effets)

**Dépendances** :
- Auth : app.shinkofa.com (SSO via JWT)
- Storage : media.shinkofa.com API
- PostgreSQL (métadonnées projets vidéo)
- Redis (cache renders, queue jobs)
- Whisper API (transcription)

**Ports** :
- Production : 443 (HTTPS via Nginx reverse proxy)
- Dev local : 3001

**Endpoints Clés** :
```
POST /api/project/create       # Créer projet vidéo
POST /api/upload               # Upload média
POST /api/render               # Lancer render vidéo
GET  /api/transcribe/:id       # Transcription audio
GET  /api/templates            # Liste templates
```

---

### 3. cloud.shinkofa.com (Cloud Storage - Futur 2027)

**Rôle** : Google Drive-like pour clients Shinkofa (stockage documents, partage).

**Stack Technique** :
- **Frontend** : Next.js 14 ou React SPA
- **Backend** : Node.js + Express
- **Storage** : S3-compatible (Backblaze B2 ou AWS S3)
- **Hosting** : VPS OVH (Docker)

**Fonctionnalités** :
- Upload/download fichiers
- Dossiers organisés
- Partage liens (publics ou privés)
- Prévisualisation fichiers (images, PDFs, vidéos)
- Quotas par utilisateur (2 GB gratuit, 10 GB premium)

**Dépendances** :
- Auth : app.shinkofa.com (SSO)
- Storage : media.shinkofa.com API
- PostgreSQL (métadonnées fichiers, permissions)

**Ports** :
- Production : 443 (HTTPS)
- Dev local : 3002

---

### 4. media.shinkofa.com (API Stockage Médias)

**Rôle** : API backend centralisée pour stockage médias (vidéos, images, documents).

**Stack Technique** :
- **Backend** : Node.js + Express ou FastAPI (Python)
- **Storage** : Local filesystem (VPS OVH) OU S3-compatible
- **Database** : PostgreSQL (métadonnées fichiers)
- **Hosting** : VPS OVH (Docker)

**Fonctionnalités** :
- Upload fichiers (multipart/form-data)
- Download fichiers (signed URLs)
- Gestion quotas utilisateur
- Compression automatique images (Sharp ou Pillow)
- Génération thumbnails vidéos (FFmpeg)

**Clients** :
- studio.shinkofa.com (uploads vidéos)
- cloud.shinkofa.com (stockage client)
- app.shinkofa.com (avatars utilisateurs, assets formations)

**Ports** :
- Production : 443 (HTTPS via Nginx)
- Internal : 8080 (communication interne VPS)

**Endpoints Clés** :
```
POST /api/upload               # Upload fichier
GET  /api/download/:id         # Download fichier
DELETE /api/delete/:id         # Supprimer fichier
GET  /api/quota/:userId        # Quota utilisateur
POST /api/thumbnail/:videoId   # Générer thumbnail
```

---

## 🔐 Authentification Unifiée (SSO)

### Principe

**app.shinkofa.com = Source de vérité** pour authentification.

Tous les autres services (studio, cloud) valident les tokens JWT émis par app.shinkofa.com.

### Flow Authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant APP as app.shinkofa.com
    participant STUDIO as studio.shinkofa.com
    participant PG as PostgreSQL

    U->>APP: POST /api/auth/signin (email, password)
    APP->>PG: Vérifier credentials
    PG-->>APP: User trouvé
    APP->>APP: Générer JWT (secret partagé)
    APP-->>U: Retourne JWT + refresh token

    U->>STUDIO: GET /dashboard (avec JWT header)
    STUDIO->>STUDIO: Valider JWT (même secret)
    STUDIO-->>U: Dashboard autorisé
```

### Implémentation

**JWT Payload** :
```json
{
  "userId": "uuid-1234",
  "email": "user@example.com",
  "roles": ["client", "premium"],
  "exp": 1735689600  // Expiration 1h
}
```

**Secret Partagé** : Variable env `JWT_SECRET` (identique tous services).

**Refresh Tokens** : Stockés dans Redis avec TTL 7 jours.

**Middleware Validation** (tous services) :
```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';

export function validateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 💾 Data Layer

### PostgreSQL (Données Métier)

**Hébergement** : VPS OVH (Docker container) ou Supabase.

**Schéma Principal** :

```sql
-- Utilisateurs (table centrale)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'client',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions coaching
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 90,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  payment_id VARCHAR(255) -- Stripe payment intent ID
);

-- Formations
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_eur INT, -- Prix en centimes
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  progress_percent INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, course_id)
);

-- Projets vidéo (Social-Content-Master)
CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  media_file_id VARCHAR(255), -- Référence media.shinkofa.com
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fichiers cloud (cloud.shinkofa.com)
CREATE TABLE cloud_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255),
  size_bytes BIGINT,
  mime_type VARCHAR(100),
  storage_path VARCHAR(500), -- Chemin S3 ou filesystem
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Backups** :
- Automatiques quotidiens (pg_dump)
- Rétention 30 jours
- Stockage Backblaze B2 ou VPS local

---

### Redis (Cache + Sessions)

**Hébergement** : VPS OVH (Docker container) ou Upstash.

**Usages** :
- Sessions JWT (refresh tokens) : TTL 7 jours
- Cache pages Next.js : TTL variable
- Queue jobs vidéo (render tasks) : Liste Redis
- Rate limiting API : Compteurs par IP

**Exemples Clés** :
```
refresh_token:{userId}        # Refresh token JWT
session:{sessionId}           # Session data
cache:page:/blog/article-1   # Page statique cachée
queue:render:jobs            # Liste jobs render vidéo
ratelimit:{ip}:{endpoint}    # Compteur requêtes
```

---

### S3 / Filesystem (Fichiers Médias)

**Option A : Filesystem Local (VPS OVH)** :
- Path : `/var/shinkofa/media/`
- Structure :
  ```
  /var/shinkofa/media/
  ├── videos/
  ├── images/
  ├── documents/
  └── thumbnails/
  ```
- Backups : rsync vers Backblaze B2

**Option B : S3-Compatible (Recommandé scalabilité)** :
- Service : Backblaze B2 ou AWS S3
- Buckets :
  - `shinkofa-media-prod` (vidéos, images)
  - `shinkofa-backups` (backups DB)
- CDN : Cloudflare (cache + compression)

---

## 🌐 Infrastructure Réseau

### DNS & Domaines

**Registrar** : <!-- À COMPLÉTER : OVH, Namecheap, etc. -->

**Configuration DNS** :
```
shinkofa.com               A       217.182.206.127 (VPS OVH)
app.shinkofa.com           A       217.182.206.127
studio.shinkofa.com        A       217.182.206.127
media.shinkofa.com         A       217.182.206.127
cloud.shinkofa.com         A       217.182.206.127 (futur)

*.shinkofa.com             TXT     "v=spf1 include:_spf.brevo.com ~all"
```

**SSL/TLS** : Certbot (Let's Encrypt) — Renouvellement automatique.

---

### Nginx Reverse Proxy (VPS OVH)

```nginx
# /etc/nginx/sites-available/shinkofa

server {
    listen 443 ssl http2;
    server_name app.shinkofa.com;

    ssl_certificate /etc/letsencrypt/live/app.shinkofa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.shinkofa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;  # Next.js app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name studio.shinkofa.com;

    ssl_certificate /etc/letsencrypt/live/studio.shinkofa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio.shinkofa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;  # Social-Content-Master
        proxy_set_header Host $host;
    }
}

server {
    listen 443 ssl http2;
    server_name media.shinkofa.com;

    ssl_certificate /etc/letsencrypt/live/media.shinkofa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/media.shinkofa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;  # Media API
        proxy_set_header Host $host;

        # Upload limit
        client_max_body_size 500M;
    }
}
```

---

### Docker Compose (VPS OVH)

```yaml
# docker-compose.yml (VPS OVH)
version: '3.8'

services:
  app-shinkofa:
    image: shinkofa/app:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/shinkofa
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis

  studio-shinkofa:
    image: shinkofa/studio:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/shinkofa
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MEDIA_API_URL: http://media-api:8080
    volumes:
      - /var/shinkofa/renders:/app/renders
    depends_on:
      - postgres
      - redis
      - media-api

  media-api:
    image: shinkofa/media-api:latest
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/shinkofa
      STORAGE_PATH: /media
    volumes:
      - /var/shinkofa/media:/media

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: shinkofa
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 📊 Données Partagées

### Utilisateurs (Source Unique)

**Table** : `users` (PostgreSQL)

**Accès** :
- app.shinkofa.com : Lecture/Écriture (création, mise à jour)
- studio.shinkofa.com : Lecture seule (validation JWT)
- cloud.shinkofa.com : Lecture seule

**Règle** : Toute modification utilisateur passe par app.shinkofa.com.

---

### Médias (API Centralisée)

**Stockage** : S3 ou filesystem via media.shinkofa.com API

**Métadonnées** : Table `cloud_files` (PostgreSQL)

**Accès** :
- studio.shinkofa.com : Upload/Download vidéos
- cloud.shinkofa.com : Upload/Download documents clients
- app.shinkofa.com : Avatars, assets formations

**Quotas** :
- Free tier : 2 GB
- Premium : 10 GB
- Coach/Admin : Illimité

---

### Sessions (Cache Redis)

**Refresh Tokens** : Clé `refresh_token:{userId}`, TTL 7 jours

**Invalidation** : Logout = suppression clé Redis.

---

## 🔒 Sécurité

### HTTPS Obligatoire

Tous services en HTTPS (Let's Encrypt).

HTTP → HTTPS redirect automatique (Nginx).

---

### CORS

**app.shinkofa.com** :
```javascript
// Autorise studio.shinkofa.com et cloud.shinkofa.com
const allowedOrigins = [
  'https://studio.shinkofa.com',
  'https://cloud.shinkofa.com'
];
```

---

### Rate Limiting

**API Routes** : 100 requêtes / minute / IP (via Redis).

**Upload Médias** : 10 GB / jour / utilisateur.

---

### Secrets Management

**Variables Env** :
- `JWT_SECRET` : Partagé tous services
- `DATABASE_URL` : Connection string PostgreSQL
- `REDIS_URL` : Connection string Redis
- `STRIPE_SECRET_KEY` : Paiements
- `WHISPER_API_KEY` : Transcription

**Stockage** : `.env.local` (dev) + Docker secrets (prod).

---

## 📈 Scalabilité

### Horizontal Scaling (Futur)

**Si croissance forte** :
- Load balancer (Nginx ou Cloudflare)
- Multiples instances app.shinkofa.com (Docker Swarm ou Kubernetes)
- PostgreSQL réplication read replicas
- CDN pour assets statiques (Cloudflare)

---

### Vertical Scaling (Court Terme)

**VPS OVH actuel** : 8 cores, 22 GB RAM

**Si saturation** : Upgrade VPS (16 cores, 64 GB) OU migration cloud (AWS, GCP).

---

## 📎 Références

- [Master Plan](./MASTER-PLAN.md)
- [Roadmap](./ROADMAP.md)
- [Projects Registry](../Projects-Registry.md)
- [VPS OVH Setup](../VPS-OVH-SETUP.md)

---

**Dernière mise à jour** : 2026-01-27
**Statut** : 🚧 Template — À valider stack technique finale
**Owner** : Jay The Ermite + Takumi (Claude Code)
