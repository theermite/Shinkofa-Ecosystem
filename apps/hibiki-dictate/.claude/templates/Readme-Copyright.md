---
title: Guide Templates Copyright
version: 1.0
date: 2025-11-13
---

# 📜 Templates Copyright & Mentions Légales

Ce dossier contient les templates de copyright et mentions légales pour tous les projets de Jay The Ermite.

---

## 📁 Templates Disponibles

### 1. COPYRIGHT-PERSONNEL.md
**Usage** : Projets à usage personnel de Jay

**Caractéristiques** :
- Copyright : "© 2025 Jay 'The Ermite' Goncalves"
- Licence : Personnelle Restrictive
- Usage : Personnel uniquement, pas de commercial
- Branding : "Jay The Ermite, Créateur de la Voie Shinkofa"

**Exemples de projets** :
- Personal Dashboard
- Family Hub
- Stream Optimizer
- Outils personnels de productivité

---

### 2. COPYRIGHT-SHINKOFA.md
**Usage** : Projets officiels de La Voie Shinkofa

**Caractéristiques** :
- Copyright : "© 2025 La Voie Shinkofa (真の歩)"
- Licence : Creative Commons BY-NC-SA 4.0
- Usage : Communauté Shinkofa, pas de commercial sans licence
- Branding : "La Voie Shinkofa - Fondée par Jay 'The Ermite' Goncalves"

**Exemples de projets** :
- Koshin MVP (système IA)
- Plateforme Coaching "La Salade de Fruits"
- Applications Shinkofa publiques
- Outils communautaires Shinkofa

---

## 🔄 Workflow TAKUMI

### Étape 0 du Workflow Développement

**Au démarrage de CHAQUE projet, TAKUMI demande** :

```
📋 Type de projet ?
1. Usage personnel → Copyright "Jay The Ermite"
2. Projet Shinkofa → Copyright "La Voie Shinkofa"

Réponse : [1 ou 2]
```

### Selon la Réponse

**Si réponse = 1 (Personnel)** :
```bash
cp .claude/templates/COPYRIGHT-PERSONNEL.md projet/COPYRIGHT.md
```

**Si réponse = 2 (Shinkofa)** :
```bash
cp .claude/templates/COPYRIGHT-SHINKOFA.md projet/COPYRIGHT.md
```

---

## 📝 Contenu des Templates

### COPYRIGHT-PERSONNEL.md contient :

1. **Copyright Notice** : Jay "The Ermite" Goncalves
2. **À Propos** : Lien avec la Voie Shinkofa
3. **Usage Personnel** : Conditions d'utilisation
4. **Contact** : GitHub, site web Shinkofa
5. **Mentions Légales** : Responsabilité, données, propriété intellectuelle
6. **Licence** : Personnelle Restrictive (usage personnel uniquement)

### COPYRIGHT-SHINKOFA.md contient :

1. **Copyright Notice** : La Voie Shinkofa
2. **À Propos de Shinkofa** : Mission, valeurs, philosophie
3. **Fondateur** : Jay "The Ermite" Goncalves
4. **Usage & Licence** : Conditions d'utilisation communautaire
5. **Mentions Légales** : RGPD, données, confidentialité
6. **Contact & Support** : Community, Discord, site web
7. **Licence Détaillée** : CC BY-NC-SA 4.0
8. **Philosophie Shinkofa** : 真の歩 - Le Véritable Pas

---

## ✅ Checklist Intégration

Avant de livrer un projet, vérifier :

- [ ] **Étape 0** : Type projet identifié (1 ou 2)
- [ ] **COPYRIGHT.md** : Copié dans le repo projet
- [ ] **README.md** : Section "Licence" pointe vers COPYRIGHT.md
- [ ] **Code source** : Headers copyright dans fichiers principaux (optionnel)
- [ ] **Footer UI** : Copyright visible dans l'interface (si frontend)

---

## 💻 Exemple Header Code Source (Optionnel)

### Pour Projets Personnels

```python
"""
[Nom Fichier] - [Description courte]

Copyright (c) 2025 Jay "The Ermite" Goncalves
Créateur de la Voie Shinkofa
Tous droits réservés. Usage personnel uniquement.
"""
```

### Pour Projets Shinkofa

```python
"""
[Nom Fichier] - [Description courte]

Copyright (c) 2025 La Voie Shinkofa (真の歩)
Fondée par Jay "The Ermite" Goncalves
Licence: CC BY-NC-SA 4.0
"""
```

---

## 🎨 Footer UI (Si Frontend)

### Pour Projets Personnels

```html
<footer>
  <p>© 2025 Jay "The Ermite" Goncalves |
     <a href="https://shinkofa.com">La Voie Shinkofa</a> |
     <a href="/copyright">Mentions Légales</a>
  </p>
</footer>
```

### Pour Projets Shinkofa

```html
<footer>
  <p>© 2025 La Voie Shinkofa (真の歩) |
     Fondée par Jay "The Ermite" Goncalves |
     <a href="/copyright">Licence & Mentions Légales</a>
  </p>
</footer>
```

---

## 🆘 Questions Fréquentes

### Quand utiliser COPYRIGHT-PERSONNEL ?

Quand le projet est :
- ✅ Pour ton usage personnel
- ✅ Pour ta famille/proches
- ✅ Pas destiné à la communauté publique
- ✅ Pas lié à la philosophie/méthodologie Shinkofa

**Exemples** : Family Hub, Personal Dashboard, Stream Optimizer

### Quand utiliser COPYRIGHT-SHINKOFA ?

Quand le projet est :
- ✅ Pour la communauté Shinkofa
- ✅ Basé sur la méthodologie Shinkofa
- ✅ Outils de coaching/développement personnel
- ✅ Destiné à être partagé publiquement

**Exemples** : Koshin MVP, Plateforme Coaching, Applications Shinkofa

### Peut-on changer de copyright après coup ?

Oui, mais avec précautions :
1. Sauvegarder historique Git (commits antérieurs conservent ancien copyright)
2. Remplacer COPYRIGHT.md par le nouveau template
3. Mettre à jour headers code source si présents
4. Commit explicite : `chore(legal): Update copyright to [Personnel/Shinkofa]`

### Que mettre dans LICENSE file à la racine ?

**Pour Personnel** : Créer `LICENSE` avec contenu de la section Licence de COPYRIGHT-PERSONNEL.md

**Pour Shinkofa** : Créer `LICENSE` avec :
```
Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International

Voir COPYRIGHT.md pour les détails complets.
```

---

## 📚 Références

- **Creative Commons BY-NC-SA 4.0** : https://creativecommons.org/licenses/by-nc-sa/4.0/
- **RGPD** : https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Mentions Légales** : Obligatoires pour sites publics (France)

---

**Version 1.0 | 2025-11-13 | Guide Copyright TAKUMI**
