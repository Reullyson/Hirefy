from django.db import models
from django.conf import settings
from apps.users.models import Student


class Company(models.Model):
    STATUS_CHOICES = (
        ('PENDENTE', 'Pendente'),
        ('APROVADA', 'Aprovada'),
        ('REJEITADA', 'Rejeitada'),
    )

    name = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=20, unique=True)
    logo_url = models.TextField(null=True, blank=True)
    site_url = models.URLField(max_length=500, null=True, blank=True)

    recruiter = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company',
        limit_choices_to={'user_type': 'RECRUTADOR'}
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDENTE'
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'


class Job(models.Model):
    STATUS_CHOICES = (
        ('ATIVA', 'Ativa'),
        ('PAUSADA', 'Pausada'),
        ('ENCERRADA', 'Encerrada'),
    )

    LOCATION_TYPES = (
        ('REMOTO', 'Remoto'),
        ('PRESENCIAL', 'Presencial'),
        ('HIBRIDO', 'Híbrido'),
    )

    LEVEL_CHOICES = (
        ('ESTAGIO', 'Estágio'),
        ('JUNIOR', 'Júnior'),
        ('PLENO', 'Pleno'),
        ('SENIOR', 'Sênior'),
    )

    CONTRACT_TYPES = (
        ('CLT', 'CLT'),
        ('PJ', 'PJ'),
        ('ESTAGIO', 'Estágio'),
    )

    title = models.CharField(max_length=255)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    description = models.TextField()
    requirements_mandatory = models.TextField()
    requirements_desirable = models.TextField(null=True, blank=True)

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    education_level = models.CharField(max_length=255)

    location_type = models.CharField(max_length=20, choices=LOCATION_TYPES)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Brasil')

    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    workload = models.CharField(max_length=100)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    benefits = models.TextField(null=True, blank=True)

    deadline_date = models.DateField(null=True, blank=True)
    gupy_link = models.URLField(max_length=500, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVA')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company.name}"

    class Meta:
        verbose_name = 'Vaga'
        verbose_name_plural = 'Vagas'
        ordering = ['-created_at']

class Application(models.Model):
    STATUS_CHOICES = (
        ('PENDENTE', 'Pendente'),
        ('EM_ANALISE', 'Em Análise'),
        ('APROVADO', 'Aprovado'),
        ('REPROVADO', 'Reprovado'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.job.title}"

    class Meta:
        verbose_name = 'Candidatura'
        verbose_name_plural = 'Candidaturas'
        unique_together = ('student', 'job')
        ordering = ['-created_at']
