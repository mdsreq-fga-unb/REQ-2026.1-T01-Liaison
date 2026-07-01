"""
Testes de login por CNPJ — Phase 1 US1.5.

Valida que organizações podem fazer login com CNPJ + senha,
que organizações pendentes são bloqueadas,
e que o login por email (estudante) continua funcionando.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

# CNPJ válido para testes (calculado com algoritmo oficial)
VALID_CNPJ = "11222333000181"
VALID_CNPJ_MASKED = "11.222.333/0001-81"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def create_org_user(db):
    """Cria um User + OrganizationProfile e retorna (user, org)."""

    def _create(email, password, cnpj, status="approved"):
        user = User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password=password,
            nome="ONG Teste",
            role=User.Role.ORGANIZACAO,
            is_active=True,
        )
        from users.models import OrganizationProfile

        org = OrganizationProfile.objects.create(
            user=user,
            cnpj=cnpj,
            razao_social="ONG Teste LTDA",
            nome_fantasia="ONG Teste",
            telefone="(11) 99999-9999",
            nome_responsavel="Responsavel Teste",
            status=status,
        )
        return user, org

    return _create


@pytest.fixture
def create_student_user(db):
    """Cria um User + StudentProfile para teste de regressão."""

    def _create(email="student@test.com", password="studentpass"):
        user = User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password=password,
            nome="Aluno Teste",
            role=User.Role.ESTUDANTE,
            is_active=True,
        )
        from users.models import StudentProfile

        StudentProfile.objects.create(
            user=user,
            universidade="Universidade Teste",
            curso="Curso Teste",
            matricula=f"MAT-{user.id}"[:50],
        )
        return user

    return _create


@pytest.mark.django_db
class TestLoginCNPJ:
    """Testes de login por CNPJ."""

    def test_valid_cnpj_and_password_returns_200(self, client, create_org_user):
        """CNPJ e senha válidos retornam 200 com tokens."""
        create_org_user(
            email="ong@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="approved",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED, "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data
        assert data["role"] == "organizacao"
        assert data["nome"] == "ONG Teste"

    def test_valid_cnpj_unmasked_returns_200(self, client, create_org_user):
        """CNPJ sem máscara também funciona."""
        create_org_user(
            email="ong2@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="approved",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ, "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 200

    def test_valid_cnpj_wrong_password_returns_401(self, client, create_org_user):
        """CNPJ válido + senha errada retorna 401."""
        create_org_user(
            email="ong3@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="approved",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED, "password": "SenhaErrada"},
            format="json",
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_nonexistent_cnpj_returns_401(self, client):
        """CNPJ não cadastrado retorna 401."""
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": "99.888.777/0001-66", "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 401

    def test_pending_org_blocked_returns_403(self, client, create_org_user):
        """Organização com status=pending não pode logar (403)."""
        create_org_user(
            email="pending@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="pending",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED, "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 403
        data = response.json()
        assert "pendente" in data.get("detail", "").lower()

    def test_rejected_org_blocked_returns_403(self, client, create_org_user):
        """Organização com status=rejected não pode logar (403)."""
        create_org_user(
            email="rejected@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="rejected",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED, "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 403

    def test_inactive_user_cnpj_login_returns_401(self, client, create_org_user):
        """Usuário inativo (is_active=False) retorna 401."""
        user, org = create_org_user(
            email="inactive@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="approved",
        )
        user.is_active = False
        user.save()

        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED, "password": "Senha123"},
            format="json",
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestLoginEmailRegression:
    """Testes de regressão: login por email (estudante) continua funcionando."""

    def test_student_email_login_still_works(self, client, create_student_user):
        """Login de estudante por email + senha retorna 200 (regressão)."""
        create_student_user(email="student@test.com", password="studentpass")
        response = client.post(
            "/api/v1/auth/login/",
            {"email": "student@test.com", "password": "studentpass"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert data["role"] == "estudante"

    def test_student_wrong_password_returns_401(self, client, create_student_user):
        """Estudante com senha errada retorna 401."""
        create_student_user(email="student2@test.com", password="studentpass")
        response = client.post(
            "/api/v1/auth/login/",
            {"email": "student2@test.com", "password": "wrong"},
            format="json",
        )
        assert response.status_code == 401

    def test_login_without_email_or_cnpj_returns_400(self, client):
        """Requisição sem email nem CNPJ retorna 400."""
        response = client.post(
            "/api/v1/auth/login/",
            {"password": "Senha123"},
            format="json",
        )
        assert response.status_code == 400

    def test_login_with_both_email_and_cnpj_uses_cnpj(self, client, create_org_user):
        """Se ambos email e CNPJ são enviados, CNPJ tem precedência."""
        create_org_user(
            email="org@test.com",
            password="Senha123",
            cnpj=VALID_CNPJ,
            status="approved",
        )
        response = client.post(
            "/api/v1/auth/login/",
            {
                "email": "wrong@test.com",
                "cnpj": VALID_CNPJ_MASKED,
                "password": "Senha123",
            },
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "organizacao"

    def test_cnpj_with_missing_password_returns_400(self, client):
        """CNPJ sem senha retorna 400."""
        response = client.post(
            "/api/v1/auth/login/",
            {"cnpj": VALID_CNPJ_MASKED},
            format="json",
        )
        assert response.status_code == 400
