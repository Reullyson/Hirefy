import os
import django
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import secrets

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

def test_admin_invite():
    email = 'berexov288@alf5.com'
    nome_base = 'Admin de Teste'
    temp_password = secrets.token_urlsafe(10)
    
    print(f"Limpando usuário antigo se existir: {email}")
    User.objects.filter(email=email).delete()
    
    print(f"Enviando e-mail de convite administrativo para {email}...")
    
    subject="Convite para administração do Hirefy (Teste)"
    message=(
        f"Olá, {nome_base}!\n\n"
        f"Você foi convidado para acessar o painel administrativo do Hirefy.\n\n"
        f"Credenciais de acesso:\n"
        f"E-mail: {email}\n"
        f"Senha temporária: {temp_password}\n\n"
        f"Após entrar no sistema, altere sua senha imediatamente."
    )
    
    try:
        sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        if sent:
            print("✅ E-mail de convite administrativo enviado com sucesso!")
        else:
            print("❌ Falha no envio do e-mail.")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {str(e)}")

if __name__ == "__main__":
    test_admin_invite()
