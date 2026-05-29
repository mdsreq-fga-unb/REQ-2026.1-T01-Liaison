"""
Testes de CRUD do User.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


def _user_payload(**overrides):
    data = {
        "email": "aluno@example.com",
        "username": "aluno1",
        "password": "senha123",
        "nome": "Aluno Teste",
        "role": "estudante",
    }
    data.update(overrides)
    return data


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin1",
        email="admin@example.com",
        password="adminpass123",
        role=User.Role.ADMIN,
        nome="Admin",
    )


@pytest.mark.django_db
class TestUserCRUD:
    def test_create_user_estudante(self, api_client):
        response = api_client.post("/api/v1/users/", _user_payload(), format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "aluno@example.com"
        assert data["role"] == "estudante"

    def test_list_users_so_admin(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/")
        assert response.status_code == 200

    def test_list_users_proibido_para_nao_admin(self, api_client, db):
        user = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="pass123",
            role=User.Role.ESTUDANTE,
            nome="User",
        )
        api_client.force_authenticate(user=user)
        response = api_client.get("/api/v1/users/")
        assert response.status_code == 403

    def test_retrieve_proprio_usuario(self, api_client, db):
        user = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="pass123",
            role=User.Role.ESTUDANTE,
            nome="User Dois",
        )
        api_client.force_authenticate(user=user)
        response = api_client.get(f"/api/v1/users/{user.id}/")
        assert response.status_code == 200
        assert response.json()["email"] == "user2@example.com"
