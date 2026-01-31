# /security-scan

Lance un scan sécurité complet du code et dépendances avec rapport de vulnérabilités.

## Description

Cette commande effectue un audit sécurité multi-couches :
- Scan dépendances vulnérables (npm audit, pip-audit)
- Détection secrets hardcodés (API keys, passwords)
- Analyse code patterns dangereux (SQL injection, XSS)
- Vérification configuration sécurité (HTTPS, headers)
- Check permissions fichiers

## Usage

```bash
/security-scan [--fix] [--severity <low|medium|high|critical>]
```

**Options** :
- `--fix` : Auto-fix vulnérabilités patchables
- `--severity` : Niveau minimum reporté (défaut : medium)
- `--ignore-dev` : Ignorer dépendances dev
- `--json` : Output JSON pour CI/CD

## Comportement

### 1. **Dependencies Vulnerabilities**

#### **JavaScript/TypeScript (npm audit)**

```bash
npm audit --audit-level=moderate --json
```

Output :
```json
{
  "vulnerabilities": {
    "axios": {
      "severity": "high",
      "via": ["Cross-Site Request Forgery"],
      "fixAvailable": true,
      "version": "0.21.1",
      "fixVersion": "0.21.2"
    }
  },
  "metadata": {
    "vulnerabilities": {
      "critical": 0,
      "high": 1,
      "moderate": 3,
      "low": 5
    }
  }
}
```

#### **Python (pip-audit / safety)**

```bash
pip-audit --format json
# or
safety check --json
```

Output :
```json
{
  "vulnerabilities": [
    {
      "package": "Django",
      "installed_version": "3.2.0",
      "vulnerable_spec": "<3.2.5",
      "vulnerability_id": "CVE-2021-33203",
      "severity": "high",
      "advisory": "SQL injection in QuerySet.order_by()",
      "fix_versions": ["3.2.5", "4.0"]
    }
  ]
}
```

**Auto-fix** (si `--fix`) :
```bash
npm audit fix --force  # Upgrade vulnerable packages
pip install --upgrade django==3.2.5  # Upgrade to safe version
```

---

### 2. **Hardcoded Secrets Detection**

Scan code pour patterns secrets :

**Patterns détectés** :

```regex
# API Keys
(api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]

# Passwords
(password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]

# Tokens
(token|auth[_-]?token|bearer)\s*[:=]\s*['"][a-zA-Z0-9._-]{20,}['"]

# AWS Credentials
(aws[_-]?access[_-]?key[_-]?id)\s*[:=]\s*['"]AKIA[0-9A-Z]{16}['"]
(aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*['"][a-zA-Z0-9/+=]{40}['"]

# Private Keys
-----BEGIN (RSA |)PRIVATE KEY-----

# Database URLs with credentials
(postgres|mysql|mongodb):\/\/[^:]+:[^@]+@

# GitHub Tokens
ghp_[a-zA-Z0-9]{36}

# Stripe Keys
sk_live_[a-zA-Z0-9]{24,}
```

**Scan fichiers** :
- `src/**/*.{js,ts,py,java,go}`
- `.env` (si commité par erreur)
- `config/**/*`
- Exclude : `node_modules/`, `venv/`, `dist/`, `build/`

**Exemple détection** :

```python
# ❌ VULNERABLE: Hardcoded secret
API_KEY = "sk_live_abc123def456ghi789"  # Stripe secret key

# ✅ SECURE: Load from environment
API_KEY = os.getenv("STRIPE_SECRET_KEY")
```

---

### 3. **Code Security Patterns**

#### **SQL Injection**

**Patterns vulnérables** :

```python
# ❌ VULNERABLE: String concatenation
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)

# ❌ VULNERABLE: String formatting
query = "SELECT * FROM users WHERE name = '%s'" % username
cursor.execute(query)

# ✅ SECURE: Parameterized query
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

```javascript
// ❌ VULNERABLE: Template string
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// ✅ SECURE: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

#### **XSS (Cross-Site Scripting)**

```javascript
// ❌ VULNERABLE: innerHTML with user input
element.innerHTML = userInput;

// ❌ VULNERABLE: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ SECURE: Escape HTML
element.textContent = userInput;

// ✅ SECURE: Use library (DOMPurify)
element.innerHTML = DOMPurify.sanitize(userInput);
```

#### **Path Traversal**

```python
# ❌ VULNERABLE: User input in file path
filepath = f"uploads/{filename}"  # filename could be "../../../etc/passwd"
with open(filepath) as f:
    content = f.read()

# ✅ SECURE: Sanitize filename
import os
filename = os.path.basename(filename)  # Remove directory components
filepath = os.path.join("uploads", filename)
```

#### **Command Injection**

```python
# ❌ VULNERABLE: Shell=True with user input
os.system(f"ping {user_input}")

# ✅ SECURE: Use subprocess with list
subprocess.run(["ping", "-c", "4", user_input])
```

#### **Insecure Deserialization**

```python
# ❌ VULNERABLE: pickle with untrusted data
data = pickle.loads(user_input)

# ✅ SECURE: Use JSON
data = json.loads(user_input)
```

---

### 4. **Configuration Security**

#### **HTTPS/SSL**

Check production config :
- [ ] HTTPS enabled (not HTTP)
- [ ] SSL certificate valid (not expired)
- [ ] HSTS header configured
- [ ] Secure cookies (Secure, HttpOnly, SameSite)

#### **Security Headers**

```http
# Check headers présents
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
```

#### **CORS**

```javascript
// ❌ VULNERABLE: Wildcard origin
app.use(cors({ origin: '*' }));

// ✅ SECURE: Specific origins
app.use(cors({ origin: 'https://trusted-domain.com' }));
```

---

### 5. **File Permissions** (Linux/Mac)

```bash
# Check sensitive files not world-readable
find . -name "*.env" -perm /o=r  # .env readable by others
find . -name "*.key" -perm /o=r  # Private keys readable by others

# Check scripts not world-writable
find . -name "*.sh" -perm /o=w  # Scripts writable by others
```

---

## Exemple Output

```
🔒 Security Scan - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DEPENDENCIES VULNERABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JavaScript (npm audit):
  🔴 Critical : 0
  🟠 High     : 2
  🟡 Moderate : 5
  🟢 Low      : 8

1. 🔴 HIGH - axios@0.21.1 (CVE-2021-3749)
   Vulnerability: Server-Side Request Forgery (SSRF)
   Fix Available: ✅ axios@0.21.2
   Action: npm install axios@0.21.2

2. 🔴 HIGH - lodash@4.17.15 (CVE-2020-8203)
   Vulnerability: Prototype Pollution
   Fix Available: ✅ lodash@4.17.21
   Action: npm install lodash@4.17.21

Python (pip-audit):
  🔴 Critical : 1
  🟠 High     : 1
  🟡 Moderate : 2
  🟢 Low      : 3

1. 🔴 CRITICAL - Django@3.2.0 (CVE-2021-33203)
   Vulnerability: SQL Injection in QuerySet.order_by()
   Fix Available: ✅ Django@3.2.5
   Action: pip install Django==3.2.5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 HARDCODED SECRETS DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔴 CRITICAL - Stripe API Key
   File: src/payment/stripe.py:12
   Code: API_KEY = "sk_live_abc123def456"
   Risk: Production Stripe key exposed
   Fix : Move to .env, use os.getenv("STRIPE_SECRET_KEY")

2. 🔴 CRITICAL - AWS Secret Key
   File: config/aws.js:8
   Code: secretAccessKey: "abc123..."
   Risk: AWS credentials exposed
   Fix : Use environment variables

3. 🟠 HIGH - Database Password
   File: src/db/connection.py:5
   Code: password = "MySecretPassword123"
   Risk: Database password in code
   Fix : Use os.getenv("DB_PASSWORD")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛 CODE SECURITY ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔴 CRITICAL - SQL Injection
   File: src/api/users.py:45
   Code: cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
   Risk: SQL injection vulnerability
   Fix : Use parameterized queries: cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

2. 🔴 CRITICAL - XSS Vulnerability
   File: src/components/Comment.jsx:23
   Code: <div dangerouslySetInnerHTML={{__html: comment}} />
   Risk: Cross-site scripting
   Fix : Sanitize with DOMPurify or use textContent

3. 🟠 HIGH - Path Traversal
   File: src/api/files.py:67
   Code: filepath = f"uploads/{filename}"
   Risk: Path traversal attack (filename could be "../../../etc/passwd")
   Fix : Sanitize: filename = os.path.basename(filename)

4. 🟡 MODERATE - Insecure Random
   File: src/auth/tokens.py:12
   Code: token = random.randint(1000, 9999)
   Risk: Predictable tokens
   Fix : Use secrets.token_urlsafe(32)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 CONFIGURATION SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTTPS/SSL:
  ✅ HTTPS enabled
  ✅ SSL certificate valid (expires 2026-04-15)
  ❌ HSTS header missing
  ⚠️  Secure cookie flag not set

Security Headers:
  ❌ Content-Security-Policy missing
  ❌ X-Content-Type-Options missing
  ✅ X-Frame-Options: DENY
  ⚠️  X-XSS-Protection deprecated (use CSP)

CORS:
  ❌ Wildcard origin '*' (allow any domain)
  Fix: Specify allowed origins explicitly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 FILE PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Sensitive files with wrong permissions:
  - .env (rw-r--r--) → Should be (rw-------)
  - private.key (rw-r--r--) → Should be (rw-------)

Fix: chmod 600 .env private.key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Security Score: 45/100 🔴 CRITICAL

Vulnerabilities:
  🔴 Critical : 5 (hardcoded secrets, SQL injection, XSS)
  🟠 High     : 4 (dependency vulns, path traversal)
  🟡 Medium   : 7
  🟢 Low      : 11

🚨 CRITICAL ISSUES REQUIRE IMMEDIATE ACTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 - Critical (Fix Today):
  1. Remove hardcoded secrets (3 files)
     → Move to .env, use environment variables

  2. Fix SQL injection vulnerability
     → Use parameterized queries

  3. Fix XSS vulnerability
     → Sanitize user input with DOMPurify

Priority 2 - High (Fix This Week):
  4. Upgrade vulnerable dependencies
     → /security-scan --fix  # Auto-upgrade

  5. Fix path traversal
     → Sanitize filenames with os.path.basename()

  6. Add security headers
     → Configure CSP, HSTS, X-Content-Type-Options

Priority 3 - Medium (Fix This Month):
  7. Fix insecure random
     → Use secrets module for tokens

  8. Fix file permissions
     → chmod 600 .env private.key

  9. Restrict CORS origins
     → Specify allowed origins explicitly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 GENERATED FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ security-report-2026-01-03.json
✅ security-report-2026-01-03.html
```

## Auto-Fix

Avec flag `--fix` :

```bash
/security-scan --fix
```

**Auto-fixable** :
- ✅ Upgrade dependencies vulnérables
- ✅ Fix file permissions
- ✅ Add security headers (génère config nginx/apache)

**Non auto-fixable** (require code changes) :
- ❌ Hardcoded secrets (require refactoring)
- ❌ SQL injection (require code rewrite)
- ❌ XSS (require sanitization logic)

## CI/CD Integration

GitHub Actions example :

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 02:00

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Security scan
        run: claude security-scan --json > security-report.json

      - name: Fail if critical vulns
        run: |
          CRITICAL=$(jq '.vulnerabilities.critical' security-report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ $CRITICAL critical vulnerabilities found"
            exit 1
          fi

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json
```

## Quand Utiliser

- **Avant release production** : Validation sécurité finale
- **Après ajout dépendances** : Check vulnérabilités nouvelles deps
- **En code review** : Vérifier patterns sécurité
- **Régulier (hebdo)** : Détection nouvelles CVEs
- **En CI/CD** : Gate merge si vulnérabilités critiques

## Configuration

Fichier `.security-scan-config.yaml` (optionnel) :

```yaml
severity:
  fail_on: critical  # Fail if critical vulns
  report: medium     # Report medium+ vulns

ignore:
  vulnerabilities:
    - CVE-2021-12345  # Known false positive
  paths:
    - "tests/**"      # Ignore test files
    - "examples/**"

patterns:
  sql_injection: true
  xss: true
  hardcoded_secrets: true
  path_traversal: true
  command_injection: true

notifications:
  slack_webhook: https://hooks.slack.com/...
  email: security@example.com
```

## Notes

- **False positives possible** : Review output manuellement
- **Complement not replacement** : Utiliser avec tools dédiés (Snyk, SonarQube)
- **Keep tools updated** : Databases vulnérabilités évoluent quotidiennement
- **Privacy**: Pas de données envoyées externes (scan 100% local)
