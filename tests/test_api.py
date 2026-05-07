import asyncio
import sys
sys.path.insert(0, 'src')

import pytest
from fastapi.testclient import TestClient
from main import app
from db.db import reset_tables, create_db
from services.users import UserServices
from config_db import settings
from repositories.users import UserRepositories
from schemas.users import UserAddSchema


user_counter = [0]


def next_user_data():
    user_counter[0] += 1
    return {"username": f"TestUser{user_counter[0]}", "email": f"test{user_counter[0]}@example.com", "password": "testpass123"}


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    assert settings.MODE == "TEST"
    print(f"\n>>> setup_db: DB_HOST={settings.DB_HOST}, MODE={settings.MODE}")

    async def _setup():
        print(">>> Creating db...")
        await create_db()
        print(">>> Resetting tables...")
        await reset_tables()
        print(">>> Adding Bot user...")
        user = UserAddSchema(username="Bot", email="Bot@email.ru", password="12345")
        await UserServices(UserRepositories).add_user(user)
        print(">>> Setup complete!")

    asyncio.run(_setup())


@pytest.fixture(scope="session", autouse=True)
def client():
    print("\n>>> Creating TestClient...")
    client = TestClient(app)
    print(">>> TestClient created!")
    yield client


@pytest.fixture
def auth_token(client):
    response = client.post("/users/login", json={"email": "Bot@email.ru", "password": "12345"})
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.mark.usefixtures("client")
class TestHealth:
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


@pytest.mark.usefixtures("client")
class TestAuth:
    def test_login_success(self, client):
        print("\n>>> Running test_login_success")
        response = client.post("/users/login", json={"email": "Bot@email.ru", "password": "12345"})
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_password(self, client):
        print("\n>>> Running test_login_invalid_password")
        response = client.post("/users/login", json={"email": "Bot@email.ru", "password": "wrong"})
        assert response.status_code == 401

    def test_login_invalid_email(self, client):
        print("\n>>> Running test_login_invalid_email")
        response = client.post("/users/login", json={"email": "nonexistent@email.ru", "password": "12345"})
        assert response.status_code == 401


@pytest.mark.usefixtures("client")
class TestUser:
    def test_get_all_users_requires_auth(self, client):
        response = client.get("/users")
        assert response.status_code in [401, 403]

    def test_get_all_users(self, client, auth_headers):
        response = client.get("/users", headers=auth_headers)
        assert response.status_code == 200

    def test_get_me(self, client, auth_headers):
        response = client.get("/users/me", headers=auth_headers)
        assert response.status_code == 200

    def test_add_user(self, client):
        user_data = next_user_data()
        response = client.post("/users", json=user_data)
        assert response.status_code == 200

    def test_add_duplicate_email(self, client):
        user_data = next_user_data()
        client.post("/users", json=user_data)
        response = client.post("/users", json=user_data)
        assert response.status_code == 400

    def test_update_user_own(self, client, auth_headers):
        user_data = next_user_data()
        user_id = client.post("/users", json=user_data).json()
        login_response = client.post("/users/login", json={"email": user_data["email"], "password": user_data["password"]})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        data = {"username": "Updated", "email": "updated@example.com", "password": "newpass"}
        response = client.put("/users", json=data, params={"user_id": user_id}, headers=headers)
        assert response.status_code == 200

    def test_update_user_not_own(self, client, auth_headers):
        response = client.put(
            "/users",
            params={"user_id": 99999},
            json={"username": "Hacker", "email": "hack@email.ru", "password": "12345"},
            headers=auth_headers,
        )
        assert response.status_code == 403

    def test_delete_user_not_own(self, client, auth_headers):
        response = client.delete("/users", params={"user_id": 99999}, headers=auth_headers)
        assert response.status_code == 403


@pytest.mark.usefixtures("client")
class TestTasks:
    def test_get_all_tasks_requires_auth(self, client):
        response = client.get("/tasks")
        assert response.status_code in [401, 403]

    def test_get_all_tasks(self, client, auth_headers):
        response = client.get("/tasks", headers=auth_headers)
        assert response.status_code == 200

    def test_add_task(self, client, auth_headers):
        user_data = next_user_data()
        client.post("/users", json=user_data).json()
        login_response = client.post("/users/login", json={"email": user_data["email"], "password": user_data["password"]})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        json = {"label": "Test Task", "text": "Task description"}
        response = client.post("/tasks", json=json, headers=headers)
        assert response.status_code == 200

    def test_update_own_task(self, client, auth_headers):
        user_data = next_user_data()
        client.post("/users", json=user_data).json()
        login_response = client.post("/users/login", json={"email": user_data["email"], "password": user_data["password"]})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        task_json = {"label": "Original", "text": "Original text"}
        task_id = client.post("/tasks", json=task_json, headers=headers).json()
        updated_json = {"label": "Updated", "text": "Updated text"}
        response = client.put("/tasks", json=updated_json, params={"task_id": task_id}, headers=headers)
        assert response.status_code == 200

    def test_update_not_own_task(self, client, auth_headers):
        user_data = next_user_data()
        client.post("/users", json=user_data).json()
        login_response = client.post("/users/login", json={"email": user_data["email"], "password": user_data["password"]})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        task_json = {"label": "Not Mine", "text": "Should not be updated"}
        task_id = client.post("/tasks", json=task_json, headers=headers).json()
        updated_json = {"label": "Hacked", "text": "Trying to update"}
        response = client.put("/tasks", json=updated_json, params={"task_id": task_id}, headers=auth_headers)
        assert response.status_code == 403

    def test_delete_not_own_task(self, client, auth_headers):
        user_data = next_user_data()
        client.post("/users", json=user_data).json()
        login_response = client.post("/users/login", json={"email": user_data["email"], "password": user_data["password"]})
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        task_json = {"label": "To Delete", "text": "Should not be deleted"}
        task_id = client.post("/tasks", json=task_json, headers=headers).json()
        response = client.delete("/tasks", params={"task_id": task_id}, headers=auth_headers)
        assert response.status_code == 403
