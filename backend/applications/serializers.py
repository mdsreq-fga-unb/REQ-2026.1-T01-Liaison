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
    class Meta:
        model = Opportunity
        fields = ["id", "title", "status"]


class ApplicationListSerializer(serializers.ModelSerializer):
    opportunity = ApplicationOpportunitySummarySerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "opportunity", "status", "created_at"]
