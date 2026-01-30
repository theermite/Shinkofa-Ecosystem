"""
Test API persistence - Quick test script
"""
import requests
import psycopg

# Test 1: Create session via API
response = requests.post(
    "http://localhost:8001/questionnaire/start",
    json={
        "user_id": "test-script-persistence-001",
        "full_name": "Test Script Persistence"
    }
)

print(f"API Response Status: {response.status_code}")
print(f"API Response Body: {response.json()}")

# Test 2: Check database directly
conn = psycopg.connect("postgresql://dev:dev@localhost:5432/shinkofa_shizen_planner_dev")
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM questionnaire_sessions WHERE user_id = 'test-script-persistence-001';")
count = cursor.fetchone()[0]

print(f"\nDatabase Check:")
print(f"Rows with user_id 'test-script-persistence-001': {count}")

cursor.execute("SELECT user_id, full_name FROM questionnaire_sessions ORDER BY started_at DESC LIMIT 5;")
rows = cursor.fetchall()

print(f"\nAll recent sessions in DB:")
for row in rows:
    print(f"  - {row[0]}: {row[1]}")

cursor.close()
conn.close()

# Result
if count > 0:
    print("\n✅ SUCCESS - Data persisted!")
else:
    print("\n❌ FAILED - Data NOT persisted")
