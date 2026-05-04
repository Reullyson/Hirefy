from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student, Experience, Course

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Campos exibidos na listagem
    list_display = ('email', 'nome', 'user_type', 'is_staff', 'is_superuser')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'nome')
    ordering = ('email',)

    # Organização dos campos na tela de edição
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('nome', 'user_type')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('date_joined', 'last_login')}),
    )

    # Campos usados na criação de um novo usuário via Admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nome', 'password', 'user_type', 'is_staff', 'is_superuser'),
        }),
    )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'enrollment', 'city', 'semester')
    search_fields = ('full_name', 'enrollment')

admin.site.register(Experience)
admin.site.register(Course)
