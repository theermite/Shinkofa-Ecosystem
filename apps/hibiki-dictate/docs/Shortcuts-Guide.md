# Guide des Raccourcis Clavier Personnalisables - Hibiki

**Date**: 11 janvier 2026
**Version**: 2.0
**Auteur**: TAKUMI Agent (Jay The Ermite - Shinkofa)

---

## 🎯 Aperçu

Hibiki **version 2.0** introduit un **système de raccourcis clavier 100% flexible** qui te permet de configurer **n'importe quelle combinaison de touches** pour l'enregistrement vocal, éliminant complètement les conflits avec d'autres applications ou raccourcis Windows.

### ✨ Nouveautés v2.0

- 🎹 **Enregistreur de touches interactif** : Presse n'importe quelle combinaison, aucune limite
- ⚠️ **Détection de conflits Windows** : Avertissements non-bloquants pour raccourcis système
- 📜 **Historique des raccourcis** : Les 5 derniers raccourcis utilisés (accès rapide)
- 🔄 **Mode Toggle ET Push-to-Talk** : Configuration indépendante pour chaque mode
- ✅ **Validation en temps réel** : Affichage instantané de la combinaison pressée

---

## 🚀 Accéder aux Paramètres

1. Ouvre **Hibiki**
2. Clique sur le bouton **⚙️ Paramètres** dans l'interface principale
3. Dans la fenêtre des paramètres, clique sur l'onglet **⌨️ Raccourcis**

---

## 🎹 Enregistrer un Raccourci Personnalisé

### Méthode 1 : Presets Rapides

**Raccourcis pré-configurés disponibles** :
- **Toggle mode** :
  - `Alt + Shift + D` (Défaut)
  - `Ctrl + Shift + D`
  - `Ctrl + Alt + D`

- **Push-to-Talk mode** :
  - `Alt + Shift + D` (Défaut)
  - `Ctrl + Shift`
  - `Ctrl + Alt`

👉 **Clique simplement sur un preset** pour l'appliquer instantanément.

---

### Méthode 2 : Enregistrement Personnalisé (NOUVEAU)

**Étapes** :

1. Clique sur le bouton orange :
   **🎹 Enregistrer un raccourci personnalisé**

2. Une fenêtre modale s'ouvre avec le message :
   *"Pressez la combinaison de touches"*

3. **Maintiens les touches souhaitées** (ex: `Ctrl + Space`, `Alt + R`, `Win + F1`, etc.)

4. La combinaison s'affiche **en temps réel** pendant que tu maintiens les touches :
   ```
   ┌──────────────────────────┐
   │   CTRL + SPACE           │
   └──────────────────────────┘
   ```

5. **Relâche les touches** → La combinaison est enregistrée automatiquement

6. Si un **conflit Windows** est détecté, tu verras un avertissement :
   ```
   ⚠️ Attention: Ce raccourci est utilisé par Windows
   Action Windows: Afficher/masquer le bureau
   Il pourrait ne pas fonctionner comme prévu.
   ```

7. **Tu peux quand même l'utiliser** (liberté totale) ou annuler avec `Échap`

8. Clique sur **✅ Valider** pour confirmer

---

## 🔄 Raccourcis Récents

Les **5 derniers raccourcis personnalisés** utilisés sont sauvegardés et affichés sous la section "Raccourcis récents" :

```
Raccourcis récents:
• CTRL + SPACE
• ALT + R
• WIN + F1
```

👉 **Clique sur un raccourci récent** pour le réutiliser instantanément.

---

## ⚠️ Raccourcis Windows Réservés

Hibiki détecte automatiquement les **raccourcis système Windows** et affiche un avertissement (non-bloquant).

### Liste des Raccourcis Windows Détectés

| Raccourci | Action Windows |
|-----------|----------------|
| `Win + D` | Afficher/masquer le bureau |
| `Win + L` | Verrouiller la session |
| `Win + E` | Ouvrir l'explorateur de fichiers |
| `Win + R` | Ouvrir Exécuter |
| `Win + I` | Ouvrir Paramètres |
| `Win + Tab` | Vue des tâches |
| `Win + Shift + S` | Capture d'écran (Snipping Tool) |
| `Ctrl + Alt + Delete` | Écran de sécurité Windows |
| `Ctrl + Shift + Esc` | Gestionnaire des tâches |
| `Alt + Tab` | Basculer entre les fenêtres |
| `Alt + F4` | Fermer la fenêtre active |
| `Win + V` | Historique du presse-papiers |
| `Win + H` | Dictée vocale Windows |

⚠️ **Important** : Ces raccourcis peuvent ne pas fonctionner correctement car Windows les intercepte avant Hibiki. Préfère des combinaisons alternatives.

---

## 💡 Recommandations de Raccourcis

### ✅ Raccourcis Sûrs (Pas de Conflits)

| Combinaison | Usage Recommandé |
|-------------|------------------|
| `Ctrl + Space` | Excellent pour Toggle (utilisé par beaucoup d'IDEs mais configurable) |
| `Alt + R` | Rapide et facile à atteindre |
| `Ctrl + Shift + A` | Peu utilisé par défaut |
| `Ctrl + Alt + V` | Disponible dans la plupart des contextes |
| `F13` - `F24` | Touches fonction étendues (si ton clavier les supporte) |

### ⚠️ Raccourcis à Éviter

- **Touches Win seules** : Conflits systématiques avec Windows
- **Ctrl + Alt + Delete** : Réservé par Windows (impossible à override)
- **Alt + Tab** : Basculement de fenêtres Windows
- **Ctrl + C / V / X** : Raccourcis universels de copier/coller

### 🎯 Configurations Recommandées

**Pour Usage Quotidien (Toggle Mode)** :
- `Ctrl + Space` (facile à atteindre d'une main)
- `Alt + R` (index/pouce, rapide)

**Pour Push-to-Talk (Streaming/Meetings)** :
- `Ctrl + Shift` (deux mains, stable pour maintenir)
- `Ctrl + Alt` (confortable pour maintenir)

---

## 🔧 Modes d'Enregistrement

### Mode Toggle (Basculement)

**Fonctionnement** :
- **Premier appui** → Démarre l'enregistrement
- **Deuxième appui** → Arrête l'enregistrement et transcrit

**Avantages** :
- Mains libres pendant l'enregistrement
- Idéal pour dictée longue (emails, documents)

**Configuration** :
1. Sélectionne **"Toggle (Appuyer pour démarrer/arrêter)"**
2. Configure ton raccourci Toggle
3. Clique sur **✅ Enregistrer**

---

### Mode Push-to-Talk (Maintenir)

**Fonctionnement** :
- **Maintiens les touches** → Enregistre en continu
- **Relâche les touches** → Arrête et transcrit

**Avantages** :
- Contrôle précis du moment exact d'enregistrement
- Pas de transcription accidentelle
- Idéal pour gaming, meetings, streaming

**Configuration** :
1. Sélectionne **"Push-to-Talk (Maintenir pour enregistrer)"**
2. Configure ton raccourci Push-to-Talk
3. Clique sur **✅ Enregistrer**

---

## 🐛 Résolution de Problèmes

### ❌ Mon raccourci ne fonctionne pas

**Causes possibles** :

1. **Conflit avec une autre application** :
   - Ferme temporairement d'autres applications (Discord, OBS, etc.)
   - Vérifie leurs raccourcis dans leurs paramètres

2. **Conflit avec Windows** :
   - Si tu as choisi un raccourci Windows réservé, essaie une combinaison alternative
   - Consulte la liste des raccourcis Windows réservés ci-dessus

3. **Droits administrateur requis** :
   - Certaines applications (Task Manager, UAC) bloquent les raccourcis globaux
   - Lance Hibiki en administrateur si nécessaire

4. **Touches non reconnues** :
   - Certaines touches spéciales (ex: touches multimédia) peuvent ne pas être supportées
   - Privilégie Ctrl, Shift, Alt, lettres, chiffres, F1-F12

### ❌ Le KeyRecorder ne détecte pas mes touches

**Solutions** :

1. **Vérifie que la fenêtre KeyRecorder est active** (focus)
2. **Essaie une autre combinaison** (certaines touches peuvent être bloquées par l'OS)
3. **Redémarre Hibiki** si le problème persiste
4. **Lance en administrateur** si tu utilises un clavier avec pilote spécial

### ❌ Mon historique de raccourcis ne se sauvegarde pas

**Solution** :

1. Vérifie que le fichier `config/hibiki_preferences.json` est accessible en écriture
2. Vérifie les logs dans `logs/hibiki.log` pour des erreurs de sauvegarde
3. Reinitialise la config si corrompue :
   ```bash
   rm config/hibiki_preferences.json
   python src/main.py
   ```

---

## 📝 Fichiers de Configuration

**Localisation** : `config/hibiki_preferences.json`

**Structure des raccourcis** :

```json
{
  "hotkey": {
    "mode": "toggle",
    "toggle_key": "ctrl+space",
    "push_to_talk_key": "ctrl+shift",
    "recent_hotkeys": [
      "ctrl+space",
      "alt+r",
      "win+f1",
      "ctrl+shift+a",
      "alt+shift+x"
    ]
  }
}
```

**Modification manuelle (avancé)** :

Tu peux éditer manuellement ce fichier, mais :
- ✅ Utilise le format `modifier+modifier+key` (tout en minuscules)
- ✅ Modifiers valides : `ctrl`, `shift`, `alt`, `win`
- ✅ Redémarre Hibiki après modification
- ❌ Ne laisse pas de champs vides
- ❌ Ne dépasse pas 5 entrées dans `recent_hotkeys`

---

## 🎓 Exemples d'Utilisation

### Exemple 1 : Configuration Gaming (Push-to-Talk)

**Besoin** : Communiquer avec l'équipe pendant une partie sans conflits avec les touches de jeu.

**Solution** :
1. Mode : **Push-to-Talk**
2. Raccourci : `Ctrl + Alt` (facile à maintenir avec le pouce)
3. Maintiens `Ctrl + Alt` → Parle → Relâche

✅ Aucun conflit avec WASD, Space, Shift (touches gaming standards)

---

### Exemple 2 : Dictée de Documents (Toggle)

**Besoin** : Dicter de longs textes sans maintenir une touche.

**Solution** :
1. Mode : **Toggle**
2. Raccourci : `Ctrl + Space` (accessible d'une main)
3. Appuie sur `Ctrl + Space` → Dicte → Appuie à nouveau pour arrêter

✅ Mains libres, confortable pour dictée longue

---

### Exemple 3 : Streaming avec OBS (Push-to-Talk)

**Besoin** : OBS utilise `Ctrl + Shift + D` pour une scène, éviter le conflit.

**Solution** :
1. Mode : **Push-to-Talk**
2. Raccourci personnalisé : `Alt + R` (via enregistreur)
3. Maintiens `Alt + R` pendant les annonces live

✅ Aucun conflit avec OBS, contrôle précis

---

## 📊 Limites Techniques

- **Maximum 5 raccourcis récents** : Les plus anciens sont automatiquement supprimés
- **Pas de support touches multimédia** : Volume, Play/Pause non supportés par défaut
- **Windows UAC** : Les fenêtres UAC (administrateur) bloquent tous raccourcis globaux
- **Remote Desktop** : Certains raccourcis peuvent ne pas passer via RDP

---

## 🔗 Ressources

- **Issues GitHub** : [Report a bug](https://github.com/theermite/hibiki/issues)
- **Documentation Technique** : `src/ui/key_recorder_dialog.py`
- **Tests** : `test_custom_hotkeys.py`

---

## 📜 Changelog

### v2.0 (11 janvier 2026)

- ✅ Ajout du **KeyRecorderDialog** (enregistreur de touches interactif)
- ✅ **Détection de conflits Windows** (18 raccourcis système détectés)
- ✅ **Historique des 5 derniers raccourcis** utilisés
- ✅ **Liberté totale** : Aucune limite de combinaison
- ✅ **Animation temps réel** : Affichage instantané de la combinaison pressée
- ✅ **Validation automatique** : Enregistrement au relâchement des touches

### v1.0 (Janvier 2026)

- Raccourcis prédéfinis uniquement (3 presets)
- Pas de détection de conflits
- Pas d'historique

---

**© 2025 La Voie Shinkofa**
**Licence** : Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
