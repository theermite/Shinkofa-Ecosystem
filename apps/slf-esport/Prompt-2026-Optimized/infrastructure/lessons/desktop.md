# Lessons Learned - Desktop Apps

> Leçons apprises liées aux applications desktop (Electron, Tkinter, etc).

---

## 📊 Statistiques

**Leçons documentées** : 1
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [DESKTOP] [TKINTER] UI freeze pendant opération longue
**Date** : 2026-01-18 | **Projet** : Hibiki-Dictate | **Sévérité** : 🟠

**Contexte** :
Transcription audio bloquait toute l'interface.

**Erreur** :
Opération longue sur le main thread.

**Solution** :
```python
import threading
from queue import Queue

def transcribe_async(audio_file, callback):
    def worker():
        result = transcribe(audio_file)  # Long
        # Callback sur main thread
        root.after(0, lambda: callback(result))

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
```

**Prévention** :
- TOUJOURS threading pour opérations > 100ms
- Feedback visuel (progress bar, spinner)
- Voir `agents/Desktop-App-Agent.md` pour patterns

**Fichiers/Commandes Clés** :
- `threading` module Python
- `root.after(0, callback)` - Execute sur main thread Tkinter

---

## 💡 Patterns Communs

### Pattern 1 : Threading Tkinter
```python
import threading
import queue

class App:
    def __init__(self):
        self.root = tk.Tk()
        self.queue = queue.Queue()
        self.check_queue()

    def long_operation(self):
        def worker():
            result = do_long_work()  # Opération longue
            self.queue.put(('result', result))

        thread = threading.Thread(target=worker, daemon=True)
        thread.start()

    def check_queue(self):
        try:
            while True:
                msg_type, data = self.queue.get_nowait()
                if msg_type == 'result':
                    self.update_ui(data)
        except queue.Empty:
            pass
        finally:
            self.root.after(100, self.check_queue)
```

### Pattern 2 : Progress Bar Tkinter
```python
from tkinter import ttk

class ProgressWindow:
    def __init__(self, parent):
        self.window = tk.Toplevel(parent)
        self.progress = ttk.Progressbar(self.window, mode='indeterminate')
        self.progress.pack()
        self.progress.start()

    def close(self):
        self.progress.stop()
        self.window.destroy()
```

### Pattern 3 : Electron IPC (Main ↔ Renderer)
```typescript
// Main process
ipcMain.handle('long-operation', async (event, args) => {
  const result = await doLongWork(args);
  return result;
});

// Renderer process
const result = await ipcRenderer.invoke('long-operation', { param: 'value' });
```

---

## 🖥️ Checklist Desktop App

- [ ] Opérations longues sur threads séparés
- [ ] Feedback visuel (progress, spinner)
- [ ] Gestion erreurs UI (try/catch + dialog)
- [ ] Logs dans fichier (pas console)
- [ ] Auto-update mechanism
- [ ] Crash reporting (Sentry)
- [ ] Tray icon pour apps background
- [ ] Keyboard shortcuts documentés
- [ ] Responsive UI (resize, full screen)
- [ ] Cross-platform tested (Windows, Mac, Linux)

---

## 🔗 Voir Aussi

- [performance.md](performance.md) - Optimisations performance
- Projects: [Hibiki-Dictate](../../../Hibiki-Dictate/)
- Projects: [Ermite-Podcaster](../../../Ermite-Podcaster/)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
