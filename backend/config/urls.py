"""
URL configuration for Liaison project.
"""

from django.contrib import admin
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint. Returns 200 with status ok."""
    return Response({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    # Health check
    path("api/v1/health/", health_check, name="health-check"),
    # JWT Authentication
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
