# Checklist: Fin de Session Claude

> À faire AVANT de terminer une session de travail.

---

## 1. Sauvegarder le Contexte

### Git
```bash
git status
git add .
git commit -m "[TYPE] description du travail fait"
git push origin main
```

### Fichiers à Mettre à Jour
- [ ] **PLAN-DEV-TEMPORAIRE.md** (si existe)
  - ✅ Tâches complétées
  - ⏳ Tâches en cours
  - 📋 Prochaines étapes

- [ ] **CHANGELOG.md** (si changement significatif)

- [ ] **LECONS-ERREURS.md** (si erreurs rencontrées)

---

## 2. Documenter l'État

### Résumé Session
```markdown
## Session [DATE]

### Accompli
- [x] Tâche 1
- [x] Tâche 2

### En cours
- [ ] Tâche 3 (bloquée par X)

### Prochaine session
- [ ] Priorité 1
- [ ] Priorité 2

### Notes
- Décision prise : ...
- Point d'attention : ...
```

---

## 3. Nettoyer

- [ ] **Fermer** branches inutilisées
- [ ] **Supprimer** fichiers temporaires
- [ ] **Vérifier** pas de secrets exposés
- [ ] **Tester** que l'app fonctionne (si modifiée)

---

## 4. Communication

### Si session interrompue
Laisser un message clair :
```
🔴 Session interrompue à [HEURE]
État : [description]
Pour reprendre : [instructions]
```

### Si session complète
```
✅ Session terminée
Objectif atteint : [oui/non/partiellement]
Prêt pour : [prochaine étape]
```

---

## 5. Bien-être

- [ ] **Pause** planifiée après session
- [ ] **Célébrer** les accomplissements (même petits)
- [ ] **Noter** niveau énergie fin de session

---

## Template Rapport Fin de Session

```markdown
# Rapport Session - [DATE]

## 📊 Métriques
- Durée : X min
- Commits : X
- Tests : ✅/❌

## ✅ Accompli
1. ...
2. ...

## ⏳ En cours
1. ... (état : X%)

## 🚧 Bloqué
1. ... (raison : ...)

## 📋 Prochaine session
1. Priorité : ...
2. ...

## 💡 Notes
- ...
```

---

## Commande Rapide

```bash
# Sauvegarder et documenter
git add . && git commit -m "[CHORE] Session checkpoint" && git push

# Ou utiliser le skill session-manager
/session-end
```

---

**Usage** : Fin de chaque session | **Trigger** : Avant de fermer Claude
