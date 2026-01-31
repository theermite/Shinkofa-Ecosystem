---
description: Génère rapport statut projet actuel (progrès, budget, next steps)
---

# Statut Projet

Génère rapport complet statut projet(s) actuel(s).

**Rapport généré** :

```
📊 RAPPORT STATUT PROJETS - [Date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 BUDGET GLOBAL

Budget initial : 1000$
Dépensé à date : [X]$
Restant disponible : [Y]$
Deadline : 18 novembre 2025
Jours restants : [Z] jours

Taux consommation : [X]$ / jour moyen
Projection épuisement : [Date estimée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PROJETS EN COURS

[Projet 1]
├── Phase : [Phase actuelle]
├── Progrès : [XX]% complété
├── Coût dépensé : [X]$
├── Coût restant estimé : [Y]$
├── Temps écoulé : [X]h
├── Temps restant estimé : [Y]h
├── Statut : 🟢 On track / 🟡 À surveiller / 🔴 Bloqué
├── Bloqueurs : [Liste bloqueurs si applicable]
└── Next steps : [3-5 actions prioritaires]

[Projet 2]
├── ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PROJETS COMPLÉTÉS (30 derniers jours)

[Projet A]
├── Livré le : [Date]
├── Coût final : [X]$
├── Durée totale : [X]h
├── Livrables : [Liste]
└── Feedback : [Note/commentaire]

[Projet B]
├── ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BACKLOG ROADMAP

Phase 0 - Infrastructure Critique
├── ✅ [Tâche complétée]
├── 🔄 [Tâche en cours]
└── ⏳ [Tâche à faire]

Phase 1 - Besoins Immédiats
├── ⏳ [Tâche 1]
├── ⏳ [Tâche 2]
└── ⏳ [Tâche 3]

Phase 2 - Gaming & Coaching
├── ⏳ [Tâche 1]
└── ⏳ [Tâche 2]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PRIORITÉS SEMAINE ACTUELLE

1. [Priorité 1 - Justification]
2. [Priorité 2 - Justification]
3. [Priorité 3 - Justification]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ALERTES & RISQUES

[Alerte 1] : [Description + Action recommandée]
[Alerte 2] : [Description + Action recommandée]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMANDATIONS STRATÉGIQUES

- [Recommandation 1 basée sur budget/progrès]
- [Recommandation 2 optimisation workflow]
- [Recommandation 3 priorisation roadmap]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 MÉTRIQUES QUALITÉ

Tests Coverage Moyen : [XX]%
Linting Warnings : [X] total
Documentation : [XX]% repos documentés
Déploiements Réussis : [XX]%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 NEXT ACTIONS IMMÉDIAT

1. [Action 1 - Assigné - Deadline]
2. [Action 2 - Assigné - Deadline]
3. [Action 3 - Assigné - Deadline]
```

**Exemple utilisation** :
```bash
/project-status
```

**Sources données analysées** :
- Repos GitHub (commits, branches, PRs)
- Tests coverage rapports
- Linting rapports
- Documentation README presence
- Budget tracking (estimations vs réel)
- Roadmap fichiers markdown

**Fréquence recommandée** :
- Quotidien : Quick check progrès
- Hebdomadaire : Rapport complet + ajustements
- Mensuel : Analyse tendances + stratégie

**Alertes automatiques** :
- 🔴 Budget < 100$ restant
- 🟡 Projet > 20% over budget estimé
- 🟠 Bloqueur non résolu > 3 jours
- 🟢 Milestone complété

**Actions post-rapport** :
1. Identifier bloqueurs critiques
2. Ajuster priorités si nécessaire
3. Optimiser allocation budget restant
4. Valider next steps avec Jay (stratégie Projecteur)
