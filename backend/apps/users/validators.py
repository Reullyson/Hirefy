from django.core.exceptions import ValidationError
import re

def validate_ifce_email(value):
    """
    Valida se o email pertence ao domínio @aluno.ifce.edu.br
    """
    if not value.endswith('@aluno.ifce.edu.br'):
        raise ValidationError(
            'Apenas emails @aluno.ifce.edu.br são permitidos para estudantes.'
        )

def validate_password_strength(value):
    """
    Valida se a senha tem pelo menos 8 caracteres, um número e uma letra.
    """
    if len(value) < 8:
        raise ValidationError('A senha deve ter pelo menos 8 caracteres.')
    if not re.search(r'[A-Za-z]', value):
        raise ValidationError('A senha deve conter pelo menos uma letra.')
    if not re.search(r'[0-9]', value):
        raise ValidationError('A senha deve conter pelo menos um número.')
