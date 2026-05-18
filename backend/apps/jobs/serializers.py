from rest_framework import serializers
from .models import Company, Job


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