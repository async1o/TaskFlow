import asyncio
import sys

sys.path.insert(0, "src")

import pytest
from fastapi.testclient import TestClient
from main import app
from db.db import reset_tables_cascade, create_db
from services.users import UserServices
from config_db import settings
from repositories.users import UserRepositories
from schemas.users import UserAddSchema

user_counter = [0]


def next_user_data():
    user_counter[0] += 1
    return {
        "username": f"TestUser{user_counter[0]}",
        "email": f"test{user_counter[0]}@example.com",
        "password": "testpass123",
    }


def setup_db():
    assert settings.MODE == "TEST"

    async def _setup():
        await create_db()
        await reset_tables_cascade()
        user = UserAddSchema(username="Bot", email="Bot@email.ru", password="12345")
        await UserServices(UserRepositories).add_user(user)

    asyncio.run(_setup())


setup_db()


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    r = client.post("/users/login", json={"email": "Bot@email.ru", "password": "12345"})
    return r.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def fresh_user():
    """Create a fresh user and return (user_id, headers)."""
    data = next_user_data()
    _ = client.post("/users", json=data)
    token = client.post("/users/login", json={"email": data["email"], "password": data["password"]}).json()["access_token"]
    return data, {"Authorization": f"Bearer {token}"}


# ─── Health ───────────────────────────────────────────────────────────────────


class TestHealth:
    def test_health(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "healthy"}


# ─── Auth ─────────────────────────────────────────────────────────────────────


class TestAuth:
    def test_login_success(self, client):
        r = client.post("/users/login", json={"email": "Bot@email.ru", "password": "12345"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client):
        r = client.post("/users/login", json={"email": "Bot@email.ru", "password": "wrong"})
        assert r.status_code == 401

    def test_login_wrong_email(self, client):
        r = client.post("/users/login", json={"email": "x@y.z", "password": "12345"})
        assert r.status_code == 401


# ─── Users ────────────────────────────────────────────────────────────────────


class TestUsers:
    def test_list_requires_auth(self, client):
        r = client.get("/users")
        assert r.status_code in (401, 403)

    def test_list_users(self, client, auth_headers):
        r = client.get("/users", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_me(self, client, auth_headers):
        r = client.get("/users/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "Bot@email.ru"

    def test_register(self, client):
        data = next_user_data()
        r = client.post("/users", json=data)
        assert r.status_code == 200

    def test_register_duplicate_email(self, client):
        data = next_user_data()
        client.post("/users", json=data)
        r = client.post("/users", json=data)
        assert r.status_code == 400

    def test_update_own_profile(self, client):
        data = next_user_data()
        uid = client.post("/users", json=data).json()
        token = client.post("/users/login", json={"email": data["email"], "password": data["password"]}).json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        r = client.put("/users", json={"username": "Updated", "email": "u@x.com", "password": "new"}, params={"user_id": uid}, headers=headers)
        assert r.status_code == 200

    def test_update_not_own(self, client, auth_headers):
        r = client.put("/users", params={"user_id": 99999}, json={"username": "H", "email": "h@x.com", "password": "p"}, headers=auth_headers)
        assert r.status_code == 403

    def test_delete_not_own(self, client, auth_headers):
        r = client.delete("/users", params={"user_id": 99999}, headers=auth_headers)
        assert r.status_code == 403

    def test_delete_own(self, client):
        data = next_user_data()
        uid = client.post("/users", json=data).json()
        token = client.post("/users/login", json={"email": data["email"], "password": data["password"]}).json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        r = client.delete("/users", params={"user_id": uid}, headers=headers)
        assert r.status_code == 200


# ─── Tasks ────────────────────────────────────────────────────────────────────


class TestTasks:
    def test_list_requires_auth(self, client):
        r = client.get("/tasks")
        assert r.status_code in (401, 403)

    def test_list_tasks(self, client, auth_headers):
        r = client.get("/tasks", headers=auth_headers)
        assert r.status_code == 200

    def test_create_task(self, client, auth_headers):
        r = client.post("/tasks", json={"label": "Test", "text": "Desc"}, headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), int)

    def test_create_and_get_task(self, client, auth_headers):
        tid = client.post("/tasks", json={"label": "Get Me", "text": "Yep"}, headers=auth_headers).json()
        r = client.get(f"/tasks/{tid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["label"] == "Get Me"

    def test_update_own_task(self, client, auth_headers):
        tid = client.post("/tasks", json={"label": "Old", "text": "Old text"}, headers=auth_headers).json()
        r = client.put("/tasks", json={"label": "New", "text": "New text"}, params={"task_id": tid}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["label"] == "New"

    def test_update_not_own_task(self, client, auth_headers, fresh_user):
        _, other_headers = fresh_user
        tid = client.post("/tasks", json={"label": "Mine", "text": "Mine"}, headers=auth_headers).json()
        r = client.put("/tasks", json={"label": "Hacked", "text": "No"}, params={"task_id": tid}, headers=other_headers)
        assert r.status_code == 403

    def test_complete_own_task(self, client, auth_headers):
        tid = client.post("/tasks", json={"label": "Do", "text": "It"}, headers=auth_headers).json()
        r = client.patch(f"/tasks/{tid}/complete", json={"status": "completed"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "completed"

    def test_complete_assigned_task(self, client, auth_headers, fresh_user):
        _, assignee_headers = fresh_user
        uid = client.get("/users/me", headers=assignee_headers).json()["user_id"]
        tid = client.post("/tasks", json={"label": "Assigned", "text": "Task", "assignee_id": uid}, headers=auth_headers).json()
        r = client.patch(f"/tasks/{tid}/complete", json={"status": "completed"}, headers=assignee_headers)
        assert r.status_code == 200

    def test_complete_not_own_task(self, client, auth_headers, fresh_user):
        _, other_headers = fresh_user
        tid = client.post("/tasks", json={"label": "Mine", "text": "Mine"}, headers=auth_headers).json()
        r = client.patch(f"/tasks/{tid}/complete", json={"status": "completed"}, headers=other_headers)
        assert r.status_code == 403

    def test_delete_own_task(self, client, auth_headers):
        tid = client.post("/tasks", json={"label": "Del", "text": "Me"}, headers=auth_headers).json()
        r = client.delete("/tasks", params={"task_id": tid}, headers=auth_headers)
        assert r.status_code == 200

    def test_delete_not_own(self, client, auth_headers, fresh_user):
        _, other_headers = fresh_user
        tid = client.post("/tasks", json={"label": "Mine", "text": "Mine"}, headers=auth_headers).json()
        r = client.delete("/tasks", params={"task_id": tid}, headers=other_headers)
        assert r.status_code == 403


# ─── Corporations ─────────────────────────────────────────────────────────────


class TestCorps:
    def test_create_corp(self, client, auth_headers):
        r = client.post("/corps", json={"name": "Acme"}, headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), int)

    def test_create_duplicate_name(self, client, auth_headers):
        r = client.post("/corps", json={"name": "DuplicateCorp"}, headers=auth_headers)
        assert r.status_code == 200
        r = client.post("/corps", json={"name": "DuplicateCorp"}, headers=auth_headers)
        assert r.status_code == 400

    def test_list_my_corps(self, client, auth_headers):
        client.post("/corps", json={"name": "MyCorp"}, headers=auth_headers)
        r = client.get("/corps", headers=auth_headers)
        assert r.status_code == 200
        names = [c["name"] for c in r.json()]
        assert "MyCorp" in names

    def test_get_corp(self, client, auth_headers):
        cid = client.post("/corps", json={"name": "Visible"}, headers=auth_headers).json()
        r = client.get(f"/corps/{cid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "Visible"

    def test_get_corp_not_found(self, client, auth_headers):
        r = client.get("/corps/99999", headers=auth_headers)
        assert r.status_code == 404

    def test_owner_can_delete(self, client, auth_headers):
        cid = client.post("/corps", json={"name": "ToDelete"}, headers=auth_headers).json()
        r = client.delete(f"/corps/{cid}", headers=auth_headers)
        assert r.status_code == 200

    def test_non_owner_cannot_delete(self, client, auth_headers, fresh_user):
        _, other_headers = fresh_user
        cid = client.post("/corps", json={"name": "Keep"}, headers=auth_headers).json()
        r = client.delete(f"/corps/{cid}", headers=other_headers)
        assert r.status_code == 404  # non-owner doesn't see the corp

    def test_members_list(self, client, auth_headers, fresh_user):
        uid, _ = fresh_user
        cid = client.post("/corps", json={"name": "Team"}, headers=auth_headers).json()
        # add member
        r = client.post(f"/corps/{cid}/members", json={"user_id": uid}, headers=auth_headers)
        assert r.status_code == 200
        # list members
        r = client.get(f"/corps/{cid}/members", headers=auth_headers)
        assert r.status_code == 200
        assert uid in r.json()

    def test_remove_member(self, client, auth_headers, fresh_user):
        uid, _ = fresh_user
        cid = client.post("/corps", json={"name": "RemoveTest"}, headers=auth_headers).json()
        client.post(f"/corps/{cid}/members", json={"user_id": uid}, headers=auth_headers)
        r = client.delete(f"/corps/{cid}/members/{uid}", headers=auth_headers)
        assert r.status_code == 200
        r = client.get(f"/corps/{cid}/members", headers=auth_headers)
        assert uid not in r.json()


# ─── Invitations ──────────────────────────────────────────────────────────────


class TestInvitations:
    def test_owner_can_invite(self, client, auth_headers, fresh_user):
        uid, _ = fresh_user
        cid = client.post("/corps", json={"name": "InviteTest"}, headers=auth_headers).json()
        r = client.post(f"/corps/{cid}/invite", json={"username": uid["username"]}, headers=auth_headers)
        assert r.status_code == 200
        assert "invitation_id" in r.json()

    def test_non_owner_cannot_invite(self, client, auth_headers, fresh_user):
        _, other_headers = fresh_user
        cid = client.post("/corps", json={"name": "Locked"}, headers=auth_headers).json()
        r = client.post(f"/corps/{cid}/invite", json={"username": "Bot"}, headers=other_headers)
        assert r.status_code in (403, 404)

    def test_accept_invite(self, client, auth_headers, fresh_user):
        data, user_headers = fresh_user
        cid = client.post("/corps", json={"name": "AcceptTest"}, headers=auth_headers).json()
        inv = client.post(f"/corps/{cid}/invite", json={"username": data["username"]}, headers=auth_headers).json()
        inv_id = inv["invitation_id"]
        r = client.post(f"/invitations/{inv_id}/accept", headers=user_headers)
        assert r.status_code == 200
        # user should now be a member
        r = client.get(f"/corps/{cid}/members", headers=auth_headers)
        me = client.get("/users/me", headers=user_headers).json()
        assert me["user_id"] in r.json()

    def test_reject_invite(self, client, auth_headers, fresh_user):
        data, user_headers = fresh_user
        cid = client.post("/corps", json={"name": "RejectTest"}, headers=auth_headers).json()
        inv = client.post(f"/corps/{cid}/invite", json={"username": data["username"]}, headers=auth_headers).json()
        r = client.post(f"/invitations/{inv['invitation_id']}/reject", headers=user_headers)
        assert r.status_code == 200

    def test_pending_invites_list(self, client, auth_headers, fresh_user):
        data, user_headers = fresh_user
        cid = client.post("/corps", json={"name": "PendingList"}, headers=auth_headers).json()
        client.post(f"/corps/{cid}/invite", json={"username": data["username"]}, headers=auth_headers)
        r = client.get("/invitations/pending", headers=user_headers)
        assert r.status_code == 200
        assert len(r.json()) > 0


# ─── Notifications ────────────────────────────────────────────────────────────


class TestNotifications:
    def test_get_notifications(self, client, auth_headers):
        r = client.get("/notifications", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_mark_notification_read(self, client, auth_headers):
        # create a task to generate a notification
        client.post("/tasks", json={"label": "NotifTest", "text": "x"}, headers=auth_headers)
        notifs = client.get("/notifications", headers=auth_headers).json()
        task_notifs = [n for n in notifs if n.get("notification_id")]
        if task_notifs:
            nid = task_notifs[0]["notification_id"]
            r = client.post(f"/notifications/{nid}/read", headers=auth_headers)
            assert r.status_code == 200
