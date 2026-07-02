"""
Testes — listagem de vagas salvas (GET /api/v1/opportunities/saved/).

Cobre:
- Retorna só as vagas salvas pelo estudante, mais recente primeiro
- Inclui saved_at e is_saved=True
- Isolamento por estudante (não vaza salvos de outro)
- 403 para organização / anônimo
"""

import pytest
from rest_framework.test import APIClient

from users.models import User, OrganizationProfile, StudentProfile
from opportunities.models import Opportunity, SavedOpportunity


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def approved_org(db):
    user = User.objects.create_user(
        email="ong@example.com", username="ong_user", password="Pass1234",
        role="organizacao", nome="ONG Exemplo",
    )
    return OrganizationProfile.objects.create(
        user=user, cnpj="11222333000181", razao_social="ONG Exemplo Ltda",
        telefone="61999999999", nome_responsavel="Responsável", status="approved",
    )


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="estudante@example.com", username="estudante_user", password="Pass1234",
        role="estudante", nome="João Silva",
    )
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="Engenharia de Software",
        matricula="202012345", horas_extensao_exigidas=120,
    )
    return user


@pytest.fixture
def student_user2(db):
    user = User.objects.create_user(
        email="estudante2@example.com", username="estudante_user2", password="Pass1234",
        role="estudante", nome="Maria Santos",
    )
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="CC", matricula="202067890",
    )
    return user


def _make_opportunity(org, title="Vaga Teste", area="educacao"):
    return Opportunity.objects.create(
        organization=org, title=title, area=area, description="Desc",
        workload_value=4, workload_unit="h", vacancies=5, modality="presencial",
        location="Brasília - DF", start_date="2026-07-01", start_time="09:00",
        status="active",
    )


@pytest.mark.django_db
class TestSavedList:
    def test_returns_only_saved_most_recent_first(self, api_client, student_user, approved_org):
        profile = student_user.student_profile
        op1 = _make_opportunity(approved_org, title="Primeira")
        op2 = _make_opportunity(approved_org, title="Segunda")
        _make_opportunity(approved_org, title="Não salva")
        SavedOpportunity.objects.create(student=profile, opportunity=op1)
        SavedOpportunity.objects.create(student=profile, opportunity=op2)  # mais recente

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/saved/")

        assert response.status_code == 200
        titles = [r["title"] for r in response.data]
        assert titles == ["Segunda", "Primeira"]
        assert all(r["is_saved"] is True for r in response.data)
        assert response.data[0]["saved_at"] is not None

    def test_does_not_leak_other_students_saved(self, api_client, student_user, student_user2, approved_org):
        op = _make_opportunity(approved_org, title="Só do outro")
        SavedOpportunity.objects.create(student=student_user2.student_profile, opportunity=op)

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/saved/")

        assert response.status_code == 200
        assert response.data == []

    def test_org_forbidden(self, api_client, approved_org):
        api_client.force_authenticate(user=approved_org.user)
        response = api_client.get("/api/v1/opportunities/saved/")
        assert response.status_code == 403

    def test_anonymous_unauthorized(self, api_client):
        response = api_client.get("/api/v1/opportunities/saved/")
        assert response.status_code == 401
