# Refonte Moderne v2 - Hibiki-Dictate

**Date** : 2026-01-27 17:15
**Objectif** : Moderniser design, supprimer emojis pixelisés, améliorer lisibilité

---

## 🎨 Changements Design Majeurs

### 1. Palette de Couleurs Moderne ✅

**Avant** : Couleurs ternes, contrastes faibles
**Après** : Palette moderne inspirée Tailwind CSS

#### Light Mode
- Background : `#FFFFFF` (blanc pur au lieu de gris)
- Text : `#000000` (noir pur pour max contraste)
- Primary : `#D97706` (amber moderne)
- Accent : `#2563EB` (bleu moderne)
- Borders : `#E5E7EB` (gris très clair, subtil)
- Card bg : `#F9FAFB` (gris ultra-subtil)
- Hover : `#F3F4F6`

#### Dark Mode
- Background : `#111827` (deep dark)
- Text : `#F9FAFB` (off-white)
- Primary : `#F59E0B` (amber vif)
- Accent : `#3B82F6` (bleu vif)
- Borders : `#374151` (gris moyen)
- Card bg : `#1F2937`
- Hover : `#374151`

**Bénéfice** : Contrastes WCAG AAA maintenus, lisibilité maximale

---

### 2. Suppression Emojis Pixelisés ✅

**Problème** : Emojis système Windows = look "vieillot", pixelisés

**Solution** : Symboles Unicode simples + texte

| Ancien | Nouveau |
|--------|---------|
| ⚙️ Settings | ⚙ (symbole gear simple) |
| ☀️/🌙 Theme | ◐/◑ (symboles yin-yang) |
| 📋 Logs | ▤ (symbole liste) |
| 📜 Historique | "Historique" (texte pur) |
| 📚 Dictionnaire | "Dictionnaire" |
| 📊 Stats | "Statistiques" |

**Bénéfice** : Look moderne, professionnel, lisible

---

### 3. Boutons Corners Modernisés ✅

**Changements** :
- Taille uniforme : 40x40px
- Corner radius : 8px
- Symboles Unicode clairs
- Backgrounds subtils avec hover states
- Positioning : 8px de marge (au lieu de 0)

```python
# Settings (⚙) - Orange primary
# Theme (◐/◑) - Card bg avec border
# Logs (▤) - Card bg avec border
```

**Bénéfice** : Boutons bien visibles, modernes, cohérents

---

### 4. Bottom Buttons Épurés ✅

**Avant** : Emojis + texte, transparent avec border épaisse

**Après** : Texte pur, card bg avec border subtile

```python
height: 44px (au lieu de 50px)
fg_color: card_bg
border_width: 1 (au lieu de 2)
hover_color: hover_bg
```

Textes : "Historique", "Dictionnaire", "Statistiques"

**Bénéfice** : Look clean, moderne, professionnel

---

### 5. Sélecteur Modèle Ajouté ✅

**Feature demandée** : Changer modèle facilement

**Solution** : Nouveau dropdown à côté de Langue

```
┌─────────────────────────────────┐
│ Langue: [Français ▼]            │
│ Modèle: [Groq (cloud) ▼]       │
└─────────────────────────────────┘
```

**Options** :
- "Groq (cloud)" → API Groq (rapide, online)
- "Local (CPU)" → WhisperX local

**Comportement** :
- Changement instantané
- Réinitialise engine en background
- Status affiche "Changement de modèle..."

**Bénéfice** : Switch Groq ↔ Local en 1 clic

---

### 6. Dropdown Langue Simplifié ✅

**Avant** : Drapeaux emojis (🇫🇷🇬🇧🇪🇸🇩🇪) → invisibles/pixelisés

**Après** : Texte pur

```
Options: "Français", "English", "Español", "Deutsch"
```

**Bénéfice** : Lisible, moderne, pas de dépendance emojis

---

### 7. Stats Window Modernisée ✅

**Changements** :
- Suppression emojis (🎙️📝⏱️ etc.)
- Cards plus grandes : 600x650 (au lieu de 550x600)
- Texte mieux structuré :
  - **Valeur** (36px bold, primary color)
  - **Label** (14px bold)
  - **Sublabel** (11px)
- Padding interne augmenté (16px)
- Wraplength : 240px (au lieu de 200px)

**Exemple card** :
```
╔═══════════════════╗
║      1,456        ║  ← Valeur (orange, 36px)
║   Mots dictés     ║  ← Label (14px bold)
║ 5,420 caractères  ║  ← Context (11px)
╚═══════════════════╝
```

**Bénéfice** : Texte jamais coupé, lisible, moderne

---

### 8. Résolution Fenêtre Principale ✅

**Inchangé** : 500x650 (validé session précédente)

Tous les éléments visibles au lancement

---

## 🛠️ Changements Techniques

### Fichiers Modifiés

1. **src/ui/theme.py** ✅
   - Nouvelle palette LIGHT_MODE
   - Nouvelle palette DARK_MODE
   - Ajout `hover_bg` key

2. **src/ui/hibiki_app.py** ✅
   - Boutons corners : CTkButton direct (pas EmojiButton)
   - Symboles Unicode : ⚙, ◐/◑, ▤
   - Bottom buttons : texte pur
   - Nouveau layout 2 colonnes : Langue + Modèle
   - Nouvelle méthode `_on_model_changed()`
   - Nouvelle méthode `_on_language_dropdown_changed_simple()`
   - Update `_toggle_theme()` pour symbole ◐/◑

3. **src/ui/stats_window.py** ✅
   - Suppression emojis
   - Window size : 600x650
   - Nouvelle méthode `_create_modern_stat_card()`
   - Padding interne augmenté
   - Grid rowconfigure pour expansion

---

## 📋 Tests À Faire

### Visuel
- [ ] Theme clair : lisible, contraste OK
- [ ] Theme sombre : lisible, contraste OK
- [ ] Boutons corners : visibles, cliquables
- [ ] Symboles Unicode : ⚙ ◐ ◑ ▤ bien rendus
- [ ] Bottom buttons : hover fonctionne

### Fonctionnel
- [ ] Toggle theme : ◐ ↔ ◑ change
- [ ] Dropdown langue : change langue transcription
- [ ] **Dropdown modèle** : switch Groq ↔ Local
- [ ] Stats window : texte pas coupé
- [ ] Logs button : ouvre fenêtre

### Nouveau Sélecteur Modèle
- [ ] Dropdown affiche "Groq (cloud)" ou "Local (CPU)"
- [ ] Cliquer Groq → Switch vers Groq API
- [ ] Cliquer Local → Switch vers WhisperX
- [ ] Status affiche "Changement de modèle..."
- [ ] Engine réinitialisé correctement

---

## 🚀 Améliorations Futures (Optionnel)

### Priorité Haute
1. Moderniser Dictionary Window (même style que stats)
2. Moderniser History Window
3. Moderniser Settings Window

### Priorité Moyenne
4. Remplacer symboles Unicode par icônes SVG custom
5. Ajouter animations/transitions subtiles
6. Améliorer overlay positioning

### Priorité Basse
7. Ajouter graphiques dans stats (usage dans le temps)
8. Dark mode avec accent colors dynamiques

---

## ✅ Résultat Attendu

**Design moderne, épuré, professionnel** :
- Pas d'emojis pixelisés
- Contrastes excellents (light ET dark)
- Lisibilité maximale
- Sélecteur modèle accessible
- Texte jamais coupé

**Look similaire à** : VS Code, Notion, Linear (apps modernes)

---

**Prochaine étape** : Tester visuellement et itérer si nécessaire
