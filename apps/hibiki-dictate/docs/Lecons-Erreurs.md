# Lecons et Erreurs - Hibiki Dictate

Journal des bugs resolus et lecons apprises pour eviter de les repeter.

---

## 2026-01-21 - Silero VAD chunk size mismatch

**Erreur** : La transcription ne fonctionnait pas - aucun texte n'apparaissait apres l'enregistrement.

**Symptome** : Les logs montraient `No segments to transcribe` et des erreurs repetees :
```
ValueError: Provided number of samples is 1536 (Supported values: 256 for 8000 sample rate, 512 for 16000)
```

**Cause racine** :
- Silero VAD **requiert exactement 512 echantillons** a 16kHz (ou 256 a 8kHz)
- La config audio avait `chunk_duration_ms: 96` ce qui produisait 1536 echantillons (96ms * 16000Hz / 1000 = 1536)
- Le VAD echouait silencieusement sur chaque chunk, donc aucun segment de parole n'etait detecte

**Solution** :
Modifier `vad_processor.py:get_speech_probability()` pour:
1. Decouper les chunks audio en fenetres de 512 echantillons
2. Traiter chaque fenetre separement
3. Retourner la probabilite maximale de parole detectee

```python
# Silero VAD requires exactly 512 samples at 16kHz
required_samples = 512 if self.sample_rate == 16000 else 256

# For larger chunks, process in windows
for i in range(0, len(audio_chunk) - required_samples + 1, required_samples):
    window = audio_chunk[i:i + required_samples]
    # ... process window
```

**Prevention** :
- Toujours verifier les contraintes d'input des modeles ML (taille, format, sample rate)
- Ajouter des validations explicites avec messages d'erreur clairs
- Les logs `ERROR` dans les callbacks audio sont souvent le signe d'un probleme de format

**Fichiers modifies** :
- `src/core/vad_processor.py` - Gestion flexible de la taille des chunks

---

## 2026-01-21 - Protection des URLs dans le formateur de texte

**Erreur** : Les URLs etaient cassees par les sauts de ligne automatiques.

**Symptome** : Une URL comme `www.google.com` devenait :
```
www.
google.
com
```

**Cause racine** :
- Le formateur ajoutait un saut de ligne apres chaque point suivi d'un espace
- Les points dans les URLs (`.com`, `.org`) etaient traites comme des fins de phrase
- Pas de mecanisme pour proteger les URLs du traitement

**Solution** :
Implementer un systeme de placeholders pour proteger les URLs :

```python
# Placeholders avec caracteres nuls pour eviter collisions
URL_PLACEHOLDER_PREFIX = '\x00URL'
URL_PLACEHOLDER_SUFFIX = '\x00'

def _protect_urls(self, text: str) -> str:
    patterns = [
        r'https?://[^\s<>"\'\)]+?(?=\.\s|[?!]\s|\s|$)',  # URLs avec protocole
        r'www\.[^\s<>"\'\)]+?(?=\.\s|[?!]\s|\s|$)',      # URLs www
        r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',  # Emails
    ]
    # Remplacer par placeholders avant traitement
```

**Point cle** : Le lookahead `(?=\.\s|[?!]\s|\s|$)` evite de capturer le point final avant un espace (fin de phrase).

**Prevention** :
- Toujours proteger le contenu "special" (URLs, emails, fichiers) avant formatage
- Utiliser des placeholders avec caracteres non-imprimables (`\x00`) pour eviter collisions
- Tester avec des cas limites : URL en fin de phrase, URL avec path complexe

**Fichiers modifies** :
- `src/utils/text_formatter.py` - Ajout `_protect_urls()` et `_restore_urls()`

---

## 2026-01-21 - Ordre des operations dans le formatage de texte

**Erreur** : Les sauts de ligne n'etaient pas ajoutes meme avec des vraies fins de phrase.

**Symptome** :
```python
# Input:  "bonjour. comment ca va."
# Output: "Bonjour. Comment ca va."  # Pas de \n !
```

**Cause racine** :
- La detection de fin de phrase cherchait : `point + espace + MAJUSCULE`
- Mais la capitalisation etait faite APRES les sauts de ligne
- Donc au moment de la detection, le texte etait encore en minuscules

**Solution** :
Inverser l'ordre des operations :

```python
# AVANT (incorrect)
# 1. Fix ponctuation
# 2. Sauts de ligne  <- cherche majuscules qui n'existent pas encore
# 3. Capitalisation  <- trop tard

# APRES (correct)
# 1. Fix ponctuation
# 2. Capitalisation  <- d'abord mettre les majuscules
# 3. Sauts de ligne  <- maintenant on peut detecter point + Majuscule
```

**Prevention** :
- Reflechir a l'ordre des operations quand elles sont interdependantes
- Tester le pipeline step-by-step avec des prints debug
- La detection basee sur des patterns (majuscules) doit venir APRES la generation de ces patterns

**Fichiers modifies** :
- `src/utils/text_formatter.py` - Steps 4 et 5 inverses

---

## 2026-01-21 - Regex URL qui capture trop (point final)

**Erreur** : Le regex capturait le point de fin de phrase avec l'URL.

**Symptome** :
```python
# Input: "va sur www.google.com. c'est super."
# URL capturee: "www.google.com."  # Inclut le point final!
# Resultat: pas de capitalisation apres car le point est "mange"
```

**Cause racine** :
Le pattern `www\.[^\s]+` est greedy et capture tout jusqu'au prochain espace, y compris le point de ponctuation finale.

**Solution** :
Utiliser un lookahead pour arreter AVANT le point + espace :

```python
# AVANT (greedy, capture trop)
r'www\.[^\s<>"\'\)]+'

# APRES (s'arrete avant ponctuation finale)
r'www\.[^\s<>"\'\)]+?(?=\.\s|[?!]\s|\s|$)'
#                   ^^ non-greedy
#                     ^^^^^^^^^^^^^^^^^ lookahead: s'arrete si . ou ? ou ! suivi d'espace
```

**Explication du lookahead** :
- `(?=\.\s|[?!]\s|\s|$)` = "suivi de" (sans capturer)
- `\.\s` = point + espace (fin de phrase)
- `[?!]\s` = ? ou ! + espace
- `\s` = juste un espace (fin de l'URL)
- `$` = fin de chaine

**Prevention** :
- Les regex greedy (`+`, `*`) capturent souvent trop
- Utiliser non-greedy (`+?`, `*?`) quand le contenu est variable
- Les lookahead `(?=...)` permettent de definir des frontieres sans les capturer
- Toujours tester avec des cas ou l'element est en fin de phrase

**Fichiers modifies** :
- `src/utils/text_formatter.py` - Patterns URL ameliores

---

## 2026-01-21 - Typographie francaise (espace insecable)

**Decouverte** : Les regles typographiques francaises requierent un espace insecable avant `:;?!`

**Contexte** :
En francais, contrairement a l'anglais, on met un espace AVANT les ponctuations hautes :
- `Pourquoi ?` (FR) vs `Why?` (EN)
- `Exemple :` (FR) vs `Example:` (EN)

**Implementation** :

```python
# Caractere espace insecable (non-breaking space)
NBSP = '\u00A0'  # Unicode Non-Breaking Space

def _fix_french_punctuation(self, text: str) -> str:
    # Ajouter NBSP avant : ; ? !
    result = re.sub(r'(\S)([;:?!])', rf'\1{NBSP}\2', result)

    # Guillemets francais : espace apres « et avant »
    result = re.sub(r'« *', f'«{NBSP}', result)
    result = re.sub(r' *»', f'{NBSP}»', result)
```

**Pourquoi espace insecable ?**
- Empeche la ponctuation d'etre separee du mot sur une nouvelle ligne
- `\u00A0` ressemble a un espace normal mais ne permet pas de line break

**Prevention** :
- Toujours utiliser NBSP (`\u00A0`) et non espace normal pour typographie FR
- Conditionner ces regles a `language == "fr"`
- Tester avec `repr()` pour voir les caracteres speciaux

**Fichiers modifies** :
- `src/utils/text_formatter.py` - Methode `_fix_french_punctuation()`

---
