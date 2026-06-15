import os
import django
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

def test_recruiter_invite():
    email = 'berexov288@alf5.com'
    nome = 'Recrutador de Teste'
    company_name = 'Empresa Teste Brevo'
    
    print(f"Limpando usuário antigo se existir: {email}")
    User.objects.filter(email=email).delete()
    
    print(f"Cadastrando recrutador: {email}")
    user = User.objects.create(
        email=email,
        nome=nome,
        user_type='RECRUTADOR',
        is_active=False
    )
    
    # Gerar dados do convite (simulando UserViewSet.invite_recruiter)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    invite_link = f"{settings.FRONTEND_URL}/aceitar-convite?uid={uid}&token={token}"
    
    subject = 'Convite para a Plataforma Hirefy (Teste de Recrutador)'
    message = (
        f'Olá {user.nome},\n\n'
        f'Você foi convidado para se cadastrar como recrutador na plataforma Hirefy pela empresa {company_name}.\n\n'
        f'Para completar seu cadastro e definir sua senha, acesse o link abaixo:\n\n'
        f'{invite_link}\n\n'
        f'Atenciosamente,\nEquipe Hirefy'
    )
    
    print(f"Enviando e-mail de convite para {email}...")
    try:
        sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        if sent:
            print("✅ E-mail de convite enviado com sucesso!")
        else:
            print("❌ Falha no envio do e-mail.")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {str(e)}")

if __name__ == "__main__":
    test_recruiter_invite()
