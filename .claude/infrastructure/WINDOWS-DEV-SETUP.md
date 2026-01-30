# Windows Dev Setup

> Configuration environnement développement Windows pour Jay The Ermite.

---

## 🔐 SSH Agent (Permanent)

**Problème** : Connexions SSH demandent la clé à chaque fois.

**Solution** : Configurer service Windows `ssh-agent` en démarrage automatique.

### Configuration (PowerShell Admin)

```powershell
# 1. Activer démarrage automatique
Get-Service ssh-agent | Set-Service -StartupType Automatic

# 2. Démarrer le service
Start-Service ssh-agent

# 3. Ajouter la clé
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# 4. Vérifier
ssh-add -l
```

### Configuration (CMD)

```cmd
REM 1. Vérifier service
sc query ssh-agent

REM 2. Ajouter clé (service déjà démarré)
ssh-add %USERPROFILE%\.ssh\id_ed25519

REM 3. Lister clés chargées
ssh-add -l

REM 4. Tester connexion VPS
ssh vps-shinkofa "echo Test OK"
```

### Vérification

**Service actif** :
```powershell
Get-Service ssh-agent | Select-Object Name, Status, StartType
# Output attendu: Status=Running, StartType=Automatic
```

**Clé chargée** :
```cmd
ssh-add -l
# Output: 256 SHA256:xxx... ermite-game-windows (ED25519)
```

**Connexion VPS** :
```cmd
ssh vps-shinkofa "whoami"
# Output: ubuntu
```

---

## 📁 Structure SSH (~/.ssh/)

```
C:\Users\jaygo\.ssh\
├── config                  # Alias connexions (vps-shinkofa, vps)
├── id_ed25519             # Clé privée principale
├── id_ed25519.pub         # Clé publique
├── brain-training-vps     # Clé projet spécifique
├── brain-training-vps.pub
└── known_hosts            # Empreintes serveurs
```

### Fichier config

```ssh
# VPS OVH - Tous projets
Host vps-shinkofa
    HostName 217.182.206.127
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes

# Alias court
Host vps
    HostName 217.182.206.127
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
```

---

## 🛠️ Troubleshooting

### Erreur : "Could not open connection to authentication agent"

**Cause** : Service ssh-agent non démarré ou shell ne le voit pas.

**Solution A** (Redémarrer terminal) :
```cmd
# Fermer et rouvrir CMD/PowerShell
ssh-add -l
```

**Solution B** (Git Bash) :
```bash
# Git Bash ne voit pas service Windows, utiliser agent local
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519
```

### Erreur : "Permission denied (publickey)"

**Cause** : Clé publique pas sur serveur ou mauvaise clé utilisée.

**Vérification** :
```cmd
# 1. Clé chargée ?
ssh-add -l

# 2. Clé publique sur serveur ?
ssh vps-shinkofa "cat ~/.ssh/authorized_keys | grep $(ssh-keygen -lf ~/.ssh/id_ed25519.pub | awk '{print $2}')"
```

**Fix** :
```cmd
# Copier clé publique sur serveur
type %USERPROFILE%\.ssh\id_ed25519.pub | ssh vps-shinkofa "cat >> ~/.ssh/authorized_keys"
```

### Service ne démarre pas automatiquement

**Vérifier** :
```powershell
Get-Service ssh-agent | Select-Object StartType
# Si StartType = Manual ou Disabled
```

**Fix** (Admin requis) :
```powershell
Set-Service -Name ssh-agent -StartupType Automatic
Restart-Service ssh-agent
```

---

## 🎯 Shells Supportés

| Shell | ssh-agent Windows | Notes |
|-------|-------------------|-------|
| **CMD** | ✅ Natif | Recommandé, intégration parfaite |
| **PowerShell** | ✅ Natif | Commandes identiques CMD |
| **Git Bash** | ⚠️ Limité | Requiert `eval $(ssh-agent)` manuel |
| **WSL** | ❌ Séparé | Agent Linux distinct, config séparée |

**Recommandation** : Utiliser CMD ou PowerShell pour développement sur Windows.

---

## 🔗 Références

- [OpenSSH for Windows](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_overview)
- [SSH Agent Config](https://www.ssh.com/academy/ssh/agent)
- `infrastructure/VPS-OVH-SETUP.md` - Configuration serveur

---

**Dernière mise à jour** : 2026-01-27 | **Testé sur** : Windows 11 Build 26200
