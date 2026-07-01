import pytest
from rest_framework.test import APIClient
from django.urls import reverse
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
def unapproved_ong_user(db):
    user = User.objects.create(email="ong2@test.com", role="organizacao", username="ong2")
    user.set_password("pass1234")
    user.save()
    OrganizationProfile.objects.create(
        user=user, cnpj="12.345.678/0002-95", razao_social="ONG Test 2", 
        telefone="11999999999", nome_responsavel="Resp", status="pending"
    )
    return user

@pytest.fixture
def student_user(db):
    user = User.objects.create(email="student@test.com", role="estudante", username="stu")
    user.set_password("pass1234")
    user.save()
    StudentProfile.objects.create(
        user=user, universidade="UnB", curso="Software", matricula="1234"
    )
    return user

@pytest.mark.django_db
class TestOpportunityViews:
    def test_unauthorized_user_cannot_create(self, api_client):
        response = api_client.post('/api/v1/opportunities/', data={"title": "Test"}, format="json")
        assert response.status_code == 401

    def test_student_cannot_create(self, api_client, student_user):
        api_client.force_authenticate(user=student_user)
        response = api_client.post('/api/v1/opportunities/', data={"title": "Test"}, format="json")
        assert response.status_code == 403

    def test_unapproved_ong_cannot_create(self, api_client, unapproved_ong_user):
        api_client.force_authenticate(user=unapproved_ong_user)
        response = api_client.post('/api/v1/opportunities/', data={"title": "Test"}, format="json")
        assert response.status_code == 403

    def test_approved_ong_can_create_draft(self, api_client, ong_user):
        api_client.force_authenticate(user=ong_user)
        data = {
            "title": "Tutoria",
            "area": "educacao",
            "description": "Dar aulas",
            "workload_value": 4,
            "workload_unit": "h/semana",
            "vacancies": 5,
            "modality": "presencial",
            "start_date": "2026-06-15",
            "start_time": "14:00",
            "status": "draft"
        }
        response = api_client.post('/api/v1/opportunities/', data=data, format="json")
        assert response.status_code == 201

    def test_organizations_me_opportunities_list(self, api_client, ong_user):
        # Create an opportunity first
        api_client.force_authenticate(user=ong_user)
        Opportunity.objects.create(
            organization=ong_user.organization_profile,
            title="Tutoria",
            area="educacao",
            description="Dar aulas",
            workload_value=4,
            workload_unit="h/semana",
            vacancies=5,
            modality="presencial",
            start_date="2026-06-15",
            start_time="14:00",
            status="draft"
        )
        response = api_client.get('/api/v1/organizations/me/opportunities/')
        assert response.status_code == 200
        assert len(response.data) > 0 # Assuming Pagination, or len(response.data['results']) if paginated. Let's just check 200

    def test_me_opportunities_per_status_counts(self, api_client, ong_user):
        from applications.models import Application
        api_client.force_authenticate(user=ong_user)
        opp = Opportunity.objects.create(
            organization=ong_user.organization_profile,
            title="Tutoria", area="educacao", description="x",
            workload_value=4, workload_unit="h/semana", vacancies=5,
            modality="presencial", start_date="2026-06-15", start_time="14:00",
            status="active",
        )
        # 3 estudantes distintos (unique_together student+opportunity).
        for i, st in enumerate(["pending", "approved", "rejected"]):
            u = User.objects.create(email=f"s{i}@t.com", role="estudante", username=f"s{i}")
            sp = StudentProfile.objects.create(
                user=u, universidade="UnB", curso="X", matricula=f"m{i}"
            )
            Application.objects.create(student=sp, opportunity=opp, status=st)

        response = api_client.get('/api/v1/organizations/me/opportunities/')
        card = next(o for o in response.data if o["id"] == str(opp.id))
        assert card["applicants_pending"] == 1
        assert card["applicants_approved"] == 1
        assert card["applicants_rejected"] == 1
        assert card["applicants_count"] == 3
