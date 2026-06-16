import requests
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import Company, Job, Application
from apps.users.models import Student
from .serializers import CompanySerializer, JobSerializer, JobListSerializer, ApplicationSerializer
from .permissions import IsRecruiterOrAdmin, IsOwnerRecruiterOrAdmin, IsAdminUserType


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'ADMIN':
            return Company.objects.all()
        if user.user_type == 'RECRUTADOR':
            return Company.objects.filter(recruiter=user)
        return Company.objects.filter(status='APROVADA')

    def perform_create(self, serializer):
        serializer.save(
            recruiter=self.request.user,
            status='PENDENTE'
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUserType])
    def aprovar(self, request, pk=None):
        company = self.get_object()
        company.status = 'APROVADA'
        company.save()
        return Response({'status': 'Empresa aprovada'})

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUserType])
    def rejeitar(self, request, pk=None):
        company = self.get_object()
        company.status = 'REJEITADA'
        company.save()
        return Response({'status': 'Empresa rejeitada'})


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    permission_classes = [IsRecruiterOrAdmin, IsOwnerRecruiterOrAdmin]

    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Job.objects.filter(status='ATIVA')

        if user.user_type == 'ADMIN':
            return Job.objects.all()

        if user.user_type == 'RECRUTADOR':
            return Job.objects.filter(company__recruiter=user)

        return Job.objects.filter(
            status='ATIVA',
            company__status='APROVADA'
        )

    def perform_create(self, serializer):
        try:
            company = self.request.user.company

            if company.status != 'APROVADA':
                raise ValidationError({
                    "detail": "Sua empresa precisa estar homologada."
                })

            serializer.save(company=company)

        except Company.DoesNotExist:
            raise ValidationError({
                "detail": "O recrutador precisa cadastrar uma empresa."
            })

    @action(detail=True, methods=['patch'], url_path='aprovar')
    def aprovar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas administradores podem aprovar vagas."
            })

        job = self.get_object()
        job.status = 'ATIVA'
        job.save(update_fields=['status'])

        return Response(
            {"detail": "Vaga aprovada com sucesso."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='rejeitar')
    def rejeitar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas administradores podem rejeitar vagas."
            })

        job = self.get_object()
        job.status = 'ENCERRADA'
        job.save(update_fields=['status'])

        return Response(
            {"detail": "Vaga rejeitada com sucesso."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='import-gupy')
    def import_gupy(self, request):
        url = request.data.get('url')
        if not url:
            return Response(
                {'detail': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            company = self.request.user.company
            if company.status != 'APROVADA':
                return Response(
                    {'detail': 'Sua empresa precisa estar homologada.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Company.DoesNotExist:
            return Response(
                {'detail': 'O recrutador precisa cadastrar uma empresa.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            scraping_url = f"http://localhost:5000/scrape-gupy?url={url}"
            response = requests.get(scraping_url, timeout=30)

            if response.status_code != 200:
                return Response(
                    {'detail': 'Erro ao acessar o serviço de extração.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            job_data = response.json()
            if 'error' in job_data:
                return Response(
                    {'detail': job_data['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            serializer = self.get_serializer(data=job_data)
            serializer.is_valid(raise_exception=True)
            serializer.save(company=company, gupy_link=url)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except requests.exceptions.RequestException as e:
            return Response(
                {'detail': f'Erro na comunicação com o serviço de scraping: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'detail': f'Erro interno: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.all()
        
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)

        if user.user_type == 'ADMIN':
            return queryset
        if user.user_type == 'RECRUTADOR':
            return queryset.filter(job__company__recruiter=user)
        
        # Aluno sees their own applications
        try:
            return queryset.filter(student=user.student_profile)
        except Student.DoesNotExist:
            return Application.objects.none()

    def perform_create(self, serializer):
        if self.request.user.user_type != 'ALUNO':
            raise PermissionDenied("Apenas alunos podem se candidatar a vagas.")
        
        try:
            student = self.request.user.student_profile
            job_id = self.request.data.get('job')
            if Application.objects.filter(student=student, job_id=job_id).exists():
                raise ValidationError("Você já se candidatou a esta vaga.")
                
            serializer.save(student=student)
        except Student.DoesNotExist:
            raise ValidationError("O aluno deve ter um perfil completo.")
