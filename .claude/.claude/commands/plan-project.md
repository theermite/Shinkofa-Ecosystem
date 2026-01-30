# /plan-project - Génération Plan de Projet

> Commande pour générer un plan d'implémentation structuré via le Project Planner Agent.

**Agent déclenché** : `agents/Project-Planner/AGENT.md`
**Version** : 1.0
**Temps moyen** : 3-8 minutes

---

## 🎯 Objectif

Générer un plan d'implémentation complet et structuré pour :
- Nouveaux projets
- Features majeures (> 3 fichiers)
- Refactoring d'architecture
- Migrations complexes

**Output** : Document Markdown détaillé avec architecture, phases, tâches, estimations, risques et roadmap.

---

## 🔧 Utilisation

### Format Minimal

```bash
/plan-project <description-brève>
```

**Exemple** :
```bash
/plan-project Créer une plateforme de coaching en ligne
```

L'agent va poser des questions pour clarifier les requirements manquants.

---

### Format Détaillé (Recommandé)

```bash
/plan-project <description-complète>
```

**Exemple** :
```bash
/plan-project Je veux créer une plateforme coaching en ligne.

Fonctionnalités souhaitées:
- Profils coaches + clients
- Réservation sessions avec calendrier intégré
- Visio intégrée (Zoom/Whereby)
- Paiement en ligne (Stripe)
- Blog + ressources téléchargeables
- Système de reviews

Contraintes:
- Budget serré (<5000€)
- Lancement dans 3 mois
- Équipe solo (moi + Claude)
- Besoin SEO (référencement naturel)

Public cible:
- Coaches indépendants
- Clients cherchant accompagnement personnel

Stack préférée: Next.js si possible
```

Plus vous fournissez de détails, plus le plan sera précis et actionnable.

---

### Options Avancées

```bash
# Plan minimal (50-100 lignes)
/plan-project "description" --detail minimal

# Plan standard (150-300 lignes) - PAR DÉFAUT
/plan-project "description" --detail standard

# Plan exhaustif (300+ lignes)
/plan-project "description" --detail exhaustif
```

---

## 📊 Informations à Fournir

### Essentielles

| Information | Description | Exemple |
|-------------|-------------|---------|
| **Objectif** | Que veux-tu construire ? | Plateforme e-learning |
| **Utilisateurs** | Qui va utiliser l'app ? | Étudiants + formateurs |
| **Features clés** | Fonctionnalités principales | Vidéos, quizz, certificats |

### Utiles (pour meilleur plan)

| Information | Description | Exemple |
|-------------|-------------|---------|
| **Contraintes** | Budget, timeline, équipe | 2 mois, solo, 2000€ |
| **Stack préférée** | Technologies souhaitées | React, Python, PostgreSQL |
| **Scalabilité** | Nombre utilisateurs attendus | 100 users → 10K users |
| **Intégrations** | APIs tierces requises | Stripe, SendGrid, AWS S3 |
| **Priorités** | Ordre d'importance | SEO > Performance > Design |

### Optionnelles (affinage)

- Inspiration (sites similaires)
- Contraintes légales (RGPD, etc.)
- Compétences de l'équipe
- Infrastructure existante

---

## 🔄 Workflow de l'Agent

L'agent suit 8 étapes automatiquement :

```
1. ANALYSE      → Comprendre requirements
   ↓              Si infos manquantes → AskUserQuestion

2. RESEARCH     → Rechercher patterns similaires
   ↓              - Consultation Knowledge Library
   ↓              - Recherche dans Lessons-Learned
   ↓              - WebSearch si nécessaire

3. ARCHITECTURE → Proposer architecture optimale
   ↓              - 2-3 options avec trade-offs
   ↓              - Justifications techniques
   ↓              - Recommandation

4. BREAKDOWN    → Découper en tâches atomiques
   ↓              - Phases (1-3 semaines chacune)
   ↓              - Tâches (1-4h chacune)
   ↓              - Dépendances claires

5. ESTIMATE     → Estimer efforts réalistes
   ↓              - Méthode : Optimiste × 1.5 × 1.2
   ↓              - Facteurs multiplicateurs
   ↓              - Buffer 20%

6. RISKS        → Identifier risques + mitigations
   ↓              - Technique, Planning, Ressources, Business
   ↓              - Probabilité + Impact + Mitigation

7. PLAN         → Générer document Markdown structuré
   ↓              - Plan complet 150-300 lignes
   ↓              - Roadmap visuel
   ↓              - Budget estimé

8. REVIEW       → Proposer à Jay, itérer si nécessaire
                 - Checkpoint validation
                 - Modifications selon feedback
```

---

## 📄 Structure du Plan Généré

Le plan généré contient les sections suivantes :

```markdown
# Plan de Projet : [Nom Projet]

## 🎯 Vue d'Ensemble
- Objectif
- Résultat Attendu
- Critères de Succès

## 🏗️ Architecture Recommandée
- Stack Technique (tableau comparatif)
- Diagramme Architecture (ASCII)
- Alternatives Considérées (2-3 options)

## 📈 Phases & Tâches
- Phase 1 : Setup & Foundation
  - Tâche 1.1 : [Description, durée, dépendances, livrables]
  - Tâche 1.2 : ...
- Phase 2 : Core Features
- Phase 3 : Polish & Launch

## 📊 Estimations
- Tableau récapitulatif (phases, tâches, durée, effort)
- Buffer pour imprévus
- Timeline réaliste

## ⚠️ Risques Identifiés
- Risque 1 : [Probabilité, Impact, Mitigation]
- Risque 2 : ...

## 🛣️ Roadmap
- Gantt visuel ASCII

## 💰 Budget Estimé
- Développement
- Services tiers
- Hosting
- Total première année

## 📚 Ressources Recommandées
- Tutorials, docs, repos exemple

## 🔄 Next Steps
- Actions immédiates à prendre
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Feature Simple

**Commande** :
```bash
/plan-project Ajouter un système de tags aux posts du blog existant
```

**Plan généré** (résumé) :
- **Objectif** : Permettre catégorisation posts via tags
- **Architecture** : Many-to-many (posts ↔ tags), table jointure
- **Phases** :
  - Phase 1 : Database (2h)
  - Phase 2 : Backend API (3h)
  - Phase 3 : Frontend UI (3h)
- **Estimation totale** : 8h + 2h buffer = 10h (1-2 jours)
- **Risques** : Aucun majeur identifié

---

### Exemple 2 : Projet Moyen

**Commande** :
```bash
/plan-project Créer un dashboard analytics pour le CRM existant.

Fonctionnalités:
- Graphiques ventes mensuelles
- Top 10 clients
- Taux conversion
- Export PDF/CSV

Stack actuelle: Laravel + Vue.js
Timeline: 2 semaines
```

**Plan généré** (résumé) :
- **Architecture** : Microservice analytics séparé avec API REST
- **Stack recommandée** : Laravel + Chart.js + jsPDF
- **Phases** :
  - Phase 1 : Data pipeline (3 jours)
  - Phase 2 : API endpoints (3 jours)
  - Phase 3 : Frontend + export (4 jours)
- **Estimation totale** : 10 jours + 2 jours buffer = 2,5 semaines
- **Risques** :
  - Performance queries complexes (HIGH)
  - Export PDF gros volumes (MEDIUM)

---

### Exemple 3 : Projet Complexe

**Commande** :
```bash
/plan-project Créer marketplace multi-vendors avec paiements split

Fonctionnalités:
- Inscription vendors (KYC)
- Catalogue produits
- Panier + checkout
- Paiements split automatiques (Stripe Connect)
- Dashboard vendors
- Admin panel

Contraintes:
- Compliance Stripe
- Scalabilité 10K+ users
- Équipe: 2 devs + moi
- Timeline: 6 mois
- Budget: 15K€
```

**Plan généré** (résumé) :
- **Architecture** : Monolithe Next.js fullstack PUIS microservices si succès
- **Approche progressive** :
  - Phase 1 : MVP Single-Vendor (6 semaines)
  - Phase 2 : Multi-Vendor (6 semaines)
  - Phase 3 : Scale Architecture (8 semaines)
- **Estimation totale** : 20 semaines (5 mois) + 4 semaines buffer
- **Risques CRITIQUES** :
  - Compliance Stripe Connect (HIGH/BLOQUANT) → POC dès Semaine 1
  - Complexité paiements split (HIGH/CRITIQUE) → Allouer 2 semaines
  - Scalabilité prématurée (MEDIUM) → Start monolithe, scale later
- **Recommandation** : Valider MVP avant investir dans multi-vendor

---

## 🧠 Intelligence de l'Agent

### Consultation Automatique

L'agent consulte automatiquement :

**1. Knowledge Library**
```python
# Recherche projets similaires documentés
/knowledge search "marketplace architecture"
/knowledge search "stripe connect integration"
/knowledge search "multi-tenant design patterns"
```

**2. Lessons-Learned**
```bash
# Apprendre erreurs passées
/search-registry "stripe webhook"
/search-registry "payment split"
/search-registry "scalability"
```

**3. Templates Disponibles**
L'agent recommande automatiquement le template approprié :
- `fastapi-react` → API complexe + SPA
- `nextjs-app` → SEO important + SSR
- `electron-app` → Application desktop
- `cli-tool` → Outil CLI/automation

### Adaptation Contextuelle

**Si requirements vagues** :
```
L'agent pose des questions ciblées via AskUserQuestion:
1. Qui sont les utilisateurs principaux ?
2. Quelle est ta contrainte la plus importante ?
3. As-tu des technologies préférées/requises ?
```

**Si timeline irréaliste** :
```
L'agent propose 3 options:
A. Scope réduit (réaliste)
B. Scope complet + plus de temps
C. Scope complet + équipe additionnelle (risqué)
```

**Si budget limité** :
```
L'agent recommande:
- Services managés (Vercel, Supabase)
- Stack simple (Next.js fullstack)
- Features essentielles d'abord
- Économie estimée: 70% vs architecture complexe
```

---

## 📁 Où est Sauvegardé le Plan ?

**Option 1 : Plan projet existant**
```
mon-projet/.claude/docs/PLAN-IMPLEMENTATION.md
```

**Option 2 : Nouveau projet**
```
D:\30-Dev-Projects\plans\PLAN-[nom-projet]-[date].md
```

**Option 3 : Sur demande**
```bash
/plan-project "description" --output ~/Documents/plan-coaching-platform.md
```

---

## 🔗 Intégration avec Autres Agents

### Handoff vers Build-Deploy-Test

Après validation du plan :
```
Handoff : Project Planner → Build-Deploy-Test
Context : Plan dans .claude/docs/PLAN-IMPLEMENTATION.md
Phase actuelle : Phase 1, Tâche 1.1
Next : Setup projet selon plan
```

### Handoff vers Code-Reviewer

Lors des commits :
```
Code-Reviewer vérifie:
- Conformité avec architecture planifiée
- Respect décisions techniques du plan
- Tâches livrables complétées
```

---

## ✅ Checklist Post-Génération Plan

Après avoir reçu le plan généré :

- [ ] Lire le plan en entier
- [ ] Valider l'architecture recommandée
- [ ] Vérifier que la timeline est acceptable
- [ ] Confirmer que le budget est dans tes limites
- [ ] Comprendre les risques identifiés
- [ ] Clarifier points d'interrogation si nécessaire
- [ ] Dire "Je valide ce plan" pour passer à l'implémentation
- [ ] OU demander modifications spécifiques

**IMPORTANT** : L'agent attendra ta validation explicite avant de commencer l'implémentation.

---

## 🎯 Métriques de Succès

| Métrique | Cible | Indicateur |
|----------|-------|------------|
| **Temps génération** | < 5 min | ✅ Rapide |
| **Précision estimations** | ±20% | ✅ Fiable |
| **Plan accepté** | Sans modifs majeures | ✅ Actionnable |
| **Clarté** | Compréhensible immédiatement | ✅ Clair |

---

## 📚 Ressources

- **Agent complet** : `agents/Project-Planner/AGENT.md`
- **Templates** : `templates/README.md`
- **Knowledge Library** : `.claude/commands/knowledge.md`
- **Lessons-Learned** : `infrastructure/lessons/README.md`

---

## 🐛 Troubleshooting

**Problème** : Plan trop générique / pas assez détaillé
**Solution** : Fournir plus de contexte dans la description initiale

**Problème** : Architecture recommandée ne convient pas
**Solution** : Préciser stack préférée et contraintes techniques

**Problème** : Estimations semblent trop longues
**Solution** : L'agent est honnête ; discuter scope réduit ou plus de ressources

**Problème** : Agent pose trop de questions
**Solution** : Utiliser format détaillé avec toutes les infos dès le départ

---

## 💡 Tips

1. **Sois spécifique** : Plus de détails = meilleur plan
2. **Mentionne contraintes** : Budget, timeline, stack → influence architecture
3. **Indique priorités** : Features MUST-have vs NICE-to-have
4. **Partage contexte** : Infrastructure existante, compétences équipe
5. **Valide avant code** : Le plan est fait pour éviter refactors coûteux

---

## 🔄 Workflow Complet Recommandé

```
1. /plan-project "description détaillée"
   ↓
2. Lire plan généré attentivement
   ↓
3. Poser questions / demander clarifications
   ↓
4. Valider plan explicitement
   ↓
5. Créer repo Git (si nouveau projet)
   ↓
6. Appliquer template recommandé
   ↓
7. Commencer Phase 1, Tâche 1.1 selon plan
   ↓
8. /pre-commit avant chaque commit
   ↓
9. /deploy quand phase complétée
   ↓
10. Itérer jusqu'à completion projet
```

---

**Créé** : 2026-01-26
**Version** : 1.0
**Maintenu par** : Système Agents
