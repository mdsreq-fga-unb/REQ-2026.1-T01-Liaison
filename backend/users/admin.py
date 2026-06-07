from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import OrganizationProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuracao do admin para o modelo User."""

    list_display = (
        "email",
        "username",
        "role",
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Liaison",
            {"fields": ("role", "nome")},
        ),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Liaison",
            {"fields": ("email", "role", "nome")},
        ),
    )

@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "cnpj", "razao_social", "status")
    search_fields = ("user__email", "cnpj", "razao_social")
    list_filter = ("status",)

