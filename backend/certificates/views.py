from django.core.exceptions import ValidationError
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from applications.models import Application

from .models import Certificate
from .pdf import certificate_fields
from .serializers import CertificateIssueSerializer, CertificateListSerializer
from .services import find_by_code, issue_certificate


class CertificateViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CertificateListSerializer

    def get_queryset(self):
        # Só os certificados do próprio estudante.
        return Certificate.objects.filter(
            application__student__user=self.request.user
        ).select_related(
            "application__opportunity__organization",
            "application__student__user",
        )

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def download(self, request, pk=None, *args, **kwargs):
        # Ownership na query → 404 se não for dono, sem vazar existência.
        cert = get_object_or_404(self.get_queryset(), pk=pk)
        if not cert.pdf_file:
            return Response(
                {"detail": "PDF não disponível."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return FileResponse(
            cert.pdf_file.open("rb"),
            content_type="application/pdf",
            as_attachment=True,
            filename=f"certificado_{cert.validation_uuid}.pdf",
        )

    def issue(self, request, *args, **kwargs):
        """POST /certificates/issue/ — temporário até #27 (registro de frequência).

        Org dona da vaga emite/testa o certificado de uma application aprovada.
        """
        org = getattr(request.user, "organization_profile", None)
        if org is None:
            return Response(
                {"detail": "Apenas organizações podem emitir certificados."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CertificateIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Application precisa ser de uma vaga da própria org (senão 404).
        application = get_object_or_404(
            Application,
            id=serializer.validated_data["application"],
            opportunity__organization=org,
        )

        try:
            cert = issue_certificate(application, serializer.validated_data["hours"])
        except ValidationError as exc:
            return Response(
                {"detail": exc.messages[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": cert.id,
                "validation_uuid": cert.validation_uuid,
                "issued_at": cert.issued_at,
            },
            status=status.HTTP_201_CREATED,
        )


# ─── Validação pública (HTML, fora de /api/v1/, sem auth) ──────


def _render_result(request, cert):
    """Página de resultado: campos do PDF + status válido/revogado."""
    fields = certificate_fields(cert)
    return TemplateResponse(
        request,
        "certificates/validate.html",
        {
            "fields": fields,
            "is_revoked": cert.revoked_at is not None,
            "revoked_at": cert.revoked_at,
        },
    )


def validate_certificate(request, validation_uuid):
    """GET /validar/<uuid>/ — página pública de validação (QR aponta aqui)."""
    cert = Certificate.objects.filter(validation_uuid=validation_uuid).first()
    if cert is None:
        # Página genérica 404 — não vaza nada sobre o uuid consultado.
        return TemplateResponse(
            request, "certificates/validate.html", {"not_found": True}, status=404
        )
    return _render_result(request, cert)


def validate_form(request):
    """GET /validar/?codigo= — form de código curto + resultado.

    Sem código → form vazio. Código achado → mesma página de resultado.
    Código não achado → form com erro (200, é fluxo de form, não 404).
    """
    code = request.GET.get("codigo")
    if not code:
        return TemplateResponse(
            request, "certificates/validate.html", {"show_form": True}
        )
    cert = find_by_code(code)
    if cert is None:
        return TemplateResponse(
            request,
            "certificates/validate.html",
            {"show_form": True, "error": "Código não encontrado", "code": code},
        )
    return _render_result(request, cert)
