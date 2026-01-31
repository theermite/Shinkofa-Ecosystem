# /check-ssh - Diagnostic SSH

**Rôle** : Diagnostiquer rapidement problèmes connexion SSH et configuration agent.

---

## 🎯 Déclenchement

**Manuel** : `/check-ssh`

**Auto** :
- Erreur "Could not open connection to authentication agent"
- Erreur "Permission denied (publickey)"
- Demande utilisateur "SSH ne fonctionne pas"

---

## 📋 Checklist Diagnostic

### 1. Service ssh-agent (Windows)

```powershell
Get-Service ssh-agent | Select-Object Name, Status, StartType
```

**Attendu** :
- Status = `Running`
- StartType = `Automatic`

**Si différent** :
```powershell
# Démarrer
Start-Service ssh-agent

# Activer auto-start (admin requis)
Set-Service -Name ssh-agent -StartupType Automatic
```

---

### 2. Clés SSH disponibles

```bash
ls -la ~/.ssh/
```

**Vérifier** :
- `id_ed25519` (clé privée, permissions 600)
- `id_ed25519.pub` (clé publique)
- `config` (configuration connexions)

**Si permissions incorrectes (Linux/WSL)** :
```bash
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/config
```

---

### 3. Clés chargées dans agent

```bash
ssh-add -l
```

**Attendu** :
```
256 SHA256:xxx... ermite-game-windows (ED25519)
```

**Si erreur "Could not open connection"** :
```bash
# Git Bash
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519

# CMD/PowerShell - vérifier service Windows
sc query ssh-agent
```

**Si vide** :
```bash
ssh-add ~/.ssh/id_ed25519
ssh-add -l  # Vérifier ajout
```

---

### 4. Configuration SSH

```bash
cat ~/.ssh/config
```

**Vérifier alias VPS** :
```ssh
Host vps-shinkofa
    HostName 217.182.206.127
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
```

**Si absent** : Lire `infrastructure/VPS-OVH-SETUP.md` pour config complète.

---

### 5. Connexion VPS

```bash
ssh -T vps-shinkofa "echo 'Test OK'"
```

**Attendu** : `Test OK`

**Si timeout** :
```bash
# Vérifier résolution DNS
ping 217.182.206.127

# Test connexion directe
ssh ubuntu@217.182.206.127 "echo 'Test direct OK'"
```

**Si "Permission denied"** :
```bash
# Vérifier clé publique sur serveur
ssh vps-shinkofa "cat ~/.ssh/authorized_keys"

# Réinstaller clé si nécessaire
cat ~/.ssh/id_ed25519.pub | ssh ubuntu@217.182.206.127 "cat >> ~/.ssh/authorized_keys"
```

---

### 6. Known Hosts

```bash
cat ~/.ssh/known_hosts | grep 217.182.206.127
```

**Si erreur "Host key verification failed"** :
```bash
# Supprimer ancienne clé
ssh-keygen -R 217.182.206.127

# Reconnecter (accepter nouvelle clé)
ssh vps-shinkofa
```

---

## 🔧 Résumé Actions

**Afficher après diagnostic** :

```markdown
## 🔍 Résultat Diagnostic SSH

| Composant | Statut | Action |
|-----------|--------|--------|
| ssh-agent | ✅/❌ | [Action si nécessaire] |
| Clés présentes | ✅/❌ | [Action si nécessaire] |
| Clés chargées | ✅/❌ | ssh-add ~/.ssh/id_ed25519 |
| Config VPS | ✅/❌ | Voir infrastructure/VPS-OVH-SETUP.md |
| Connexion | ✅/❌ | [Détails erreur] |

**Next Steps** : [Actions recommandées]
```

---

## 📚 Références

- `infrastructure/WINDOWS-DEV-SETUP.md` - Config Windows complète
- `infrastructure/VPS-OVH-SETUP.md` - Config serveur
- [OpenSSH Troubleshooting](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_troubleshooting)

---

**Version** : 1.0.0 | **Date** : 2026-01-27
