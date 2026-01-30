# Context - [Nom Electron App]

> Contexte business, use cases, et décisions projet.

**Dernière mise à jour** : [DATE]
**Propriétaire** : Product Owner / Tech Lead

---

## 🎯 Vision & Objectifs

### Vision Produit
**Mission** : [Description courte]

**Exemple** :
> Créer une application desktop multi-plateforme pour gestion tâches offline-first, avec synchronisation cloud optionnelle.

### Objectifs Business

| Objectif | Métrique | Cible | Deadline |
|----------|----------|-------|----------|
| Adoption utilisateurs | Téléchargements | 10,000 | Q2 2026 |
| Retention | % users actifs 30j | 60% | Q3 2026 |
| Performance | Startup time | <2s | Q1 2026 |
| Satisfaction | NPS | >8/10 | Q2 2026 |

---

## 👥 Utilisateurs & Personas

### Persona 1 : Professionnel créatif
- **Rôle** : Designer, développeur, créatif
- **Besoins** :
  - App native performante
  - Offline-first (travail sans connexion)
  - Shortcuts clavier
- **Pain points** :
  - Web apps lentes
  - Perte données si connexion coupée
- **Tech savviness** : ⭐⭐⭐⭐⚪ (4/5)

---

## 🏗️ Use Cases

### Use Case 1 : Gestion Tâches Offline

**Actor** : User
**Goal** : Créer/éditer tâches sans connexion internet

**Flow** :
1. User lance app
2. User crée tâche (stockée SQLite local)
3. User édite tâche (sync local)
4. Connexion restaurée → sync cloud automatique

**Success Criteria** :
- App fonctionnelle 100% offline
- Sync automatique background
- Conflits résolus (last-write-wins ou UI resolution)

---

## 🔒 Contraintes Techniques

### Performance
- **Startup time** : < 2 secondes (cold start)
- **UI responsiveness** : 60 FPS (animations fluides)
- **Binary size** : < 200MB (installeur Windows)

### Compatibilité
- **OS** : Windows 10+, macOS 11+, Ubuntu 20.04+
- **RAM** : Min 4GB recommandé
- **Disk** : 500MB space

---

## 🚫 Hors Scope (v1)

- ❌ Web version (Electron only) → v2
- ❌ Mobile apps (iOS/Android) → v2
- ❌ Real-time collaboration → v2
- ❌ Plugins tiers → v2

**Raison** : Focus v1 sur app desktop native robuste.

---

## 💡 Décisions Clés

### Pourquoi Electron vs Tauri ?
**Décision** : Electron
**Raison** : Maturité, écosystème npm, communauté large
**Alternative** : Tauri (plus léger, mais moins mature)
**Conséquences** : Binaires plus lourds (~150MB vs ~15MB)

### Pourquoi SQLite vs IndexedDB ?
**Décision** : SQLite (better-sqlite3)
**Raison** : Performance, SQL standard, robustesse
**Alternative** : IndexedDB (web standard, mais API complexe)

---

**Version** : 1.0 | **Maintenu par** : Product Team
