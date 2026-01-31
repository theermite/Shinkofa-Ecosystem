---
name: project-registry-update
description: Mise à jour du registre centralisé des projets. Utiliser après changement significatif (nouveau projet, changement statut, nouveau domaine, changement stack).
allowed-tools:
  - Read
  - Write
  - Bash
user-invocable: true
---

# Project Registry Update Skill

## Mission
Maintenir `infrastructure/Projects-Registry.md` à jour comme source de vérité pour tous les projets Jay.

## Déclencheurs

### Automatiques (Claude suggère)
- Nouveau projet créé
- Changement de statut (actif → pause → archive)
- Nouveau domaine/sous-domaine configuré
- Changement de stack significatif
- Déploiement sur nouvelle infrastructure
- Certificat SSL proche expiration

### Manuels
- "Mets à jour le registre"
- "Ajoute ce projet au registre"
- "Le projet X est maintenant en pause"
- Fin de session avec changements majeurs

---

## Workflow

### 1. Identifier le Changement

| Type | Sections à Mettre à Jour |
|------|--------------------------|
| Nouveau projet | Projets Actifs, Repos GitHub, Priorités |
| Statut changé | Déplacer entre Actifs/Pause/Archives |
| Nouveau domaine | Domaines & SSL |
| Stack modifié | Stack par Type de Projet |
| Infra changée | Infrastructure Disponible |

### 2. Lire l'État Actuel

```bash
# Charger le registre
Read infrastructure/Projects-Registry.md
```

### 3. Appliquer les Modifications

Utiliser le format existant. Ne pas changer la structure.

### 4. Mettre à Jour la Date

```markdown
**Dernière mise à jour** : [DATE-ACTUELLE]
```

---

## Format des Entrées

### Nouveau Projet Actif
```markdown
| **nom-projet** | Type | Stack | État | Hébergement |
```

Exemple :
```markdown
| **nouveau-projet** | Fullstack | TypeScript (Next.js + FastAPI) | En cours | VPS OVH |
```

### Changement de Statut
```markdown
## Projets En Pause
| Projet | Raison | Évolution Prévue |
|--------|--------|------------------|
| nom-projet | [Raison claire] | [Plan futur ou "-"] |
```

### Nouveau Domaine
```markdown
| domaine.com | projet-associé | ✅/⚠️ [Xj] |
```
- ✅ = SSL OK
- ⚠️ Xj = Expire dans X jours

### Archive
```markdown
## Archives (Ne plus développer)
| Projet | Raison | Action |
|--------|--------|--------|
| nom | Obsolète/Remplacé/Arrêté | Archive/Extraire code |
```

---

## Vérifications Automatiques

### SSL Certificates
```bash
# Vérifier expiration (si accès)
echo | openssl s_client -servername domain.com -connect domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Repos GitHub
```bash
# Lister les repos récents
gh repo list theermite --limit 20 --json name,updatedAt
```

### Docker Containers (VPS)
```bash
# Si sur VPS
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Template Mise à Jour

Quand Claude met à jour le registre :

```markdown
## 🔄 Mise à Jour Projects-Registry.md

**Date** : [DATE]
**Raison** : [Nouveau projet / Changement statut / etc.]

### Modifications
- [x] [Description modification 1]
- [x] [Description modification 2]

### Vérifications
- [ ] Aucun projet dupliqué
- [ ] Tous les liens infra corrects
- [ ] Date mise à jour actualisée

### Prochaines Vérifications Suggérées
- [ ] SSL certificates dans [X] jours
- [ ] Dépendances projet [Y] à auditer
```

---

## Intégration Session-Manager

À la fin de session, si changement significatif :

```
Session-Manager: "Projet modifié significativement. Mettre à jour le registre ?"
→ Oui: Invoquer ce skill
→ Non: Skip
```

---

## Rappels Périodiques

### Mensuel
- Vérifier tous les certificats SSL
- Auditer projets en pause (toujours pertinents ?)
- Vérifier cohérence repos GitHub vs registre

### Trimestriel
- Revoir priorités
- Archiver projets abandonnés
- Mettre à jour stacks si évolutions

---

## Contraintes

- NE JAMAIS supprimer d'entrée sans confirmation
- Garder historique dans Archives (pas de suppression définitive)
- Format cohérent avec existant
- Toujours mettre à jour la date en bas du fichier
- Commit après modification du registre
