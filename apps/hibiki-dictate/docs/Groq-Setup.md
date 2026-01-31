# 🚀 Guide Configuration Groq Whisper API

Ce guide explique comment configurer Groq Whisper API dans Hibiki pour une transcription ultra-rapide (216x real-time).

---

## 📊 Pourquoi Groq ?

| Critère | WhisperX Local (RTX 3060) | Groq API (Cloud) |
|---------|---------------------------|------------------|
| **Vitesse** | Dépend GPU (~5-10x real-time) | 216x real-time ⚡ |
| **Qualité** | Whisper Large v3 | Whisper Large v3 Turbo |
| **Setup** | Téléchargement modèle (GB) | Zéro setup ✅ |
| **Ressources** | VRAM/CPU local | Zéro (cloud) |
| **Coût** | Gratuit (local) | $0.04/heure (tier gratuit dispo) |
| **Offline** | ✅ Oui | ❌ Non (internet requis) |

**Recommandation** : Groq pour usage quotidien (libère ta RTX 3060), WhisperX en fallback si pas de connexion.

---

## 🔑 Étape 1 : Obtenir une API Key Groq

1. Va sur [https://console.groq.com](https://console.groq.com)
2. Crée un compte gratuit (email + password)
3. Une fois connecté, va dans **API Keys** (menu gauche)
4. Clique sur **Create API Key**
5. Donne un nom (ex: "Hibiki Dictate")
6. **COPIE la clé immédiatement** (elle ne sera plus affichée)
   - Format : `gsk_...` (commence par gsk_)

**⚠️ Important** : Garde cette clé secrète, ne la partage jamais publiquement !

---

## 📦 Étape 2 : Installer le SDK Groq

Ouvre un terminal dans ton environnement virtuel Hibiki :

```bash
# Active l'environnement virtuel
cd D:\30-Dev-Projects\Hibiki-Dictate
venv\Scripts\activate  # Windows

# Installe le SDK Groq
pip install groq>=0.4.0

# Ou installe toutes les dependances
pip install -r requirements.txt
```

---

## ⚙️ Étape 3 : Configurer Hibiki

### Option A : Fichier Config (Recommandé)

1. Ouvre `config/hibiki_preferences.json`
2. Modifie les paramètres suivants :

```json
{
  "transcription_provider": "groq_whisper",
  "groq_whisper": {
    "api_key": "gsk_VOTRE_CLE_ICI",
    "model": "whisper-large-v3-turbo",
    "language": "fr",
    "response_format": "verbose_json",
    "temperature": 0.0
  }
}
```

**Modèles disponibles** :
- `whisper-large-v3-turbo` ⭐ (Recommandé - le plus rapide)
- `whisper-large-v3` (Standard)
- `distil-whisper-large-v3-en` (Anglais uniquement, plus petit)

### Option B : Variable d'Environnement (Sécurité++)

Cree un fichier `.env` a la racine du projet :

```env
GROQ_API_KEY=gsk_VOTRE_CLE_ICI
```

Puis dans `settings.json`, laisse `api_key` vide (il sera lu depuis .env automatiquement).

---

## 🧪 Étape 4 : Tester Groq

Lance Hibiki :

```bash
cd D:\30-Dev-Projects\Hibiki-Dictate
python src/main.py
```

**Vérifications** :
1. Regarde la **Quality indicator** en haut de l'app :
   - ✅ `⚡ Groq Whisper (Cloud)` → Groq actif
   - ⚠️ `✨ WhisperX Local (GPU)` → Fallback sur WhisperX

2. Teste une transcription :
   - Appuie sur le hotkey (ou bouton Enregistrer)
   - Parle quelques secondes
   - Vérifie dans les logs : `🚀 Groq Whisper provider initialized`

---

## 🐛 Résolution Problèmes

### Erreur "Groq SDK not installed"

```bash
pip install groq>=0.4.0
```

### Erreur "Groq API key not provided"

- Vérifie que `api_key` dans `settings.json` est bien rempli
- Ou que la variable `GROQ_API_KEY` existe dans `.env`

### Fallback automatique sur WhisperX

Hibiki revient automatiquement sur WhisperX si :
- API key manquante ou invalide
- Pas de connexion internet
- Quota Groq dépassé (tier gratuit)
- Erreur réseau

**C'est normal !** Le fallback est automatique, l'app continue de fonctionner.

---

## 💰 Coûts & Quota

**Tier Gratuit Groq** :
- Limite : Variable selon disponibilité (généralement quelques heures/jour)
- Reset : Quotidien

**Tier Payant** :
- $0.04/heure audio transcrite
- Exemple : 1h de transcription quotidienne = $1.20/mois (~30h)
- **12x moins cher qu'OpenAI** ($0.006/min = $0.36/h)

**Calcul personnel** :
- Si tu transcris ~10 min/jour (usage moyen)
- = 300 min/mois = 5h/mois
- = **$0.20/mois** (quasi gratuit)

---

## 🔄 Revenir à WhisperX

Si tu veux revenir à WhisperX local :

Dans `settings.json` :
```json
{
  "transcription_provider": "whisperx"
}
```

Ou dans l'interface Settings (quand UI sera ajoutée) :
- **Provider** : WhisperX Local

---

## 📚 Ressources

- [Documentation Groq API](https://console.groq.com/docs/speech-to-text)
- [Pricing Groq](https://groq.com/pricing)
- [Modèles disponibles](https://console.groq.com/docs/model/whisper-large-v3)
- [Dashboard Groq](https://console.groq.com) (voir usage, quotas, API keys)

---

**Version** : 1.0.0  
**Date** : 2026-01-09  
**Copyright** : La Voie Shinkofa
