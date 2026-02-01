# CLAUDE.md - Hibiki-Dictate

> Application de dictée vocale locale et confidentielle.
>
> **Hérite de** : `D:\30-Dev-Projects\.claude\CLAUDE.md` (workspace)

---

## Source de Vérité Méthodologie

```
D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\
├── Core-System/       # Workflow, Conventions
├── Master-Agents/     # 31 Maîtres
└── Master-Skills/     # 20 Skills
```

---

## Projet

| Attribut | Valeur |
|----------|--------|
| **Nom** | Hibiki-Dictate (響き) |
| **Type** | Desktop App (Python) |
| **Stack** | PySide6 (Qt6), WhisperX, Pydantic |
| **Status** | ALPHA - Migration Qt6 en cours |

---

## Architecture

```
hibiki-dictate/
├── src/
│   ├── core/          # Backend (audio, transcription, hotkeys)
│   ├── models/        # Configuration Pydantic
│   ├── ui/            # Interfaces (Qt6 + CustomTkinter legacy)
│   └── utils/         # Logger, history, formatting
├── config/            # Configuration utilisateur
├── docs/              # Documentation
│   └── Migration/     # Docs migration Qt6
├── tests/             # Tests organisés
│   ├── unit/
│   └── integration/
└── assets/            # Ressources
```

---

## Commandes Fréquentes

```bash
# Lancer (Qt6 - recommandé)
python main_qt.py

# Lancer (CustomTkinter - legacy)
python src/main.py

# Launcher (choix UI)
python hibiki_launcher.py

# Tests
pytest tests/ -v

# Lint
ruff check src/ --fix
```

---

## Points d'Attention

1. **Migration Qt6** : En cours (~60%), CustomTkinter encore fonctionnel
2. **Backend** : Partagé entre les deux UIs, ne pas dupliquer
3. **Hotkeys** : pynput (Windows), vérifier compatibilité Linux
4. **Transcription** : WhisperX (local) ou Groq API (cloud optionnel)

---

## Agents Pertinents

| Maître | Quand |
|--------|-------|
| Desktop-App-Master | UI PySide6/Qt6 |
| Debug-Investigator-Master | Bugs audio/transcription |
| Refactor-Safe-Master | Cleanup CustomTkinter |
| Accessibility-Master | WCAG 2.1 AAA |

---

**Version** : 1.0.0 | **Date** : 2026-02-01
