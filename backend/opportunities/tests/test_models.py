import pytest
from django.core.exceptions import ValidationError
from opportunities.models import Opportunity
from users.models import OrganizationProfile, User

@pytest.fixture
def organization_profile(db):
    user = User.objects.create(email="ong@test.com", role="organizacao", username="ong")
    return OrganizationProfile.objects.create(
        user=user, 
        cnpj="12.345.678/0001-95", 
        razao_social="ONG Test", 
        telefone="11999999999", 
        nome_responsavel="Resp", 
        status="approved"
    )

@pytest.mark.django_db
class TestOpportunityModel:
    def test_opportunity_creation(self, organization_profile):
        opportunity = Opportunity.objects.create(
            organization=organization_profile,
            title="Tutoria de Matemática",
            area="educacao",
            description="Dar aulas de matemática",
            workload_value=4,
            workload_unit="h/semana",
            vacancies=5,
            modality="presencial",
            start_date="2026-06-15",
            start_time="14:00"
        )
        assert opportunity.id is not None
        assert opportunity.title == "Tutoria de Matemática"
        assert opportunity.status == Opportunity.Status.DRAFT

    def test_opportunity_default_status(self, organization_profile):
        opportunity = Opportunity.objects.create(
            organization=organization_profile,
            title="Tutoria",
            area="educacao",
            description="Dar aulas",
            workload_value=4,
            workload_unit="h/semana",
            vacancies=5,
            modality="presencial",
            start_date="2026-06-15",
            start_time="14:00"
        )
        assert opportunity.status == "draft"

    def test_opportunity_json_fields_default_to_empty_list(self, organization_profile):
        opportunity = Opportunity.objects.create(
            organization=organization_profile,
            title="Tutoria",
            area="educacao",
            description="Dar aulas",
            workload_value=4,
            workload_unit="h/semana",
            vacancies=5,
            modality="presencial",
            start_date="2026-06-15",
            start_time="14:00"
        )
        assert opportunity.schedule == []
        assert opportunity.requirements == []
        assert opportunity.preferred_courses == []
