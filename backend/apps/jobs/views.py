from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Company, Job
from .serializers import CompanySerializer, JobSerializer, JobListSerializer
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
        company = self.get_object()
        company.status = 'APROVADA'
        company.save()
        return Response({'message': 'Empresa aprovada'})

    @action(detail=True, methods=['patch'])
    def rejeitar(self, request, pk=None):
        company = self.get_object()
        company.status = 'REJEITADA'
        company.save()
        return Response({'message': 'Empresa rejeitada'})


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
                raise ValidationError(
                    "Sua empresa precisa ser homologada antes de publicar vagas."
                )

            serializer.save(company=company)

        except Company.DoesNotExist:
            raise ValidationError(
                "O recrutador precisa cadastrar uma empresa."
            )