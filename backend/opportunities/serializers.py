from rest_framework import serializers
from .models import Opportunity, OpportunityPhoto, SavedOpportunity


class OpportunityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpportunityPhoto
        fields = ["id", "image"]


class OpportunitySerializer(serializers.ModelSerializer):
    photos = OpportunityPhotoSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    applicants_count = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = [
            "id", "organization", "title", "area", "description",
            "workload_value", "workload_unit", "vacancies",
            "modality", "location", "start_date", "start_time",
            "end_date", "is_recurring", "session_duration", "schedule",
            "requirements", "accepts_any_course", "preferred_courses",
            "status", "featured", "created_at", "updated_at",
            "photos", "is_saved", "applicants_count",
        ]
        read_only_fields = ["organization"]

    def get_is_saved(self, obj):
        # Use pre-annotated value to avoid N+1 query
        if hasattr(obj, '_is_saved'):
            return obj._is_saved
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            return False
        user = request.user
        if user.role != "estudante":
            return False
        try:
            profile = user.student_profile
        except Exception:
            return False
        return SavedOpportunity.objects.filter(student=profile, opportunity=obj).exists()

    def get_applicants_count(self, obj):
        # Usa anotação do queryset (evita N+1); fallback p/ contagem direta.
        if hasattr(obj, "_applicants_count"):
            return obj._applicants_count
        return obj.applications.count()

    def get_organization(self, obj):
        org = obj.organization
        return {
            "id": str(org.id),
            "user_id": str(org.user_id),
            "razao_social": org.razao_social,
        }


class OpportunityDetailSerializer(OpportunitySerializer):
    """Serializer de detalhe (RF09): organização expandida + contagem real de
    candidaturas + already_applied para o estudante autenticado."""

    already_applied = serializers.SerializerMethodField()

    class Meta(OpportunitySerializer.Meta):
        fields = OpportunitySerializer.Meta.fields + ["already_applied"]

    def get_organization(self, obj):
        org = obj.organization
        request = self.context.get("request")
        logo = None
        if request and org.logo:
            logo = request.build_absolute_uri(org.logo.url)
        return {
            "id": str(org.id),
            "user_id": str(org.user_id),
            "razao_social": org.razao_social,
            "nome_fantasia": org.nome_fantasia,
            "logo": logo,
            "mission": org.mission,
            "areas_de_atuacao": org.areas_de_atuacao,
        }

    def get_already_applied(self, obj):
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            return False
        user = request.user
        if user.role != "estudante":
            return False
        try:
            profile = user.student_profile
        except Exception:
            return False
        return obj.applications.filter(student=profile).exists()


class OpportunityCreateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = ["organization"]

    def validate(self, attrs):
        status_value = attrs.get("status")
        if not status_value and self.instance:
            status_value = self.instance.status
        if not status_value:
            status_value = Opportunity.Status.DRAFT

        # O título é obrigatório em QUALQUER situação (inclusive rascunho)
        title_val = attrs.get("title", getattr(self.instance, "title", "") if self.instance else "")
        if not str(title_val).strip():
            raise serializers.ValidationError({"title": "O título é obrigatório, mesmo para rascunhos."})

        photos = attrs.get("photos", [])
        
        was_already_active = self.instance is not None and self.instance.status != Opportunity.Status.DRAFT
        if status_value != Opportunity.Status.DRAFT and not was_already_active:
            campos_str = ["description", "area", "workload_unit", "modality"]
            campos_int = ["workload_value", "vacancies"]
            campos_data = ["start_date", "start_time"]
            
            for campo in campos_str + campos_data:
                val = attrs.get(campo, getattr(self.instance, campo, None) if self.instance else None)
                if not val:
                    raise serializers.ValidationError({campo: f"O campo {campo} é obrigatório para vagas publicadas."})
                    
            for campo in campos_int:
                val = attrs.get(campo, getattr(self.instance, campo, None) if self.instance else None)
                if val is None:
                    raise serializers.ValidationError({campo: f"O campo {campo} é obrigatório para vagas publicadas."})
            
            has_photo_in_request = bool(photos)
            has_photo_in_instance = self.instance and self.instance.photos.exists()
            if not has_photo_in_request and not has_photo_in_instance:
                raise serializers.ValidationError({"photos": "A vaga deve conter pelo menos uma foto para ser publicada."})
                
        return attrs

    def create(self, validated_data):
        photos_data = validated_data.pop("photos", [])
        opportunity = Opportunity.objects.create(**validated_data)
        for photo in photos_data:
            OpportunityPhoto.objects.create(opportunity=opportunity, image=photo)
        return opportunity

    def update(self, instance, validated_data):
        photos_data = validated_data.pop("photos", [])
        instance = super().update(instance, validated_data)
        for photo in photos_data:
            OpportunityPhoto.objects.create(opportunity=instance, image=photo)
        return instance
