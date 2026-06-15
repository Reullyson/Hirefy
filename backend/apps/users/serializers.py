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

    def to_internal_value(self, data):
        # Converter strings vazias em None para campos de data
        if 'end_date' in data and data['end_date'] == '':
            data['end_date'] = None
        return super().to_internal_value(data)


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'issuer', 'workload', 'completion_date', 'certificate_url']

    def to_internal_value(self, data):
        # Converter strings vazias em None para campos de data
        if 'completion_date' in data and data['completion_date'] == '':
            data['completion_date'] = None
        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, required=False)
    courses = CourseSerializer(many=True, required=False)

    full_name = serializers.CharField(required=False, allow_blank=True)
    enrollment = serializers.CharField(required=False, allow_blank=True)
    course = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    semester = serializers.IntegerField(required=False)

    github_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    linkedin_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    portfolio_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    skills = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    is_active = serializers.BooleanField(default=True)

    cnpj = serializers.CharField(required=False, allow_blank=True)
    company_name = serializers.CharField(required=False, allow_blank=True)

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
            'course',
            'city',
            'semester',
            'skills',
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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Adicionar dados do perfil de aluno se existir
        if hasattr(instance, 'student_profile'):
            student = instance.student_profile
            ret['full_name'] = student.full_name
            ret['enrollment'] = student.enrollment
            ret['course'] = student.course
            ret['city'] = student.city
            ret['semester'] = student.semester
            ret['skills'] = student.skills
            ret['github_url'] = student.github_url
            ret['linkedin_url'] = student.linkedin_url
            ret['portfolio_url'] = student.portfolio_url
            
            # Adicionar experiências e cursos
            ret['experiences'] = ExperienceSerializer(student.experiences.all(), many=True).data
            ret['courses'] = CourseSerializer(student.courses.all(), many=True).data
            
        # Adicionar dados da empresa se existir
        if hasattr(instance, 'company'):
            company = instance.company
            ret['company_name'] = company.name
            ret['cnpj'] = company.cnpj
            
        return ret

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
        password = validated_data.pop('password', None)
        
        # Extrair campos específicos de perfil
        student_fields = {
            'full_name': validated_data.pop('full_name', validated_data.get('nome')),
            'enrollment': validated_data.pop('enrollment', None),
            'course': validated_data.pop('course', 'Ciência da Computação'),
            'city': validated_data.pop('city', None),
            'semester': validated_data.pop('semester', None),
            'skills': validated_data.pop('skills', None),
            'github_url': validated_data.pop('github_url', None),
            'linkedin_url': validated_data.pop('linkedin_url', None),
            'portfolio_url': validated_data.pop('portfolio_url', None),
        }
        
        company_fields = {
            'name': validated_data.pop('company_name', None),
            'cnpj': validated_data.pop('cnpj', None),
        }

        # Remover experiências e cursos que podem vir no payload mas não são do modelo User
        validated_data.pop('experiences', None)
        validated_data.pop('courses', None)

        user_type = validated_data.get('user_type', 'ALUNO')
        
        # Criar o usuário
        if password:
            user = User.objects.create_user(password=password, **validated_data)
        else:
            # Para convites, o usuário é criado sem senha inicialmente
            user = User.objects.create_user(password=None, **validated_data)
            user.set_unusable_password()
            user.save()
        
        # Criar o perfil correspondente
        if user_type == 'ALUNO':
            Student.objects.create(user=user, **student_fields)
        elif user_type == 'RECRUTADOR':
            Company = apps.get_model('jobs', 'Company')
            Company.objects.create(recruiter=user, **company_fields)
            
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        experiences_data = validated_data.pop('experiences', None)
        courses_data = validated_data.pop('courses', None)

        # Campos de perfil de aluno
        student_fields = ['full_name', 'enrollment', 'course', 'city', 'semester', 'skills', 'github_url', 'linkedin_url', 'portfolio_url']
        student_data = {}
        for field in student_fields:
            if field in validated_data:
                student_data[field] = validated_data.pop(field)

        # Campos de empresa
        company_fields = {'company_name': 'name', 'cnpj': 'cnpj'}
        company_data = {}
        for field, model_field in company_fields.items():
            if field in validated_data:
                company_data[model_field] = validated_data.pop(field)

        # Atualizar usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()

        # Atualizar perfil de aluno
        if hasattr(instance, 'student_profile') and student_data:
            student = instance.student_profile
            for attr, value in student_data.items():
                setattr(student, attr, value)
            student.save()

            # Atualizar experiências se fornecidas
            if experiences_data is not None:
                student.experiences.all().delete()
                for exp_data in experiences_data:
                    Experience.objects.create(student=student, **exp_data)

            # Atualizar cursos se fornecidos
            if courses_data is not None:
                student.courses.all().delete()
                for course_data in courses_data:
                    Course.objects.create(student=student, **course_data)

        # Atualizar empresa
        if hasattr(instance, 'company') and company_data:
            company = instance.company
            for attr, value in company_data.items():
                setattr(company, attr, value)
            company.save()

        return instance


class InviteRecruiterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    nome = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=255)
    cnpj = serializers.CharField(max_length=18)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value


class AcceptInviteSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password_strength])
    confirm_password = serializers.CharField()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "As senhas não conferem."})
        return data
