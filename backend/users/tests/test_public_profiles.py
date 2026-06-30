"""
Testes dos perfis públicos (S4 — RF22/US2.12 e RF23/US2.13).

Garante que:
- usuários autenticados (qualquer role) veem o perfil público de outro estudante/org;
- a representação espelha /me/ (read-only) — mesmos campos, sem ações de dono;
- pk inexistente → 404, org pendente → 404, sem auth → 401;
- o `id` retornado é o user.id (UUID, chave usada na rota e no resto da API).
"""

import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from users.models import OrganizationProfile, StudentProfile

User = get_user_model()

VALID_CNPJ = "11222333000181"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def viewer(db):
    """Usuário autenticado qualquer (estudante) que visualiza perfis alheios."""
    return User.objects.create_user(
        username="viewer",
        email="viewer@test.com",
        password="Senha123",
        nome="Viewer",
        role=User.Role.ESTUDANTE,
        is_active=True,
    )


@pytest.fixture
def student(db):
    user = User.objects.create_user(
        username="aluno",
        email="aluno@test.com",
        password="Senha123",
        nome="Aluno Teste",
        role=User.Role.ESTUDANTE,
        is_active=True,
    )
    profile = StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Engenharia de Software",
        matricula="190012345",
        semestre_atual=5,
        ano_conclusao=2027,
        bio="Bio pública",
        interesses=["educacao"],
    )
    return user, profile


def _make_org(status="approved", email="ong@test.com", cnpj=VALID_CNPJ, username="ong"):
    user = User.objects.create_user(
        username=username,
        email=email,
        password="Senha123",
        nome="ONG Teste",
        role=User.Role.ORGANIZACAO,
        is_active=status == "approved",
    )
    org = OrganizationProfile.objects.create(
        user=user,
        cnpj=cnpj,
        razao_social="ONG Teste LTDA",
        nome_fantasia="ONG Teste",
        telefone="(11) 99999-9999",
        nome_responsavel="Responsavel Teste",
        site="https://ong.org",
        status=status,
    )
    return user, org


@pytest.mark.django_db
class TestStudentPublicProfile:
    def test_returns_public_data(self, client, viewer, student):
        user, profile = student
        client.force_authenticate(user=viewer)
        resp = client.get(f"/api/v1/students/{user.id}/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["nome"] == "Aluno Teste"
        assert data["curso"] == "Engenharia de Software"
        assert data["universidade"] == "UnB"
        assert data["bio"] == "Bio pública"
        # id retornado == user.id (UUID, chave da rota)
        assert data["id"] == str(user.id)

    def test_mirrors_own_profile_fields(self, client, viewer, student):
        """Mesma representação de /students/me/ (read-only)."""
        user, _ = student
        client.force_authenticate(user=viewer)
        data = client.get(f"/api/v1/students/{user.id}/").json()
        assert data["email"] == "aluno@test.com"
        assert data["matricula"] == "190012345"

    def test_unknown_pk_returns_404(self, client, viewer):
        client.force_authenticate(user=viewer)
        resp = client.get(f"/api/v1/students/{uuid.uuid4()}/")
        assert resp.status_code == 404

    def test_requires_auth(self, client, student):
        user, _ = student
        resp = client.get(f"/api/v1/students/{user.id}/")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestOrgPublicProfile:
    def test_returns_public_data(self, client, viewer):
        user, org = _make_org()
        client.force_authenticate(user=viewer)
        resp = client.get(f"/api/v1/organizations/{user.id}/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["razao_social"] == "ONG Teste LTDA"
        assert data["site"] == "https://ong.org"
        assert data["id"] == str(user.id)

    def test_mirrors_own_profile_fields(self, client, viewer):
        """Mesma representação de /organizations/me/ (read-only) — inclui contato."""
        user, _ = _make_org()
        client.force_authenticate(user=viewer)
        data = client.get(f"/api/v1/organizations/{user.id}/").json()
        assert data["email"] == "ong@test.com"
        assert data["telefone"] == "(11) 99999-9999"
        assert data["nome_responsavel"] == "Responsavel Teste"

    def test_pending_org_returns_404(self, client, viewer):
        user, _ = _make_org(
            status="pending", email="pend@test.com", cnpj="11444777000161", username="pend"
        )
        client.force_authenticate(user=viewer)
        resp = client.get(f"/api/v1/organizations/{user.id}/")
        assert resp.status_code == 404

    def test_unknown_pk_returns_404(self, client, viewer):
        client.force_authenticate(user=viewer)
        resp = client.get(f"/api/v1/organizations/{uuid.uuid4()}/")
        assert resp.status_code == 404

    def test_requires_auth(self, client):
        user, _ = _make_org()
        resp = client.get(f"/api/v1/organizations/{user.id}/")
        assert resp.status_code == 401
