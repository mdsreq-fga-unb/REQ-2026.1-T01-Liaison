"""
Testes do modelo User e StudentProfile.
"""

import uuid

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from users.models import OrganizationProfile

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Testes do modelo User customizado."""

    def test_create_user_with_email(self):
        """Usuario pode ser criado com email e senha."""
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="securepassword123",
        )
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.check_password("securepassword123")

    def test_user_default_role_is_student(self):
        """Novos usuarios usam o role 'estudante' por padrao."""
        user = User.objects.create_user(
            username="student1",
            email="student@example.com",
            password="pass123",
        )
        assert user.role == User.Role.ESTUDANTE

    def test_user_role_organization(self):
        """Usuario pode ser criado com role de organizacao."""
        user = User.objects.create_user(
            username="org1",
            email="org@example.com",
            password="pass123",
            role=User.Role.ORGANIZACAO,
        )
        assert user.role == "organizacao"

    def test_user_role_admin(self):
        """Usuario pode ser criado com role admin."""
        user = User.objects.create_user(
            username="admin1",
            email="admin@example.com",
            password="pass123",
            role=User.Role.ADMIN,
        )
        assert user.role == "admin"

    def test_user_str_representation(self):
        """__str__ retorna email e role."""
        user = User.objects.create_user(
            username="repr_user",
            email="repr@example.com",
            password="pass123",
            role=User.Role.ESTUDANTE,
        )
        assert str(user) == "repr@example.com (estudante)"

    def test_user_id_is_uuid(self):
        """Chave primaria do usuario e UUID."""
        user = User.objects.create_user(
            username="uuid_user",
            email="uuid@example.com",
            password="pass123",
        )
        assert isinstance(user.id, uuid.UUID)

    def test_user_email_is_unique(self):
        """Dois usuarios nao podem compartilhar o mesmo email."""
        User.objects.create_user(
            username="user_a",
            email="duplicate@example.com",
            password="pass123",
        )
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                username="user_b",
                email="duplicate@example.com",
                password="pass456",
            )

    def test_username_field_is_email(self):
        """USERNAME_FIELD e email."""
        assert User.USERNAME_FIELD == "email"

    def test_role_choices_are_valid(self):
        """Campo role aceita somente valores validos."""
        valid_roles = {"estudante", "organizacao", "admin"}
        model_choices = {choice[0] for choice in User.Role.choices}
        assert model_choices == valid_roles

    def test_user_does_not_have_matricula_field(self):
        """User NAO deve ter campo matricula (agora no StudentProfile)."""
        assert not hasattr(User, "matricula"), "User nao deve ter campo matricula"

    def test_user_does_not_have_cnpj_field(self):
        """User NAO deve ter campo cnpj (sera movido para OrganizationProfile)."""
        assert not hasattr(User, "cnpj"), "User nao deve ter campo cnpj"

    def test_user_does_not_have_endereco_field(self):
        """User NAO deve ter campo endereco (sera movido para OrganizationProfile)."""
        assert not hasattr(User, "endereco"), "User nao deve ter campo endereco"

    def test_user_does_not_have_telefone_field(self):
        """User NAO deve ter campo telefone (sera movido para profile)."""
        assert not hasattr(User, "telefone"), "User nao deve ter campo telefone"


@pytest.mark.django_db
class TestStudentProfileModel:
    """Testes do modelo StudentProfile."""

    def _make_user(self, email="student@example.com", nome="Ana Souza"):
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="Senha123",
            nome=nome,
            role=User.Role.ESTUDANTE,
        )

    def test_student_profile_has_universidade_field(self):
        """StudentProfile possui campo universidade."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "universidade")

    def test_student_profile_has_curso_field(self):
        """StudentProfile possui campo curso."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "curso")

    def test_student_profile_has_matricula_field(self):
        """StudentProfile possui campo matricula."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "matricula")

    def test_student_profile_has_semestre_atual_field(self):
        """StudentProfile possui campo semestre_atual."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "semestre_atual")

    def test_student_profile_has_turno_field(self):
        """StudentProfile possui campo turno."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "turno")

    def test_student_profile_has_ano_conclusao_field(self):
        """StudentProfile possui campo ano_conclusao."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "ano_conclusao")

    def test_student_profile_has_horas_extensao_exigidas_field(self):
        """StudentProfile possui campo horas_extensao_exigidas."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "horas_extensao_exigidas")

    def test_student_profile_has_interesses_field(self):
        """StudentProfile possui campo interesses."""
        from users.models import StudentProfile  # noqa: F401

        assert hasattr(StudentProfile, "interesses")

    def test_student_profile_one_to_one_with_user(self):
        """StudentProfile tem relacao OneToOne com User."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="Universidade de Brasília",
            curso="Engenharia de Software",
            matricula="20231234567",
        )
        assert profile.user == user
        assert user.student_profile == profile

    def test_student_profile_str_method(self):
        """__str__ de StudentProfile retorna representacao legivel."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="Universidade de Brasília",
            curso="Engenharia de Software",
            matricula="20231234567",
        )
        result = str(profile)
        # __str__ deve identificar o estudante
        assert "Ana Souza" in result or "student@example.com" in result or "20231234567" in result

    def test_student_profile_matricula_is_unique(self):
        """Dois StudentProfiles nao podem ter a mesma matricula."""
        from users.models import StudentProfile

        user1 = self._make_user(email="s1@example.com")
        user2 = self._make_user(email="s2@example.com")

        StudentProfile.objects.create(
            user=user1,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MATRICULA_UNICA_001",
        )
        with pytest.raises(IntegrityError):
            StudentProfile.objects.create(
                user=user2,
                universidade="UnB",
                curso="Ciência da Computação",
                matricula="MATRICULA_UNICA_001",
            )

    def test_student_profile_user_is_unique(self):
        """Um usuario nao pode ter dois StudentProfiles (OneToOne)."""
        from users.models import StudentProfile

        user = self._make_user()
        StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT001",
        )
        with pytest.raises(IntegrityError):
            StudentProfile.objects.create(
                user=user,
                universidade="UnB",
                curso="Ciência da Computação",
                matricula="MAT002",
            )

    def test_student_profile_optional_fields_can_be_null(self):
        """Campos opcionais podem ser nulos."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT003",
            semestre_atual=None,
            turno=None,
            ano_conclusao=None,
            horas_extensao_exigidas=None,
        )
        assert profile.semestre_atual is None
        assert profile.turno is None
        assert profile.ano_conclusao is None
        assert profile.horas_extensao_exigidas is None

    def test_student_profile_interesses_defaults_to_empty_list(self):
        """Campo interesses tem default de lista vazia."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT004",
        )
        assert profile.interesses == []

    def test_student_profile_interesses_stores_list(self):
        """Campo interesses armazena lista de strings."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT005",
            interesses=["saude", "educacao", "tecnologia"],
        )
        assert profile.interesses == ["saude", "educacao", "tecnologia"]

    def test_student_profile_turno_choices(self):
        """Campo turno aceita somente valores validos."""
        from users.models import StudentProfile

        valid_turnos = {"matutino", "vespertino", "noturno", "integral"}
        turno_choices = {choice[0] for choice in StudentProfile.TURNO_CHOICES}
        assert turno_choices == valid_turnos

    def test_student_profile_cascade_delete(self):
        """Deletar usuario remove StudentProfile associado."""
        from users.models import StudentProfile

        user = self._make_user()
        StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT006",
        )
        user_id = user.id
        user.delete()
        assert not StudentProfile.objects.filter(user_id=user_id).exists()

    def test_student_profile_created_at_is_auto_set(self):
        """Campo created_at é preenchido automaticamente."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT007",
        )
        assert profile.created_at is not None

    def test_student_profile_updated_at_is_auto_set(self):
        """Campo updated_at é preenchido automaticamente."""
        from users.models import StudentProfile

        user = self._make_user()
        profile = StudentProfile.objects.create(
            user=user,
            universidade="UnB",
            curso="Eng. Software",
            matricula="MAT008",
        )
        assert profile.updated_at is not None

@pytest.mark.django_db
class TestOrganizationProfileModel:
    """Testes do modelo OrganizationProfile."""

    def _make_user(self, email="org@teste.com", nome="Org Teste"):
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="testpassword123",
            nome=nome,
            role=User.Role.ORGANIZACAO,
        )

    def test_create_organization_profile(self):
        user = self._make_user()
        profile = OrganizationProfile.objects.create(
            user=user,
            cnpj="12345678000195",
            razao_social="Organizacao Social Teste",
            nome_fantasia="ONG Teste",
            telefone="11999999999",
            nome_responsavel="Responsavel Teste",
            status="pending",
        )
        assert profile.user == user
        assert profile.cnpj == "12345678000195"
        assert profile.status == "pending"
        assert str(profile) == "OrganizationProfile(Org Teste — 12345678000195)"
