# Journals & Rituals API Documentation

**Service**: Shinkofa Shizen-Planner API
**Base URL**: `http://localhost:8001` (dev) | `https://alpha.shinkofa.com` (prod)
**Authentication**: JWT Token (production) or `X-User-ID` header (dev/alpha)

---

## Daily Journals Endpoints

Daily journals track energy levels, intentions, gratitudes, successes, learning, and adjustments. **Energy tracking is integrated into daily journals** (morning and evening energy levels 0-10).

### Create Journal
```http
POST /journals/
Content-Type: application/json
X-User-ID: {user_id}

{
  "date": "2026-01-07",                                    // Required (YYYY-MM-DD)
  "energy_morning": 8,                                     // Optional (0-10, default: 5)
  "energy_evening": 7,                                     // Optional (0-10, default: 5)
  "intentions": "Complete goals/energy endpoints",         // Optional
  "gratitudes": ["Test success", "Good progress", "Learning"],  // Optional (array of 3 strings)
  "successes": ["Finished tasks", "Tests passing", "Documentation"],  // Optional (array of 3 strings)
  "learning": "Learned about energy tracking",             // Optional
  "adjustments": "Need more breaks"                        // Optional
}
```

**Response** `201 Created`: Journal object with `id` and `user_id`
**Error** `400 Bad Request`: Journal for this date already exists (one journal per day per user)
**Error** `422 Validation Error`: Invalid energy values (must be 0-10)

---

### List Journals
```http
GET /journals/
X-User-ID: {user_id}

Query Parameters:
- limit: int (default: 30) - Maximum number of journals to return
```

**Response** `200 OK`: Array of journals ordered by date DESC (most recent first)

---

### Get Journal by Date
```http
GET /journals/date/{date}
X-User-ID: {user_id}

Path Parameters:
- date: YYYY-MM-DD format
```

**Response** `200 OK`: Single journal object for the specified date
**Response** `404 Not Found`: No journal found for this date

---

### Get Journal by ID
```http
GET /journals/{journal_id}
X-User-ID: {user_id}
```

**Response** `200 OK`: Single journal object
**Response** `404 Not Found`: Journal not found

---

### Update Journal
```http
PUT /journals/{journal_id}
Content-Type: application/json
X-User-ID: {user_id}

{
  "energy_evening": 9,           // Any field is optional (partial update)
  "learning": "New insight",
  "adjustments": "Tomorrow plan"
}
```

**Response** `200 OK`: Updated journal object
**Response** `404 Not Found`: Journal not found

---

### Delete Journal
```http
DELETE /journals/{journal_id}
X-User-ID: {user_id}
```

**Response** `204 No Content`: Journal deleted successfully
**Response** `404 Not Found`: Journal not found

---

## Rituals Endpoints

Rituals are daily habits to track completion. Categories: `morning`, `evening`, `daily`, `custom`.

### Create Ritual
```http
POST /rituals/
Content-Type: application/json
X-User-ID: {user_id}

{
  "label": "Morning meditation",           // Required (1-200 chars)
  "icon": "🧘",                            // Optional (default: "✅")
  "completed": false,                      // Optional (default: false)
  "category": "morning",                   // Optional (morning|evening|daily|custom, default: custom)
  "order": 1                               // Optional (display order, default: 0)
}
```

**Response** `201 Created`: Ritual object with `id` and `user_id`
**Error** `422 Validation Error`: Invalid category

---

### List Rituals
```http
GET /rituals/
X-User-ID: {user_id}

Query Parameters:
- category: string (morning|evening|daily|custom) - Filter by category
```

**Response** `200 OK`: Array of rituals ordered by `order` ASC, then `label` ASC

---

### Get Single Ritual
```http
GET /rituals/{ritual_id}
X-User-ID: {user_id}
```

**Response** `200 OK`: Single ritual object
**Response** `404 Not Found`: Ritual not found

---

### Update Ritual
```http
PUT /rituals/{ritual_id}
Content-Type: application/json
X-User-ID: {user_id}

{
  "completed": true,        // Any field is optional (partial update)
  "icon": "🌟"
}
```

**Response** `200 OK`: Updated ritual object
**Response** `404 Not Found`: Ritual not found

---

### Delete Ritual
```http
DELETE /rituals/{ritual_id}
X-User-ID: {user_id}
```

**Response** `204 No Content`: Ritual deleted successfully
**Response** `404 Not Found`: Ritual not found

---

### Reset All Rituals (Bonus Feature)
```http
POST /rituals/reset
X-User-ID: {user_id}
```

**Response** `200 OK`: `{"message": "All rituals reset successfully"}`

**Use case**: Reset all rituals to `completed: false` at the end of the day for the next day.

---

## Data Models

### Energy Levels
- **Scale**: 0-10 (integer)
- **0**: Exhausted, no energy
- **5**: Normal, average energy (default)
- **10**: Maximum energy, peak performance

Tracked **twice per day**:
- `energy_morning`: Energy level in the morning
- `energy_evening`: Energy level in the evening

### Ritual Categories
- `morning`: Morning routines (meditation, exercise, breakfast)
- `evening`: Evening routines (review, planning, relaxation)
- `daily`: Throughout the day (water intake, breaks)
- `custom`: User-defined category

---

## Example Usage

### Daily Workflow with Journals and Rituals

#### Morning Routine
```bash
# 1. Check morning rituals
curl "http://localhost:8001/rituals/?category=morning" \
  -H "X-User-ID: jay"

# 2. Create today's journal with morning energy
curl -X POST "http://localhost:8001/journals/" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{
    "date": "2026-01-07",
    "energy_morning": 7,
    "intentions": "Focus on completing API endpoints"
  }'

# 3. Complete morning rituals
curl -X PUT "http://localhost:8001/rituals/ritual-123" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{"completed": true}'
```

#### Evening Reflection
```bash
# 1. Update journal with evening energy and reflections
curl -X PUT "http://localhost:8001/journals/journal-abc-123" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{
    "energy_evening": 6,
    "gratitudes": ["Productive session", "Tests passing", "Good progress"],
    "successes": ["Completed Journals/Rituals", "52 tests passing", "Documentation"],
    "learning": "Energy tracking helps identify patterns",
    "adjustments": "Schedule more breaks tomorrow"
  }'

# 2. Reset rituals for next day
curl -X POST "http://localhost:8001/rituals/reset" \
  -H "X-User-ID: jay"
```

### Energy Tracking Analysis
```bash
# Get last 7 days of journals to analyze energy patterns
curl "http://localhost:8001/journals/?limit=7" \
  -H "X-User-ID: jay"

# Returns array with energy_morning and energy_evening for trend analysis
```

---

## Testing

Tests located in `tests/test_journals.py` and `tests/test_rituals.py`

```bash
# Run tests
pytest tests/test_journals.py tests/test_rituals.py -v

# Run with coverage
pytest tests/ --cov=app/routes/journals --cov=app/routes/rituals --cov-report=html

# Results: 52/52 tests passing ✅
# - 25 tests for Journals (including energy tracking)
# - 27 tests for Rituals (including reset feature)
```

**Test Coverage**:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Validation (energy 0-10, categories, date uniqueness)
- ✅ Filters (category, limit, date)
- ✅ User isolation (data security)
- ✅ Edge cases (arrays, ordering, daily workflows)
- ✅ Bonus features (reset rituals, get by date)

---

## Common Patterns

### Track Energy Over Time
```javascript
// Fetch journals and extract energy data
const journals = await fetch('/journals/?limit=30', {
  headers: {'X-User-ID': userId}
}).then(r => r.json());

const energyData = journals.map(j => ({
  date: j.date,
  morning: j.energy_morning,
  evening: j.energy_evening,
  average: (j.energy_morning + j.energy_evening) / 2
}));

// Analyze patterns
const avgMorning = energyData.reduce((sum, d) => sum + d.morning, 0) / energyData.length;
const avgEvening = energyData.reduce((sum, d) => sum + d.evening, 0) / energyData.length;
```

### Daily Ritual Completion Rate
```javascript
// Track ritual completion
const rituals = await fetch('/rituals/', {
  headers: {'X-User-ID': userId}
}).then(r => r.json());

const completionRate = rituals.filter(r => r.completed).length / rituals.length * 100;
console.log(`Today's completion: ${completionRate}%`);
```

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Test Coverage**: 52/52 tests passing (100%)
