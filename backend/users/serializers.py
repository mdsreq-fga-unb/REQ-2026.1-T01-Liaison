from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import StudentProfile, OrganizationProfile, StudentGalleryPhoto
from .validators import validate_image_file_extension, validate_image_file_size, LettersAndNumbersValidator

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


class OrganizationProfileSerializer(serializers.Serializer):
    """Serializer read-only para retornar dados do OrganizationProfile na resposta."""
    cnpj = serializers.CharField()
    razao_social = serializers.CharField()
    nome_fantasia = serializers.CharField()
    telefone = serializers.CharField()
    nome_responsavel = serializers.CharField()
    status = serializers.CharField()

class OrganizationRegistrationSerializer(serializers.Serializer):
    """
    Serializer para registro de organização.
    Cria User + OrganizationProfile atomicamente.
    """
    # Campos do User
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    # Campos do Profile (O nome da Organização mapeia para 'nome' conceitualmente, mas usamos razao_social)
    cnpj = serializers.CharField(required=True, max_length=18)
    razao_social = serializers.CharField(required=True, max_length=200)
    nome_fantasia = serializers.CharField(required=False, max_length=200, allow_blank=True)
    telefone = serializers.CharField(required=True, max_length=20)
    nome_responsavel = serializers.CharField(required=True, max_length=150)

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

    def validate_cnpj(self, value):
        from .models import validar_cnpj
        if not value or not value.strip():
            raise serializers.ValidationError("Este campo é obrigatório.")
        
        # aplica validação
        try:
            validar_cnpj(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message)
            
        cnpj_numeros = re.sub(r"\D", "", value)
        
        if OrganizationProfile.objects.filter(cnpj=cnpj_numeros).exists():
            raise serializers.ValidationError("Este CNPJ já está cadastrado.")
        return cnpj_numeros

    @transaction.atomic
    def save(self, **kwargs):
        validated_data = self.validated_data
        email = validated_data["email"]
        password = validated_data["password"]

        # Cria o User
        username = email.split("@")[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            nome=validated_data.get("nome_fantasia") or validated_data["razao_social"],
            role=User.Role.ORGANIZACAO,
            is_active=False,
        )
        user.set_password(password)
        user.save()

        # Cria o OrganizationProfile
        OrganizationProfile.objects.create(
            user=user,
            cnpj=validated_data["cnpj"],
            razao_social=validated_data["razao_social"],
            nome_fantasia=validated_data.get("nome_fantasia", ""),
            telefone=validated_data["telefone"],
            nome_responsavel=validated_data["nome_responsavel"],
            status="pending"
        )

        return user


# ────────────────────────────────────────────────────────────
# Gallery Photo Serializer
# ────────────────────────────────────────────────────────────


class GalleryPhotoSerializer(serializers.ModelSerializer):
    """Serializer para uma foto da galeria."""

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentGalleryPhoto
        fields = ["id", "image_url", "created_at"]
        read_only_fields = ["id", "image_url", "created_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


# ────────────────────────────────────────────────────────────
# Student Profile Detail (GET /students/me/)
# ────────────────────────────────────────────────────────────


class StudentProfileDetailSerializer(serializers.ModelSerializer):
    """Serializer completo do perfil do estudante (read-only)."""

    id = serializers.CharField(source="user.id", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    nome = serializers.CharField(source="user.nome", read_only=True)
    avatar_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    events = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "email",
            "nome",
            "universidade",
            "curso",
            "matricula",
            "semestre_atual",
            "turno",
            "ano_conclusao",
            "horas_extensao_exigidas",
            "interesses",
            "avatar_url",
            "banner_url",
            "bio",
            "gallery",
            "stats",
            "events",
        ]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if request and obj.avatar:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_banner_url(self, obj):
        request = self.context.get("request")
        if request and obj.banner:
            return request.build_absolute_uri(obj.banner.url)
        return None

    def get_gallery(self, obj):
        photos = obj.gallery_photos.all()
        return GalleryPhotoSerializer(
            photos, many=True, context=self.context
        ).data

    def get_stats(self, obj):
        return {
            "total_hours_completed": 0,
            "total_hours_required": obj.horas_extensao_exigidas or 0,
            "total_events": 0,
        }

    def get_events(self, obj):
        return []


# ────────────────────────────────────────────────────────────
# Student Profile Update (PATCH /students/me/update/)
# ────────────────────────────────────────────────────────────


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualizacao parcial do perfil do estudante."""

    class Meta:
        model = StudentProfile
        fields = [
            "nome",
            "email",
            "universidade",
            "curso",
            "matricula",
            "semestre_atual",
            "turno",
            "ano_conclusao",
            "horas_extensao_exigidas",
            "interesses",
            "bio",
        ]

    nome = serializers.CharField(source="user.nome", required=False, max_length=120)
    email = serializers.EmailField(source="user.email", required=False)

    def validate_email(self, value):
        """Email nao pode ser alterado por este endpoint."""
        if self.instance and value != self.instance.user.email:
            raise serializers.ValidationError("Este campo não pode ser alterado.")
        return value

    def validate_interesses(self, value):
        if value and len(value) > 3:
            raise serializers.ValidationError("Máximo de 3 interesses permitidos.")
        return value

    def validate_matricula(self, value):
        """Matrícula deve ser única entre todos os estudantes."""
        if value and StudentProfile.objects.filter(matricula=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("Esta matrícula já está em uso.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        # Não permite alterar email
        user_data.pop("email", None)

        if user_data.get("nome"):
            instance.user.nome = user_data["nome"]
            instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


# ────────────────────────────────────────────────────────────
# Upload Serializers
# ────────────────────────────────────────────────────────────


class AvatarUploadSerializer(serializers.Serializer):
    """Serializer para upload de avatar."""

    avatar = serializers.FileField(
        validators=[validate_image_file_extension, validate_image_file_size]
    )


class BannerUploadSerializer(serializers.Serializer):
    """Serializer para upload de banner."""

    banner = serializers.FileField(
        validators=[validate_image_file_extension, validate_image_file_size]
    )


class GalleryUploadSerializer(serializers.Serializer):
    """Serializer para upload de fotos na galeria."""

    images = serializers.ListField(
        child=serializers.FileField(
            validators=[validate_image_file_extension, validate_image_file_size]
        ),
        allow_empty=False,
        min_length=1,
    )

    def create(self, validated_data, student_profile):
        photos = []
        for image in validated_data["images"]:
            photos.append(
                StudentGalleryPhoto.objects.create(
                    student_profile=student_profile,
                    image=image,
                )
            )
        return photos


# ────────────────────────────────────────────────────────────
# Change Password Serializer
# ────────────────────────────────────────────────────────────


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para alteracao de senha."""

    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate_new_password(self, value):
        validator = LettersAndNumbersValidator()
        try:
            validator.validate(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "As senhas não coincidem."}
            )
        return data

    def save(self, user):
        user.set_password(self.validated_data["new_password"])
        user.save()