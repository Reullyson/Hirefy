import os
import django
import requests
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.jobs.models import Company, Job
from apps.jobs.serializers import JobSerializer

User = get_user_model()

def test_gupy_boticario():
    gupy_url = "https://grupoboticario.gupy.io/job/eyJqb2JJZCI6MTEzNTk4NTMsInNvdXJjZSI6Imd1cHlfcG9ydGFsIn0=?jobBoardSource=share_link"
    email = 'valewi7814@4nly.com'
    
    user = User.objects.filter(email=email).first()
    if not user:
        print(f"Usuário {email} não encontrado.")
        return
        
    company = user.company
    
    print(f"--- 1. Chamando Serviço de Scraping para: {gupy_url} ---")
    try:
        response = requests.get(f"http://localhost:5000/scrape-gupy?url={gupy_url}")
        if response.status_code != 200:
            print(f"❌ Erro no scraping: {response.text}")
            return
        
        job_data = response.json()
        print(f"✅ Dados obtidos para a vaga: {job_data.get('title')}")
        
        print("\n--- 2. Salvando Vaga via JobSerializer (Limpeza HTML) ---")
        serializer = JobSerializer(data=job_data)
        
        if serializer.is_valid():
            job = serializer.save(company=company)
            print("✅ Vaga salva com sucesso no banco de dados!")
            
            print("\n--- 3. Verificação do Texto Limpo ---")
            print(f"[Título]: {job.title}")
            print(f"[Nível]: {job.level}")
            print(f"[Local]: {job.location_type} - {job.city}/{job.state}")
            print(f"[Descrição (primeiros 150 caracteres)]:\n{job.description[:150]}...")
        else:
            print(f"❌ Erro na validação do serializer: {serializer.errors}")

    except Exception as e:
        print(f"❌ Erro no fluxo E2E: {e}")

if __name__ == "__main__":
    test_gupy_boticario()
