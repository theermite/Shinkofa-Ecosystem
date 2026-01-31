# Système Email & Notifications - SLF Esport

## ✅ Implémentations Complétées

### 1. Configuration SMTP (o2Switch)

**Fichiers modifiés:**
- `backend/.env`
- `.env` (racine)

**Configuration:**
```env
SMTP_HOST=mail.shinkofa.com
SMTP_PORT=465 (SSL)
SMTP_USER=contact@shinkofa.com
SMTP_PASSWORD=ShinkContact8.
SMTP_FROM_EMAIL=contact@shinkofa.com
SMTP_FROM_NAME=SLF Esport Platform
```

**Service Email:** `backend/app/services/email_service.py`
- Utilise `smtplib.SMTP_SSL` (port 465)
- Templates HTML responsive
- Emails multipart (HTML + texte brut)

---

### 2. Création de Joueur avec Email Automatique

**Nouveaux fichiers:**
- `backend/app/schemas/user.py` : Schémas `PlayerCreate` et `PlayerCreateResponse`

**Modifications:**
- `backend/app/services/user_service.py` :
  - `generate_secure_password()` : Génère un mot de passe sécurisé (12 caractères, uppercase, lowercase, chiffres, symboles)
  - `create_player_with_email()` : Crée un joueur et envoie automatiquement l'email de bienvenue

**Route API:**
```
POST /api/v1/users/joueurs/
```
- **Autorisation:** Coach, Manager, Super Admin uniquement
- **Données requises:** email, username, full_name (+ champs optionnels)
- **Réponse:** Informations du joueur + mot de passe temporaire + statut envoi email

**Template Email:** `send_welcome_email()` dans `email_service.py`
- Email HTML avec identifiants de connexion
- Instructions de sécurité
- Lien direct vers la page de connexion

---

### 3. Système de Notification par Email

**Nouveau service:** `backend/app/services/notification_service.py`

**6 Templates de notification:**

#### a) Session créée
```python
NotificationService.send_session_created_notification(
    to_email, player_name, session_title, session_date,
    session_description, created_by
)
```
- Notifie un joueur quand une nouvelle session d'entraînement est créée

#### b) Invitation à une session
```python
NotificationService.send_session_invitation(
    to_email, player_name, session_title, session_date, invited_by
)
```
- Invite un joueur à rejoindre une session spécifique

#### c) Rappel de session
```python
NotificationService.send_session_reminder(
    to_email, player_name, session_title, session_date, hours_before
)
```
- Rappel automatique X heures avant le début d'une session

#### d) Exercice assigné
```python
NotificationService.send_exercise_assigned(
    to_email, player_name, exercise_title, assigned_by, due_date
)
```
- Notifie quand un nouvel exercice est assigné

#### e) Performance enregistrée
```python
NotificationService.send_performance_recorded(
    to_email, player_name, exercise_title, score, feedback
)
```
- Notifie quand une performance est enregistrée par le coach

#### f) Message du coach
```python
NotificationService.send_coach_message(
    to_email, player_name, coach_name, message
)
```
- Transfère un message du coach par email

**Caractéristiques communes:**
- Design HTML responsive avec gradient violet/bleu (brand SLF Esport)
- Version texte brut pour compatibilité
- Boutons CTA vers la plateforme
- Footer avec copyright

---

### 4. Préférences de Notification

**Modèle:** `backend/app/models/notification_preferences.py`

**Champs (tous booléens, défaut: True):**
- `session_created` : Nouvelles sessions
- `session_invitation` : Invitations
- `session_reminder` : Rappels
- `exercise_assigned` : Exercices assignés
- `performance_recorded` : Performances
- `coach_message` : Messages du coach
- `account_updates` : Mises à jour du compte

**Relation:** `User` ↔ `NotificationPreferences` (one-to-one, cascade delete)

**Schémas Pydantic:** `backend/app/schemas/notification.py`
- `NotificationPreferencesResponse`
- `NotificationPreferencesUpdate`
- `NotificationPreferencesCreate`

**Routes API:** `backend/app/routes/notifications.py`

```
GET    /api/v1/notifications/preferences        # Récupérer ses préférences
PUT    /api/v1/notifications/preferences        # Modifier ses préférences
POST   /api/v1/notifications/preferences/reset  # Réinitialiser (tout à True)
```

**Intégration dans `main.py`:**
- Router ajouté avec prefix `/api/v1/notifications`
- Tag "Notifications"

---

### 5. Migration Base de Données

**Fichier:** `migrations/005_add_notification_preferences.sql`

**Contenu:**
- Création de la table `notification_preferences`
- Index sur `user_id`
- Trigger `updated_at` automatique
- Création des préférences par défaut pour tous les utilisateurs existants
- Commentaires sur les colonnes

**Commande d'exécution:**
```bash
psql -U slf_user -d slf_esport -f migrations/005_add_notification_preferences.sql
```

---

### 6. Configuration DNS Anti-SPAM

**Document:** `DNS-CONFIGURATION-EMAIL.md`

**Contenu complet:**
- **SPF** : Enregistrement TXT authorisant o2Switch
  ```
  v=spf1 mx a include:_spf.o2switch.net ~all
  ```

- **DKIM** : Activation dans cPanel + enregistrement DNS de la clé publique
  - Guide pas à pas pour générer la clé
  - Format de l'enregistrement `default._domainkey`

- **DMARC** : Politique de traitement des emails
  ```
  v=DMARC1; p=quarantine; rua=mailto:contact@shinkofa.com; ...
  ```

- **Procédures de test:**
  - Mail Tester (objectif 10/10)
  - MXToolbox
  - Test Gmail réel

- **Troubleshooting** pour problèmes courants

---

## 🎯 Utilisation des Notifications

### Exemple d'intégration

```python
from app.services.notification_service import NotificationService
from app.models.notification_preferences import NotificationPreferences

# Vérifier les préférences avant d'envoyer
preferences = db.query(NotificationPreferences).filter(
    NotificationPreferences.user_id == user_id
).first()

if preferences and preferences.session_created:
    NotificationService.send_session_created_notification(
        to_email=user.email,
        player_name=user.full_name,
        session_title="Entraînement tactique",
        session_date=datetime(2025, 1, 5, 18, 0),
        session_description="Focus sur le macro-game et les rotations",
        created_by="Coach Shinkofa"
    )
```

### Bonnes pratiques

1. **Toujours vérifier les préférences** avant d'envoyer
2. **Gérer les échecs d'envoi** (fonction retourne `bool`)
3. **Logger les envois** pour debugging
4. **Respecter la fréquence** (éviter le spam)

---

## 📦 Fichiers créés/modifiés

### Nouveaux fichiers
```
backend/app/services/notification_service.py
backend/app/models/notification_preferences.py
backend/app/schemas/notification.py
backend/app/routes/notifications.py
migrations/005_add_notification_preferences.sql
DNS-CONFIGURATION-EMAIL.md
```

### Fichiers modifiés
```
backend/.env
.env
backend/app/services/user_service.py
backend/app/schemas/user.py
backend/app/routes/users.py
backend/app/models/user.py
backend/app/models/__init__.py
backend/app/main.py
```

---

## 🚀 Prochaines étapes

### Déploiement

1. **Backend:**
   ```bash
   cd /home/ubuntu/SLF-Esport/backend
   docker-compose down
   docker-compose up -d --build
   ```

2. **Migration DB:**
   ```bash
   docker exec -it slf-esport-postgres psql -U slf_user -d slf_esport -f /migrations/005_add_notification_preferences.sql
   ```

3. **Configuration DNS:**
   - Suivre `DNS-CONFIGURATION-EMAIL.md`
   - Ajouter les 3 enregistrements (SPF, DKIM, DMARC)
   - Attendre propagation (2-48h)

4. **Test:**
   - Créer un joueur de test via l'API
   - Vérifier réception de l'email
   - Tester sur mail-tester.com

### Intégrations futures

1. **Frontend:**
   - Page de gestion des préférences de notification
   - Toggle switches pour chaque type de notification
   - API calls vers `/api/v1/notifications/preferences`

2. **Automatisation:**
   - Job cron pour rappels de session (1h avant)
   - Webhook Discord pour notifications importantes
   - Intégration avec système de calendrier

3. **Analytics:**
   - Tracking des emails ouverts (optionnel)
   - Taux de clics sur les boutons CTA
   - Dashboard admin des notifications envoyées

---

## 📊 Commits Git

```
3636304 - feat(auth): Add player creation with auto-generated password and email notification
aaf4ed0 - feat(notifications): Add comprehensive email notification system
9c21a42 - docs(email): Add DNS configuration guide and migration script
```

**Repository:** https://github.com/theermite/SLF-Esport

---

## ✅ Checklist de validation

- [x] SMTP configuré avec o2Switch
- [x] Service email testé (envoi welcome email)
- [x] Route création joueur implémentée et protégée (Coach/Manager/Admin)
- [x] 6 templates de notification créés
- [x] Modèle NotificationPreferences créé
- [x] Routes API préférences implémentées
- [x] Migration SQL créée
- [x] Documentation DNS complète
- [ ] Configuration DNS appliquée (à faire manuellement)
- [ ] Tests de délivrabilité (après config DNS)
- [ ] Interface frontend préférences (à développer)

---

**Auteur:** TAKUMI
**Date:** 31 décembre 2025
**Projet:** SLF Esport - La Salade de Fruits
**Statut:** Backend complet, DNS à configurer, Frontend à développer
