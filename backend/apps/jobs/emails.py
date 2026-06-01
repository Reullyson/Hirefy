from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_hirefy_email(subject, template_name, context, to_email):
    """
    Helper function to send HTML emails with Hirefy branding.
    """
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [to_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_application_confirmation(application):
    """
    Sends an email to the student confirming their application.
    """
    subject = f"Candidatura confirmada: {application.job.title}"
    context = {
        'student_name': application.student.full_name,
        'job_title': application.job.title,
        'company_name': application.job.company.name,
        'application_date': application.created_at,
    }
    send_hirefy_email(
        subject,
        'emails/application_confirmation.html',
        context,
        application.student.user.email
    )

def send_application_status_update(application):
    """
    Sends an email to the student when their application status changes.
    """
    status_display = dict(application.STATUS_CHOICES).get(application.status, application.status)
    subject = f"Atualização na sua candidatura: {application.job.title}"
    context = {
        'student_name': application.student.full_name,
        'job_title': application.job.title,
        'company_name': application.job.company.name,
        'new_status': status_display,
    }
    send_hirefy_email(
        subject,
        'emails/application_status_update.html',
        context,
        application.student.user.email
    )

def send_job_closed_notification(application):
    """
    Sends an email to the student when a job they applied for is closed.
    """
    subject = f"Vaga encerrada: {application.job.title}"
    context = {
        'student_name': application.student.full_name,
        'job_title': application.job.title,
        'company_name': application.job.company.name,
    }
    send_hirefy_email(
        subject,
        'emails/job_closed.html',
        context,
        application.student.user.email
    )

def send_job_update_notification(application, changed_fields=None):
    """
    Sends an email to the student when a job they applied for is updated.
    """
    subject = f"Atualização na vaga: {application.job.title}"
    context = {
        'student_name': application.student.full_name,
        'job_title': application.job.title,
        'company_name': application.job.company.name,
    }
    send_hirefy_email(
        subject,
        'emails/job_updated.html',
        context,
        application.student.user.email
    )
