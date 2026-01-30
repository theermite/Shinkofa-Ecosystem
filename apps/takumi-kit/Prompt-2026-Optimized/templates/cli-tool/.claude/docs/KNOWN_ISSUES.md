# Known Issues - [Nom CLI Tool]

> Problèmes connus, limitations, et workarounds.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🐛 Bugs Connus

### HIGH Priority

#### #001 : [Titre Bug]
**Status** : 🔴 Open | **Priorité** : HIGH | **Version** : 1.0.0

**Description** :
[Description du bug]

**Steps to Reproduce** :
1. [Étape 1]
2. [Étape 2]

**Expected** : [Comportement attendu]
**Actual** : [Comportement actuel]

**Workaround** :
```bash
[Commande workaround]
```

**Fix Planned** : v1.0.1 (ETA: YYYY-MM-DD)

---

### MEDIUM Priority

#### #002 : Windows : Config file permissions warning
**Status** : 🟡 Open | **Priorité** : MEDIUM | **Version** : 1.0.0

**Description** :
Sur Windows, warning "Cannot set config file permissions to 600" (Windows permissions différentes Unix).

**Workaround** :
Ignorer warning (Windows NTFS a permissions différentes mais sécurisées par défaut).

**Fix Planned** : v1.1 → Supprimer warning Windows (check OS-specific)

---

### LOW Priority

#### #003 : Rich output cassé sur certains terminaux
**Status** : 🟢 Acknowledged | **Priorité** : LOW | **Version** : 1.0.0

**Description** :
Sur terminaux anciens (cmd.exe Windows XP), colored output affiche codes ANSI bruts.

**Workaround** :
Utiliser `--no-color` flag (ou env var `NO_COLOR=1`).

**Fix Planned** : v1.0.2 → Auto-detect terminal capabilities

---

## ⚠️ Limitations Techniques

### Limitation #1 : Déploiements simultanés
**Impact** : Impossible déployer 2 environnements en parallèle (même CLI)

**Context** :
CLI single-threaded, pas de queue jobs.

**Solution Future** : v1.2 → Job queue (background tasks)

**Workaround Actuel** :
Lancer CLI dans 2 terminaux différents (pas optimal).

---

### Limitation #2 : Config global (pas de multi-tenant)
**Impact** : Une seule config par machine (`~/.mycli/config.yaml`)

**Context** :
Design v1 = config locale unique.

**Solution Future** : v2.0 → Profiles (`--profile dev`, `--profile prod`)

**Workaround Actuel** :
Utiliser `--config-path` pour config custom par projet.

---

### Limitation #3 : API timeout fixe (30s)
**Impact** : Opérations longues (migrations DB lourdes) timeout

**Context** :
Timeout hardcodé à 30s.

**Solution Future** : v1.1 → Config `timeout` dans config.yaml

**Workaround Actuel** :
Modifier code source (`core/config.py` ou `core/config.ts`).

---

## 🔧 Workarounds Temporaires

### Workaround #1 : Deploy timeout sur réseau lent

**Problème** : Deploy timeout (30s) sur VPN/réseau lent.

**Workaround** :
Modifier timeout dans config :
```yaml
# ~/.mycli/config.yaml
timeout: 120  # 2 minutes
```

(Note : Feature pas documentée v1.0, sera officielle v1.1)

---

### Workaround #2 : Config file manquant après install

**Problème** : `mycli deploy` erreur "Config not found" après install.

**Workaround** :
Run `mycli init` avant première utilisation :
```bash
mycli init --api-url https://api.example.com --api-key YOUR_KEY
```

**Fix Permanent** : v1.0.1 → Message erreur plus clair avec instructions

---

## 🚨 Security Considerations

### Consideration #1 : API key visible dans process list
**Risk Level** : ⚠️ HIGH

**Context** :
Si user passe `--api-key` CLI arg, visible dans `ps aux`.

**Mitigation Actuelle** :
- Documentation recommande config file (pas CLI arg)
- Warning si `--api-key` utilisé

**Amélioration Future** : v1.1 → Deprecate `--api-key` CLI arg

---

### Consideration #2 : Config file permissions
**Risk Level** : ⚠️ MEDIUM

**Context** :
Sur machines partagées, autres users peuvent lire config si permissions mal set.

**Mitigation Actuelle** :
- CLI set permissions 600 auto (Linux/macOS)
- Documentation mentionne check permissions

**Amélioration Future** : v1.1 → Warning si permissions trop permissives

---

## 📊 Performance Bottlenecks

### Bottleneck #1 : CLI startup lent (>1s sur machines lentes)
**Impact** : Mauvaise UX sur commandes rapides (`mycli --version`)

**Root Cause** :
Import lourd (Rich, Click, etc.) à chaque invocation.

**Workaround** :
Lazy imports (import seulement si command utilisée).

**Fix Permanent** : v1.1 → Optimize imports

---

## 🔗 Références

- **Issue Tracker** : [Lien GitHub Issues]
- **PyPI** : https://pypi.org/project/mycli/
- **npm** : https://www.npmjs.com/package/mycli

---

## 📝 Comment Reporter un Bug

1. **Vérifier Known Issues** (ce fichier)
2. **Chercher dans Issues** : [GitHub Issues](https://github.com/user/mycli/issues)
3. **Créer nouveau issue** :
   - Template : `.github/ISSUE_TEMPLATE/bug_report.md`
   - Labels : `bug`, `priority:high/medium/low`
4. **Inclure** :
   - CLI version (`mycli --version`)
   - OS + version
   - Command exact exécutée
   - Output complet (verbose mode : `--verbose`)
   - Config (redacted, no API keys)

---

**Maintenu par** : Dev Team | **Review** : À chaque sprint
