import html
from django.utils.html import strip_tags
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

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo = serializers.ReadOnlyField(source='company.logo_url')
    company_site_url = serializers.ReadOnlyField(source='company.site_url')
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)
    
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
                return Application.objects.filter(job=obj, student=request.user.student_profile).exists()
            except Exception:
                return False
        return False

    def get_user_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.user_type == 'ALUNO':
            try:
                app = Application.objects.filter(job=obj, student=request.user.student_profile).first()
                return app.status if app else None
            except Exception:
                return None
        return None

    def validate(self, data):
        # Limpar HTML de campos de texto
        text_fields = ['title', 'description', 'requirements_mandatory', 'requirements_desirable', 'benefits']
        for field in text_fields:
            if field in data and data[field]:
                # Remove tags HTML e decodifica entidades (ex: &nbsp;)
                cleaned = strip_tags(data[field])
                data[field] = html.unescape(cleaned).strip()
        return data

    def validate_salary(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Salário não pode ser negativo."
            )
        return value

class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo = serializers.ReadOnlyField(source='company.logo_url')

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
            'created_at'
        ]

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    company_name = serializers.ReadOnlyField(source='job.company.name')
    student_name = serializers.ReadOnlyField(source='student.full_name')
    student_user_id = serializers.ReadOnlyField(source='student.user.id')

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['student', 'created_at', 'updated_at']
