"""
Testes do perfil da organização — US1.5 Phase 2.

Cobre models, serializers e views do perfil institucional da organização.
"""

import io
import pytest
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

User = get_user_model()

VALID_CNPJ = "11222333000181"


def _make_image_bytes(width=100, height=100):
    """Cria uma imagem JPEG válida em bytes."""
    img = Image.new("RGB", (width, height), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.read()


def _make_image_file(name="test.jpg"):
    """Cria um SimpleUploadedFile de imagem."""
    return SimpleUploadedFile(name, _make_image_bytes(), content_type="image/jpeg")


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def org_user(db):
    """Cria um User + OrganizationProfile e retorna (user, org)."""
    user = User.objects.create_user(
        username="ong_test",
        email="ong@test.com",
        password="Senha123",
        nome="ONG Teste",
        role=User.Role.ORGANIZACAO,
        is_active=True,
    )
    from users.models import OrganizationProfile

    org = OrganizationProfile.objects.create(
        user=user,
        cnpj=VALID_CNPJ,
        razao_social="ONG Teste LTDA",
        nome_fantasia="ONG Teste",
        telefone="(11) 99999-9999",
        nome_responsavel="Responsavel Teste",
        status="approved",
    )
    return user, org


@pytest.fixture
def authenticated_client(client, org_user):
    """Cliente autenticado como organização."""
    user, _ = org_user
    response = client.post(
        "/api/v1/auth/login/",
        {"cnpj": "11.222.333/0001-81", "password": "Senha123"},
        format="json",
    )
    token = response.json()["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


# ────────────────────────────────────────────────────────────
# Model Tests
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestOrganizationProfileModel:
    """Testes do model OrganizationProfile (novos campos)."""

    def test_new_fields_exist(self, org_user):
        """Todos os novos campos existem no modelo."""
        _, org = org_user
        assert hasattr(org, "logo")
        assert hasattr(org, "banner")
        assert hasattr(org, "mission")
        assert hasattr(org, "full_description")
        assert hasattr(org, "areas_de_atuacao")
        assert hasattr(org, "site")
        assert hasattr(org, "endereco")

    def test_mission_default_empty(self, org_user):
        """Mission tem default vazio."""
        _, org = org_user
        assert org.mission == ""

    def test_full_description_default_empty(self, org_user):
        """Full description tem default vazio."""
        _, org = org_user
        assert org.full_description == ""

    def test_areas_de_atuacao_default_empty_list(self, org_user):
        """Areas de atuacao tem default lista vazia."""
        _, org = org_user
        assert org.areas_de_atuacao == []

    def test_site_default_empty(self, org_user):
        """Site tem default vazio."""
        _, org = org_user
        assert org.site == ""

    def test_endereco_default_empty(self, org_user):
        """Endereco tem default vazio."""
        _, org = org_user
        assert org.endereco == ""

    def test_logo_null_by_default(self, org_user):
        """Logo é null por default."""
        _, org = org_user
        assert not org.logo

    def test_banner_null_by_default(self, org_user):
        """Banner é null por default."""
        _, org = org_user
        assert not org.banner

    def test_mission_max_length_300(self, org_user):
        """Mission respeita max_length=300."""
        _, org = org_user
        org.mission = "A" * 300
        org.save()
        assert len(org.mission) == 300

    def test_full_description_max_length_2000(self, org_user):
        """Full description respeita max_length=2000."""
        _, org = org_user
        org.full_description = "B" * 2000
        org.save()
        assert len(org.full_description) == 2000

    def test_areas_de_atuacao_stores_list(self, org_user):
        """Areas de atuacao armazena lista de strings."""
        _, org = org_user
        org.areas_de_atuacao = ["saude", "educacao"]
        org.save()
        org.refresh_from_db()
        assert org.areas_de_atuacao == ["saude", "educacao"]


@pytest.mark.django_db
class TestOrgGalleryPhotoModel:
    """Testes do model OrgGalleryPhoto."""

    def test_create_gallery_photo(self, org_user):
        """Cria uma foto de galeria da organização."""
        from users.models import OrgGalleryPhoto

        _, org = org_user
        photo = OrgGalleryPhoto.objects.create(
            organization_profile=org,
            image=_make_image_file(),
        )
        assert photo.id is not None
        assert photo.organization_profile == org

    def test_gallery_photo_str(self, org_user):
        """Str representation inclui id."""
        from users.models import OrgGalleryPhoto

        _, org = org_user
        photo = OrgGalleryPhoto.objects.create(
            organization_profile=org,
            image=_make_image_file(),
        )
        assert str(photo.id) in str(photo)

    def test_gallery_photos_related_name(self, org_user):
        """Related name 'gallery_photos' funciona."""
        from users.models import OrgGalleryPhoto

        _, org = org_user
        OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file("a.jpg")
        )
        OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file("b.jpg")
        )
        assert org.gallery_photos.count() == 2

    def test_gallery_photo_ordering_newest_first(self, org_user):
        """Ordenação por -created_at."""
        from users.models import OrgGalleryPhoto

        _, org = org_user
        p1 = OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file("a.jpg")
        )
        p2 = OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file("b.jpg")
        )
        photos = list(org.gallery_photos.all())
        assert photos[0].id == p2.id  # mais novo primeiro

    def test_gallery_photo_cascade_delete_with_profile(self, org_user):
        """Ao deletar profile, fotos da galeria são deletadas em cascade."""
        from users.models import OrgGalleryPhoto

        user, org = org_user
        OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file()
        )
        user.delete()
        assert OrgGalleryPhoto.objects.count() == 0


# ────────────────────────────────────────────────────────────
# Serializer Tests
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestOrgGalleryPhotoSerializer:
    """Testes do OrgGalleryPhotoSerializer."""

    def test_fields_present(self, org_user):
        """Serializador inclui id, image_url, created_at."""
        from users.serializers import OrgGalleryPhotoSerializer
        from users.models import OrgGalleryPhoto

        _, org = org_user
        photo = OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file()
        )
        serializer = OrgGalleryPhotoSerializer(photo)
        data = serializer.data
        assert "id" in data
        assert "image_url" in data
        assert "created_at" in data


@pytest.mark.django_db
class TestOrganizationProfileDetailSerializer:
    """Testes do OrganizationProfileDetailSerializer."""

    def test_all_fields_present(self, org_user):
        """Todos os campos do perfil estão presentes."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        data = serializer.data
        expected_fields = [
            "id", "email", "nome", "cnpj", "razao_social", "nome_fantasia",
            "telefone", "nome_responsavel", "mission", "full_description",
            "areas_de_atuacao", "site", "endereco", "logo_url", "banner_url",
            "gallery", "stats", "events", "open_positions",
        ]
        for field in expected_fields:
            assert field in data, f"Campo '{field}' ausente"

    def test_id_is_user_uuid_str(self, org_user):
        """ID é o UUID do User como string."""
        from users.serializers import OrganizationProfileDetailSerializer

        user, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["id"] == str(user.id)

    def test_email_from_user(self, org_user):
        """Email vem do User."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["email"] == "ong@test.com"

    def test_nome_from_user(self, org_user):
        """Nome vem do User."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["nome"] == "ONG Teste"

    def test_logo_url_none_when_no_logo(self, org_user):
        """Logo_url é None quando não há logo."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["logo_url"] is None

    def test_banner_url_none_when_no_banner(self, org_user):
        """Banner_url é None quando não há banner."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["banner_url"] is None

    def test_gallery_list_empty(self, org_user):
        """Gallery é lista vazia quando não há fotos."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["gallery"] == []

    def test_gallery_with_photos(self, org_user):
        """Gallery inclui fotos quando existem."""
        from users.models import OrgGalleryPhoto
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file()
        )
        serializer = OrganizationProfileDetailSerializer(org)
        assert len(serializer.data["gallery"]) == 1

    def test_stats_structure(self, org_user):
        """Stats tem estrutura correta."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        stats = serializer.data["stats"]
        assert "total_events" in stats
        assert "total_volunteers" in stats
        assert "rating" in stats
        assert stats["total_events"] == 0
        assert stats["total_volunteers"] == 0
        assert stats["rating"] == 0

    def test_events_empty_list(self, org_user):
        """Events é lista vazia."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["events"] == []

    def test_open_positions_empty_list(self, org_user):
        """Open positions é lista vazia."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert serializer.data["open_positions"] == []

    def test_cnpj_is_readonly(self, org_user):
        """CNPJ é exibido no serializador."""
        from users.serializers import OrganizationProfileDetailSerializer

        _, org = org_user
        serializer = OrganizationProfileDetailSerializer(org)
        assert "cnpj" in serializer.data


@pytest.mark.django_db
class TestOrganizationProfileUpdateSerializer:
    """Testes do OrganizationProfileUpdateSerializer."""

    def test_valid_update_fields(self, org_user):
        """Campos válidos passam na validação."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"nome_fantasia": "ONG Renovada"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_update_nome_fantasia(self, org_user):
        """Update de nome_fantasia funciona."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"nome_fantasia": "ONG Renovada"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        updated = serializer.save()
        assert updated.nome_fantasia == "ONG Renovada"

    def test_update_mission(self, org_user):
        """Update de mission funciona."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"mission": "Missão da ONG"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        updated = serializer.save()
        assert updated.mission == "Missão da ONG"

    def test_update_areas_de_atuacao(self, org_user):
        """Update de areas_de_atuacao funciona."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"areas_de_atuacao": ["saude", "educacao", "tecnologia", "meio_ambiente"]},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        updated = serializer.save()
        assert len(updated.areas_de_atuacao) == 4

    def test_update_nome_through_user(self, org_user):
        """Update de nome através do User funciona."""
        from users.serializers import OrganizationProfileUpdateSerializer

        user, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"nome": "ONG Novo Nome"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        user.refresh_from_db()
        assert user.nome == "ONG Novo Nome"

    def test_email_unchanged_allowed(self, org_user):
        """Email não alterado é permitido."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"email": "ong@test.com"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_email_change_rejected(self, org_user):
        """Email não pode ser alterado."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"email": "new@test.com"},
            partial=True,
        )
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_cnpj_unchanged_allowed(self, org_user):
        """CNPJ não alterado é permitido."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"cnpj": "11.222.333/0001-81"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_cnpj_change_rejected(self, org_user):
        """CNPJ não pode ser alterado."""
        from users.serializers import OrganizationProfileUpdateSerializer

        _, org = org_user
        serializer = OrganizationProfileUpdateSerializer(
            org,
            data={"cnpj": "99.888.777/0001-66"},
            partial=True,
        )
        assert not serializer.is_valid()
        assert "cnpj" in serializer.errors


@pytest.mark.django_db
class TestOrgUploadSerializers:
    """Testes dos serializers de upload da organização."""

    def test_logo_upload_valid(self):
        """Logo upload com imagem válida é aceito."""
        from users.serializers import OrgLogoUploadSerializer

        serializer = OrgLogoUploadSerializer(
            data={"logo": _make_image_file()}
        )
        assert serializer.is_valid(), serializer.errors

    def test_logo_upload_invalid_extension(self):
        """Logo upload com extensão inválida é rejeitado."""
        from users.serializers import OrgLogoUploadSerializer

        bad_file = SimpleUploadedFile("doc.pdf", b"not an image", content_type="application/pdf")
        serializer = OrgLogoUploadSerializer(data={"logo": bad_file})
        assert not serializer.is_valid()

    def test_banner_upload_valid(self):
        """Banner upload com imagem válida é aceito."""
        from users.serializers import OrgBannerUploadSerializer

        serializer = OrgBannerUploadSerializer(
            data={"banner": _make_image_file()}
        )
        assert serializer.is_valid(), serializer.errors

    def test_gallery_upload_valid_multiple(self):
        """Gallery upload com múltiplas imagens é aceito."""
        from users.serializers import OrgGalleryUploadSerializer

        serializer = OrgGalleryUploadSerializer(
            data={"images": [_make_image_file("a.jpg"), _make_image_file("b.jpg")]}
        )
        assert serializer.is_valid(), serializer.errors

    def test_gallery_upload_empty_rejected(self):
        """Gallery upload com lista vazia é rejeitado."""
        from users.serializers import OrgGalleryUploadSerializer

        serializer = OrgGalleryUploadSerializer(data={"images": []})
        assert not serializer.is_valid()

    def test_gallery_upload_create_photos(self, org_user):
        """Gallery upload cria fotos no banco."""
        from users.serializers import OrgGalleryUploadSerializer
        from users.models import OrgGalleryPhoto

        _, org = org_user
        serializer = OrgGalleryUploadSerializer(
            data={"images": [_make_image_file("g1.jpg")]}
        )
        assert serializer.is_valid(), serializer.errors
        photos = serializer.create(serializer.validated_data, organization_profile=org)
        assert len(photos) == 1
        assert OrgGalleryPhoto.objects.count() == 1


# ────────────────────────────────────────────────────────────
# View Tests
# ────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestOrgProfileAuth:
    """Testes de autenticação/permissão das views de organização."""

    def test_unauthenticated_gets_401(self, client):
        """Não autenticado recebe 401."""
        response = client.get("/api/v1/organizations/me/")
        assert response.status_code == 401

    def test_wrong_role_estudante_gets_403(self, client):
        """Estudante recebe 403 nos endpoints de organização."""
        estudante = User.objects.create_user(
            username="estudante",
            email="estudante@test.com",
            password="Senha123",
            role=User.Role.ESTUDANTE,
            is_active=True,
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"email": "estudante@test.com", "password": "Senha123"},
            format="json",
        )
        token = response.json()["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = client.get("/api/v1/organizations/me/")
        assert response.status_code == 403


@pytest.mark.django_db
class TestOrganizationProfileView:
    """Testes do GET /organizations/me/."""

    def test_returns_200_with_profile(self, authenticated_client):
        """Retorna 200 com perfil completo."""
        response = authenticated_client.get("/api/v1/organizations/me/")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "ong@test.com"
        assert data["cnpj"] == "11222333000181"

    def test_returns_404_if_no_profile(self, client):
        """Retorna 404 se usuário não tem perfil de organização."""
        user = User.objects.create_user(
            username="org_no_profile",
            email="org_no_profile@test.com",
            password="Senha123",
            role=User.Role.ORGANIZACAO,
            is_active=True,
        )
        response = client.post(
            "/api/v1/auth/login/",
            {"email": "org_no_profile@test.com", "password": "Senha123"},
            format="json",
        )
        token = response.json()["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = client.get("/api/v1/organizations/me/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestOrganizationProfileUpdateView:
    """Testes do PATCH /organizations/me/update/."""

    def test_patch_updates_nome_fantasia(self, authenticated_client):
        """PATCH atualiza nome_fantasia."""
        response = authenticated_client.patch(
            "/api/v1/organizations/me/update/",
            {"nome_fantasia": "ONG Atualizada"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["nome_fantasia"] == "ONG Atualizada"

    def test_patch_returns_full_profile(self, authenticated_client):
        """PATCH retorna perfil completo."""
        response = authenticated_client.patch(
            "/api/v1/organizations/me/update/",
            {"mission": "Nossa missão"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["mission"] == "Nossa missão"
        assert "gallery" in data
        assert "stats" in data

    def test_patch_cnpj_change_rejected(self, authenticated_client):
        """PATCH com alteração de CNPJ é rejeitado."""
        response = authenticated_client.patch(
            "/api/v1/organizations/me/update/",
            {"cnpj": "99.888.777/0001-66"},
            format="json",
        )
        assert response.status_code == 400

    def test_patch_email_change_rejected(self, authenticated_client):
        """PATCH com alteração de email é rejeitado."""
        response = authenticated_client.patch(
            "/api/v1/organizations/me/update/",
            {"email": "newemail@test.com"},
            format="json",
        )
        assert response.status_code == 400

    def test_patch_areas_multiple_no_limit(self, authenticated_client):
        """PATCH com mais de 3 áreas é aceito (sem limite)."""
        response = authenticated_client.patch(
            "/api/v1/organizations/me/update/",
            {"areas_de_atuacao": ["saude", "educacao", "tecnologia", "meio_ambiente", "cultura"]},
            format="json",
        )
        assert response.status_code == 200
        assert len(response.json()["areas_de_atuacao"]) == 5


@pytest.mark.django_db
class TestOrgLogoUploadView:
    """Testes do POST /organizations/me/logo/."""

    def test_logo_upload_returns_200(self, authenticated_client):
        """Logo upload retorna 200."""
        img = _make_image_file("logo.jpg")
        response = authenticated_client.post(
            "/api/v1/organizations/me/logo/",
            {"logo": img},
        )
        assert response.status_code == 200
        assert "logo_url" in response.json()


@pytest.mark.django_db
class TestOrgBannerUploadView:
    """Testes do POST /organizations/me/banner/."""

    def test_banner_upload_returns_200(self, authenticated_client):
        """Banner upload retorna 200."""
        img = _make_image_file("banner.jpg")
        response = authenticated_client.post(
            "/api/v1/organizations/me/banner/",
            {"banner": img},
        )
        assert response.status_code == 200
        assert "banner_url" in response.json()


@pytest.mark.django_db
class TestOrgGalleryUploadView:
    """Testes do POST /organizations/me/gallery/."""

    def test_gallery_upload_returns_201(self, authenticated_client):
        """Gallery upload retorna 201."""
        response = authenticated_client.post(
            "/api/v1/organizations/me/gallery/",
            {"images": _make_image_file("g1.jpg")},
        )
        assert response.status_code == 201

    def test_gallery_multiple_upload(self, authenticated_client):
        """Upload de múltiplas fotos funciona."""
        from users.models import OrgGalleryPhoto

        response = authenticated_client.post(
            "/api/v1/organizations/me/gallery/",
            {"images": _make_image_file("g1.jpg")},
        )
        assert response.status_code == 201
        # Upload second
        response2 = authenticated_client.post(
            "/api/v1/organizations/me/gallery/",
            {"images": _make_image_file("g2.jpg")},
        )
        assert response2.status_code == 201
        assert OrgGalleryPhoto.objects.count() == 2


@pytest.mark.django_db
class TestOrgGalleryDeleteView:
    """Testes do DELETE /organizations/me/gallery/<id>/."""

    def test_delete_own_photo_returns_204(self, authenticated_client, org_user):
        """Deletar foto própria retorna 204."""
        from users.models import OrgGalleryPhoto

        _, org = org_user
        photo = OrgGalleryPhoto.objects.create(
            organization_profile=org, image=_make_image_file()
        )
        response = authenticated_client.delete(
            f"/api/v1/organizations/me/gallery/{photo.id}/"
        )
        assert response.status_code == 204
        assert OrgGalleryPhoto.objects.count() == 0

    def test_delete_nonexistent_photo_returns_404(self, authenticated_client):
        """Deletar foto inexistente retorna 404."""
        response = authenticated_client.delete(
            "/api/v1/organizations/me/gallery/00000000-0000-0000-0000-000000000000/"
        )
        assert response.status_code == 404


@pytest.mark.django_db
class TestOrgChangePasswordView:
    """Testes do POST /organizations/me/change-password/."""

    def test_change_password_returns_200(self, authenticated_client):
        """Alteração de senha válida retorna 200."""
        response = authenticated_client.post(
            "/api/v1/organizations/me/change-password/",
            {"new_password": "NovaSenha123", "confirm_password": "NovaSenha123"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["detail"] == "Senha alterada com sucesso."

    def test_password_mismatch_returns_400(self, authenticated_client):
        """Senhas diferentes retorna 400."""
        response = authenticated_client.post(
            "/api/v1/organizations/me/change-password/",
            {"new_password": "Senha12345", "confirm_password": "Senha54321"},
            format="json",
        )
        assert response.status_code == 400

    def test_weak_password_returns_400(self, authenticated_client):
        """Senha fraca retorna 400."""
        response = authenticated_client.post(
            "/api/v1/organizations/me/change-password/",
            {"new_password": "12345678", "confirm_password": "12345678"},
            format="json",
        )
        assert response.status_code == 400
