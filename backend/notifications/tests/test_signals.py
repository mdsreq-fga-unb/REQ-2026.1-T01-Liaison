import pytest
from django.contrib.auth import get_user_model

from applications.models import Application
from notifications.models import Notification
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile

User = get_user_model()


@pytest.fixture
def org_user(db):
    user = User.objects.create_user(
        email="org@signals.test",
        username="org_signals",
        password="pass1234",
        role="organizacao",
        nome="ONG Sinais",
    )
    user.is_active = True
    user.save()
    OrganizationProfile.objects.create(
        user=user,
        cnpj="12.345.678/0001-95",
        razao_social="ONG Sinais Ltda",
        telefone="11999999999",
        nome_responsavel="Responsável",
        status="approved",
    )
    return user


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="student@signals.test",
        username="stu_signals",
        password="pass1234",
        role="estudante",
        nome="João Silva",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="UnB",
        curso="Engenharia de Software",
        matricula="20240001",
    )
    return user


@pytest.fixture
def opportunity(db, org_user):
    return Opportunity.objects.create(
        organization=org_user.organization_profile,
        title="Tutoria de Matemática",
        status="active",
        workload_value=4,
        workload_unit="h/semana",
        vacancies=10,
        modality="presencial",
    )


@pytest.mark.django_db
class TestApplicationSignals:
    def test_new_application_notifies_org(self, org_user, student_user, opportunity):
        Application.objects.create(
            student=student_user.student_profile,
            opportunity=opportunity,
        )

        notif = Notification.objects.get(
            recipient=org_user,
            type=Notification.Type.NEW_APPLICATION,
        )
        assert "João Silva" in notif.message
        assert opportunity.title in notif.message
        assert notif.related_opportunity == opportunity
        assert notif.is_read is False

    def test_approved_status_notifies_student(self, student_user, opportunity):
        app = Application.objects.create(
            student=student_user.student_profile,
            opportunity=opportunity,
        )
        Notification.objects.all().delete()

        app.status = Application.Status.APPROVED
        app.save()

        notif = Notification.objects.get(
            recipient=student_user,
            type=Notification.Type.APPLICATION_APPROVED,
        )
        assert opportunity.title in notif.message
        assert notif.related_application == app

    def test_rejected_status_notifies_student(self, student_user, opportunity):
        app = Application.objects.create(
            student=student_user.student_profile,
            opportunity=opportunity,
        )
        Notification.objects.all().delete()

        app.status = Application.Status.REJECTED
        app.save()

        notif = Notification.objects.get(
            recipient=student_user,
            type=Notification.Type.APPLICATION_REJECTED,
        )
        assert opportunity.title in notif.message
        assert notif.related_application == app

    def test_no_notification_when_status_unchanged(self, student_user, opportunity):
        app = Application.objects.create(
            student=student_user.student_profile,
            opportunity=opportunity,
        )
        Notification.objects.all().delete()

        # Save without changing status — should not trigger any notification
        app.save()

        assert Notification.objects.count() == 0
