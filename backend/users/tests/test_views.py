"""
Testes das views: health check, autenticacao JWT e registro de estudante.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def _create(email="user@example.com", password="testpass123", role="estudante"):
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password=password,
            role=role,
        )

    return _create


def _student_payload(**overrides):
    """Retorna payload valido para registro de estudante."""
    data = {
        "email": "ana.souza@unb.br",
        "password": "Senha123",
        "nome": "Ana Souza",
        "universidade": "Universidade de Brasília",
        "curso": "Engenharia de Software",
        "matricula": "20231234567",
        "semestre_atual": 5,
        "turno": "matutino",
        "ano_conclusao": 2027,
        "horas_extensao_exigidas": 360,
        "interesses": ["saude", "educacao", "tecnologia"],
    }
    data.update(overrides)
    return data


@pytest.mark.django_db
class TestHealthCheck:
    """Testes do GET /api/v1/health/"""

    def test_health_check_returns_200(self, api_client):
        """Health check retorna HTTP 200."""
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200

    def test_health_check_returns_ok_status(self, api_client):
        """Health check retorna JSON {status: ok}."""
        response = api_client.get("/api/v1/health/")
        assert response.json() == {"status": "ok"}

    def test_health_check_no_auth_required(self, api_client):
        """Health check acessivel sem autenticacao."""
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200


@pytest.mark.django_db
class TestJWTAuthentication:
    """Testes do POST /api/v1/auth/token/ e /api/v1/auth/token/refresh/"""

    def test_obtain_token_returns_access_and_refresh(self, api_client, create_user):
        """Credenciais validas retornam access e refresh."""
        create_user(email="jwt@example.com", password="jwtpass123")
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "jwt@example.com", "password": "jwtpass123"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_obtain_token_wrong_password_returns_401(self, api_client, create_user):
        """Senha errada retorna HTTP 401."""
        create_user(email="wrong@example.com", password="correctpass")
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "wrong@example.com", "password": "wrongpass"},
            format="json",
        )
        assert response.status_code == 401

    def test_obtain_token_nonexistent_user_returns_401(self, api_client):
        """Usuario inexistente retorna HTTP 401."""
        response = api_client.post(
            "/api/v1/auth/token/",
            {"email": "nobody@example.com", "password": "anypass"},
            format="json",
        )
        assert response.status_code == 401

    def test_refresh_token_returns_new_access(self, api_client, create_user):
        """Refresh valido retorna novo access."""
        create_user(email="refresh@example.com", password="refreshpass")
        obtain_resp = api_client.post(
            "/api/v1/auth/token/",
            {"email": "refresh@example.com", "password": "refreshpass"},
            format="json",
        )
        refresh_token = obtain_resp.json()["refresh"]
        refresh_resp = api_client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )
        assert refresh_resp.status_code == 200
        assert "access" in refresh_resp.json()

    def test_refresh_token_invalid_returns_401(self, api_client):
        """Refresh invalido retorna HTTP 401."""
        response = api_client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": "totally-invalid-token"},
            format="json",
        )
        assert response.status_code == 401


@pytest.mark.django_db
class TestStudentRegisterEndpoint:
    """Testes do POST /api/v1/auth/register/student/"""

    ENDPOINT = "/api/v1/auth/register/student/"

    def test_valid_registration_returns_201(self, api_client):
        """Registro valido retorna HTTP 201."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201

    def test_response_includes_access_token(self, api_client):
        """Resposta de registro inclui token de acesso."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "tokens" in data
        assert "access" in data["tokens"]

    def test_response_includes_refresh_token(self, api_client):
        """Resposta de registro inclui refresh token."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "tokens" in data
        assert "refresh" in data["tokens"]

    def test_response_includes_user_email(self, api_client):
        """Resposta de registro inclui email do usuario."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "ana.souza@unb.br"

    def test_response_includes_user_nome(self, api_client):
        """Resposta de registro inclui nome do usuario."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Ana Souza"

    def test_response_includes_user_role(self, api_client):
        """Resposta de registro inclui role 'estudante'."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "estudante"

    def test_response_includes_student_profile(self, api_client):
        """Resposta de registro inclui dados do perfil de estudante."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "student_profile" in data
        profile = data["student_profile"]
        assert profile["universidade"] == "Universidade de Brasília"
        assert profile["curso"] == "Engenharia de Software"
        assert profile["matricula"] == "20231234567"

    def test_response_does_not_include_password(self, api_client):
        """Resposta de registro nao inclui campo password."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "password" not in data

    def test_response_includes_user_id(self, api_client):
        """Resposta de registro inclui id do usuario."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data

    def test_invalid_data_returns_400(self, api_client):
        """Dados invalidos retornam HTTP 400."""
        response = api_client.post(
            self.ENDPOINT,
            {"email": "invalid"},  # payload incompleto/invalido
            format="json",
        )
        assert response.status_code == 400

    def test_duplicate_email_returns_400(self, api_client):
        """Email duplicado retorna HTTP 400."""
        api_client.post(self.ENDPOINT, _student_payload(), format="json")
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(matricula="99999999999"),
            format="json",
        )
        assert response.status_code == 400

    def test_duplicate_email_error_field_is_email(self, api_client):
        """Erro de email duplicado aponta para campo 'email'."""
        api_client.post(self.ENDPOINT, _student_payload(), format="json")
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(matricula="99999999998"),
            format="json",
        )
        data = response.json()
        assert "email" in data

    def test_endpoint_is_publicly_accessible_no_auth(self, api_client):
        """Endpoint de registro nao exige autenticacao."""
        # Nenhum token no cabecalho — deve retornar 201
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(),
            format="json",
        )
        assert response.status_code == 201

    def test_user_and_profile_created_atomically_on_invalid_profile(self, api_client):
        """Se StudentProfile falhar, User tambem nao e criado (transacao atomica)."""
        # Matricula duplicada vai causar falha no profile
        api_client.post(self.ENDPOINT, _student_payload(), format="json")

        # Segundo registro: email diferente mas matricula duplicada -> profile falha
        payload = _student_payload(
            email="outro@unb.br",
            matricula="20231234567",  # matricula ja existe
        )
        response = api_client.post(self.ENDPOINT, payload, format="json")
        assert response.status_code == 400
        # Garantir que o User com o segundo email nao foi criado
        assert not User.objects.filter(email="outro@unb.br").exists()

    def test_weak_password_returns_400(self, api_client):
        """Senha fraca retorna HTTP 400."""
        response = api_client.post(
            self.ENDPOINT,
            _student_payload(password="abc"),
            format="json",
        )
        assert response.status_code == 400

    def test_weak_password_error_field_is_password(self, api_client):
        """Erro de senha fraca aponta para campo 'password'."""
        api_client.post(
            self.ENDPOINT,
            _student_payload(password="semletras12345"),
            format="json",
        )
        # senha so com numeros (sem letras) ou so letras — deve falhar
        # "semletras12345" tem letras e numeros, teste com apenas numeros
        response2 = api_client.post(
            self.ENDPOINT,
            _student_payload(password="12345678", email="outro2@unb.br", matricula="11111111"),
            format="json",
        )
        assert response2.status_code == 400
        data = response2.json()
        assert "password" in data

    def test_missing_required_fields_returns_400(self, api_client):
        """Campos obrigatorios ausentes retornam HTTP 400."""
        response = api_client.post(
            self.ENDPOINT,
            {},  # payload vazio
            format="json",
        )
        assert response.status_code == 400

    def test_missing_nome_returns_400_with_nome_error(self, api_client):
        """Campo nome ausente retorna erro no campo 'nome'."""
        payload = _student_payload()
        del payload["nome"]
        response = api_client.post(self.ENDPOINT, payload, format="json")
        assert response.status_code == 400
        assert "nome" in response.json()

    def test_missing_universidade_returns_400_with_universidade_error(self, api_client):
        """Campo universidade ausente retorna erro no campo 'universidade'."""
        payload = _student_payload()
        del payload["universidade"]
        response = api_client.post(self.ENDPOINT, payload, format="json")
        assert response.status_code == 400
        assert "universidade" in response.json()
