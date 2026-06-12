import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from opportunities.serializers import OpportunityCreateSerializer
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

@pytest.fixture
def dummy_image():
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04\x01\x0a\x00\x01\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b',
        content_type='image/jpeg'
    )

@pytest.mark.django_db
class TestOpportunityCreateSerializer:
    def test_create_draft_opportunity_without_photos_is_valid(self):
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
        serializer = OpportunityCreateSerializer(data=data)
        assert serializer.is_valid() is True

    def test_create_active_opportunity_without_photos_is_invalid(self):
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
            "status": "active"
        }
        serializer = OpportunityCreateSerializer(data=data)
        assert serializer.is_valid() is False
        assert "photos" in serializer.errors

    def test_create_active_opportunity_with_photos_is_valid(self, dummy_image):
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
            "status": "active",
            "photos": [dummy_image]
        }
        serializer = OpportunityCreateSerializer(data=data)
        assert serializer.is_valid() is True
