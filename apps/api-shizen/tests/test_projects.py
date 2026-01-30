"""
Unit tests for Projects CRUD endpoints
Coverage target: ≥ 80%
"""
import pytest
from datetime import datetime


class TestProjectsCreate:
    """Tests for POST /projects/"""

    def test_create_project_minimal(self, client, auth_headers):
        """Test creating a project with minimal required fields"""
        response = client.post(
            "/projects/",
            json={"name": "Test Project"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Project"
        assert data["color"] == "#6366f1"  # default indigo
        assert data["status"] == "active"  # default
        assert data["user_id"] == "test-user-123"
        assert "id" in data
        assert data["id"].startswith("project-")

    def test_create_project_full(self, client, auth_headers):
        """Test creating a project with all fields"""
        response = client.post(
            "/projects/",
            json={
                "name": "Full Project",
                "description": "Project description",
                "color": "#ff0000",
                "icon": "rocket",
                "status": "active",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Full Project"
        assert data["description"] == "Project description"
        assert data["color"] == "#ff0000"
        assert data["icon"] == "rocket"
        assert data["status"] == "active"

    def test_create_project_invalid_color(self, client, auth_headers):
        """Test creating project with invalid hex color"""
        response = client.post(
            "/projects/",
            json={"name": "Test Project", "color": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

        # Test invalid hex format
        response = client.post(
            "/projects/",
            json={"name": "Test Project", "color": "#ZZZZZZ"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_create_project_invalid_status(self, client, auth_headers):
        """Test creating project with invalid status"""
        response = client.post(
            "/projects/",
            json={"name": "Test Project", "status": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

    def test_create_project_no_auth(self, client):
        """Test creating project without authentication"""
        response = client.post(
            "/projects/",
            json={"name": "Test Project"},
        )
        assert response.status_code == 401  # Unauthorized


class TestProjectsList:
    """Tests for GET /projects/"""

    def test_list_projects_empty(self, client, auth_headers):
        """Test listing projects when none exist"""
        response = client.get("/projects/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_projects(self, client, auth_headers):
        """Test listing all projects for user"""
        # Create test projects
        client.post("/projects/", json={"name": "Project 1"}, headers=auth_headers)
        client.post("/projects/", json={"name": "Project 2"}, headers=auth_headers)
        client.post("/projects/", json={"name": "Project 3"}, headers=auth_headers)

        response = client.get("/projects/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Projects should be ordered by created_at desc
        assert all("id" in project for project in data)

    def test_list_projects_filter_by_status(self, client, auth_headers):
        """Test filtering projects by status"""
        # Create projects with different statuses
        client.post("/projects/", json={"name": "Active Project", "status": "active"}, headers=auth_headers)
        client.post("/projects/", json={"name": "Completed Project", "status": "completed"}, headers=auth_headers)
        client.post("/projects/", json={"name": "Archived Project", "status": "archived"}, headers=auth_headers)

        # Filter by active
        response = client.get("/projects/?status_filter=active", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "active"

        # Filter by completed
        response = client.get("/projects/?status_filter=completed", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "completed"

    def test_list_projects_isolation(self, client):
        """Test that users only see their own projects"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        client.post("/projects/", json={"name": "User 1 Project"}, headers=headers1)
        client.post("/projects/", json={"name": "User 2 Project"}, headers=headers2)

        response = client.get("/projects/", headers=headers1)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["user_id"] == "user-1"


class TestProjectsGet:
    """Tests for GET /projects/{project_id}"""

    def test_get_project(self, client, auth_headers):
        """Test retrieving a single project"""
        project = client.post(
            "/projects/",
            json={"name": "Test Project"},
            headers=auth_headers,
        ).json()

        response = client.get(f"/projects/{project['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project["id"]
        assert data["name"] == "Test Project"

    def test_get_project_not_found(self, client, auth_headers):
        """Test retrieving non-existent project"""
        response = client.get("/projects/invalid-id", headers=auth_headers)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_project_wrong_user(self, client):
        """Test retrieving project owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        project = client.post(
            "/projects/",
            json={"name": "User 1 Project"},
            headers=headers1,
        ).json()

        response = client.get(f"/projects/{project['id']}", headers=headers2)
        assert response.status_code == 404  # Not found (user doesn't own it)


class TestProjectsUpdate:
    """Tests for PUT /projects/{project_id}"""

    def test_update_project_single_field(self, client, auth_headers):
        """Test updating a single field"""
        project = client.post(
            "/projects/",
            json={"name": "Original Name"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/projects/{project['id']}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["id"] == project["id"]

    def test_update_project_multiple_fields(self, client, auth_headers):
        """Test updating multiple fields"""
        project = client.post(
            "/projects/",
            json={"name": "Project"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/projects/{project['id']}",
            json={
                "name": "Updated Project",
                "description": "New description",
                "color": "#00ff00",
                "icon": "star",
                "status": "completed",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project"
        assert data["description"] == "New description"
        assert data["color"] == "#00ff00"
        assert data["icon"] == "star"
        assert data["status"] == "completed"

    def test_update_project_not_found(self, client, auth_headers):
        """Test updating non-existent project"""
        response = client.put(
            "/projects/invalid-id",
            json={"name": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_project_wrong_user(self, client):
        """Test updating project owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        project = client.post(
            "/projects/",
            json={"name": "User 1 Project"},
            headers=headers1,
        ).json()

        response = client.put(
            f"/projects/{project['id']}",
            json={"name": "Hacked"},
            headers=headers2,
        )
        assert response.status_code == 404  # Not found (user doesn't own it)

    def test_update_project_invalid_data(self, client, auth_headers):
        """Test updating with invalid data"""
        project = client.post(
            "/projects/",
            json={"name": "Project"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/projects/{project['id']}",
            json={"status": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error


class TestProjectsDelete:
    """Tests for DELETE /projects/{project_id}"""

    def test_delete_project(self, client, auth_headers):
        """Test deleting a project"""
        project = client.post(
            "/projects/",
            json={"name": "Project to delete"},
            headers=auth_headers,
        ).json()

        response = client.delete(f"/projects/{project['id']}", headers=auth_headers)
        assert response.status_code == 204

        # Verify project is deleted
        response = client.get(f"/projects/{project['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_project_not_found(self, client, auth_headers):
        """Test deleting non-existent project"""
        response = client.delete("/projects/invalid-id", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_project_wrong_user(self, client):
        """Test deleting project owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        project = client.post(
            "/projects/",
            json={"name": "User 1 Project"},
            headers=headers1,
        ).json()

        response = client.delete(f"/projects/{project['id']}", headers=headers2)
        assert response.status_code == 404  # Not found (user doesn't own it)

        # Verify project still exists for original user
        response = client.get(f"/projects/{project['id']}", headers=headers1)
        assert response.status_code == 200

    def test_delete_project_cascades_tasks(self, client, auth_headers):
        """Test that deleting project also deletes associated tasks"""
        # Create project
        project = client.post(
            "/projects/",
            json={"name": "Project with tasks"},
            headers=auth_headers,
        ).json()

        # Create tasks linked to project
        task1 = client.post(
            "/tasks/",
            json={"title": "Task 1", "project_id": project["id"]},
            headers=auth_headers,
        ).json()
        task2 = client.post(
            "/tasks/",
            json={"title": "Task 2", "project_id": project["id"]},
            headers=auth_headers,
        ).json()

        # Delete project
        response = client.delete(f"/projects/{project['id']}", headers=auth_headers)
        assert response.status_code == 204

        # Verify tasks are also deleted (cascade delete)
        response = client.get(f"/tasks/{task1['id']}", headers=auth_headers)
        assert response.status_code == 404
        response = client.get(f"/tasks/{task2['id']}", headers=auth_headers)
        assert response.status_code == 404


class TestProjectsEdgeCases:
    """Edge cases and integration tests"""

    def test_project_timestamps(self, client, auth_headers):
        """Test created_at and updated_at timestamps"""
        project = client.post(
            "/projects/",
            json={"name": "Project"},
            headers=auth_headers,
        ).json()

        created_at = datetime.fromisoformat(project["created_at"].replace("Z", "+00:00"))
        updated_at = datetime.fromisoformat(project["updated_at"].replace("Z", "+00:00"))

        # Allow small time difference (< 1 second) due to timestamp precision
        time_diff = abs((updated_at - created_at).total_seconds())
        assert time_diff < 1.0  # Should be nearly same on creation

        # Update project
        import time
        time.sleep(0.1)  # Small delay to ensure different timestamp
        updated_project = client.put(
            f"/projects/{project['id']}",
            json={"name": "Updated"},
            headers=auth_headers,
        ).json()

        new_updated_at = datetime.fromisoformat(updated_project["updated_at"].replace("Z", "+00:00"))
        assert new_updated_at > updated_at  # updated_at should be newer

    def test_project_long_name(self, client, auth_headers):
        """Test project with maximum length name"""
        long_name = "A" * 200  # Max length is 200
        response = client.post(
            "/projects/",
            json={"name": long_name},
            headers=auth_headers,
        )
        assert response.status_code == 201

        # Test exceeding max length
        too_long_name = "A" * 201
        response = client.post(
            "/projects/",
            json={"name": too_long_name},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

    def test_project_with_multiple_tasks(self, client, auth_headers):
        """Test project with multiple tasks"""
        # Create project
        project = client.post(
            "/projects/",
            json={"name": "Project with tasks"},
            headers=auth_headers,
        ).json()

        # Create multiple tasks
        for i in range(5):
            client.post(
                "/tasks/",
                json={"title": f"Task {i+1}", "project_id": project["id"]},
                headers=auth_headers,
            )

        # Verify tasks are linked to project
        response = client.get(f"/tasks/?project_id={project['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 5

    def test_project_status_transitions(self, client, auth_headers):
        """Test transitioning project through different statuses"""
        project = client.post(
            "/projects/",
            json={"name": "Project", "status": "active"},
            headers=auth_headers,
        ).json()

        # Transition to completed
        response = client.put(
            f"/projects/{project['id']}",
            json={"status": "completed"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

        # Transition to archived
        response = client.put(
            f"/projects/{project['id']}",
            json={"status": "archived"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "archived"

    def test_project_color_variations(self, client, auth_headers):
        """Test valid hex color variations"""
        valid_colors = ["#000000", "#FFFFFF", "#ff00ff", "#123ABC"]

        for color in valid_colors:
            response = client.post(
                "/projects/",
                json={"name": f"Project {color}", "color": color},
                headers=auth_headers,
            )
            assert response.status_code == 201
            assert response.json()["color"].lower() == color.lower()
