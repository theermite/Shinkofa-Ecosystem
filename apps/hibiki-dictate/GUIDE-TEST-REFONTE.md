# Guide de Test - Refonte UI Hibiki-Dictate

**Date**: 2026-01-27
**Objectif**: Valider la refonte design MVP (Sprints 1-4)

---

## 🎯 Contexte

La refonte UI a été implémentée selon le plan validé :
- Layout modernisé, épuré, quasi-minimaliste
- Emojis systématiques pour les actions
- Boutons corners (absolute positioning)
- Language dropdown avec drapeaux
- Dashboard statistiques

---

## 🚀 Lancer l'Application

### Option 1 : Test Rapide (Composants Isolés)

```bash
cd D:\30-Dev-Projects\Hibiki-Dictate
python test_ui_layout.py
```

**Ce test montre:**
- Boutons corners (⚙️, 🌙, 📋)
- Dropdown langue avec drapeaux
- Bottom buttons avec emojis

### Option 2 : Test Complet (App Réelle)

```bash
cd D:\30-Dev-Projects\Hibiki-Dictate
python test_full_app.py
```

**Ce test lance Hibiki avec:**
- Toutes les fonctionnalités
- Nouveau layout complet
- Stats dashboard

### Option 3 : Utilisation Normale

```bash
cd D:\30-Dev-Projects\Hibiki-Dictate
python main.py
```

---

## ✅ Checklist de Test

### 1. Layout & Positionnement

#### Boutons Corners (Absolute Positioning)

- [ ] **⚙️ Settings** - Coin supérieur gauche (44x44px)
  - Cliquer → Fenêtre settings ouvre
  - Hover → Changement couleur visible

- [ ] **☀️/🌙 Theme** - Coin supérieur droit (36x36px)
  - Cliquer → Theme change (light ↔ dark)
  - **Emoji change** : ☀️ (en dark) ↔ 🌙 (en light) ✨
  - Border et hover restent cohérents

- [ ] **📋 Logs** - Coin inférieur droit (28x28px)
  - Petit et discret ✅
  - Cliquer → Fenêtre logs ouvre
  - Pas intrusif visuellement

#### Titre

- [ ] **"Hibiki"** centré, 32px bold
- [ ] Pas de subtitle "Dictée Vocale"
- [ ] Espace top (50px) correct

#### Centre Layout

- [ ] **Status Card** - Border primary, responsive
- [ ] **Bouton ENREGISTRER** - 56px height, accessible
- [ ] **Hotkey hint** - Visible, formaté
- [ ] **Language dropdown** - Drapeaux visibles 🇫🇷🇬🇧🇪🇸🇩🇪

#### Bottom Buttons (3 colonnes égales)

- [ ] **📜 Historique** - Border transparent, hover OK
- [ ] **📚 Dictionnaire** - Border transparent, hover OK
- [ ] **📊 Stats** - Border transparent, hover OK
- [ ] Colonnes égales (pas de décalage)
- [ ] Emojis visibles et alignés

---

### 2. Language Dropdown avec Drapeaux

- [ ] Dropdown affiche **drapeau + nom** (ex: "🇫🇷 Français")
- [ ] Liste déroulante montre 4 langues par défaut
- [ ] Cliquer sur langue → Change effectivement la langue
- [ ] Drapeau premier visible (langue active)

**Test:**
```
1. Ouvrir dropdown
2. Sélectionner "🇬🇧 English"
3. Vérifier que le drapeau 🇬🇧 apparaît en premier
4. Faire un enregistrement test → Transcription en anglais
```

---

### 3. Theme Toggle Emoji

#### Light Mode → Dark Mode

```
1. App en light mode (doit afficher 🌙)
2. Cliquer bouton coin supérieur droit
3. ✅ Theme passe en dark
4. ✅ Emoji change pour ☀️
5. ✅ Couleurs inversées (bg dark, fg white)
```

#### Dark Mode → Light Mode

```
1. App en dark mode (doit afficher ☀️)
2. Cliquer bouton
3. ✅ Theme passe en light
4. ✅ Emoji change pour 🌙
5. ✅ Couleurs inversées (bg white, fg dark)
```

---

### 4. Dashboard Statistiques

#### Ouverture

- [ ] Cliquer **📊 Stats** → Fenêtre s'ouvre
- [ ] Fenêtre centrée écran (600x700)
- [ ] Titre "📊 Statistiques d'utilisation"

#### Cartes (8 stats affichées)

**Si historique vide:**
- [ ] Message "Aucune donnée disponible"

**Si historique présent:**
- [ ] 🎙️ Transcriptions totales
- [ ] 📝 Mots transcrits (formaté avec virgules)
- [ ] ⏱️ Temps total (format Xm Ys)
- [ ] ✨ Confiance moyenne (%)
- [ ] 📅 Transcriptions aujourd'hui
- [ ] 💬 Mots aujourd'hui
- [ ] ⚡ Durée moyenne
- [ ] 📊 Caractères transcrits

**Layout:**
- [ ] 2 colonnes, 4 lignes
- [ ] Cards border + spacing cohérent
- [ ] Emojis visibles, valeurs bold
- [ ] Responsive (redimensionner fenêtre OK)

---

### 5. System Tray Double-Clic

#### Minimize to Tray

```
1. App ouverte
2. Cliquer X (fermer) ou minimize
3. ✅ App disparaît, icône dans system tray
```

#### Double-Clic Restauration ✨

```
1. App dans system tray
2. **Double-cliquer icône tray**
3. ✅ App restaurée au premier plan
```

#### Menu Contextuel (Simple Clic)

```
1. App dans system tray
2. Simple clic droit → Menu apparaît
3. Options : "Afficher Hibiki" | "Quitter"
4. Cliquer "Afficher Hibiki" → App restaurée
5. Cliquer "Quitter" → App ferme
```

---

### 6. Responsiveness & Resize

#### Resize Fenêtre

```
1. Redimensionner fenêtre (drag corners)
2. ✅ Boutons corners restent fixes (absolute positioning)
3. ✅ Centre content responsive (status, boutons)
4. ✅ Bottom buttons s'adaptent (grid égal)
```

#### Minimum Size

- [ ] Fenêtre ne devient pas trop petite (contenu lisible)
- [ ] Touch targets restent ≥ 44x44px (sauf logs 28x28)

---

### 7. Accessibilité (WCAG AAA)

#### Contraste

- [ ] **Light mode** : Texte #1a1a1a sur #FFFFFF (ratio 16:1) ✅
- [ ] **Dark mode** : Texte #FFFFFF sur #1e1e1e (ratio 16:1) ✅
- [ ] Primary colors : ratios 7:1+ maintenus

#### Touch Targets

- [ ] Settings ⚙️ : 44x44px ✅
- [ ] Theme ☀️/🌙 : 36x36px (acceptable coin)
- [ ] Logs 📋 : 28x28px (discret, coin)
- [ ] Bottom buttons : 40px height ✅
- [ ] Record button : 56px height ✅

#### Keyboard Navigation

- [ ] Tab → Focus visible sur boutons
- [ ] Enter → Active bouton focusé
- [ ] Dropdown navigable au clavier

---

### 8. Fonctionnalités Existantes (Non-Régression)

#### Transcription

- [ ] Enregistrer → Audio capturé
- [ ] Transcription → Texte généré
- [ ] Injection texte → Copié dans app cible

#### Hotkeys

- [ ] Toggle mode → Fonctionne
- [ ] Push-to-Talk → Fonctionne
- [ ] Configuration hotkeys → Fenêtre ouvre

#### Custom Dictionary

- [ ] Ouvrir dictionnaire → Fenêtre OK
- [ ] Ajouter entrée → Sauvegardé
- [ ] Replacements appliqués lors transcription

#### Historique

- [ ] Ouvrir historique → Fenêtre OK
- [ ] Recherche texte → Filtre fonctionne
- [ ] Export MD → Fichier généré

#### Settings

- [ ] 3 onglets (Transcription, Interface, Avancé)
- [ ] Modifications sauvegardées
- [ ] Tooltips présents

---

## 🐛 Bugs Potentiels à Surveiller

### Layout

- [ ] Boutons corners se chevauchent si fenêtre trop petite
- [ ] Logs button 📋 masqué si scroll présent
- [ ] Bottom buttons décalés si texte trop long

### Theme Toggle

- [ ] Emoji ne change pas après toggle
- [ ] Couleurs ne s'inversent pas complètement
- [ ] Border reste en couleur ancien theme

### Language Dropdown

- [ ] Drapeau pas visible dans dropdown
- [ ] Langue ne change pas effectivement
- [ ] Callback ne se déclenche pas

### Stats Dashboard

- [ ] Erreur si historique DB corrompu
- [ ] Valeurs NaN si aucune donnée
- [ ] Fenêtre ne centre pas correctement

### System Tray

- [ ] Double-clic ne restaure pas
- [ ] App ne minimize pas dans tray
- [ ] Icône tray manquante

---

## 📸 Captures d'Écran Attendues

### Light Mode

```
┌──────────────────────────────────┐
│ ⚙️                          🌙   │
│                                  │
│            Hibiki                │
│                                  │
│        [Status Card]             │
│        [ENREGISTRER]             │
│     Raccourci: CTRL + ALT        │
│     Langue: 🇫🇷 Français ▼       │
│                                  │
│ 📜 Historique │ 📚 Dict │ 📊 Stats│
│                              📋  │
└──────────────────────────────────┘
```

### Dark Mode

```
┌──────────────────────────────────┐ (bg: #1e1e1e)
│ ⚙️                          ☀️   │
│                                  │
│            Hibiki                │ (fg: #ffffff)
│                                  │
│        [Status Card]             │
│        [ENREGISTRER]             │
│     Raccourci: CTRL + ALT        │
│     Langue: 🇫🇷 Français ▼       │
│                                  │
│ 📜 Historique │ 📚 Dict │ 📊 Stats│
│                              📋  │
└──────────────────────────────────┘
```

---

## ✅ Validation Finale

### Sprint 1 : Fondation ✅

- [x] `theme.py` créé et centralisé
- [x] Components library créée
- [x] Imports remplacés dans tous fichiers UI
- [x] Pas de duplication ShinkofaColors

### Sprint 2 : Layout Principal ✅

- [x] Boutons corners (absolute positioning)
- [x] Theme toggle emoji ☀️/🌙
- [x] Language dropdown drapeaux
- [x] Bottom buttons (3 colonnes)
- [x] Méthodes ajoutées (_on_language_changed, _open_stats)

### Sprint 3 : System Tray ✅

- [x] Double-clic support (default=True)

### Sprint 4 : Stats Dashboard ✅

- [x] StatsWindow créée
- [x] 8 cartes statistiques
- [x] Message "Aucune donnée" si vide
- [x] Gestion d'erreurs

---

## 🚧 Sprints Non Implémentés

### Sprint 5 : Polish Fenêtres (2-3h)

- [ ] Settings: spacing, bouton Raccourcis
- [ ] History: cards élégantes (corner_radius 10)
- [ ] Dictionary: cards modernes

### Sprint 6 : Smart Formatting (1-2h)

- [ ] Line breaks intelligents
- [ ] Smart punctuation améliorée
- [ ] Abréviations courantes

---

## 📝 Retours Attendus

Après tests, noter:

1. **Ce qui fonctionne bien** ✅
2. **Ce qui nécessite ajustement** ⚠️
3. **Bugs rencontrés** 🐛
4. **Suggestions amélioration** 💡

---

## 🎯 Critères de Succès

**MVP Design accepté si:**

- ✅ Layout moderne et épuré visible
- ✅ Emojis présents et fonctionnels
- ✅ Boutons corners bien placés
- ✅ Theme toggle emoji change
- ✅ Language dropdown drapeaux visibles
- ✅ Stats dashboard opérationnel
- ✅ System tray double-clic fonctionne
- ✅ Aucune régression fonctionnelle

**Prêt pour Sprint 5-6 (polish) si accepté** 🚀

---

**Bon test !** ✨
