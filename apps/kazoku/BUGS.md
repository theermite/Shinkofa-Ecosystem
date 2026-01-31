# BUGS À CORRIGER - Family Hub

**Date** : 2025-12-31
**Session** : Setup initial + développement MVP

---

## 🐛 BUGS CRITIQUES

### 1. ❌ **Encodage UTF-8 - Caractères accentués corrompus**

**Symptôme** :
- "ThÃ©o" affiché au lieu de "Théo"
- Tous les caractères accentués (é, è, à, ô, etc.) sont mal encodés

**Cause** :
- Connexion MySQL n'utilise pas UTF-8mb4 explicitement
- Les seeds.sql sont importés sans spécifier l'encodage

**Solution** :
```typescript
// backend/src/config/database.ts
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  charset: 'utf8mb4', // ← AJOUTER CETTE LIGNE
});

// Ou ajouter dans chaque requête :
await pool.query('SET NAMES utf8mb4');
```

**Alternative rapide** :
```sql
-- Réimporter seeds avec encodage correct
docker exec -i family_hub_mysql mysql -ufamily_hub_user -pfamily_hub_pass_2025 family_hub --default-character-set=utf8mb4 < database/seeds.sql
```

---

### 2. ❌ **Boutons CREATE ne semblent pas fonctionner**

**Symptôme** :
- Clic sur "Créer l'événement" → rien ne se passe visuellement
- Clic sur "Créer la tâche" → rien ne se passe visuellement
- Clic sur "Créer une liste" → rien ne se passe visuellement

**MAIS** : Les requêtes POST sont envoyées (visible dans logs backend)

**Cause probable** :
1. **Double-submit** : Requêtes envoyées 2 fois (logs montrent duplicatas)
2. **Erreur validation backend** non catchée par le frontend
3. **Modal ne se ferme pas** car `onSuccess` callback ne s'exécute pas

**Debug étape par étape** :

**A) Vérifier console navigateur** :
```
Ouvrir DevTools (F12) → Console
Chercher erreurs pendant le clic sur "Créer"
```

**B) Vérifier réponse backend** :
```
DevTools → Network → Filtrer "events" ou "tasks"
Cliquer sur la requête POST → Response tab
Voir si erreur 400/500 ou succès 201
```

**C) Ajouter logs frontend** :
```typescript
// Dans CalendarPage.tsx, TasksPage.tsx, ShoppingPage.tsx
const createMutation = useMutation({
  mutationFn: async (newItem) => {
    console.log('🚀 Sending:', newItem); // ← AJOUTER
    const response = await fetch(...);
    const data = await response.json();
    console.log('✅ Response:', data); // ← AJOUTER
    if (!response.ok) {
      console.error('❌ Error:', data); // ← AJOUTER
      throw new Error(data.message || 'Failed');
    }
    return data;
  },
  onSuccess: () => {
    console.log('✅ onSuccess called'); // ← AJOUTER
    queryClient.invalidateQueries(...);
    handleCloseModal();
  },
  onError: (error) => {
    console.error('❌ onError:', error); // ← AJOUTER
    alert('Erreur: ' + error.message); // Feedback visuel temporaire
  },
});
```

**D) Fix probable - Validation backend** :

Vérifier que les champs requis correspondent entre frontend et backend :
```typescript
// Frontend envoie :
{
  title: "...",
  start_time: "2025-01-01T10:00", // ← Format datetime-local
  end_time: "2025-01-01T11:00",
  category: "autre",
  color: "#4285f4"
}

// Backend attend peut-être :
{
  start_time: "2025-01-01 10:00:00", // ← Format MySQL
  // Ou datetime ISO complet avec timezone
}
```

**Solution** : Convertir format datetime avant envoi :
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Convertir datetime-local → MySQL datetime
  const payload = {
    ...formData,
    start_time: formData.start_time.replace('T', ' ') + ':00',
    end_time: formData.end_time.replace('T', ' ') + ':00',
  };

  createMutation.mutate(payload);
};
```

---

### 3. ❌ **Erreurs controllers backend (Crisis & Meals)**

**Symptôme logs** :
```
Error: Protocole de crise non trouvé
at getCrisisProtocolById
```
```
Error: Repas non trouvé
at getMealById
```

**Cause** :
- Routes appellent `getMealById` ou `getCrisisProtocolById` au lieu de `getAllMeals` / `getAllCrisis`
- Confusion entre route liste (GET /meals) et route détail (GET /meals/:id)

**Solution** :
```typescript
// backend/src/routes/crisis.routes.ts
router.get('/protocols', getAllCrisisProtocols); // ← Pas getCrisisProtocolById
router.get('/protocols/:id', getCrisisProtocolById);

// backend/src/routes/meal.routes.ts
router.get('/week', getMealsForWeek); // ← Pas getMealById
router.get('/:id', getMealById);
```

---

## 🔧 BUGS MINEURS

### 4. ⚠️ **Double-submit des requêtes**

**Symptôme** : Chaque POST apparaît 2 fois dans les logs

**Cause probable** :
- React StrictMode en développement (double-render intentionnel)
- Ou `useEffect` qui trigger 2 fois

**Solution** : Ignorer en dev, disparaîtra en production build

---

## 📋 VALIDATION AVANT PROCHAINE SESSION

**Checklist rapide** :
```bash
# 1. Tester encodage
curl http://localhost:5001/api/v1/tasks | grep -o "Th.o"
# Doit afficher "Théo" et non "ThÃ©o"

# 2. Tester création événement
curl -X POST http://localhost:5001/api/v1/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","start_time":"2025-01-01 10:00:00","end_time":"2025-01-01 11:00:00","category":"autre"}'
# Doit retourner 201 Created

# 3. Vérifier dans MySQL
docker exec -it family_hub_mysql mysql -ufamily_hub_user -pfamily_hub_pass_2025 family_hub -e "SELECT title FROM events WHERE title='Test';"
# Doit afficher le nouvel événement
```

---

**Prochaine session** : Corriger ces 3 bugs en priorité avant continuer nouvelles features.
