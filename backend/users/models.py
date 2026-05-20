import uuid
import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


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


telefone_validator = RegexValidator(
    # valida o formato do telefone
    regex=r"^\(\d{2}\) \d \d{4}-\d{4}$",
    message="Telefone deve estar no formato (xx) x xxxx-xxxx.",
)


class User(AbstractUser):
    class Role(models.TextChoices):
        ESTUDANTE = "estudante", "Estudante"
        ORGANIZACAO = "organizacao", "Organizacao"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

    nome = models.CharField(max_length=120)
    telefone = models.CharField(max_length=16, validators=[telefone_validator])
    matricula = models.CharField(max_length=50, blank=True, null=True)

    cnpj = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        validators=[validar_cnpj],
    )
    endereco = models.CharField(max_length=255, blank=True, null=True)

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