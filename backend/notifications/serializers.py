from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    opportunity_title = serializers.SerializerMethodField()
    application_id = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "type",
            "title",
            "message",
            "related_opportunity",
            "related_application",
            "opportunity_title",
            "application_id",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "recipient",
            "type",
            "title",
            "message",
            "related_opportunity",
            "related_application",
            "opportunity_title",
            "application_id",
            "created_at",
        ]

    def get_opportunity_title(self, obj):
        if obj.related_opportunity_id:
            return obj.related_opportunity.title
        return None

    def get_application_id(self, obj):
        if obj.related_application_id:
            return str(obj.related_application_id)
        return None
