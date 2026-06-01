from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, nome, password=None, **extra_fields):
        if not email:
            raise ValueError('O email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, nome=nome, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nome, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'ADMIN')
        return self.create_user(email, nome, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('ALUNO', 'Aluno'),
        ('RECRUTADOR', 'Recrutador'),
        ('ADMIN', 'Administrador'),
    )

    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='ALUNO')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=255)
    enrollment = models.CharField(max_length=50, unique=True)
    city = models.CharField(max_length=100)
    semester = models.IntegerField()
    github_url = models.URLField(max_length=500, null=True, blank=True)
    linkedin_url = models.URLField(max_length=500, null=True, blank=True)
    portfolio_url = models.URLField(max_length=500, null=True, blank=True)
    skills = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return self.full_name

class Experience(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.institution}"

class Course(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    workload = models.IntegerField()
    completion_date = models.DateField()
    certificate_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.name
