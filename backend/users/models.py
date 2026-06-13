import uuid
import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


def validar_cnpj(value: str):
    # aceita apenas digitos
    cnpj = re.sub(r"\D", "", value or "")
    if len(cnpj) != 14 or cnpj == cnpj[0] * 14:
        raise ValidationError("CNPJ invalido.")

    def calc_dv(cnpj_num, pesos):
        soma = sum(int(d) * p for d, p in zip(cnpj_num, pesos))
        resto = soma % 11
        return "0" if resto < 2 else str(11 - resto)

    pesos_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos_2 = [6] + pesos_1

    dv1 = calc_dv(cnpj[:12], pesos_1)
    dv2 = calc_dv(cnpj[:12] + dv1, pesos_2)

    if cnpj[-2:] != dv1 + dv2:
        raise ValidationError("CNPJ invalido.")


class User(AbstractUser):
    class Role(models.TextChoices):
        ESTUDANTE = "estudante", "Estudante"
        ORGANIZACAO = "organizacao", "Organizacao"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

    nome = models.CharField(max_length=120)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ESTUDANTE,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users_user"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    """Perfil do estudante universitário (1:1 com User)."""

    TURNO_CHOICES = [
        ("matutino", "Matutino"),
        ("vespertino", "Vespertino"),
        ("noturno", "Noturno"),
        ("integral", "Integral"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
        primary_key=False,
    )
    universidade = models.CharField(max_length=200)
    curso = models.CharField(max_length=200)
    matricula = models.CharField(max_length=50, unique=True)
    semestre_atual = models.SmallIntegerField(null=True, blank=True)
    turno = models.CharField(
        max_length=20,
        choices=TURNO_CHOICES,
        null=True,
        blank=True,
    )
    ano_conclusao = models.SmallIntegerField(null=True, blank=True)
    horas_extensao_exigidas = models.SmallIntegerField(null=True, blank=True)
    interesses = models.JSONField(default=list, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    banner = models.ImageField(upload_to="banners/", blank=True, null=True)
    bio = models.TextField(blank=True, default="", max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users_studentprofile"
        verbose_name = "Perfil de Estudante"
        verbose_name_plural = "Perfis de Estudante"

    def __str__(self):
        nome = getattr(self.user, "nome", None) or self.user.email
        return f"StudentProfile({nome} — {self.matricula})"


class StudentGalleryPhoto(models.Model):
    """Foto da galeria do estudante."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="gallery_photos",
    )
    image = models.ImageField(upload_to="gallery/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_studentgalleryphoto"
        verbose_name = "Foto da Galeria"
        verbose_name_plural = "Fotos da Galeria"
        ordering = ["-created_at"]

    def __str__(self):
        return f"GalleryPhoto({self.id})"


class OrganizationProfile(models.Model):
    """Perfil da organização social (1:1 com User)."""

    STATUS_CHOICES = [
        ("pending", "Pendente"),
        ("approved", "Aprovada"),
        ("rejected", "Rejeitada"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="organization_profile",
        primary_key=False,
    )
    cnpj = models.CharField(max_length=18, unique=True, validators=[validar_cnpj])
    razao_social = models.CharField(max_length=200)
    nome_fantasia = models.CharField(max_length=200, blank=True)
    telefone = models.CharField(max_length=20)
    nome_responsavel = models.CharField(max_length=150)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    # New fields — US1.5
    logo = models.ImageField(upload_to="org_logos/", blank=True, null=True)
    banner = models.ImageField(upload_to="org_banners/", blank=True, null=True)
    mission = models.TextField(blank=True, default="", max_length=300)
    full_description = models.TextField(blank=True, default="", max_length=2000)
    areas_de_atuacao = models.JSONField(default=list, blank=True)
    site = models.URLField(blank=True, default="")
    endereco = models.TextField(blank=True, default="", max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users_organizationprofile"
        verbose_name = "Perfil de Organização"
        verbose_name_plural = "Perfis de Organização"

    def __str__(self):
        nome = getattr(self.user, "nome", None) or self.user.email
        return f"OrganizationProfile({nome} — {self.cnpj})"


class OrgGalleryPhoto(models.Model):
    """Foto da galeria da organização."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_profile = models.ForeignKey(
        OrganizationProfile,
        on_delete=models.CASCADE,
        related_name="gallery_photos",
    )
    image = models.ImageField(upload_to="org_gallery/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users_orggalleryphoto"
        verbose_name = "Foto da Galeria (Org)"
        verbose_name_plural = "Fotos da Galeria (Org)"
        ordering = ["-created_at"]

    def __str__(self):
        return f"OrgGalleryPhoto({self.id})"


class AdminActionLog(models.Model):

    class Action(models.TextChoices):
        APPROVE = "approve", "Aprovar"
        REJECT = "reject", "Reprovar"
        REQUEST_INFO = "request_info", "Solicitar Informacoes"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="admin_actions"
    )
    organization = models.ForeignKey(
        OrganizationProfile,
        on_delete=models.CASCADE,
        related_name="admin_logs",
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "users_adminactionlog"
        verbose_name = "Registro de Ação Administrativa"
        verbose_name_plural = "Registros de Ações Administrativas"

    def __str__(self):
        return f"{self.get_action_display()} by {self.admin} on {self.organization} at {self.created_at}"
