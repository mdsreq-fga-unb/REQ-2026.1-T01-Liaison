from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import StudentProfile

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
            "role",
        ]
        read_only_fields = ["id"]

    def validate_username(self, value):
        if self.instance is None:  # create
            if not value or not value.strip():
                raise serializers.ValidationError("Username e obrigatorio.")
        return value

    def validate(self, attrs):
        # Role validation is handled by model field choices.
        # Organization-specific validation (cnpj, endereco) will be in OrganizationProfile (future issue).
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


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active:
            raise serializers.ValidationError("E-mail ou senha inválidos.")

        data["role"] = user.role
        data["nome"] = user.nome
        data["id"] = str(user.id)

        return data



class StudentProfileSerializer(serializers.Serializer):
    """Serializer read-only para retornar dados do StudentProfile na resposta."""
    universidade = serializers.CharField()
    curso = serializers.CharField()
    matricula = serializers.CharField()
    semestre_atual = serializers.IntegerField(allow_null=True)
    turno = serializers.CharField(allow_null=True, allow_blank=True)
    ano_conclusao = serializers.IntegerField(allow_null=True)
    horas_extensao_exigidas = serializers.IntegerField(allow_null=True)
    interesses = serializers.ListField(child=serializers.CharField())


class StudentRegistrationSerializer(serializers.Serializer):
    """
    Serializer para registro de estudante.
    Cria User + StudentProfile atomicamente.
    """
    # User fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    nome = serializers.CharField(required=True, max_length=120)

    # StudentProfile fields
    universidade = serializers.CharField(required=True, max_length=200)
    curso = serializers.CharField(required=True, max_length=200)
    matricula = serializers.CharField(required=True, max_length=50)
    semestre_atual = serializers.IntegerField(required=False, allow_null=True, default=None)
    turno = serializers.ChoiceField(
        choices=["matutino", "vespertino", "noturno", "integral"],
        required=False,
        allow_null=True,
        allow_blank=True,
        default=None,
    )
    ano_conclusao = serializers.IntegerField(required=False, allow_null=True, default=None)
    horas_extensao_exigidas = serializers.IntegerField(required=False, allow_null=True, default=None)
    interesses = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        return value

    def validate_universidade(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        return value

    def validate_curso(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        return value

    def validate_matricula(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        if StudentProfile.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Esta matrícula já está em uso.")
        return value

    def validate_interesses(self, value):
        if len(value) > 3:
            raise serializers.ValidationError("Máximo de 3 interesses permitidos.")
        return value

    @transaction.atomic
    def save(self, **kwargs):
        validated_data = self.validated_data
        email = validated_data["email"]
        password = validated_data["password"]
        nome = validated_data["nome"]

        # Create User
        username = email.split("@")[0]
        # Ensure username uniqueness
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            nome=nome,
            role=User.Role.ESTUDANTE,
        )
        user.set_password(password)
        user.save()

        # Create StudentProfile
        StudentProfile.objects.create(
            user=user,
            universidade=validated_data["universidade"],
            curso=validated_data["curso"],
            matricula=validated_data["matricula"],
            semestre_atual=validated_data.get("semestre_atual"),
            turno=validated_data.get("turno"),
            ano_conclusao=validated_data.get("ano_conclusao"),
            horas_extensao_exigidas=validated_data.get("horas_extensao_exigidas"),
            interesses=validated_data.get("interesses", []),
        )

        return user


class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value


class MatriculaCheckSerializer(serializers.Serializer):
    matricula = serializers.CharField(required=True, max_length=50)

    def validate_matricula(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        if StudentProfile.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Esta matrícula já está em uso.")
        return value