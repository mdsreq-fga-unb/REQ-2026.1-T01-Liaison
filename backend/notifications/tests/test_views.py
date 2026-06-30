import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from notifications.models import Notification
from opportunities.models import Opportunity
from users.models import OrganizationProfile, StudentProfile

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def org_user(db):
    user = User.objects.create_user(
        email="org@views.test",
        username="org_notif_views",
        password="pass1234",
        role="organizacao",
        nome="ONG Views",
    )
    user.is_active = True
    user.save()
    OrganizationProfile.objects.create(
        user=user,
        cnpj="98.765.432/0001-10",
        razao_social="ONG Views Ltda",
        telefone="11888888888",
        nome_responsavel="Resp Views",
        status="approved",
    )
    return user


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="student@views.test",
        username="stu_notif_views",
        password="pass1234",
        role="estudante",
        nome="Maria Silva",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="USP",
        curso="Direito",
        matricula="20240002",
    )
    return user


@pytest.fixture
def other_user(db):
    user = User.objects.create_user(
        email="other@views.test",
        username="other_notif_views",
        password="pass1234",
        role="estudante",
        nome="Outro Usuário",
    )
    StudentProfile.objects.create(
        user=user,
        universidade="PUC",
        curso="ADM",
        matricula="20240003",
    )
    return user


@pytest.fixture
def opportunity(db, org_user):
    return Opportunity.objects.create(
        organization=org_user.organization_profile,
        title="Plantio de Árvores",
        status="active",
        workload_value=2,
        workload_unit="h/semana",
        vacancies=5,
        modality="presencial",
    )


@pytest.fixture
def student_notification(db, student_user, opportunity):
    return Notification.objects.create(
        recipient=student_user,
        type=Notification.Type.APPLICATION_APPROVED,
        title="Candidatura aprovada",
        message="Sua candidatura foi aprovada!",
        related_opportunity=opportunity,
        is_read=False,
    )


@pytest.mark.django_db
class TestNotificationViews:
    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get("/api/v1/notifications/")
        assert response.status_code == 401

    def test_list_returns_only_own_notifications(
        self, api_client, student_user, other_user
    ):
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_APPROVED,
            title="Para mim",
            message="Msg 1",
        )
        Notification.objects.create(
            recipient=other_user,
            type=Notification.Type.APPLICATION_REJECTED,
            title="Para outro",
            message="Msg 2",
        )

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/notifications/")

        assert response.status_code == 200
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Para mim"

    def test_list_returns_correct_unread_count(self, api_client, student_user):
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_APPROVED,
            title="T1",
            message="M1",
            is_read=False,
        )
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_REJECTED,
            title="T2",
            message="M2",
            is_read=True,
        )
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.NEW_APPLICATION,
            title="T3",
            message="M3",
            is_read=False,
        )

        api_client.force_authenticate(user=student_user)
        response = api_client.get("/api/v1/notifications/")

        assert response.status_code == 200
        assert response.data["unread_count"] == 2

    def test_read_marks_single_notification_as_read(
        self, api_client, student_user, student_notification
    ):
        assert student_notification.is_read is False

        api_client.force_authenticate(user=student_user)
        response = api_client.patch(
            f"/api/v1/notifications/{student_notification.id}/read/"
        )

        assert response.status_code == 200
        assert response.data["is_read"] is True
        student_notification.refresh_from_db()
        assert student_notification.is_read is True

    def test_read_all_marks_all_as_read(self, api_client, student_user):
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_APPROVED,
            title="T1",
            message="M1",
            is_read=False,
        )
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_REJECTED,
            title="T2",
            message="M2",
            is_read=False,
        )

        api_client.force_authenticate(user=student_user)
        response = api_client.patch("/api/v1/notifications/read-all/")

        assert response.status_code == 200
        assert response.data["updated"] == 2
        assert Notification.objects.filter(
            recipient=student_user, is_read=False
        ).count() == 0

    def test_read_on_other_users_notification_returns_404(
        self, api_client, other_user, student_notification
    ):
        api_client.force_authenticate(user=other_user)
        response = api_client.patch(
            f"/api/v1/notifications/{student_notification.id}/read/"
        )
        assert response.status_code == 404
