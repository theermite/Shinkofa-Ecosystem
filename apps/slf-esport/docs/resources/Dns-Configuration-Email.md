# Configuration DNS pour éviter les SPAM

Ce document détaille les enregistrements DNS à ajouter pour **shinkofa.com** afin d'éviter que les emails envoyés par la plateforme SLF Esport arrivent dans les SPAM.

## 📋 Informations de configuration actuelle

- **Domaine:** shinkofa.com
- **Serveur SMTP:** mail.shinkofa.com
- **Email expéditeur:** contact@shinkofa.com
- **Hébergeur:** o2Switch

---

## 1️⃣ SPF (Sender Policy Framework)

Le SPF autorise les serveurs SMTP à envoyer des emails pour votre domaine.

### Enregistrement à ajouter

**Type:** TXT
**Nom:** @ (ou shinkofa.com)
**Valeur:**
```
v=spf1 mx a ip4:VOTRE_IP_SERVEUR include:_spf.o2switch.net ~all
```

### Notes importantes

1. **Remplacer `VOTRE_IP_SERVEUR`** par l'adresse IP de votre serveur o2Switch (si vous la connaissez)
2. **Alternative simplifiée** (si vous ne connaissez pas l'IP) :
   ```
   v=spf1 mx a include:_spf.o2switch.net ~all
   ```

### Explication

- `v=spf1` : Version du SPF
- `mx` : Autorise les serveurs MX du domaine
- `a` : Autorise l'adresse A du domaine
- `include:_spf.o2switch.net` : Autorise les serveurs o2Switch
- `~all` : Soft fail pour les autres (recommandé pour éviter les rejets)

### Vérification

Après ajout, vérifier avec :
```bash
nslookup -type=txt shinkofa.com
```

---

## 2️⃣ DKIM (DomainKeys Identified Mail)

Le DKIM signe cryptographiquement vos emails pour prouver qu'ils viennent bien de votre domaine.

### Configuration o2Switch

1. **Connexion au cPanel o2Switch**
   - URL: https://panel.o2switch.net (ou votre URL cPanel)
   - Connexion avec vos identifiants

2. **Activer DKIM**
   - Aller dans **Email** → **Authentification Email**
   - Cliquer sur **Activer** pour DKIM
   - o2Switch génère automatiquement la clé DKIM

3. **Récupérer la clé publique DKIM**
   - Dans la même section, copier l'enregistrement DNS DKIM généré
   - Format typique :
     ```
     Nom: default._domainkey.shinkofa.com
     Type: TXT
     Valeur: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN... (très longue clé)
     ```

4. **Ajouter l'enregistrement DNS**
   - Type: **TXT**
   - Nom: **default._domainkey** (ou ce que o2Switch vous donne)
   - Valeur: La clé publique générée par o2Switch

### Vérification

```bash
nslookup -type=txt default._domainkey.shinkofa.com
```

---

## 3️⃣ DMARC (Domain-based Message Authentication, Reporting & Conformance)

Le DMARC définit la politique de traitement des emails qui échouent SPF/DKIM.

### Enregistrement à ajouter

**Type:** TXT
**Nom:** _dmarc (ou _dmarc.shinkofa.com)
**Valeur:**
```
v=DMARC1; p=quarantine; rua=mailto:contact@shinkofa.com; ruf=mailto:contact@shinkofa.com; fo=1; pct=100; adkim=r; aspf=r
```

### Explication

- `v=DMARC1` : Version DMARC
- `p=quarantine` : Mettre en quarantaine les emails suspects (recommandé au début)
  - Alternative : `p=reject` (rejeter - plus strict)
  - Alternative : `p=none` (aucune action - monitoring seulement)
- `rua=mailto:contact@shinkofa.com` : Recevoir les rapports agrégés
- `ruf=mailto:contact@shinkofa.com` : Recevoir les rapports détaillés d'échec
- `fo=1` : Génère un rapport si SPF OU DKIM échoue
- `pct=100` : Applique la politique à 100% des emails
- `adkim=r` : DKIM alignement relaxed
- `aspf=r` : SPF alignement relaxed

### Vérification

```bash
nslookup -type=txt _dmarc.shinkofa.com
```

---

## 📝 Checklist de configuration

- [ ] **SPF** : Enregistrement TXT ajouté et vérifié
- [ ] **DKIM** : Activé dans cPanel o2Switch et clé DNS ajoutée
- [ ] **DMARC** : Enregistrement TXT ajouté et vérifié
- [ ] **Reverse DNS (PTR)** : (optionnel) Demander à o2Switch de configurer le PTR
- [ ] **Test envoi email** : Envoyer un email de test à mail-tester.com

---

## 🧪 Tests de configuration

### 1. Mail Tester (Score de délivrabilité)

1. Aller sur https://www.mail-tester.com
2. Copier l'adresse email fournie
3. Créer un joueur de test dans SLF Esport avec cette adresse
4. Vérifier le score (objectif : 10/10)

### 2. MXToolbox (Vérification DNS)

https://mxtoolbox.com/SuperTool.aspx
- SPF Record: `https://mxtoolbox.com/spf.aspx?domain=shinkofa.com`
- DKIM Record: `https://mxtoolbox.com/dkim.aspx?domain=shinkofa.com&selector=default`
- DMARC Record: `https://mxtoolbox.com/dmarc.aspx?domain=shinkofa.com`

### 3. Gmail (Test réel)

1. Créer un joueur avec une adresse Gmail de test
2. Vérifier que l'email arrive dans **Boîte de réception** (pas SPAM)
3. Afficher les en-têtes de l'email (Gmail : ⋮ → Afficher l'original)
4. Vérifier que SPF, DKIM, DMARC sont tous **PASS**

---

## 🔧 Procédure pas à pas (o2Switch)

### Étape 1 : Connexion au DNS Manager

1. Connectez-vous à votre **espace client o2Switch**
2. Aller dans **Domaines** → **Gérer mes domaines**
3. Cliquer sur **shinkofa.com** → **Gérer les DNS**

### Étape 2 : Ajouter SPF

1. Cliquer sur **Ajouter un enregistrement DNS**
2. Type: **TXT**
3. Nom: **@**
4. Valeur: `v=spf1 mx a include:_spf.o2switch.net ~all`
5. TTL: **14400** (4 heures)
6. Enregistrer

### Étape 3 : Activer DKIM (cPanel)

1. Aller dans **cPanel** (lien depuis espace client)
2. Section **Email** → **Authentification Email**
3. Trouver **DKIM**
4. Cliquer sur **Activer**
5. Copier l'enregistrement DNS généré

### Étape 4 : Ajouter DKIM (DNS Manager)

1. Retour au DNS Manager
2. Ajouter un enregistrement **TXT**
3. Nom: **default._domainkey** (selon o2Switch)
4. Valeur: La clé publique copiée
5. TTL: **14400**
6. Enregistrer

### Étape 5 : Ajouter DMARC

1. Ajouter un enregistrement **TXT**
2. Nom: **_dmarc**
3. Valeur: `v=DMARC1; p=quarantine; rua=mailto:contact@shinkofa.com; ruf=mailto:contact@shinkofa.com; fo=1; pct=100; adkim=r; aspf=r`
4. TTL: **14400**
5. Enregistrer

### Étape 6 : Attendre la propagation DNS

- **Délai:** 1 à 48 heures (généralement 2-4h pour o2Switch)
- **Vérification:** Utiliser les commandes `nslookup` ci-dessus

---

## ⚠️ Troubleshooting

### Problème : SPF trop long

Si vous avez beaucoup de services externes, utilisez :
```
v=spf1 include:_spf.o2switch.net ~all
```

### Problème : DKIM ne fonctionne pas

1. Vérifier que DKIM est activé dans cPanel
2. Vérifier que le sélecteur DNS correspond (`default` généralement)
3. Vérifier qu'il n'y a pas d'espaces dans la clé publique

### Problème : DMARC rapporte des échecs

1. Commencer avec `p=none` pour monitoring
2. Analyser les rapports DMARC reçus
3. Passer progressivement à `p=quarantine` puis `p=reject`

---

## 📊 Monitoring continu

### Rapports DMARC

- Vous recevrez des rapports quotidiens/hebdomadaires à **contact@shinkofa.com**
- Analyser avec des outils comme https://dmarc.postmarkapp.com

### Services de monitoring

- Google Postmaster Tools: https://postmaster.google.com
- Microsoft SNDS: https://sendersupport.olc.protection.outlook.com/snds/

---

## 📞 Support

Si vous rencontrez des difficultés :

1. **Support o2Switch:**
   - Email: support@o2switch.fr
   - Chat: Depuis l'espace client
   - Demander de l'aide pour configurer SPF/DKIM/DMARC

2. **Documentation o2Switch:**
   - https://faq.o2switch.fr/hebergement-mutualise/emails

---

## ✅ Résultat attendu

Après configuration complète :

- ✅ Score Mail Tester : **9-10/10**
- ✅ Emails arrivent dans **Boîte de réception** (pas SPAM)
- ✅ SPF : **PASS**
- ✅ DKIM : **PASS**
- ✅ DMARC : **PASS**

---

**Date de création:** 31/12/2025
**Projet:** SLF Esport - La Salade de Fruits
**Contact technique:** contact@shinkofa.com
