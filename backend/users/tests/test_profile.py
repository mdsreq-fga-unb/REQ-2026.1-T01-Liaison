"""
Testes de perfil do estudante (Phase 2 — Backend).
Cobre modelos, serializers, validators e views do novo modulo de perfil.
"""

import io
import uuid

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from users.models import StudentGalleryPhoto, StudentProfile
from users.serializers import (
    AvatarUploadSerializer,
    BannerUploadSerializer,
    ChangePasswordSerializer,
    GalleryUploadSerializer,
    StudentProfileDetailSerializer,
    StudentProfileUpdateSerializer,
)
from users.validators import validate_image_file_extension, validate_image_file_size
from users.views import (
    AvatarUploadView,
    BannerUploadView,
    ChangePasswordView,
    GalleryDeleteView,
    GalleryUploadView,
    StudentProfileUpdateView,
    StudentProfileView,
)

User = get_user_model()


# ────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────

def _make_valid_image(name="test.jpg", size=None):
    """Cria um SimpleUploadedFile com dados de imagem JPEG validos (via Pillow).
    Sempre gera uma imagem JPEG 100% valida — sem padding que corrompa o arquivo.
    O parametro 'size' e ignorado; a imagem sempre tem o tamanho natural do JPEG gerado.
    """
    from PIL import Image as PILImage

    buf = io.BytesIO()
    # Small but valid JPEG
    img = PILImage.new("RGB", (100, 100), color="white")
    img.save(buf, format="JPEG", quality=95)
    content = buf.getvalue()
    return SimpleUploadedFile(name=name, content=content, content_type="image/jpeg")


def _make_valid_png(name="test.png"):
    """Cria um SimpleUploadedFile com dados de imagem PNG validos."""
    from PIL import Image as PILImage

    buf = io.BytesIO()
    img = PILImage.new("RGB", (100, 100), color="white")
    img.save(buf, format="PNG")
    content = buf.getvalue()
    return SimpleUploadedFile(name=name, content=content, content_type="image/png")


def _make_oversized_image(name="big.jpg"):
    """Cria um arquivo .jpg que excede 5 MB.
    Usa um JPEG valido com dados extras anexados apos o fim do arquivo (EOI marker).
    O Pillow le o JPEG normalmente (para no EOI), mas o tamanho do arquivo excede 5MB.
    """
    from PIL import Image as PILImage

    buf = io.BytesIO()
    img = PILImage.new("RGB", (10, 10), color="white")
    img.save(buf, format="JPEG", quality=95)
    valid_jpeg = buf.getvalue()
    # Append garbage to reach >5MB
    target_size = 5 * 1024 * 1024 + 1024
    padding_size = target_size - len(valid_jpeg)
    content = valid_jpeg + b"X" * padding_size
    return SimpleUploadedFile(name=name, content=content, content_type="image/jpeg")


def _make_non_image(name="doc.pdf"):
    """Cria um arquivo que nao e imagem."""
    return SimpleUploadedFile(
        name=name,
        content=b"%PDF-1.4 fake pdf content here",
        content_type="application/pdf",
    )


def _make_student(email="aluno@teste.com", nome="Aluno Teste", **profile_kwargs):
    """Cria um usuario estudante com StudentProfile."""
    user = User.objects.create_user(
        username=email.split("@")[0],
        email=email,
        password="Senha123",
        nome=nome,
        role=User.Role.ESTUDANTE,
    )
    defaults = {
        "universidade": "Universidade de Brasília",
        "curso": "Engenharia de Software",
        "matricula": str(uuid.uuid4())[:20],
    }
    defaults.update(profile_kwargs)
    StudentProfile.objects.create(user=user, **defaults)
    return user


def _make_org(email="org@teste.com", nome="Org Teste"):
    """Cria um usuario organizacao."""
    return User.objects.create_user(
        username=email.split("@")[0],
        email=email,
        password="Senha123",
        nome=nome,
        role=User.Role.ORGANIZACAO,
    )


def _make_admin(email="admin@teste.com", nome="Admin"):
    """Cria um usuario admin."""
    return User.objects.create_user(
        username=email.split("@")[0],
        email=email,
        password="Senha123",
        nome=nome,
        role=User.Role.ADMIN,
    )


# ────────────────────────────────────────────────────────────
# Model Tests (T2.30)
# ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudentProfileNewFields:
    """T2.4 — Novos campos avatar, banner, bio."""

    def test_avatar_field_exists(self):
        assert hasattr(StudentProfile, "avatar")

    def test_banner_field_exists(self):
        assert hasattr(StudentProfile, "banner")

    def test_bio_field_exists(self):
        assert hasattr(StudentProfile, "bio")

    def test_bio_max_length_500(self):
        field = StudentProfile._meta.get_field("bio")
        assert field.max_length == 500

    def test_bio_default_empty(self):
        user = _make_student()
        profile = user.student_profile
        assert profile.bio == ""

    def test_avatar_banner_null_by_default(self):
        user = _make_student()
        profile = user.student_profile
        # ImageFieldFile.name returns '' when blank, but the underlying
        # field value is None — both are valid indicators of "no image"
        assert not profile.avatar or profile.avatar.name in ("", None)
        assert not profile.banner or profile.banner.name in ("", None)

    def test_avatar_upload_to_path(self):
        field = StudentProfile._meta.get_field("avatar")
        assert "avatars/" in str(field.upload_to)

    def test_banner_upload_to_path(self):
        field = StudentProfile._meta.get_field("banner")
        assert "banners/" in str(field.upload_to)


@pytest.mark.django_db
class TestStudentGalleryPhotoModel:
    """T2.5 / T2.30 — StudentGalleryPhoto model."""

    def test_create_gallery_photo(self):
        user = _make_student()
        profile = user.student_profile
        photo = StudentGalleryPhoto.objects.create(
            student_profile=profile,
            image=_make_valid_image("foto1.jpg"),
        )
        assert isinstance(photo.id, uuid.UUID)
        assert photo.student_profile == profile
        assert photo.created_at is not None

    def test_gallery_photo_str(self):
        user = _make_student()
        photo = StudentGalleryPhoto.objects.create(
            student_profile=user.student_profile,
            image=_make_valid_image(),
        )
        assert str(photo).startswith("GalleryPhoto(")

    def test_gallery_photos_related_name(self):
        user = _make_student()
        profile = user.student_profile
        StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image("a.jpg")
        )
        StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image("b.jpg")
        )
        assert profile.gallery_photos.count() == 2

    def test_gallery_photo_ordering_newest_first(self):
        user = _make_student()
        profile = user.student_profile
        p1 = StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image("old.jpg")
        )
        p2 = StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image("new.jpg")
        )
        photos = list(profile.gallery_photos.all())
        assert photos[0] == p2  # newest first
        assert photos[1] == p1

    def test_gallery_photo_cascade_delete_with_profile(self):
        """Deletar StudentProfile remove galeria associada."""
        user = _make_student()
        profile = user.student_profile
        photo = StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image()
        )
        photo_id = photo.id
        user.delete()
        assert not StudentGalleryPhoto.objects.filter(id=photo_id).exists()


# ────────────────────────────────────────────────────────────
# Validator Tests
# ────────────────────────────────────────────────────────────

class TestValidateImageFileExtension:
    """T2.6 — validate_image_file_extension."""

    def test_jpg_accepted(self):
        img = _make_valid_image("foto.jpg")
        validate_image_file_extension(img)  # nao levanta erro

    def test_jpeg_accepted(self):
        img = _make_valid_image("foto.jpeg")
        validate_image_file_extension(img)

    def test_png_accepted(self):
        img = _make_valid_png("foto.png")
        validate_image_file_extension(img)

    def test_gif_rejected(self):
        img = SimpleUploadedFile("foto.gif", b"GIF89a", content_type="image/gif")
        with pytest.raises(ValidationError, match="Tipo de arquivo"):
            validate_image_file_extension(img)

    def test_pdf_rejected(self):
        img = _make_non_image("doc.pdf")
        with pytest.raises(ValidationError, match="Tipo de arquivo"):
            validate_image_file_extension(img)

    def test_no_extension_rejected(self):
        img = _make_non_image("arquivo")
        with pytest.raises(ValidationError, match="Tipo de arquivo"):
            validate_image_file_extension(img)


class TestValidateImageFileSize:
    """T2.6 — validate_image_file_size."""

    def test_small_file_accepted(self):
        img = _make_valid_image("foto.jpg")
        validate_image_file_size(img)

    def test_exactly_5mb_accepted(self):
        img = SimpleUploadedFile(
            "foto.jpg",
            b"x" * (5 * 1024 * 1024),
            content_type="image/jpeg",
        )
        validate_image_file_size(img)

    def test_larger_than_5mb_rejected(self):
        img = SimpleUploadedFile(
            "foto.jpg",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/jpeg",
        )
        with pytest.raises(ValidationError, match="não pode exceder 5 MB"):
            validate_image_file_size(img)


# ────────────────────────────────────────────────────────────
# StudentProfileDetailSerializer (T2.24)
# ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudentProfileDetailSerializer:
    """T2.10 / T2.24 — StudentProfileDetailSerializer."""

    def test_all_fields_present(self):
        user = _make_student(interesses=["saude", "educacao"])
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        data = serializer.data
        expected_fields = {
            "id",
            "email",
            "nome",
            "universidade",
            "curso",
            "matricula",
            "semestre_atual",
            "turno",
            "ano_conclusao",
            "horas_extensao_exigidas",
            "interesses",
            "avatar_url",
            "banner_url",
            "bio",
            "gallery",
            "stats",
            "events",
        }
        assert set(data.keys()) == expected_fields

    def test_id_is_user_uuid_str(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["id"] == str(user.id)

    def test_email_from_user(self):
        user = _make_student(email="maria@unb.br")
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["email"] == "maria@unb.br"

    def test_nome_from_user(self):
        user = _make_student(nome="Maria Silva")
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["nome"] == "Maria Silva"

    def test_avatar_url_none_when_no_avatar(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["avatar_url"] is None

    def test_banner_url_none_when_no_banner(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["banner_url"] is None

    def test_bio_empty_default(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["bio"] == ""

    def test_gallery_list_empty(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["gallery"] == []

    def test_gallery_with_photos(self):
        user = _make_student()
        profile = user.student_profile
        photo = StudentGalleryPhoto.objects.create(
            student_profile=profile, image=_make_valid_image("gal1.jpg")
        )
        serializer = StudentProfileDetailSerializer(
            profile, context={"request": None}
        )
        gallery = serializer.data["gallery"]
        assert len(gallery) == 1
        assert gallery[0]["id"] == str(photo.id)

    def test_stats_structure(self):
        user = _make_student(horas_extensao_exigidas=200)
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        stats = serializer.data["stats"]
        assert stats["total_hours_completed"] == 0
        assert stats["total_hours_required"] == 200
        assert stats["total_events"] == 0

    def test_stats_horas_none_defaults_to_zero(self):
        user = _make_student(horas_extensao_exigidas=None)
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["stats"]["total_hours_required"] == 0

    def test_events_empty_list(self):
        user = _make_student()
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["events"] == []

    def test_interesses_serialized(self):
        user = _make_student(interesses=["educacao", "tecnologia"])
        serializer = StudentProfileDetailSerializer(
            user.student_profile, context={"request": None}
        )
        assert serializer.data["interesses"] == ["educacao", "tecnologia"]


# ────────────────────────────────────────────────────────────
# StudentProfileUpdateSerializer (T2.25)
# ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudentProfileUpdateSerializer:
    """T2.11 / T2.25 — StudentProfileUpdateSerializer."""

    def test_valid_update_fields(self):
        user = _make_student()
        profile = user.student_profile
        serializer = StudentProfileUpdateSerializer(
            profile,
            data={"universidade": "USP", "bio": "Nova bio"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_update_universidade(self):
        user = _make_student(universidade="UnB")
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"universidade": "USP"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        user.refresh_from_db()
        assert user.student_profile.universidade == "USP"

    def test_update_bio(self):
        user = _make_student()
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"bio": "Minha bio atualizada"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        user.student_profile.refresh_from_db()
        assert user.student_profile.bio == "Minha bio atualizada"

    def test_update_nome_through_user(self):
        user = _make_student(nome="Maria")
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"nome": "Maria Silva"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        user.refresh_from_db()
        assert user.nome == "Maria Silva"

    def test_email_unchanged_allowed(self):
        user = _make_student(email="maria@unb.br")
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"email": "maria@unb.br"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_email_change_rejected(self):
        user = _make_student(email="maria@unb.br")
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"email": "novo@unb.br"},
            partial=True,
        )
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_interesses_max_3_valid(self):
        user = _make_student()
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"interesses": ["a", "b", "c"]},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_interesses_more_than_3_rejected(self):
        user = _make_student()
        serializer = StudentProfileUpdateSerializer(
            user.student_profile,
            data={"interesses": ["a", "b", "c", "d"]},
            partial=True,
        )
        assert not serializer.is_valid()
        assert "interesses" in serializer.errors

    def test_matricula_duplicate_rejected(self):
        """T1.2 — Rejeita matrícula já em uso por outro estudante."""
        _student1 = _make_student(email="aluno1@teste.com", matricula="M001")
        student2 = _make_student(email="aluno2@teste.com", matricula="M002")
        serializer = StudentProfileUpdateSerializer(
            student2.student_profile,
            data={"matricula": "M001"},
            partial=True,
        )
        assert not serializer.is_valid()
        assert "matricula" in serializer.errors

    def test_matricula_unchanged_allowed(self):
        """T1.2 — Permite manter a mesma matrícula (sem self-conflict)."""
        student = _make_student(matricula="M123")
        serializer = StudentProfileUpdateSerializer(
            student.student_profile,
            data={"matricula": "M123"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors

    def test_update_without_matricula_valid(self):
        """T1.2 — PATCH parcial sem campo matrícula é válido."""
        student = _make_student()
        serializer = StudentProfileUpdateSerializer(
            student.student_profile,
            data={"universidade": "USP"},
            partial=True,
        )
        assert serializer.is_valid(), serializer.errors


# ────────────────────────────────────────────────────────────
# Upload Serializers (T2.26 / T2.27)
# ────────────────────────────────────────────────────────────

class TestAvatarUploadSerializer:
    """T2.12 / T2.26 — AvatarUploadSerializer."""

    def test_valid_jpg(self):
        img = _make_valid_image("foto.jpg", size=100)
        serializer = AvatarUploadSerializer(data={"avatar": img})
        assert serializer.is_valid(), serializer.errors

    def test_invalid_extension(self):
        img = _make_non_image("doc.pdf")
        serializer = AvatarUploadSerializer(data={"avatar": img})
        assert not serializer.is_valid()
        assert "avatar" in serializer.errors

    def test_oversized_rejected(self):
        img = _make_oversized_image("big.jpg")
        serializer = AvatarUploadSerializer(data={"avatar": img})
        assert not serializer.is_valid()

    def test_missing_field_rejected(self):
        serializer = AvatarUploadSerializer(data={})
        assert not serializer.is_valid()
        assert "avatar" in serializer.errors


class TestBannerUploadSerializer:
    """T2.13 / T2.26 — BannerUploadSerializer."""

    def test_valid_png(self):
        img = _make_valid_png("banner.png")
        serializer = BannerUploadSerializer(data={"banner": img})
        assert serializer.is_valid(), serializer.errors

    def test_invalid_gif(self):
        img = SimpleUploadedFile("anim.gif", b"GIF89a", content_type="image/gif")
        serializer = BannerUploadSerializer(data={"banner": img})
        assert not serializer.is_valid()


@pytest.mark.django_db
class TestGalleryUploadSerializer:
    """T2.14 / T2.27 — GalleryUploadSerializer."""

    def test_valid_multiple_upload(self):
        img1 = _make_valid_image("a.jpg", size=100)
        img2 = _make_valid_png("b.png")
        serializer = GalleryUploadSerializer(data={"images": [img1, img2]})
        assert serializer.is_valid(), serializer.errors

    def test_create_photos(self):
        user = _make_student()
        profile = user.student_profile
        img = _make_valid_image("gal.jpg", size=100)
        serializer = GalleryUploadSerializer(data={"images": [img]})
        assert serializer.is_valid(), serializer.errors
        photos = serializer.create(serializer.validated_data, student_profile=profile)
        assert len(photos) == 1
        assert photos[0].student_profile == profile

    def test_empty_list_rejected(self):
        serializer = GalleryUploadSerializer(data={"images": []})
        assert not serializer.is_valid()

    def test_missing_field_rejected(self):
        serializer = GalleryUploadSerializer(data={})
        assert not serializer.is_valid()

    def test_invalid_file_in_list(self):
        img_ok = _make_valid_image("ok.jpg", size=100)
        img_bad = _make_non_image("bad.pdf")
        serializer = GalleryUploadSerializer(data={"images": [img_ok, img_bad]})
        assert not serializer.is_valid()
        assert "images" in serializer.errors


# ────────────────────────────────────────────────────────────
# ChangePasswordSerializer (T2.28)
# ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestChangePasswordSerializer:
    """T2.15 / T2.28 — ChangePasswordSerializer."""

    def test_valid_password_change(self):
        serializer = ChangePasswordSerializer(data={
            "new_password": "NovaSenha123",
            "confirm_password": "NovaSenha123",
        })
        assert serializer.is_valid(), serializer.errors

    def test_mismatch_rejected(self):
        serializer = ChangePasswordSerializer(data={
            "new_password": "NovaSenha123",
            "confirm_password": "Diferente123",
        })
        assert not serializer.is_valid()
        assert "confirm_password" in serializer.errors

    def test_weak_password_rejected(self):
        serializer = ChangePasswordSerializer(data={
            "new_password": "curta",
            "confirm_password": "curta",
        })
        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_password_no_numbers_rejected(self):
        serializer = ChangePasswordSerializer(data={
            "new_password": "SomenteLetras",
            "confirm_password": "SomenteLetras",
        })
        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_password_no_letters_rejected(self):
        serializer = ChangePasswordSerializer(data={
            "new_password": "12345678",
            "confirm_password": "12345678",
        })
        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_save_updates_password(self):
        user = _make_student()
        old_hash = user.password
        serializer = ChangePasswordSerializer(data={
            "new_password": "NovaSenhaXYZ1",
            "confirm_password": "NovaSenhaXYZ1",
        })
        assert serializer.is_valid(), serializer.errors
        serializer.save(user=user)
        user.refresh_from_db()
        assert user.password != old_hash
        assert user.check_password("NovaSenhaXYZ1")


# ────────────────────────────────────────────────────────────
# View Tests (T2.29)
# ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestStudentProfileAuth:
    """Testes de autenticacao e autorizacao nas views de perfil."""

    def test_unauthenticated_gets_401(self):
        factory = APIRequestFactory()
        for path in ["/students/me/", "/students/me/update/",
                      "/students/me/avatar/", "/students/me/banner/",
                      "/students/me/gallery/",
                      "/students/me/change-password/"]:
            request = factory.get(path)
            # Usar a view correta para cada path
            # Usamos StudentProfileView como proxy para testar auth
            view = StudentProfileView.as_view()
            response = view(request)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED, f"401 expected for {path}"

    def test_wrong_role_org_gets_403(self):
        user = _make_org()
        factory = APIRequestFactory()
        request = factory.get("/students/me/")
        force_authenticate(request, user=user)
        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_gets_403_on_student_endpoints(self):
        user = _make_admin()
        factory = APIRequestFactory()
        request = factory.get("/students/me/")
        force_authenticate(request, user=user)
        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestStudentProfileView:
    """T2.16 — GET /students/me/."""

    def test_returns_200_with_profile(self):
        user = _make_student(nome="Maria")
        factory = APIRequestFactory()
        request = factory.get("/students/me/")
        force_authenticate(request, user=user)
        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["nome"] == "Maria"
        assert response.data["email"] == user.email

    def test_returns_404_if_no_profile(self):
        user = User.objects.create_user(
            username="noprofile",
            email="noprofile@test.com",
            password="Senha123",
            role=User.Role.ESTUDANTE,
        )
        factory = APIRequestFactory()
        request = factory.get("/students/me/")
        force_authenticate(request, user=user)
        view = StudentProfileView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestStudentProfileUpdateView:
    """T2.17 — PATCH /students/me/update/."""

    def test_patch_updates_universidade(self):
        user = _make_student(universidade="UnB")
        factory = APIRequestFactory()
        request = factory.patch(
            "/students/me/update/",
            {"universidade": "USP"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = StudentProfileUpdateView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["universidade"] == "USP"

    def test_patch_returns_full_profile(self):
        user = _make_student()
        factory = APIRequestFactory()
        request = factory.patch(
            "/students/me/update/",
            {"bio": "Hello"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = StudentProfileUpdateView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert "stats" in response.data
        assert "gallery" in response.data

    def test_patch_email_change_rejected(self):
        user = _make_student(email="old@test.com")
        factory = APIRequestFactory()
        request = factory.patch(
            "/students/me/update/",
            {"email": "new@test.com"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = StudentProfileUpdateView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_patch_404_if_no_profile(self):
        user = User.objects.create_user(
            username="noprofile2",
            email="np2@test.com",
            password="Senha123",
            role=User.Role.ESTUDANTE,
        )
        factory = APIRequestFactory()
        request = factory.patch(
            "/students/me/update/",
            {"universidade": "USP"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = StudentProfileUpdateView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestAvatarUploadView:
    """T2.18 — POST /students/me/avatar/."""

    def test_avatar_upload_returns_200(self):
        user = _make_student()
        factory = APIRequestFactory()
        img = _make_valid_image("avatar.jpg")
        request = factory.post(
            "/students/me/avatar/",
            {"avatar": img},
            format="multipart",
        )
        force_authenticate(request, user=user)
        view = AvatarUploadView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert "avatar_url" in response.data

    def test_avatar_404_if_no_profile(self):
        user = User.objects.create_user(
            username="np3", email="np3@test.com",
            password="Senha123", role=User.Role.ESTUDANTE,
        )
        factory = APIRequestFactory()
        img = _make_valid_image("avatar.jpg")
        request = factory.post(
            "/students/me/avatar/",
            {"avatar": img},
            format="multipart",
        )
        force_authenticate(request, user=user)
        view = AvatarUploadView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestBannerUploadView:
    """T2.19 — POST /students/me/banner/."""

    def test_banner_upload_returns_200(self):
        user = _make_student()
        factory = APIRequestFactory()
        img = _make_valid_image("banner.jpg", size=100)
        request = factory.post(
            "/students/me/banner/",
            {"banner": img},
            format="multipart",
        )
        force_authenticate(request, user=user)
        view = BannerUploadView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert "banner_url" in response.data


@pytest.mark.django_db
class TestGalleryUploadView:
    """T2.20 — POST /students/me/gallery/."""

    def test_gallery_upload_returns_201(self):
        user = _make_student()
        factory = APIRequestFactory()
        img = _make_valid_image("gal.jpg", size=100)
        request = factory.post(
            "/students/me/gallery/",
            {"images": [img]},
            format="multipart",
        )
        force_authenticate(request, user=user)
        view = GalleryUploadView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data) == 1
        assert "image_url" in response.data[0]

    def test_gallery_multiple_upload(self):
        user = _make_student()
        factory = APIRequestFactory()
        img1 = _make_valid_image("a.jpg", size=100)
        img2 = _make_valid_image("b.jpg", size=100)
        request = factory.post(
            "/students/me/gallery/",
            {"images": [img1, img2]},
            format="multipart",
        )
        force_authenticate(request, user=user)
        view = GalleryUploadView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data) == 2


@pytest.mark.django_db
class TestGalleryDeleteView:
    """T2.21 — DELETE /students/me/gallery/<photo_id>/."""

    def test_delete_own_photo_returns_204(self):
        user = _make_student()
        profile = user.student_profile
        photo = StudentGalleryPhoto.objects.create(
            student_profile=profile,
            image=_make_valid_image("todelete.jpg"),
        )
        factory = APIRequestFactory()
        request = factory.delete(f"/students/me/gallery/{photo.id}/")
        force_authenticate(request, user=user)
        view = GalleryDeleteView.as_view()
        response = view(request, photo_id=photo.id)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_other_student_photo_returns_404(self):
        user1 = _make_student(email="s1@test.com")
        user2 = _make_student(email="s2@test.com", matricula="M999")
        profile2 = user2.student_profile
        photo = StudentGalleryPhoto.objects.create(
            student_profile=profile2,
            image=_make_valid_image("other.jpg"),
        )
        factory = APIRequestFactory()
        request = factory.delete(f"/students/me/gallery/{photo.id}/")
        force_authenticate(request, user=user1)
        view = GalleryDeleteView.as_view()
        response = view(request, photo_id=photo.id)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_nonexistent_photo_returns_404(self):
        user = _make_student()
        fake_id = uuid.uuid4()
        factory = APIRequestFactory()
        request = factory.delete(f"/students/me/gallery/{fake_id}/")
        force_authenticate(request, user=user)
        view = GalleryDeleteView.as_view()
        response = view(request, photo_id=fake_id)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestChangePasswordView:
    """T2.22 — POST /students/me/change-password/."""

    def test_change_password_returns_200(self):
        user = _make_student()
        factory = APIRequestFactory()
        request = factory.post(
            "/students/me/change-password/",
            {"new_password": "NovaSenha456", "confirm_password": "NovaSenha456"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = ChangePasswordView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["detail"] == "Senha alterada com sucesso."

    def test_password_mismatch_returns_400(self):
        user = _make_student()
        factory = APIRequestFactory()
        request = factory.post(
            "/students/me/change-password/",
            {"new_password": "NovaSenha456", "confirm_password": "Diferente456"},
            format="json",
        )
        force_authenticate(request, user=user)
        view = ChangePasswordView.as_view()
        response = view(request)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
