# ⚡ Guide Déploiement Rapide o2Switch - 5 Minutes

**Date:** 2025-11-28 | **Site:** shinkofa.com

---

## 🎯 Méthode Ultra-Rapide (Recommandée)

### 1️⃣ Build Local (2 min)

```bash
cd website-shinkofa
npm run build
```

✅ Dossier `dist/` créé avec tous les fichiers

---

### 2️⃣ Créer ZIP (1 min)

1. Ouvre le dossier `dist/`
2. **Sélectionne TOUT le contenu** (Ctrl+A)
3. Clic droit → "Envoyer vers" → "Dossier compressé"
4. Nomme: `shinkofa-site.zip`

⚠️ **IMPORTANT:** Le ZIP doit contenir directement `index.html`, `assets/`, `.htaccess` - PAS le dossier `dist/` parent !

---

### 3️⃣ Upload cPanel (2 min)

1. **Connexion:** https://cpanel.o2switch.fr
2. **Gestionnaire de fichiers** → `public_html/`
3. **Supprime** tout le contenu existant
4. **Téléverser** (Upload) → Sélectionne `shinkofa-site.zip`
5. **Clic droit sur le ZIP** → **Extraire** → `public_html/`
6. **Supprime le ZIP**

---

### 4️⃣ Test Final

Ouvre: **https://shinkofa.com**

✅ Le site doit s'afficher avec :
- Logo Shinkofa dans le header
- Navigation fonctionnelle
- Mode sombre/clair
- Questionnaire accessible

---

## 🔧 Vérifications Post-Déploiement

### Checklist Rapide

- [ ] **Homepage** charge correctement
- [ ] **Logo** visible (pas de broken image)
- [ ] **Navigation** : Accueil, Présentation, Questionnaire, Contribuer
- [ ] **Questionnaire** : Démarre et affiche les questions
- [ ] **Page Contribuer** : Liens PayPal/Stripe fonctionnels
- [ ] **Mode sombre** fonctionne (icône lune/soleil)
- [ ] **Responsive** : Teste sur mobile (DevTools → F12 → Toggle device)

### Test Formulaire Brevo

1. Va sur **/questionnaire**
2. Réponds à quelques questions
3. Fournis un email de test
4. Vérifie la réception de l'email Brevo

---

## 🆘 Problèmes Courants

### ❌ Site affiche "404" ou "Forbidden"

**Cause:** Fichiers mal placés ou .htaccess manquant

**Solution:**
1. Vérifie que `index.html` est à la racine de `public_html/`
2. Vérifie que `.htaccess` existe dans `public_html/`
3. Si absent, crée `.htaccess` avec :

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### ❌ Navigation ne fonctionne pas (404 sur /presentation, /questionnaire)

**Cause:** .htaccess non configuré

**Solution:** Vérifie que le .htaccess contient les règles de réécriture ci-dessus

---

### ❌ Images/Logo ne s'affichent pas

**Cause:** Chemins incorrects ou fichiers manquants

**Solution:**
1. Vérifie que `public_html/logo-shinkofa.png` existe
2. Vérifie que `public_html/assets/` existe avec les fichiers CSS/JS

---

### ❌ Questionnaire ne se charge pas

**Cause:** Fichiers JS manquants ou erreur de build

**Solution:**
1. Re-build: `npm run build`
2. Vérifie `dist/assets/index-*.js` existe
3. Re-upload tout le contenu

---

## 📞 Aide Supplémentaire

- **Email o2Switch:** support@o2switch.fr
- **Docs complètes:** Voir `DEPLOY-README.md`
- **Repo GitHub:** https://github.com/theermite/Website-Shinkofa

---

**Temps total estimé:** 5-10 minutes ⚡
