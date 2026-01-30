# Content Strategy System - Shinkofa

```yaml
version: 1.0.0
date: 2026-01-29
type: content-generation-framework
usage: blog-posts, social-media, video-scripts, documentation
status: ready-to-use
related:
  - Mythologie-Shizen.md
  - Saga-Shizen-Episodes.md
  - ../branding/Charte-Graphique-Shinkofa-V2.0.md
```

---

## 🎯 Vue d'Ensemble

Système de génération de contenu structuré pour l'écosystème Shinkofa, permettant la création rapide et cohérente de contenus alignés avec la philosophie, la voix de Jay, et les 5 Piliers.

---

## 📁 Structure

```
content-strategy/
├── README.md                    # Ce fichier
├── Mythologie-Shizen.md         # Avatar & narratif Shinkofa
├── Saga-Shizen-Episodes.md      # 5 contes fondateurs
├── templates/                   # Templates réutilisables
│   ├── blog-post.md
│   ├── linkedin-post.md
│   ├── twitter-thread.md
│   ├── video-script.md
│   ├── instagram-carousel.md
│   └── documentation-article.md
├── variables/                   # Contexte réutilisable
│   ├── brand-voice.md
│   ├── piliers-shinkofa.md
│   └── target-audiences.md
└── examples/                    # Exemples de contenu généré
    ├── blog-example.md
    ├── linkedin-example.md
    └── video-script-example.md
```

---

## 🛠️ Utilisation

### Génération Manuelle

1. Choisir un template dans `templates/`
2. Remplacer les placeholders `${VARIABLE}`
3. Adapter selon contexte spécifique
4. Valider cohérence avec `variables/brand-voice.md`

### Génération Automatisée (Skill)

```bash
# Via skill Claude Code
/content-generate --type blog-post --topic "Masking et neurodivergence" --pillar authenticité

# Sortie : Fichier Markdown structuré avec contenu généré
```

---

## 🎨 Variables Disponibles

### Variables Marque

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `${BRAND_NAME}` | Shinkofa | Nom marque |
| `${TAGLINE}` | La Voie du Premier Pas | Slogan |
| `${WEBSITE}` | lavoieshinkofa.com | URL site |
| `${COLORS_PRIMARY}` | Bleu Marine #1c3049 | Couleur principale |
| `${COLORS_SECONDARY}` | Orange Chaleur #e08f34 | Couleur secondaire |
| `${AVATAR}` | Shizen | Avatar/ambassadeur |

### Variables Voix (Jay)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `${VOICE_TONE}` | Bienveillant, humble, invitant | Ton général |
| `${VOICE_STYLE}` | Direct, accessible, sans jargon | Style d'écriture |
| `${VOICE_AVOID}` | Injonctions ("tu dois"), promesses magiques, fake-positif | À éviter absolument |
| `${VOICE_PREFER}` | Questions ouvertes, invitations, exemples concrets | Préférer |

### Variables Piliers (Shinkofa)

| Pilier | Kanji | Thème Principal |
|--------|-------|-----------------|
| `${PILLAR_AUTHENTICITE}` | 真 (Shin) | Être vrai, enlever les masques |
| `${PILLAR_HARMONIE}` | 和 (Wa) | Naviguer les tempêtes émotionnelles |
| `${PILLAR_CROISSANCE}` | 成 (Sei) | Respecter son rythme unique |
| `${PILLAR_SERVICE}` | 奉 (Ho) | Servir depuis la plénitude |
| `${PILLAR_PRESENCE}` | 今 (Ima) | Ancrage dans l'instant |

### Variables Audiences

| Audience | Caractéristiques | Besoins |
|----------|------------------|---------|
| `${AUDIENCE_ND}` | Neurodivergents (TDAH, autisme, HPI, HSP) | Validation, outils pratiques, anti-masking |
| `${AUDIENCE_PROJECTEURS}` | Design Humain Projecteurs | Attente invitation, gestion énergie |
| `${AUDIENCE_MULTIPOTENTIELS}` | Carrières non-linéaires, multiples passions | Anti-comparaison, célébration diversité |
| `${AUDIENCE_QUEER}` | LGBTQIA+ | Inclusivité, sécurité, représentation |

---

## 📝 Templates Disponibles

### 1. Blog Post (`templates/blog-post.md`)
- **Format** : Article long-form (1000-2000 mots)
- **Structure** : Intro, 3-5 sections, conclusion + CTA
- **Ton** : Éducatif, narratif, vulnérable

### 2. LinkedIn Post (`templates/linkedin-post.md`)
- **Format** : Post court (200-400 mots)
- **Structure** : Hook, corps, CTA
- **Ton** : Professionnel-authentique, témoignage

### 3. Twitter Thread (`templates/twitter-thread.md`)
- **Format** : 5-10 tweets chaînés
- **Structure** : 1 tweet hook + développement + conclusion
- **Ton** : Concis, percutant, citations-clés

### 4. Video Script (`templates/video-script.md`)
- **Format** : Script 5-12 minutes
- **Structure** : Intro, corps, parallèle, leçon, CTA
- **Ton** : Conversationnel, Shizen narrator

### 5. Instagram Carousel (`templates/instagram-carousel.md`)
- **Format** : 5-10 slides
- **Structure** : Titre accrocheur + points-clés visuels
- **Ton** : Visuel, bref, inspirant

### 6. Documentation Article (`templates/documentation-article.md`)
- **Format** : Doc technique/pédagogique
- **Structure** : Objectif, méthodologie, exemples, ressources
- **Ton** : Clair, structuré, référençable

---

## 🎯 Workflows Types

### Création Contenu Blog

```
1. Identifier sujet (ex: "Burnout neurodivergent")
2. Choisir pilier dominant (ex: Harmonie)
3. Générer structure via /content-generate
4. Enrichir avec anecdotes Jay ou histoires Shizen
5. Valider cohérence voix avec brand-voice.md
6. Publier + crosspost social media
```

### Création Série Vidéo

```
1. Définir arc narratif (ex: Saison 1 = 5 Piliers)
2. Utiliser Saga-Shizen-Episodes.md comme base
3. Générer scripts via templates/video-script.md
4. Adapter selon plateforme (YouTube long vs TikTok short)
5. Extraire citations pour clips réseaux sociaux
```

### Campagne Social Media

```
1. Thème semaine (ex: "Authenticité & Masking")
2. Générer 1 LinkedIn post (lundi)
3. Générer 1 Twitter thread (mercredi)
4. Générer 1 Instagram carousel (vendredi)
5. Clips TikTok quotidiens (extraits épisode Shizen)
```

---

## 🔍 Checklist Qualité Contenu

Avant publication, vérifier :

### Alignement Marque
- [ ] Vocabulaire Shinkofa utilisé correctement (Piliers, Sankofa, etc.)
- [ ] Palette couleurs respectée (si visuels)
- [ ] Logo/URL présents si CTA

### Voix Jay/Shizen
- [ ] Ton bienveillant, jamais injonctif
- [ ] Pas de promesses magiques ("change ta vie en 7 jours")
- [ ] Humilité présente ("je ne sais pas tout")
- [ ] Invitations, pas ordres ("si tu veux..." pas "tu dois...")

### Accessibilité
- [ ] Langage clair, sans jargon (ou jargon expliqué)
- [ ] Exemples concrets, pas que théorie
- [ ] Structure lisible (titres, listes, paragraphes courts)
- [ ] Alt-text pour images (si visuels)

### Neurodivergence-Friendly
- [ ] Pas de triggers inutiles
- [ ] Validation présente ("ce que tu vis est réel")
- [ ] Outils pratiques, pas que motivation
- [ ] Respect des spoons (énergie limitée)

### Conversion
- [ ] CTA clair (questionnaire, site, newsletter)
- [ ] Lien tracké (si analytics)
- [ ] Offre de valeur évidente ("découvre ton profil holistique gratuit")

---

## 🎨 Exemples d'Usage

### Exemple 1 : Lancement Questionnaire

**Contenu nécessaire** :
- 1 article blog "Pourquoi j'ai créé Shinkofa" (blog-post template)
- 5 posts LinkedIn (1 par pilier) (linkedin-post template)
- 1 thread Twitter "Les 5 Piliers expliqués" (twitter-thread template)
- 1 script vidéo "Bienvenue dans la Voie" (video-script template)

**Timeline** : 2 semaines pré-lancement, contenu quotidien

### Exemple 2 : Série Éducative Masking

**Contenu nécessaire** :
- 1 épisode Shizen "L'Épreuve du Masque" (déjà créé)
- 3 posts Instagram carousel "Types de masking" (instagram-carousel template)
- 1 article blog "Guide anti-masking" (blog-post template)
- 5 clips TikTok extraits épisode

**Timeline** : 1 mois, rythme hebdomadaire

---

## 🔧 Maintenance

### Mise à Jour Templates
- Réviser templates tous les 3 mois
- Ajuster selon performances contenu
- Intégrer feedback community

### Évolution Variables
- Ajouter nouveaux piliers si extension philosophie
- Adapter voix si évolution marque Jay
- Créer nouvelles audiences si segmentation

---

## 🌟 Best Practices

### Do's ✅
- Toujours lier au vécu neurodivergent
- Utiliser storytelling (Shizen, anecdotes Jay)
- Proposer outils actionnables
- Inviter, jamais imposer
- Citer sources si concepts externes

### Don'ts ❌
- Jargon psychologique sans explication
- Promesses de "guérison" ou "transformation rapide"
- Comparaison toxique (avant/après spectaculaire)
- Fake-positif ("good vibes only")
- Appropriation culturelle (symboles mal utilisés)

---

## 📚 Ressources Complémentaires

- `Mythologie-Shizen.md` : Narratif avatar
- `Saga-Shizen-Episodes.md` : Structure 5 contes
- `../branding/Charte-Graphique-Shinkofa-V2.0.md` : Identité visuelle
- `../quickrefs/philosophies/Shinkofa-Vision.md` : Philosophie détaillée

---

**Prêt à créer du contenu qui résonne, invite, et transforme.** 🌊
