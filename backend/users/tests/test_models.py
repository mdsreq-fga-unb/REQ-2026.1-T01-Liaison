"""
Tests for the User model.
"""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Tests for the custom User model."""

    def test_create_user_with_email(self):
        """User can be created with email and password."""
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="securepassword123",
        )
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.check_password("securepassword123")

    def test_user_default_role_is_student(self):
        """New users default to 'student' role."""
        user = User.objects.create_user(
            username="student1",
            email="student@example.com",
            password="pass123",
        )
        assert user.role == User.Role.STUDENT

    def test_user_role_organization(self):
        """User can be created with organization role."""
        user = User.objects.create_user(
            username="org1",
            email="org@example.com",
            password="pass123",
            role=User.Role.ORGANIZATION,
        )
        assert user.role == "organization"

    def test_user_role_admin(self):
        """User can be created with admin role."""
        user = User.objects.create_user(
            username="admin1",
            email="admin@example.com",
            password="pass123",
            role=User.Role.ADMIN,
        )
        assert user.role == "admin"

    def test_user_str_representation(self):
        """User str returns email and role."""
        user = User.objects.create_user(
            username="repr_user",
            email="repr@example.com",
            password="pass123",
            role=User.Role.STUDENT,
        )
        assert str(user) == "repr@example.com (student)"

    def test_user_id_is_uuid(self):
        """User primary key is a UUID."""
        import uuid

        user = User.objects.create_user(
            username="uuid_user",
            email="uuid@example.com",
            password="pass123",
        )
        assert isinstance(user.id, uuid.UUID)

    def test_user_email_is_unique(self):
        """Two users cannot share the same email."""
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
        """The USERNAME_FIELD is email."""
        assert User.USERNAME_FIELD == "email"

    def test_role_choices_are_valid(self):
        """Role field accepts only valid choices."""
        valid_roles = {"student", "organization", "admin"}
        model_choices = {choice[0] for choice in User.Role.choices}
        assert model_choices == valid_roles
