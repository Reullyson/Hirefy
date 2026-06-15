import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.serializers import UserSerializer

User = get_user_model()

def update_student():
    email = 'aluno@aluno.ifce.edu.br'
    try:
        user = User.objects.get(email=email)
        print(f"--- Atualizando perfil de: {email} ---")
        
        data = {
            'full_name': 'João Aluno da Silva Santos',
            'enrollment': '2026100100',
            'course': 'Engenharia de Computação',
            'city': 'Iguatu - CE',
            'semester': 5,
            'skills': 'React, TypeScript, Node.js, Python, Django, Docker, PostgreSQL, Git, Tailwind CSS, REST APIs',
            'github_url': 'https://github.com/joaoaluno',
            'linkedin_url': 'https://linkedin.com/in/joaoaluno',
            'portfolio_url': 'https://joaoaluno.dev',
            'experiences': [
                {
                    'title': 'Desenvolvedor Full Stack Júnior',
                    'institution': 'Tech Solutions Inc.',
                    'description': 'Desenvolvimento de interfaces modernas com React e APIs robustas utilizando Django REST Framework. Implementação de testes automatizados e manutenção de containers Docker.',
                    'start_date': '2025-01-10',
                    'is_current': True
                },
                {
                    'title': 'Estagiário de Desenvolvimento',
                    'institution': 'IFCE - Campus Iguatu',
                    'description': 'Auxílio no desenvolvimento de sistemas internos e suporte técnico aos laboratórios de informática.',
                    'start_date': '2024-03-01',
                    'end_date': '2024-12-20',
                    'is_current': False
                }
            ],
            'courses': [
                {
                    'name': 'Desenvolvimento Web Moderno',
                    'issuer': 'Udemy',
                    'workload': 60,
                    'completion_date': '2024-06-15',
                    'certificate_url': 'https://certificate.com/web-moderno'
                },
                {
                    'name': 'Python for Data Science',
                    'issuer': 'Coursera',
                    'workload': 40,
                    'completion_date': '2023-11-20',
                    'certificate_url': 'https://coursera.org/verify/python-ds'
                }
            ]
        }
        
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("✅ Perfil profissional preenchido com sucesso!")
        else:
            print("❌ Erros de validação:")
            print(serializer.errors)
            
    except User.DoesNotExist:
        print(f"❌ Usuário {email} não encontrado.")

if __name__ == '__main__':
    update_student()