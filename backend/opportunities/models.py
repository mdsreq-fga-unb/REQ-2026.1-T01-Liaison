import uuid
from django.db import models

class Opportunity(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Rascunho"
        ACTIVE = "active", "Ativa"
        PAUSED = "paused", "Pausada"
        CLOSED = "closed", "Encerrada"

    class Area(models.TextChoices):
        EDUCACAO = "educacao", "Educação"
        SAUDE = "saude", "Saúde"
        TECNOLOGIA = "tecnologia", "Tecnologia"
        MEIO_AMBIENTE = "meio_ambiente", "Meio Ambiente"
        ASSISTENCIA_SOCIAL = "assistencia_social", "Assistência Social"
        ARTE_CULTURA = "arte_cultura", "Arte & Cultura"
        ESPORTE = "esporte", "Esporte"

    class Modality(models.TextChoices):
        PRESENCIAL = "presencial", "Presencial"
        REMOTO = "remoto", "Remoto"
        HIBRIDO = "hibrido", "Híbrido"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey("users.OrganizationProfile", on_delete=models.CASCADE, related_name="opportunities")
    
    title = models.CharField(max_length=200, blank=True)
    area = models.CharField(max_length=50, choices=Area.choices, blank=True)
    description = models.TextField(max_length=1000, blank=True)
    workload_value = models.PositiveIntegerField()
    workload_unit = models.CharField(max_length=50)
    vacancies = models.PositiveIntegerField()
    
    modality = models.CharField(max_length=20, choices=Modality.choices)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False)
    session_duration = models.DurationField(null=True, blank=True)
    schedule = models.JSONField(default=list, blank=True)
    
    requirements = models.JSONField(default=list)
    accepts_any_course = models.BooleanField(default=True)
    preferred_courses = models.JSONField(default=list, blank=True)
    
    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "opportunities_opportunity"

class SavedOpportunity(models.Model):
    student = models.ForeignKey("users.StudentProfile", on_delete=models.CASCADE, related_name="saved_opportunities")
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "opportunities_savedopportunity"
        unique_together = [("student", "opportunity")]


class OpportunityPhoto(models.Model):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="opportunities/photos/")

    class Meta:
        db_table = "opportunities_opportunityphoto"
