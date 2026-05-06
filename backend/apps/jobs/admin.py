from django.contrib import admin
from .models import Company, Job

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'cnpj', 'recruiter')
    search_fields = ('name', 'cnpj')

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'status', 'level', 'created_at')
    list_filter = ('status', 'level', 'location_type', 'contract_type')
    search_fields = ('title', 'description', 'company__name')
    date_hierarchy = 'created_at'
