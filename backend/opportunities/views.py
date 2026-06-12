from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Opportunity
from .serializers import OpportunitySerializer, OpportunityCreateSerializer
from .permissions import IsOwnerOrReadOnly

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return OpportunityCreateSerializer
        return OpportunitySerializer

    def get_queryset(self):
        # Base implementation: organizations see their own, students see active
        user = self.request.user
        if user.role == "organizacao":
            return Opportunity.objects.filter(organization__user=user)
        return Opportunity.objects.filter(status=Opportunity.Status.ACTIVE)

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
