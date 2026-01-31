---
description: Génère estimation coût crédit Claude Code pour un projet
---

# Estimation Coût Projet

Génère estimation détaillée coût crédit Claude Code projet.

**Arguments** : Description projet (1 phrase claire)

**Template génération** :

```
📍 PROJET : [Nom Projet]

💰 COÛT ESTIMÉ : [X-Y]$ crédit Claude Code
⏱️ TEMPS ESTIMÉ : [X-Y] heures développement
🎯 PRIORITÉ ROADMAP : [Critique / Haute / Moyenne / Basse]
🔧 STACK SUGGÉRÉ : [Technologies recommandées]

📊 COMPLEXITÉ :
- Frontend : [Simple / Modéré / Complexe]
- Backend : [Simple / Modéré / Complexe]
- Database : [Simple / Modéré / Complexe]
- Testing : [Simple / Modéré / Complexe]
- Déploiement : [Simple / Modéré / Complexe]

🧩 DÉCOUPAGE PHASES :

Phase 1 - [Nom Phase] ([X]h - [X]$)
├── [Tâche 1.1]
├── [Tâche 1.2]
└── [Tâche 1.3]

Phase 2 - [Nom Phase] ([X]h - [X]$)
├── [Tâche 2.1]
├── [Tâche 2.2]
└── [Tâche 2.3]

Phase 3 - [Nom Phase] ([X]h - [X]$)
├── [Tâche 3.1]
└── [Tâche 3.2]

📦 LIVRABLES :
✅ [Livrable 1]
✅ [Livrable 2]
✅ [Livrable 3]

⚠️ RISQUES IDENTIFIÉS :
- [Risque 1 + impact coût/temps]
- [Risque 2 + impact coût/temps]

💡 RECOMMANDATIONS :
- [Recommandation optimisation 1]
- [Recommandation optimisation 2]

🔄 ALTERNATIVES CONSIDÉRÉES :
- Option A : [Description - Coût - Avantages/Inconvénients]
- Option B : [Description - Coût - Avantages/Inconvénients]

📊 ÉTAT BUDGET ACTUEL :
Budget total : 1000$
Dépensé : [X]$
Restant : [Y]$
Après projet : [Z]$

✅ VALIDATION REQUISE AVANT DÉMARRAGE
```

**Facteurs coût considérés** :
- Complexité architecture
- Nombre composants/endpoints
- Stack technique (nouveau vs familier)
- Tests coverage (≥80% obligatoire)
- Documentation (README, API docs)
- Intégrations externes (APIs tierces)
- Sécurité (auth, encryption)
- Performance optimizations
- Accessibilité (WCAG compliance)
- Déploiement + CI/CD setup

**Fourchettes coût moyennes** :
- Script simple Python : 5-15$
- Composant React : 10-25$
- Endpoint FastAPI CRUD : 15-30$
- App Electron MVP : 50-150$
- Site web complet : 100-300$
- Plateforme SaaS : 300-800$

**Exemple utilisation** :
```bash
/estimate-cost Créer plateforme coaching avec dashboard, exercices, suivi progression
```

**Alertes automatiques** :
- 🔴 Estimation > 100$ → Confirmation 2x requise
- 🟡 Budget restant < 200$ après projet → Alerter priorités
- 🟠 Budget restant < 50$ après projet → Recommander reporter

**Note** : Estimation avant CHAQUE projet (workflow obligatoire).
