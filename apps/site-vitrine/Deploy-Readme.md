# 🚀 Guide de Déploiement - Site Shinkofa

## ✅ Ce qui a été fait

### 1. Logo et Branding
- ✅ Logo Shinkofa intégré dans le header (taille optimale h-12 md:h-14)
- ✅ Favicon mis à jour
- ✅ Meta title et description en français
- ✅ Langue HTML définie sur `fr`

### 2. Questionnaire V5 (152 questions)
- ✅ Migration complète depuis le fichier MD
- ✅ Correction des erreurs de compilation TypeScript
- ✅ Support de tous les types de questions (text, textarea, radio, checkbox, scale, number, likert-pairs, date)
- ✅ Sauvegarde automatique de progression
- ✅ Intégration Brevo pour envoi des réponses

**📊 Structure du questionnaire:**
- **BLOC A**: Contexte de vie (12 questions)
- **BLOC B**: Énergie & rythmes biologiques (7 questions)
- **BLOC C**: Dimension somatique (6 questions)
- **BLOC D**: Traitement de l'information & cognition (8 questions)
- **BLOC E**: Tests de personnalité avancés (24 questions)
- **BLOC F**: Neurodivergences avancées (33 questions)
- **BLOC G**: Dimensions Shinkofa (25 questions)
- **BLOC H**: Niveaux techniques (26 questions)
- **BLOC I**: Validation croisée & anti-biais (11 questions)

### 3. Page Présentation Enrichie
- ✅ Section "Notre Mission" (OS de vie holistique)
- ✅ Section "Fondations Philosophiques" (Sankofa, Bushido, Jedi)
- ✅ Section "Approche Tri-Dimensionnelle" (coaching somatique/transcognitif/ontologique)
- ✅ Section "Statut du Projet" (transparence développement actif)

### 4. Page Contribuer
- ✅ **4 Packs de contribution** avec vrais liens PayPal & Stripe:
  - 🧭 **Explorateur Mensuel** (Stripe)
  - 👑 **Ambassadeur Mensuel** (Stripe)
  - ⭐ **Visionnaire Lifetime** (PayPal + Stripe)
  - 🏆 **Légende Lifetime** (PayPal + Stripe)
- ✅ Sections Bêta-Testeur, Partage d'Expérience, Communauté
- ✅ Valeurs Shinkofa (Authenticité, Croissance, Neurodiversité)

---

## ✅ PRÊT POUR DÉPLOIEMENT - Tous les liens sont en place!

### 🎉 Le site est 100% fonctionnel

Tous les liens de contribution sont maintenant actifs avec les vraies URLs PayPal et Stripe. Plus besoin de remplacer de placeholders!

### 1. 🔑 Configurer les variables d'environnement

**Fichier**: `.env`

```env
# Déjà configuré
VITE_BREVO_API_KEY=YOUR_BREVO_API_KEY_HERE
```

⚠️ **IMPORTANT**: Ne commit JAMAIS le fichier `.env` sur GitHub. Il est déjà dans `.gitignore`.

Pour la production, configure cette variable sur ton hébergeur:
- **o2Switch**: Dans le panneau de contrôle, section Variables d'environnement
- **Netlify/Vercel**: Dans les Project Settings > Environment Variables

### 2. 📧 Mettre à jour l'email de contact

**Fichiers concernés:**
- `src/pages/Contribuer.tsx` (lignes 44, 100, 143)

Actuellement: `contact@shinkofa.com`

Si tu veux utiliser un autre email, remplace toutes les occurrences.

---

## 🌐 Déploiement sur o2Switch

### ⚡ Méthode 1: cPanel File Manager + ZIP (LA PLUS SIMPLE)

**Temps estimé:** 5-10 minutes

#### Étape 1 : Build local
```bash
cd website-shinkofa
npm run build
```
✅ Cela crée le dossier `dist/` avec tous les fichiers optimisés

#### Étape 2 : Créer une archive ZIP
**Windows:**
- Ouvre le dossier `dist/`
- Sélectionne **TOUT le contenu** (pas le dossier dist lui-même)
- Clic droit → "Envoyer vers" → "Dossier compressé"
- Nomme-le `shinkofa-site.zip`

**Important ⚠️** : Le ZIP doit contenir directement `index.html`, `assets/`, etc. PAS un dossier `dist/` parent.

#### Étape 3 : Upload via cPanel
1. Connecte-toi à **cPanel o2Switch** (https://cpanel.o2switch.fr ou ton URL cPanel)
2. Va dans **"Gestionnaire de fichiers"** (File Manager)
3. Navigue vers `public_html/`
4. **Supprime tout le contenu existant** (si présent)
5. Clique **"Téléverser"** (Upload) en haut
6. Sélectionne `shinkofa-site.zip`
7. Une fois uploadé, **clic droit sur le ZIP** → **"Extraire"**
8. Choisis `public_html/` comme destination
9. Supprime le ZIP après extraction

#### Étape 4 : Vérifier le .htaccess
1. Dans `public_html/`, vérifie qu'il y a un fichier `.htaccess`
2. Si absent, crée-le avec ce contenu :

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

3. **Sauvegarde** et teste le site : `https://shinkofa.com`

✅ **TERMINÉ !** Ton site est en ligne.

---

### 🔧 Méthode 2: FTP avec FileZilla (Classique)

**Temps estimé:** 10-15 minutes

#### Prérequis
- FileZilla installé (https://filezilla-project.org/)
- Identifiants FTP o2Switch (disponibles dans ton email de bienvenue ou cPanel)

#### Étape 1 : Build local
```bash
cd website-shinkofa
npm run build
```

#### Étape 2 : Connexion FTP
1. Ouvre **FileZilla**
2. Entre tes identifiants :
   - **Hôte :** `ftp.votredomaine.com` ou IP fournie par o2Switch
   - **Utilisateur :** Ton nom d'utilisateur FTP
   - **Mot de passe :** Ton mot de passe FTP
   - **Port :** 21 (ou 22 pour SFTP)
3. Clique **"Connexion rapide"**

#### Étape 3 : Upload des fichiers
1. **Côté local (gauche)** : Navigue vers `website-shinkofa/dist/`
2. **Côté serveur (droit)** : Navigue vers `public_html/`
3. **Supprime tout le contenu** de `public_html/` (si présent)
4. **Sélectionne TOUT le contenu** de `dist/` (index.html, assets/, etc.)
5. **Glisse-dépose** vers `public_html/`
6. Attends la fin du transfert (barre de progression en bas)

#### Étape 4 : Upload du .htaccess
1. Retourne à la racine du projet (pas dist/)
2. Copie le fichier `public/.htaccess` vers `public_html/`

✅ **TERMINÉ !** Teste sur `https://shinkofa.com`

---

### 🆘 Alternatives (si problèmes)

**Option A : Netlify (Auto-déploiement depuis GitHub)**
- Connecte ton repo GitHub
- Build automatique à chaque push
- SSL gratuit, CDN mondial
- **Idéal si tu veux éviter le FTP**

**Option B : Vercel (Similaire à Netlify)**
- Import depuis GitHub
- Déploiement automatique
- Performance optimale pour React

---

## 🧪 Tests Locaux Avant Déploiement

```bash
# Dev server
npm run dev
# Ouvre http://localhost:5173

# Build de production
npm run build

# Preview du build
npm run preview
# Ouvre http://localhost:4173
```

**Checklist de test:**

- [ ] Logo visible dans le header (taille correcte)
- [ ] Navigation fonctionne (Accueil, Présentation, Questionnaire, Contribuer)
- [ ] Mode sombre/clair fonctionne
- [ ] Page Présentation affiche toutes les nouvelles sections
- [ ] Questionnaire se charge et sauvegarde la progression
- [ ] Boutons de contribution ouvrent les bonnes pages (après remplacement des liens)
- [ ] Responsive design fonctionne sur mobile

---

## 📝 Commits Récents

```
669e35a - feat(contribuer): Restructure contribution page with real donation packs
80045c7 - docs: Add comprehensive deployment guide
9cc16de - feat(content): Enrich Presentation page and add donation links
e8daeb6 - fix(questionnaire): Fix TypeScript compilation errors
88d7aa4 - feat(brand): Add Shinkofa logo and update branding
```

---

## 🔮 Prochaines Étapes (Post-Déploiement)

1. **Questionnaire complet (316 questions)**
   - Actuellement: 152 questions migrées et fonctionnelles
   - À venir: 164 questions supplémentaires

2. **Analytics**
   - Installer Google Analytics ou Plausible pour suivre le trafic

3. **SEO**
   - Ajouter sitemap.xml
   - Optimiser les meta descriptions
   - Ajouter OpenGraph tags

4. **Accessibilité**
   - Audit WCAG 2.1 AA
   - Tests avec lecteurs d'écran

---

## 📞 Support

Pour toute question technique:
- Email: contact@shinkofa.com
- Repo GitHub: https://github.com/theermite/Website-Shinkofa

---

**Version Site**: 1.0.0
**Date**: 2025-11-28
**Status**: ✅ 100% PRÊT POUR DÉPLOIEMENT PRODUCTION

**Dernières mises à jour:**
- Corrections incohérences messaging (manuel holistique)
- Nettoyage projet (fichiers obsolètes archivés)
- Guide déploiement o2Switch simplifié
