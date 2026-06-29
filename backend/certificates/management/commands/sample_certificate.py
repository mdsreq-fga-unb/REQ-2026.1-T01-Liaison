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
from certificates.pdf import build_certificate_pdf
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile, User


class Command(BaseCommand):
    help = "Gera um PDF de certificado de amostra (rollback — não persiste no DB)."

    def add_arguments(self, parser):
        parser.add_argument("--output", default="/app/sample_cert.pdf")
        parser.add_argument("--hours", type=int, default=20)
        parser.add_argument(
            "--title", default="Apoio em Eventos Comunitários"
        )

    def handle(self, *args, **opts):
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
                cert = Certificate.objects.create(application=app, hours=opts["hours"])
                pdf = build_certificate_pdf(cert)
                with open(opts["output"], "wb") as fh:
                    fh.write(pdf.read())
                transaction.set_rollback(True)  # descarta os objetos de amostra
        except OSError as exc:
            raise CommandError(f"Falha ao escrever {opts['output']}: {exc}")

        self.stdout.write(
            self.style.SUCCESS(
                f"PDF gerado em {opts['output']} "
                f"({student.user.nome} · {org.razao_social} · {opts['hours']}h)"
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
