"""Emissão de certificado — ponto único de entrada (RF15).

Síncrono e sem Celery por decisão de projeto (PDF de 1 página ~200ms).
Quando o registro de frequência (#27) chegar, ele chama `issue_certificate`
— sem reescrever nada aqui.
"""

import re

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import TextField
from django.db.models.functions import Cast
from django.utils import timezone

from applications.models import Application

from .models import Certificate
from .pdf import build_certificate_pdf


def find_by_code(code: str) -> Certificate | None:
    """Resolve o código curto do PDF (ex: A1B2-C3D4-E5F6-7890) p/ Certificate.

    O código = validation_uuid.hex[:16] (pdf._validation_code) → não reconstrói
    o uuid inteiro, então a busca é por prefixo. Cast do uuid p/ texto + match
    nos 16 primeiros hex (uuid textual = "8hex-4hex-..." → 16 hex casam o
    prefixo). Hífens/case são normalizados. Retorna None se inválido/ausente.
    """
    hex16 = re.sub(r"[^0-9a-fA-F]", "", code or "").lower()
    if len(hex16) != 16:
        return None
    # Cast do uuid devolve a forma textual com hífens (8-4-4-4-12); os 16 hex
    # cobrem os 3 primeiros grupos, então o prefixo precisa dos hífens.
    prefix = f"{hex16[:8]}-{hex16[8:12]}-{hex16[12:16]}"
    return (
        Certificate.objects.annotate(uuid_text=Cast("validation_uuid", TextField()))
        .filter(uuid_text__startswith=prefix)
        .first()
    )


@transaction.atomic
def issue_certificate(application: Application, hours: int) -> Certificate:
    """Emite o certificado de uma application e retorna o objeto.

    Marca a application como COMPLETED (frequência), cria o Certificate com
    snapshot de `hours`, gera o PDF e salva em `pdf_file`. Idempotente por
    application via OneToOne — 2ª chamada levanta ValidationError.
    """
    if application.status not in (
        Application.Status.APPROVED,
        Application.Status.COMPLETED,
    ):
        raise ValidationError(
            "Certificado só pode ser emitido para candidatura aprovada."
        )
    if Certificate.objects.filter(application=application).exists():
        raise ValidationError("Certificado já emitido para esta candidatura.")

    application.status = Application.Status.COMPLETED
    application.hours_completed = hours
    application.completed_at = timezone.now()
    application.save(
        update_fields=["status", "hours_completed", "completed_at", "updated_at"]
    )

    certificate = Certificate.objects.create(application=application, hours=hours)
    certificate.pdf_file = build_certificate_pdf(certificate)
    certificate.save(update_fields=["pdf_file"])
    return certificate
