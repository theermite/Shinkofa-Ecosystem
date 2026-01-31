# /new-cli-tool

> Scaffold un CLI tool production-ready (Python ou TypeScript).

**Version** : 1.0.0
**Durée** : ~1 minute

---

## 🎯 Objectif

CLI tool avec :
- **Python** : Click + Rich + pytest
- **TypeScript** : Commander + Chalk + Vitest
- **Config** : YAML config file support
- **Distribution** : PyPI / npm ready

---

## 📋 Usage

```bash
/new-cli-tool my-cli --lang python
/new-cli-tool my-cli --lang typescript
/new-cli-tool my-cli  # Ask user for language
```

---

## 🔧 Workflow

```bash
# 1. Ask language if not provided
if [ -z "$LANG" ]; then
  echo "Choose language: python or typescript?"
  read LANG
fi

# 2. Copy template
cp -r templates/cli-tool/ ./<project-name>/

# 3. Replace placeholders
cd <project-name>
find . -type f -exec sed -i "s/mycli/<cli-name>/g" {} +

# 4. Install
if [ "$LANG" == "python" ]; then
  pip install -e ".[dev]"
else
  npm install
fi
```

---

## 🚀 Usage

```markdown
✅ CLI created: <cli-name>

Run:
  <cli-name> --help
  <cli-name> init
  <cli-name> deploy --env dev

Publish:
  Python: python -m build && twine upload dist/*
  TypeScript: npm publish
```

---

**Version** : 1.0.0
