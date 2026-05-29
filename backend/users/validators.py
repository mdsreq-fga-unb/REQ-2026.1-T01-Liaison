"""
Validadores customizados de senha para o sistema Liaison.
"""

from django.core.exceptions import ValidationError


class LettersAndNumbersValidator:
    """
    Valida que a senha contém tanto letras quanto números.
    Complementa o MinimumLengthValidator do Django.
    """

    def validate(self, password, user=None):
        has_letter = any(c.isalpha() for c in password)
        has_number = any(c.isdigit() for c in password)

        if not has_letter or not has_number:
            raise ValidationError(
                "A senha deve ter no mínimo 8 caracteres e conter letras e números.",
                code="password_no_letters_or_numbers",
            )

    def get_help_text(self):
        return "Sua senha deve conter letras e números."
