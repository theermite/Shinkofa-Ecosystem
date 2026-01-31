# Skill: /content-generate

```yaml
name: content-generate
version: 1.0.0
category: content-creation
created: 2026-01-29
author: Takumi (Claude Code)
usage: "/content-generate --type <template> --topic <sujet> [--pillar <pilier>]"
requires:
  - Prompt-2026-Optimized/content-strategy/
  - templates/ (blog-post, linkedin-post, video-script, etc.)
  - variables/ (brand-voice, piliers-shinkofa, target-audiences)
```

---

## 🎯 Description

Génère du contenu structuré pour l'écosystème Shinkofa en utilisant les templates standardisés, garantissant cohérence de voix, alignement philosophique, et qualité production.

**Use Cases** :
- Création rapide de posts LinkedIn/blog/vidéos
- Brainstorming contenu aligné marque
- Scaffolding structure avant rédaction manuelle
- Assurance qualité (checklist automatique)

---

## 🛠️ Usage

### Syntaxe

```bash
/content-generate --type <template-type> --topic "<sujet>" [options]
```

### Paramètres

| Paramètre | Requis | Valeurs Possibles | Description |
|-----------|--------|-------------------|-------------|
| `--type` | ✅ | `blog-post`, `linkedin-post`, `twitter-thread`, `video-script`, `instagram-carousel`, `documentation` | Type de contenu à générer |
| `--topic` | ✅ | Texte libre | Sujet principal du contenu |
| `--pillar` | ❌ | `authenticite`, `harmonie`, `croissance`, `service`, `presence` | Pilier Shinkofa dominant |
| `--audience` | ❌ | `nd` (neurodivergents), `projecteurs`, `multipotentiels`, `queer` | Audience cible |
| `--tone` | ❌ | `educatif`, `narratif`, `temoignage`, `joueur` | Ton spécifique |
| `--output` | ❌ | Chemin fichier | Destination fichier généré (défaut : affichage) |

---

## 📝 Exemples

### Exemple 1 : Blog Post sur Masking

```bash
/content-generate --type blog-post --topic "Masking neurodivergent et épuisement" --pillar authenticite --audience nd
```

**Résultat** :
- Génère structure complète blog-post.md
- Remplit sections avec contenu adapté
- Inclut checklist qualité

---

### Exemple 2 : LinkedIn Post Témoignage

```bash
/content-generate --type linkedin-post --topic "J'ai dit non à un client pour la première fois" --pillar service --tone temoignage
```

**Résultat** :
- Post 300 mots
- Format hook + corps + CTA
- Hashtags pertinents inclus

---

### Exemple 3 : Script Vidéo Shizen

```bash
/content-generate --type video-script --topic "Conte Authenticité - Royaume des Mille Visages" --pillar authenticite --output scripts/episode-1.md
```

**Résultat** :
- Script complet 10 min
- Narration Shizen
- Notes production incluses

---

## 🔄 Workflow Interne

### Étapes d'Exécution

1. **Validation Paramètres**
   - Vérifier `--type` existe dans templates/
   - Vérifier `--pillar` valide (si fourni)

2. **Chargement Contexte**
   - Lire `variables/brand-voice.md`
   - Lire `variables/piliers-shinkofa.md` (section pilier concerné)
   - Lire `variables/target-audiences.md` (si --audience fourni)

3. **Chargement Template**
   - Lire `templates/${type}.md`
   - Identifier placeholders `${VARIABLE}`

4. **Génération Contenu**
   - Remplir template avec contenu généré
   - Respecter brand voice
   - Intégrer vocabulaire Shinkofa
   - Adapter selon pilier

5. **Validation Qualité**
   - Checklist brand-voice.md
   - Pas de promesses magiques
   - Ton bienveillant/invitant
   - CTA clair et doux

6. **Output**
   - Afficher contenu ou sauvegarder fichier
   - Inclure métadonnées YAML

---

## 🎨 Variables Auto-Remplies

### Variables Marque

| Variable Template | Valeur Injectée | Source |
|-------------------|-----------------|--------|
| `${BRAND_NAME}` | Shinkofa | Hardcoded |
| `${TAGLINE}` | La Voie du Premier Pas | Hardcoded |
| `${WEBSITE}` | lavoieshinkofa.com | Hardcoded |
| `${AVATAR}` | Shizen | Hardcoded |

### Variables Pilier (si --pillar fourni)

| Variable | Source | Exemple |
|----------|--------|---------|
| `${PILLAR_NAME}` | piliers-shinkofa.md | "Authenticité" |
| `${KANJI}` | piliers-shinkofa.md | "真 (Shin)" |
| `${PILLAR_DEFINITION}` | piliers-shinkofa.md | "Être vrai, même imparfait..." |
| `${PILLAR_MANTRA}` | piliers-shinkofa.md | "Tu n'es pas cassé..." |

### Variables Dynamiques (Générées par Claude)

| Variable | Logique Génération |
|----------|-------------------|
| `${TITLE}` | Basé sur --topic + --pillar |
| `${HOOK}` | Première phrase accrocheuse liée au sujet |
| `${BODY}` | Contenu principal développé |
| `${CTA}` | Call-to-action adapté au type contenu |
| `${HASHTAGS}` | 5-10 hashtags pertinents |

---

## 🛡️ Garde-Fous Qualité

### Checklist Automatique

Avant output, vérifier :

- [ ] **Pas d'injonctions** : Chercher "tu dois", "il faut" → Remplacer par "si tu veux", "tu peux"
- [ ] **Pas de promesses magiques** : Chercher "transformation garantie", "change ta vie en X jours"
- [ ] **Ton bienveillant** : Présence de validation ("ce que tu vis est réel")
- [ ] **CTA doux** : Invitation, pas hard-sell
- [ ] **Vocabulaire Shinkofa** : Utilisation correcte termes propriétaires
- [ ] **Accessibilité** : Jargon expliqué, structure claire
- [ ] **Inclusivité** : Langage neutre genre, respectueux LGBTQIA+/ND

### Warnings Automatiques

Si détecté :
- ⚠️ "Urgence artificielle" ("Offre expire dans...") → Suggérer suppression
- ⚠️ "Dramatisation excessive" ("RÉVOLUTIONNAIRE", "ULTIME") → Proposer alternative
- ⚠️ "Comparaison toxique" ("Avant/Après spectaculaire") → Reformuler

---

## 📁 Structure Output

### Format Fichier Généré

```markdown
---
# Métadonnées YAML
type: ${TYPE}
topic: "${TOPIC}"
pillar: ${PILLAR}
generated_date: ${DATE}
generated_by: Claude Code /content-generate
status: draft
review_required: true
---

# ${TITLE}

[Contenu généré ici...]

---

## ✅ Checklist Qualité (À valider avant publication)

- [ ] Hook accrocheur
- [ ] Voix Shinkofa respectée
- [ ] Pas de promesses magiques
- [ ] CTA clair et doux
- [ ] Relecture fautes
- [ ] Validé par Jay (si contenu sensible)
```

---

## 🎯 Types de Contenu Détaillés

### Blog Post

**Structure** :
- Intro (anecdote/hook émotionnel)
- Contexte (pourquoi ce sujet)
- 3-5 sections développement
- Outils pratiques
- Conclusion + CTA

**Word Count** : 1000-2000 mots

**Ton** : Éducatif, narratif, vulnérable

---

### LinkedIn Post

**Structure** :
- Hook (1-2 lignes)
- Corps (200-400 mots, paragraphes courts)
- CTA (1-2 lignes)
- Hashtags (5-10)

**Formats** : Témoignage, Liste éducative, Question provocante

---

### Video Script

**Structure** :
- Intro (30-60sec) : Shizen accueil
- Corps (5-8min) : Conte ou développement
- Parallèle (1-2min) : Lien vie réelle ND
- Leçon (30sec) : Pilier enseignement
- Outro (30sec) : CTA

**Notes** : Production, musique, clips TikTok

---

### Twitter Thread

**Structure** :
- Tweet 1 : Hook (280 char max)
- Tweets 2-8 : Développement (1 idée/tweet)
- Tweet final : CTA + lien

**Total** : 5-10 tweets

---

### Instagram Carousel

**Structure** :
- Slide 1 : Titre accrocheur
- Slides 2-8 : Points-clés visuels
- Slide finale : CTA

**Format** : Visuel, bref, inspirant

---

## 🔧 Maintenance & Évolution

### Ajout Nouveau Template

```bash
# 1. Créer template
touch Prompt-2026-Optimized/content-strategy/templates/nouveau-type.md

# 2. Structurer avec placeholders ${VARIABLE}

# 3. Documenter dans content-strategy/README.md

# 4. Tester
/content-generate --type nouveau-type --topic "Test"
```

---

### Mise à Jour Variables

```bash
# Modifier
Prompt-2026-Optimized/content-strategy/variables/brand-voice.md

# Changements pris en compte automatiquement au prochain /content-generate
```

---

## 📊 Métriques & Feedback

### Tracking Usage (Optionnel)

```yaml
# .claude/logs/content-generate-usage.yml
sessions:
  - date: 2026-01-29
    type: blog-post
    topic: "Masking"
    pillar: authenticite
    word_count: 1500
    status: published
    performance:
      views: 450
      shares: 23
      conversions: 12
```

---

## 🌟 Best Practices

### Do's ✅

- **Itérer** : Génère plusieurs versions, choisis la meilleure
- **Personnaliser** : Template = base, ajoute anecdotes Jay uniques
- **Valider** : Toujours relire avant publier (surtout sujets sensibles)
- **Tester** : Expérimenter tons, formats selon audience
- **Feedback Loop** : Noter ce qui performe, adapter templates

### Don'ts ❌

- **Publier brut** : Toujours personnaliser le contenu généré
- **Ignorer checklist** : Validation qualité = non-négociable
- **Over-automatiser** : Jay doit rester la voix, pas l'IA
- **Négliger contexte** : Adapter selon actualité, community feedback

---

## 🚀 Exemples Avancés

### Génération Campagne Complète

```bash
# Semaine Authenticité : 5 contenus

# Lundi : Blog long
/content-generate --type blog-post --topic "Guide complet masking neurodivergent" --pillar authenticite --output content/blog/masking-guide.md

# Mercredi : LinkedIn
/content-generate --type linkedin-post --topic "J'ai arrêté de forcer le contact visuel" --pillar authenticite --output content/social/linkedin-authenticite.md

# Vendredi : Video
/content-generate --type video-script --topic "Épisode Shizen : L'Épreuve du Masque" --pillar authenticite --output content/video/episode-1-script.md

# Samedi : Thread Twitter
/content-generate --type twitter-thread --topic "5 signes de masking que tu ignores peut-être" --pillar authenticite --output content/social/twitter-masking-thread.md
```

---

**Skill /content-generate v1.0.0**
*Créer du contenu Shinkofa cohérent, aligné, et impactant.* 🌊

---

## 🎬 Workflow Utilisateur (Jay)

1. Décider sujet + pilier
2. Lancer `/content-generate` avec paramètres
3. Recevoir structure complète
4. Personnaliser avec anecdotes/voix unique
5. Valider checklist qualité
6. Publier + tracker performance
7. Itérer selon feedback community

**Gain de temps estimé** : 60-70% (structure auto, focus sur personnalisation)
