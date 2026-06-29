"""Geração do PDF do certificado (reportlab + QR Code).

Layout 1:1 com o design do Figma (node 654:2 — "Certificado Digital | Liaison"):
A4 paisagem, dupla moldura dourada, header Liaison, título, nome do estudante,
parágrafo atestando a participação e rodapé com data, selo de horas e QR de
validação. Fontes Playfair Display + DM Sans embarcadas em `fonts/`.

`certificate_fields()` é isolado e testável (dict de strings) — os testes
verificam o conteúdo aqui, sem fazer parse do binário do PDF.
"""

import re
from io import BytesIO
from pathlib import Path

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile
from num2words import num2words
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# Cores do tema (context/DESIGN.md + tokens do node).
NAVY = HexColor("#1a2744")
GOLD = HexColor("#d4813a")  # acento (dots, underline, nome)
GOLD_FRAME = HexColor("#c9a04a")  # moldura + selo
CREAM = HexColor("#fbf9f4")
BORDER = HexColor("#ddd8ce")
GRAY = HexColor("#7a8299")

# Fontes embarcadas (registradas uma vez na importação do módulo).
_FONT_DIR = Path(__file__).resolve().parent / "fonts"
PLAYFAIR = "PlayfairDisplay-Bold"
DMSANS = "DMSans"
DMSANS_MED = "DMSans-Medium"
DMSANS_SB = "DMSans-SemiBold"

if PLAYFAIR not in pdfmetrics.getRegisteredFontNames():
    pdfmetrics.registerFont(TTFont(PLAYFAIR, _FONT_DIR / "PlayfairDisplay-Bold.ttf"))
    pdfmetrics.registerFont(TTFont(DMSANS, _FONT_DIR / "DMSans-Regular.ttf"))
    pdfmetrics.registerFont(TTFont(DMSANS_MED, _FONT_DIR / "DMSans-Medium.ttf"))
    pdfmetrics.registerFont(TTFont(DMSANS_SB, _FONT_DIR / "DMSans-SemiBold.ttf"))
    # Mapeia <b> do Paragraph para o SemiBold.
    pdfmetrics.registerFontFamily(DMSANS, normal=DMSANS, bold=DMSANS_SB)

_MESES = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
]


def validation_url(cert) -> str:
    base = settings.CERT_VALIDATION_BASE_URL.rstrip("/")
    return f"{base}/{cert.validation_uuid}"


def _format_cnpj(raw: str) -> str:
    d = re.sub(r"\D", "", raw or "")
    if len(d) != 14:
        return raw
    return f"{d[:2]}.{d[2:5]}.{d[5:8]}/{d[8:12]}-{d[12:]}"


def _validation_code(cert) -> str:
    """Código curto agrupado (4x4) derivado do validation_uuid — ex: A1B2-C3D4-..."""
    h = cert.validation_uuid.hex.upper()[:16]
    return "-".join(h[i : i + 4] for i in range(0, 16, 4))


def certificate_fields(cert) -> dict:
    """Dados textuais do certificado. Snapshot via cert.application.*."""
    application = cert.application
    opportunity = application.opportunity
    org = opportunity.organization
    issued = cert.issued_at
    extenso = num2words(cert.hours, lang="pt")
    return {
        "student_name": application.student.user.nome,
        "activity_title": opportunity.title,
        "organization_name": org.razao_social,
        "organization_cnpj": _format_cnpj(org.cnpj),
        "hours": cert.hours,
        "hours_extenso": f"{cert.hours} ({extenso}) horas",
        "issued_at": f"Brasília, {issued.day} de {_MESES[issued.month - 1]} de {issued.year}",
        "validation_uuid": str(cert.validation_uuid),
        "validation_code": _validation_code(cert),
        "validation_url": validation_url(cert),
    }


def _qr_reader(data: str) -> ImageReader:
    qr = qrcode.QRCode(box_size=10, border=0)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def _draw_paragraph(c, cx, first_baseline, leading, max_width, runs, size):
    """Quebra runs (texto, negrito) em linhas ≤ max_width e centra cada uma.

    Mede cada palavra com a fonte real (regular/semibold) — garante que a linha
    nunca exceda a caixa e fique de fato centrada em cx.
    """
    space_w = pdfmetrics.stringWidth(" ", DMSANS, size)
    # Palavras com flag de negrito (segmentos batem em espaços → split limpo).
    words = []
    for text, bold in runs:
        for w in text.split(" "):
            if w:
                font = DMSANS_SB if bold else DMSANS
                words.append((w, font, pdfmetrics.stringWidth(w, font, size)))

    lines, cur, cur_w = [], [], 0.0
    for w, font, ww in words:
        add = ww if not cur else space_w + ww
        if cur and cur_w + add > max_width:
            lines.append(cur)
            cur, cur_w = [(w, font, ww)], ww
        else:
            cur.append((w, font, ww))
            cur_w += add
    if cur:
        lines.append(cur)

    y = first_baseline
    c.setFillColor(NAVY)
    for line in lines:
        total = sum(ww for _, _, ww in line) + space_w * (len(line) - 1)
        x = cx - total / 2
        for w, font, ww in line:
            c.setFont(font, size)
            c.drawString(x, y, w)
            x += ww + space_w
        y -= leading


def _centered_text(c, x, y, text, font, size, color, tracking=0):
    # Largura real (stringWidth ignora o char-spacing → soma manual).
    w = pdfmetrics.stringWidth(text, font, size)
    if tracking and len(text) > 1:
        w += tracking * (len(text) - 1)
    to = c.beginText(x - w / 2, y)
    to.setFont(font, size)
    to.setFillColor(color)
    # Tc (char spacing) persiste no graphics state após ET — sempre declarar
    # (0 quando sem tracking) p/ não vazar para drawString do parágrafo.
    to.setCharSpace(tracking)
    to.textOut(text)
    c.drawText(to)


def build_certificate_pdf(cert) -> ContentFile:
    """Desenha o certificado (Figma node 654:2) e retorna ContentFile."""
    f = certificate_fields(cert)
    buffer = BytesIO()
    W, H = landscape(A4)  # 841.89 x 595.28 pt
    S = 0.75  # escala Figma px -> pt (1123px ≈ 842pt)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    def fy(px):  # px top-down -> pt bottom-up
        return H - px * S

    cx = W / 2  # centro horizontal (= centro da coluna do Figma)

    # ── Fundo + dupla moldura ──────────────────────────────────
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(GOLD_FRAME)
    c.setLineWidth(1.5)
    c.roundRect(28 * S, fy(766), 1067 * S, 738 * S, 1.5, fill=0, stroke=1)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.75)
    c.rect(36 * S, fy(758), 1051 * S, 722 * S, fill=0, stroke=1)

    # Dots dourados nos 4 cantos (centro dos quadrados 10px em 31/1082/753).
    c.setFillColor(GOLD)
    for dx, dy in [(36, 36), (1087, 36), (36, 758), (1087, 758)]:
        c.circle(dx * S, fy(dy), 5 * S * 0.75, fill=1, stroke=0)

    # ── Header ─────────────────────────────────────────────────
    title_w = pdfmetrics.stringWidth("Liaison", PLAYFAIR, 22.5)
    c.setFont(PLAYFAIR, 22.5)
    c.setFillColor(NAVY)
    c.drawString(cx - (title_w + 8 * S) / 2, fy(108), "Liaison")
    c.setFillColor(GOLD)
    c.circle(cx + (title_w - 8 * S) / 2 + 8 * S, fy(104), 4 * S, fill=1, stroke=0)
    _centered_text(
        c,
        cx,
        fy(130),
        "PLATAFORMA DE EXTENSÃO UNIVERSITÁRIA",
        DMSANS_SB,
        8.25,
        GRAY,
        tracking=3 * S,
    )

    # ── Seção central (centralizada entre header e rodapé) ─────
    _centered_text(
        c,
        cx,
        fy(274),
        "CERTIFICADO DE PARTICIPAÇÃO",
        PLAYFAIR,
        25.5,
        NAVY,
        tracking=2 * S,
    )
    c.setFillColor(GOLD)
    c.roundRect(cx - 45 * S, fy(300), 90 * S, 3 * S, 1.5, fill=1, stroke=0)
    _centered_text(
        c,
        cx,
        fy(334),
        "Certificamos para os devidos fins que",
        DMSANS,
        11.6,
        GRAY,
    )
    _centered_text(c, cx, fy(384), f["student_name"], PLAYFAIR, 33, GOLD)

    # Parágrafo com pesos mistos — quebra + centralização manuais. O Paragraph
    # do reportlab mede runs em negrito mais estreitos do que renderiza e
    # transborda a caixa, descentralizando; aqui medimos cada palavra com a
    # fonte real e centramos linha a linha.
    runs = [
        ("participou da atividade de voluntariado ", False),
        (f'"{f["activity_title"]}",', True),
        (" promovida por ", False),
        (f"{f['organization_name']}", True),
        (f" (CNPJ {f['organization_cnpj']}), cumprindo a carga horária de ", False),
        (f"{f['hours_extenso']},", True),
        (" conforme registro de frequência validado na plataforma.", False),
    ]
    _draw_paragraph(c, cx, fy(418), leading=18, max_width=640, runs=runs, size=11)

    # ── Rodapé: 3 colunas ──────────────────────────────────────
    left_cx = 205 * S
    right_cx = 927 * S

    # Esquerda: data de emissão.
    _centered_text(c, left_cx, fy(636), f["issued_at"], DMSANS_MED, 9.75, NAVY)
    c.setFillColor(NAVY)
    c.rect(left_cx - 95 * S, fy(650), 190 * S, 1.5 * S, fill=1, stroke=0)
    _centered_text(
        c, left_cx, fy(664), "Data de emissão", DMSANS, 8.25, GRAY, tracking=1 * S
    )

    # Centro: selo de horas (círculo navy + borda dourada).
    badge_r = 46 * S
    badge_cy = fy(660)
    c.setFillColor(NAVY)
    c.setStrokeColor(GOLD_FRAME)
    c.setLineWidth(2.25)
    c.circle(cx, badge_cy, badge_r, fill=1, stroke=1)
    _centered_text(c, cx, badge_cy - 1, f"{f['hours']}h", PLAYFAIR, 16.5, white)
    _centered_text(
        c,
        cx,
        badge_cy - 16 * S,
        "CERTIFICADAS",
        DMSANS_SB,
        5.25,
        GOLD_FRAME,
        tracking=1.2 * S,
    )

    # Direita: QR + código de validação.
    qr_px = 80
    qr_size = qr_px * S
    qr_x = right_cx - qr_size / 2
    qr_top = 600
    c.setFillColor(white)
    c.rect(qr_x, fy(qr_top + qr_px), qr_size, qr_size, fill=1, stroke=0)
    c.drawImage(
        _qr_reader(f["validation_url"]),
        qr_x + 1,
        fy(qr_top + qr_px) + 1,
        qr_size - 2,
        qr_size - 2,
    )
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.75)
    c.rect(qr_x, fy(qr_top + qr_px), qr_size, qr_size, fill=0, stroke=1)
    _centered_text(
        c, right_cx, fy(700), "Código de validação", DMSANS, 8.25, GRAY, tracking=1 * S
    )
    # Sem tracking: charSpace faz extratores de PDF inserirem espaços entre as
    # letras ao copiar o código. Mantém selecionável/copiável limpo.
    _centered_text(c, right_cx, fy(716), f["validation_code"], DMSANS_SB, 9, NAVY)

    c.showPage()
    c.save()
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"certificate_{cert.validation_uuid}.pdf")
