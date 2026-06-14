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
        return 0

    def get_organization(self, obj):
        org = obj.organization
        return {
            "id": str(org.id),
            "razao_social": org.razao_social,
        }


class OpportunityCreateSerializer(serializers.ModelSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = ["organization"]

    def validate(self, attrs):
        status = attrs.get("status", Opportunity.Status.DRAFT)
        photos = attrs.get("photos", [])
        if status == Opportunity.Status.ACTIVE and not photos:
            raise serializers.ValidationError({"photos": "A vaga deve conter pelo menos uma foto para ser publicada."})
        return attrs

    def create(self, validated_data):
        photos_data = validated_data.pop("photos", [])
        opportunity = Opportunity.objects.create(**validated_data)
        for photo in photos_data:
            OpportunityPhoto.objects.create(opportunity=opportunity, image=photo)
        return opportunity
