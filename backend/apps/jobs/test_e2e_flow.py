from django.core import mail
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from apps.jobs.models import Company, Job, Application
from apps.users.models import Student

User = get_user_model()

class EndToEndFlowTest(APITestCase):
    def setUp(self):
        # Create Admin
        self.admin = User.objects.create_superuser(
            email='admin@hirefy.com',
            nome='Admin User',
            password='AdminPassword123'
        )
        
        self.login_url = '/api/auth/login/'
        self.users_url = '/api/users/'
        self.companies_url = '/api/companies/'
        self.jobs_url = '/api/jobs/'
        self.applications_url = '/api/applications/'

    def get_token(self, email, password):
        response = self.client.post(self.login_url, {'email': email, 'password': password})
        return response.data['access']

    def test_complete_flow_e2e(self):
        # 1. Register Recruiter (and Company)
        recruiter_data = {
            'email': 'recruiter@tech.com',
            'nome': 'John Recruiter',
            'password': 'Password123',
            'user_type': 'RECRUTADOR',
            'company_name': 'Tech Corp',
            'cnpj': '12.345.678/0001-90'
        }
        response = self.client.post(self.users_url, recruiter_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recruiter_id = response.data['id']
        company_id = Company.objects.get(recruiter__id=recruiter_id).id

        # 2. Approve Company (as Admin)
        admin_token = self.get_token('admin@hirefy.com', 'AdminPassword123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + admin_token)
        response = self.client.patch(f'{self.companies_url}{company_id}/aprovar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Register Student
        student_data = {
            'email': 'student@aluno.ifce.edu.br',
            'nome': 'Jane Student',
            'password': 'Password123',
            'user_type': 'ALUNO',
            'full_name': 'Jane Student Profile',
            'enrollment': '2026SI001',
            'city': 'Cedro',
            'semester': 5
        }
        self.client.credentials() # Clear credentials
        response = self.client.post(self.users_url, student_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        student_id = response.data['id']

        # 4. Create Job (as Recruiter)
        recruiter_token = self.get_token('recruiter@tech.com', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + recruiter_token)
        job_data = {
            'title': 'Fullstack Developer',
            'description': 'Working with React and Django',
            'requirements_mandatory': 'Python, JS',
            'level': 'JUNIOR',
            'location_type': 'REMOTO',
            'contract_type': 'CLT',
            'education_level': 'Superior Incompleto',
            'city': 'Cedro',
            'state': 'CE',
            'workload': '40h'
        }
        response = self.client.post(self.jobs_url, job_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job_id = response.data['id']

        # 5. Apply for Job (as Student)
        mail.outbox.clear()
        student_token = self.get_token('student@aluno.ifce.edu.br', 'Password123')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + student_token)
        response = self.client.post(self.applications_url, {'job': job_id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application_id = response.data['id']

        # Verify Confirmation Email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Candidatura confirmada", mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ['student@aluno.ifce.edu.br'])

        # 6. Update Application Status (as Recruiter)
        mail.outbox.clear()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + recruiter_token)
        response = self.client.patch(f'{self.applications_url}{application_id}/', {'status': 'EM_ANALISE'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify Status Update Email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Atualização na sua candidatura", mail.outbox[0].subject)
        self.assertIn("Em Análise", mail.outbox[0].body)

        # 7. Approve Application (as Recruiter)
        mail.outbox.clear()
        response = self.client.patch(f'{self.applications_url}{application_id}/', {'status': 'APROVADO'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify Approval Email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Atualização na sua candidatura", mail.outbox[0].subject)
        self.assertIn("Aprovado", mail.outbox[0].body)

        # 8. Close Job (as Recruiter)
        mail.outbox.clear()
        response = self.client.patch(f'{self.jobs_url}{job_id}/', {'status': 'ENCERRADA'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify Closure Email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Vaga encerrada", mail.outbox[0].subject)
