from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from opportunities.models import Opportunity
from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationListSerializer


class ApplicationViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationListSerializer

    def get_queryset(self):
        return (
            Application.objects.filter(student__user=self.request.user)
            .select_related("opportunity")
        )

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
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
