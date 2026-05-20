from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "password",
            "nome",
            "telefone",
            "matricula",
            "cnpj",
            "endereco",
            "role",
        ]
        read_only_fields = ["id"]

    def validate_username(self, value):
        if self.instance is None:  # create
            if not value or not value.strip():
                raise serializers.ValidationError("Username e obrigatorio.")
        return value

    def validate(self, attrs):
        role = attrs.get("role") or getattr(self.instance, "role", None)

        if role == User.Role.ESTUDANTE:
            if not attrs.get("matricula") and not getattr(self.instance, "matricula", None):
                raise serializers.ValidationError({"matricula": "Matricula obrigatoria para estudante."})

        if role == User.Role.ORGANIZACAO:
            if not attrs.get("cnpj") and not getattr(self.instance, "cnpj", None):
                raise serializers.ValidationError({"cnpj": "CNPJ obrigatorio para organizacao."})
            if not attrs.get("endereco") and not getattr(self.instance, "endereco", None):
                raise serializers.ValidationError({"endereco": "Endereco obrigatorio para organizacao."})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance