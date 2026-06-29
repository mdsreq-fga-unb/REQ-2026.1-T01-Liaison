"""Emissão de certificado — ponto único de entrada (RF15).

Síncrono e sem Celery por decisão de projeto (PDF de 1 página ~200ms).
Quando o registro de frequência (#27) chegar, ele chama `issue_certificate`
— sem reescrever nada aqui.
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from applications.models import Application

from .models import Certificate
from .pdf import build_certificate_pdf


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
