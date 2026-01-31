# QuickRef: Docker Basics

> Référence rapide Docker et Docker Compose.

---

## Commandes Essentielles

```bash
# Build
docker build -t [nom-image] .
docker build -t [nom-image] --no-cache .    # Sans cache

# Run
docker run -d -p 8080:80 --name [container] [image]
docker run -it --rm [image] bash            # Shell interactif

# Gestion containers
docker ps                   # Containers actifs
docker ps -a                # Tous les containers
docker stop [container]
docker rm [container]
docker logs -f [container]  # Logs en temps réel

# Gestion images
docker images
docker rmi [image]
docker system prune -a      # Nettoyage complet
```

---

## Docker Compose

```yaml
# docker-compose.yml minimal
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

**Commandes Compose** :
```bash
docker-compose up -d           # Démarrer
docker-compose down            # Arrêter
docker-compose logs -f         # Logs
docker-compose build --no-cache  # Rebuild
docker-compose exec app bash   # Shell dans container
```

---

## Dockerfile Optimisé (Python)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dépendances d'abord (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code ensuite
COPY . .

# User non-root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Dockerfile Optimisé (Node.js)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Dépendances d'abord
COPY package*.json ./
RUN npm ci --only=production

# Code ensuite
COPY . .

# User non-root
USER node

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Debug

```bash
# Inspecter container
docker inspect [container]
docker exec -it [container] sh

# Logs avec timestamp
docker logs -t --since 1h [container]

# Stats ressources
docker stats
```

---

**Version** : 1.0 | **Trigger** : Build, deploy, debug container
