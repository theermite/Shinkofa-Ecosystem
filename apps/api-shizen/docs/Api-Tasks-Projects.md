# Tasks & Projects API Documentation

**Service**: Shinkofa Shizen-Planner API
**Base URL**: `http://localhost:8001` (dev) | `https://app.shinkofa.com` (prod)
**Authentication**: JWT Token (production) or `X-User-ID` header (dev)

---

## Tasks Endpoints

### Create Task
```http
POST /tasks/
Content-Type: application/json
X-User-ID: {user_id}

{
  "title": "Task title",                      // Required (1-500 chars)
  "description": "Task description",          // Optional
  "priority": "p0",                           // Optional (p0-p5, default: p3)
  "completed": false,                         // Optional (default: false)
  "due_date": "2026-01-15T10:00:00Z",        // Optional (ISO 8601)
  "project_id": "project-abc-123",           // Optional (link to project)
  "is_daily_task": true,                     // Optional (default: false)
  "difficulty_level": "complex",             // Optional (quick|medium|complex|long)
  "order": 0                                 // Optional (display order, default: 0)
}
```

**Response** `201 Created`:
```json
{
  "id": "task-d95d5767-e307-467b-89fb-38ebaa3a608e",
  "title": "Task title",
  "description": "Task description",
  "priority": "p0",
  "completed": false,
  "due_date": "2026-01-15T10:00:00Z",
  "project_id": "project-abc-123",
  "is_daily_task": true,
  "difficulty_level": "complex",
  "order": 0,
  "user_id": "user-123",
  "created_at": "2026-01-07T17:43:04.434040Z",
  "updated_at": "2026-01-07T17:43:04.434048Z"
}
```

---

### List Tasks
```http
GET /tasks/
X-User-ID: {user_id}

Query Parameters:
- completed: true|false (filter by completion status)
- project_id: string (filter by project)
```

**Response** `200 OK`:
```json
[
  {
    "id": "task-123",
    "title": "Task 1",
    ...
  },
  {
    "id": "task-456",
    "title": "Task 2",
    ...
  }
]
```

**Ordering**: Tasks ordered by `order` field (ASC), then `created_at` (DESC)

---

### Get Single Task
```http
GET /tasks/{task_id}
X-User-ID: {user_id}
```

**Response** `200 OK`: Single task object
**Response** `404 Not Found`: Task not found or doesn't belong to user

---

### Update Task
```http
PUT /tasks/{task_id}
Content-Type: application/json
X-User-ID: {user_id}

{
  "completed": true,           // Any field is optional (partial update)
  "priority": "p0"
}
```

**Response** `200 OK`: Updated task object
**Response** `404 Not Found`: Task not found
**Response** `422 Unprocessable Entity`: Validation error

---

### Delete Task
```http
DELETE /tasks/{task_id}
X-User-ID: {user_id}
```

**Response** `204 No Content`: Task deleted successfully
**Response** `404 Not Found`: Task not found

---

## Projects Endpoints

### Create Project
```http
POST /projects/
Content-Type: application/json
X-User-ID: {user_id}

{
  "name": "Project name",              // Required (1-200 chars)
  "description": "Project description", // Optional
  "color": "#6366f1",                  // Optional (hex color, default: #6366f1)
  "icon": "rocket",                    // Optional
  "status": "active"                   // Optional (active|completed|archived, default: active)
}
```

**Response** `201 Created`:
```json
{
  "id": "project-05afc398-9a17-45fe-88f3-9a2063cfe950",
  "name": "Project name",
  "description": "Project description",
  "color": "#6366f1",
  "icon": "rocket",
  "status": "active",
  "user_id": "user-123",
  "created_at": "2026-01-07T17:42:56.802955Z",
  "updated_at": "2026-01-07T17:42:56.802966Z"
}
```

---

### List Projects
```http
GET /projects/
X-User-ID: {user_id}

Query Parameters:
- status_filter: active|completed|archived (filter by status)
```

**Response** `200 OK`: Array of project objects
**Ordering**: Projects ordered by `created_at` (DESC)

---

### Get Single Project
```http
GET /projects/{project_id}
X-User-ID: {user_id}
```

**Response** `200 OK`: Single project object
**Response** `404 Not Found`: Project not found

---

### Update Project
```http
PUT /projects/{project_id}
Content-Type: application/json
X-User-ID: {user_id}

{
  "name": "Updated Project",     // Any field is optional (partial update)
  "status": "completed",
  "color": "#00ff00"
}
```

**Response** `200 OK`: Updated project object
**Response** `404 Not Found`: Project not found
**Response** `422 Unprocessable Entity`: Validation error

---

### Delete Project
```http
DELETE /projects/{project_id}
X-User-ID: {user_id}
```

**Response** `204 No Content`: Project deleted (cascade deletes associated tasks)
**Response** `404 Not Found`: Project not found

**Warning**: Deleting a project **cascades to all tasks** linked to it.

---

## Data Models

### Task Priority Levels
- `p0`: Critical (highest)
- `p1`: High
- `p2`: Medium-high
- `p3`: Normal (default)
- `p4`: Low
- `p5`: Lowest

### Task Difficulty Levels
- `quick`: < 30 min
- `medium`: 30 min - 2 hours
- `complex`: 2 hours - 1 day
- `long`: > 1 day

### Project Status
- `active`: Currently active (default)
- `completed`: Finished/accomplished
- `archived`: Archived (not shown by default)

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Task task-123 not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "priority"],
      "msg": "String does not match regex",
      "type": "value_error.str.regex"
    }
  ]
}
```

---

## Example Usage

### Create Project with Tasks
```bash
# 1. Create project
curl -X POST "http://localhost:8001/projects/" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{
    "name": "Shinkofa Platform",
    "description": "AI + Planner unified platform",
    "color": "#6366f1",
    "status": "active"
  }'

# Response: {"id":"project-abc-123",...}

# 2. Create tasks linked to project
curl -X POST "http://localhost:8001/tasks/" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{
    "title": "Implement CRUD Tasks",
    "project_id": "project-abc-123",
    "priority": "p0",
    "difficulty_level": "complex",
    "is_daily_task": true
  }'

# 3. List all tasks for project
curl "http://localhost:8001/tasks/?project_id=project-abc-123" \
  -H "X-User-ID: jay"
```

### Complete a Task
```bash
# Mark task as completed
curl -X PUT "http://localhost:8001/tasks/task-123" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: jay" \
  -d '{"completed": true}'
```

### Filter Completed Tasks
```bash
# Get all completed tasks
curl "http://localhost:8001/tasks/?completed=true" \
  -H "X-User-ID: jay"

# Get incomplete tasks
curl "http://localhost:8001/tasks/?completed=false" \
  -H "X-User-ID: jay"
```

---

## Testing

Tests located in `tests/test_tasks.py` and `tests/test_projects.py`

```bash
# Run tests
pytest tests/test_tasks.py tests/test_projects.py -v

# Run with coverage
pytest tests/ --cov=app/routes/tasks --cov=app/routes/projects --cov-report=html

# Results: 50/50 tests passing ✅
# - 24 tests for Tasks CRUD
# - 26 tests for Projects CRUD
```

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Test Coverage**: 50/50 tests passing (100%)
