# Lessons Learned - Authentication & Sécurité

> Leçons apprises liées à l'authentication, sécurité, tokens, sessions.

---

## 📊 Statistiques

**Leçons documentées** : 1
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [AUTH] [JWT] Token expiré cause logout loop
**Date** : 2026-01-05 | **Projet** : SLF-Esport | **Sévérité** : 🟠

**Contexte** :
Users se retrouvaient déconnectés en boucle.

**Erreur** :
Refresh token expirait en même temps que access token.

**Solution** :
```typescript
// Durées différentes obligatoires
const ACCESS_TOKEN_EXPIRY = '15m';   // Court
const REFRESH_TOKEN_EXPIRY = '7d';   // Long

// Refresh AVANT expiration access
if (tokenExpiresIn < 5 * 60 * 1000) {  // 5 min avant
  await refreshToken();
}
```

**Prévention** :
- Access token : 15-30 min
- Refresh token : 7-30 jours
- Implémenter refresh proactif côté client

**Fichiers/Commandes Clés** :
- `src/auth/tokens.ts` - Gestion tokens
- `src/middleware/auth.ts` - Vérification tokens

---

## 💡 Patterns Communs

### Pattern 1 : Token Refresh Proactif
```typescript
// Vérifier expiration dans interceptor
axios.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  const expiresIn = getTokenExpiresIn(token);

  // Refresh si expire dans moins de 5 min
  if (expiresIn < 5 * 60 * 1000) {
    await refreshAccessToken();
  }

  return config;
});
```

### Pattern 2 : Durées Token Sécurisées
```typescript
const TOKEN_CONFIG = {
  access: {
    expiry: '15m',
    algorithm: 'RS256'
  },
  refresh: {
    expiry: '7d',
    algorithm: 'RS256',
    rotating: true  // Nouveau refresh token à chaque utilisation
  }
};
```

### Pattern 3 : Session Management
```typescript
interface Session {
  userId: string;
  deviceId: string;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
}

// Invalider toutes sessions sauf actuelle
async function logoutOtherDevices(userId: string, currentDeviceId: string) {
  await db.session.deleteMany({
    where: {
      userId,
      deviceId: { not: currentDeviceId }
    }
  });
}
```

---

## 🔒 Checklist Sécurité Auth

- [ ] Access token courte durée (≤ 30 min)
- [ ] Refresh token longue durée (7-30 jours)
- [ ] Refresh proactif côté client
- [ ] Rotating refresh tokens (nouveau à chaque utilisation)
- [ ] HTTPS obligatoire en production
- [ ] httpOnly cookies pour tokens
- [ ] CSRF protection
- [ ] Rate limiting sur endpoints auth
- [ ] Logging tentatives échouées
- [ ] 2FA disponible pour utilisateurs sensibles

---

## 🔗 Voir Aussi

- [backend.md](backend.md) - API authentication
- [frontend.md](frontend.md) - Auth côté client
- Infrastructure: [VPS-OVH-SETUP.md](../VPS-OVH-SETUP.md)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
