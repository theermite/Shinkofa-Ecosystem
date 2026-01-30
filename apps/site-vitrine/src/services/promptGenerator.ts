/**
 * Service pour générer un prompt IA personnalisé
 * À utiliser avec Perplexity (Claude Sonnet 4.5) ou Claude pour générer une synthèse holistique
 */

import type { QuestionAnswer } from '../types/questionnaire';

/**
 * Interface pour les informations de l'utilisateur
 */
interface UserInfo {
  email: string;
  prenom: string;
  nom: string;
}

/**
 * Générer le prompt IA personnalisé avec toutes les réponses
 */
export function generateAIPrompt(
  userInfo: UserInfo,
  answers: QuestionAnswer[],
  questionsMap: Map<string, { title: string; type: string }>
): string {
  const formattedAnswers = formatAnswersForPrompt(answers, questionsMap);

  return `# Génération de Synthèse Holistique - Shinkofa

## 🎯 OBJECTIF
Tu es un expert en coaching holistique et neurodivergence. Ta mission est de générer une **synthèse holistique complète et personnalisée** basée sur les réponses au questionnaire Shinkofa de **${userInfo.prenom} ${userInfo.nom}**.

## 📋 INSTRUCTIONS

### 1. DOCUMENTS À ANALYSER (à joindre par l'utilisateur)
**IMPORTANT** : L'utilisateur doit joindre les documents suivants avec ce prompt :

✅ **Carte de Design Humain** de ${userInfo.prenom} ${userInfo.nom}
- Générer sur : https://www.mybodygraph.com/ ou https://www.jovianarchive.com/
- Inclure : Type, Stratégie, Autorité, Profil, Centres définis/ouverts

✅ **Carte du Ciel (Thème Astrologique)** de ${userInfo.prenom} ${userInfo.nom}
- Générer sur : https://www.astro.com/ (section Horoscope gratuit > Carte du ciel)
- Inclure : Soleil, Lune, Ascendant, Maisons, Planètes

✅ **Réponses au Questionnaire Shinkofa** (ci-dessous)

### 2. NUMÉROLOGIE
Calcule et analyse les nombres suivants pour **${userInfo.prenom} ${userInfo.nom}** :
- Chemin de vie (date de naissance dans les réponses)
- Nombre d'expression (prénom + nom)
- Nombre intime
- Nombre de réalisation

### 3. STRUCTURE DE LA SYNTHÈSE HOLISTIQUE

Génère une synthèse complète structurée ainsi :

#### A. PROFIL IDENTITAIRE
- Prénom & Nom : ${userInfo.prenom} ${userInfo.nom}
- Design Humain : Type, Stratégie, Autorité, Profil
- Astrologie : Soleil, Lune, Ascendant (signes + maisons)
- Numérologie : Chemin de vie, Expression, Intime, Réalisation

#### B. NEURODIVERGENCES & FONCTIONNEMENT COGNITIF
Analyse croisée :
- TDAH, TSA, HPI/HPE (si présents)
- Profils neurodivergents identifiés
- Patterns cognitifs (VAKOG, PNL)
- Forces & défis identifiés

#### C. DIMENSION ÉNERGÉTIQUE
- Gestion de l'énergie quotidienne
- Cycles naturels (Design Humain + astrologie)
- Besoins de recharge (somatique + contexte de vie)

#### D. PERSONNALITÉ & MOTIVATIONS PROFONDES
- Ennéagramme (si identifié)
- Archétypes dominants (Shinkofa)
- Valeurs fondamentales
- Paradigmes de vie

#### E. CONTEXTE DE VIE & ADAPTATION
- Situation familiale, professionnelle
- Environnement géographique
- Challenges actuels
- Ressources disponibles

#### F. RECOMMANDATIONS PERSONNALISÉES

**Sur-mesure pour ${userInfo.prenom}** :

1. **Stratégie énergétique optimale**
   - Horaires de productivité
   - Temps de pause nécessaires
   - Activités ressourçantes

2. **Organisation & Productivité adaptée**
   - Outils recommandés (selon profil TDAH/TSA/HPI)
   - Techniques de gestion du temps
   - Environnement de travail optimal

3. **Communication & Relations**
   - Style de communication naturel
   - Besoins relationnels
   - Gestion des conflits selon profil

4. **Développement personnel**
   - Axes de croissance prioritaires
   - Pièges à éviter (selon Design Humain + Ennéagramme)
   - Pratiques recommandées

5. **Prochaines étapes concrètes**
   - 3 actions immédiates (cette semaine)
   - 3 objectifs à moyen terme (3 mois)
   - Ressources & outils spécifiques

#### G. SYNTHÈSE EXECUTIVE (1 PAGE MAX)
Résumé ultra-concis des insights clés et recommandations prioritaires.

---

## 📊 RÉPONSES AU QUESTIONNAIRE SHINKOFA

${formattedAnswers}

---

## 🔧 MODE D'EMPLOI

### Pour Perplexity (RECOMMANDÉ) :
1. Ouvre https://www.perplexity.ai/
2. Sélectionne le modèle **"Claude Sonnet 4.5 (raisonnement)"**
3. Copie-colle CE PROMPT COMPLET
4. Joins tes documents (Carte Design Humain + Carte du Ciel) en pièces jointes
5. Lance la génération

### Pour Claude (alternative) :
1. Ouvre https://claude.ai/
2. Crée une nouvelle conversation
3. Copie-colle CE PROMPT COMPLET
4. Joins tes documents en pièces jointes
5. Lance la génération

---

**Note** : Cette synthèse est générée par IA basée sur tes réponses. Elle constitue un outil de réflexion et d'exploration personnelle, pas un diagnostic médical ou psychologique. Pour des besoins spécifiques, consulte des professionnels qualifiés.

**Contact** : ${userInfo.email}
**Généré le** : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
`;
}

/**
 * Formater les réponses pour le prompt IA
 */
function formatAnswersForPrompt(
  answers: QuestionAnswer[],
  questionsMap: Map<string, { title: string; type: string }>
): string {
  let formatted = '';

  answers.forEach((answer, index) => {
    const question = questionsMap.get(answer.questionId);
    if (!question) return;

    // Skip contact info questions (already in UserInfo)
    if (['email', 'nom', 'prenom'].includes(answer.questionId)) return;

    formatted += `\n### Question ${index + 1}: ${question.title}\n`;

    if (Array.isArray(answer.value)) {
      formatted += `**Réponse** : ${answer.value.join(', ')}\n`;
    } else if (typeof answer.value === 'number') {
      formatted += `**Réponse** : ${answer.value}/10\n`;
    } else {
      formatted += `**Réponse** : ${answer.value}\n`;
    }
  });

  return formatted;
}

/**
 * Générer une version texte simple des réponses (pour email)
 */
export function generateAnswersText(
  answers: QuestionAnswer[],
  questionsMap: Map<string, { title: string; type: string }>
): string {
  let text = 'RÉPONSES AU QUESTIONNAIRE SHINKOFA\n';
  text += '=' .repeat(60) + '\n\n';

  answers.forEach((answer, index) => {
    const question = questionsMap.get(answer.questionId);
    if (!question) return;

    text += `${index + 1}. ${question.title}\n`;

    if (Array.isArray(answer.value)) {
      text += `   → ${answer.value.join(', ')}\n`;
    } else if (typeof answer.value === 'number') {
      text += `   → ${answer.value}/10\n`;
    } else {
      text += `   → ${answer.value}\n`;
    }

    text += '\n';
  });

  return text;
}

/**
 * Générer les instructions d'utilisation du prompt
 */
export function generateInstructions(userInfo: UserInfo): string {
  return `# 📖 INSTRUCTIONS POUR GÉNÉRER VOTRE SYNTHÈSE HOLISTIQUE

Bonjour ${userInfo.prenom} ! 👋

Vous avez complété le questionnaire Shinkofa. Voici comment générer votre **Manuel Holistique Personnalisé** :

## 🎯 ÉTAPE 1 : Préparez vos documents

Avant de lancer l'IA, vous devez avoir :

1. ✅ **Ce prompt** (voir ci-dessous ou dans l'email)
2. ✅ **Votre Carte de Design Humain**
   - Générez-la gratuitement sur : https://www.mybodygraph.com/
   - Ou sur : https://www.jovianarchive.com/
   - Téléchargez l'image ou le PDF

3. ✅ **Votre Carte du Ciel (Thème Astral)**
   - Générez-la gratuitement sur : https://www.astro.com/
   - Section : "Horoscope gratuit" > "Carte du ciel, Ascendant"
   - Téléchargez l'image ou le PDF

## 🤖 ÉTAPE 2 : Choisissez votre IA

### Option 1 : Perplexity (RECOMMANDÉ ⭐)

1. Ouvrez https://www.perplexity.ai/
2. **IMPORTANT** : Sélectionnez le modèle **"Claude Sonnet 4.5 (raisonnement)"**
3. Copiez-collez le prompt complet (voir section "Prompt IA" ci-dessous)
4. Joignez vos 2 documents (Design Humain + Carte du Ciel)
5. Cliquez sur "Envoyer"

**Pourquoi Perplexity ?** Le mode raisonnement de Claude Sonnet 4.5 offre l'analyse la plus approfondie et nuancée.

### Option 2 : Claude (Alternative)

1. Ouvrez https://claude.ai/
2. Créez une nouvelle conversation
3. Copiez-collez le prompt complet
4. Joignez vos 2 documents
5. Cliquez sur "Envoyer"

## ⏱️ ÉTAPE 3 : Génération (patience !)

- ⏳ La génération peut prendre **2-5 minutes** (c'est normal, l'IA analyse tout en profondeur)
- 📄 La synthèse fera entre **8-15 pages** selon votre profil
- 💾 Sauvegardez le résultat en PDF ou document

## 📚 ÉTAPE 4 : Utilisez votre synthèse

Votre Manuel Holistique est un **outil vivant** :
- 🔍 Relisez-le régulièrement (mensuel recommandé)
- ✏️ Annotez, surlignez ce qui résonne
- 🎯 Suivez les recommandations prioritaires
- 🔄 Mettez à jour selon vos évolutions

## ❓ BESOIN D'AIDE ?

- 💬 Rejoignez notre Discord : https://shinkofa.com/discord (à venir)
- 📧 Contactez-nous : contact@shinkofa.com
- 🌐 FAQ complète : https://shinkofa.com/faq

---

**Bon voyage dans la découverte de votre fonctionnement unique !** ✨

L'équipe Shinkofa
真の歩 - "Le Véritable Pas"
`;
}
