import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from ..models import OrganizationProfile, AdminActionLog

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin_mod",
        email="admin.mod@example.com",
        password="adminpass123",
        role=User.Role.ADMIN,
        nome="Admin Mod",
    )


@pytest.mark.django_db
class TestAdminModeration:
    def test_list_pending(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        # cria organizacao pendente
        org_user = User.objects.create_user(
            username="org1",
            email="org1@example.com",
            password="orgpass",
            role=User.Role.ORGANIZACAO,
            nome="Org 1",
            is_active=False,
        )
        OrganizationProfile.objects.create(
            user=org_user,
            cnpj="12345678000199",
            razao_social="Org 1 Ltda",
            nome_fantasia="Org1",
            telefone="1234",
            nome_responsavel="Resp",
            status="pending",
        )

        response = api_client.get("/api/v1/admin/organizations/?status=pending")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert any(item["cnpj"] == "12345678000199" for item in data["results"])

    def test_approve_and_log(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        org_user = User.objects.create_user(
            username="org2",
            email="org2@example.com",
            password="orgpass",
            role=User.Role.ORGANIZACAO,
            nome="Org 2",
            is_active=False,
        )
        org = OrganizationProfile.objects.create(
            user=org_user,
            cnpj="22345678000188",
            razao_social="Org 2 Ltda",
            nome_fantasia="Org2",
            telefone="1234",
            nome_responsavel="Resp2",
            status="pending",
        )

        response = api_client.post(f"/api/v1/admin/organizations/{org.id}/approve/")
        assert response.status_code == 200
        org.refresh_from_db()
        assert org.status == "approved"
        assert org.user.is_active is True
        assert AdminActionLog.objects.filter(organization=org, action=AdminActionLog.Action.APPROVE).exists()

    def test_reject_requires_reason(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        org_user = User.objects.create_user(
            username="org3",
            email="org3@example.com",
            password="orgpass",
            role=User.Role.ORGANIZACAO,
            nome="Org 3",
            is_active=False,
        )
        org = OrganizationProfile.objects.create(
            user=org_user,
            cnpj="32345678000177",
            razao_social="Org 3 Ltda",
            nome_fantasia="Org3",
            telefone="1234",
            nome_responsavel="Resp3",
            status="pending",
        )

        response = api_client.post(f"/api/v1/admin/organizations/{org.id}/reject/", data={}, format="json")
        assert response.status_code == 400

        # agora com motivo
        response = api_client.post(f"/api/v1/admin/organizations/{org.id}/reject/", data={"reason": "Docs invalidos"}, format="json")
        assert response.status_code == 200
        org.refresh_from_db()
        assert org.status == "rejected"
        assert AdminActionLog.objects.filter(organization=org, action=AdminActionLog.Action.REJECT).exists()

    def test_request_info_requires_message(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        org_user = User.objects.create_user(
            username="org4",
            email="org4@example.com",
            password="orgpass",
            role=User.Role.ORGANIZACAO,
            nome="Org 4",
            is_active=False,
        )
        org = OrganizationProfile.objects.create(
            user=org_user,
            cnpj="42345678000166",
            razao_social="Org 4 Ltda",
            nome_fantasia="Org4",
            telefone="1234",
            nome_responsavel="Resp4",
            status="pending",
        )

        response = api_client.post(f"/api/v1/admin/organizations/{org.id}/request-info/", data={}, format="json")
        assert response.status_code == 400

        response = api_client.post(f"/api/v1/admin/organizations/{org.id}/request-info/", data={"message": "Por favor envie estatuto."}, format="json")
        assert response.status_code == 200
        assert AdminActionLog.objects.filter(organization=org, action=AdminActionLog.Action.REQUEST_INFO).exists()
