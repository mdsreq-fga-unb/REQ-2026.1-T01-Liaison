import pytest
from rest_framework.test import APIClient
from users.models import User, OrganizationProfile, StudentProfile
from opportunities.models import Opportunity


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def ong_user(db):
    user = User.objects.create(email="ong@test.com", role="organizacao", username="ong")
    user.set_password("pass1234")
    user.save()
    OrganizationProfile.objects.create(
        user=user, cnpj="12.345.678/0001-95", razao_social="ONG Test",
        telefone="11999999999", nome_responsavel="Resp", status="approved"
    )
    return user


@pytest.fixture
def outra_ong(db):
    user = User.objects.create(email="ong2@test.com", role="organizacao", username="ong2")
    user.set_password("pass1234")
    user.save()
    OrganizationProfile.objects.create(
        user=user, cnpj="12.345.678/0002-76", razao_social="Outra ONG",
        telefone="11888888888", nome_responsavel="Outro", status="approved"
    )
    return user


@pytest.fixture
def vaga_rascunho(db, ong_user):
    return Opportunity.objects.create(
        organization=ong_user.organization_profile,
        title="Apoio em Eventos",
        area="educacao",
        description="Dar suporte em eventos educacionais",
        workload_value=4,
        workload_unit="h/semana",
        vacancies=5,
        modality="presencial",
        location="Brasilia",
        start_date="2026-08-01",
        start_time="09:00",
        status=Opportunity.Status.DRAFT
    )


@pytest.fixture
def vaga_ativa(db, ong_user):
    return Opportunity.objects.create(
        organization=ong_user.organization_profile,
        title="Tutoria de Matematica",
        area="educacao",
        description="Dar aulas de reforco",
        workload_value=2,
        workload_unit="h/semana",
        vacancies=3,
        modality="remoto",
        start_date="2026-08-01",
        start_time="14:00",
        status=Opportunity.Status.ACTIVE
    )


@pytest.fixture
def vaga_pausada(db, ong_user):
    return Opportunity.objects.create(
        organization=ong_user.organization_profile,
        title="Coleta de Lixo",
        area="meio_ambiente",
        description="Coleta de materiais reciclaveis",
        workload_value=6,
        workload_unit="h/semana",
        vacancies=10,
        modality="presencial",
        location="Brasilia",
        start_date="2026-08-01",
        start_time="08:00",
        status=Opportunity.Status.PAUSED
    )


@pytest.fixture
def vaga_encerrada(db, ong_user):
    return Opportunity.objects.create(
        organization=ong_user.organization_profile,
        title="Vaga Encerrada",
        area="saude",
        description="Apoio em clinica",
        workload_value=8,
        workload_unit="h/semana",
        vacancies=2,
        modality="presencial",
        location="Brasilia",
        start_date="2026-07-01",
        start_time="10:00",
        status=Opportunity.Status.CLOSED
    )


# ── Issue #50 — US2.2 Edição de Vagas (RF19) ──────────────────────────────
@pytest.mark.django_db
class TestEdicaoVagas:
    def test_ong_pode_editar_vaga_rascunho(self, api_client, ong_user, vaga_rascunho):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(
            f'/api/v1/opportunities/{vaga_rascunho.id}/',
            data={"title": "Apoio em Eventos Atualizado"},
            format="json"
        )
        assert response.status_code == 200
        assert response.data["title"] == "Apoio em Eventos Atualizado"

    def test_ong_pode_editar_vaga_ativa(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(
            f'/api/v1/opportunities/{vaga_ativa.id}/',
            data={"vacancies": 10},
            format="json"
        )
        assert response.status_code == 200
        assert response.data["vacancies"] == 10

    def test_nao_pode_editar_vaga_encerrada(self, api_client, ong_user, vaga_encerrada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(
            f'/api/v1/opportunities/{vaga_encerrada.id}/',
            data={"title": "Tentativa de edicao"},
            format="json"
        )
        assert response.status_code == 400
        assert "encerradas" in response.data["detail"].lower()

    def test_outra_ong_nao_pode_editar(self, api_client, outra_ong, vaga_rascunho):
        api_client.force_authenticate(user=outra_ong)
        response = api_client.patch(
            f'/api/v1/opportunities/{vaga_rascunho.id}/',
            data={"title": "Tentativa"},
            format="json"
        )
        assert response.status_code in [403, 404]

    def test_campos_obrigatorios_nao_podem_ficar_vazios(self, api_client, ong_user, vaga_rascunho):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(
            f'/api/v1/opportunities/{vaga_rascunho.id}/',
            data={"title": ""},
            format="json"
        )
        assert response.status_code == 400


# ── Issue #51 — US2.3 Publicação de Vagas (RF20) ──────────────────────────
@pytest.mark.django_db
class TestPublicacaoVagas:
    def test_publicar_vaga_rascunho(self, api_client, ong_user, vaga_rascunho):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_rascunho.id}/publish/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.ACTIVE
        vaga_rascunho.refresh_from_db()
        assert vaga_rascunho.status == Opportunity.Status.ACTIVE

    def test_nao_pode_publicar_vaga_ja_ativa(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/publish/')
        assert response.status_code == 400
        assert "já está publicada" in response.data["detail"]

    def test_nao_pode_publicar_vaga_encerrada(self, api_client, ong_user, vaga_encerrada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_encerrada.id}/publish/')
        assert response.status_code == 400

    def test_outra_ong_nao_pode_publicar(self, api_client, outra_ong, vaga_rascunho):
        api_client.force_authenticate(user=outra_ong)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_rascunho.id}/publish/')
        assert response.status_code in [403, 404]

    def test_pausar_vaga_ativa(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/pause/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.PAUSED
        vaga_ativa.refresh_from_db()
        assert vaga_ativa.status == Opportunity.Status.PAUSED

    def test_nao_pode_pausar_vaga_nao_ativa(self, api_client, ong_user, vaga_rascunho):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_rascunho.id}/pause/')
        assert response.status_code == 400

    def test_reativar_vaga_pausada(self, api_client, ong_user, vaga_pausada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_pausada.id}/resume/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.ACTIVE
        vaga_pausada.refresh_from_db()
        assert vaga_pausada.status == Opportunity.Status.ACTIVE

    def test_nao_pode_reativar_vaga_nao_pausada(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/resume/')
        assert response.status_code == 400


# ── Issue #52 — US2.4 Encerramento de Vagas (RF21) ────────────────────────
@pytest.mark.django_db
class TestEncerramentoVagas:
    def test_encerrar_vaga_ativa(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/close/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.CLOSED
        vaga_ativa.refresh_from_db()
        assert vaga_ativa.status == Opportunity.Status.CLOSED

    def test_encerrar_vaga_pausada(self, api_client, ong_user, vaga_pausada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_pausada.id}/close/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.CLOSED

    def test_nao_pode_encerrar_rascunho(self, api_client, ong_user, vaga_rascunho):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_rascunho.id}/close/')
        assert response.status_code == 400
        assert "rascunho" in response.data["detail"].lower()

    def test_nao_pode_encerrar_vaga_ja_encerrada(self, api_client, ong_user, vaga_encerrada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_encerrada.id}/close/')
        assert response.status_code == 400

    def test_outra_ong_nao_pode_encerrar(self, api_client, outra_ong, vaga_ativa):
        api_client.force_authenticate(user=outra_ong)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/close/')
        assert response.status_code in [403, 404]

    def test_reabrir_vaga_encerrada(self, api_client, ong_user, vaga_encerrada):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_encerrada.id}/reopen/')
        assert response.status_code == 200
        assert response.data["status"] == Opportunity.Status.ACTIVE
        vaga_encerrada.refresh_from_db()
        assert vaga_encerrada.status == Opportunity.Status.ACTIVE

    def test_nao_pode_reabrir_vaga_nao_encerrada(self, api_client, ong_user, vaga_ativa):
        api_client.force_authenticate(user=ong_user)
        response = api_client.patch(f'/api/v1/opportunities/{vaga_ativa.id}/reopen/')
        assert response.status_code == 400
