"""
Configuracao de rotas do projeto Liaison.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import (
    UserViewSet,
    CustomTokenObtainPairView,
    check_email,
    check_matricula,
    student_register,
    organization_register,
    StudentProfileView,
    StudentProfileUpdateView,
    AvatarUploadView,
    BannerUploadView,
    GalleryUploadView,
    GalleryDeleteView,
    ChangePasswordView,
    OrganizationProfileView,
    OrganizationProfileUpdateView,
    OrgLogoUploadView,
    OrgBannerUploadView,
    OrgGalleryUploadView,
    OrgGalleryDeleteView,
    OrgChangePasswordView,
    AdminOrganizationViewSet,
)
from opportunities.views import MyOpportunitiesList, StudentDashboardView
from certificates.views import validate_certificate, validate_form

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Checagem de saude. Retorna 200 com status ok."""
    return Response({"status": "ok"})


user_list = UserViewSet.as_view({"get": "list", "post": "create"})
user_detail = UserViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)


urlpatterns = [
    path("admin/", admin.site.urls),
    # Checagem de saude
    path("api/v1/health/", health_check, name="health-check"),
    # Autenticacao JWT
    path("api/v1/auth/login/", CustomTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Registro de estudante
    path("api/v1/auth/register/student/", student_register, name="student-register"),
    # Registro de organizacao
    path("api/v1/auth/register/organization/", organization_register, name="organization-register"),
    # Verificacoes de unicidade
    path("api/v1/auth/check-email/", check_email, name="check-email"),
    path("api/v1/auth/check-matricula/", check_matricula, name="check-matricula"),
    path("api/v1/users/", user_list, name="user-list"),
    path("api/v1/users/<uuid:pk>/", user_detail, name="user-detail"),
    # Perfil do estudante
    path("api/v1/students/me/", StudentProfileView.as_view(), name="student-profile-detail"),
    path("api/v1/students/me/update/", StudentProfileUpdateView.as_view(), name="student-profile-update"),
    path("api/v1/students/me/avatar/", AvatarUploadView.as_view(), name="student-avatar-upload"),
    path("api/v1/students/me/banner/", BannerUploadView.as_view(), name="student-banner-upload"),
    path("api/v1/students/me/gallery/", GalleryUploadView.as_view(), name="student-gallery-upload"),
    path("api/v1/students/me/gallery/<uuid:photo_id>/", GalleryDeleteView.as_view(), name="student-gallery-delete"),
    path("api/v1/students/me/change-password/", ChangePasswordView.as_view(), name="student-change-password"),
    path("api/v1/students/dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    # Perfil da organização
    path("api/v1/organizations/me/", OrganizationProfileView.as_view(), name="org-profile-detail"),
    path("api/v1/organizations/me/update/", OrganizationProfileUpdateView.as_view(), name="org-profile-update"),
    path("api/v1/organizations/me/logo/", OrgLogoUploadView.as_view(), name="org-logo-upload"),
    path("api/v1/organizations/me/banner/", OrgBannerUploadView.as_view(), name="org-banner-upload"),
    path("api/v1/organizations/me/gallery/", OrgGalleryUploadView.as_view(), name="org-gallery-upload"),
    path("api/v1/organizations/me/gallery/<uuid:photo_id>/", OrgGalleryDeleteView.as_view(), name="org-gallery-delete"),
    path("api/v1/organizations/me/change-password/", OrgChangePasswordView.as_view(), name="org-change-password"),
    # Endpoints de verificação e moderação de organizações
    path(
        "api/v1/admin/organizations/",
        AdminOrganizationViewSet.as_view({"get": "list"}),
        name="admin-organization-list",
    ),
    path(
        "api/v1/admin/organizations/<int:pk>/approve/",
        AdminOrganizationViewSet.as_view({"post": "approve"}),
        name="admin-organization-approve",
    ),
    path(
        "api/v1/admin/organizations/<int:pk>/reject/",
        AdminOrganizationViewSet.as_view({"post": "reject"}),
        name="admin-organization-reject",
    ),
    path(
        "api/v1/admin/organizations/<int:pk>/request-info/",
        AdminOrganizationViewSet.as_view({"post": "request_info"}),
        name="admin-organization-request-info",
    ),
    # Vagas de voluntariado
    path("api/v1/organizations/me/opportunities/", MyOpportunitiesList.as_view(), name="my-opportunities"),
    path("api/v1/opportunities/", include("opportunities.urls")),
    path("api/v1/applications/", include("applications.urls")),
    path("api/v1/certificates/", include("certificates.urls")),
    # Validação pública de certificado (HTML, sem auth) — QR/código apontam aqui.
    path("validar/", validate_form, name="certificate-validate-form"),
    path("validar/<uuid:validation_uuid>/", validate_certificate, name="certificate-validate"),
]

# Serve media files in development (DEBUG=True only)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
