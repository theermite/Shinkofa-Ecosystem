# Site Web Shinkofa

Site officiel de La Voie Shinkofa - L'écosystème intelligent conçu pour accompagner les neurodivergents vers l'épanouissement personnel et professionnel.

## 🌟 À Propos

Shinkofa (真の歩 - "Le Véritable Pas") est un projet d'écosystème holistique combinant :

- **Intelligence Artificielle empathique** adaptée aux neurodivergents
- **Planification adaptative** respectant les cycles énergétiques
- **Communauté bienveillante** de soutien mutuel
- **Souveraineté numérique** et respect de la vie privée

## 🚀 Fonctionnalités

### ✅ Implémentées (Version 1.0.0 - Nov 2025)

- **Site vitrine responsive** avec thème sombre/clair
- **Logo Shinkofa** intégré (header + favicon)
- **Questionnaire holistique 152 questions** (9 blocs)
  - Sauvegarde automatique de progression
  - Support multi-types (text, radio, checkbox, scale, likert-pairs, date)
- **Intégration Brevo** pour envoi réponses + instructions Shizen
- **Page Contribuer** avec packs donation (PayPal/Stripe/Patreon)
- **Lien Telegram communauté** actif
- **Messaging cohérent** : Questionnaire → Manuel holistique via Shizen
- **Accessibilité WCAG 2.1 AA** complète
- **Guides déploiement** simplifiés (cPanel + FTP)
- **Project structure clean** (fichiers obsolètes archivés)

### 🔜 À Venir

- **Multilangue** (Français, Anglais, Espagnol) - Prochaine étape
- Backend FastAPI pour API REST
- Dashboard utilisateur
- Système de compagnon IA Shizen
- Planeur intelligent adaptatif

## 🛠️ Stack Technique

### Frontend

- **React 18** avec TypeScript
- **Vite** pour le build ultra-rapide
- **Tailwind CSS** pour le styling
- **React Router** pour le routing
- **Axios** pour les requêtes HTTP

### Services Externes

- **Brevo (SendinBlue)** pour l'envoi d'emails transactionnels

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Brevo (gratuit jusqu'à 300 emails/jour)

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/theermite/Website-Shinkofa.git
cd Website-Shinkofa/website-shinkofa

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Configurer la clé API Brevo
# Éditer .env et ajouter votre clé API Brevo
# Obtenir la clé sur https://app.brevo.com/settings/keys/api
VITE_BREVO_API_KEY=votre_clé_api_brevo

# 5. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

## 🏗️ Build Production

```bash
# Build pour la production
npm run build

# Preview du build de production
npm run preview
```

Les fichiers de production seront générés dans le dossier `dist/`.

## 📁 Structure du Projet

```
website-shinkofa/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/        # Composants React réutilisables
│   │   ├── layout/       # Header, Footer, Layout
│   │   └── questionnaire/ # Composants questionnaire
│   ├── data/             # Données statiques (questionnaire)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Pages de l'application
│   ├── services/         # Services externes (Brevo)
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires
│   ├── App.tsx           # Composant principal
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── .env.example          # Exemple de configuration
├── tailwind.config.js    # Configuration Tailwind
├── vite.config.ts        # Configuration Vite
└── package.json          # Dépendances
```

## 🎨 Personnalisation

### Couleurs Shinkofa

Les couleurs de la marque sont définies dans `tailwind.config.js` :

```js
colors: {
  'bleu-profond': '#1c3049',
  'accent-lumineux': '#e08f34',
  'dore-principal': '#f5cd3e',
  'blanc-pur': '#FFFFFF',
  'beige-sable': '#f8f6f0',
  'accent-doux': '#f2b366',
  'bleu-fonce': '#0f1c2e',
}
```

### Questionnaire

Pour modifier le questionnaire, éditer `src/data/questionnaireData.ts`.

## 🌐 Déploiement

**🎯 Production actuelle :** https://shinkofa.com (o2Switch)

### Guides Complets

- **DEPLOY-QUICK.md** : Guide ultra-rapide (5 min) - Méthode cPanel + ZIP
- **DEPLOY-README.md** : Guide détaillé avec 2 méthodes (cPanel + FTP)

### Déploiement Rapide (Résumé)

```bash
# 1. Build
npm run build

# 2. Créer ZIP du contenu de dist/
# 3. Upload via cPanel File Manager
# 4. Extraire dans public_html/
```

Le `.htaccess` est automatiquement copié dans `dist/` lors du build.

## 📧 Configuration Brevo

1. Créer un compte sur https://www.brevo.com
2. Aller dans Settings > API Keys
3. Créer une nouvelle clé API
4. Ajouter la clé dans `.env` :

```env
VITE_BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxx
```

### Emails Envoyés

- **Confirmation utilisateur** : Email de remerciement après complétion du questionnaire
- **Notification admin** : Email avec toutes les réponses du questionnaire

## 🔒 Sécurité & Confidentialité

- ✅ Aucune donnée sensible stockée côté client (sauf LocalStorage pour progression)
- ✅ HTTPS obligatoire en production
- ✅ Validation des inputs
- ✅ Échappement HTML automatique (React)
- ✅ Conformité RGPD

## 🤝 Contribution

Les contributions sont bienvenues ! Voir le fichier `CONTRIBUTING.md` pour les guidelines.

## 📄 Licence

© 2025 La Voie Shinkofa - Tous droits réservés

Ce projet est sous licence Creative Commons BY-NC-SA 4.0.
Voir `COPYRIGHT.md` pour les détails.

## 📞 Contact

- **Site Web** : [shinkofa.com](https://shinkofa.com)
- **Email** : contact@shinkofa.com
- **GitHub** : [@theermite](https://github.com/theermite)

---

**真の歩 (Shin-Ko-Fa)** - "Le Véritable Pas"

> Chaque pas authentique sur ton chemin unique
> Est plus précieux que mille pas empruntés
> Sur le chemin d'un autre.
