"""Gera um PDF de certificado de amostra p/ inspecionar o layout.

Cria objetos descartáveis numa transação revertida (não suja o DB) e escreve
o PDF no caminho dado. Reaproveita uma org aprovada + um estudante existentes
se houver; senão cria temporários.

    python manage.py sample_certificate
    python manage.py sample_certificate --output /app/sample.pdf --hours 40
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from applications.models import Application
from certificates.models import Certificate
from certificates.pdf import build_certificate_pdf, validation_url
from certificates.services import issue_certificate
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile, User


class Command(BaseCommand):
    help = "Gera um PDF de certificado de amostra (rollback — não persiste no DB)."

    def add_arguments(self, parser):
        parser.add_argument("--output", default="/app/sample_cert.pdf")
        parser.add_argument("--hours", type=int, default=20)
        parser.add_argument("--title", default="Apoio em Eventos Comunitários")
        parser.add_argument(
            "--persist",
            action="store_true",
            help=(
                "Salva o certificado no banco (via issue_certificate) p/ testar "
                "a validação. Sem a flag, só gera o PDF e dá rollback."
            ),
        )

    def handle(self, *args, **opts):
        persist = opts["persist"]
        try:
            with transaction.atomic():
                org, student = self._actors()
                opp = Opportunity.objects.create(
                    organization=org, title=opts["title"], area="educacao",
                    description="amostra", workload_value=4, workload_unit="h",
                    vacancies=1, modality="presencial", location="Brasília",
                    start_date="2026-05-24", start_time="09:00", status="active",
                )
                app = Application.objects.create(
                    student=student, opportunity=opp, status="approved"
                )
                if persist:
                    # Caminho real: grava Certificate no DB + PDF no storage.
                    cert = issue_certificate(app, opts["hours"])
                    pdf_bytes = cert.pdf_file.read()
                else:
                    cert = Certificate.objects.create(
                        application=app, hours=opts["hours"]
                    )
                    pdf_bytes = build_certificate_pdf(cert).read()
                with open(opts["output"], "wb") as fh:
                    fh.write(pdf_bytes)
                if not persist:
                    transaction.set_rollback(True)  # descarta tudo
        except OSError as exc:
            raise CommandError(f"Falha ao escrever {opts['output']}: {exc}")

        self.stdout.write(
            self.style.SUCCESS(
                f"PDF gerado em {opts['output']} "
                f"({student.user.nome} · {org.razao_social} · {opts['hours']}h)"
            )
        )
        if persist:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Certificado SALVO no banco · id={cert.id}\n"
                    f"  validation_uuid: {cert.validation_uuid}\n"
                    f"  validar em:      {validation_url(cert)}"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "Modo amostra (rollback): NÃO foi salvo no banco — a "
                    "validação vai falhar. Use --persist p/ testar a validação."
                )
            )

    def _actors(self):
        """Org aprovada + estudante existentes, ou cria descartáveis."""
        org = (
            OrganizationProfile.objects.filter(status="approved").first()
            or OrganizationProfile.objects.first()
        )
        if org is None:
            user = User.objects.create_user(
                email="_sample_org@example.com", username="_sample_org",
                password="x", role="organizacao", nome="ONG de Amostra",
            )
            org = OrganizationProfile.objects.create(
                user=user, cnpj="11222333000181", razao_social="ONG de Amostra Ltda",
                telefone="61999999999", nome_responsavel="Resp", status="approved",
            )
        student = StudentProfile.objects.first()
        if student is None:
            user = User.objects.create_user(
                email="_sample_student@example.com", username="_sample_student",
                password="x", role="estudante", nome="Estudante de Amostra",
            )
            student = StudentProfile.objects.create(
                user=user, universidade="UnB", curso="ESW", matricula="000000000",
            )
        return org, student
