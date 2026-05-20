"""
Testes do modelo User.
"""

import pytest
from django.contrib.auth import get_user_model

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
        import uuid

        user = User.objects.create_user(
            username="uuid_user",
            email="uuid@example.com",
            password="pass123",
        )
        assert isinstance(user.id, uuid.UUID)

    def test_user_email_is_unique(self):
        """Dois usuarios nao podem compartilhar o mesmo email."""
        from django.db import IntegrityError

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
