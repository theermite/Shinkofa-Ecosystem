# QuickRef: Security Checklist

> Référence rapide sécurité OWASP et best practices.

---

## OWASP Top 10 - Prévention

### 1. Injection (SQL, Command)

```python
# ❌ MAUVAIS
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ BON - Parameterized
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
```

```javascript
// ❌ MAUVAIS
exec(`ls ${userInput}`);

// ✅ BON - Whitelist/escape
const allowed = ['list', 'info'];
if (allowed.includes(userInput)) { ... }
```

### 2. Authentification Cassée

```python
# ✅ BON - Bcrypt pour passwords
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))
bcrypt.checkpw(password.encode(), hashed)

# ✅ BON - JWT avec expiration
token = jwt.encode(
    {"user_id": user.id, "exp": datetime.utcnow() + timedelta(hours=1)},
    SECRET_KEY, algorithm="HS256"
)
```

### 3. XSS (Cross-Site Scripting)

```typescript
// ❌ MAUVAIS
element.innerHTML = userInput;

// ✅ BON - Escape ou textContent
element.textContent = userInput;

// ✅ React échappe automatiquement
<div>{userInput}</div>  // Safe

// ❌ DANGER - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} />  // Éviter!
```

### 4. CSRF (Cross-Site Request Forgery)

```python
# FastAPI - CSRF token
from fastapi_csrf_protect import CsrfProtect

@app.post("/api/transfer")
async def transfer(request: Request, csrf_protect: CsrfProtect = Depends()):
    await csrf_protect.validate_csrf(request)
    # ...
```

### 5. Contrôle d'Accès

```python
# ✅ Vérifier ownership
@app.get("/posts/{post_id}")
async def get_post(post_id: int, current_user: User = Depends(get_current_user)):
    post = await Post.get(post_id)
    if post.author_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    return post
```

---

## Checklist Sécurité

### Configuration

- [ ] Secrets dans `.env`, JAMAIS dans code
- [ ] `.env` dans `.gitignore`
- [ ] HTTPS obligatoire en production
- [ ] Headers sécurité (CSP, HSTS, X-Frame-Options)
- [ ] CORS configuré restrictif

### Authentification

- [ ] Passwords hashés (bcrypt, argon2)
- [ ] Tokens JWT avec expiration courte
- [ ] Rate limiting sur login
- [ ] 2FA pour comptes sensibles

### Input Validation

- [ ] Valider TOUS les inputs utilisateur
- [ ] Whitelist > Blacklist
- [ ] Échapper outputs HTML
- [ ] Limiter taille uploads

### Base de Données

- [ ] Queries paramétrées (pas de concaténation)
- [ ] Principe moindre privilège (user DB limité)
- [ ] Backups chiffrés

---

## Headers Sécurité (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Secrets Management

```bash
# .env.example (template sans secrets)
DATABASE_URL=postgresql://user:password@localhost/db
JWT_SECRET=change-me-in-production
API_KEY=your-api-key-here

# Production : utiliser secrets manager
# - Docker Secrets
# - HashiCorp Vault
# - AWS Secrets Manager
```

---

## Audit Rapide

```bash
# Python - dépendances vulnérables
pip install safety
safety check

# Node.js
npm audit
npm audit fix

# Docker
docker scan [image]
```

---

**Version** : 1.0 | **Trigger** : Review sécurité, audit, déploiement
