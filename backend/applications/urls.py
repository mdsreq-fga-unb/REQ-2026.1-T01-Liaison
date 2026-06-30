from django.urls import path

from .views import ApplicationViewSet, OpportunityApplicationsViewSet

urlpatterns = [
    path(
        "",
        ApplicationViewSet.as_view({"get": "list", "post": "create"}),
        name="application-list",
    ),
    # RF11 — listar candidatos de uma vaga (organização)
    path(
        "opportunities/<uuid:opportunity_id>/",
        OpportunityApplicationsViewSet.as_view({"get": "list_by_opportunity"}),
        name="application-list-by-opportunity",
    ),
    # RF11 — aprovar/recusar candidatura (organização)
    path(
        "<uuid:pk>/evaluate/",
        OpportunityApplicationsViewSet.as_view({"patch": "evaluate"}),
        name="application-evaluate",
    ),
]
