"""Validação pública de certificado (#30) — páginas HTML em /validar/."""

import uuid

import pytest

from applications.models import Application
from certificates.pdf import _validation_code
from certificates.services import find_by_code, issue_certificate
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile, User


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
def student_user(db):
    user = User.objects.create_user(
        email="aluno@example.com",
        username="aluno",
        password="Pass1234",
        role="estudante",
        nome="João Silva",
    )
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="ESW", matricula="202012345"
    )
    return user


def _cert(org, student_user, hours=40):
    opp = Opportunity.objects.create(
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
        status="active",
    )
    app = Application.objects.create(
        student=student_user.student_profile, opportunity=opp, status="approved"
    )
    return issue_certificate(app, hours=hours)


# ─── GET /validar/<uuid>/ ─────────────────────────────────────


@pytest.mark.django_db
class TestValidateByUuid:
    def test_valid_uuid_shows_content(self, client, org, student_user):
        cert = _cert(org, student_user)
        resp = client.get(f"/validar/{cert.validation_uuid}/")
        assert resp.status_code == 200
        body = resp.content.decode()
        assert "João Silva" in body
        assert "ONG Ltda" in body
        assert "Tutoria de Matemática" in body
        assert "Válido" in body

    def test_revoked_shows_revoked(self, client, org, student_user):
        from django.utils import timezone

        cert = _cert(org, student_user)
        cert.revoked_at = timezone.now()
        cert.save(update_fields=["revoked_at"])
        resp = client.get(f"/validar/{cert.validation_uuid}/")
        assert resp.status_code == 200
        assert "Revogado" in resp.content.decode()

    def test_unknown_uuid_404_generic(self, client, db):
        resp = client.get(f"/validar/{uuid.uuid4()}/")
        assert resp.status_code == 404
        assert "não encontrado" in resp.content.decode()

    def test_public_no_auth_needed(self, client, org, student_user):
        cert = _cert(org, student_user)
        # client não autenticado → ainda 200.
        assert client.get(f"/validar/{cert.validation_uuid}/").status_code == 200


# ─── GET /validar/?codigo= ────────────────────────────────────


@pytest.mark.django_db
class TestValidateByCode:
    def test_form_without_code(self, client, db):
        resp = client.get("/validar/")
        assert resp.status_code == 200
        assert "código de validação" in resp.content.decode()

    def test_valid_code_resolves(self, client, org, student_user):
        cert = _cert(org, student_user)
        code = _validation_code(cert)
        resp = client.get("/validar/", {"codigo": code})
        assert resp.status_code == 200
        assert "João Silva" in resp.content.decode()

    def test_unknown_code_shows_form_error(self, client, db):
        resp = client.get("/validar/", {"codigo": "0000-0000-0000-0000"})
        assert resp.status_code == 200  # fluxo de form, não 404
        assert "não encontrado" in resp.content.decode()


# ─── Normalização do código (service) ─────────────────────────


@pytest.mark.django_db
class TestFindByCodeNormalization:
    def test_hyphen_case_variants_resolve(self, org, student_user):
        cert = _cert(org, student_user)
        code = _validation_code(cert)  # ex: A1B2-C3D4-E5F6-7890
        variants = [
            code,
            code.lower(),
            code.replace("-", ""),
            code.replace("-", "").lower(),
        ]
        for v in variants:
            assert find_by_code(v) == cert, v

    def test_invalid_length_returns_none(self, db):
        assert find_by_code("ABC") is None
        assert find_by_code("") is None
        assert find_by_code(None) is None
