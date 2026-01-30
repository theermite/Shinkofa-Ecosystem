# Lessons Learned - Index Modulaire

> Registre fragmenté des leçons apprises pour éviter limites tokens (25K).

---

## 📚 Navigation Rapide

| Catégorie | Fichier | Leçons | Dernière MAJ |
|-----------|---------|--------|--------------|
| **Docker & Containers** | [docker.md](docker.md) | 3 | 2026-01-26 |
| **Base de Données** | [database.md](database.md) | 1 | 2026-01-26 |
| **Authentication & Sécurité** | [auth.md](auth.md) | 1 | 2026-01-26 |
| **Déploiement** | [deploy.md](deploy.md) | 1 | 2026-01-26 |
| **Dépendances** | [deps.md](deps.md) | 2 | 2026-01-26 |
| **Desktop Apps** | [desktop.md](desktop.md) | 1 | 2026-01-26 |
| **IA & LLM** | [ai-llm.md](ai-llm.md) | 1 | 2026-01-26 |
| **Frontend** | [frontend.md](frontend.md) | 0 | - |
| **Backend** | [backend.md](backend.md) | 0 | - |
| **Performance** | [performance.md](performance.md) | 0 | - |
| **Configuration** | [config.md](config.md) | 0 | - |

**Total** : 10 leçons documentées

---

## 🔍 Comment Utiliser

### Rechercher une Leçon

**Option 1 : Commande (Recommandé)**
```bash
/search-registry "docker volume"
```

**Option 2 : Grep direct**
```bash
grep -r "permission denied" infrastructure/lessons/
```

**Option 3 : Lecture catégorie**
```bash
# Lire fichier spécifique
view infrastructure/lessons/docker.md
```

### Ajouter une Leçon

1. Identifier la catégorie appropriée
2. Ouvrir le fichier correspondant
3. Utiliser le template standard :

```markdown
### [TAGS] Titre Court du Problème
**Date** : YYYY-MM-DD | **Projet** : nom-projet | **Sévérité** : 🔴/🟠/🟡

**Contexte** :
[Situation qui a mené à l'erreur]

**Erreur** :
[Ce qui s'est mal passé]

**Solution** :
[Comment c'était résolu]

**Prévention** :
[Comment éviter à l'avenir]

**Fichiers/Commandes Clés** :
- `chemin/fichier.ts`
- `commande utilisée`
```

---

## 📊 Index des Tags

| Tag | Usage | Fichier Associé |
|-----|-------|-----------------|
| `[DOCKER]` | Containers, Docker Compose | docker.md |
| `[VOLUME]` | Volumes Docker | docker.md |
| `[NETWORK]` | Réseaux Docker | docker.md |
| `[DB]` | Base de données | database.md |
| `[MIGRATION]` | Migrations DB | database.md |
| `[AUTH]` | Authentication | auth.md |
| `[JWT]` | Tokens JWT | auth.md |
| `[DEPLOY]` | Déploiement | deploy.md |
| `[SSL]` | Certificats HTTPS | deploy.md |
| `[DEPS]` | Dépendances | deps.md |
| `[BREAKING]` | Breaking changes | deps.md |
| `[NPM]` | NPM/packages JS | deps.md |
| `[DESKTOP]` | Apps desktop | desktop.md |
| `[TKINTER]` | UI Tkinter | desktop.md |
| `[IA]` | LLM, ML | ai-llm.md |
| `[OLLAMA]` | Ollama spécifique | ai-llm.md |
| `[FRONTEND]` | UI, React, CSS | frontend.md |
| `[BACKEND]` | API, serveur | backend.md |
| `[PERF]` | Performance | performance.md |
| `[CONFIG]` | Configuration | config.md |

---

## 🔄 Migration Depuis Monolithique

L'ancien fichier `Lessons-Learned.md` (monolithique) a été fragmenté le 2026-01-26.

**Archive** : `_archive/Lessons-Learned-monolithic-2026-01-25.md`

**Avantages structure modulaire** :
✅ Pas de limite tokens (fichiers <10K chacun)
✅ Recherche plus rapide (grep sur catégories)
✅ Lecture ciblée (charge que ce qui est nécessaire)
✅ Scalable à l'infini
✅ Maintenance plus facile

---

## 📝 Workflow Obligatoire

**AVANT de travailler sur un sujet** :
1. `/search-registry "[sujet]"` pour voir leçons existantes
2. Lire leçons pertinentes pour éviter erreurs répétitives

**APRÈS avoir résolu une erreur significative** :
1. Ajouter dans fichier catégorie approprié
2. Update ce README si nouvelle catégorie
3. Commit avec message : `docs(lessons): Add [catégorie] - [titre court]`

---

## 🎯 Règles

1. **1 leçon = 1 section** avec template complet
2. **Tags obligatoires** en début de titre
3. **Date, Projet, Sévérité** toujours renseignés
4. **Solution concrète** avec code/commandes
5. **Prévention** pour éviter répétition

---

**Version** : 1.0 (Structure modulaire)
**Date création** : 2026-01-26
**Migration** : Depuis Lessons-Learned.md monolithique
