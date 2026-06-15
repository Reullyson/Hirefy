import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_email():
    subject = 'Teste de Integração Hirefy + Brevo'
    message = 'Olá! Este é um e-mail de teste para validar a configuração da API Brevo no projeto Hirefy.'
    recipient_list = ['valewi7814@4nly.com']
    
    print(f"Enviando e-mail para {recipient_list}...")
    try:
        sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=False,
        )
        if sent:
            print("✅ E-mail enviado com sucesso!")
        else:
            print("❌ Falha no envio (nenhum erro retornado).")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {str(e)}")

if __name__ == "__main__":
    test_email()
