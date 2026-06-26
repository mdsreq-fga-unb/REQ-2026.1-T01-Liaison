from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from .models import StudentProfile, StudentGalleryPhoto, OrgGalleryPhoto, OrganizationProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    EmailCheckSerializer,
    MatriculaCheckSerializer,
    StudentRegistrationSerializer,
    OrganizationRegistrationSerializer,
    OrganizationProfileSerializer,
    UserSerializer,
    StudentProfileDetailSerializer,
    StudentProfileUpdateSerializer,
    AvatarUploadSerializer,
    BannerUploadSerializer,
    GalleryUploadSerializer,
    GalleryPhotoSerializer,
    ChangePasswordSerializer,
    OrganizationProfileDetailSerializer,
    OrganizationProfileUpdateSerializer,
    OrgLogoUploadSerializer,
    OrgBannerUploadSerializer,
    OrgGalleryUploadSerializer,
    OrgGalleryPhotoSerializer,
    OrgChangePasswordSerializer,
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


class IsEstudante(permissions.BasePermission):
    """Permite apenas usuarios com role 'estudante'."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ESTUDANTE
        )


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
        if page is not None:
            serializer = OrganizationAdminSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = OrganizationAdminSerializer(qs, many=True)
        return Response(serializer.data)

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


# ────────────────────────────────────────────────────────────
# Student Profile Views
# ────────────────────────────────────────────────────────────

def _get_student_profile(user):
    """Helper: obtem o StudentProfile do usuario ou retorna None."""
    try:
        return user.student_profile
    except StudentProfile.DoesNotExist:
        return None


class StudentProfileView(APIView):
    """GET /api/v1/students/me/ — perfil completo do estudante."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]

    def get(self, request):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = StudentProfileDetailSerializer(
            profile, context={"request": request}
        )
        return Response(serializer.data)


class StudentProfileUpdateView(APIView):
    """PATCH /api/v1/students/me/update/ — atualiza dados do perfil."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]

    def patch(self, request):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = StudentProfileUpdateSerializer(
            profile, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        updated_profile = serializer.save()
        detail_serializer = StudentProfileDetailSerializer(
            updated_profile, context={"request": request}
        )
        return Response(detail_serializer.data)


class AvatarUploadView(APIView):
    """POST /api/v1/students/me/avatar/ — upload de avatar."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AvatarUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile.avatar = serializer.validated_data["avatar"]
        profile.save()
        avatar_url = (
            request.build_absolute_uri(profile.avatar.url)
            if profile.avatar
            else None
        )
        return Response({"avatar_url": avatar_url})


class BannerUploadView(APIView):
    """POST /api/v1/students/me/banner/ — upload de banner."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = BannerUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile.banner = serializer.validated_data["banner"]
        profile.save()
        banner_url = (
            request.build_absolute_uri(profile.banner.url)
            if profile.banner
            else None
        )
        return Response({"banner_url": banner_url})


class GalleryUploadView(APIView):
    """POST /api/v1/students/me/gallery/ — upload de fotos na galeria."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = GalleryUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photos = serializer.create(serializer.validated_data, student_profile=profile)
        result = GalleryPhotoSerializer(
            photos, many=True, context={"request": request}
        ).data
        return Response(result, status=status.HTTP_201_CREATED)


class GalleryDeleteView(APIView):
    """DELETE /api/v1/students/me/gallery/<photo_id>/ — remove foto da galeria."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]

    def delete(self, request, photo_id):
        profile = _get_student_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        photo = get_object_or_404(
            StudentGalleryPhoto, id=photo_id, student_profile=profile
        )
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    """POST /api/v1/students/me/change-password/ — altera senha."""

    permission_classes = [permissions.IsAuthenticated, IsEstudante]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response({"detail": "Senha alterada com sucesso."})


# ────────────────────────────────────────────────────────────
# Organization Profile Views
# ────────────────────────────────────────────────────────────


class IsOrganizacao(permissions.BasePermission):
    """Permite apenas usuários com role 'organizacao'."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.ORGANIZACAO
        )


def _get_org_profile(user):
    """Helper: obtém o OrganizationProfile do usuário ou retorna None."""
    try:
        return user.organization_profile
    except OrganizationProfile.DoesNotExist:
        return None


class OrganizationProfileView(APIView):
    """GET /api/v1/organizations/me/ — perfil completo da organização."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]

    def get(self, request):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrganizationProfileDetailSerializer(
            profile, context={"request": request}
        )
        return Response(serializer.data)


class OrganizationProfileUpdateView(APIView):
    """PATCH /api/v1/organizations/me/update/ — atualiza dados do perfil."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]

    def patch(self, request):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrganizationProfileUpdateSerializer(
            profile, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        updated_profile = serializer.save()
        detail_serializer = OrganizationProfileDetailSerializer(
            updated_profile, context={"request": request}
        )
        return Response(detail_serializer.data)


class OrgLogoUploadView(APIView):
    """POST /api/v1/organizations/me/logo/ — upload de logo."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrgLogoUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile.logo = serializer.validated_data["logo"]
        profile.save()
        logo_url = (
            request.build_absolute_uri(profile.logo.url)
            if profile.logo
            else None
        )
        return Response({"logo_url": logo_url})


class OrgBannerUploadView(APIView):
    """POST /api/v1/organizations/me/banner/ — upload de banner."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrgBannerUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile.banner = serializer.validated_data["banner"]
        profile.save()
        banner_url = (
            request.build_absolute_uri(profile.banner.url)
            if profile.banner
            else None
        )
        return Response({"banner_url": banner_url})


class OrgGalleryUploadView(APIView):
    """POST /api/v1/organizations/me/gallery/ — upload de fotos na galeria."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrgGalleryUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        photos = serializer.create(
            serializer.validated_data, organization_profile=profile
        )
        result = OrgGalleryPhotoSerializer(
            photos, many=True, context={"request": request}
        ).data
        return Response(result, status=status.HTTP_201_CREATED)


class OrgGalleryDeleteView(APIView):
    """DELETE /api/v1/organizations/me/gallery/<photo_id>/ — remove foto da galeria."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]

    def delete(self, request, photo_id):
        profile = _get_org_profile(request.user)
        if not profile:
            return Response(
                {"detail": "Perfil de organização não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        photo = get_object_or_404(
            OrgGalleryPhoto, id=photo_id, organization_profile=profile
        )
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrgChangePasswordView(APIView):
    """POST /api/v1/organizations/me/change-password/ — altera senha."""

    permission_classes = [permissions.IsAuthenticated, IsOrganizacao]

    def post(self, request):
        serializer = OrgChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=request.user)
        return Response({"detail": "Senha alterada com sucesso."})