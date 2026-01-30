---
name: refactoring-planner
description: Planification de refactoring safe et incrémental. Utiliser quand Jay mentionne "refactor", "nettoyer le code", "dette technique", ou quand le code devient difficile à maintenir.
allowed-tools:
  - Read
  - Grep
  - Glob
user-invocable: true
---

# Refactoring Planner Skill

## Mission
Planifier des refactorings sûrs, incrémentaux et sans régression, en respectant le principe "small commits, always working".

## Déclencheurs
- "On devrait refactorer..."
- "Ce code est devenu un mess"
- "Dette technique"
- "Difficile à maintenir"
- Code review révèle problèmes structurels

## Principes Fondamentaux

### Règles d'Or
```
1. JAMAIS de big-bang refactor
2. Toujours un test avant de modifier
3. Un seul changement par commit
4. Code toujours fonctionnel entre commits
5. Refactor ET feature = interdit (séparer)
```

### Red Flags à Éviter
- Refactorer sans tests
- Modifier plusieurs responsabilités à la fois
- Renommer + restructurer simultanément
- Refactorer du code qu'on ne comprend pas

## Workflow

### 1. Diagnostic

```markdown
## État Actuel
- Fichier(s) concerné(s) : [liste]
- Lignes de code : [count]
- Couverture tests : [%]
- Complexité cyclomatique : [si mesurable]

## Problèmes Identifiés
- [ ] [Code smell 1] - [Fichier:Ligne]
- [ ] [Code smell 2] - [Fichier:Ligne]

## Impact Refactoring
- Fichiers impactés : [count]
- Risque régression : [Faible/Moyen/Élevé]
```

### 2. Catégoriser les Refactorings

| Catégorie | Risque | Exemples |
|-----------|--------|----------|
| **Safe** | Faible | Rename, extract variable, inline |
| **Structural** | Moyen | Extract method/class, move |
| **Architectural** | Élevé | Change pattern, restructure modules |

### 3. Plan Incrémental

**Template Plan** :
```markdown
## Plan Refactoring: [Nom]

### Pré-requis
- [ ] Tests existants passent
- [ ] Coverage minimum sur code ciblé
- [ ] Commit clean (git status)

### Étapes (ordre strict)

#### Étape 1: [Safe refactoring]
- Action : [description]
- Fichiers : [liste]
- Test : [comment vérifier]
- Commit : "[REFACTOR] [description]"

#### Étape 2: [Autre safe refactoring]
...

#### Étape N: [Structural si nécessaire]
...

### Validation Finale
- [ ] Tous tests passent
- [ ] Lint zéro warnings
- [ ] Review manuelle OK
```

## Catalogue Refactorings

### Safe Refactorings (Automatisables)

#### Rename (Variable/Function/Class)
```python
# Avant
def calc(x, y):
    r = x + y
    return r

# Après
def calculate_sum(first_number, second_number):
    result = first_number + second_number
    return result
```
**Commit** : `[REFACTOR] Rename calc to calculate_sum for clarity`

#### Extract Variable
```python
# Avant
if user.age >= 18 and user.country == "FR" and user.verified:

# Après
is_adult = user.age >= 18
is_french = user.country == "FR"
is_eligible = is_adult and is_french and user.verified
if is_eligible:
```
**Commit** : `[REFACTOR] Extract eligibility conditions to named variables`

#### Extract Function/Method
```python
# Avant
def process_order(order):
    # 50 lignes de validation
    # 30 lignes de calcul
    # 20 lignes de sauvegarde

# Après
def process_order(order):
    validate_order(order)
    total = calculate_order_total(order)
    save_order(order, total)
```
**Commit** : `[REFACTOR] Extract validation/calculation/save from process_order`

#### Remove Dead Code
```python
# Identifier avec grep/IDE
# Supprimer seulement si certain (git blame, tests)
```
**Commit** : `[REFACTOR] Remove unused function legacy_handler`

### Structural Refactorings (Prudence)

#### Extract Class
```
Quand : Classe > 200 lignes OU > 1 responsabilité
Comment :
1. Identifier groupe de méthodes cohérent
2. Créer nouvelle classe
3. Déléguer (garder ancienne interface)
4. Migrer appelants progressivement
5. Supprimer délégation
```

#### Move to Module
```
Quand : Fonction utilisée par plusieurs modules
Comment :
1. Copier dans nouveau module
2. Importer depuis nouveau module
3. Rediriger anciens imports
4. Supprimer original
```

#### Change Signature
```
Quand : Paramètres confus ou nombreux
Comment :
1. Créer nouvelle signature
2. Wrapper ancienne vers nouvelle
3. Migrer appelants
4. Supprimer wrapper
```

## Patterns Communs

### God Class → Services
```
1. Identifier responsabilités distinctes
2. Extraire chaque responsabilité en service
3. Injecter services dans classe originale
4. Déléguer méthodes
5. (Optionnel) Supprimer classe originale
```

### Spaghetti → Layers
```
1. Identifier couches (UI, Business, Data)
2. Créer interfaces entre couches
3. Migrer fonction par fonction
4. Respecter dépendances (UI → Business → Data)
```

### Callback Hell → Async/Await
```javascript
// Étape 1: Promisify une fonction
// Étape 2: Convertir en async/await
// Étape 3: Propager aux appelants
// Commit à chaque étape
```

## Checklist Sécurité

### Avant Chaque Commit
- [ ] `git diff` relu
- [ ] Tests passent
- [ ] Un seul type de changement
- [ ] Message commit clair

### Après Refactoring Complet
- [ ] Tous tests passent
- [ ] Coverage identique ou meilleure
- [ ] Performance non dégradée
- [ ] Documentation mise à jour si API change

## Format Output

```markdown
## Plan Refactoring: [Nom Court]

### Contexte
[1-2 phrases sur pourquoi ce refactoring]

### Risque: [Faible/Moyen/Élevé]

### Pré-requis
- [ ] Tests OK
- [ ] Commit clean

### Étapes
1. **[Action]** - [Fichier] - Commit: "[REFACTOR] ..."
2. **[Action]** - [Fichier] - Commit: "[REFACTOR] ..."
...

### Estimation
- Commits : [X]
- Fichiers touchés : [Y]

### Validation
- [ ] Tests passent
- [ ] Lint OK
- [ ] Review manuelle
```

## Contraintes
- Plan toujours AVANT implémentation
- Attendre validation Jay avant d'exécuter
- Un commit = un changement atomique
- Toujours réversible (git revert possible)
