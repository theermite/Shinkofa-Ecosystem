# Docker Best Practices & Leçons Apprises

**Contexte d'usage** : Consulter ce fichier si projet utilise Docker, docker-compose, ou containers.

---

## 🐳 Docker Compose + Uvicorn (FastAPI)

### Arguments sur une seule ligne
✅ **RECOMMANDÉ** : Arguments Uvicorn sur une ligne (éviter parsing YAML multi-lignes)

```yaml
# ❌ ÉVITER (parsing YAML imprévisible)
command: >
  uvicorn app.main:app
  --host 0.0.0.0
  --reload
  --reload-dirs /app

# ✅ RECOMMANDÉ
command: uvicorn app.main:app --host 0.0.0.0 --reload --reload-dir /app
```

### Option --reload-dir (SINGULIER)
- ✅ `--reload-dir /app` (option Uvicorn correcte)
- ❌ `--reload-dirs` n'existe PAS dans Uvicorn
- Peut être répété : `--reload-dir /app --reload-dir /lib`
- Toujours vérifier documentation officielle Uvicorn

### restart vs up -d --force-recreate
- `docker-compose restart` : Redémarre container SANS recréer (garde ancienne config)
- `docker-compose up -d --force-recreate` : Recrée container avec nouvelle config
- **TOUJOURS utiliser `up -d --force-recreate`** après changement `docker-compose.yml`

---

## ⚠️ Docker Cache (Problème Critique)

### Risque
Cache peut garder anciens fichiers même après `git pull` ou modif `requirements.txt`

### --no-cache OBLIGATOIRE si
- Fichiers `requirements.txt` / `package.json` modifiés ET image déjà buildée
- Erreurs inexplicables après changements dépendances
- Doute sur synchronisation fichiers

```bash
# ❌ RISQUÉ après changement requirements
docker-compose build

# ✅ SÉCURISÉ
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

### Workflow rebuild complet (si doute)
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🧪 Testing Docker Apps

### Tester intérieur ET extérieur container
```bash
# Test intérieur container
docker exec -it <container> curl http://localhost:8000/health

# Test extérieur (depuis hôte)
curl http://localhost:8000/health
```

**Important** : Health checks Docker ≠ accessibilité réseau depuis hôte

### Patterns recherche containers
```bash
# Vérifier nom exact container AVANT scripts
docker ps --format "{{.Names}}"

# Utiliser pattern approprié
docker ps | grep "pattern-nom-container"
```

### Logs détaillés pour debug
```bash
# Logs temps réel
docker-compose logs -f

# Logs service spécifique
docker-compose logs -f <service_name>

# Dernières 100 lignes
docker-compose logs --tail=100
```

---

## ✅ Checklist Debug Docker

Vérifier dans cet ordre :

- [ ] **Fichier modifié commit/push ?** (`git status`)
- [ ] **`git pull` effectué sur serveur ?** (si déploiement distant)
- [ ] **Build `--no-cache` si changement dépendances ?**
- [ ] **`up -d --force-recreate` après changement docker-compose.yml ?**
- [ ] **Logs container vérifiés ?** (`docker-compose logs -f`)
- [ ] **Health check intérieur container OK ?** (`docker exec curl localhost:8000`)
- [ ] **Port mapping correct ?** (`docker ps` vérifier colonnes PORTS)
- [ ] **Firewall/réseau bloque pas port ?** (tester `curl` depuis hôte)

---

**Retour vers** : `CLAUDE.md` pour workflow principal
