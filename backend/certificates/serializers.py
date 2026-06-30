from rest_framework import serializers
from rest_framework.reverse import reverse

from .models import Certificate


class CertificateOpportunitySummarySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    title = serializers.CharField()


class CertificateListSerializer(serializers.ModelSerializer):
    opportunity = serializers.SerializerMethodField()
    organization_nome = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "id",
            "opportunity",
            "organization_nome",
            "hours",
            "issued_at",
            "validation_uuid",
            "download_url",
        ]

    def get_opportunity(self, cert):
        opp = cert.application.opportunity
        return {"id": opp.id, "title": opp.title}

    def get_organization_nome(self, cert):
        return cert.application.opportunity.organization.razao_social

    def get_download_url(self, cert):
        request = self.context.get("request")
        url = reverse("certificate-download", args=[cert.id], request=request)
        return url


class CertificateIssueSerializer(serializers.Serializer):
    """Entrada do endpoint temporário POST /certificates/issue/."""

    application = serializers.UUIDField()
    hours = serializers.IntegerField(min_value=1)
