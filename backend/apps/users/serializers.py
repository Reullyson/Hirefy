from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Experience, Course, Student
from .validators import validate_ifce_email, validate_password_strength

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
    
    # Campos do Student (Perfil)
    full_name = serializers.CharField(write_only=True)
    enrollment = serializers.CharField(write_only=True)
    city = serializers.CharField(write_only=True)
    semester = serializers.IntegerField(write_only=True)
    github_url = serializers.URLField(write_only=True, required=False, allow_null=True)
    linkedin_url = serializers.URLField(write_only=True, required=False, allow_null=True)
    portfolio_url = serializers.URLField(write_only=True, required=False, allow_null=True)

    password = serializers.CharField(
        write_only=True, 
        required=False, 
        style={'input_type': 'password'},
        validators=[validate_password_strength]
    )
    email = serializers.EmailField(validators=[validate_ifce_email])

    class Meta:
        model = User
        fields = [
            'id', 'nome', 'email', 'password', 'user_type',
            'full_name', 'enrollment', 'city', 'semester', 
            'github_url', 'linkedin_url', 'portfolio_url',
            'experiences', 'courses', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        experiences_data = validated_data.pop('experiences', [])
        courses_data = validated_data.pop('courses', [])
        
        # Extrair dados do Student
        student_data = {
            'full_name': validated_data.pop('full_name'),
            'enrollment': validated_data.pop('enrollment'),
            'city': validated_data.pop('city'),
            'semester': validated_data.pop('semester'),
            'github_url': validated_data.pop('github_url', None),
            'linkedin_url': validated_data.pop('linkedin_url', None),
            'portfolio_url': validated_data.pop('portfolio_url', None),
        }
        
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        
        # Criação do perfil do aluno
        student = Student.objects.create(user=user, **student_data)
        
        for exp in experiences_data:
            Experience.objects.create(student=student, **exp)
        
        for course in courses_data:
            Course.objects.create(student=student, **course)
            
        return user

    def update(self, instance, validated_data):
        experiences_data = validated_data.pop('experiences', None)
        courses_data = validated_data.pop('courses', None)
        
        # Extrair dados do Student (se fornecidos)
        student_fields = ['full_name', 'enrollment', 'city', 'semester', 'github_url', 'linkedin_url', 'portfolio_url']
        student_data = {field: validated_data.pop(field) for field in student_fields if field in validated_data}
        
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualizar Perfil do Estudante
        student, _ = Student.objects.get_or_create(user=instance)
        for attr, value in student_data.items():
            setattr(student, attr, value)
        student.save()

        if experiences_data is not None:
            student.experiences.all().delete()
            for exp in experiences_data:
                Experience.objects.create(student=student, **exp)

        if courses_data is not None:
            student.courses.all().delete()
            for course in courses_data:
                Course.objects.create(student=student, **course)

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        try:
            student = instance.student_profile
            representation['full_name'] = student.full_name
            representation['enrollment'] = student.enrollment
            representation['city'] = student.city
            representation['semester'] = student.semester
            representation['github_url'] = student.github_url
            representation['linkedin_url'] = student.linkedin_url
            representation['portfolio_url'] = student.portfolio_url
            
            representation['experiences'] = ExperienceSerializer(student.experiences.all(), many=True).data
            representation['courses'] = CourseSerializer(student.courses.all(), many=True).data
        except Student.DoesNotExist:
            pass
        return representation
