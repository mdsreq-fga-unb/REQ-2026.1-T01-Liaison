from django.urls import path

from .views import ApplicationViewSet

urlpatterns = [
    path(
        "",
        ApplicationViewSet.as_view({"get": "list", "post": "create"}),
        name="application-list",
    ),
]
