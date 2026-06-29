"""Geração do PDF do certificado (reportlab + QR Code).

`certificate_fields()` é isolado e testável (dict de strings) — os testes
verificam o conteúdo aqui, sem fazer parse do binário do PDF.
"""

from io import BytesIO

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

# Cores do tema Liaison (context/DESIGN.md).
NAVY = HexColor("#1a2744")
GOLD = HexColor("#d4813a")
CREAM = HexColor("#faf8f4")
BORDER = HexColor("#ddd8ce")


def validation_url(cert) -> str:
    base = settings.CERT_VALIDATION_BASE_URL.rstrip("/")
    return f"{base}/{cert.validation_uuid}"


def certificate_fields(cert) -> dict:
    """Dados textuais do certificado. Snapshot via cert.application.*."""
    application = cert.application
    student = application.student
    opportunity = application.opportunity
    org = opportunity.organization
    return {
        "student_name": student.user.nome,
        "activity_title": opportunity.title,
        "hours": f"{cert.hours} horas",
        "organization_name": org.razao_social,
        "organization_cnpj": org.cnpj,
        "issued_at": cert.issued_at.strftime("%d/%m/%Y"),
        "validation_uuid": str(cert.validation_uuid),
        "validation_url": validation_url(cert),
    }


def _qr_reader(data: str) -> ImageReader:
    qr = qrcode.QRCode(box_size=4, border=1)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def build_certificate_pdf(cert) -> ContentFile:
    """Desenha o certificado e retorna um ContentFile pronto p/ pdf_file."""
    f = certificate_fields(cert)
    buffer = BytesIO()
    width, height = A4
    c = canvas.Canvas(buffer, pagesize=A4)

    # Fundo + moldura.
    c.setFillColor(CREAM)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.rect(15 * mm, 15 * mm, width - 30 * mm, height - 30 * mm, fill=0, stroke=1)

    center = width / 2
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(center, height - 55 * mm, "CERTIFICADO")
    c.setFont("Helvetica", 13)
    c.drawCentredString(center, height - 70 * mm, "Certificamos que")

    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(center, height - 88 * mm, f["student_name"])

    c.setFont("Helvetica", 13)
    c.drawCentredString(
        center, height - 105 * mm, "participou da atividade de voluntariado"
    )
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(GOLD)
    c.drawCentredString(center, height - 118 * mm, f["activity_title"])

    c.setFillColor(NAVY)
    c.setFont("Helvetica", 13)
    c.drawCentredString(
        center,
        height - 133 * mm,
        f"com carga horária atestada de {f['hours']}.",
    )

    c.setFont("Helvetica", 12)
    c.drawCentredString(center, height - 150 * mm, f["organization_name"])
    c.drawCentredString(center, height - 158 * mm, f"CNPJ {f['organization_cnpj']}")
    c.drawCentredString(center, height - 168 * mm, f"Emitido em {f['issued_at']}")

    # QR Code + código de validação (rodapé).
    qr_size = 30 * mm
    qr_reader = _qr_reader(f["validation_url"])
    c.drawImage(
        qr_reader,
        center - qr_size / 2,
        28 * mm,
        width=qr_size,
        height=qr_size,
    )
    c.setFont("Helvetica", 8)
    c.setFillColor(NAVY)
    c.drawCentredString(center, 23 * mm, f"Código de validação: {f['validation_uuid']}")

    c.showPage()
    c.save()
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"certificate_{cert.validation_uuid}.pdf")
