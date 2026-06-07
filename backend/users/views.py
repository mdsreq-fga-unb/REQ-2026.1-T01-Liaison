from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    CustomTokenObtainPairSerializer,
    EmailCheckSerializer,
    MatriculaCheckSerializer,
    StudentRegistrationSerializer,
    OrganizationRegistrationSerializer,
    OrganizationProfileSerializer,
    UserSerializer,
)

User = get_user_model()


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.ADMIN


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and request.user.role == User.Role.ADMIN:
            return True
        return request.user.is_authenticated and obj.id == request.user.id


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]



class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        if self.action == "list":
            return [IsAdmin()]
        return [IsAdminOrSelf()]


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def student_register(request):
    """
    POST /api/v1/auth/register/student/
    Cria User(role=estudante) + StudentProfile atomicamente.
    Retorna user data + tokens no formato 201.
    """
    serializer = StudentRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = serializer.save()
    except IntegrityError as e:
        error_detail = str(e)
        if "email" in error_detail.lower() or "users_user_email_key" in error_detail.lower():
            return Response({"email": ["Este e-mail já está em uso."]}, status=status.HTTP_400_BAD_REQUEST)
        if "matricula" in error_detail.lower() or "studentprofile_matricula" in error_detail.lower():
            return Response({"matricula": ["Esta matrícula já está em uso."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Erro ao criar conta. Dado duplicado."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"detail": "Erro interno do servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # Build student_profile data
    profile = user.student_profile
    profile_data = {
        "universidade": profile.universidade,
        "curso": profile.curso,
        "matricula": profile.matricula,
        "semestre_atual": profile.semestre_atual,
        "turno": profile.turno,
        "ano_conclusao": profile.ano_conclusao,
        "horas_extensao_exigidas": profile.horas_extensao_exigidas,
        "interesses": profile.interesses,
    }

    data = {
        "id": str(user.id),
        "email": user.email,
        "nome": user.nome,
        "role": user.role,
        "student_profile": profile_data,
        "tokens": {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
    }

    return Response(data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def check_email(request):
    """
    POST /api/v1/auth/check-email/
    Verifica se o email ja esta em uso.
    Retorna 200 se disponivel, 400 se ja cadastrado.
    """
    serializer = EmailCheckSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"available": True})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def check_matricula(request):
    """
    POST /api/v1/auth/check-matricula/
    Verifica se a matricula ja esta em uso.
    Retorna 200 se disponivel, 400 se ja cadastrada.
    """
    serializer = MatriculaCheckSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"available": True})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def organization_register(request):
    """
    POST /api/v1/auth/register/organization/
    Cria User(role=organizacao) + OrganizationProfile atomicamente.
    Retorna user data + tokens no formato 201.
    """
    serializer = OrganizationRegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = serializer.save()
    except IntegrityError as e:
        error_detail = str(e)
        if "email" in error_detail.lower() or "users_user_email_key" in error_detail.lower():
            return Response({"email": ["Este e-mail já está em uso."]}, status=status.HTTP_400_BAD_REQUEST)
        if "cnpj" in error_detail.lower() or "organizationprofile_cnpj" in error_detail.lower():
            return Response({"cnpj": ["Este CNPJ já está cadastrado."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Erro ao criar conta. Dado duplicado."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"detail": "Erro interno do servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Gera os tokens JWT
    refresh = RefreshToken.for_user(user)

    # Constrói os dados do profile
    profile_data = OrganizationProfileSerializer(user.organization_profile).data

    data = {
        "id": str(user.id),
        "email": user.email,
        "nome": user.nome,
        "role": user.role,
        "organization_profile": profile_data,
        "tokens": {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
    }

    return Response(data, status=status.HTTP_201_CREATED)