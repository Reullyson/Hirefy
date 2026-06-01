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

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['company', 'created_at', 'updated_at']

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
    student_name = serializers.ReadOnlyField(source='student.nome')
    student_email = serializers.ReadOnlyField(source='student.email')

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'company_name',
            'student',
            'student_name',
            'student_email',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['student', 'created_at', 'updated_at']