from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.response import Response
from .models import Opportunity
from .serializers import OpportunitySerializer, OpportunityCreateSerializer
from .permissions import IsOwnerOrReadOnly


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return OpportunityCreateSerializer
        return OpportunitySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "organizacao":
            return Opportunity.objects.filter(organization__user=user)
        return Opportunity.objects.filter(status=Opportunity.Status.ACTIVE)

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != "organizacao" or not hasattr(user, 'organization_profile'):
            return Response(
                {"detail": "Apenas organizações podem criar vagas."},
                status=status.HTTP_403_FORBIDDEN
            )
        org_profile = user.organization_profile
        if org_profile.status != "approved":
            return Response(
                {"detail": "Sua organização precisa ser aprovada para criar vagas."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            organization=org_profile,
            status=request.data.get("status", Opportunity.Status.DRAFT)
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def _check_status_not_closed(self, opportunity):
        """Retorna Response de erro se a vaga estiver encerrada, None caso contrario."""
        if opportunity.status == Opportunity.Status.CLOSED:
            return Response(
                {"detail": "Vagas encerradas não podem ser editadas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return None

    def _check_status_not_writable(self, request, opportunity):
        """Bloqueia qualquer tentativa de reescrever status diretamente via PUT/PATCH."""
        if "status" in request.data:
            return Response(
                {"detail": "O status da vaga não pode ser alterado diretamente. Use os endpoints /publish/, /pause/, /resume/, /close/ ou /reopen/."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return None

    # ── Issue #50 — US2.2 Edição de Vagas (RF19) ──────────────────────────
    def partial_update(self, request, *args, **kwargs):
        opportunity = self.get_object()
        err = self._check_status_not_closed(opportunity)
        if err:
            return err
        err = self._check_status_not_writable(request, opportunity)
        if err:
            return err
        serializer = self.get_serializer(opportunity, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        opportunity = self.get_object()
        err = self._check_status_not_closed(opportunity)
        if err:
            return err
        err = self._check_status_not_writable(request, opportunity)
        if err:
            return err
        serializer = self.get_serializer(opportunity, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # ── Issue #51 — US2.3 Publicação de Vagas (RF20) ──────────────────────
    @action(detail=True, methods=["patch"], url_path="publish")
    def publish(self, request, pk=None):
        opportunity = self.get_object()
        if opportunity.status == Opportunity.Status.ACTIVE:
            return Response(
                {"detail": "A vaga já está publicada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if opportunity.status == Opportunity.Status.CLOSED:
            return Response(
                {"detail": "Vagas encerradas não podem ser publicadas. Use reopen primeiro."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Validacao de campos obrigatorios — separada por tipo para evitar
        # falso positivo com inteiros zerados (ex: workload_value=0)
        campos_str = ["title", "description", "area", "workload_unit", "modality"]
        campos_int = ["workload_value", "vacancies"]
        campos_data = ["start_date", "start_time"]
        for campo in campos_str:
            if not getattr(opportunity, campo, None):
                return Response(
                    {"detail": f"Preencha o campo obrigatório antes de publicar: {campo}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        for campo in campos_int:
            if getattr(opportunity, campo, None) is None:
                return Response(
                    {"detail": f"Preencha o campo obrigatório antes de publicar: {campo}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        for campo in campos_data:
            if not getattr(opportunity, campo, None):
                return Response(
                    {"detail": f"Preencha o campo obrigatório antes de publicar: {campo}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        # Validacao de foto obrigatoria para publicar
        if not opportunity.photos.exists():
            return Response(
                {"detail": "A vaga deve conter pelo menos uma foto para ser publicada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if request.user.organization_profile.status != "approved":
            return Response(
                {"detail": "Sua organização precisa ser aprovada para publicar vagas."},
                status=status.HTTP_403_FORBIDDEN
            )
        opportunity.status = Opportunity.Status.ACTIVE
        opportunity.save()
        return Response(
            {"detail": "Vaga publicada com sucesso.", "status": opportunity.status}
        )

    @action(detail=True, methods=["patch"], url_path="pause")
    def pause(self, request, pk=None):
        opportunity = self.get_object()
        if opportunity.status != Opportunity.Status.ACTIVE:
            return Response(
                {"detail": "Apenas vagas publicadas podem ser pausadas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        opportunity.status = Opportunity.Status.PAUSED
        opportunity.save()
        return Response(
            {"detail": "Vaga pausada com sucesso.", "status": opportunity.status}
        )

    @action(detail=True, methods=["patch"], url_path="resume")
    def resume(self, request, pk=None):
        opportunity = self.get_object()
        if opportunity.status != Opportunity.Status.PAUSED:
            return Response(
                {"detail": "Apenas vagas pausadas podem ser reativadas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        opportunity.status = Opportunity.Status.ACTIVE
        opportunity.save()
        return Response(
            {"detail": "Vaga reativada com sucesso.", "status": opportunity.status}
        )

    # ── Issue #52 — US2.4 Encerramento de Vagas (RF21) ────────────────────
    @action(detail=True, methods=["patch"], url_path="close")
    def close(self, request, pk=None):
        opportunity = self.get_object()
        if opportunity.status == Opportunity.Status.CLOSED:
            return Response(
                {"detail": "A vaga já está encerrada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if opportunity.status == Opportunity.Status.DRAFT:
            return Response(
                {"detail": "Vagas em rascunho não podem ser encerradas. Publique primeiro."},
                status=status.HTTP_400_BAD_REQUEST
            )
        opportunity.status = Opportunity.Status.CLOSED
        opportunity.save()
        return Response(
            {"detail": "Vaga encerrada com sucesso. Candidaturas existentes preservadas.",
             "status": opportunity.status}
        )

    @action(detail=True, methods=["patch"], url_path="reopen")
    def reopen(self, request, pk=None):
        opportunity = self.get_object()
        if opportunity.status != Opportunity.Status.CLOSED:
            return Response(
                {"detail": "Apenas vagas encerradas podem ser reabertas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Verifica aprovacao da organizacao antes de reativar
        if request.user.organization_profile.status != "approved":
            return Response(
                {"detail": "Sua organização precisa estar aprovada para reabrir vagas."},
                status=status.HTTP_403_FORBIDDEN
            )
        opportunity.status = Opportunity.Status.ACTIVE
        opportunity.save()
        return Response(
            {"detail": "Vaga reaberta com sucesso.", "status": opportunity.status}
        )


class MyOpportunitiesList(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "organizacao" or not hasattr(user, 'organization_profile'):
            return Opportunity.objects.none()
        return Opportunity.objects.filter(organization__user=user)