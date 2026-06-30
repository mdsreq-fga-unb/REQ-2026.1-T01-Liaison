from rest_framework import serializers

from opportunities.models import Opportunity
from .models import Application


class ApplicationCreateSerializer(serializers.ModelSerializer):
    opportunity = serializers.PrimaryKeyRelatedField(
        queryset=Opportunity.objects.all()
    )

    class Meta:
        model = Application
        fields = ["id", "opportunity", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    # Regras de negócio (vaga fechada / duplicata) vivem na view para garantir
    # o shape de erro {"detail": "..."} exigido pelos critérios de aceite.
    def create(self, validated_data):
        validated_data["student"] = self.context["request"].user.student_profile
        return super().create(validated_data)


class ApplicationOpportunitySummarySerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity
        fields = ["id", "title", "status", "organization"]

    def get_organization(self, obj):
        org = obj.organization
        return {
            "user_id": str(org.user_id),
            "razao_social": org.razao_social,
        }


class ApplicationListSerializer(serializers.ModelSerializer):
    opportunity = ApplicationOpportunitySummarySerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "opportunity", "status", "created_at"]



class ApplicationStudentSummarySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="user.id", read_only=True)
    nome = serializers.CharField(source="user.nome")
    curso = serializers.CharField()
    universidade = serializers.CharField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = __import__("users.models", fromlist=["StudentProfile"]).StudentProfile
        fields = ["id", "nome", "curso", "universidade", "avatar_url"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar and obj.avatar.name and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class ApplicationEvaluationSerializer(serializers.ModelSerializer):
    student = ApplicationStudentSummarySerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "student", "status", "created_at"]