from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

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

    def test_get_me_authenticated(self):
        user = User.objects.create_user(**self.user_data)

        self.client.force_authenticate(user=user)

        response = self.client.get(self.me_url)

        print("ME:", response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])