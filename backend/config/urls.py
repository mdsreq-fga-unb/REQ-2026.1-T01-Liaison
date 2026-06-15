"""
Configuracao de rotas do projeto Liaison.
"""

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
    AdminOrganizationViewSet,
)
from users.views import PasswordResetRequestView, PasswordResetConfirmView

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
    # Endpoints de verificação e moderação de organizações 
    path(
        "api/v1/admin/organizations/",
        AdminOrganizationViewSet.as_view({"get": "list"}),
        name="admin-organization-list",
    ),
    path(
        "api/v1/admin/organizations/<uuid:pk>/approve/",
        AdminOrganizationViewSet.as_view({"post": "approve"}),
        name="admin-organization-approve",
    ),
    path(
        "api/v1/admin/organizations/<uuid:pk>/reject/",
        AdminOrganizationViewSet.as_view({"post": "reject"}),
        name="admin-organization-reject",
    ),
    path(
        "api/v1/admin/organizations/<uuid:pk>/request-info/",
        AdminOrganizationViewSet.as_view({"post": "request_info"}),
        name="admin-organization-request-info",
    ),
    path(
        "api/users/password-reset/", 
        PasswordResetRequestView.as_view(), 
        name="password_reset_request",
    ),
    path(
        "api/users/password-reset-confirm/", 
        PasswordResetConfirmView.as_view(), 
        name="password_reset_confirm",
    ),

]

