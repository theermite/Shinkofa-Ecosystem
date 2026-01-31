# Configuration Nginx Production SLF-Esport

## Fichier de configuration
`/etc/nginx/sites-available/slf-esport`

## Modification critique pour HTTPS

**Problème résolu:** Mixed Content Error - Les redirections 307 de FastAPI convertissaient HTTPS en HTTP.

**Solution appliquée (ligne 28-42):**
```nginx
location /api/v1 {
    proxy_pass http://slf_backend/api/v1;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;  # Force HTTPS
    proxy_set_header X-Forwarded-Host $host;    # Préserve hostname
    proxy_redirect http:// https://;             # Convertit redirections HTTP→HTTPS
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

## Commandes utiles

### Tester la configuration
```bash
sudo nginx -t
```

### Recharger nginx (sans downtime)
```bash
sudo systemctl reload nginx
```

### Redémarrer nginx
```bash
sudo systemctl restart nginx
```

### Voir les logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Architecture

```
Internet (HTTPS)
    ↓
Nginx (/etc/nginx - port 443)
    ↓
    ├─→ Frontend (Docker port 3000) → Vite dev server
    ↓
    └─→ Backend (Docker port 8001) → FastAPI
```

## Notes importantes

- Le certificat SSL est géré par Let's Encrypt (Certbot)
- Le frontend tourne en mode dev (Vite) sur le port 3000
- Le backend FastAPI tourne sur le port 8001
- Nginx gère automatiquement la conversion HTTP→HTTPS pour les redirections
