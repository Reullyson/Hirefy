from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Cria 3 administradores iniciais para o sistema'

    def handle(self, *args, **kwargs):
        admins = [
            {
                'email': 'admin1@hirefy.com',
                'nome': 'Admin Master',
                'password': 'AdminPassword123!',
            },
            {
                'email': 'admin2@hirefy.com',
                'nome': 'Admin Suporte',
                'password': 'AdminPassword123!',
            },
            {
                'email': 'admin3@hirefy.com',
                'nome': 'Admin Auditoria',
                'password': 'AdminPassword123!',
            }
        ]

        for admin_data in admins:
            if not User.objects.filter(email=admin_data['email']).exists():
                User.objects.create_superuser(
                    email=admin_data['email'],
                    nome=admin_data['nome'],
                    password=admin_data['password']
                )
                self.stdout.write(self.style.SUCCESS(f"Admin {admin_data['email']} criado com sucesso!"))
            else:
                self.stdout.write(self.style.WARNING(f"Admin {admin_data['email']} já existe."))
