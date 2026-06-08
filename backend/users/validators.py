"""
Validadores customizados de senha e upload de imagens para o sistema Liaison.
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


def validate_image_file_extension(value):
    """Valida que a imagem tem extensao JPEG ou PNG."""
    ext = value.name.rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png"):
        raise ValidationError(
            "Tipo de arquivo não suportado. Use JPEG ou PNG.",
            code="invalid_image_extension",
        )


def validate_image_file_size(value):
    """Valida que a imagem nao excede 5 MB."""
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise ValidationError(
            "O arquivo de imagem não pode exceder 5 MB.",
            code="image_too_large",
        )
