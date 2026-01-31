# Secrets GitHub Requis

> Configuration des secrets pour les workflows CI/CD du Shinkofa-Ecosystem.

## Comment configurer

1. Aller sur GitHub > Repository > Settings > Secrets and variables > Actions
2. Cliquer "New repository secret"
3. Ajouter chaque secret ci-dessous

---

## Secrets Obligatoires

### VPS OVH - Connexion SSH

| Secret | Description | Exemple |
|--------|-------------|---------|
| `VPS_HOST` | Adresse IP ou hostname du VPS | `vps-xxxxx.vps.ovh.net` |
| `VPS_USER` | Utilisateur SSH (pas root) | `jay` |
| `VPS_SSH_KEY` | Clé privée SSH (format OpenSSH) | Voir ci-dessous |

#### Générer/récupérer la clé SSH

```bash
# Sur ta machine locale, affiche la clé privée
cat ~/.ssh/id_ed25519

# Ou si tu utilises RSA
cat ~/.ssh/id_rsa
```

Copie le contenu **ENTIER** incluant:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## Secrets Optionnels

### Notifications (si besoin)

| Secret | Description | Usage |
|--------|-------------|-------|
| `SLACK_WEBHOOK_URL` | Webhook Slack | Notifications déploiement |
| `DISCORD_WEBHOOK_URL` | Webhook Discord | Notifications déploiement |

---

## Vérification

Après configuration, vérifie avec un déploiement manuel:

1. Aller sur Actions > Deploy - Shinkofa Ecosystem
2. Cliquer "Run workflow"
3. Sélectionner une app et lancer

---

## Structure VPS Attendue

Le workflow suppose cette structure sur le VPS:

```
/home/jay/shinkofa-ecosystem/
├── apps/
│   ├── michi/           # Next.js (PM2: michi)
│   ├── api-shizen/      # FastAPI (PM2: api-shizen)
│   └── shizen/          # Frontend (si prêt)
└── ...
```

### Prérequis VPS

```bash
# Node.js via NVM
nvm install 20
nvm use 20

# PNPM
npm install -g pnpm

# PM2
npm install -g pm2

# Python 3.12 + venv
python3.12 -m venv /home/jay/shinkofa-ecosystem/apps/api-shizen/venv
```

---

**Date**: 2026-01-31
