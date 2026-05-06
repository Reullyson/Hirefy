from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
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
        return Company.objects.filter(recruiter=user)

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

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
            # Recruiter sees their own jobs (any status)
            return Job.objects.filter(company__recruiter=user)
        
        # Aluno sees only active jobs
        return Job.objects.filter(status='ATIVA')

    def perform_create(self, serializer):
        # Automatically link the job to the recruiter's company
        try:
            company = self.request.user.company
            serializer.save(company=company)
        except Company.DoesNotExist:
            # This should ideally be handled by a cleaner validation, 
            # but for now, we'll raise an error.
            from rest_framework.exceptions import ValidationError
            raise ValidationError("O usuário recrutador deve ter uma empresa vinculada.")
