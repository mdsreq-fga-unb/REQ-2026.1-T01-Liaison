from rest_framework import serializers
from .models import Opportunity, OpportunityPhoto

class OpportunityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpportunityPhoto
        fields = ["id", "image"]

class OpportunitySerializer(serializers.ModelSerializer):
    photos = OpportunityPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Opportunity
        fields = "__all__"
        read_only_fields = ["organization"]

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
