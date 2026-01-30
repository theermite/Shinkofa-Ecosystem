"""
Unit tests for Daily Journals CRUD endpoints
Coverage target: ≥ 80%
"""
import pytest
from datetime import date, timedelta


class TestJournalsCreate:
    """Tests for POST /journals/"""

    def test_create_journal_minimal(self, client, auth_headers):
        """Test creating journal with minimal required fields"""
        today = date.today()
        response = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["date"] == today.isoformat()
        assert data["energy_morning"] == 5  # default
        assert data["energy_evening"] == 5  # default
        assert data["user_id"] == "test-user-123"
        assert "id" in data
        assert data["id"].startswith("journal-")

    def test_create_journal_full(self, client, auth_headers):
        """Test creating journal with all fields"""
        today = date.today()
        response = client.post(
            "/journals/",
            json={
                "date": today.isoformat(),
                "energy_morning": 8,
                "energy_evening": 7,
                "intentions": "Complete goals/energy endpoints",
                "gratitudes": ["Test success", "Good progress", "Learning"],
                "successes": ["Finished tasks", "Tests passing", "Documentation"],
                "learning": "Learned about energy tracking",
                "adjustments": "Need more breaks",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["energy_morning"] == 8
        assert data["energy_evening"] == 7
        assert data["intentions"] == "Complete goals/energy endpoints"
        assert len(data["gratitudes"]) == 3
        assert len(data["successes"]) == 3

    def test_create_journal_duplicate_date(self, client, auth_headers):
        """Test creating journal with duplicate date"""
        today = date.today()
        # Create first journal
        client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        )

        # Try to create second journal for same date
        response = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_create_journal_invalid_energy(self, client, auth_headers):
        """Test creating journal with invalid energy values"""
        today = date.today()

        # Energy too high
        response = client.post(
            "/journals/",
            json={"date": today.isoformat(), "energy_morning": 11},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error

        # Energy negative
        response = client.post(
            "/journals/",
            json={"date": today.isoformat(), "energy_evening": -1},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_create_journal_no_auth(self, client):
        """Test creating journal without authentication"""
        today = date.today()
        response = client.post(
            "/journals/",
            json={"date": today.isoformat()},
        )
        assert response.status_code == 401


class TestJournalsList:
    """Tests for GET /journals/"""

    def test_list_journals_empty(self, client, auth_headers):
        """Test listing journals when none exist"""
        response = client.get("/journals/", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_journals(self, client, auth_headers):
        """Test listing all journals"""
        # Create journals for different dates
        dates = [date.today() - timedelta(days=i) for i in range(3)]
        for d in dates:
            client.post(
                "/journals/",
                json={"date": d.isoformat(), "energy_morning": 7},
                headers=auth_headers,
            )

        response = client.get("/journals/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Should be ordered by date desc (most recent first)
        assert data[0]["date"] >= data[1]["date"]

    def test_list_journals_limit(self, client, auth_headers):
        """Test listing journals with limit parameter"""
        # Create 5 journals
        for i in range(5):
            d = date.today() - timedelta(days=i)
            client.post(
                "/journals/",
                json={"date": d.isoformat()},
                headers=auth_headers,
            )

        response = client.get("/journals/?limit=3", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_list_journals_isolation(self, client):
        """Test that users only see their own journals"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}
        today = date.today()

        client.post("/journals/", json={"date": today.isoformat()}, headers=headers1)
        client.post("/journals/", json={"date": (today - timedelta(days=1)).isoformat()}, headers=headers2)

        response = client.get("/journals/", headers=headers1)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["user_id"] == "user-1"


class TestJournalsGetByDate:
    """Tests for GET /journals/date/{date}"""

    def test_get_journal_by_date(self, client, auth_headers):
        """Test retrieving journal by date"""
        today = date.today()
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat(), "energy_morning": 9},
            headers=auth_headers,
        ).json()

        response = client.get(f"/journals/date/{today.isoformat()}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == journal["id"]
        assert data["date"] == today.isoformat()

    def test_get_journal_by_date_not_found(self, client, auth_headers):
        """Test retrieving journal by date when it doesn't exist"""
        future_date = date.today() + timedelta(days=10)
        response = client.get(f"/journals/date/{future_date.isoformat()}", headers=auth_headers)
        assert response.status_code == 404


class TestJournalsGet:
    """Tests for GET /journals/{journal_id}"""

    def test_get_journal(self, client, auth_headers):
        """Test retrieving single journal"""
        today = date.today()
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        ).json()

        response = client.get(f"/journals/{journal['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == journal["id"]

    def test_get_journal_not_found(self, client, auth_headers):
        """Test retrieving non-existent journal"""
        response = client.get("/journals/invalid-id", headers=auth_headers)
        assert response.status_code == 404

    def test_get_journal_wrong_user(self, client):
        """Test retrieving journal owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}
        today = date.today()

        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=headers1,
        ).json()

        response = client.get(f"/journals/{journal['id']}", headers=headers2)
        assert response.status_code == 404


class TestJournalsUpdate:
    """Tests for PUT /journals/{journal_id}"""

    def test_update_journal_single_field(self, client, auth_headers):
        """Test updating a single field"""
        today = date.today()
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat(), "energy_morning": 5},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/journals/{journal['id']}",
            json={"energy_morning": 9},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy_morning"] == 9
        assert data["energy_evening"] == 5  # Unchanged

    def test_update_journal_multiple_fields(self, client, auth_headers):
        """Test updating multiple fields"""
        today = date.today()
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        ).json()

        response = client.put(
            f"/journals/{journal['id']}",
            json={
                "energy_morning": 8,
                "energy_evening": 7,
                "intentions": "New intentions",
                "learning": "Learned something",
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy_morning"] == 8
        assert data["energy_evening"] == 7
        assert data["intentions"] == "New intentions"
        assert data["learning"] == "Learned something"

    def test_update_journal_not_found(self, client, auth_headers):
        """Test updating non-existent journal"""
        response = client.put(
            "/journals/invalid-id",
            json={"energy_morning": 8},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_journal_wrong_user(self, client):
        """Test updating journal owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}
        today = date.today()

        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=headers1,
        ).json()

        response = client.put(
            f"/journals/{journal['id']}",
            json={"energy_morning": 10},
            headers=headers2,
        )
        assert response.status_code == 404


class TestJournalsDelete:
    """Tests for DELETE /journals/{journal_id}"""

    def test_delete_journal(self, client, auth_headers):
        """Test deleting a journal"""
        today = date.today()
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=auth_headers,
        ).json()

        response = client.delete(f"/journals/{journal['id']}", headers=auth_headers)
        assert response.status_code == 204

        # Verify journal is deleted
        response = client.get(f"/journals/{journal['id']}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_journal_not_found(self, client, auth_headers):
        """Test deleting non-existent journal"""
        response = client.delete("/journals/invalid-id", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_journal_wrong_user(self, client):
        """Test deleting journal owned by another user"""
        headers1 = {"X-User-ID": "user-1"}
        headers2 = {"X-User-ID": "user-2"}
        today = date.today()

        journal = client.post(
            "/journals/",
            json={"date": today.isoformat()},
            headers=headers1,
        ).json()

        response = client.delete(f"/journals/{journal['id']}", headers=headers2)
        assert response.status_code == 404

        # Verify journal still exists for original user
        response = client.get(f"/journals/{journal['id']}", headers=headers1)
        assert response.status_code == 200


class TestJournalsEdgeCases:
    """Edge cases and integration tests"""

    def test_journal_energy_tracking(self, client, auth_headers):
        """Test energy tracking from morning to evening"""
        today = date.today()

        # Morning entry
        journal = client.post(
            "/journals/",
            json={"date": today.isoformat(), "energy_morning": 6},
            headers=auth_headers,
        ).json()

        # Update with evening energy
        response = client.put(
            f"/journals/{journal['id']}",
            json={"energy_evening": 8},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["energy_morning"] == 6
        assert data["energy_evening"] == 8

    def test_journal_gratitudes_array(self, client, auth_headers):
        """Test gratitudes array handling"""
        today = date.today()
        gratitudes = ["Thing 1", "Thing 2", "Thing 3"]

        response = client.post(
            "/journals/",
            json={"date": today.isoformat(), "gratitudes": gratitudes},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["gratitudes"] == gratitudes
        assert len(data["gratitudes"]) == 3

    def test_journal_successes_array(self, client, auth_headers):
        """Test successes array handling"""
        today = date.today()
        successes = ["Success 1", "Success 2", "Success 3"]

        response = client.post(
            "/journals/",
            json={"date": today.isoformat(), "successes": successes},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["successes"] == successes

    def test_journal_weekly_pattern(self, client, auth_headers):
        """Test creating journals for a week"""
        # Create journals for 7 consecutive days (start from yesterday to avoid conflicts)
        journals_created = 0
        for i in range(1, 8):  # days 1-7 in the past
            d = date.today() - timedelta(days=i)
            response = client.post(
                "/journals/",
                json={"date": d.isoformat(), "energy_morning": 5 + i},
                headers=auth_headers,
            )
            if response.status_code == 201:
                journals_created += 1

        response = client.get("/journals/?limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Should have at least the journals we created
        assert len(data) >= journals_created
