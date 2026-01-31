# Backlog Features - Family Hub

**Date** : 23 janvier 2026
**Statut MVP** : Phase 1 en cours

---

## 🚀 FEATURES PRÉVUES (Priorité haute)

### 1. 📖 Module Recettes de Cuisine

**Demandé par** : Jay (23 jan 2026)

**Description** :
Section dédiée pour sauvegarder et gérer les recettes familiales

**Fonctionnalités** :
- 📝 **Création recette** :
  - Nom du plat
  - Type (entrée, plat, dessert, goûter)
  - Temps préparation / cuisson
  - Nombre portions
  - Difficulté (facile, moyen, difficile)

- 🛒 **Ingrédients** :
  - Liste ingrédients avec quantités
  - Unités (g, kg, L, pièce, etc.)
  - Génération automatique liste de courses

- 📋 **Instructions** :
  - Étapes numérotées
  - Notes / astuces
  - Substitutions possibles

- 🏷️ **Métadonnées** :
  - Tags (végétarien, sans gluten, rapide, batch-cooking, etc.)
  - Origine (famille, web, livre)
  - Préférences famille (Lyam aime, Théo n'aime pas, etc.)
  - Photo du plat

- 🔗 **Intégrations** :
  - Lien vers planning repas (drag & drop recette → jour)
  - Génération automatique liste de courses depuis recette
  - Export Obsidian (format markdown)

**Stack technique** :
- Backend : Table `recipes` + `recipe_ingredients`
- Frontend : Page RecipesPage.tsx + RecipeCard component
- Recherche : Par nom, tags, ingrédients

**Estimation** : 2-3h développement

**Priorité** : 🟡 Moyenne (après MVP fonctionnel)

---

## 🎨 FEATURES UX (Priorité moyenne)

### 2. Bouton Floating Global
- Bouton "+" flottant avec menu actions rapides
- Estimation : 30 min

### 3. Dark Mode
- Toggle dark/light avec préférence sauvegardée
- Estimation : 20 min

### 4. Amélioration feedback CREATE
- Spinners/loaders pendant requêtes
- Toasts de confirmation
- Estimation : 20 min

---

## 🔔 FEATURES AVANCÉES (Priorité basse)

### 5. Notifications Discord/Telegram
- Alertes tâches assignées, événements proches
- Services backend déjà codés
- Estimation : 1h

### 6. Export Obsidian
- Boutons export par module
- Service backend déjà codé
- Estimation : 30 min

### 7. Google Calendar Sync
- OAuth flow + sync bidirectionnel
- Service backend déjà codé
- Estimation : 1h

---

## 📱 FEATURES MOBILITÉ (Futur)

### 8. PWA Optimisée
- Notifications push
- Offline mode
- Installation home screen

### 9. App Mobile Native
- React Native + Expo
- Synchronisation cloud

---

## 🤖 FEATURES IA (Long terme)

### 10. Suggestions Planning Repas
- IA suggère menus semaine basé sur préférences
- Ollama local (Qwen 2.5)

### 11. Analyse Patterns Bébés
- Détection patterns sommeil/repas
- Alertes anomalies

---

**Mise à jour** : Ce fichier sera enrichi au fil des retours utilisateurs
