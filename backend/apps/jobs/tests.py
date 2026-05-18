from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from apps.jobs.models import Company, Job

User = get_user_model()

class JobCRUDTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.jobs_url = '/api/jobs/'
        
        # Recruiter 1
        self.recruiter_1 = User.objects.create_user(
            email='recruiter1@empresa.com',
            nome='Recruiter One',
            password='Password123',
            user_type='RECRUTADOR'
        )
        self.company_1 = Company.objects.create(
            name='Empresa 1',
            cnpj='11111111000199',
            recruiter=self.recruiter_1
        )
        
        # Recruiter 2
        self.recruiter_2 = User.objects.create_user(
            email='recruiter2@empresa.com',
            nome='Recruiter Two',
            password='Password123',
            user_type='RECRUTADOR'
        )
        self.company_2 = Company.objects.create(
            name='Empresa 2',
            cnpj='22222222000199',
            recruiter=self.recruiter_2
        )
        
        # Aluno
        self.aluno = User.objects.create_user(
            email='aluno@aluno.ifce.edu.br',
            nome='Aluno Test',
            password='Password123',
            user_type='ALUNO'
        )

        # Base data for job creation
        self.job_data = {
            'title': 'Desenvolvedor Python',
            'description': 'Trabalhar com Django e FastAPI.',
            'requirements_mandatory': 'Python, Django, Git.',
            'level': 'JUNIOR',
            'location_type': 'REMOTO',
            'city': 'Cedro',
            'state': 'CE',
            'contract_type': 'CLT',
            'workload': '40h semanais',
            'education_level': 'Ensino Superior em andamento'
        }

    def test_recruiter_can_create_job(self):
        self.client.force_authenticate(user=self.recruiter_1)
        response = self.client.post(self.jobs_url, self.job_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 1)
        job = Job.objects.first()
        self.assertEqual(job.title, self.job_data['title'])
        self.assertEqual(job.company, self.company_1)

    def test_aluno_cannot_create_job(self):
        self.client.force_authenticate(user=self.aluno)
        response = self.client.post(self.jobs_url, self.job_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_job_listing_permissions(self):
        # Job 1 (ATIVA) from Company 1
        Job.objects.create(
            title='Vaga Ativa 1', company=self.company_1, level='JUNIOR', 
            location_type='REMOTO', status='ATIVA', contract_type='CLT'
        )
        # Job 2 (PAUSADA) from Company 1
        Job.objects.create(
            title='Vaga Pausada 1', company=self.company_1, level='PLENO', 
            location_type='REMOTO', status='PAUSADA', contract_type='CLT'
        )
        # Job 3 (ATIVA) from Company 2
        Job.objects.create(
            title='Vaga Ativa 2', company=self.company_2, level='SENIOR', 
            location_type='REMOTO', status='ATIVA', contract_type='CLT'
        )
        
        # Aluno: Sees only ATIVA from any company
        self.client.force_authenticate(user=self.aluno)
        response = self.client.get(self.jobs_url)
        self.assertEqual(len(response.data), 2)
        titles = [j['title'] for j in response.data]
        self.assertIn('Vaga Ativa 1', titles)
        self.assertIn('Vaga Ativa 2', titles)
        self.assertNotIn('Vaga Pausada 1', titles)
        
        # Recruiter 1: Sees all his jobs, and ATIVA from others? 
        # Actually, the viewset get_queryset:
        # if user_type == 'RECRUTADOR': return Job.objects.filter(company__recruiter=user)
        # This means recruiters see ONLY their own jobs in the current implementation.
        self.client.force_authenticate(user=self.recruiter_1)
        response = self.client.get(self.jobs_url)
        self.assertEqual(len(response.data), 2)
        titles = [j['title'] for j in response.data]
        self.assertIn('Vaga Ativa 1', titles)
        self.assertIn('Vaga Pausada 1', titles)
        self.assertNotIn('Vaga Ativa 2', titles)

    def test_recruiter_can_update_own_job(self):
        job = Job.objects.create(title='Velho Titulo', company=self.company_1, level='JUNIOR', location_type='REMOTO')
        self.client.force_authenticate(user=self.recruiter_1)
        
        update_data = {'title': 'Novo Titulo'}
        response = self.client.patch(f'{self.jobs_url}{job.id}/', update_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.title, 'Novo Titulo')

    def test_recruiter_cannot_update_others_job(self):
        job_of_2 = Job.objects.create(title='Vaga do 2', company=self.company_2, level='JUNIOR', location_type='REMOTO')
        self.client.force_authenticate(user=self.recruiter_1)
        
        update_data = {'title': 'Hackeado'}
        response = self.client.patch(f'{self.jobs_url}{job_of_2.id}/', update_data)
        
        # Should be 403 or 404 depending on how get_queryset + permissions work
        # In this project, get_queryset filters by owner, so it should be 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_recruiter_can_delete_own_job(self):
        job = Job.objects.create(title='Vaga a Deletar', company=self.company_1, level='JUNIOR', location_type='REMOTO')
        self.client.force_authenticate(user=self.recruiter_1)
        
        response = self.client.delete(f'{self.jobs_url}{job.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Job.objects.count(), 0)

    def test_recruiter_cannot_delete_others_job(self):
        job_of_2 = Job.objects.create(title='Vaga do 2', company=self.company_2, level='JUNIOR', location_type='REMOTO')
        self.client.force_authenticate(user=self.recruiter_1)
        
        response = self.client.delete(f'{self.jobs_url}{job_of_2.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Job.objects.count(), 1)
