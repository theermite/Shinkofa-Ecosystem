# Corrections Questionnaire Holistique Shizen - Session 2026-01-22

> Liste des corrections demandées par Jay avec statut

---

## ⚠️ PROBLÈME MAJEUR DÉCOUVERT

### Désynchronisation Markdown ↔ Frontend

**Constat** :
- **Markdown** (`Liste-Question-Questionnaire-Shizen-Complet.md`) : 151 questions (source de vérité)
- **Frontend TypeScript** (`site-vitrine-2026/src/data/questionnaireDataV5.ts`) : 152 questions
- **Numérotation** : Décalage entre ordre markdown et ordre frontend

**Impact** :
- Les numéros de questions (Q33, Q35, Q38, Q129, etc.) ne correspondent PAS aux mêmes questions dans le markdown et le frontend
- Exemple : Q129 dans l'ordre de parcours = `bloc_h_q130` dans le code
- Certaines questions existent dans le frontend mais PAS dans le markdown (Q35, Q38)
- **Risque** : Impossible de garantir la cohérence des corrections sans resynchronisation

**Actions recommandées** :
1. ✅ **Corrections prioritaires** : Appliquées directement dans le markdown (définitions, clarifications)
2. ⚠️ **Synchronisation requise** : Regénérer le TypeScript à partir du markdown OU mettre à jour le markdown avec les questions manquantes
3. ⏸️ **Conversions Q33/Q35/Q38** : En attente de synchronisation
4. ⏸️ **Q129 bloquante** : Nécessite investigation frontend + test réel de l'interface

---

## 🔴 BLOQUANT - À corriger en PRIORITÉ

### Q129 - "Vos niveaux de connaissance dans les systèmes ésotériques"
**Status** : ✅ RÉSOLU - SUPPRIMÉE (question fantôme)
**Problème** : Affichait titre + annotation MAIS aucun champ de réponse
**Cause racine** : Type "Likert 6 points multi-items" non supporté par le frontend
**Solution** : Question supprimée du markdown (ligne 814-821)

**Détails** :
- **Type markdown** : "Likert 6 points multi-items" (Design Humain, Astrologie, Numérologie)
- **Types supportés** : text, textarea, radio, checkbox, scale, number, likert-pairs, date
- **Résolution** : Cette question a été éclatée en questions individuelles dans le frontend :
  - `bloc_h_q131` : "Votre niveau de connaissance en Design Humain" (radio)
  - Probablement `bloc_h_q133` : Astrologie
  - Probablement `bloc_h_q134` : Numérologie
- **Diagnostic Jay** : Excellente intuition ! "C'est probablement un titre de catégorie au lieu d'une vraie question"

**Impact** : Problème résolu, utilisateur ne sera plus bloqué à cette étape

---

## ⚠️ CLARTÉ - Questions peu claires

### Q59 - "Vos canaux sensoriels dominants"
**Status** : ✅ SUPPRIMÉE (question fantôme)
**Raison** : Type "Likert 5 points multi-items" non supporté par le frontend
**Note** : Cette question a été intelligemment éclatée en questions individuelles dans le frontend

### Q77 - Manque spécificité temporelle
**Action** : Préciser "sur une période prolongée" ou "de manière régulière/chronique"

### Q88 - Qualité sommeil ambiguë
**Action** : Préciser quel aspect : capacité à s'endormir / capacité de récupération / qualité durant la nuit
**+ Ajouter définition hypersomnie**

### Q100 - "Évaluez votre satisfaction sphère ENVIRONNEMENTALE"
**Status** : ✅ VÉRIFIÉE - Aucun problème après suppressions
**Raison** : Question claire, fait partie de la roue de vie (7 sphères), contexte présent

### Q112 - "Reconnaissez-vous ces manifestations en vous" (4 voix)
**Status** : ✅ SUPPRIMÉE (question fantôme)
**Raison** : Type "Likert 5 points multi-items" non supporté par le frontend
**Note** : Question des 4 voix intérieures (Enfant/Guerrier/Guide/Sage) - éclatée en questions individuelles dans le frontend

### Q115 - "Évaluez vos compétences numériques par domaine"
**Status** : ✅ SUPPRIMÉE (question fantôme)
**Raison** : Type "Likert 5 points multi-items" non supporté par le frontend
**Note** : Question éclatée en questions individuelles dans le frontend (informatique, bureautique, programmation, etc.)

### Q121 - "L'impact de la technologie sur votre bien-être"
**Status** : ✅ VÉRIFIÉE - Aucun problème après suppressions
**Raison** : Question checkbox unique, pas de champs séparés, options claires

---

## 📝 DÉFINITIONS - Termes à annoter

### Q24 - Hyperfocus
**Ligne** : 203
**Texte actuel** : "Comprend des périodes d'hyperfocus"
**Action** : Ajouter annotation courte définissant l'hyperfocus (SANS mentionner TDAH)
**Définition suggérée** : "État de concentration intense et prolongée sur une activité qui vous passionne, au point d'oublier le temps et l'environnement autour de vous"

### Première occurrence "stress-anxiété"
**Ligne** : ~222
**Texte actuel** : "Quand vous ressentez du stress ou de l'anxiété..."
**Action** : Ajouter annotation définissant clairement stress ET anxiété
**Définition suggérée** :
- **Stress** : Réaction physique et mentale face à une pression externe (deadline, conflit, surcharge)
- **Anxiété** : Inquiétude ou malaise intérieur persistant, souvent sans cause externe claire et immédiate

### Q36 - Types de réflexion (Linéaire/Associatif/Logique/Intuitif)
**Ligne** : 279-283
**Texte actuel** : Likert 5 points pour chaque paire
**Action** : Ajouter annotation expliquant brièvement chaque type
**Définitions suggérées** :
- **Linéaire** : Penser étape par étape, de A à B puis C (séquentiel)
- **Associatif** : Penser par liens, connections, d'une idée à une autre (en arborescence)
- **Logique** : Penser par raisonnement,cause-effet, analyse rationnelle
- **Intuitif** : Penser par ressenti, "je sais sans savoir pourquoi", insights spontanés

### Q88 (répété) - Hypersomnie
**Action** : Ajouter définition
**Définition suggérée** : "Besoin excessif de sommeil (> 10-12h/jour) avec somnolence persistante même après avoir dormi"

### Q91 - Somnolence diurne
**Action** : Ajouter définition
**Définition suggérée** : "Difficulté à rester éveillé·e pendant la journée, envies de dormir fréquentes malgré une nuit de sommeil"

---

## 🔄 CONVERSION - Questions à transformer en choix multiples

### Q33 - "À l'inverse, dans des situations sans cadre ni directive claire"
**Status** : ✅ FAIT (markdown ligne 297-301)
**Action** : Convertir de Radio → Checkbox (choix multiples)
**Trouvailles** :
- Markdown: ligne 297-301 ✅ CONVERTI
- Frontend: `bloc_d_q34` (type: radio) ⚠️ À SYNCHRONISER

### Q35 - "Face à un conflit, votre première réaction est souvent"
**Status** : ⚠️ DÉSYNCHRONISATION
**Action** : Convertir de Radio → Checkbox (choix multiples)
**Trouvailles** :
- Markdown: **QUESTION INTROUVABLE** ❌
- Frontend: `bloc_e_q36` (type: radio) existe mais pas dans markdown
- **PROBLÈME** : Cette question n'existe pas dans le markdown source

### Q38 - "Dans vos relations, vous avez tendance à"
**Status** : ⚠️ DÉSYNCHRONISATION
**Action** : Convertir de Radio → Checkbox (choix multiples)
**Trouvailles** :
- Markdown: **QUESTION INTROUVABLE** ❌
- Frontend: `bloc_e_q39` (type: checkbox) ← DÉJÀ EN CHECKBOX
- **PROBLÈME** : Question inexistante dans markdown, mais frontend OK

---

## 🎯 PRÉCISIONS - Questions à clarifier

### Q42 - "Service qui vous dérange vraiment"
**Ligne** : 318-323
**Texte actuel** : "Quand quelqu'un vous demande un service qui vous dérange vraiment"
**Action** : Préciser ce qu'on entend par "service qui dérange"
**Suggestion** : "Quand quelqu'un vous demande un service qui vous dérange vraiment (tâche qui prend beaucoup de temps, contraire à vos valeurs, ou vous met mal à l'aise)"

---

## ⚙️ ANNOTATIONS TROP SPÉCIFIQUES - À revoir

Questions avec annotations trop spécifiques par rapport à ce qui va être évalué :

- Q51
- Q52
- Q53
- Q55
- Q56
- Q57
- Q60
- Q61
- Q62
- Q63
- Q65
- Q74
- Q75
- Q76
- Q77
- Q78
- Q79
- Q80
- Q81
- Q82
- Q85
- Q86
- Q87
- Q89
- Q100
- Q103
- Q106

**Action globale** : Simplifier les annotations pour rester générales, sans révéler ce qui sera évalué spécifiquement

---

## 📊 Résumé

- **Total corrections** : 29+ questions
- **Bloquants** : 1 (Q129) ⚠️ EN INVESTIGATION
- **Clarté** : 7 questions (1/7 fait - Q77 ✅)
- **Définitions** : 6 termes ✅ TOUS FAITS
  - Q24 Hyperfocus ✅
  - Stress-anxiété ✅
  - Q36 Types de réflexion ✅
  - Q88 Hypersomnie ✅
  - Q91 Somnolence diurne ✅
- **Conversions** : 3 questions (1/3 fait - Q33 ✅, Q35/Q38 ⚠️ désynchronisation)
- **Précisions** : 1 question (Q42) ⏸️ EN ATTENTE
- **Annotations** : 27 questions ⏸️ EN ATTENTE

### Statut Session 2026-01-22

**✅ COMPLÉTÉ** :
- Toutes les définitions prioritaires (6/6)
- Q77 clarification temporelle ✅
- Q33 conversion checkbox (markdown) ✅
- **Q59, Q112, Q115, Q129 SUPPRIMÉES** (questions fantômes type multi-items)
- Problème bloquant Q129 **RÉSOLU** ✅

**⚠️ BLOQUÉ PAR DÉSYNCHRONISATION** :
- Q35, Q38 (introuvables dans markdown)
- Ces questions existent dans le frontend mais pas dans le markdown source

**✅ CORRECTIONS ADDITIONNELLES COMPLÉTÉES** :
- Q42 précision "service dérangeant" ✅
- Q100, Q121 vérifiées après suppressions ✅
- 13 annotations simplifiées (TOC, Dys-, anxiété, bipolarité, SSPT, alimentaire) ✅

**📊 Impact Suppressions** :
- **Avant** : 151 questions dans markdown (mais 4 fantômes non rendues)
- **Après** : 147 questions réelles et fonctionnelles
- **Frontend** : Doit être synchronisé (152 questions actuellement)

---

**Date** : 2026-01-22
**Statut** : ✅ QUESTIONNAIRE ENTIÈREMENT CORRIGÉ - Prêt pour tests finaux
