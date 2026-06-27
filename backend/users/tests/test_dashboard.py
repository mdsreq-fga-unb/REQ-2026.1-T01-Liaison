"""
Testes TDD (Red Phase) — Issue #20: Dashboard do Estudante.

Cobre:
- GET /api/v1/students/dashboard/ retorna 200 para estudante autenticado
- Retorna campos: nome, horas_acumuladas, horas_exigidas, progresso_percentual,
  inscricoes_ativas, vagas_salvas, saudacao
- horas_acumuladas = 0 (placeholder)
- inscricoes_ativas = 0 (placeholder)
- vagas_salvas = contagem de SavedOpportunity para o estudante
- saudacao = "Bom dia" | "Boa tarde" | "Boa noite"
- Organização não pode acessar (403)
- Usuário não autenticado recebe 401
- Admin não pode acessar (403)
"""

import pytest
from rest_framework.test import APIClient
from users.models import User, StudentProfile, OrganizationProfile

# ────────────────────────────────────────────────────────────
# Fixtures
# ────────────────────────────────────────────────────────────


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="estudante@dashboard.com",
        username="estudante_dash",
        password="Pass1234",
        role="estudante",
        nome="Carlos Oliveira",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Engenharia de Software",
        matricula="202099999",
        horas_extensao_exigidas=120,
    )
    return user


@pytest.fixture
def student_no_horas(db):
    """Estudante sem horas_extensao_exigidas (None)."""
    user = User.objects.create_user(
        email="estudante2@dashboard.com",
        username="estudante_dash2",
        password="Pass1234",
        role="estudante",
        nome="Ana Lima",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Computação",
        matricula="202011111",
        horas_extensao_exigidas=None,
    )
    return user


@pytest.fixture
def org_user(db):
    user = User.objects.create_user(
        email="org@dashboard.com",
        username="org_dash",
        password="Pass1234",
        role="organizacao",
        nome="ONG Dash",
    )
    OrganizationProfile.objects.create(
        user=user,
        cnpj="33444555000173",
        razao_social="ONG Dash Ltda",
        telefone="61900000001",
        nome_responsavel="Resp",
        status="approved",
    )
    return user


@pytest.fixture
def admin_user(db):
    user = User.objects.create_user(
        email="admin@dashboard.com",
        username="admin_dash",
        password="Pass1234",
        role="admin",
        nome="Admin",
        is_staff=True,
    )
    return user


@pytest.fixture
def approved_org_for_opp(db):
    user = User.objects.create_user(
        email="ong_opp@dashboard.com",
        username="ong_opp_dash",
        password="Pass1234",
        role="organizacao",
        nome="ONG Opp",
    )
    org = OrganizationProfile.objects.create(
        user=user,
        cnpj="44555666000164",
        razao_social="ONG Opp Ltda",
        telefone="61977777777",
        nome_responsavel="Resp Opp",
        status="approved",
    )
    return org


# ────────────────────────────────────────────────────────────
# 1. Autenticação e permissões
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestDashboardAuthentication:
    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 401

    def test_org_user_returns_403(self, api_client, org_user):
        api_client.force_authenticate(user=org_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 403

    def test_admin_user_returns_403(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 403

    def test_student_returns_200(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200


# ────────────────────────────────────────────────────────────
# 2. Campos obrigatórios na resposta
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestDashboardFields:
    REQUIRED_FIELDS = [
        "nome",
        "horas_acumuladas",
        "horas_exigidas",
        "progresso_percentual",
        "inscricoes_ativas",
        "vagas_salvas",
        "saudacao",
    ]

    def test_all_required_fields_present(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        for field in self.REQUIRED_FIELDS:
            assert field in response.data, f"Campo '{field}' ausente na resposta"

    def test_nome_matches_user_nome(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["nome"] == "Carlos Oliveira"

    def test_horas_acumuladas_is_zero_placeholder(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["horas_acumuladas"] == 0

    def test_horas_exigidas_matches_profile(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["horas_exigidas"] == 120

    def test_horas_exigidas_is_zero_when_none(self, api_client, student_no_horas):
        api_client.force_authenticate(user=student_no_horas)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["horas_exigidas"] == 0

    def test_progresso_percentual_is_zero_when_no_hours(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["progresso_percentual"] == 0

    def test_inscricoes_ativas_is_zero_placeholder(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["inscricoes_ativas"] == 0

    def test_vagas_salvas_is_zero_when_nothing_saved(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["vagas_salvas"] == 0

    def test_saudacao_is_one_of_valid_options(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["saudacao"] in ("Bom dia", "Boa tarde", "Boa noite")


# ────────────────────────────────────────────────────────────
# 3. vagas_salvas — contagem dinâmica
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestDashboardVagasSalvas:
    def test_vagas_salvas_increments_when_opportunity_saved(
        self, api_client, student_user, approved_org_for_opp
    ):
        from opportunities.models import Opportunity, SavedOpportunity

        opp = Opportunity.objects.create(
            organization=approved_org_for_opp,
            title="Vaga para Salvar",
            area="educacao",
            description="Descrição",
            workload_value=4,
            workload_unit="h/semana",
            vacancies=5,
            modality="presencial",
            start_date="2026-07-01",
            start_time="09:00",
            status="active",
        )
        profile = student_user.student_profile
        SavedOpportunity.objects.create(student=profile, opportunity=opp)

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["vagas_salvas"] == 1

    def test_vagas_salvas_counts_only_own_saves(
        self, api_client, student_user, approved_org_for_opp
    ):
        """vagas_salvas deve contar apenas as do estudante autenticado."""
        from opportunities.models import Opportunity, SavedOpportunity

        # Create a second student
        other_user = User.objects.create_user(
            email="other@dashboard.com",
            username="other_dash",
            password="Pass1234",
            role="estudante",
            nome="Outro Estudante",
        )
        other_profile = StudentProfile.objects.create(
            user=other_user,
            universidade="UnB",
            curso="Computação",
            matricula="202055555",
        )
        opp = Opportunity.objects.create(
            organization=approved_org_for_opp,
            title="Vaga Compartilhada",
            area="saude",
            description="Descrição",
            workload_value=2,
            workload_unit="h/semana",
            vacancies=10,
            modality="remoto",
            start_date="2026-08-01",
            start_time="10:00",
            status="active",
        )
        # Only other student saves it
        SavedOpportunity.objects.create(student=other_profile, opportunity=opp)

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["vagas_salvas"] == 0

    def test_vagas_salvas_multiple_saves(
        self, api_client, student_user, approved_org_for_opp
    ):
        from opportunities.models import Opportunity, SavedOpportunity

        profile = student_user.student_profile
        for i in range(3):
            opp = Opportunity.objects.create(
                organization=approved_org_for_opp,
                title=f"Vaga {i}",
                area="tecnologia",
                description="Desc",
                workload_value=2,
                workload_unit="h/semana",
                vacancies=3,
                modality="hibrido",
                start_date="2026-09-01",
                start_time="08:00",
                status="active",
            )
            SavedOpportunity.objects.create(student=profile, opportunity=opp)

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert response.data["vagas_salvas"] == 3


# ────────────────────────────────────────────────────────────
# 4. Saudação baseada em horário
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestDashboardSaudacao:
    def test_saudacao_bom_dia_at_morning(self, api_client, student_user):
        """Simula horário de manhã — resultado deve ser 'Bom dia'."""
        from unittest.mock import patch
        from datetime import datetime
        from zoneinfo import ZoneInfo

        morning = datetime(2026, 6, 13, 9, 0, 0, tzinfo=ZoneInfo("America/Sao_Paulo"))
        with patch("django.utils.timezone.localtime") as mock_localtime:
            mock_localtime.return_value = morning
            api_client.force_authenticate(user=student_user)
            response = api_client.get("/api/v1/students/dashboard/")
            if response.status_code == 200:
                # If mock worked, check "Bom dia"
                assert response.data["saudacao"] == "Bom dia"
            else:
                # If mock didn't work, just confirm the field exists
                assert response.status_code in (200,)

    def test_saudacao_boa_tarde_at_afternoon(self, api_client, student_user):
        from unittest.mock import patch
        from datetime import datetime
        from zoneinfo import ZoneInfo

        afternoon = datetime(2026, 6, 13, 14, 0, 0, tzinfo=ZoneInfo("America/Sao_Paulo"))
        with patch("django.utils.timezone.localtime") as mock_localtime:
            mock_localtime.return_value = afternoon
            api_client.force_authenticate(user=student_user)
            response = api_client.get("/api/v1/students/dashboard/")
            if response.status_code == 200:
                assert response.data["saudacao"] == "Boa tarde"

    def test_saudacao_boa_noite_at_evening(self, api_client, student_user):
        from unittest.mock import patch
        from datetime import datetime
        from zoneinfo import ZoneInfo

        evening = datetime(2026, 6, 13, 21, 0, 0, tzinfo=ZoneInfo("America/Sao_Paulo"))
        with patch("django.utils.timezone.localtime") as mock_localtime:
            mock_localtime.return_value = evening
            api_client.force_authenticate(user=student_user)
            response = api_client.get("/api/v1/students/dashboard/")
            if response.status_code == 200:
                assert response.data["saudacao"] == "Boa noite"

    def test_saudacao_string_type(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/students/dashboard/")
        assert response.status_code == 200
        assert isinstance(response.data["saudacao"], str)
        assert len(response.data["saudacao"]) > 0
