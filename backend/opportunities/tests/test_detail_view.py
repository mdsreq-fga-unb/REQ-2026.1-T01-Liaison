"""RF09 — Detalhe público da vaga (GET /api/v1/opportunities/{id}/)."""

import uuid

import pytest
from rest_framework.test import APIClient

from users.models import User, OrganizationProfile, StudentProfile
from opportunities.models import Opportunity


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def org(db):
    user = User.objects.create_user(
        email="ong@example.com", username="ong_user", password="Pass1234",
        role="organizacao", nome="ONG Exemplo",
    )
    return OrganizationProfile.objects.create(
        user=user, cnpj="11222333000181", razao_social="ONG Exemplo Ltda",
        nome_fantasia="Exemplo", mission="Transformar vidas",
        areas_de_atuacao=["educacao"], telefone="61999999999",
        nome_responsavel="Resp", status="approved",
    )


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="aluno@example.com", username="aluno", password="Pass1234",
        role="estudante", nome="João",
    )
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="ESW", matricula="202012345",
    )
    return user


def _opp(org, status="active"):
    return Opportunity.objects.create(
        organization=org, title="Tutoria", area="educacao", description="Desc",
        workload_value=4, workload_unit="h/semana", vacancies=5,
        modality="presencial", location="Brasília - DF",
        start_date="2026-07-01", start_time="09:00", status=status,
    )


@pytest.mark.django_db
class TestOpportunityDetail:
    def test_active_public_no_auth(self, api_client, org):
        opp = _opp(org, "active")
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        assert resp.status_code == 200
        assert resp.data["id"] == str(opp.id)

    @pytest.mark.parametrize("st", ["paused", "closed"])
    def test_paused_closed_public(self, api_client, org, st):
        opp = _opp(org, st)
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        assert resp.status_code == 200
        assert resp.data["status"] == st

    def test_draft_returns_404(self, api_client, org):
        opp = _opp(org, "draft")
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        assert resp.status_code == 404

    def test_nonexistent_returns_404(self, api_client):
        resp = api_client.get(f"/api/v1/opportunities/{uuid.uuid4()}/")
        assert resp.status_code == 404

    def test_organization_expanded(self, api_client, org):
        opp = _opp(org)
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        organization = resp.data["organization"]
        assert organization["razao_social"] == "ONG Exemplo Ltda"
        assert organization["nome_fantasia"] == "Exemplo"
        assert organization["mission"] == "Transformar vidas"
        assert organization["areas_de_atuacao"] == ["educacao"]
        assert "logo" in organization

    def test_is_saved_false_for_anonymous(self, api_client, org):
        opp = _opp(org)
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        assert resp.data["is_saved"] is False
        assert resp.data["already_applied"] is False

    def test_already_applied_true_after_apply(self, api_client, org, student_user):
        from applications.models import Application

        opp = _opp(org)
        Application.objects.create(
            student=student_user.student_profile, opportunity=opp
        )
        api_client.force_authenticate(user=student_user)
        resp = api_client.get(f"/api/v1/opportunities/{opp.id}/")
        assert resp.data["already_applied"] is True
        assert resp.data["applicants_count"] == 1
