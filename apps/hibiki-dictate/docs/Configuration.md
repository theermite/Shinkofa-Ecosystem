# ⚙️ Configuration Recommandée - Hibiki

## 📋 Configuration Optimale pour Fiabilité

### 🔧 **Paramètres à Modifier dans `hibiki_preferences.json`**

Pour éviter les **problèmes de corruption du texte collé**, voici les paramètres recommandés :

```json
{
  "text_injection": {
    "default_method": "clipboard",
    "typing_speed_cps": 100,
    "preserve_clipboard": false,  ← IMPORTANT: Mettre à false
    "add_space_before": false
  }
}
```

---

## 🚫 **Pourquoi `preserve_clipboard: false` ?**

### Problème Identifié

Avec `preserve_clipboard: true`, le système :
1. Sauvegarde ton clipboard actuel (210 chars)
2. Copie la transcription (315 chars)
3. Envoie Ctrl+V
4. **Restaure l'ancien clipboard après 2.5s**

**Risque** : Si l'application cible (Obsidian, Word, etc.) est lente à traiter Ctrl+V et lit le clipboard **APRÈS** la restauration, elle colle un **mélange des deux contenus** → corruption du texte.

### Symptômes

- Texte mélangé bizarre : `&nbsp;permettra aux gens... etBonjour, donc...`
- Fin de phrase qui apparaît au début
- Caractères manquants ou dupliqués

### Solution

**Désactiver** `preserve_clipboard` → Plus de conflit, plus de corruption.

**Alternative** : Si tu veux vraiment conserver ton historique clipboard :
- Utilise un gestionnaire clipboard externe (Ditto, CopyQ, etc.)
- Ces outils historisent automatiquement **avant** que Hibiki ne modifie le clipboard
- Avantage : Historique complet + aucun conflit avec Hibiki

---

## ✅ **Autres Paramètres Importants**

### Retours à la Ligne Automatiques

Par défaut, Hibiki ajoute **automatiquement** un retour à la ligne après chaque phrase (. ? !).

**Exemple** :
```
Input (Groq):
"Bonjour tout le monde. Comment allez-vous? Très bien!"

Output (après formatage):
Bonjour tout le monde.
Comment allez-vous?
Très bien!
```

**Si tu veux désactiver** cette fonctionnalité (tout sur une seule ligne), modifie dans le code :

`src/ui/hibiki_app.py` ligne ~704 :
```python
formatted_text = self.text_formatter.format_text(
    corrected_text,
    auto_capitalize=True,
    add_sentence_breaks=False  ← Change True en False
)
```

---

## 📞 Support

Si problème persistant après ces modifications :
1. Verifier les logs dans `logs/`
2. Lancer avec `start_hibiki.bat` (console visible)
3. Vérifier que `preserve_clipboard: false` est bien enregistré

---

**Copyright (C) 2025 La Voie Shinkofa**
