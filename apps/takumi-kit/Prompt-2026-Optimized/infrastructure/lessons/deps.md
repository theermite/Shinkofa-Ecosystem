# Lessons Learned - Dépendances & Migrations

> Leçons apprises liées aux dépendances, packages, breaking changes, mises à jour.

---

## 📊 Statistiques

**Leçons documentées** : 2
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [DEPS] [BREAKING] React 18 breaking change useEffect
**Date** : 2025-11-15 | **Projet** : toolbox-theermite | **Sévérité** : 🟠

**Contexte** :
Mise à jour React 17 → 18.

**Erreur** :
Components montés deux fois en dev (StrictMode).

**Solution** :
```typescript
// Pattern correct pour React 18
useEffect(() => {
  let mounted = true;

  fetchData().then(data => {
    if (mounted) setData(data);
  });

  return () => { mounted = false; };  // Cleanup obligatoire
}, []);
```

**Prévention** :
1. Toujours lire le migration guide avant upgrade majeur
2. Tester en mode strict avant prod
3. Cleanup functions dans tous les useEffect async

**Fichiers/Commandes Clés** :
- `package.json` - Versions dépendances
- React migration guide: https://react.dev/blog/2022/03/29/react-v18

---

### [DEPS] [NPM] Package lock conflict après merge
**Date** : 2025-11-01 | **Projet** : SLF-Esport | **Sévérité** : 🟡

**Contexte** :
Merge de branch avec différentes versions de deps.

**Erreur** :
`npm install` échouait avec conflicts dans package-lock.json.

**Solution** :
```bash
# Option 1: Régénérer le lock
rm package-lock.json
rm -rf node_modules
npm install

# Option 2: Utiliser la version de main
git checkout main -- package-lock.json
npm install
```

**Prévention** :
1. Ne jamais modifier package-lock.json manuellement
2. `npm ci` en CI (utilise lock exact)
3. Rebase fréquent pour éviter gros conflicts

**Fichiers/Commandes Clés** :
- `package-lock.json` - Lock des versions
- `npm ci` - Install depuis lock (CI)
- `npm install` - Install + update lock

---

## 💡 Patterns Communs

### Pattern 1 : Update Deps Sécurisé
```bash
# 1. Lister deps outdated
npm outdated

# 2. Update patch versions (safe)
npm update

# 3. Update minor versions (test requis)
npm install package@^2.0.0

# 4. Update major versions (migration guide requis)
npm install package@3.0.0

# 5. Tester
npm test
npm run build
```

### Pattern 2 : React useEffect Cleanup
```typescript
// Pattern avec AbortController (fetch)
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort();
}, []);

// Pattern avec flag mounted (promises)
useEffect(() => {
  let mounted = true;

  fetchData().then(data => {
    if (mounted) setData(data);
  });

  return () => { mounted = false; };
}, []);
```

### Pattern 3 : Dependency Audit
```bash
# Audit sécurité
npm audit

# Fix automatique (patch)
npm audit fix

# Fix breaking changes (manuel)
npm audit fix --force  # ⚠️ Dangereux

# Audit Python
pip-audit
```

---

## 🔍 Checklist Avant Update Deps

- [ ] Lire CHANGELOG / migration guide
- [ ] Backup git commit
- [ ] Tests passent avant update
- [ ] Update en environnement de test d'abord
- [ ] Tester fonctionnalités critiques après update
- [ ] CI/CD passe
- [ ] Deploy staging et vérifier
- [ ] Si OK → Deploy prod

---

## 🚨 Breaking Changes Fréquents

| Package | Version | Breaking Change | Fix |
|---------|---------|-----------------|-----|
| React | 17→18 | StrictMode double mount | Cleanup functions |
| Next.js | 12→13 | App Router | Migration progressive |
| TypeScript | 4→5 | Strictness | Fix types |
| ESLint | 8→9 | Config format | Flat config |
| Node.js | 16→18/20 | Crypto changes | Update code |

---

## 🔗 Voir Aussi

- [frontend.md](frontend.md) - Issues frontend spécifiques
- [backend.md](backend.md) - Issues backend spécifiques
- Infrastructure: [Projects-Registry.md](../Projects-Registry.md)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
