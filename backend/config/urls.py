"""
Configuracao de rotas do projeto Liaison.
"""

from django.contrib import admin
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserViewSet

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
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/v1/users/", user_list, name="user-list"),
    path("api/v1/users/<uuid:pk>/", user_detail, name="user-detail"),
]
