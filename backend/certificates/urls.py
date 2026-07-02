from django.urls import path

from .views import CertificateViewSet

urlpatterns = [
    path(
        "",
        CertificateViewSet.as_view({"get": "list"}),
        name="certificate-list",
    ),
    path(
        "issue/",
        CertificateViewSet.as_view({"post": "issue"}),
        name="certificate-issue",
    ),
    path(
        "<uuid:pk>/download/",
        CertificateViewSet.as_view({"get": "download"}),
        name="certificate-download",
    ),
]
