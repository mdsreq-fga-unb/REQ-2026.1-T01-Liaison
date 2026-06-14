from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from .serializers import (
    CustomTokenObtainPairSerializer,
    EmailCheckSerializer,
    MatriculaCheckSerializer,
    StudentRegistrationSerializer,
    OrganizationRegistrationSerializer,
    OrganizationProfileSerializer,
    UserSerializer,
    OrganizationAdminSerializer,
    AdminActionLogSerializer,
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


class AdminOrganizationViewSet(viewsets.ViewSet):
    """Endpoints para moderacao de organizacoes."""

    permission_classes = [IsAdmin]
    pagination_class = PageNumberPagination

    def list(self, request):
        """GET /api/v1/admin/organizations/?status=&search=&page="""
        queryset = [op for op in []]
        # Query OrganizationProfile
        qs = []
        from .models import OrganizationProfile

        qs = OrganizationProfile.objects.select_related("user").all()

        status_filter = request.query_params.get("status")
        search = request.query_params.get("search")

        if status_filter:
            qs = qs.filter(status=status_filter)

        if search:
            qs = qs.filter(Q(razao_social__icontains=search) | Q(cnpj__icontains=search) | Q(nome_responsavel__icontains=search) | Q(user__email__icontains=search))

        # Paginate
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(qs, request)
        serializer = OrganizationAdminSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        """Aprova uma organizacao pendente."""
        from .models import OrganizationProfile, AdminActionLog

        org = get_object_or_404(OrganizationProfile, pk=pk)
        if org.status == "approved":
            return Response({"detail": "Organizacao ja aprovada."}, status=status.HTTP_400_BAD_REQUEST)

        org.status = "approved"
        org.user.is_active = True
        org.user.save()
        org.save()

        # registra auditoria
        AdminActionLog.objects.create(admin=request.user, organization=org, action=AdminActionLog.Action.APPROVE, details="Aprovado via painel admin")

        return Response({"detail": "Organizacao aprovada."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Reprova uma organizacao, requer motivo no body: {"reason": "..."}"""
        from .models import OrganizationProfile, AdminActionLog

        org = get_object_or_404(OrganizationProfile, pk=pk)
        reason = request.data.get("reason") or request.data.get("details")
        if not reason:
            return Response({"detail": "Motivo obrigatorio."}, status=status.HTTP_400_BAD_REQUEST)

        org.status = "rejected"
        org.user.is_active = False
        org.user.save()
        org.save()

        AdminActionLog.objects.create(admin=request.user, organization=org, action=AdminActionLog.Action.REJECT, details=reason)

        return Response({"detail": "Organizacao reprovada."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="request-info")
    def request_info(self, request, pk=None):
        """Solicita informacoes complementares: body {"message": "..."}"""
        from .models import OrganizationProfile, AdminActionLog

        org = get_object_or_404(OrganizationProfile, pk=pk)
        message = request.data.get("message") or request.data.get("details")
        if not message:
            return Response({"detail": "Mensagem obrigatoria."}, status=status.HTTP_400_BAD_REQUEST)

        # Mantem status pendente
        AdminActionLog.objects.create(admin=request.user, organization=org, action=AdminActionLog.Action.REQUEST_INFO, details=message)

        return Response({"detail": "Solicitacao registrada."}, status=status.HTTP_200_OK)


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

    # Constrói os dados do profile
    profile_data = OrganizationProfileSerializer(user.organization_profile).data

    data = {
        "id": str(user.id),
        "email": user.email,
        "nome": user.nome,
        "role": user.role,
        "organization_profile": profile_data,
    }

    return Response(data, status=status.HTTP_201_CREATED)