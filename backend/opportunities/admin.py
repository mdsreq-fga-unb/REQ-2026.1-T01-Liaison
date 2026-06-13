from django.contrib import admin
from .models import Opportunity, OpportunityPhoto

class OpportunityPhotoInline(admin.TabularInline):
    model = OpportunityPhoto
    extra = 1
    fields = ["image"]

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "status", "area", "created_at")
    list_filter = ("status", "area", "modality")
    search_fields = ("title", "organization__user__email")
    inlines = [OpportunityPhotoInline]

