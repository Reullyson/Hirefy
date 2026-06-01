from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Company, Job, Application
from .serializers import CompanySerializer, JobSerializer, JobListSerializer, ApplicationSerializer
from .permissions import IsRecruiterOrAdmin, IsOwnerRecruiterOrAdmin


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

    @action(detail=True, methods=['patch'])
    def aprovar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas o administrador pode aprovar empresas."
            })

        company = self.get_object()
        company.status = 'APROVADA'
        company.save(update_fields=['status'])

        return Response({
            "detail": "Empresa aprovada com sucesso."
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def rejeitar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas o administrador pode rejeitar empresas."
            })

        company = self.get_object()
        company.status = 'REJEITADA'
        company.save(update_fields=['status'])

        return Response({
            "detail": "Empresa rejeitada com sucesso."
        }, status=status.HTTP_200_OK)


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

    @action(detail=True, methods=['patch'])
    def aprovar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas admin pode aprovar vagas."
            })

        job = self.get_object()
        job.status = 'ATIVA'
        job.save(update_fields=['status'])

        return Response({"detail": "Vaga aprovada."})

    @action(detail=True, methods=['patch'])
    def rejeitar(self, request, pk=None):
        if request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas admin pode rejeitar vagas."
            })

        job = self.get_object()
        job.status = 'ENCERRADA'
        job.save(update_fields=['status'])

        return Response({"detail": "Vaga rejeitada."})


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'ADMIN':
            return Application.objects.all()

        if user.user_type == 'ALUNO':
            return Application.objects.filter(student=user)

        if user.user_type == 'RECRUTADOR':
            return Application.objects.filter(job__company__recruiter=user)

        return Application.objects.none()

    def perform_create(self, serializer):
        # Alunos só podem se candidatar a vagas
        if self.request.user.user_type != 'ALUNO':
            raise ValidationError({
                "detail": "Apenas alunos podem se candidatar a vagas."
            })

        # Verificar se já existe candidatura para essa vaga
        job_id = self.request.data.get('job')
        if Application.objects.filter(job_id=job_id, student=self.request.user).exists():
            raise ValidationError({
                "detail": "Você já se candidatou a esta vaga."
            })

        serializer.save(student=self.request.user)

    @action(detail=True, methods=['patch'])
    def aceitar(self, request, pk=None):
        if request.user.user_type != 'RECRUTADOR' and request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas recrutadores e admins podem aceitar candidaturas."
            })

        application = self.get_object()

        # Verificar se o recrutador é dono da empresa
        if request.user.user_type == 'RECRUTADOR' and application.job.company.recruiter != request.user:
            raise ValidationError({
                "detail": "Você não tem permissão para aceitar esta candidatura."
            })

        application.status = 'ACEITA'
        application.save(update_fields=['status'])

        return Response({"detail": "Candidatura aceita."})

    @action(detail=True, methods=['patch'])
    def rejeitar(self, request, pk=None):
        if request.user.user_type != 'RECRUTADOR' and request.user.user_type != 'ADMIN':
            raise ValidationError({
                "detail": "Apenas recrutadores e admins podem rejeitar candidaturas."
            })

        application = self.get_object()

        # Verificar se o recrutador é dono da empresa
        if request.user.user_type == 'RECRUTADOR' and application.job.company.recruiter != request.user:
            raise ValidationError({
                "detail": "Você não tem permissão para rejeitar esta candidatura."
            })

        application.status = 'REJEITADA'
        application.save(update_fields=['status'])

        return Response({"detail": "Candidatura rejeitada."})