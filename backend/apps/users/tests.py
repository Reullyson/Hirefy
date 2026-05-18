from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

User = get_user_model()


class UserCRUDTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/users/'
        self.login_url = '/api/auth/login/'
        self.me_url = '/api/users/me/'

        self.user_data = {
            'nome': 'Test User',
            'email': 'test@aluno.ifce.edu.br',
            'password': 'Password123'
        }

        self.student_data = {
            'full_name': 'Test User',
            'enrollment': '12345',
            'city': 'Iguatu',
            'semester': 1
        }

    def test_register_user(self):
        data = {**self.user_data, **self.student_data}

        response = self.client.post(self.register_url, data)

        print("REGISTER:", response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().nome, 'Test User')

    def test_login_user(self):
        User.objects.create_user(**self.user_data)

        response = self.client.post(self.login_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })

        print("LOGIN:", response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_register_and_login(self):
        data = {**self.user_data, **self.student_data}
        self.client.post(self.register_url, data)
        
        response = self.client.post(self.login_url, {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

class GoogleOAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.google_auth_url = '/api/auth/google/'
        self.academic_email = 'aluno@aluno.ifce.edu.br'
        self.user_data = {
            'nome': 'Estudante Google',
            'email': self.academic_email,
            'password': 'GoogleSecret123'
        }

    @patch('apps.users.views.verify_google_token')
    def test_google_login_success(self, mock_verify):
        # Mocking valid Google token
        mock_verify.return_value = {
            'email': self.academic_email,
            'name': 'Estudante Google',
            'sub': '123456789'
        }
        
        # Create user first
        User.objects.create_user(**self.user_data)
        
        response = self.client.post(self.google_auth_url, {'token': 'valid_token'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], self.academic_email)

    @patch('apps.users.views.verify_google_token')
    def test_google_login_inactive_user(self, mock_verify):
        # Mocking valid Google token for inactive user
        mock_verify.return_value = {
            'email': self.academic_email,
            'name': 'Estudante Google',
            'sub': '123456789'
        }
        
        # Create inactive user
        User.objects.create_user(**self.user_data, is_active=False)
        
        response = self.client.post(self.google_auth_url, {'token': 'valid_token'})
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Sua conta está desativada. Entre em contato com o administrador.')

    @patch('apps.users.views.verify_google_token')
    def test_google_login_user_not_found(self, mock_verify):
        # Mocking valid Google token for non-existent user
        mock_verify.return_value = {
            'email': 'novo@aluno.ifce.edu.br',
            'name': 'Novo Aluno',
            'sub': '987654321'
        }
        
        response = self.client.post(self.google_auth_url, {'token': 'valid_token'})
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('google_data', response.data)
        self.assertEqual(response.data['google_data']['email'], 'novo@aluno.ifce.edu.br')

    @patch('apps.users.views.verify_google_token')
    def test_google_login_invalid_domain(self, mock_verify):
        # Mocking valid Google token but invalid domain
        mock_verify.return_value = {
            'email': 'externo@gmail.com',
            'name': 'Usuario Externo',
            'sub': '000000000'
        }
        
        response = self.client.post(self.google_auth_url, {'token': 'valid_token'})
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Apenas e-mails @aluno.ifce.edu.br são permitidos.')

    @patch('apps.users.views.verify_google_token')
    def test_google_login_invalid_token(self, mock_verify):
        # Mocking invalid token
        mock_verify.return_value = None
        
        response = self.client.post(self.google_auth_url, {'token': 'invalid_token'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'Token do Google inválido ou expirado.')

    def test_google_login_missing_token(self):
        response = self.client.post(self.google_auth_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)