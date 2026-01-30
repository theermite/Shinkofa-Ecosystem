# QuickRef: Outils Psychologie

> PCM, PNL, MBTI, Ennéagramme, Langages de l'Amour.

---

## Process Communication Model (PCM)

### 6 Types de Personnalité

| Type | Besoin | Canal | Stress |
|------|--------|-------|--------|
| **Travaillomane** | Reconnaissance travail | Informatif | Surcontrôle |
| **Persévérant** | Reconnaissance opinions | Informatif | Croisade |
| **Empathique** | Reconnaissance personne | Nourricier | Suradaptation |
| **Rêveur** | Solitude, directives | Directif | Retrait |
| **Rebelle** | Contacts ludiques | Émotif | Blâme |
| **Promoteur** | Excitation, action | Directif | Manipulation |

### Application UX
```typescript
// Adapter le ton selon le type
const messages = {
  travaillomane: "Voici les données détaillées...",
  empathique: "Comment te sens-tu avec ça ?",
  rebelle: "Check ça, c'est fun !",
  promoteur: "Action : fais-le maintenant"
};
```

---

## PNL (Programmation Neuro-Linguistique)

### Systèmes de Représentation (VAKOG)

| Système | Indices | Mots clés |
|---------|---------|-----------|
| **Visuel** | Regard haut, parle vite | "Je vois", "c'est clair" |
| **Auditif** | Regard côté, rythme | "J'entends", "ça sonne bien" |
| **Kinesthésique** | Regard bas, parle lent | "Je sens", "ça me touche" |

### Techniques Clés

**Ancrage** : Associer état émotionnel à stimulus
```
1. Revivre état ressource
2. Au pic, créer ancre (geste, mot)
3. Répéter pour renforcer
4. Utiliser l'ancre quand besoin
```

**Recadrage** : Changer le cadre de référence
```
"Et si cette difficulté était une opportunité de..."
"Dans quel contexte ce comportement serait utile ?"
```

---

## MBTI (16 Personnalités)

### 4 Dimensions

| Dimension | Pôles |
|-----------|-------|
| Énergie | **E**xtraversion ↔ **I**ntroversion |
| Information | **S**ensation ↔ i**N**tuition |
| Décision | **T**hinking ↔ **F**eeling |
| Style de vie | **J**ugement ↔ **P**erception |

### Application UX
```
- Introvertis : Pas de notifications intrusives
- Intuitifs : Vision globale avant détails
- Feelers : Ton empathique
- Judgers : Structure claire, deadlines
- Perceivers : Flexibilité, options ouvertes
```

---

## Ennéagramme

### 9 Types

| # | Type | Peur | Désir |
|---|------|------|-------|
| 1 | Perfectionniste | Être mauvais | Intégrité |
| 2 | Altruiste | Ne pas être aimé | Être aimé |
| 3 | Battant | Être sans valeur | Valeur, succès |
| 4 | Romantique | Sans identité | Être unique |
| 5 | Observateur | Incompétence | Comprendre |
| 6 | Loyal | Sans support | Sécurité |
| 7 | Épicurien | Souffrance | Satisfaction |
| 8 | Chef | Être contrôlé | Se protéger |
| 9 | Médiateur | Conflit | Paix |

### Centres d'Intelligence
- **Instinctif** (8, 9, 1) : Corps, action
- **Émotionnel** (2, 3, 4) : Cœur, image
- **Mental** (5, 6, 7) : Tête, peur

---

## 5 Langages de l'Amour

| Langage | Expression |
|---------|------------|
| **Paroles valorisantes** | Compliments, encouragements |
| **Moments de qualité** | Présence attentive |
| **Cadeaux** | Objets symboliques |
| **Services rendus** | Actes concrets d'aide |
| **Toucher physique** | Contact, proximité |

### Application UX
```
- Questionnaire découverte du langage
- Suggestions d'actions selon le langage
- Rappels personnalisés
```

---

## Synthèse pour Outils Coaching

### Questions d'Évaluation
```
1. Comment préfères-tu recevoir de l'information ? (VAKOG)
2. Qu'est-ce qui te motive le plus ? (Ennéagramme)
3. Comment recharges-tu ton énergie ? (MBTI E/I)
4. Comment aimes-tu être reconnu ? (Langages amour)
```

### Personnalisation UX
```typescript
interface UserProfile {
  vakog: 'visual' | 'auditory' | 'kinesthetic';
  mbti: string;  // ex: "INFP"
  enneagram: number;  // 1-9
  loveLanguage: string;
}

// Adapter contenu selon profil
function adaptContent(content: Content, profile: UserProfile) {
  // ...
}
```

---

**Version** : 1.0 | **Trigger** : Outils coaching, personnalisation, questionnaires
