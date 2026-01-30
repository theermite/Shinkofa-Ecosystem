"""
Unit tests for Rituals CRUD endpoints
Coverage target: ≥ 80%
"""
import pytest


class TestRitualsCreate:
    """Tests for POST /rituals/"""

    def test_create_ritual_minimal(self, client, auth_headers):
        """Test creating ritual with minimal required fields"""
        response = client.post(
            "/rituals/",
            json={"label": "Morning meditation"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["label"] == "Morning meditation"
        assert data["icon"] == "✅"  # default
        assert data["completed"] is False  # default
        assert data["category"] == "custom"  # default
        assert data["order"] == 0  # default
        assert data["user_id"] == "test-user-123"
        assert "id" in data
        assert data["id"].startswith("ritual-")

    def test_create_ritual_full(self, client, auth_headers):
        """Test creating ritual with all fields"""
        response = client.post(
            "/rituals/",
            json={
                "label": "Morning yoga",
                "icon": "🧘",
                "completed": False,
                "category": "morning",
                "order": 1,
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["label"] == "Morning yoga"
        assert data["icon"] == "🧘"
        assert data["category"] == "morning"
        assert data["order"] == 1

    def test_create_ritual_invalid_category(self, client, auth_headers):
        """Test creating ritual with invalid category"""
        response = client.post(
            "/rituals/",
            json={"label": "Test", "category": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

    def test_create_ritual_no_auth(self, client):
        """Test creating ritual without authentication"""
        response = client.post(
            "/rituals/",
            json={"label": "Test ritual"},
        )
        assert response.status_code == 401


class TestRitualsList:
    """Tests for GET /rituals/"""

    def test_list_rituals_empty(self, client, auth_headers):
        """Test listing rituals when none exist"""
        response = client.get("/rituals/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_rituals(self, client, auth_headers):
        """Test listing all rituals"""
        # Create test rituals
        client.post("/rituals/", json={"label": "Ritual 1", "order": 2}, headers=auth_headers)
        client.post("/rituals/", json={"label": "Ritual 2", "order": 1}, headers=auth_headers)
        client.post("/rituals/", json={"label": "Ritual 3", "order": 3}, headers=auth_headers)

        response = client.get("/rituals/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Should be ordered by order field, then label
        assert data[0]["order"] <= data[1]["order"]

    def test_list_rituals_filter_by_category(self, client, auth_headers):
        """Test filtering rituals by category"""
        # Create rituals with different categories
        client.post("/rituals/", json={"label": "Morning yoga", "category": "morning"}, headers=auth_headers)
        client.post("/rituals/", json={"label": "Evening review", "category": "evening"}, headers=auth_headers)
        client.post("/rituals/", json={"label": "Daily walk", "category": "daily"}, headers=auth_headers)

        response = client.get("/rituals/?category=morning", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "morning"

        response = client.get("/rituals/?category=evening", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "evening"

    def test_list_rituals_isolation(self, client):
        """Test that users only see their own rituals"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        client.post("/rituals/", json={"label": "User 1 Ritual"}, headers=headers1)
        client.post("/rituals/", json={"label": "User 2 Ritual"}, headers=headers2)

        response = client.get("/rituals/", headers=headers1)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["user_id"] == "user-1"


class TestRitualsGet:
    """Tests for GET /rituals/{ritual_id}"""

    def test_get_ritual(self, client, auth_headers):
        """Test retrieving a single ritual"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Test Ritual"},
            headers=auth_headers,
        ).json()

        response = client.get(f"/rituals/{ritual['id']}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == ritual["id"]
        assert data["label"] == "Test Ritual"

    def test_get_ritual_not_found(self, client, auth_headers):
        """Test retrieving non-existent ritual"""
        response = client.get("/rituals/invalid-id", headers=auth_headers)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_ritual_wrong_user(self, client):
        """Test retrieving ritual owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        ritual = client.post(
            "/rituals/",
            json={"label": "User 1 Ritual"},
            headers=headers1,
        ).json()

        response = client.get(f"/rituals/{ritual['id']}", headers=headers2)
        assert response.status_code == 404


class TestRitualsUpdate:
    """Tests for PUT /rituals/{ritual_id}"""

    def test_update_ritual_single_field(self, client, auth_headers):
        """Test updating a single field"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Original Label"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/rituals/{ritual['id']}",
            json={"label": "Updated Label"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Updated Label"
        assert data["id"] == ritual["id"]

    def test_update_ritual_completed(self, client, auth_headers):
        """Test marking ritual as completed"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Morning meditation", "completed": False},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/rituals/{ritual['id']}",
            json={"completed": True},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True

    def test_update_ritual_multiple_fields(self, client, auth_headers):
        """Test updating multiple fields"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Ritual"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/rituals/{ritual['id']}",
            json={
                "label": "Updated Ritual",
                "icon": "🌟",
                "completed": True,
                "category": "morning",
                "order": 5,
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "Updated Ritual"
        assert data["icon"] == "🌟"
        assert data["completed"] is True
        assert data["category"] == "morning"
        assert data["order"] == 5

    def test_update_ritual_not_found(self, client, auth_headers):
        """Test updating non-existent ritual"""
        response = client.put(
            "/rituals/invalid-id",
            json={"label": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_ritual_wrong_user(self, client):
        """Test updating ritual owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        ritual = client.post(
            "/rituals/",
            json={"label": "User 1 Ritual"},
            headers=headers1,
        ).json()

        response = client.put(
            f"/rituals/{ritual['id']}",
            json={"label": "Hacked"},
            headers=headers2,
        )
        assert response.status_code == 404

    def test_update_ritual_invalid_data(self, client, auth_headers):
        """Test updating with invalid data"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Ritual"},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/rituals/{ritual['id']}",
            json={"category": "invalid"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error


class TestRitualsDelete:
    """Tests for DELETE /rituals/{ritual_id}"""

    def test_delete_ritual(self, client, auth_headers):
        """Test deleting a ritual"""
        ritual = client.post(
            "/rituals/",
            json={"label": "Ritual to delete"},
            headers=auth_headers,
        ).json()

        response = client.delete(f"/rituals/{ritual['id']}", headers=auth_headers)
        assert response.status_code == 204

        # Verify ritual is deleted
        response = client.get(f"/rituals/{ritual['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_ritual_not_found(self, client, auth_headers):
        """Test deleting non-existent ritual"""
        response = client.delete("/rituals/invalid-id", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_ritual_wrong_user(self, client):
        """Test deleting ritual owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        ritual = client.post(
            "/rituals/",
            json={"label": "User 1 Ritual"},
            headers=headers1,
        ).json()

        response = client.delete(f"/rituals/{ritual['id']}", headers=headers2)
        assert response.status_code == 404

        # Verify ritual still exists for original user
        response = client.get(f"/rituals/{ritual['id']}", headers=headers1)
        assert response.status_code == 200


class TestRitualsReset:
    """Tests for POST /rituals/reset"""

    def test_reset_all_rituals(self, client, auth_headers):
        """Test resetting all rituals to not completed"""
        # Create rituals and mark some as completed
        ritual1 = client.post(
            "/rituals/",
            json={"label": "Ritual 1", "completed": True},
            headers=auth_headers,
        ).json()
        ritual2 = client.post(
            "/rituals/",
            json={"label": "Ritual 2", "completed": True},
            headers=auth_headers,
        ).json()
        ritual3 = client.post(
            "/rituals/",
            json={"label": "Ritual 3", "completed": False},
            headers=auth_headers,
        ).json()

        # Reset all rituals
        response = client.post("/rituals/reset", headers=auth_headers)
        assert response.status_code == 200
        assert "reset" in response.json()["message"].lower()

        # Verify all rituals are now not completed
        response = client.get("/rituals/", headers=auth_headers)
        data = response.json()
        assert len(data) == 3
        assert all(not ritual["completed"] for ritual in data)

    def test_reset_rituals_user_isolation(self, client):
        """Test that reset only affects current user's rituals"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}

        # Create rituals for both users, mark as completed
        client.post("/rituals/", json={"label": "User 1 Ritual", "completed": True}, headers=headers1)
        client.post("/rituals/", json={"label": "User 2 Ritual", "completed": True}, headers=headers2)

        # Reset user 1's rituals
        response = client.post("/rituals/reset", headers=headers1)
        assert response.status_code == 200

        # Verify user 1's ritual is reset
        response = client.get("/rituals/", headers=headers1)
        data = response.json()
        assert data[0]["completed"] is False

        # Verify user 2's ritual is still completed
        response = client.get("/rituals/", headers=headers2)
        data = response.json()
        assert data[0]["completed"] is True


class TestRitualsEdgeCases:
    """Edge cases and integration tests"""

    def test_ritual_categories(self, client, auth_headers):
        """Test all valid ritual categories"""
        categories = ["morning", "evening", "daily", "custom"]

        for category in categories:
            response = client.post(
                "/rituals/",
                json={"label": f"{category.capitalize()} Ritual", "category": category},
                headers=auth_headers,
            )
            assert response.status_code == 201
            assert response.json()["category"] == category

    def test_ritual_ordering(self, client, auth_headers):
        """Test ritual ordering"""
        # Create rituals with different orders
        client.post("/rituals/", json={"label": "Third", "order": 3}, headers=auth_headers)
        client.post("/rituals/", json={"label": "First", "order": 1}, headers=auth_headers)
        client.post("/rituals/", json={"label": "Second", "order": 2}, headers=auth_headers)

        response = client.get("/rituals/", headers=auth_headers)
        data = response.json()

        # Verify ordering
        assert data[0]["order"] == 1
        assert data[1]["order"] == 2
        assert data[2]["order"] == 3

    def test_ritual_icons(self, client, auth_headers):
        """Test ritual with various emoji icons"""
        icons = ["🧘", "📖", "🏃", "💤", "☕"]

        for icon in icons:
            response = client.post(
                "/rituals/",
                json={"label": f"Ritual {icon}", "icon": icon},
                headers=auth_headers,
            )
            assert response.status_code == 201
            assert response.json()["icon"] == icon

    def test_ritual_daily_workflow(self, client, auth_headers):
        """Test typical daily ritual workflow"""
        # Morning: Create morning rituals
        morning_rituals = [
            {"label": "Wake up at 6am", "icon": "⏰", "category": "morning", "order": 1},
            {"label": "Meditation", "icon": "🧘", "category": "morning", "order": 2},
            {"label": "Exercise", "icon": "🏃", "category": "morning", "order": 3},
        ]

        ritual_ids = []
        for ritual_data in morning_rituals:
            response = client.post("/rituals/", json=ritual_data, headers=auth_headers)
            ritual_ids.append(response.json()["id"])

        # Complete rituals throughout the day
        for ritual_id in ritual_ids:
            client.put(f"/rituals/{ritual_id}", json={"completed": True}, headers=auth_headers)

        # Verify all completed
        response = client.get("/rituals/?category=morning", headers=auth_headers)
        data = response.json()
        assert all(ritual["completed"] for ritual in data)

        # End of day: Reset for next day
        client.post("/rituals/reset", headers=auth_headers)

        # Verify all reset
        response = client.get("/rituals/?category=morning", headers=auth_headers)
        data = response.json()
        assert all(not ritual["completed"] for ritual in data)

    def test_ritual_long_label(self, client, auth_headers):
        """Test ritual with maximum length label"""
        long_label = "A" * 200  # Max length is 200
        response = client.post(
            "/rituals/",
            json={"label": long_label},
            headers=auth_headers,
        )
        assert response.status_code == 201

        # Test exceeding max length
        too_long_label = "A" * 201
        response = client.post(
            "/rituals/",
            json={"label": too_long_label},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error
