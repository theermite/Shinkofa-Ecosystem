# Infrastructure O2Switch

> Hébergement mutualisé haute capacité pour sites statiques, DBs secondaires et projets légers.

---

## Compte

| Spec | Valeur |
|------|--------|
| **Fournisseur** | O2Switch |
| **Type** | Mutualisé Premium |
| **cPanel** | Accès complet |

---

## Capacités (Illimité)

| Ressource | Utilisé | Limite | % |
|-----------|---------|--------|---|
| **Processus** | 10 | 400 | 2.5% |
| **Mémoire physique** | 117 MB | 48 GB | 0.24% |
| **Espace disque** | 206 MB | Illimité | - |
| **Database disk** | 206 MB | Illimité | - |
| **PostgreSQL disk** | 0 B | Illimité | - |
| **Bande passante** | 13.12 GB | Illimité | - |

---

## Fonctionnalités Disponibles

### Domaines & Sous-domaines
- Sous-domaines **illimités**
- SSL Let's Encrypt automatique
- Domaines additionnels possibles

### Bases de Données
- **MySQL/MariaDB** : Illimité
- **PostgreSQL** : Disponible (non utilisé actuellement)
- phpMyAdmin / phpPgAdmin

### Hébergement
- PHP 8.x
- Node.js (via SSH/cPanel)
- Python (WSGI possible)
- Sites statiques (idéal)

### Outils
- SSH Access
- Git deployment
- Cron jobs
- File Manager
- Softaculous (WordPress, etc.)

---

## Stratégie d'Utilisation Recommandée

### O2Switch (Privilégier pour)
| Type | Exemples |
|------|----------|
| **Sites statiques** | Landing pages, portfolios, docs |
| **Sites WordPress** | Blogs, vitrines |
| **Backups DB** | Réplications, archives |
| **Assets CDN** | Images, vidéos, fichiers |
| **Projets légers** | APIs simples, webhooks |

### VPS OVH (Réserver pour)
| Type | Exemples |
|------|----------|
| **Apps containerisées** | Docker, microservices |
| **APIs lourdes** | FastAPI avec ML, Shizen |
| **Bases temps réel** | PostgreSQL + Redis sessions |
| **Apps fullstack** | Shinkofa Platform, SLF |
| **Automation** | N8N, cron complexes |

---

## Projets Actuels sur O2Switch

*(À documenter au fur et à mesure)*

| Projet | Type | Domaine |
|--------|------|---------|
| - | - | - |

---

## Avantages O2Switch

1. **Coût fixe** : Pas de scaling à gérer
2. **Maintenance incluse** : Sécurité, updates, backups
3. **Uptime garanti** : Infrastructure pro
4. **Ressources généreuses** : 48 GB RAM, processus illimités
5. **SSL automatique** : Let's Encrypt intégré
6. **Support FR** : Assistance en français

---

## Déploiement sur O2Switch

### Site statique
```bash
# Via Git
git push o2switch main

# Ou FTP/SFTP vers public_html/sous-domaine
```

### Application Node.js
```bash
# Via cPanel > Setup Node.js App
# Ou via SSH
cd ~/app && npm install && npm start
```

### Base de données
```bash
# Créer via cPanel > MySQL/PostgreSQL Databases
# Importer via phpMyAdmin ou CLI
```

---

## Complémentarité VPS + O2Switch

```
┌─────────────────────────────────────────────────────────┐
│                    ARCHITECTURE                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────────┐        ┌─────────────────┐        │
│   │   VPS OVH       │        │   O2Switch      │        │
│   │   (Production)  │        │   (Statiques)   │        │
│   ├─────────────────┤        ├─────────────────┤        │
│   │ Shinkofa        │        │ Landing pages   │        │
│   │ SLF-Esport      │        │ Docs/Assets     │        │
│   │ N8N             │        │ Backups DB      │        │
│   │ APIs complexes  │        │ Sites vitrines  │        │
│   │ Docker/Redis    │        │ WordPress       │        │
│   └────────┬────────┘        └────────┬────────┘        │
│            │                          │                  │
│            └──────────┬───────────────┘                  │
│                       │                                  │
│              ┌────────▼────────┐                         │
│              │   Cloudflare    │                         │
│              │   (DNS + CDN)   │                         │
│              └─────────────────┘                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Accès

| Type | Valeur |
|------|--------|
| **cPanel** | *(URL à renseigner)* |
| **SSH** | *(Host à renseigner)* |
| **FTP** | *(Credentials dans gestionnaire)* |

---

**Dernière mise à jour** : 2026-01-19
