import uuid

from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Aguardando avaliação"
        APPROVED = "approved", "Aprovada"
        REJECTED = "rejected", "Rejeitada"
        CANCELLED = "cancelled", "Cancelada"
        COMPLETED = "completed", "Concluída"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        "users.StudentProfile",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    opportunity = models.ForeignKey(
        "opportunities.Opportunity",
        on_delete=models.CASCADE,
        related_name="applications",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    # Frequência (preenchido na conclusão da participação — marcação vem no #27).
    hours_completed = models.PositiveIntegerField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "applications_application"
        unique_together = [("student", "opportunity")]
        ordering = ["-created_at"]
