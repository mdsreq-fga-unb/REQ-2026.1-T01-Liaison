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
