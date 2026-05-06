from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.jobs.models import Company, Job

User = get_user_model()

class JobCRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.jobs_url = '/api/jobs/'
        
        # Recruiter
        self.recruiter = User.objects.create_user(
            email='recruiter@empresa.com',
            nome='Recruiter Test',
            password='Password123',
            user_type='RECRUTADOR'
        )
        self.company = Company.objects.create(
            name='Test Tech',
            cnpj='12345678000199',
            recruiter=self.recruiter
        )
        
        # Aluno
        self.aluno = User.objects.create_user(
            email='aluno@aluno.ifce.edu.br',
            nome='Aluno Test',
            password='Password123',
            user_type='ALUNO'
        )

    def test_recruiter_can_create_job(self):
        self.client.force_authenticate(user=self.recruiter)
        data = {
            'title': 'Vaga Teste',
            'description': 'Desc',
            'requirements_mandatory': 'Req',
            'level': 'JUNIOR',
            'location_type': 'REMOTO',
            'city': 'Cedro',
            'state': 'CE',
            'contract_type': 'CLT',
            'workload': '40h',
            'education_level': 'Superior Completo'
        }
        response = self.client.post(self.jobs_url, data)
        if response.status_code != status.HTTP_201_CREATED:
            print("ERROR DATA:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 1)
        self.assertEqual(Job.objects.first().company, self.company)

    def test_aluno_cannot_create_job(self):
        self.client.force_authenticate(user=self.aluno)
        data = {'title': 'Vaga Aluno'}
        response = self.client.post(self.jobs_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_job_listing_permissions(self):
        # Create an active job
        Job.objects.create(
            title='Vaga Ativa', company=self.company, level='PLENO', 
            location_type='REMOTO', status='ATIVA', contract_type='CLT'
        )
        # Create a paused job
        Job.objects.create(
            title='Vaga Pausada', company=self.company, level='PLENO', 
            location_type='REMOTO', status='PAUSADA', contract_type='CLT'
        )
        
        # Aluno sees only active
        self.client.force_authenticate(user=self.aluno)
        response = self.client.get(self.jobs_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Vaga Ativa')
        
        # Recruiter sees both (his own)
        self.client.force_authenticate(user=self.recruiter)
        response = self.client.get(self.jobs_url)
        self.assertEqual(len(response.data), 2)
