"""RF10 — Candidatura a vagas."""

import pytest
from rest_framework.test import APIClient

from users.models import User, OrganizationProfile, StudentProfile
from opportunities.models import Opportunity
from applications.models import Application


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def org(db):
    user = User.objects.create_user(
        email="ong@example.com", username="ong_user", password="Pass1234",
        role="organizacao", nome="ONG",
    )
    return OrganizationProfile.objects.create(
        user=user, cnpj="11222333000181", razao_social="ONG Ltda",
        telefone="61999999999", nome_responsavel="Resp", status="approved",
    )


def _student(email="aluno@example.com", username="aluno", matricula="202012345"):
    user = User.objects.create_user(
        email=email, username=username, password="Pass1234",
        role="estudante", nome="João",
    )
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="ESW", matricula=matricula,
    )
    return user


@pytest.fixture
def student_user(db):
    return _student()


@pytest.fixture
def org_user(db, org):
    return org.user


def _opp(org, status="active"):
    return Opportunity.objects.create(
        organization=org, title="Tutoria", area="educacao", description="Desc",
        workload_value=4, workload_unit="h/semana", vacancies=5,
        modality="presencial", location="Brasília", start_date="2026-07-01",
        start_time="09:00", status=status,
    )


@pytest.mark.django_db
class TestApplicationCreate:
    def test_student_applies_active_returns_201(self, api_client, org, student_user):
        opp = _opp(org)
        api_client.force_authenticate(user=student_user)
        resp = api_client.post("/api/v1/applications/", {"opportunity": str(opp.id)}, format="json")
        assert resp.status_code == 201
        assert resp.data["status"] == "pending"
        assert resp.data["opportunity"] == opp.id

    def test_duplicate_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=student_user)
        resp = api_client.post("/api/v1/applications/", {"opportunity": str(opp.id)}, format="json")
        assert resp.status_code == 400
        assert resp.data["detail"] == "Você já se candidatou a esta vaga."

    def test_anonymous_returns_401(self, api_client, org):
        opp = _opp(org)
        resp = api_client.post("/api/v1/applications/", {"opportunity": str(opp.id)}, format="json")
        assert resp.status_code == 401

    def test_non_student_returns_403(self, api_client, org, org_user):
        opp = _opp(org)
        api_client.force_authenticate(user=org_user)
        resp = api_client.post("/api/v1/applications/", {"opportunity": str(opp.id)}, format="json")
        assert resp.status_code == 403

    @pytest.mark.parametrize("st", ["paused", "closed", "draft"])
    def test_closed_opportunity_returns_400(self, api_client, org, student_user, st):
        opp = _opp(org, st)
        api_client.force_authenticate(user=student_user)
        resp = api_client.post("/api/v1/applications/", {"opportunity": str(opp.id)}, format="json")
        assert resp.status_code == 400
        assert resp.data["detail"] == "Esta vaga não está mais aceitando candidaturas."


@pytest.mark.django_db
class TestApplicationList:
    def test_lists_only_own_applications(self, api_client, org, student_user):
        opp = _opp(org)
        other = _student(email="m@e.com", username="maria", matricula="999")
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        Application.objects.create(student=other.student_profile, opportunity=opp)
        api_client.force_authenticate(user=student_user)
        resp = api_client.get("/api/v1/applications/")
        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["opportunity"]["title"] == "Tutoria"
        assert resp.data[0]["opportunity"]["status"] == "active"

    def test_unique_together_enforced(self, db, org, student_user):
        from django.db import IntegrityError, transaction

        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        with pytest.raises(IntegrityError):
            with transaction.atomic():
                Application.objects.create(
                    student=student_user.student_profile, opportunity=opp
                )
