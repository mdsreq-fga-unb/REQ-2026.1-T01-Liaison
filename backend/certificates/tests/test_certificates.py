"""RF15 — Geração de Certificado Digital."""

import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from applications.models import Application
from certificates.models import Certificate
from certificates.pdf import certificate_fields
from certificates.services import issue_certificate
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile, User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def org(db):
    user = User.objects.create_user(
        email="ong@example.com",
        username="ong_user",
        password="Pass1234",
        role="organizacao",
        nome="ONG Responsável",
    )
    return OrganizationProfile.objects.create(
        user=user,
        cnpj="11222333000181",
        razao_social="ONG Ltda",
        telefone="61999999999",
        nome_responsavel="Resp",
        status="approved",
    )


@pytest.fixture
def other_org(db):
    user = User.objects.create_user(
        email="outra@example.com",
        username="outra_org",
        password="Pass1234",
        role="organizacao",
        nome="Outra ONG",
    )
    return OrganizationProfile.objects.create(
        user=user,
        cnpj="55666777000189",
        razao_social="Outra Ltda",
        telefone="61888888888",
        nome_responsavel="Resp2",
        status="approved",
    )


def _student(email="aluno@example.com", username="aluno", matricula="202012345"):
    user = User.objects.create_user(
        email=email,
        username=username,
        password="Pass1234",
        role="estudante",
        nome="João Silva",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="ESW",
        matricula=matricula,
    )
    return user


@pytest.fixture
def student_user(db):
    return _student()


def _opp(org, status="active"):
    return Opportunity.objects.create(
        organization=org,
        title="Tutoria de Matemática",
        area="educacao",
        description="Desc",
        workload_value=4,
        workload_unit="h/semana",
        vacancies=5,
        modality="presencial",
        location="Brasília",
        start_date="2026-07-01",
        start_time="09:00",
        status=status,
    )


def _application(org, student_user, status="approved"):
    return Application.objects.create(
        student=student_user.student_profile,
        opportunity=_opp(org),
        status=status,
    )


# ─── Service: issue_certificate ───────────────────────────────


@pytest.mark.django_db
class TestIssueCertificate:
    def test_creates_certificate_with_pdf(self, org, student_user):
        app = _application(org, student_user)
        cert = issue_certificate(app, hours=40)
        assert cert.hours == 40
        assert cert.pdf_file
        assert cert.pdf_file.size > 0
        app.refresh_from_db()
        assert app.status == Application.Status.COMPLETED
        assert app.hours_completed == 40
        assert app.completed_at is not None

    def test_rejects_non_approved_application(self, org, student_user):
        app = _application(org, student_user, status="pending")
        with pytest.raises(ValidationError):
            issue_certificate(app, hours=40)

    def test_second_issue_same_application_raises(self, org, student_user):
        app = _application(org, student_user)
        issue_certificate(app, hours=40)
        with pytest.raises(ValidationError):
            issue_certificate(app, hours=40)

    def test_uuids_are_unique(self, org, student_user):
        c1 = issue_certificate(_application(org, student_user), hours=40)
        student2 = _student("b@x.com", "alunob", "202099999")
        c2 = issue_certificate(_application(org, student2), hours=10)
        assert c1.validation_uuid != c2.validation_uuid


# ─── PDF content (helper testável, sem parse do binário) ──────


@pytest.mark.django_db
class TestCertificateFields:
    def test_contains_required_data(self, org, student_user):
        cert = issue_certificate(_application(org, student_user), hours=40)
        f = certificate_fields(cert)
        assert f["student_name"] == "João Silva"
        assert f["activity_title"] == "Tutoria de Matemática"
        assert f["hours"] == 40
        assert f["hours_extenso"] == "40 (quarenta) horas"
        assert f["organization_name"] == "ONG Ltda"
        assert f["organization_cnpj"] == "11.222.333/0001-81"  # máscara aplicada
        assert "2026" in f["issued_at"] and "Brasília" in f["issued_at"]
        # Código curto de validação: 4 grupos de 4 hex derivados do UUID.
        assert f["validation_code"].count("-") == 3
        assert str(cert.validation_uuid) in f["validation_url"]


# ─── Imutabilidade (RNF08) ────────────────────────────────────


@pytest.mark.django_db
class TestImmutability:
    def test_update_immutable_field_raises(self, org, student_user):
        cert = issue_certificate(_application(org, student_user), hours=40)
        cert.hours = 999
        with pytest.raises(ValidationError):
            cert.save()

    def test_save_revoked_at_allowed(self, org, student_user):
        from django.utils import timezone

        cert = issue_certificate(_application(org, student_user), hours=40)
        cert.revoked_at = timezone.now()
        cert.save(update_fields=["revoked_at"])  # não levanta
        cert.refresh_from_db()
        assert cert.revoked_at is not None


# ─── Endpoint: GET /certificates/ ─────────────────────────────


@pytest.mark.django_db
class TestCertificateList:
    def test_student_lists_own_only(self, api_client, org, student_user):
        issue_certificate(_application(org, student_user), hours=40)
        api_client.force_authenticate(user=student_user)
        resp = api_client.get("/api/v1/certificates/")
        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["organization_nome"] == "ONG Ltda"
        assert "download_url" in resp.data[0]

    def test_other_student_sees_nothing(self, api_client, org, student_user):
        issue_certificate(_application(org, student_user), hours=40)
        other = _student("c@x.com", "alunoc", "202088888")
        api_client.force_authenticate(user=other)
        resp = api_client.get("/api/v1/certificates/")
        assert resp.status_code == 200
        assert resp.data == []

    def test_anonymous_returns_401(self, api_client):
        assert api_client.get("/api/v1/certificates/").status_code == 401


# ─── Endpoint: GET /certificates/{id}/download/ ───────────────


@pytest.mark.django_db
class TestCertificateDownload:
    def test_owner_downloads_pdf(self, api_client, org, student_user):
        cert = issue_certificate(_application(org, student_user), hours=40)
        api_client.force_authenticate(user=student_user)
        resp = api_client.get(f"/api/v1/certificates/{cert.id}/download/")
        assert resp.status_code == 200
        assert resp["Content-Type"] == "application/pdf"
        assert "attachment" in resp["Content-Disposition"]

    def test_non_owner_gets_404(self, api_client, org, student_user):
        cert = issue_certificate(_application(org, student_user), hours=40)
        other = _student("d@x.com", "alunod", "202077777")
        api_client.force_authenticate(user=other)
        resp = api_client.get(f"/api/v1/certificates/{cert.id}/download/")
        assert resp.status_code == 404


# ─── Endpoint: POST /certificates/issue/ ──────────────────────


@pytest.mark.django_db
class TestCertificateIssueEndpoint:
    def test_owning_org_issues_201(self, api_client, org, student_user):
        app = _application(org, student_user)
        api_client.force_authenticate(user=org.user)
        resp = api_client.post(
            "/api/v1/certificates/issue/",
            {"application": str(app.id), "hours": 40},
            format="json",
        )
        assert resp.status_code == 201
        assert "validation_uuid" in resp.data
        assert Certificate.objects.filter(application=app).exists()

    def test_other_org_gets_404(self, api_client, org, other_org, student_user):
        app = _application(org, student_user)
        api_client.force_authenticate(user=other_org.user)
        resp = api_client.post(
            "/api/v1/certificates/issue/",
            {"application": str(app.id), "hours": 40},
            format="json",
        )
        assert resp.status_code == 404

    def test_student_gets_403(self, api_client, org, student_user):
        app = _application(org, student_user)
        api_client.force_authenticate(user=student_user)
        resp = api_client.post(
            "/api/v1/certificates/issue/",
            {"application": str(app.id), "hours": 40},
            format="json",
        )
        assert resp.status_code == 403

    def test_non_approved_application_400(self, api_client, org, student_user):
        app = _application(org, student_user, status="pending")
        api_client.force_authenticate(user=org.user)
        resp = api_client.post(
            "/api/v1/certificates/issue/",
            {"application": str(app.id), "hours": 40},
            format="json",
        )
        assert resp.status_code == 400

    def test_second_issue_400(self, api_client, org, student_user):
        app = _application(org, student_user)
        api_client.force_authenticate(user=org.user)
        body = {"application": str(app.id), "hours": 40}
        api_client.post("/api/v1/certificates/issue/", body, format="json")
        resp = api_client.post("/api/v1/certificates/issue/", body, format="json")
        assert resp.status_code == 400
        assert "já emitido" in resp.data["detail"]
