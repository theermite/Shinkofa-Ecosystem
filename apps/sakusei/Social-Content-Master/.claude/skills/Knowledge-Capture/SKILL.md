---
name: knowledge-capture
description: Capture et documentation des leçons apprises. Utiliser après résolution d'un bug difficile, découverte importante, ou erreur à ne pas répéter.
allowed-tools:
  - Read
  - Write
  - Grep
user-invocable: true
---

# Knowledge Capture Skill

## Mission
Capturer les leçons apprises de manière structurée dans `Lessons-Learned.md` pour capitalisation future.

## Déclencheurs
- "Documente cette leçon"
- "On ne doit pas refaire cette erreur"
- "Capture ça pour plus tard"
- "Ajoute aux lessons learned"
- Après résolution d'un bug > 30 min
- Après découverte d'un pattern utile

## Workflow

### 1. Collecter les Informations

**Questions à poser** :
```
1. Quel était le contexte ? (projet, tâche en cours)
2. Quelle erreur/problème s'est produit ?
3. Quelle était la cause racine ?
4. Quelle solution a fonctionné ?
5. Comment éviter ce problème à l'avenir ?
6. Quels fichiers/commandes sont impliqués ?
```

### 2. Déterminer la Sévérité

| Sévérité | Critères |
|----------|----------|
| 🔴 Critique | Perte données, downtime prod, sécurité |
| 🟠 Élevé | Bug bloquant, temps perdu > 2h |
| 🟡 Moyen | Friction, temps perdu 30min-2h |

### 3. Assigner les Tags

Tags disponibles :
```
[DOCKER] [DB] [AUTH] [DEPLOY] [DEPS] [FRONTEND]
[BACKEND] [DESKTOP] [IA] [PERF] [CONFIG] [GIT]
[SSL] [BREAKING] [MIGRATION] [SECURITY] [UX]
```

Combiner si nécessaire : `[DOCKER] [DB]`

### 4. Formater la Leçon

```markdown
### [TAGS] Titre Court et Descriptif
**Date** : YYYY-MM-DD | **Projet** : nom-projet | **Sévérité** : 🔴/🟠/🟡

**Contexte** :
[1-2 phrases sur la situation]

**Erreur** :
[Description claire du problème]

**Solution** :
```code
[Code ou commandes de la solution]
```

**Prévention** :
1. [Action préventive 1]
2. [Action préventive 2]

---
```

### 5. Ajouter à Lessons-Learned.md

1. Lire le fichier existant
2. Identifier la catégorie appropriée
3. Ajouter la leçon dans la bonne section
4. Mettre à jour le compteur en bas du fichier

### 6. Vérifier les Liens

Si la leçon impacte d'autres fichiers :
- Mettre à jour `Knowledge-Hub.md` si pattern cross-projet
- Ajouter référence dans quickref pertinent si utile
- Mettre à jour checklist si action préventive récurrente

## Catégories Existantes

```
- Docker & Containers
- Base de Données
- Authentication & Sécurité
- Frontend & UI
- Backend & API
- Déploiement
- Git & Versioning
- Dépendances & Migrations
- Desktop Apps
- IA & LLM
- Performance
- Configuration
```

Si nouvelle catégorie nécessaire, la créer avec un header H2.

## Exemples de Capture

### Exemple 1 : Bug Docker
```
User: "On a passé 1h sur ce bug de network Docker, documente ça"

Claude:
1. Collecte les détails
2. Formate en leçon
3. Ajoute dans section "Docker & Containers"
4. Confirme l'ajout
```

### Exemple 2 : Pattern Découvert
```
User: "Ce pattern de retry avec exponential backoff est génial, garde ça"

Claude:
1. Documente comme leçon positive (pas erreur)
2. Tag [PATTERN] [BACKEND]
3. Inclut le code complet
4. Ajoute dans section appropriée
```

## Format de Confirmation

Après capture :
```markdown
✅ Leçon ajoutée à Lessons-Learned.md

**Titre** : [titre]
**Section** : [catégorie]
**Tags** : [tags]
**Sévérité** : [emoji]

📍 Cette leçon sera consultable pour les futurs projets similaires.
```

## Rappels Automatiques

À suggérer en fin de session si :
- Bug résolu après > 30 min de debug
- Erreur de déploiement corrigée
- Pattern réutilisé de mémoire (signe qu'il devrait être documenté)
- Jay mentionne "on avait déjà eu ce problème"

## Contraintes

- Toujours confirmer le contenu avant d'écrire
- Format cohérent avec leçons existantes
- Solution doit être actionnable (pas vague)
- Prévention doit être concrète
- Code inclus doit être fonctionnel
