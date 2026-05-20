"""
Testes das views: health check e autenticacao JWT.
"""

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def _create(email="user@example.com", password="testpass123", role="estudante"):
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password=password,
            role=role,
        )

    return _create


@pytest.mark.django_db
class TestHealthCheck:
    """Testes do GET /api/v1/health/"""

    def test_health_check_returns_200(self, api_client):
        """Health check retorna HTTP 200."""
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200

    def test_health_check_returns_ok_status(self, api_client):
        """Health check retorna JSON {status: ok}."""
        response = api_client.get("/api/v1/health/")
        assert response.json() == {"status": "ok"}

    def test_health_check_no_auth_required(self, api_client):
        """Health check acessivel sem autenticacao."""
        # sem token ainda deve retornar 200
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200


@pytest.mark.django_db
class TestJWTAuthentication:
    """Testes do POST /api/v1/auth/token/ e /api/v1/auth/token/refresh/"""

    def test_obtain_token_returns_access_and_refresh(self, api_client, create_user):
        """Credenciais validas retornam access e refresh."""
        create_user(email="jwt@example.com", password="jwtpass123")
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "jwt@example.com", "password": "jwtpass123"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_obtain_token_wrong_password_returns_401(self, api_client, create_user):
        """Senha errada retorna HTTP 401."""
        create_user(email="wrong@example.com", password="correctpass")
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "wrong@example.com", "password": "wrongpass"},
            format="json",
        )
        assert response.status_code == 401

    def test_obtain_token_nonexistent_user_returns_401(self, api_client):
        """Usuario inexistente retorna HTTP 401."""
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "nobody@example.com", "password": "anypass"},
            format="json",
        )
        assert response.status_code == 401

    def test_refresh_token_returns_new_access(self, api_client, create_user):
        """Refresh valido retorna novo access."""
        create_user(email="refresh@example.com", password="refreshpass")
        # pega os tokens iniciais
        obtain_resp = api_client.post(
            "/api/v1/auth/token/",
            {"email": "refresh@example.com", "password": "refreshpass"},
            format="json",
        )
        refresh_token = obtain_resp.json()["refresh"]
        # usa o refresh token
        refresh_resp = api_client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )
        assert refresh_resp.status_code == 200
        assert "access" in refresh_resp.json()

    def test_refresh_token_invalid_returns_401(self, api_client):
        """Refresh invalido retorna HTTP 401."""
        response = api_client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": "totally-invalid-token"},
            format="json",
        )
        assert response.status_code == 401
