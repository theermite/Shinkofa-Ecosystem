# Registre des Projets

> Liste centralisée de tous les projets, leur état et configuration.

---

## Infrastructure Disponible

| Plateforme | Usage Recommandé | Capacité |
|------------|------------------|----------|
| **VPS OVH** | Apps Docker, APIs lourdes, temps réel | 8 cores, 22 GB RAM |
| **O2Switch** | Sites statiques, vitrines, backups DB | Illimité (48 GB RAM, stockage illimité) |
| **Local** | Dev, IA/ML, Desktop apps | Ermite-Game (RTX 3060), Dell-Ermite |

---

## Projets Actifs

### Shinkofa (Marque)

| Projet | Type | Stack | État | Hébergement |
|--------|------|-------|------|-------------|
| **shinkofa-platform** | Fullstack | TypeScript (Next.js + FastAPI) | En cours | VPS OVH |
| **Social-Content-Master** | Éditeur vidéo | TypeScript (Next.js + FFmpeg + Prisma) | Sprint 1 OK | VPS OVH |
| **SLF-Esport** | Fullstack | TypeScript (Nginx + FastAPI) | En cours | VPS OVH |
| **Shizen-Koshin-MVP** | IA Multi-agents | Python + Ollama | À reprendre | Local (Ollama) |

### The Ermite (Personnel)

| Projet | Type | Stack | État | Hébergement |
|--------|------|-------|------|-------------|
| **toolbox-theermite** | Widgets Web | TypeScript | En cours | VPS OVH / O2Switch |
| **Hibiki-Dictate** | Desktop | Python (CustomTkinter) | En cours | Local Windows |
| **Ermite-Podcaster** | Desktop | JavaScript (Electron) | En cours | Local |
| **Instruction-Claude-Code** | Config | Markdown | Actif | GitHub privé |

---

## Projets En Pause

| Projet | Raison | Évolution Prévue |
|--------|--------|------------------|
| WinAdminTE | Priorisation | - |
| Family-Planner-Simple | Priorisation | → Family Hub Shinkofa |
| LesPetitsLiens | En attente | - |
| KnowledgeBase-CoachingShinkofa | En attente | - |

---

## Archives (Ne plus développer)

| Projet | Raison | Action |
|--------|--------|--------|
| Shizen | Obsolète | Archiver |
| planner-shinkofa | Remplacé | Extraire code utile → Archive |
| Website-Shinkofa | Obsolète | Archive |
| TodoJayWeb | Obsolète | Archive |
| KoshinIA-Dell | Arrêté | Archive |
| Instructions-Chatbot-Koshin | Remplacé | Archive |
| File-Organizer | Test initial | Archive |

---

## Repos GitHub (theermite)

### Publics
| Repo | Description |
|------|-------------|
| toolbox-theermite | Jeux d'entraînement cérébral Esport |

### Privés Actifs
| Repo | Stack | Dernière MAJ |
|------|-------|--------------|
| shinkofa-platform | TypeScript | Récent |
| Hibiki-Dictate | Python | 14 jan |
| SLF-Esport | TypeScript | 13 jan |
| Instruction-Claude-Code | Markdown | 13 jan |
| Ermite-Podcaster | JavaScript | 3 jan |

---

## Stack par Type de Projet

| Type | Frontend | Backend | DB | Hébergement Recommandé |
|------|----------|---------|----|----|
| **Fullstack Web** | Next.js/React | FastAPI | PostgreSQL + Redis | VPS OVH (Docker) |
| **Site Vitrine** | HTML/CSS/JS | - | - | O2Switch |
| **Widgets Web** | TypeScript/React | - | - | VPS OVH ou O2Switch |
| **Desktop** | CustomTkinter/Electron | Python/Node | SQLite | Local |
| **IA/ML** | - | Python + LangChain | ChromaDB | Local (Ollama) |
| **WordPress** | WordPress | PHP | MySQL | O2Switch |

---

## Domaines & SSL

### Shinkofa
| Domaine | Projet | SSL | État |
|---------|--------|-----|------|
| app.shinkofa.com | shinkofa-platform (prod) | ✅ | Actif |
| alpha.shinkofa.com | shinkofa-platform (staging) | ✅ | Actif |
| **studio.shinkofa.com** | Social-Content-Master | ⏳ | À configurer |
| **media.shinkofa.com** | API Stockage médias | ⏳ | À configurer |
| **cloud.shinkofa.com** | Cloud storage (futur) | ⏳ | Planifié |
| lslf.shinkofa.com | SLF-Esport (prod) | ⚠️ | SSL à renouveler |
| devslf.shinkofa.com | SLF-Esport (dev) | ✅ | Actif |
| planner.shinkofa.com | planner-shinkofa (archive) | ✅ | Archive |
| shizen.shinkofa.com | - | ✅ | Inactif |

### The Ermite
| Domaine | Projet | SSL | État |
|---------|--------|-----|------|
| brain-training.theermite.com | toolbox-theermite | ✅ | Actif |
| tools.theermite.com | Ermite Toolbox API | ✅ | Actif |
| n8n.theermite.com | N8N Automation | ✅ | Actif |
| **media.theermite.com** | Mediacenter (Jellyfin) | ⏳ | Planifié |

---

## Architecture Services Planifiée

### Shinkofa Ecosystem

```
shinkofa.com/             → Plateforme principale coaching
├── app.shinkofa.com      → App web (authentification, dashboard)
├── studio.shinkofa.com   → Éditeur vidéo (Social-Content-Master)
├── media.shinkofa.com    → API stockage (pas de frontend)
└── cloud.shinkofa.com    → Cloud storage (Google Drive-like, futur)
```

### The Ermite Ecosystem

```
theermite.com/            → Site podcast/contenu
├── media.theermite.com   → Mediacenter perso (Jellyfin)
├── brain-training.*      → Jeux cognitifs
└── tools.*               → API utilitaires
```

### Distinction des services média

| Service | Rôle | Frontend |
|---------|------|----------|
| `media.shinkofa.com` | API stockage pour apps (upload/download) | Non (API only) |
| `cloud.shinkofa.com` | Cloud storage utilisateur | Oui (interface Drive) |
| `media.theermite.com` | Mediacenter personnel | Oui (Jellyfin) |

---

## Priorités Actuelles

1. **Social-Content-Master** - Éditeur vidéo podcast (studio.shinkofa.com)
2. **shinkofa-platform** - Plateforme principale Shinkofa
3. **Hibiki-Dictate** - Speech-to-text personnel
4. **SLF-Esport** - Plateforme e-sport
5. **toolbox-theermite** - Package NPM jeux cognitifs

---

## Règles de Mise à Jour

Ce fichier doit être mis à jour quand :
- [ ] Nouveau projet créé
- [ ] Changement d'état (actif → pause → archive)
- [ ] Nouveau domaine/déploiement
- [ ] Changement de stack significatif

---

**Dernière mise à jour** : 2026-01-26
