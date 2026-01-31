# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features in development

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes and improvements

---

## [1.0.0] - YYYY-MM-DD

### Added
- ✨ Initial release
- 🎯 [Feature 1]: Description complète de la fonctionnalité
- 🎯 [Feature 2]: Description complète de la fonctionnalité
- 📝 Complete documentation (README, USER-GUIDE, API docs)
- ✅ Tests coverage ≥80% (pytest/Jest)
- 🔒 Security: JWT authentication, input validation, SQL injection prevention
- ♿ Accessibility: WCAG 2.1 AA compliance
- 🐳 Docker configuration for development and production
- 🚀 CI/CD pipeline (GitHub Actions)

### Technical Stack
- **Backend**: [FastAPI 0.109 / Flask 3.0 / Express 4.18]
- **Frontend**: [React 18.2 / Next.js 14]
- **Database**: [PostgreSQL 15 / SQLite 3]
- **Styling**: [Tailwind CSS 3.4]
- **Testing**: [pytest 8.0 / Jest 29.7]
- **Linting**: [Ruff 0.1 / ESLint 8.56]

---

## [0.2.0] - YYYY-MM-DD

### Added
- 🎯 [Feature]: Description
- 🧪 Tests for [feature]

### Changed
- ⚡ Performance improvement: [description]
- 📝 Updated documentation: [what changed]

### Fixed
- 🐛 Fixed [bug description] (#issue-number)
- 🔧 Corrected [issue] in [component]

---

## [0.1.0] - YYYY-MM-DD

### Added
- 🚀 Initial MVP release
- 🎯 Core feature: [description]
- 📝 Basic documentation

### Known Issues
- ⚠️ [Issue 1]: Workaround: [solution]
- ⚠️ [Issue 2]: Will be fixed in next version

---

# Versioning Guide

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Examples:
- `1.0.0` → `2.0.0`: Breaking change (e.g., API endpoint renamed)
- `1.0.0` → `1.1.0`: New feature (e.g., new endpoint added)
- `1.0.0` → `1.0.1`: Bug fix (e.g., fixed validation error)

## Change Categories

### Added ✨
New features, functionality, or capabilities.

**Examples**:
- New API endpoint `/api/users/profile`
- Dark mode support
- Export to CSV functionality
- WebSocket real-time updates

### Changed ⚡
Changes to existing functionality (non-breaking).

**Examples**:
- Improved performance of database queries (30% faster)
- Updated UI design for dashboard
- Enhanced error messages with more details
- Refactored authentication middleware

### Deprecated ⚠️
Features that will be removed in future versions.

**Examples**:
- `/api/v1/old-endpoint` (use `/api/v2/new-endpoint` instead)
- Legacy authentication method (migrate to JWT)

### Removed 🗑️
Removed features or functionality.

**Examples**:
- Removed support for Python 3.9
- Removed deprecated `/api/v1` endpoints
- Dropped Internet Explorer 11 support

### Fixed 🐛
Bug fixes and corrections.

**Examples**:
- Fixed login redirect loop (#123)
- Corrected timezone handling in date picker
- Resolved memory leak in background worker
- Fixed XSS vulnerability in user input

### Security 🔒
Security improvements, vulnerability fixes.

**Examples**:
- Upgraded dependencies to patch CVE-2024-XXXXX
- Implemented rate limiting to prevent DDoS
- Added CSRF protection to all forms
- Fixed SQL injection vulnerability in search

## Emoji Legend

Use emojis for visual clarity (optional):

- ✨ **Added**: New feature
- ⚡ **Changed**: Performance improvement
- 📝 **Documentation**: Docs update
- 🐛 **Fixed**: Bug fix
- 🔒 **Security**: Security fix
- 🗑️ **Removed**: Removed feature
- ⚠️ **Deprecated**: Deprecated feature
- 🎯 **Feature**: Major feature
- 🧪 **Tests**: Test-related
- 🔧 **Config**: Configuration change
- 🚀 **Deploy**: Deployment-related
- ♿ **Accessibility**: A11y improvement
- 🌍 **i18n**: Internationalization
- 🐳 **Docker**: Docker-related

## Best Practices

### 1. Keep It Simple
Each entry should be **1-2 lines maximum**. Focus on **what changed** and **why it matters to users**.

✅ **Good**:
```markdown
- Fixed login timeout after 5 minutes (#234)
```

❌ **Bad**:
```markdown
- Updated the authentication service to handle session expiration more gracefully by implementing a refresh token mechanism that checks for token validity every 30 seconds and automatically renews it if needed, which should prevent users from being logged out unexpectedly when they're in the middle of using the application.
```

### 2. Include Issue/PR References
Link to GitHub issues/PRs for context.

```markdown
- Fixed email validation bug (#123)
- Added export feature (PR #456)
```

### 3. Group Related Changes
Group multiple related changes under one bullet.

```markdown
- Improved user profile: Added avatar upload, bio field, and social links (#234, #235, #236)
```

### 4. User-Focused Language
Write for **users**, not developers.

✅ **User-focused**:
```markdown
- Added ability to filter tasks by date range
```

❌ **Developer-focused**:
```markdown
- Implemented TaskFilterService with DateRangeQuery class
```

### 5. Breaking Changes
**Always highlight breaking changes** with clear migration instructions.

```markdown
### Changed
- ⚠️ **BREAKING**: Renamed endpoint `/api/tasks` to `/api/v2/tasks`. Update your API calls accordingly.
  - **Migration**: Replace all `/api/tasks` with `/api/v2/tasks` in your code.
```

### 6. Update Regularly
Update CHANGELOG **with each release**, not retroactively.

**Workflow**:
1. Work on feature/fix
2. Before merge, add entry to `[Unreleased]` section
3. When releasing, move `[Unreleased]` to versioned section

### 7. Link Versions to Releases
At the bottom of CHANGELOG, add links to releases:

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
[0.2.0]: https://github.com/user/repo/releases/tag/v0.2.0
[0.1.0]: https://github.com/user/repo/releases/tag/v0.1.0
```

## Example: Real Changelog Entry

```markdown
## [2.1.0] - 2025-11-15

### Added
- ✨ Dark mode toggle in user settings (#345)
- 🎯 Export tasks to CSV/JSON formats (#356)
- 🌍 French language support (contributed by @contributor)
- 🧪 Integration tests for task API endpoints (coverage 85%)

### Changed
- ⚡ Improved task loading performance (50% faster on large lists)
- 📝 Updated USER-GUIDE with dark mode instructions
- ♿ Enhanced keyboard navigation in task list (WCAG 2.1 AAA)

### Fixed
- 🐛 Fixed task duplication when clicking save multiple times (#367)
- 🐛 Corrected timezone display for users in UTC+10 and above (#372)
- 🔒 Patched XSS vulnerability in task description field (reported by @security-researcher)

### Security
- 🔒 Upgraded axios to 1.6.2 (fixes CVE-2023-XXXXX)
- 🔒 Implemented rate limiting: 100 requests/minute per user
```

---

**Template Version 1.0 | 2025-11-13 | Based on Keep a Changelog 1.1.0**

## References

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
