import os
import django
import secrets
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.jobs.models import Company, Job, Application
from apps.users.models import Student
from apps.jobs.emails import (
    send_application_confirmation,
    send_application_status_update,
    send_job_closed_notification,
    send_job_update_notification
)

User = get_user_model()

def run_e2e_email_tests():
    student_email = 'berexov288@alf5.com'
    recruiter_email = 'recruiter_test@example.com'
    
    print("--- 1. Preparando Ambiente de Teste ---")
    # Limpar dados antigos
    User.objects.filter(email__in=[student_email, recruiter_email]).delete()
    
    # Criar Recrutador e Empresa
    recruiter = User.objects.create_user(
        email=recruiter_email,
        nome="Recrutador Teste",
        password="password123",
        user_type="RECRUTADOR"
    )
    company = Company.objects.create(
        recruiter=recruiter,
        name="Empresa Global Tech",
        status="APROVADA"
    )
    
    # Criar Aluno
    student_user = User.objects.create_user(
        email=student_email,
        nome="Aluno Teste E2E",
        password="password123",
        user_type="ALUNO"
    )
    student = Student.objects.create(
        user=student_user,
        full_name="João Aluno de Teste",
        enrollment="2026123456",
        city="Cedro",
        semester=1
    )
    
    # Criar Vaga
    job = Job.objects.create(
        company=company,
        title="Desenvolvedor Full Stack Python/React",
        description="Vaga de estágio para alunos talentosos.",
        level="JUNIOR",
        location_type="REMOTO",
        status="ATIVA"
    )
    
    # Criar Candidatura
    application = Application.objects.create(
        job=job,
        student=student,
        status="PENDENTE"
    )
    
    print(f"--- 2. Testando: Confirmação de Candidatura ---")
    print(f"Enviando para: {student_email}")
    try:
        send_application_confirmation(application)
        print("✅ E-mail de confirmação enviado.")
    except Exception as e:
        print(f"❌ Erro: {e}")

    print(f"--- 3. Testando: Mudança de Status (ENTREVISTA) ---")
    application.status = "ENTREVISTA"
    application.save()
    try:
        # O sinal em signals.py deve disparar isso automaticamente no save()
        # Mas para garantir o teste isolado da função:
        send_application_status_update(application)
        print("✅ E-mail de mudança de status enviado.")
    except Exception as e:
        print(f"❌ Erro: {e}")

    print(f"--- 4. Testando: Vaga Encerrada ---")
    try:
        send_job_closed_notification(application)
        print("✅ E-mail de vaga encerrada enviado.")
    except Exception as e:
        print(f"❌ Erro: {e}")

    print(f"--- 5. Testando: Atualização na Vaga ---")
    try:
        send_job_update_notification(application)
        print("✅ E-mail de atualização de vaga enviado.")
    except Exception as e:
        print(f"❌ Erro: {e}")

    print("\n--- TESTES CONCLUÍDOS ---")
    print(f"Verifique a caixa de entrada de {student_email}")

if __name__ == "__main__":
    run_e2e_email_tests()
