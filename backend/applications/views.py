from rest_framework import viewsets, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from opportunities.models import Opportunity
from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationEvaluationSerializer, ApplicationListSerializer


class ApplicationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ApplicationViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ApplicationPagination

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationListSerializer

    def get_queryset(self):
        qs = (
            Application.objects.filter(student__user=self.request.user)
            .select_related("opportunity", "opportunity__organization")
            .order_by("-created_at")
        )
        status_param = self.request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != "estudante" or not hasattr(user, "student_profile"):
            return Response(
                {"detail": "Apenas estudantes podem se candidatar a vagas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        opportunity = serializer.validated_data["opportunity"]

        if opportunity.status != Opportunity.Status.ACTIVE:
            return Response(
                {"detail": "Esta vaga não está mais aceitando candidaturas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Application.objects.filter(
            student=user.student_profile, opportunity=opportunity
        ).exists():
            return Response(
                {"detail": "Você já se candidatou a esta vaga."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application = serializer.save()
        return Response(
            ApplicationCreateSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


class OpportunityApplicationsViewSet(viewsets.GenericViewSet):
    """Endpoints da organização para avaliar candidaturas."""

    permission_classes = [permissions.IsAuthenticated]

    def _get_org_profile(self, request):
        if request.user.role != "organizacao" or not hasattr(request.user, "organization_profile"):
            return None
        return request.user.organization_profile

    def list_by_opportunity(self, request, opportunity_id=None):
        org = self._get_org_profile(request)
        if org is None:
            return Response(
                {"detail": "Apenas organizações podem acessar candidaturas."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            opportunity = Opportunity.objects.get(pk=opportunity_id)
        except Opportunity.DoesNotExist:
            return Response({"detail": "Vaga não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        if opportunity.organization != org:
            return Response(
                {"detail": "Você não tem permissão para acessar candidaturas desta vaga."},
                status=status.HTTP_403_FORBIDDEN,
            )

        applications = Application.objects.filter(opportunity=opportunity).select_related(
            "student__user"
        )
        serializer = ApplicationEvaluationSerializer(
            applications, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def evaluate(self, request, pk=None):
        org = self._get_org_profile(request)
        if org is None:
            return Response(
                {"detail": "Apenas organizações podem avaliar candidaturas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            application = Application.objects.select_related(
                "opportunity__organization"
            ).get(pk=pk)
        except Application.DoesNotExist:
            return Response({"detail": "Candidatura não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        if application.opportunity.organization != org:
            return Response(
                {"detail": "Você não tem permissão para avaliar esta candidatura."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")
        if new_status not in (Application.Status.APPROVED, Application.Status.REJECTED):
            return Response(
                {"detail": "Status inválido. Use 'approved' ou 'rejected'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        current = application.status
        is_reversal = current in (Application.Status.APPROVED, Application.Status.REJECTED) and current != new_status
        if is_reversal:
            confirmed = request.data.get("confirmed", False)
            if not confirmed:
                label = "aprovada" if current == Application.Status.APPROVED else "recusada"
                return Response(
                    {"detail": f"Esta candidatura já foi {label}. Deseja realmente alterar?", "requires_confirmation": True},
                    status=status.HTTP_409_CONFLICT,
                )

        application.status = new_status
        application.save(update_fields=["status", "updated_at"])

        return Response(ApplicationEvaluationSerializer(application).data)
