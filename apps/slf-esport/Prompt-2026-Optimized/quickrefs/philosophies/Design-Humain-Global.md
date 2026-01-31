# QuickRef: Design Humain (Système Global)

> Référence complète du Design Humain pour outils et personnalisation.

---

## Les 5 Types

### Generator (70% population)
- **Stratégie** : Répondre (pas initier)
- **Signature** : Satisfaction
- **Not-Self** : Frustration
- **Aura** : Enveloppante, magnétique
- **Conseil UX** : Offrir des options à sélectionner

### Manifestor (9%)
- **Stratégie** : Informer avant d'agir
- **Signature** : Paix
- **Not-Self** : Colère
- **Aura** : Fermée, impactante
- **Conseil UX** : Laisser autonomie, pas de micro-management

### Projector (20%)
- **Stratégie** : Attendre l'invitation
- **Signature** : Succès
- **Not-Self** : Amertume
- **Aura** : Focalisée, pénétrante
- **Conseil UX** : Proposer, jamais imposer; reconnaître leur vision

### Reflector (1%)
- **Stratégie** : Attendre cycle lunaire (28j)
- **Signature** : Surprise
- **Not-Self** : Déception
- **Aura** : Résistante, échantillonneuse
- **Conseil UX** : Pas d'urgence, temps de réflexion

### Manifesting Generator (33% des Generators)
- **Stratégie** : Répondre, puis informer
- **Signature** : Satisfaction + Paix
- **Not-Self** : Frustration + Colère
- **Conseil UX** : Multi-tâches OK, mais focus nécessaire

---

## Les 9 Centres

| Centre | Défini | Non-défini |
|--------|--------|------------|
| **Tête** | Pensées fixes | Absorbe questions des autres |
| **Ajna** | Certitudes | Ouvert aux perspectives |
| **Gorge** | Communication constante | Timing variable |
| **G/Self** | Identité stable | Caméléon, adaptable |
| **Cœur/Ego** | Volonté naturelle | Pas besoin de prouver |
| **Rate/Splenic** | Intuition instantanée | Amplifie peurs/intuitions |
| **Plexus Solaire** | Vagues émotionnelles | Absorbe émotions |
| **Sacral** | Énergie travail | Pas d'énergie durable |
| **Racine** | Gestion pression | Absorbe stress |

---

## Profils (12 combinaisons)

| Ligne | Nom | Caractéristique |
|-------|-----|-----------------|
| 1 | Investigateur | Besoin de fondations solides |
| 2 | Ermite | Talent naturel, appel des autres |
| 3 | Martyr | Apprend par expérience (essai-erreur) |
| 4 | Opportuniste | Réseau et relations |
| 5 | Hérétique | Universalisateur, solutions pratiques |
| 6 | Modèle | Sagesse par l'expérience (3 phases) |

**Exemples** :
- 1/3 (Jay) : Investigateur-Martyr → Recherche profonde + apprentissage expérientiel
- 3/5 : Martyr-Hérétique → Erreurs → Solutions universelles
- 6/2 : Modèle-Ermite → Sagesse observée + talent naturel

---

## Autorité Intérieure

| Autorité | Comment décider |
|----------|-----------------|
| **Émotionnelle** | Attendre la clarté (pas dans la vague) |
| **Sacrale** | Réponses du corps (ah-huh / uhn-uhn) |
| **Splénique** | Intuition instantanée |
| **Ego** | "Est-ce que JE veux?" |
| **Self** | Environnement et personnes |
| **Mentale** | Parler pour clarifier (sounding board) |
| **Lunaire** | Cycle complet de 28 jours |

---

## Application Dev/UX

### Personnalisation par Type
```typescript
interface UserProfile {
  hdType: 'generator' | 'manifestor' | 'projector' | 'reflector' | 'maniGen';
  authority: string;
  profile: string;
}

// Adapter les notifications
if (user.hdType === 'projector') {
  // Proposer, pas alerter
  notification.style = 'invitation';
}
```

### Messages par Type
- **Generator** : "Ça te parle ?"
- **Manifestor** : "Voici ce que tu peux faire"
- **Projector** : "Si tu le souhaites, voici une option"
- **Reflector** : "Prends le temps de sentir"

---

**Version** : 1.0 | **Trigger** : Outils coaching, personnalisation UX, contenu DH
