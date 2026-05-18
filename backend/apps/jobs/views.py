from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings

from .models import Company, Job, Application
from .serializers import CompanySerializer, JobSerializer, JobListSerializer, ApplicationSerializer
from .permissions import IsRecruiterOrAdmin, IsOwnerRecruiterOrAdmin


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'ADMIN':
            return Company.objects.all()

        if user.user_type == 'RECRUTADOR':
            return Company.objects.filter(recruiter=user)

        return Company.objects.filter(status='APROVADA')

    def perform_create(self, serializer):
        serializer.save(
            recruiter=self.request.user,
            status='PENDENTE'
        )

    @action(detail=True, methods=['patch'])
    def aprovar(self, request, pk=None):
        company = self.get_object()
        company.status = 'APROVADA'
        company.save()
        return Response({'message': 'Empresa aprovada'})

    @action(detail=True, methods=['patch'])
    def rejeitar(self, request, pk=None):
        company = self.get_object()
        company.status = 'REJEITADA'
        company.save()
        return Response({'message': 'Empresa rejeitada'})


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    permission_classes = [IsRecruiterOrAdmin, IsOwnerRecruiterOrAdmin]

    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Job.objects.filter(status='ATIVA')

        if user.user_type == 'ADMIN':
            return Job.objects.all()

        if user.user_type == 'RECRUTADOR':
            return Job.objects.filter(company__recruiter=user)

        return Job.objects.filter(
            status='ATIVA',
            company__status='APROVADA'
        )

    def perform_create(self, serializer):
        try:
            company = self.request.user.company

            if company.status != 'APROVADA':
                raise ValidationError(
                    "Sua empresa precisa ser homologada antes de publicar vagas."
                )

            serializer.save(company=company)

        except Company.DoesNotExist:
            raise ValidationError(
                "O recrutador precisa cadastrar uma empresa."
            )

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsRecruiterOrAdmin])
    def import_gupy(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'detail': 'URL é obrigatória.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if 'gupy.io' not in url:
            return Response({'detail': 'URL inválida. Deve ser um link da Gupy.'}, status=status.HTTP_400_BAD_REQUEST)

        # TODO: Implementar motor de scraping real na Fase 3.
        # Por enquanto, retornamos um mock para demonstração do fluxo no frontend.
        
        # Simulação de extração de dados (Mock)
        # Em uma implementação real, usaríamos BeautifulSoup ou Selenium/Playwright
        mock_data = {
            'title': 'Desenvolvedor Full Stack (Exemplo Gupy)',
            'description': 'Esta é uma vaga importada da Gupy. Responsabilidades incluem o desenvolvimento de APIs e interfaces modernas.',
            'requirements_mandatory': 'Python, Django, React, TypeScript.',
            'requirements_desirable': 'Experiência com Docker e AWS.',
            'benefits': 'Vale Refeição, Plano de Saúde, Home Office.',
            'location_type': 'REMOTO',
            'level': 'PLENO',
        }
        
        return Response(mock_data)

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.none()

        if user.user_type == 'ADMIN':
            queryset = Application.objects.all()
        elif user.user_type == 'RECRUTADOR':
            queryset = Application.objects.filter(job__company__recruiter=user)
        elif user.user_type == 'ALUNO':
            queryset = Application.objects.filter(student__user=user)
            
        job_id = self.request.query_params.get('job', None)
        if job_id is not None:
            queryset = queryset.filter(job_id=job_id)
            
        return queryset

    def perform_create(self, serializer):
        # Link the application to the authenticated student
        try:
            student = self.request.user.student_profile
            instance = serializer.save(student=student)
            self.send_confirmation_email(instance)
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(f"Erro ao processar candidatura: {str(e)}")

    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Check if status was changed
        if 'status' in serializer.validated_data:
            self.send_status_update_email(instance)

    def send_confirmation_email(self, application):
        subject = f'Confirmação de Inscrição - {application.job.title} - {application.job.company.name}'
        message = f'''
Prezado(a) {application.student.full_name},

Confirmamos o recebimento de sua candidatura para a vaga de "{application.job.title}" na empresa {application.job.company.name}.

Informamos que seu perfil foi encaminhado para a equipe de recrutamento e será analisado de acordo com os requisitos da posição. Novas atualizações sobre o andamento do processo seletivo serão enviadas para este endereço de e-mail.

Agradecemos o seu interesse em fazer parte da equipe {application.job.company.name}.

Atenciosamente,
Equipe de Recrutamento Hirefy
        '''
        recipient_list = [application.student.user.email]
        self._send_mail_safe(subject, message, recipient_list)

    def send_status_update_email(self, application):
        status_display = application.get_status_display()
        company_name = application.job.company.name
        job_title = application.job.title
        student_name = application.student.full_name
        
        if application.status == 'APROVADO':
            subject = f'Aprovação em Processo Seletivo: {job_title} - {company_name}'
            message = f'''
Prezado(a) {student_name},

É com satisfação que comunicamos sua aprovação no processo seletivo para a vaga de "{job_title}" na empresa {company_name}.

A equipe de Recursos Humanos da {company_name} entrará em contato em breve para tratar dos procedimentos de contratação e próximos passos. Recomendamos que mantenha seus contatos atualizados e acompanhe suas comunicações.

Parabenizamos você por esta conquista e desejamos sucesso nesta nova etapa profissional.

Atenciosamente,
Equipe de Recrutamento Hirefy
            '''
        elif application.status == 'REPROVADO':
            subject = f'Comunicado sobre Processo Seletivo: {job_title} - {company_name}'
            message = f'''
Prezado(a) {student_name},

Agradecemos sua participação no processo seletivo para a vaga de "{job_title}" na empresa {company_name}.

Após uma análise criteriosa dos perfis, informamos que optamos por seguir com outros candidatos cujas qualificações estão mais alinhadas aos requisitos técnicos específicos desta posição no momento.

Ressaltamos que seu currículo permanecerá em nosso banco de talentos para futuras oportunidades na {company_name} ou em outras empresas parceiras da plataforma Hirefy.

Desejamos sucesso em sua trajetória e agradecemos novamente o interesse demonstrado.

Atenciosamente,
Equipe de Recrutamento Hirefy
            '''
        else:
            # Para status como 'EM_ANALISE' ou outros
            subject = f'Atualização de Status de Candidatura: {job_title} - {company_name}'
            message = f'''
Prezado(a) {student_name},

Informamos que houve uma atualização no status da sua candidatura para a vaga de "{job_title}" na empresa {company_name}.

Status Atual: {status_display}

Sugerimos que continue acompanhando o andamento do processo através da plataforma Hirefy.

Atenciosamente,
Equipe de Recrutamento Hirefy
            '''

        recipient_list = [application.student.user.email]
        self._send_mail_safe(subject, message, recipient_list)

    def _send_mail_safe(self, subject, message, recipient_list):
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
