from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import OrganizationProfile, StudentGalleryPhoto, StudentProfile, User


class GalleryPhotoInline(admin.TabularInline):
    model = StudentGalleryPhoto
    extra = 0
    readonly_fields = ["created_at"]
    fields = ["image", "created_at"]


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "universidade", "curso", "matricula", "created_at")
    search_fields = ("user__email", "user__nome", "universidade", "curso", "matricula")
    list_filter = ("turno",)
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (None, {"fields": ("user", "bio")}),
        ("Imagens", {"fields": ("avatar", "banner")}),
        ("Dados Academicos", {
            "fields": (
                "universidade", "curso", "matricula",
                "semestre_atual", "turno", "ano_conclusao",
                "horas_extensao_exigidas", "interesses",
            ),
        }),
        ("Metadados", {"fields": ("created_at", "updated_at")}),
    )
    inlines = [GalleryPhotoInline]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    pass
