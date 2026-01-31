# Workflow Dev vs Prod - Guide Rapide

## 🎯 Principe

- **devslf.shinkofa.com** = Ton terrain de jeu, sans pop-ups
- **lslf.shinkofa.com** = Production pour les joueurs/coachs, avec auto-update

## 🛠️ Setup Initial (À faire UNE FOIS)

### Étape 1 : Configurer le DNS chez OVH

1. Aller sur l'interface OVH
2. Ajouter un enregistrement DNS :
   - Type : `A`
   - Sous-domaine : `devslf`
   - Cible : `217.182.206.127` (IP du VPS)
   - TTL : `3600`

### Étape 2 : Configurer Nginx sur le VPS

```bash
# Créer le fichier de config
sudo nano /etc/nginx/sites-available/devslf.shinkofa.com
```

Copie le contenu du fichier nginx depuis `docs/SETUP-DEV-SUBDOMAIN.md` (section Configuration Nginx).

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/devslf.shinkofa.com /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

### Étape 3 : Obtenir le certificat SSL

```bash
sudo certbot --nginx -d devslf.shinkofa.com
```

### Étape 4 : Vérifier que ça marche

```bash
# Doit afficher l'IP du VPS
nslookup devslf.shinkofa.com

# Doit rediriger vers HTTPS
curl -I http://devslf.shinkofa.com

# Doit renvoyer 200 OK
curl -I https://devslf.shinkofa.com
```

## 💻 Workflow Quotidien

### Développer une nouvelle feature

```bash
# 1. Modifier le code frontend/backend
cd /home/ubuntu/SLF-Esport/frontend
# ... éditer les fichiers

# 2. Commit atomique
git add .
git commit -m "feat(calendar): Add new filter feature"
git push origin main

# 3. Rebuild et redémarrer
npm run build
docker restart slf-frontend

# 4. Tester sur devslf.shinkofa.com
# ✅ Pas de pop-up d'auto-update
# ✅ Changements visibles immédiatement
```

### Corriger un bug

```bash
# 1. Fix le code
# ... éditer les fichiers

# 2. Commit
git add .
git commit -m "fix(sessions): Fix modal close timing"
git push origin main

# 3. Rebuild + restart
npm run build
docker restart slf-frontend

# 4. Vérifier le fix sur devslf.shinkofa.com
```

### Release en production (quand tout est testé)

```bash
# 1. Tout doit être committé et testé sur devslf
git status  # Doit être clean

# 2. Créer un tag de version
git tag -a v1.0.0 -m "Release v1.0.0: Add calendar filters and fix modal bugs"
git push origin v1.0.0

# 3. C'est tout !
# Les users sur lslf.shinkofa.com recevront la notification d'auto-update
# (parce que les containers sont partagés, le code est déjà déployé)
```

## 🎯 Quand utiliser quel domaine ?

| Situation | Domaine à utiliser |
|-----------|-------------------|
| Développer une feature | **devslf.shinkofa.com** |
| Tester un fix | **devslf.shinkofa.com** |
| Expérimenter un design | **devslf.shinkofa.com** |
| Montrer aux joueurs/coachs | **lslf.shinkofa.com** |
| Utilisation normale (end-users) | **lslf.shinkofa.com** |

## 🔍 Comportement Auto-Update

### Sur devslf.shinkofa.com
- ❌ **Pas de pop-up** "Nouvelle version disponible"
- ✅ Refresh manuel fonctionne normalement
- ✅ Cache normal du navigateur
- 🎯 **Utilise pour développer tranquillement**

### Sur lslf.shinkofa.com
- ✅ **Pop-up apparaît** quand tu crées un tag Git
- ✅ Users peuvent mettre à jour en un clic
- ✅ Évite que les joueurs restent sur une vieille version
- 🎯 **Production pour les end-users**

## 🚨 Troubleshooting

### Le pop-up apparaît quand même sur devslf

```bash
# Vérifier que le code est bien déployé
cd /home/ubuntu/SLF-Esport/frontend
grep "isProduction" src/components/common/UpdateNotification.tsx

# Devrait afficher :
# const isProduction = window.location.hostname === 'lslf.shinkofa.com'
```

Si c'est correct, rebuild et restart :

```bash
npm run build
docker restart slf-frontend
```

### Le site ne charge pas sur devslf

```bash
# Vérifier nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/devslf-error.log

# Vérifier DNS
nslookup devslf.shinkofa.com
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
sudo certbot renew

# Vérifier le renouvellement auto
sudo certbot renew --dry-run
```

## 📝 Notes Importantes

1. **Containers partagés** : Les deux domaines utilisent les MÊMES containers Docker (pour l'instant)
   - Avantage : Pas de config Docker complexe
   - Inconvénient : Redémarrage affecte les deux domaines

2. **Auto-update basé sur hostname** : Le code JavaScript vérifie `window.location.hostname`
   - `lslf.shinkofa.com` → Auto-update activé
   - Tout le reste → Auto-update désactivé

3. **Tags Git = Releases** : Crée des tags uniquement quand tu veux notifier les users
   - ✅ `git tag -a v1.0.0 -m "Release message"`
   - ❌ Ne pas taguer chaque commit

## 🎉 Avantages de ce setup

- ✅ Plus besoin de vider le cache constamment
- ✅ Développement sans être dérangé par les pop-ups
- ✅ Users sur prod ne voient pas tes expérimentations
- ✅ Auto-update fonctionne quand tu le veux (via tags Git)
- ✅ Setup simple (containers partagés)

---

**Auteur:** TAKUMI Agent
**Date:** 2025-01-04
**Version:** 1.0
