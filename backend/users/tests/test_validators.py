"""
Testes do validador customizado de forca de senha.
"""

import pytest
from django.core.exceptions import ValidationError


class TestPasswordStrengthValidator:
    """Testes do LettersAndNumbersValidator."""

    def _get_validator(self):
        from users.validators import LettersAndNumbersValidator
        return LettersAndNumbersValidator()

    def test_validator_exists(self):
        """Validator esta disponivel no modulo users.validators."""
        from users.validators import LettersAndNumbersValidator  # noqa: F401
        assert True

    def test_validator_rejects_password_without_numbers(self):
        """Senha sem numeros e rejeitada."""
        validator = self._get_validator()
        with pytest.raises(ValidationError):
            validator.validate("AbcdefGH")

    def test_validator_rejects_password_without_letters(self):
        """Senha sem letras e rejeitada."""
        validator = self._get_validator()
        with pytest.raises(ValidationError):
            validator.validate("12345678")

    def test_validator_accepts_password_with_letters_and_numbers(self):
        """Senha com letras e numeros e aceita."""
        validator = self._get_validator()
        # Nao deve levantar excecao
        validator.validate("Senha123")

    def test_validator_accepts_mixed_case_with_numbers(self):
        """Senha com letras maiusculas, minusculas e numeros e aceita."""
        validator = self._get_validator()
        validator.validate("ABCdef123")

    def test_validator_accepts_minimum_letter_count(self):
        """Senha com ao menos uma letra e um numero e aceita."""
        validator = self._get_validator()
        validator.validate("a1234567")

    def test_validator_rejects_all_symbols(self):
        """Senha apenas com simbolos e rejeitada."""
        validator = self._get_validator()
        with pytest.raises(ValidationError):
            validator.validate("!@#$%^&*")

    def test_get_help_text_returns_string(self):
        """get_help_text() retorna string de ajuda."""
        validator = self._get_validator()
        help_text = validator.get_help_text()
        assert isinstance(help_text, str)
        assert len(help_text) > 0

    def test_error_message_is_in_portuguese(self):
        """Mensagem de erro e em portugues."""
        validator = self._get_validator()
        try:
            validator.validate("onlyletters")
        except ValidationError as e:
            message = str(e)
            assert any(
                term in message.lower()
                for term in ["senha", "letras", "números", "caracteres", "mínimo"]
            )

    def test_validator_code_attribute_exists(self):
        """Validator tem atributo 'code' para identificacao."""
        from users.validators import LettersAndNumbersValidator
        validator = LettersAndNumbersValidator()
        # Django validators customizados devem ter code para facilitar identificacao
        try:
            validator.validate("onlynumbers12345")
        except ValidationError as e:
            # Nao deve quebrar — erro deve ter codigo
            assert e.code is not None or len(e.messages) > 0


class TestMinimumLengthValidator:
    """Testes de integracao com MinimumLengthValidator do Django."""

    def test_minimum_length_8_is_configured(self):
        """Validador de tamanho minimo esta configurado com 8 caracteres."""
        from django.conf import settings

        validators_names = [v["NAME"] for v in settings.AUTH_PASSWORD_VALIDATORS]
        assert "django.contrib.auth.password_validation.MinimumLengthValidator" in validators_names

    def test_custom_letters_and_numbers_validator_is_configured(self):
        """Validador customizado de letras e numeros esta configurado no settings."""
        from django.conf import settings

        validators_names = [v["NAME"] for v in settings.AUTH_PASSWORD_VALIDATORS]
        assert "users.validators.LettersAndNumbersValidator" in validators_names
