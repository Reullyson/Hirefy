# Generated migration for Application model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('jobs', '0004_company_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('PENDENTE', 'Pendente'), ('ACEITA', 'Aceita'), ('REJEITADA', 'Rejeitada'), ('RETIRADA', 'Retirada')], default='PENDENTE', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='jobs.job')),
                ('student', models.ForeignKey(limit_choices_to={'user_type': 'ALUNO'}, on_delete=django.db.models.deletion.CASCADE, related_name='applications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Candidatura',
                'verbose_name_plural': 'Candidaturas',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='application',
            constraint=models.UniqueConstraint(fields=('job', 'student'), name='unique_job_student_application'),
        ),
    ]
