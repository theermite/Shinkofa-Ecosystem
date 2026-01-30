# /cdc

Créer un cahier des charges de manière interactive et structurée.

## Description

Cette commande lance un processus guidé pour établir un cahier des charges complet. L'assistant pose des questions pertinentes, clarifie les besoins, et génère un document professionnel.

## Usage

```bash
/cdc                      # Démarrer un nouveau CDC (mode interactif)
/cdc <nom-projet>         # CDC pour un projet spécifique
/cdc --app michi          # CDC pour une app du monorepo
/cdc --feature            # CDC pour une nouvelle feature
/cdc --template           # Voir les templates disponibles
```

## Processus Interactif

### Phase 1 : Contexte (5 questions)

1. **Quel est le projet ?**
   - Nouveau projet ou évolution existant ?
   - Nom et description courte

2. **Quel problème résout-il ?**
   - Pain points actuels
   - Pour qui ? (utilisateurs cibles)

3. **Quelle est la vision ?**
   - Objectif à 6 mois / 1 an
   - Critères de succès

4. **Quelles contraintes ?**
   - Budget / temps
   - Techniques (stack imposée ?)
   - Dépendances

5. **Existe-t-il des inspirations ?**
   - Références (apps, sites)
   - Ce qu'on veut imiter ou éviter

### Phase 2 : Fonctionnalités (détail)

Pour chaque fonctionnalité :
- **Nom** : Titre court
- **Description** : Ce que ça fait
- **Priorité** : Must-have / Should-have / Nice-to-have
- **Complexité estimée** : Simple / Moyenne / Complexe
- **Dépendances** : Autres features requises

### Phase 3 : Spécifications Techniques

- Architecture proposée
- Stack technologique
- Intégrations externes
- Considérations sécurité
- Performance attendue

### Phase 4 : Planning (optionnel)

- Phases de développement
- Jalons (milestones)
- Livrables par phase

## Output

Document généré dans `docs/Cdc-[Nom-Projet].md` :

```markdown
---
title: Cahier des Charges - [Nom Projet]
version: 1.0
created: [date]
status: draft
type: CDC
---

# Cahier des Charges — [Nom Projet]

## 1. Contexte et Objectifs
### 1.1 Problématique
### 1.2 Solution proposée
### 1.3 Utilisateurs cibles
### 1.4 Critères de succès

## 2. Périmètre Fonctionnel
### 2.1 Features Must-Have
### 2.2 Features Should-Have
### 2.3 Features Nice-to-Have
### 2.4 Hors périmètre (explicitement exclu)

## 3. Spécifications Techniques
### 3.1 Architecture
### 3.2 Stack technologique
### 3.3 Intégrations
### 3.4 Sécurité
### 3.5 Performance

## 4. Contraintes
### 4.1 Budget
### 4.2 Délais
### 4.3 Techniques
### 4.4 Légales/Conformité

## 5. Planning Prévisionnel
### 5.1 Phases
### 5.2 Jalons
### 5.3 Livrables

## 6. Annexes
### 6.1 Maquettes/Wireframes
### 6.2 Références
### 6.3 Glossaire
```

## Exemples

### Nouveau projet complet
```bash
/cdc
```
→ Lance le questionnaire complet

### Feature spécifique
```bash
/cdc --feature
> "Système de notifications push pour Michi"
```
→ CDC ciblé sur cette feature

### Pour une app existante
```bash
/cdc --app shizen
```
→ CDC pré-rempli avec contexte Shizen

## Tips

- **Sois précis** dans tes réponses, plus tu donnes de détails, meilleur sera le CDC
- **N'hésite pas** à dire "je ne sais pas" — l'assistant proposera des options
- **Itère** : le CDC peut être affiné en plusieurs sessions

## Templates Disponibles

| Template | Usage |
|----------|-------|
| `app-web` | Application web complète |
| `feature` | Nouvelle fonctionnalité |
| `api` | Nouveau service API |
| `integration` | Intégration système externe |
| `refonte` | Refonte d'un existant |

---

**Version** : 1.0 | **Date** : 2026-01-30
