# 📖 Hibiki - Guide Utilisateur

**Bienvenue dans Hibiki !** 🎙️

Ce guide vous accompagne pas à pas pour utiliser Hibiki, l'application de dictée vocale par La Voie Shinkofa.

---

## 🎯 Qu'est-ce que Hibiki ?

**Hibiki** (響き signifie "Résonance" en japonais) transforme votre voix en texte instantanément.

### Pourquoi utiliser Hibiki ?

- ✍️ **Écrire plus vite** : Parlez naturellement, le texte apparaît
- 🧠 **Moins de fatigue** : Idéal si vous avez du mal à taper (dysgraphie, fatigue)
- 🎯 **Rester concentré** : Exprimez vos idées sans perdre le fil (TDAH, multipotentialité)
- 🔒 **Confidentiel** : Aucune donnée envoyée sur internet, tout reste sur votre ordinateur
- 💰 **Gratuit** : Usage personnel sans limite

### Pour qui ?

- **Personnes neuroatypiques** : TDAH, dyslexie, dysgraphie, HPI
- **Écrivains** : Auteurs, blogueurs, journalistes
- **Professionnels** : Rédaction rapports, emails, notes
- **Étudiants** : Prise de notes, rédaction travaux
- **Tous** : Toute personne voulant gagner du temps

---

## 🚀 Démarrage Rapide

### 1. Lancer Hibiki

Double-cliquez sur l'icône Hibiki 🎙️ sur votre bureau (ou lancez via le menu démarrer).

**Première utilisation** : Le chargement peut prendre 30-60 secondes (téléchargement du modèle IA).

### 2. Interface Principale

![Interface Hibiki](assets/screenshots/main-interface.png) *(screenshot à ajouter)*

Vous verrez :
- 🎙️ **Titre "Hibiki"** en haut
- 📊 **Carte status** : "Prêt" ou "Écoute en cours..."
- 🌟 **Indicateur qualité** : "Excellente ✨" (GPU) ou "Bonne ⭐" (CPU)
- 🔴 **Bouton "Enregistrer"** : Grand bouton orange
- ⌨️ **Raccourci clavier** : Affiché en dessous
- ⚙️ **Bouton "Paramètres"** : En bas

### 3. Votre Première Dictée

**Méthode 1 - Avec la souris** :
1. Ouvrez une application où vous voulez écrire (Word, email, navigateur, etc.)
2. Cliquez sur le bouton **"🔴 Enregistrer"** dans Hibiki
3. **Parlez clairement** dans votre microphone
4. Le texte apparaît automatiquement là où se trouve votre curseur !
5. Cliquez **"⏹️ Arrêter"** quand vous avez fini

**Méthode 2 - Avec le raccourci clavier** (plus rapide) :
1. Ouvrez une application où vous voulez écrire
2. Appuyez sur **Ctrl+Shift+Space** (ou votre raccourci personnalisé)
3. **Parlez**
4. Appuyez à nouveau sur **Ctrl+Shift+Space** pour arrêter

---

## 💡 Conseils pour une Bonne Transcription

### ✅ Bonnes Pratiques

- **Parlez clairement** : Articulez normalement, pas besoin d'exagérer
- **Phrases courtes** : Faites des pauses entre les phrases
- **Environnement calme** : Réduisez les bruits de fond
- **Microphone proche** : 15-30cm de votre bouche idéalement
- **Débit naturel** : Ni trop vite, ni trop lent

### ❌ À Éviter

- **Parler trop vite** : Hibiki a besoin de temps pour traiter
- **Murmurer** : Parlez à volume normal
- **Bruits parasites** : Musique forte, ventilateur bruyant
- **Micro trop loin** : > 50cm réduit la précision

### 🎤 Qualité Microphone

| Type | Qualité | Recommandation |
|------|---------|----------------|
| Micro casque | ⭐⭐⭐⭐⭐ | **Idéal** - Très proche bouche |
| Micro USB dédié | ⭐⭐⭐⭐ | **Excellent** - Blue Yeti, Rode, etc. |
| Micro laptop intégré | ⭐⭐⭐ | **Correct** - Peut capter bruits clavier |
| Écouteurs avec micro | ⭐⭐ | **Basique** - Fonctionne mais imprécis |

---

## ⚙️ Paramètres

### Changer la Langue

1. Cliquez sur **"⚙️ Paramètres"**
2. Sélectionnez **Langue** dans le menu
3. Choisissez votre langue :
   - 🇫🇷 Français
   - 🇬🇧 English
   - 🇪🇸 Español
   - 🇩🇪 Deutsch
   - 🇮🇹 Italiano
   - 🇵🇹 Português
   - Et bien d'autres...

### Modifier le Raccourci Clavier

**Par défaut** : `Ctrl+Shift+Space`

**Pour changer** :
1. Ouvrez le fichier `config/hibiki_preferences.json` avec un éditeur de texte
2. Trouvez la ligne `"toggle_key"`
3. Modifiez (exemples) :
   - `"ctrl+alt+v"` : Ctrl + Alt + V
   - `"ctrl+shift+d"` : Ctrl + Shift + D
   - `"f8"` : Touche F8
4. Enregistrez et relancez Hibiki

### Changer le Thème

**Modes disponibles** :
- **Clair** (défaut) : Fond blanc, texte bleu marine
- **Sombre** : Fond bleu marine foncé, texte clair (confort yeux)
- **Auto** : S'adapte au thème Windows/Linux

**Pour changer** :
1. Ouvrez `config/hibiki_preferences.json`
2. Trouvez `"theme_mode"`
3. Changez en `"dark"` ou `"light"` ou `"auto"`
4. Relancez Hibiki

---

## 🔍 Résolution de Problèmes

### ❌ "Le microphone ne fonctionne pas"

**Solutions** :
1. Vérifiez que votre micro est bien branché
2. Windows : Paramètres → Confidentialité → Microphone → Autoriser les apps
3. Testez votre micro dans une autre app (Discord, Teams)
4. Redémarrez Hibiki
5. Vérifiez les logs : `logs/hibiki_YYYY-MM-DD.log`

### ❌ "La transcription est lente (> 5 secondes)"

**Cause probable** : Pas de GPU NVIDIA, mode CPU actif

**Solutions** :
1. Vérifiez l'indicateur qualité :
   - "Excellente ✨" → GPU actif, normal
   - "Bonne ⭐" → CPU actif, plus lent
2. Si vous avez un GPU NVIDIA :
   - Installez CUDA Toolkit
   - Réinstallez PyTorch avec support CUDA
   - Voir README.md section "Installation avec GPU"
3. Acceptez la latence (5-15s) si pas de GPU

### ❌ "Le texte ne s'insère pas dans l'application"

**Solutions** :
1. Cliquez dans le champ texte de votre application **avant** de parler
2. Certaines apps bloquent l'insertion automatique (sécurité)
3. Essayez mode "Keyboard" au lieu de "Clipboard" :
   - Éditez `config/hibiki_preferences.json`
   - `"default_method": "keyboard"`

### ❌ "Erreur au démarrage / Crash"

**Solutions** :
1. Vérifiez les prérequis (Python 3.11+, RAM suffisante)
2. Consultez `logs/errors_YYYY-MM-DD.log`
3. Réinstallez les dépendances : `pip install -r requirements.txt --force-reinstall`
4. Ouvrez une issue GitHub avec les logs

---

## 📊 Performance & Qualité

### Indicateurs Qualité

| Indicateur | Signification |
|-----------|---------------|
| **Excellente ✨** | GPU NVIDIA détecté, transcription ultra-rapide (<1s) |
| **Bonne ⭐** | CPU seulement, transcription fonctionnelle (5-15s) |

### Améliorer la Précision

**Option 1 - Modèle plus précis** (si vous avez un bon GPU) :
1. Éditez `config/hibiki_preferences.json`
2. Changez `"model": "base"` en `"model": "medium"` ou `"model": "large-v3"`
3. Relancez Hibiki
4. ⚠️ Nécessite plus de VRAM (8GB+ recommandé)

**Option 2 - Microphone de qualité** :
Investir dans un micro USB dédié (Blue Yeti, Rode NT-USB) améliore drastiquement la précision.

---

## 🛡️ Confidentialité & Sécurité

### Vos Données

✅ **100% locales** : Aucune donnée audio ou texte n'est envoyée sur internet
✅ **Pas de compte** : Aucune inscription requise
✅ **Pas de tracking** : Aucune télémétrie, analytics ou publicité
✅ **Open-source** : Code source vérifiable sur GitHub

### Où sont stockées mes données ?

- **Modèles IA** : `models/` (4-5 GB)
- **Logs** : `logs/` (texte uniquement, pas d'audio)
- **Configuration** : `config/hibiki_preferences.json`
- **Audio** : ⚠️ **Jamais enregistré** - Transcription temps réel puis supprimé

---

## 🤝 Communauté & Support

### Obtenir de l'Aide

1. **Consultez ce guide** (FAQ ci-dessous)
2. **Logs** : `logs/hibiki_YYYY-MM-DD.log` et `logs/errors_YYYY-MM-DD.log`
3. **Issues GitHub** : [github.com/theermite/hibiki/issues](https://github.com/theermite/hibiki/issues)
4. **Discord Shinkofa** : [discord.gg/shinkofa](https://discord.gg/shinkofa) *(à venir)*

### Contribuer

Vous avez des idées d'amélioration ? Vous avez trouvé un bug ?
Ouvrez une issue ou une Pull Request sur GitHub ! Toutes contributions sont bienvenues. 🙏

---

## ❓ FAQ

**Q : Hibiki fonctionne-t-il hors ligne ?**
R : Oui ! Après le téléchargement initial des modèles, aucune connexion internet n'est requise.

**Q : Puis-je utiliser Hibiki pour transcrire des enregistrements audio ?**
R : Actuellement non, Hibiki est conçu pour la dictée temps réel. Cette fonctionnalité pourrait être ajoutée.

**Q : Combien de langues sont supportées ?**
R : Plus de 90 langues ! Les principales : français, anglais, espagnol, allemand, italien, portugais, néerlandais, polonais, russe, chinois, japonais, coréen, arabe, hindi, etc.

**Q : Hibiki est-il vraiment gratuit ?**
R : Oui pour un usage personnel. Les usages commerciaux nécessitent une licence (voir COPYRIGHT.md).

**Q : Puis-je utiliser Hibiki avec mon casque Bluetooth ?**
R : Oui, si votre casque est configuré comme micro par défaut dans Windows/Linux.

**Q : Hibiki remplace-t-il Dragon NaturallySpeaking ?**
R : Hibiki est une alternative open-source et gratuite. Dragon est plus mature mais payant (~300€) et cloud-based. Hibiki privilégie confidentialité et gratuité.

**Q : Quelle est la différence entre les modèles "base", "small", "medium", "large-v3" ?**
R : Plus le modèle est grand, plus il est précis, mais plus il nécessite de VRAM et de temps de traitement.
   - **base** : Rapide, léger, précision correcte (recommandé par défaut)
   - **medium** : Meilleur compromis précision/vitesse (GPU 8GB+)
   - **large-v3** : Maximum précision (GPU 12GB+, plus lent)

---

## 📜 Licence

**Copyright © 2025 La Voie Shinkofa**

Hibiki est sous licence **Creative Commons BY-NC-SA 4.0** :
- ✅ Usage personnel gratuit
- ✅ Modifications autorisées
- ❌ Usage commercial interdit sans licence

Voir [COPYRIGHT.md](COPYRIGHT.md) pour les détails.

---

## 🙏 Remerciements

Merci d'utiliser Hibiki ! Votre feedback est précieux pour améliorer l'application.

**Développé avec 💙 par Jay "The Ermite" Goncalves**
**La Voie Shinkofa - 真の歩 - Le Véritable Pas**

---

**響き (Hibiki) - Laissez votre voix résonner** 🎙️
