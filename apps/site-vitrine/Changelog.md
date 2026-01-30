# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2025-11-28

### 🎉 Version Production Initiale

**Déploiement:** https://shinkofa.com

### ✨ Ajouté

- **Logo Shinkofa** intégré dans header et favicon
- **Questionnaire holistique complet** (152 questions, 9 blocs)
  - Contexte de vie (12 questions)
  - Énergie & rythmes biologiques (7 questions)
  - Dimension somatique (6 questions)
  - Traitement de l'information & cognition (8 questions)
  - Tests de personnalité avancés (24 questions)
  - Neurodivergences avancées (33 questions)
  - Dimensions Shinkofa (25 questions)
  - Niveaux techniques (26 questions)
  - Validation croisée & anti-biais (11 questions)
- **Sauvegarde automatique** progression questionnaire (LocalStorage)
- **Support multi-types** questions (text, textarea, radio, checkbox, scale, number, likert-pairs, date)
- **Intégration Brevo** pour envoi réponses par email
- **Page Contribuer** avec 5 packs donation
  - Soutien Libre (PayPal)
  - Explorateur Mensuel (Stripe + Patreon)
  - Ambassadeur Mensuel (Stripe + Patreon)
  - Visionnaire Lifetime (PayPal + Stripe)
  - Légende Lifetime (PayPal + Stripe)
- **Page Présentation** enrichie
  - Notre Mission (OS de vie holistique)
  - Fondations Philosophiques (Sankofa, Bushido, Jedi)
  - Approche Tri-Dimensionnelle (coaching somatique/transcognitif/ontologique)
  - Statut du Projet (transparence développement actif)
- **Page Home** optimisée conversion (Priority 1 + 2)
  - Badge statut "En développement actif"
  - Social proof (150+ neurodivergents)
  - Pain points section (3 défis neurodivergents)
  - Témoignages (3 profils authentiques)
  - "Comment Ça Marche ?" (3 étapes)
  - Timeline "Après le Questionnaire ?" (4 étapes Shizen)
  - Lien Telegram communauté
- **Guides déploiement** simplifiés
  - DEPLOY-QUICK.md (5 min - cPanel + ZIP)
  - DEPLOY-README.md (guide complet - cPanel + FTP)
- **ThemeToggle** mode sombre/clair
- **Footer** avec liens réseaux et mentions légales
- **Accessibilité WCAG 2.1 AA** complète

### 🔧 Modifié

- **Messaging cohérent** : Questionnaire → Réponses email → Shizen → Manuel holistique
- **ThankYou page** : Instructions claires pour générer manuel holistique
- **Structure projet** nettoyée (fichiers obsolètes archivés)

### 🗑️ Supprimé (Archivé)

- `src/App.css` (non utilisé - Tailwind exclusif)
- `src/assets/react.svg` (logo template React)
- `public/vite.svg` (logo template Vite)
- `src/data/questionnaireData.ts` (ancienne version - remplacée par V5)
- `DEPLOY.md` (version simplifiée - remplacée par DEPLOY-README.md)

### 🛠️ Stack Technique

- **Frontend:** React 18.3 + TypeScript 5.6
- **Build:** Vite 7.2.2
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router 7.1
- **Email:** Brevo API
- **Hébergement:** o2Switch

### 📊 Statistiques

- **152 questions** dans le questionnaire
- **9 blocs** thématiques
- **5 packs** de contribution
- **4 pages** principales (Home, Présentation, Questionnaire, Contribuer)
- **100% type-safe** (TypeScript strict)

---

## [À Venir]

### Version 1.1.0 (Prévue)

- **Multilangue** (Français, Anglais, Espagnol)
  - react-i18next integration
  - Sélecteur de langue dans Header
  - Détection auto langue navigateur
  - Traduction contenu complet

### Version 2.0.0 (Roadmap)

- Backend FastAPI
- Dashboard utilisateur
- Système Shizen IA en ligne (génération manuel holistique)
- Authentification utilisateurs
- Sauvegarde cloud progression questionnaire

---

**Format:** [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
**Versioning:** [Semantic Versioning](https://semver.org/lang/fr/)

© 2025 La Voie Shinkofa - Tous droits réservés
