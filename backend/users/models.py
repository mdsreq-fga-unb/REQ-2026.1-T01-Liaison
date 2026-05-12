import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for Liaison.

    Extends AbstractUser to add a `role` field that identifies
    the type of user: student, organization, or admin.

    Email is used as the USERNAME_FIELD (login identifier).
    """

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        ORGANIZATION = "organization", "Organization"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    # Use email as the login field instead of username
    USERNAME_FIELD = "email"
    # username is still required for createsuperuser; remove it from REQUIRED_FIELDS
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users_user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} ({self.role})"
