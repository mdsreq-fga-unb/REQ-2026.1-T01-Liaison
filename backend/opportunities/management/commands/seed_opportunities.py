"""Popula o banco com dados de demonstração (org + estudante + vagas com fotos).

Uso:
    python manage.py seed_opportunities          # cria/atualiza dados demo
    python manage.py seed_opportunities --reset  # apaga vagas demo antes de recriar

Idempotente: reusa org/estudante por email. Fotos via picsum.photos (fallback PIL).
"""

import io
import datetime
import urllib.request

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from users.models import OrganizationProfile, StudentProfile
from opportunities.models import Opportunity, OpportunityPhoto
from applications.models import Application

User = get_user_model()

DEMO_ORG_EMAIL = "ong.demo@liaison.dev"
DEMO_STUDENT_EMAIL = "aluno.demo@liaison.dev"
DEMO_PASSWORD = "Demo1234"

# (title, area, status, featured, vacancies, applicants, workload, modality,
#  location, requirements, preferred_courses, accepts_any, schedule, photo_seeds, description)
OPPORTUNITIES = [
    (
        "Tutoria em Matemática Básica para Estudantes do Ensino Médio",
        "educacao", "active", True, 10, 6, 4, "presencial",
        "SGAS 906, Asa Sul, Brasília — DF",
        ["Estar matriculado em curso universitário em qualquer semestre",
         "Disponibilidade de 4 horas por semana (seg e qua, 14h–15h)",
         "Conhecimento em Matemática do Ensino Médio",
         "Comprometimento com o período mínimo de 60 dias"],
        ["Matemática", "Ciência da Computação", "Pedagogia", "Letras"],
        True,
        ["Segunda e Quarta · 14:00 — 15:00"],
        ["edu1", "edu2", "edu3"],
        "O Instituto Aprender Mais busca estudantes universitários apaixonados por "
        "Matemática para atuar como tutores voluntários em comunidades de baixa renda "
        "da Asa Sul.\nAs sessões acontecem às segundas e quartas-feiras, com grupos de "
        "até 5 alunos por tutor. O material didático é fornecido pela organização.\n"
        "Ao completar o período mínimo de 60 dias, o estudante receberá um certificado "
        "digital rastreável de horas de extensão universitária.",
    ),
    (
        "Mutirão de Limpeza e Reflorestamento do Parque da Cidade",
        "meio_ambiente", "active", True, 30, 12, 6, "presencial",
        "Parque da Cidade Sarah Kubitschek, Brasília — DF",
        ["Disposição para atividade física ao ar livre",
         "Levar protetor solar e garrafa de água",
         "Idade mínima de 16 anos"],
        [], True,
        ["Sábado · 08:00 — 14:00"],
        ["env1", "env2"],
        "Participe do maior mutirão ambiental do semestre! Vamos recolher resíduos, "
        "plantar mudas nativas do Cerrado e conscientizar visitantes.\nTodo material "
        "(luvas, sacos, mudas) é fornecido. Ideal para quem busca horas de extensão "
        "em projetos de sustentabilidade.",
    ),
    (
        "Apoio Recreativo no Hospital Infantil de Brasília",
        "saude", "active", False, 8, 3, 5, "presencial",
        "Hospital da Criança de Brasília, Asa Norte — DF",
        ["Curso de treinamento obrigatório (8h) fornecido pela organização",
         "Disponibilidade de 5 horas por semana",
         "Carteira de vacinação atualizada"],
        ["Medicina", "Enfermagem", "Psicologia", "Terapia Ocupacional"],
        True,
        ["Terça e Quinta · 15:00 — 17:30"],
        ["health1", "health2"],
        "Leve alegria a crianças em tratamento por meio de contação de histórias, jogos "
        "e atividades artísticas.\nO programa inclui treinamento inicial obrigatório e "
        "acompanhamento por equipe multiprofissional do hospital.",
    ),
    (
        "Oficina de Lógica de Programação para Jovens da Periferia",
        "tecnologia", "active", False, 15, 9, 3, "hibrido",
        "Ceilândia — DF (encontros presenciais + remoto)",
        ["Conhecimento básico em programação (qualquer linguagem)",
         "Notebook próprio para os encontros remotos",
         "Boa comunicação e didática"],
        ["Ciência da Computação", "Engenharia de Software", "Sistemas de Informação"],
        False,
        ["Sexta · 19:00 — 22:00"],
        ["tech1", "tech2", "tech3"],
        "Ensine os fundamentos da programação a jovens de 14 a 18 anos usando Scratch e "
        "Python.\nOs encontros são híbridos: teoria remota às sextas e mentoria "
        "presencial quinzenal. Material e plataforma fornecidos pela ONG Code Futuro.",
    ),
    (
        "Distribuição de Cestas Básicas e Apoio Logístico",
        "assistencia_social", "paused", False, 20, 18, 8, "presencial",
        "Estrutural — DF",
        ["Disponibilidade aos finais de semana",
         "Disposição para carregar caixas (até 10kg)"],
        [], True,
        ["Sábado · 09:00 — 17:00"],
        ["social1"],
        "Ajude na triagem, montagem e entrega de cestas básicas para famílias em "
        "situação de vulnerabilidade.\nAtividade temporariamente pausada para "
        "reorganização do estoque — volte em breve!",
    ),
    (
        "Aulas de Violão e Canto Coral em Centro Comunitário",
        "arte_cultura", "active", False, 12, 4, 4, "presencial",
        "Centro Comunitário do Cruzeiro — DF",
        ["Saber tocar violão ou ter experiência com canto",
         "Paciência para ensinar iniciantes"],
        ["Música", "Artes Cênicas", "Licenciatura em Artes"],
        True,
        ["Quarta · 18:00 — 20:00"],
        ["art1", "art2"],
        "Compartilhe sua paixão pela música! Ministre aulas de violão e participe da "
        "formação de um coral comunitário com crianças e adultos.\nInstrumentos "
        "disponíveis no local. Excelente para licenciandos em Música e Artes.",
    ),
    (
        "Treinamento Esportivo Infantil — Escolinha de Futebol Social",
        "esporte", "closed", False, 6, 6, 6, "presencial",
        "Samambaia — DF",
        ["Experiência com prática esportiva",
         "Disponibilidade em dois turnos por semana"],
        ["Educação Física", "Fisioterapia"],
        False,
        ["Terça e Quinta · 16:00 — 18:00"],
        ["sport1"],
        "Atue como auxiliar técnico em uma escolinha de futebol para crianças de 8 a 12 "
        "anos de comunidades carentes.\nVaga encerrada nesta turma — acompanhe novas "
        "oportunidades em breve.",
    ),
]


def fetch_photo(seed: str) -> bytes:
    """Baixa foto real do picsum; se offline, gera placeholder PIL."""
    url = f"https://picsum.photos/seed/{seed}/800/600"
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            return resp.read()
    except Exception:
        from PIL import Image
        img = Image.new("RGB", (800, 600), (26, 39, 68))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()


class Command(BaseCommand):
    help = "Popula vagas de demonstração com fotos reais."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Apaga vagas da org demo antes de recriar.")

    @transaction.atomic
    def handle(self, *args, **options):
        org = self._ensure_org()
        self._ensure_student()
        pool = self._ensure_student_pool(20)  # candidatos fictícios p/ popular a barra de vagas

        if options["reset"]:
            deleted, _ = Opportunity.objects.filter(organization=org).delete()
            self.stdout.write(self.style.WARNING(f"Removidas vagas demo ({deleted} objetos)."))

        created = 0
        for row in OPPORTUNITIES:
            (title, area, status, featured, vacancies, applicants, workload, modality,
             location, requirements, preferred, accepts_any, schedule, seeds, desc) = row

            opp, was_created = Opportunity.objects.get_or_create(
                organization=org, title=title,
                defaults=dict(
                    area=area, description=desc, workload_value=workload,
                    workload_unit="h/semana", vacancies=vacancies, modality=modality,
                    location=location, start_date=datetime.date(2026, 7, 1),
                    start_time=datetime.time(14, 0), end_date=datetime.date(2026, 9, 30),
                    is_recurring=True, session_duration=datetime.timedelta(hours=1, minutes=30),
                    schedule=[
                        {"id": "1", "date": "2026-07-01", "description": f"Início — {schedule[0]}"},
                        {"id": "2", "date": "2026-08-15", "description": "Acompanhamento de meio de percurso"},
                        {"id": "3", "date": "2026-09-30", "description": "Encerramento e avaliação final"},
                    ],
                    requirements=requirements,
                    accepts_any_course=accepts_any, preferred_courses=preferred,
                    status=status, featured=featured,
                ),
            )
            if not was_created:
                self.stdout.write(f"• já existe: {title[:40]}…")
                continue

            for seed in seeds:
                OpportunityPhoto.objects.create(
                    opportunity=opp,
                    image=ContentFile(fetch_photo(seed), name=f"{seed}.jpg"),
                )

            # Candidaturas fictícias para popular applicants_count / barra de vagas.
            n = min(applicants, vacancies, len(pool))
            Application.objects.bulk_create(
                [Application(student=pool[i], opportunity=opp) for i in range(n)]
            )

            created += 1
            self.stdout.write(self.style.SUCCESS(f"✓ {title[:40]}… ({len(seeds)} fotos)"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"{created} vagas criadas."))
        self.stdout.write(self.style.HTTP_INFO("── Credenciais de teste ──"))
        self.stdout.write(f"  ONG:        {DEMO_ORG_EMAIL} / {DEMO_PASSWORD}")
        self.stdout.write(f"  Estudante:  {DEMO_STUDENT_EMAIL} / {DEMO_PASSWORD}")

    def _ensure_org(self) -> OrganizationProfile:
        user, _ = User.objects.get_or_create(
            email=DEMO_ORG_EMAIL,
            defaults=dict(username="ong_demo", role="organizacao", nome="Instituto Aprender Mais"),
        )
        user.set_password(DEMO_PASSWORD)
        user.save()
        org, _ = OrganizationProfile.objects.get_or_create(
            user=user,
            defaults=dict(
                cnpj="11222333000181", razao_social="Instituto Aprender Mais Ltda",
                nome_fantasia="Instituto Aprender Mais", telefone="61999990000",
                nome_responsavel="Maria Aparecida", status="approved",
                mission="Transformar vidas pela educação e pelo voluntariado universitário.",
                areas_de_atuacao=["educacao", "assistencia_social"],
            ),
        )
        if org.status != "approved":
            org.status = "approved"
            org.save()
        return org

    def _ensure_student(self):
        user, _ = User.objects.get_or_create(
            email=DEMO_STUDENT_EMAIL,
            defaults=dict(username="aluno_demo", role="estudante", nome="João da Silva"),
        )
        user.set_password(DEMO_PASSWORD)
        user.save()
        StudentProfile.objects.get_or_create(
            user=user,
            defaults=dict(
                universidade="Universidade de Brasília",
                curso="Engenharia de Software", matricula="202012345",
                horas_extensao_exigidas=120,
            ),
        )
        return user

    def _ensure_student_pool(self, count):
        """Cria N estudantes fictícios e retorna seus StudentProfiles."""
        profiles = []
        for i in range(count):
            user, _ = User.objects.get_or_create(
                email=f"candidato{i}@liaison.dev",
                defaults=dict(username=f"candidato{i}", role="estudante", nome=f"Candidato {i}"),
            )
            profile, _ = StudentProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    universidade="Universidade de Brasília", curso="Diversos",
                    matricula=f"2026{i:05d}", horas_extensao_exigidas=120,
                ),
            )
            profiles.append(profile)
        return profiles
