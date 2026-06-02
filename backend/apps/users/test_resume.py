from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Student, Experience, Course
import datetime

User = get_user_model()

class ResumeGeneratorTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='aluno_curriculo@aluno.ifce.edu.br',
            password='testpassword123',
            nome='Aluno Currículo',
            user_type='ALUNO'
        )
        self.student = Student.objects.create(
            user=self.user,
            full_name='Aluno Currículo da Silva',
            enrollment='2021123456',
            city='Iguatu',
            semester=5,
            skills='Python, Django, React'
        )
        self.experience = Experience.objects.create(
            student=self.student,
            title='Desenvolvedor Full Stack Intern',
            institution='Empresa Teste',
            description='Desenvolvimento de APIs com Django.',
            start_date=datetime.date(2022, 1, 1),
            is_current=True
        )
        self.course = Course.objects.create(
            student=self.student,
            name='Curso de Python Avançado',
            issuer='Plataforma EAD',
            workload=40,
            completion_date=datetime.date(2022, 5, 1)
        )
        self.url = '/api/profile/resume/'

    def test_generate_resume_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_generate_resume_authenticated_student(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF-1.'))

    def test_generate_resume_not_student(self):
        admin_user = User.objects.create_user(
            email='admin@ifce.edu.br',
            password='admin',
            nome='Admin User',
            user_type='ADMIN'
        )
        self.client.force_authenticate(user=admin_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
