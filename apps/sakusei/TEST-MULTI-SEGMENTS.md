# Test Manuel - Timeline Multi-Segments

## ✅ Corrections Appliquées

1. **Segment initial automatique** : Un segment couvrant toute la vidéo est créé automatiquement au chargement
2. **Bouton Export fixé** : Le bouton Export est maintenant activé si au moins 1 segment actif existe

---

## 📋 Checklist de Test

### 1. Chargement de la Vidéo

- [ ] Aller sur `/media` et ouvrir une vidéo dans l'éditeur
- [ ] **Vérifier** : Un segment vert couvre toute la timeline (de 0 à la fin)
- [ ] **Vérifier** : Le segment est sélectionné (bordure bleue)
- [ ] **Vérifier** : La durée du segment s'affiche au centre (ex: "30.5s")

### 2. Blade Tool (Touche C)

- [ ] Déplacer le playhead au milieu de la vidéo (clic sur timeline ou flèches)
- [ ] Appuyer sur **C** (blade cut)
- [ ] **Vérifier** : Le segment est coupé en 2 au playhead
- [ ] **Vérifier** : Toast de succès : "Segment coupé à X.XXs"
- [ ] **Vérifier** : Le 2ème segment (à droite) est automatiquement sélectionné

**Tests d'erreur :**
- [ ] Essayer de couper trop près du bord (< 0.5s) → Toast warning
- [ ] Essayer de couper sans segment sous le playhead → Toast warning
- [ ] Créer 50 segments puis essayer d'en créer un 51ème → Toast erreur "Max 50 segments"

### 3. Sélection de Segment

- [ ] Cliquer sur le 1er segment
- [ ] **Vérifier** : Bordure bleue épaisse (sélectionné)
- [ ] Cliquer sur le 2ème segment
- [ ] **Vérifier** : Le 2ème segment est sélectionné, le 1er redevient vert
- [ ] Cliquer sur fond noir (entre segments ou hors segments)
- [ ] **Vérifier** : Aucun segment sélectionné

### 4. Hover Effect

- [ ] Passer la souris sur un segment (sans cliquer)
- [ ] **Vérifier** : Bordure bleue claire (hover)
- [ ] Retirer la souris
- [ ] **Vérifier** : Retour à la bordure normale

### 5. Suppression de Segment (Del)

- [ ] Sélectionner un segment (clic)
- [ ] Appuyer sur **Del** ou **Backspace**
- [ ] **Vérifier** : Le segment disparaît de la timeline
- [ ] **Vérifier** : Toast : "Segment supprimé (Cmd+Z pour annuler)"
- [ ] **Vérifier** : Le bouton Export reste actif si au moins 1 segment reste

**Test d'erreur :**
- [ ] Désélectionner (clic sur fond)
- [ ] Appuyer sur Del → Toast warning "Aucun segment sélectionné"

### 6. Undo/Redo (Cmd+Z / Shift+Cmd+Z)

- [ ] Créer 2 segments (C au milieu)
- [ ] Supprimer le 2ème segment (Del)
- [ ] Appuyer sur **Cmd+Z** (Windows: Ctrl+Z)
- [ ] **Vérifier** : Le segment supprimé réapparaît
- [ ] **Vérifier** : Toast info "Undo"

- [ ] Appuyer sur **Shift+Cmd+Z** (redo)
- [ ] **Vérifier** : Le segment est re-supprimé
- [ ] **Vérifier** : Toast info "Redo"

**Test historique complet :**
1. Couper segment en 2 (C) → 2 segments
2. Couper le 2ème segment (C) → 3 segments
3. Supprimer le 3ème (Del) → 2 segments actifs
4. Undo → 3 segments
5. Undo → 2 segments
6. Undo → 1 segment (état initial)

### 7. Affichage Raccourcis Clavier

- [ ] **Vérifier** en bas de page : Affichage des raccourcis
  - **Space** : Play/Pause
  - **C** : Cut (Blade)
  - **Del** : Supprimer Segment
  - **Cmd+Z** : Annuler
  - Flèches, Home, End visibles aussi

### 8. Export Multi-Segments

**Préparation :**
- [ ] Créer 3 segments avec blade tool (2 cuts)
- [ ] Supprimer le segment du milieu (Del)
- [ ] Résultat attendu : 2 segments actifs (non consécutifs)

**Export :**
- [ ] Cliquer sur **Exporter**
- [ ] Sélectionner 1 ou 2 formats (TikTok, YouTube, etc.)
- [ ] Cliquer "Exporter"
- [ ] **Vérifier** : Toast loading "Préparation de l'export de 2 segments..."
- [ ] **Vérifier** : Redirection vers `/media` après succès

**Vérification dans /media :**
- [ ] Un nouveau fichier apparaît : `filename_segments_timestamp.mp4`
- [ ] Tags : `segments`, `concat`, `edited`
- [ ] Durée = somme des durées des 2 segments actifs (pas la totalité)

**Lecture du fichier exporté :**
- [ ] Télécharger et lire la vidéo
- [ ] **Vérifier** : Seulement les 2 segments sélectionnés (le segment du milieu manque)
- [ ] **Vérifier** : Transition fluide entre les 2 segments (pas de glitch)
- [ ] **Vérifier** : Sous-titres aux bons moments (si activés)

### 9. Workflow Complet

**Scénario : Podcast de 2 minutes → Clip de 40 secondes en 3 parties**

1. [ ] Charger vidéo de 2min (~120s)
2. [ ] Segment initial : 0-120s (auto-créé)
3. [ ] Couper à 10s (C) → 2 segments : [0-10s], [10-120s]
4. [ ] Couper le 2ème à 30s (C) → 3 segments : [0-10s], [10-30s], [30-120s]
5. [ ] Couper le 3ème à 50s (C) → 4 segments : [0-10s], [10-30s], [30-50s], [50-120s]
6. [ ] Supprimer les segments inutiles :
   - Del sur [0-10s]
   - Del sur [50-120s]
7. [ ] Résultat : 2 segments actifs : [10-30s] (20s), [30-50s] (20s) = 40s total
8. [ ] Exporter
9. [ ] **Vérifier** fichier final : 40 secondes

---

## 🐛 Tests Console (Avancé)

Ouvrir la console (F12) et exécuter :

```javascript
// Copier-coller le contenu de test-segments.js
```

Voir le fichier `test-segments.js` pour les tests automatisés.

---

## ❌ Problèmes Connus à Tester

1. **Performance** : Avec 50 segments, le canvas reste fluide ? (should be < 100ms render)
2. **Transcription** : Les sous-titres suivent-ils correctement les segments concaténés ?
3. **Undo après export** : L'historique est-il conservé après export ? (devrait être reset)
4. **Zoom** : Les segments s'affichent correctement avec zoom 5x ou 10x ?

---

## 📝 Rapport de Test

**Date** : ___________
**Testeur** : ___________

| Test | Résultat | Notes |
|------|----------|-------|
| Segment initial | ⬜ Pass ⬜ Fail |  |
| Blade tool (C) | ⬜ Pass ⬜ Fail |  |
| Sélection | ⬜ Pass ⬜ Fail |  |
| Hover | ⬜ Pass ⬜ Fail |  |
| Suppression (Del) | ⬜ Pass ⬜ Fail |  |
| Undo/Redo | ⬜ Pass ⬜ Fail |  |
| Export segments | ⬜ Pass ⬜ Fail |  |
| Workflow complet | ⬜ Pass ⬜ Fail |  |

**Bugs trouvés** :
```
1.
2.
3.
```

**Suggestions** :
```
1.
2.
3.
```
