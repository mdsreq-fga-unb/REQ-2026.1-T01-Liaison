import uuid

from django.core.exceptions import ValidationError
from django.db import models


class Certificate(models.Model):
    """Certificado digital de horas de voluntariado (RF15).

    Write-once (RNF08): após a emissão só `pdf_file` e `revoked_at` podem
    mudar. 1:1 com Application — student/opportunity/org são acessados via
    `certificate.application.*`; `hours` é snapshot da carga atestada.
    """

    # Campos que podem ser alterados após a emissão (ver save()).
    MUTABLE_FIELDS = frozenset({"pdf_file", "revoked_at"})

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(
        "applications.Application",
        on_delete=models.PROTECT,
        related_name="certificate",
    )
    hours = models.PositiveIntegerField()
    pdf_file = models.FileField(upload_to="certificates/", blank=True, null=True)
    validation_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    issued_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "certificates_certificate"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"Certificate({self.validation_uuid})"

    def save(self, *args, **kwargs):
        # Imutabilidade pós-emissão: em update só permite update_fields
        # ⊆ {pdf_file, revoked_at}. Qualquer outro update é bloqueado (RNF08).
        if not self._state.adding:
            update_fields = kwargs.get("update_fields")
            if update_fields is None or not set(update_fields) <= self.MUTABLE_FIELDS:
                raise ValidationError(
                    "Certificate é imutável após a emissão; "
                    "apenas pdf_file e revoked_at podem ser alterados."
                )
        super().save(*args, **kwargs)
