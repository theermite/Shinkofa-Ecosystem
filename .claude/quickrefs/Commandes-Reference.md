# Commandes Claude Code - Guide Rapide

> Toutes les commandes disponibles pour optimiser ton workflow avec Claude.

**Derniere mise a jour** : 2026-01-25

---

## Comment utiliser les commandes

Tape simplement `/nom-commande` dans ta conversation avec Claude.
Certaines commandes acceptent des parametres : `/commande parametre`

---

## Commandes de Session (Gerer ton travail)

| Commande | Ce que ca fait |
|----------|----------------|
| `/context` | Voir l'etat de ta session (projet, branche, environnement) |
| `/context prod` | Passer en mode PRODUCTION (demande confirmation) |
| `/context local` | Passer en mode LOCAL |
| `/session-summary` | Resume de ta session en cours |
| `/resume-dev` | Reprendre le dev apres une pause - restaure le contexte |
| `/project-status` | Rapport complet sur l'etat du projet actuel |

**Exemple concret** :
```
Toi: /context
Claude: Tu es sur projet X, branche main, env LOCAL, energie 7/10
```

---

## Commandes Avant Commit (Qualite du code)

| Commande | Ce que ca fait |
|----------|----------------|
| `/pre-commit` | Review automatique de ton code AVANT commit |

**Ce que /pre-commit verifie** :
- Erreurs de syntaxe
- Problemes de securite evidents
- Code mort ou non utilise
- Imports manquants
- Bonnes pratiques

**Verdict possible** :
- ✅ Pret a commit
- ⚠️ Warnings (commit possible mais attention)
- ❌ Critique (bloquer et corriger d'abord)

---

## Commandes Deploiement (Mettre en ligne)

| Commande | Ce que ca fait |
|----------|----------------|
| `/deploy` | Lance le cycle de deploiement complet |
| `/deploy prod` | Deployer en PRODUCTION (securite renforcee) |
| `/deployment-check` | Verifier que tout est pret pour deployer |

**Ce que /deploy fait automatiquement** :
1. Verifie l'environnement cible
2. Scan de securite (si PROD)
3. Build du projet
4. Deploiement
5. Health check (verification que ca marche)

---

## Commandes Debug (Resoudre les bugs)

| Commande | Ce que ca fait |
|----------|----------------|
| `/debug` | Lance une investigation methodique |
| `/debug "message erreur"` | Cherche la cause d'une erreur specifique |

**Ce que /debug fait** :
1. Collecte les logs et stack traces
2. Formule des hypotheses
3. Teste chaque hypothese avec des preuves
4. Propose un fix
5. Verifie que le fix fonctionne

**Regle importante** : Jamais de "je pense que..." - toujours des preuves concretes.

---

## Commandes Securite (Proteger ton code)

| Commande | Ce que ca fait |
|----------|----------------|
| `/security-scan` | Scan complet de securite OWASP |
| `/breaking-changes-check` | Detecte si tes changements cassent quelque chose |

**Ce que le scan securite verifie** :
- Injection SQL
- XSS (Cross-Site Scripting)
- Secrets exposes dans le code
- Dependances vulnerables
- Configuration securisee

---

## Commandes Tests (Verifier que ca marche)

| Commande | Ce que ca fait |
|----------|----------------|
| `/test-coverage` | Lance les tests + rapport de couverture |
| `/lint-fix` | Corrige automatiquement le style du code |
| `/performance-audit` | Analyse les performances |
| `/db-health` | Verifie la sante de la base de donnees |

---

## Commandes Documentation (Garder la memoire)

| Commande | Ce que ca fait |
|----------|----------------|
| `/knowledge-capture` | Documenter une lecon apprise |
| `/project-registry-update` | Mettre a jour le registre des projets |

**Quand utiliser /knowledge-capture** :
- Apres avoir resolu un bug difficile (> 30 min)
- Quand tu decouvres un pattern utile
- Pour eviter de refaire la meme erreur

---

## Commandes Git (Gestion du code)

| Commande | Ce que ca fait |
|----------|----------------|
| `/sync-repo` | Synchroniser avec le remote (fetch, pull, push) |
| `/rollback-last` | Annuler le dernier commit en securite |
| `/bump-version` | Incrementer la version du projet |

---

## Commandes Scaffolding (Creer du nouveau)

| Commande | Ce que ca fait |
|----------|----------------|
| `/new-react-component` | Creer un composant React complet (TypeScript, tests, styles) |
| `/new-fastapi-endpoint` | Creer un endpoint FastAPI avec CRUD, auth JWT et tests |
| `/new-electron-app` | Creer une app desktop cross-platform |
| `/new-pwa-app` | Creer une Progressive Web App React |
| `/setup-database` | Configurer PostgreSQL + Alembic migrations |

---

## Commandes Utilitaires

| Commande | Ce que ca fait |
|----------|----------------|
| `/estimate-cost` | Estimer le cout en credits Claude pour un projet |

---

## Agents Automatiques (Se declenchent seuls)

Ces agents se lancent automatiquement selon le contexte :

| Agent | Se declenche quand... |
|-------|----------------------|
| **Context-Guardian** | Debut de session |
| **Code-Reviewer** | Avant un commit |
| **Build-Deploy-Test** | Build ou deploiement |
| **Security-Guardian** | Deploiement en PROD |
| **Debug-Investigator** | Bug ou erreur detecte |
| **Refactor-Safe** | Refactoring > 3 fichiers |
| **Project-Bootstrap** | Nouveau projet |

---

## Workflow Recommande

### Debut de session
```
/context              → Voir ou tu en es
/resume-dev           → Si tu reprends apres une pause
```

### Pendant le dev
```
/debug "erreur"       → Si tu as un bug
/test-coverage        → Verifier que les tests passent
/lint-fix             → Nettoyer le code
```

### Avant de committer
```
/pre-commit           → Review automatique (OBLIGATOIRE)
```

### Avant de deployer
```
/deployment-check     → Tout est pret ?
/security-scan        → Scan securite (surtout PROD)
/deploy prod          → Go !
```

### Fin de session
```
/session-summary      → Resume ce qui a ete fait
/knowledge-capture    → Si tu as appris quelque chose d'important
```

---

## Raccourcis Frequents

| Situation | Commande |
|-----------|----------|
| "J'ai un bug" | `/debug` |
| "Je veux committer" | `/pre-commit` |
| "Je mets en prod" | `/deploy prod` |
| "C'est quoi l'etat du projet ?" | `/context` |
| "On fait une pause" | `/session-summary` |

---

## Aide

Pour plus d'infos sur une commande, demande simplement :
"Explique-moi /nom-commande"

Claude te donnera le detail complet.

---

*Document genere automatiquement depuis les skills disponibles.*
