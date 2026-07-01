from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OpportunityViewSet, CategoriesView, SaveOpportunityView

router = DefaultRouter()
router.register(r'', OpportunityViewSet, basename='opportunity')

urlpatterns = [
    path('categories/', CategoriesView.as_view(), name='opportunity-categories'),
    path('<uuid:opportunity_id>/save/', SaveOpportunityView.as_view(), name='opportunity-save'),
    path('', include(router.urls)),
]
