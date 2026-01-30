"""
Unit tests for Tasks CRUD endpoints
Coverage target: ≥ 80%
"""
import pytest
from datetime import datetime, timezone


class TestTasksCreate:
    """Tests for POST /tasks/"""

    def test_create_task_minimal(self, client, auth_headers):
        """Test creating a task with minimal required fields"""
        response = client.post(
            "/tasks/",
            json={"title": "Test Task"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["completed"] is False
        assert data["priority"] == "p3"  # default
        assert data["user_id"] == "test-user-123"
        assert "id" in data
        assert data["id"].startswith("task-")

    def test_create_task_full(self, client, auth_headers):
        """Test creating a task with all fields"""
        response = client.post(
            "/tasks/",
            json={
                "title": "Complex Task",
                "description": "Task description",
                "priority": "p0",
                "is_daily_task": True,
                "difficulty_level": "complex",
                "order": 5,
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Complex Task"
        assert data["description"] == "Task description"
        assert data["priority"] == "p0"
        assert data["is_daily_task"] is True
        assert data["difficulty_level"] == "complex"
        assert data["order"] == 5

    def test_create_task_invalid_priority(self, client, auth_headers):
        """Test creating task with invalid priority"""
        response = client.post(
            "/tasks/",
            json={"title": "Test Task", "priority": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

    def test_create_task_invalid_difficulty(self, client, auth_headers):
        """Test creating task with invalid difficulty level"""
        response = client.post(
            "/tasks/",
            json={"title": "Test Task", "difficulty_level": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

    def test_create_task_no_auth(self, client):
        """Test creating task without authentication"""
        response = client.post(
            "/tasks/",
            json={"title": "Test Task"},
        )
        assert response.status_code == 401  # Unauthorized


class TestTasksList:
    """Tests for GET /tasks/"""

    def test_list_tasks_empty(self, client, auth_headers):
        """Test listing tasks when none exist"""
        response = client.get("/tasks/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_tasks(self, client, auth_headers):
        """Test listing all tasks for user"""
        # Create test tasks
        client.post("/tasks/", json={"title": "Task 1", "priority": "p0"}, headers=auth_headers)
        client.post("/tasks/", json={"title": "Task 2", "priority": "p2"}, headers=auth_headers)
        client.post("/tasks/", json={"title": "Task 3", "priority": "p1"}, headers=auth_headers)

        response = client.get("/tasks/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Tasks should be ordered by order field, then created_at desc
        assert all("id" in task for task in data)

    def test_list_tasks_filter_completed(self, client, auth_headers):
        """Test filtering tasks by completion status"""
        # Create completed and incomplete tasks
        task1 = client.post("/tasks/", json={"title": "Task 1"}, headers=auth_headers).json()
        client.post("/tasks/", json={"title": "Task 2"}, headers=auth_headers)
        client.put(f"/tasks/{task1['id']}", json={"completed": True}, headers=auth_headers)

        response = client.get("/tasks/?completed=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["completed"] is True

        response = client.get("/tasks/?completed=false", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["completed"] is False

    def test_list_tasks_filter_by_project(self, client, auth_headers):
        """Test filtering tasks by project_id"""
        # Create project
        project = client.post(
            "/projects/",
            json={"name": "Test Project"},
            headers=auth_headers,
        ).json()

        # Create tasks (one with project, one without)
        client.post("/tasks/", json={"title": "Task 1", "project_id": project["id"]}, headers=auth_headers)
        client.post("/tasks/", json={"title": "Task 2"}, headers=auth_headers)

        response = client.get(f"/tasks/?project_id={project['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["project_id"] == project["id"]

    def test_list_tasks_isolation(self, client):
        """Test that users only see their own tasks"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        client.post("/tasks/", json={"title": "User 1 Task"}, headers=headers1)
        client.post("/tasks/", json={"title": "User 2 Task"}, headers=headers2)

        response = client.get("/tasks/", headers=headers1)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["user_id"] == "user-1"


class TestTasksGet:
    """Tests for GET /tasks/{task_id}"""

    def test_get_task(self, client, auth_headers):
        """Test retrieving a single task"""
        task = client.post("/tasks/", json={"title": "Test Task"}, headers=auth_headers).json()

        response = client.get(f"/tasks/{task['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task["id"]
        assert data["title"] == "Test Task"

    def test_get_task_not_found(self, client, auth_headers):
        """Test retrieving non-existent task"""
        response = client.get("/tasks/invalid-id", headers=auth_headers)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_task_wrong_user(self, client):
        """Test retrieving task owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        task = client.post("/tasks/", json={"title": "User 1 Task"}, headers=headers1).json()

        response = client.get(f"/tasks/{task['id']}", headers=headers2)
        assert response.status_code == 404  # Not found (user doesn't own it)


class TestTasksUpdate:
    """Tests for PUT /tasks/{task_id}"""

    def test_update_task_single_field(self, client, auth_headers):
        """Test updating a single field"""
        task = client.post("/tasks/", json={"title": "Original Title"}, headers=auth_headers).json()

        response = client.put(
            f"/tasks/{task['id']}",
            json={"title": "Updated Title"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["id"] == task["id"]

    def test_update_task_multiple_fields(self, client, auth_headers):
        """Test updating multiple fields"""
        task = client.post("/tasks/", json={"title": "Task"}, headers=auth_headers).json()

        response = client.put(
            f"/tasks/{task['id']}",
            json={
                "title": "Updated Task",
                "completed": True,
                "priority": "p0",
                "description": "New description",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task"
        assert data["completed"] is True
        assert data["priority"] == "p0"
        assert data["description"] == "New description"

    def test_update_task_not_found(self, client, auth_headers):
        """Test updating non-existent task"""
        response = client.put(
            "/tasks/invalid-id",
            json={"title": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_task_wrong_user(self, client):
        """Test updating task owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        task = client.post("/tasks/", json={"title": "User 1 Task"}, headers=headers1).json()

        response = client.put(
            f"/tasks/{task['id']}",
            json={"title": "Hacked"},
            headers=headers2,
        )
        assert response.status_code == 404  # Not found (user doesn't own it)

    def test_update_task_invalid_data(self, client, auth_headers):
        """Test updating with invalid data"""
        task = client.post("/tasks/", json={"title": "Task"}, headers=auth_headers).json()

        response = client.put(
            f"/tasks/{task['id']}",
            json={"priority": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error


class TestTasksDelete:
    """Tests for DELETE /tasks/{task_id}"""

    def test_delete_task(self, client, auth_headers):
        """Test deleting a task"""
        task = client.post("/tasks/", json={"title": "Task to delete"}, headers=auth_headers).json()

        response = client.delete(f"/tasks/{task['id']}", headers=auth_headers)
        assert response.status_code == 204

        # Verify task is deleted
        response = client.get(f"/tasks/{task['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_task_not_found(self, client, auth_headers):
        """Test deleting non-existent task"""
        response = client.delete("/tasks/invalid-id", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_task_wrong_user(self, client):
        """Test deleting task owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        task = client.post("/tasks/", json={"title": "User 1 Task"}, headers=headers1).json()

        response = client.delete(f"/tasks/{task['id']}", headers=headers2)
        assert response.status_code == 404  # Not found (user doesn't own it)

        # Verify task still exists for original user
        response = client.get(f"/tasks/{task['id']}", headers=headers1)
        assert response.status_code == 200


class TestTasksEdgeCases:
    """Edge cases and integration tests"""

    def test_task_with_project_link(self, client, auth_headers):
        """Test creating task linked to project"""
        project = client.post(
            "/projects/",
            json={"name": "Test Project"},
            headers=auth_headers,
        ).json()

        task = client.post(
            "/tasks/",
            json={"title": "Project Task", "project_id": project["id"]},
            headers=auth_headers,
        ).json()

        assert task["project_id"] == project["id"]

        # Verify task shows in project filter
        response = client.get(f"/tasks/?project_id={project['id']}", headers=auth_headers)
        assert len(response.json()) == 1

    def test_task_timestamps(self, client, auth_headers):
        """Test created_at and updated_at timestamps"""
        task = client.post("/tasks/", json={"title": "Task"}, headers=auth_headers).json()

        created_at = datetime.fromisoformat(task["created_at"].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(task["updated_at"].replace("Z", "+00:00"))

        # Allow small time difference (< 1 second) due to timestamp precision
        time_diff = abs((updated_at - created_at).total_seconds())
        assert time_diff < 1.0  # Should be nearly same on creation

        # Update task
        import time
        time.sleep(0.1)  # Small delay to ensure different timestamp
        updated_task = client.put(
            f"/tasks/{task['id']}",
            json={"title": "Updated"},
            headers=auth_headers,
        ).json()

        new_updated_at = datetime.fromisoformat(updated_task["updated_at"].replace("Z", "+00:00"))
        assert new_updated_at > updated_at  # updated_at should be newer

    def test_task_long_title(self, client, auth_headers):
        """Test task with maximum length title"""
        long_title = "A" * 500  # Max length is 500
        response = client.post(
            "/tasks/",
            json={"title": long_title},
            headers=auth_headers,
        )
        assert response.status_code == 201

        # Test exceeding max length
        too_long_title = "A" * 501
        response = client.post(
            "/tasks/",
            json={"title": too_long_title},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error
