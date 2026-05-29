"""
Testes do StudentRegistrationSerializer.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

User = get_user_model()


def _valid_payload(**overrides):
    """Retorna um payload de registro valido para estudante."""
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
class TestStudentRegistrationSerializerValid:
    """Testes do caminho feliz do StudentRegistrationSerializer."""

    def test_valid_payload_is_valid(self):
        """Payload completo e valido passa na validacao."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors

    def test_valid_payload_creates_user(self):
        """Serializer valido cria objeto User no banco."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        result = serializer.save()
        assert User.objects.filter(email="ana.souza@unb.br").exists()

    def test_valid_payload_creates_student_profile(self):
        """Serializer valido cria objeto StudentProfile no banco."""
        from users.models import StudentProfile
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        assert StudentProfile.objects.filter(matricula="20231234567").exists()

    def test_role_is_automatically_set_to_estudante(self):
        """Role do usuario e automaticamente definido como 'estudante'."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.role == User.Role.ESTUDANTE

    def test_password_is_not_returned_in_response(self):
        """Campo password e write_only — nao aparece nos dados validados."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        data = serializer.data
        assert "password" not in data

    def test_password_is_hashed_on_user(self):
        """Senha e armazenada com hash, nao em texto plano."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.password != "Senha123"
        assert user.check_password("Senha123")

    def test_optional_fields_can_be_omitted(self):
        """Campos opcionais podem ser omitidos do payload."""
        from users.serializers import StudentRegistrationSerializer

        payload = _valid_payload()
        payload.pop("semestre_atual", None)
        payload.pop("turno", None)
        payload.pop("ano_conclusao", None)
        payload.pop("horas_extensao_exigidas", None)

        serializer = StudentRegistrationSerializer(data=payload)
        assert serializer.is_valid(), serializer.errors

    def test_interesses_can_be_empty_list(self):
        """Campo interesses pode ser lista vazia."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(interesses=[]))
        assert serializer.is_valid(), serializer.errors

    def test_student_profile_data_is_saved_correctly(self):
        """Dados do perfil academico sao salvos corretamente."""
        from users.models import StudentProfile
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload())
        assert serializer.is_valid(), serializer.errors
        serializer.save()
        profile = StudentProfile.objects.get(matricula="20231234567")
        assert profile.universidade == "Universidade de Brasília"
        assert profile.curso == "Engenharia de Software"
        assert profile.semestre_atual == 5
        assert profile.turno == "matutino"
        assert profile.ano_conclusao == 2027
        assert profile.horas_extensao_exigidas == 360
        assert profile.interesses == ["saude", "educacao", "tecnologia"]


@pytest.mark.django_db
class TestStudentRegistrationSerializerPasswordStrength:
    """Testes de validacao de forca da senha."""

    def test_password_too_short_is_rejected(self):
        """Senha com menos de 8 caracteres e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="Ab1"))
        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_exactly_7_chars_is_rejected(self):
        """Senha com exatamente 7 caracteres e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="Abc1234"))
        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_with_no_letters_is_rejected(self):
        """Senha apenas com numeros e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="12345678"))
        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_with_no_numbers_is_rejected(self):
        """Senha apenas com letras e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="AbcdefGH"))
        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_password_exactly_8_chars_with_letters_and_numbers_is_accepted(self):
        """Senha com 8 chars, letras e numeros e aceita."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="Abcde123"))
        assert serializer.is_valid(), serializer.errors

    def test_password_error_message_is_in_portuguese(self):
        """Mensagem de erro de senha e em portugues."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(password="weak"))
        serializer.is_valid()
        error_messages = " ".join(serializer.errors.get("password", []))
        # Verifica que a mensagem e em portugues
        assert any(
            term in error_messages.lower()
            for term in ["senha", "caracteres", "letras", "números", "mínimo"]
        )


@pytest.mark.django_db
class TestStudentRegistrationSerializerDuplicateEmail:
    """Testes de rejeicao de email duplicado."""

    def test_duplicate_email_is_rejected(self):
        """Email ja cadastrado retorna erro de validacao."""
        from users.serializers import StudentRegistrationSerializer

        # Primeiro registro
        s1 = StudentRegistrationSerializer(data=_valid_payload())
        assert s1.is_valid(), s1.errors
        s1.save()

        # Segundo registro com mesmo email
        s2 = StudentRegistrationSerializer(
            data=_valid_payload(matricula="99999999999")
        )
        assert not s2.is_valid()
        assert "email" in s2.errors

    def test_duplicate_email_error_message_is_in_portuguese(self):
        """Mensagem de email duplicado e em portugues."""
        from users.serializers import StudentRegistrationSerializer

        s1 = StudentRegistrationSerializer(data=_valid_payload())
        assert s1.is_valid(), s1.errors
        s1.save()

        s2 = StudentRegistrationSerializer(
            data=_valid_payload(matricula="88888888888")
        )
        s2.is_valid()
        error_messages = " ".join(s2.errors.get("email", []))
        assert "já está em uso" in error_messages or "em uso" in error_messages


@pytest.mark.django_db
class TestStudentRegistrationSerializerRequiredFields:
    """Testes de validacao de campos obrigatorios."""

    @pytest.mark.parametrize(
        "missing_field",
        ["nome", "email", "universidade", "curso", "matricula", "password"],
    )
    def test_missing_required_field_is_rejected(self, missing_field):
        """Campo obrigatorio ausente gera erro de validacao."""
        from users.serializers import StudentRegistrationSerializer

        payload = _valid_payload()
        del payload[missing_field]
        serializer = StudentRegistrationSerializer(data=payload)
        assert not serializer.is_valid()
        assert missing_field in serializer.errors

    def test_empty_nome_is_rejected(self):
        """Nome vazio e rejeitado."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(nome=""))
        assert not serializer.is_valid()
        assert "nome" in serializer.errors

    def test_empty_email_is_rejected(self):
        """Email vazio e rejeitado."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(email=""))
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_invalid_email_format_is_rejected(self):
        """Email com formato invalido e rejeitado."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(email="not-an-email"))
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_empty_universidade_is_rejected(self):
        """Universidade vazia e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(universidade=""))
        assert not serializer.is_valid()
        assert "universidade" in serializer.errors

    def test_empty_curso_is_rejected(self):
        """Curso vazio e rejeitado."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(curso=""))
        assert not serializer.is_valid()
        assert "curso" in serializer.errors

    def test_empty_matricula_is_rejected(self):
        """Matricula vazia e rejeitada."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(data=_valid_payload(matricula=""))
        assert not serializer.is_valid()
        assert "matricula" in serializer.errors


@pytest.mark.django_db
class TestStudentRegistrationSerializerInteresses:
    """Testes do campo interesses."""

    def test_interesses_as_array_of_strings_is_valid(self):
        """interesses como array de strings e valido."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(
            data=_valid_payload(interesses=["saude", "educacao"])
        )
        assert serializer.is_valid(), serializer.errors

    def test_interesses_max_3_items_is_valid(self):
        """interesses com 3 itens e valido."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(
            data=_valid_payload(interesses=["saude", "educacao", "tecnologia"])
        )
        assert serializer.is_valid(), serializer.errors

    def test_interesses_more_than_3_items_is_rejected(self):
        """interesses com mais de 3 itens e rejeitado."""
        from users.serializers import StudentRegistrationSerializer

        serializer = StudentRegistrationSerializer(
            data=_valid_payload(
                interesses=["saude", "educacao", "tecnologia", "meio_ambiente"]
            )
        )
        assert not serializer.is_valid()
        assert "interesses" in serializer.errors
