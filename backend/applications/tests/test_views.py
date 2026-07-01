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
        assert len(resp.data["results"]) == 1
        assert resp.data["results"][0]["opportunity"]["title"] == "Tutoria"
        assert resp.data["results"][0]["opportunity"]["status"] == "active"

    def test_certificate_null_when_not_issued(self, api_client, org, student_user):
        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=student_user)
        resp = api_client.get("/api/v1/applications/")
        assert resp.data["results"][0]["certificate"] is None
        assert resp.data["results"][0]["attendance"] is None

    def test_certificate_present_when_issued(self, api_client, org, student_user):
        from certificates.services import issue_certificate

        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        app.attendance = "present"
        app.save(update_fields=["attendance"])
        issue_certificate(app, 20)
        api_client.force_authenticate(user=student_user)
        resp = api_client.get("/api/v1/applications/")
        cert = resp.data["results"][0]["certificate"]
        assert cert is not None
        assert "download_url" in cert
        assert resp.data["results"][0]["attendance"] == "present"

    def test_unique_together_enforced(self, db, org, student_user):
        from django.db import IntegrityError, transaction

        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        with pytest.raises(IntegrityError):
            with transaction.atomic():
                Application.objects.create(
                    student=student_user.student_profile, opportunity=opp
                )



@pytest.mark.django_db
class TestOpportunityApplicationsList:
    def test_org_lists_own_opportunity_applications(self, api_client, org, student_user):
        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.get(f"/api/v1/applications/opportunities/{opp.id}/")
        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["student"]["nome"] == "João"

    def test_org_cannot_list_other_orgs_applications(self, api_client, db, student_user):
        other_user = User.objects.create_user(
            email="other@example.com", username="other_org", password="Pass1234",
            role="organizacao", nome="Outra ONG",
        )
        other_org = OrganizationProfile.objects.create(
            user=other_user, cnpj="11222333000181", razao_social="Outra ONG Ltda",
            telefone="61999999999", nome_responsavel="Resp2", status="approved",
        )
        opp = _opp(other_org)
        api_client.force_authenticate(user=other_user)
        # cria uma org diferente e tenta acessar vaga da `other_org` como outra org
        yet_another_user = User.objects.create_user(
            email="yet@example.com", username="yet_org", password="Pass1234",
            role="organizacao", nome="Mais ONG",
        )
        OrganizationProfile.objects.create(
            user=yet_another_user, cnpj="22333444000195", razao_social="Mais ONG Ltda",
            telefone="61999999998", nome_responsavel="Resp3", status="approved",
        )
        api_client.force_authenticate(user=yet_another_user)
        resp = api_client.get(f"/api/v1/applications/opportunities/{opp.id}/")
        assert resp.status_code == 403

    def test_student_cannot_list_applications(self, api_client, org, student_user):
        opp = _opp(org)
        api_client.force_authenticate(user=student_user)
        resp = api_client.get(f"/api/v1/applications/opportunities/{opp.id}/")
        assert resp.status_code == 403

    def test_student_fields_include_id_and_avatar_url(self, api_client, org, student_user):
        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.get(f"/api/v1/applications/opportunities/{opp.id}/")
        assert resp.status_code == 200
        student = resp.data[0]["student"]
        assert str(student_user.id) == str(student["id"])
        assert "avatar_url" in student
        assert student["avatar_url"] is None  # sem avatar → null


@pytest.mark.django_db
class TestApplicationEvaluate:
    def test_approve_pending_application(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "approved"}, format="json")
        assert resp.status_code == 200
        assert resp.data["status"] == "approved"

    def test_reject_pending_application(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "rejected"}, format="json")
        assert resp.status_code == 200
        assert resp.data["status"] == "rejected"

    def test_evaluate_persists_note(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/evaluate/",
            {"status": "rejected", "note": "Perfil não compatível com os requisitos."},
            format="json",
        )
        assert resp.status_code == 200
        assert resp.data["evaluation_note"] == "Perfil não compatível com os requisitos."
        app.refresh_from_db()
        assert app.evaluation_note == "Perfil não compatível com os requisitos."

    def test_reversal_without_confirmation_returns_409(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "rejected"}, format="json")
        assert resp.status_code == 409
        assert resp.data["requires_confirmation"] is True

    def test_reversal_with_confirmation_succeeds(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "rejected", "confirmed": True}, format="json")
        assert resp.status_code == 200
        assert resp.data["status"] == "rejected"

    def test_org_cannot_evaluate_other_orgs_application(self, api_client, db, student_user):
        owner_user = User.objects.create_user(
            email="owner@example.com", username="owner_org", password="Pass1234",
            role="organizacao", nome="Owner ONG",
        )
        owner_org = OrganizationProfile.objects.create(
            user=owner_user, cnpj="11222333000181", razao_social="Owner ONG Ltda",
            telefone="61999999999", nome_responsavel="Resp", status="approved",
        )
        opp = _opp(owner_org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        attacker_user = User.objects.create_user(
            email="attacker@example.com", username="attacker_org", password="Pass1234",
            role="organizacao", nome="Attacker ONG",
        )
        OrganizationProfile.objects.create(
            user=attacker_user, cnpj="22333444000195", razao_social="Attacker ONG Ltda",
            telefone="61999999998", nome_responsavel="Resp2", status="approved",
        )
        api_client.force_authenticate(user=attacker_user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "approved"}, format="json")
        assert resp.status_code == 403

    def test_invalid_status_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/evaluate/", {"status": "cancelled"}, format="json")
        assert resp.status_code == 400


@pytest.mark.django_db
class TestApprovedFilter:
    """RF13 — listagem de aprovados via ?status=approved."""

    def test_filter_returns_only_approved(self, api_client, org, student_user):
        opp = _opp(org)
        Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        other = _student(email="m@e.com", username="maria", matricula="999")
        Application.objects.create(student=other.student_profile, opportunity=opp, status="pending")
        api_client.force_authenticate(user=org.user)
        resp = api_client.get(f"/api/v1/applications/opportunities/{opp.id}/?status=approved")
        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert resp.data[0]["status"] == "approved"


@pytest.mark.django_db
class TestApplicationComplete:
    """RF14 — registrar frequência: approved → completed."""

    def test_complete_present_records_hours(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "present", "hours_completed": 20}, format="json",
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "completed"
        assert resp.data["attendance"] == "present"
        assert resp.data["hours_completed"] == 20
        assert resp.data["completed_at"] is not None
        app.refresh_from_db()
        assert app.status == "completed"
        assert app.attendance == "present"
        assert app.hours_completed == 20
        assert app.completed_at is not None
        # PR #116 — presente emite certificado com snapshot das horas.
        from certificates.models import Certificate
        cert = Certificate.objects.get(application=app)
        assert cert.hours == 20

    def test_complete_partial_records_hours(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "partial", "hours_completed": 14}, format="json",
        )
        assert resp.status_code == 200
        assert resp.data["attendance"] == "partial"
        assert resp.data["hours_completed"] == 14

    def test_complete_absent_forces_zero_hours(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        # hours_completed ignorado quando ausente.
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "absent", "hours_completed": 99}, format="json",
        )
        assert resp.status_code == 200
        assert resp.data["attendance"] == "absent"
        assert resp.data["hours_completed"] == 0
        # Ausente não recebe certificado.
        from certificates.models import Certificate
        assert not Certificate.objects.filter(application=app).exists()

    def test_complete_invalid_attendance_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        for bad in ["foo", None, ""]:
            resp = api_client.patch(
                f"/api/v1/applications/{app.id}/complete/",
                {"attendance": bad, "hours_completed": 10}, format="json",
            )
            assert resp.status_code == 400, f"attendance={bad!r} deveria ser 400"

    def test_complete_non_approved_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="pending")
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "present", "hours_completed": 10}, format="json",
        )
        assert resp.status_code == 400

    def test_complete_already_completed_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(
            student=student_user.student_profile, opportunity=opp,
            status="completed", attendance="present", hours_completed=20,
        )
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "partial", "hours_completed": 5}, format="json",
        )
        assert resp.status_code == 400
        app.refresh_from_db()
        assert app.hours_completed == 20  # imutável (RNF08)
        assert app.attendance == "present"

    def test_complete_invalid_hours_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=org.user)
        for bad in [-1, "abc", True, None]:
            resp = api_client.patch(
                f"/api/v1/applications/{app.id}/complete/",
                {"attendance": "present", "hours_completed": bad}, format="json",
            )
            assert resp.status_code == 400, f"hours={bad!r} deveria ser 400"

    def test_complete_other_org_returns_403(self, api_client, db, student_user):
        owner_user = User.objects.create_user(
            email="owner@example.com", username="owner_org", password="Pass1234",
            role="organizacao", nome="Owner ONG",
        )
        owner_org = OrganizationProfile.objects.create(
            user=owner_user, cnpj="11222333000181", razao_social="Owner ONG Ltda",
            telefone="61999999999", nome_responsavel="Resp", status="approved",
        )
        opp = _opp(owner_org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        attacker_user = User.objects.create_user(
            email="attacker@example.com", username="attacker_org", password="Pass1234",
            role="organizacao", nome="Attacker ONG",
        )
        OrganizationProfile.objects.create(
            user=attacker_user, cnpj="22333444000195", razao_social="Attacker ONG Ltda",
            telefone="61999999998", nome_responsavel="Resp2", status="approved",
        )
        api_client.force_authenticate(user=attacker_user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "present", "hours_completed": 10}, format="json",
        )
        assert resp.status_code == 403

    def test_complete_student_returns_403(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=student_user)
        resp = api_client.patch(
            f"/api/v1/applications/{app.id}/complete/",
            {"attendance": "present", "hours_completed": 10}, format="json",
        )
        assert resp.status_code == 403


@pytest.mark.django_db
class TestApplicationCancel:
    """US2.9 — cancelamento de candidatura pelo estudante (RF12)."""

    def test_cancel_pending_application(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=student_user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/cancel/")
        assert resp.status_code == 200
        assert resp.data["status"] == "cancelled"
        app.refresh_from_db()
        assert app.status == "cancelled"

    def test_cancel_already_evaluated_returns_400(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp, status="approved")
        api_client.force_authenticate(user=student_user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/cancel/")
        assert resp.status_code == 400
        app.refresh_from_db()
        assert app.status == "approved"

    def test_cancel_other_students_application_returns_403(self, api_client, org, student_user):
        opp = _opp(org)
        other = _student(email="m@e.com", username="maria", matricula="999")
        app = Application.objects.create(student=other.student_profile, opportunity=opp)
        api_client.force_authenticate(user=student_user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/cancel/")
        assert resp.status_code == 403
        app.refresh_from_db()
        assert app.status == "pending"

    def test_cancel_non_student_returns_403(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        api_client.force_authenticate(user=org.user)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/cancel/")
        assert resp.status_code == 403

    def test_cancel_anonymous_returns_401(self, api_client, org, student_user):
        opp = _opp(org)
        app = Application.objects.create(student=student_user.student_profile, opportunity=opp)
        resp = api_client.patch(f"/api/v1/applications/{app.id}/cancel/")
        assert resp.status_code == 401

    def test_cancel_nonexistent_returns_404(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        resp = api_client.patch("/api/v1/applications/00000000-0000-0000-0000-000000000000/cancel/")
        assert resp.status_code == 404