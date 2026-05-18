from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Experience, Course, Student
from .validators import validate_password_strength
from django.apps import apps

User = get_user_model()


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'title', 'institution', 'description', 'start_date', 'end_date', 'is_current']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'issuer', 'workload', 'completion_date', 'certificate_url']


class UserSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, required=False)
    courses = CourseSerializer(many=True, required=False)

    full_name = serializers.CharField(required=False)
    enrollment = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    semester = serializers.IntegerField(required=False)

    github_url = serializers.URLField(required=False, allow_null=True)
    linkedin_url = serializers.URLField(required=False, allow_null=True)
    portfolio_url = serializers.URLField(required=False, allow_null=True)

    cnpj = serializers.CharField(required=False)
    company_name = serializers.CharField(required=False)

    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password_strength]
    )

    class Meta:
        model = User
        fields = [
            'id',
            'nome',
            'email',
            'password',
            'user_type',
            'is_active',
            'full_name',
            'enrollment',
            'city',
            'semester',
            'github_url',
            'linkedin_url',
            'portfolio_url',
            'cnpj',
            'company_name',
            'experiences',
            'courses',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Só valida obrigatórios na criação
        if self.instance:
            return data

        user_type = data.get('user_type', 'ALUNO')

        if user_type == 'ALUNO':
            required = ['enrollment', 'city', 'semester']
            for field in required:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: 'Campo obrigatório para aluno.'
                    })

        elif user_type == 'RECRUTADOR':
            required = ['company_name', 'cnpj']
            for field in required:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: 'Campo obrigatório para recrutador.'
                    })

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance