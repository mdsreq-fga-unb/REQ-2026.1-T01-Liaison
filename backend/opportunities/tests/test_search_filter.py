"""
Testes TDD (Red Phase) — Issue #20: Busca, Filtro e Salvar Vagas.

Cobre:
- Filtro por search (title, description, area, org name)
- Filtro por area (exact)
- Filtro por featured (bool)
- Filtro por modality (exact)
- Ordenação: featured first, then -created_at
- Campo is_saved reflete estado real por estudante
- Campo applicants_count presente (placeholder 0)
- Save endpoint (POST idempotente → 201/200)
- Unsave endpoint (DELETE → 204; 404 se não salvo)
- Autenticação obrigatória em save/unsave
- Somente estudante pode salvar
- Categories endpoint: retorna contagens por área + "all"
- SavedOpportunity model: unique_together garante sem duplicatas
"""

import uuid
import pytest
from rest_framework.test import APIClient
from django.utils import timezone

from users.models import User, OrganizationProfile, StudentProfile
from opportunities.models import Opportunity

# ────────────────────────────────────────────────────────────
# Fixtures
# ────────────────────────────────────────────────────────────


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def approved_org(db):
    """Organização aprovada com perfil."""
    user = User.objects.create_user(
        email="ong@example.com",
        username="ong_user",
        password="Pass1234",
        role="organizacao",
        nome="ONG Exemplo",
    )
    org = OrganizationProfile.objects.create(
        user=user,
        cnpj="11222333000181",
        razao_social="ONG Exemplo Ltda",
        telefone="61999999999",
        nome_responsavel="Responsável",
        status="approved",
    )
    return org


@pytest.fixture
def approved_org2(db):
    """Segunda organização aprovada para testes de multi-org."""
    user = User.objects.create_user(
        email="ong2@example.com",
        username="ong_user2",
        password="Pass1234",
        role="organizacao",
        nome="ONG Saúde",
    )
    org = OrganizationProfile.objects.create(
        user=user,
        cnpj="22333444000192",
        razao_social="ONG Saúde Ltda",
        telefone="61988888888",
        nome_responsavel="Responsável 2",
        status="approved",
    )
    return org


@pytest.fixture
def student_user(db):
    """Estudante com perfil completo."""
    user = User.objects.create_user(
        email="estudante@example.com",
        username="estudante_user",
        password="Pass1234",
        role="estudante",
        nome="João Silva",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Engenharia de Software",
        matricula="202012345",
        horas_extensao_exigidas=120,
    )
    return user


@pytest.fixture
def student_user2(db):
    """Segundo estudante."""
    user = User.objects.create_user(
        email="estudante2@example.com",
        username="estudante_user2",
        password="Pass1234",
        role="estudante",
        nome="Maria Santos",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Ciências da Computação",
        matricula="202067890",
    )
    return user


def _make_opportunity(org, title="Vaga Teste", area="educacao", status="active",
                       modality="presencial", featured=False, description="Desc padrão",
                       location="Brasília - DF", workload_value=4):
    return Opportunity.objects.create(
        organization=org,
        title=title,
        area=area,
        description=description,
        workload_value=workload_value,
        workload_unit="h/semana",
        vacancies=5,
        modality=modality,
        location=location,
        start_date="2026-07-01",
        start_time="09:00",
        status=status,
        featured=featured,
    )


# ────────────────────────────────────────────────────────────
# 1. Filtro por search
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSearchFilter:
    def test_search_by_title_returns_matching_opportunity(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Tutoria de Matemática")
        _make_opportunity(approved_org, title="Aula de Português")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"search": "Matemática"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Tutoria de Matemática" in titles
        assert "Aula de Português" not in titles

    def test_search_by_description_returns_matching_opportunity(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Vaga A", description="Ensino de robótica para crianças")
        _make_opportunity(approved_org, title="Vaga B", description="Atendimento médico")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"search": "robótica"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Vaga A" in titles
        assert "Vaga B" not in titles

    def test_search_case_insensitive(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Voluntariado Ambiental")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"search": "ambiental"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) >= 1

    def test_search_no_match_returns_empty(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Tutoria de Matemática")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"search": "xyzabcdef_notfound"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) == 0

    def test_search_without_param_returns_all_active(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Vaga 1")
        _make_opportunity(approved_org, title="Vaga 2")
        _make_opportunity(approved_org, title="Vaga Draft", status="draft")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Vaga Draft" not in titles
        assert "Vaga 1" in titles
        assert "Vaga 2" in titles


# ────────────────────────────────────────────────────────────
# 2. Filtro por area
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestAreaFilter:
    def test_filter_by_area_educacao(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Tutoria", area="educacao")
        _make_opportunity(approved_org, title="Consulta", area="saude")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"area": "educacao"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        areas = [r["area"] for r in results]
        assert all(a == "educacao" for a in areas)

    def test_filter_by_area_saude(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Consulta", area="saude")
        _make_opportunity(approved_org, title="Tutoria", area="educacao")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"area": "saude"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) == 1
        assert results[0]["area"] == "saude"

    def test_filter_area_invalid_value_returns_empty_or_error(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Tutoria", area="educacao")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"area": "invalid_area"})
        assert response.status_code in (200, 400)
        if response.status_code == 200:
            results = response.data.get("results", response.data)
            assert len(results) == 0


# ────────────────────────────────────────────────────────────
# 3. Filtro por featured
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestFeaturedFilter:
    def test_filter_featured_true_returns_only_featured(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Destaque", featured=True)
        _make_opportunity(approved_org, title="Normal", featured=False)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"featured": "true"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) == 1
        assert results[0]["title"] == "Destaque"

    def test_featured_field_present_in_response(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Vaga Teste", featured=True)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) >= 1
        assert "featured" in results[0]

    def test_ordering_featured_first(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Normal 1", featured=False)
        _make_opportunity(approved_org, title="Destaque", featured=True)
        _make_opportunity(approved_org, title="Normal 2", featured=False)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert results[0]["title"] == "Destaque"


# ────────────────────────────────────────────────────────────
# 4. Filtro por modality
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestModalityFilter:
    def test_filter_by_modality_remoto(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Remoto", modality="remoto")
        _make_opportunity(approved_org, title="Presencial", modality="presencial")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"modality": "remoto"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) == 1
        assert results[0]["title"] == "Remoto"

    def test_filter_by_modality_presencial(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Presencial", modality="presencial")
        _make_opportunity(approved_org, title="Remoto", modality="remoto")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"modality": "presencial"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert all(r["modality"] == "presencial" for r in results)


# ────────────────────────────────────────────────────────────
# 4b. Filtro por location (icontains, case-insensitive) — Issue #20
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestLocationFilter:
    def test_filter_by_location_returns_only_matching(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Em Brasília", location="Brasília - DF")
        _make_opportunity(approved_org, title="Em São Paulo", location="São Paulo - SP")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"location": "Brasília"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Em Brasília" in titles
        assert "Em São Paulo" not in titles

    def test_filter_by_location_is_partial_icontains(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Centro", location="Brasília - Plano Piloto")
        _make_opportunity(approved_org, title="Outra", location="Goiânia - GO")
        api_client.force_authenticate(user=student_user)
        # partial substring should match
        response = api_client.get("/api/v1/opportunities/", {"location": "Plano"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Centro" in titles
        assert "Outra" not in titles

    def test_filter_by_location_case_insensitive(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Em Brasília", location="Brasília - DF")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"location": "brasília"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Em Brasília" in titles

    def test_filter_by_location_no_match_returns_empty(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Em Brasília", location="Brasília - DF")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"location": "Recife"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) == 0

    def test_no_location_param_returns_all(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="A", location="Brasília - DF")
        _make_opportunity(approved_org, title="B", location="São Paulo - SP")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "A" in titles and "B" in titles


# ────────────────────────────────────────────────────────────
# 4c. Filtro por workload_max (workload_value <= N) — Issue #20
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestWorkloadMaxFilter:
    def test_filter_workload_max_returns_only_lte(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Leve", workload_value=2)
        _make_opportunity(approved_org, title="Média", workload_value=8)
        _make_opportunity(approved_org, title="Pesada", workload_value=20)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"workload_max": "8"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Leve" in titles
        assert "Média" in titles
        assert "Pesada" not in titles

    def test_filter_workload_max_inclusive_boundary(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Exata", workload_value=10)
        _make_opportunity(approved_org, title="Acima", workload_value=11)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/", {"workload_max": "10"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Exata" in titles
        assert "Acima" not in titles

    def test_filter_workload_max_non_integer_is_ignored(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Leve", workload_value=2)
        _make_opportunity(approved_org, title="Pesada", workload_value=20)
        api_client.force_authenticate(user=student_user)
        # Non-integer value must be ignored → returns all (no filtering)
        response = api_client.get("/api/v1/opportunities/", {"workload_max": "abc"})
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Leve" in titles
        assert "Pesada" in titles

    def test_no_workload_max_param_returns_all(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Leve", workload_value=2)
        _make_opportunity(approved_org, title="Pesada", workload_value=20)
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Leve" in titles and "Pesada" in titles

    def test_location_and_workload_max_combined(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Match", location="Brasília - DF", workload_value=4)
        _make_opportunity(approved_org, title="WrongLocation", location="Recife - PE", workload_value=4)
        _make_opportunity(approved_org, title="TooHeavy", location="Brasília - DF", workload_value=30)
        api_client.force_authenticate(user=student_user)
        response = api_client.get(
            "/api/v1/opportunities/", {"location": "Brasília", "workload_max": "10"}
        )
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Match" in titles
        assert "WrongLocation" not in titles
        assert "TooHeavy" not in titles


# ────────────────────────────────────────────────────────────
# 5. Campo is_saved
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestIsSavedField:
    def test_is_saved_false_when_not_saved(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Não salva")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        assert len(results) >= 1
        assert results[0]["is_saved"] is False

    def test_is_saved_true_after_saving(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org, title="A Salvar")
        api_client.force_authenticate(user=student_user)
        # Save the opportunity first
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        # Now listing should show is_saved=True
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        saved_opp = next((r for r in results if r["title"] == "A Salvar"), None)
        assert saved_opp is not None
        assert saved_opp["is_saved"] is True

    def test_is_saved_isolated_per_student(self, api_client, student_user, student_user2, approved_org):
        opp = _make_opportunity(approved_org, title="Vaga Compartilhada")
        # Student 1 saves
        api_client.force_authenticate(user=student_user)
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        # Student 2 checks
        api_client.force_authenticate(user=student_user2)
        response = api_client.get("/api/v1/opportunities/")
        results = response.data.get("results", response.data)
        shared = next((r for r in results if r["title"] == "Vaga Compartilhada"), None)
        assert shared is not None
        assert shared["is_saved"] is False

    def test_applicants_count_field_present_and_zero(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Vaga Teste")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        results = response.data.get("results", response.data)
        assert len(results) >= 1
        assert "applicants_count" in results[0]
        assert results[0]["applicants_count"] == 0


# ────────────────────────────────────────────────────────────
# 6. Save / Unsave endpoints
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSaveOpportunity:
    def test_student_can_save_opportunity(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        response = api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code in (200, 201)

    def test_save_is_idempotent_second_call_returns_200(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        r1 = api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        assert r1.status_code == 201
        r2 = api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        assert r2.status_code == 200

    def test_unauthenticated_cannot_save(self, api_client, approved_org):
        opp = _make_opportunity(approved_org)
        response = api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code == 401

    def test_org_user_cannot_save(self, api_client, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=approved_org.user)
        response = api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code == 403

    def test_save_nonexistent_opportunity_returns_404(self, api_client, student_user):
        fake_id = uuid.uuid4()
        api_client.force_authenticate(user=student_user)
        response = api_client.post(f"/api/v1/opportunities/{fake_id}/save/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestUnsaveOpportunity:
    def test_student_can_unsave_saved_opportunity(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        response = api_client.delete(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code == 204

    def test_unsave_not_saved_returns_404(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        response = api_client.delete(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code == 404

    def test_unauthenticated_cannot_unsave(self, api_client, approved_org):
        opp = _make_opportunity(approved_org)
        response = api_client.delete(f"/api/v1/opportunities/{opp.id}/save/")
        assert response.status_code == 401

    def test_save_then_unsave_then_is_saved_false(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        api_client.delete(f"/api/v1/opportunities/{opp.id}/save/")
        response = api_client.get("/api/v1/opportunities/")
        results = response.data.get("results", response.data)
        assert results[0]["is_saved"] is False


# ────────────────────────────────────────────────────────────
# 7. Categories endpoint
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestCategoriesEndpoint:
    def test_categories_returns_list(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, area="educacao")
        _make_opportunity(approved_org, area="educacao")
        _make_opportunity(approved_org, area="saude")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/categories/")
        assert response.status_code == 200
        assert isinstance(response.data, list)

    def test_categories_first_item_is_all(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, area="educacao")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/categories/")
        assert response.status_code == 200
        assert response.data[0]["area"] == "all"
        assert response.data[0]["label"] == "Todas"

    def test_categories_counts_active_only(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, area="educacao", status="active")
        _make_opportunity(approved_org, area="educacao", status="draft")
        _make_opportunity(approved_org, area="saude", status="active")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/categories/")
        assert response.status_code == 200
        all_item = next(r for r in response.data if r["area"] == "all")
        educacao_item = next((r for r in response.data if r["area"] == "educacao"), None)
        # all should have 2 active (educacao + saude), not 3 (ignoring draft)
        assert all_item["count"] == 2
        assert educacao_item is not None
        assert educacao_item["count"] == 1

    def test_categories_each_item_has_required_fields(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, area="tecnologia")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/categories/")
        assert response.status_code == 200
        for item in response.data:
            assert "area" in item
            assert "label" in item
            assert "count" in item

    def test_categories_unauthenticated_returns_401(self, api_client, approved_org):
        _make_opportunity(approved_org, area="educacao")
        response = api_client.get("/api/v1/opportunities/categories/")
        assert response.status_code == 401


# ────────────────────────────────────────────────────────────
# 8. Students only see active opportunities
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestStudentOpportunityVisibility:
    def test_students_see_only_active(self, api_client, student_user, approved_org):
        _make_opportunity(approved_org, title="Ativa", status="active")
        _make_opportunity(approved_org, title="Rascunho", status="draft")
        _make_opportunity(approved_org, title="Pausada", status="paused")
        _make_opportunity(approved_org, title="Encerrada", status="closed")
        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Ativa" in titles
        assert "Rascunho" not in titles
        assert "Pausada" not in titles
        assert "Encerrada" not in titles

    def test_org_user_sees_own_opportunities(self, api_client, approved_org, approved_org2):
        _make_opportunity(approved_org, title="Minha Vaga", status="draft")
        _make_opportunity(approved_org2, title="Vaga Outra Org", status="active")
        api_client.force_authenticate(user=approved_org.user)
        response = api_client.get("/api/v1/opportunities/")
        assert response.status_code == 200
        results = response.data.get("results", response.data)
        titles = [r["title"] for r in results]
        assert "Minha Vaga" in titles
        assert "Vaga Outra Org" not in titles


# ────────────────────────────────────────────────────────────
# 9. SavedOpportunity model — unique_together constraint
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSavedOpportunityModel:
    def test_saving_same_opportunity_twice_no_duplicate(self, api_client, student_user, approved_org):
        opp = _make_opportunity(approved_org)
        api_client.force_authenticate(user=student_user)
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        api_client.post(f"/api/v1/opportunities/{opp.id}/save/")
        # Should only have one saved record
        from opportunities.models import SavedOpportunity
        profile = student_user.student_profile
        count = SavedOpportunity.objects.filter(
            student=profile, opportunity=opp
        ).count()
        assert count == 1

    def test_saved_opportunity_model_exists(self, db):
        from opportunities.models import SavedOpportunity
        assert SavedOpportunity is not None

    def test_saved_opportunity_has_correct_fields(self, db, approved_org, student_user):
        from opportunities.models import SavedOpportunity
        opp = _make_opportunity(approved_org)
        profile = student_user.student_profile
        saved = SavedOpportunity.objects.create(student=profile, opportunity=opp)
        assert saved.student == profile
        assert saved.opportunity == opp
        assert saved.saved_at is not None
