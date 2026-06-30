from rest_framework import viewsets, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from opportunities.models import Opportunity
from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationListSerializer


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