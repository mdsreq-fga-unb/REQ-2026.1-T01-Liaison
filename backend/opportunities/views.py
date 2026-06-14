from django.utils import timezone
from rest_framework import viewsets, permissions, status, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Exists, OuterRef, Q

from .models import Opportunity, SavedOpportunity
from .serializers import OpportunitySerializer, OpportunityCreateSerializer
from .permissions import IsOwnerOrReadOnly


class OpportunityPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    pagination_class = OpportunityPagination

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return OpportunityCreateSerializer
        return OpportunitySerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        user = self.request.user
        if user.role == "organizacao":
            qs = Opportunity.objects.filter(organization__user=user)
        else:
            # Students and others see only active opportunities
            qs = Opportunity.objects.filter(status=Opportunity.Status.ACTIVE)
            # Annotate is_saved for student users (eliminates N+1)
            if user.role == "estudante" and hasattr(user, 'student_profile'):
                try:
                    qs = qs.annotate(
                        _is_saved=Exists(
                            SavedOpportunity.objects.filter(
                                student=user.student_profile,
                                opportunity=OuterRef('pk'),
                            )
                        )
                    )
                except Exception:
                    pass

        # Apply filters from query params
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(area__icontains=search) |
                Q(organization__razao_social__icontains=search)
            )

        area = params.get("area", "").strip()
        if area:
            qs = qs.filter(area=area)

        featured = params.get("featured", "").strip().lower()
        if featured == "true":
            qs = qs.filter(featured=True)
        elif featured == "false":
            qs = qs.filter(featured=False)

        modality = params.get("modality", "").strip()
        if modality:
            qs = qs.filter(modality=modality)

        # Ordering: featured first, then newest
        qs = qs.order_by("-featured", "-created_at")

        return qs

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.role != "organizacao" or not hasattr(user, 'organization_profile'):
            return Response({"detail": "Apenas organizações podem criar vagas."}, status=status.HTTP_403_FORBIDDEN)

        org_profile = user.organization_profile
        if org_profile.status != "approved":
            return Response({"detail": "Sua organização precisa ser aprovada para criar vagas."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organization=org_profile, status=request.data.get("status", Opportunity.Status.DRAFT))
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MyOpportunitiesList(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != "organizacao" or not hasattr(user, 'organization_profile'):
            return Opportunity.objects.none()
        return Opportunity.objects.filter(organization__user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class CategoriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Area label mapping
        area_labels = {
            "educacao": "Educação",
            "saude": "Saúde",
            "tecnologia": "Tecnologia",
            "meio_ambiente": "Meio Ambiente",
            "assistencia_social": "Assistência Social",
            "arte_cultura": "Arte & Cultura",
            "esporte": "Esporte",
        }

        active_qs = Opportunity.objects.filter(status=Opportunity.Status.ACTIVE)
        area_counts = dict(
            active_qs.values('area').annotate(c=Count('id')).values_list('area', 'c')
        )
        total_active = sum(area_counts.values())

        categories = [{"area": "all", "label": "Todas", "count": total_active}]

        for area_value, area_label in area_labels.items():
            count = area_counts.get(area_value, 0)
            if count > 0:
                categories.append({
                    "area": area_value,
                    "label": area_label,
                    "count": count,
                })

        return Response(categories)


class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "estudante":
            return Response(
                {"detail": "Acesso permitido apenas para estudantes."},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            profile = user.student_profile
        except Exception:
            return Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_403_FORBIDDEN,
            )

        horas_exigidas = profile.horas_extensao_exigidas or 0
        horas_acumuladas = 0  # placeholder until Attendance model exists
        progresso = round((horas_acumuladas / horas_exigidas) * 100) if horas_exigidas else 0
        vagas_salvas = SavedOpportunity.objects.filter(student=profile).count()

        local_time = timezone.localtime(timezone.now())
        hour = local_time.hour
        if 5 <= hour < 12:
            saudacao = "Bom dia"
        elif 12 <= hour < 18:
            saudacao = "Boa tarde"
        else:
            saudacao = "Boa noite"

        return Response({
            "nome": user.nome,
            "horas_acumuladas": horas_acumuladas,
            "horas_exigidas": horas_exigidas,
            "progresso_percentual": progresso,
            "inscricoes_ativas": 0,
            "vagas_salvas": vagas_salvas,
            "saudacao": saudacao,
        })


class SaveOpportunityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _check_student(self, request):
        """Returns (student_profile, error_response) tuple."""
        if request.user.role != "estudante":
            return None, Response(
                {"detail": "Apenas estudantes podem salvar vagas."},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            profile = request.user.student_profile
        except Exception:
            return None, Response(
                {"detail": "Perfil de estudante não encontrado."},
                status=status.HTTP_403_FORBIDDEN
            )
        return profile, None

    def post(self, request, opportunity_id):
        profile, error = self._check_student(request)
        if error:
            return error

        opportunity = get_object_or_404(Opportunity, id=opportunity_id)

        _saved_obj, created = SavedOpportunity.objects.get_or_create(
            student=profile, opportunity=opportunity
        )

        return_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response({"detail": "saved"}, status=return_status)

    def delete(self, request, opportunity_id):
        profile, error = self._check_student(request)
        if error:
            return error

        opportunity = get_object_or_404(Opportunity, id=opportunity_id)
        saved = SavedOpportunity.objects.filter(student=profile, opportunity=opportunity).first()
        if not saved:
            return Response(
                {"detail": "Vaga não está salva."},
                status=status.HTTP_404_NOT_FOUND
            )
        saved.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
