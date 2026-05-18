from rest_framework import serializers
from .models import Company, Job, Application


class CompanySerializer(serializers.ModelSerializer):
    recruiter_email = serializers.ReadOnlyField(source='recruiter.email')

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'cnpj',
            'logo_url',
            'site_url',
            'status',
            'recruiter_email'
        ]
        read_only_fields = ['status', 'recruiter_email']


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo = serializers.ReadOnlyField(source='company.logo_url')
    company_site_url = serializers.ReadOnlyField(source='company.site_url')
    user_has_applied = serializers.SerializerMethodField()
    user_application_status = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

    def get_user_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'ALUNO':
            try:
                student = request.user.student_profile
                return Application.objects.filter(job=obj, student=student).exists()
            except:
                return False
        return False

    def get_user_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'ALUNO':
            try:
                student = request.user.student_profile
                application = Application.objects.filter(job=obj, student=student).first()
                if application:
                    return application.status
            except:
                pass
        return None


class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo = serializers.ReadOnlyField(source='company.logo_url')
    user_has_applied = serializers.SerializerMethodField()
    user_application_status = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'company_logo',
            'location_type',
            'level',
            'status',
            'created_at',
            'deadline_date',
            'user_has_applied',
            'user_application_status'
        ]

    def get_user_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'ALUNO':
            try:
                student = request.user.student_profile
                return Application.objects.filter(job=obj, student=student).exists()
            except:
                return False
        return False

    def get_user_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'ALUNO':
            try:
                student = request.user.student_profile
                application = Application.objects.filter(job=obj, student=student).first()
                if application:
                    return application.status
            except:
                pass
        return None

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.full_name')
    student_user_id = serializers.ReadOnlyField(source='student.user.id')
    job_title = serializers.ReadOnlyField(source='job.title')
    company_name = serializers.ReadOnlyField(source='job.company.name')

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['student', 'created_at', 'updated_at']
