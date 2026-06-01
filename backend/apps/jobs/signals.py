from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Job, Application
from .emails import (
    send_application_confirmation, 
    send_application_status_update,
    send_job_closed_notification,
    send_job_update_notification
)

@receiver(post_save, sender=Application)
def application_post_save(sender, instance, created, **kwargs):
    if created:
        send_application_confirmation(instance)

@receiver(pre_save, sender=Application)
def application_pre_save(sender, instance, **kwargs):
    if instance.pk:
        previous = Application.objects.get(pk=instance.pk)
        if previous.status != instance.status:
            instance._status_changed = True
        else:
            instance._status_changed = False

@receiver(post_save, sender=Application)
def application_status_signal(sender, instance, created, **kwargs):
    if not created and getattr(instance, '_status_changed', False):
        send_application_status_update(instance)

@receiver(pre_save, sender=Job)
def job_pre_save(sender, instance, **kwargs):
    if instance.pk:
        previous = Job.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
        
        # Check for relevant updates (title or description)
        if previous.title != instance.title or previous.description != instance.description:
            instance._relevant_update = True
        else:
            instance._relevant_update = False

@receiver(post_save, sender=Job)
def job_post_save(sender, instance, created, **kwargs):
    if not created:
        # Case 1: Job closed
        if getattr(instance, '_previous_status', None) != 'ENCERRADA' and instance.status == 'ENCERRADA':
            for application in instance.applications.all():
                send_job_closed_notification(application)
        
        # Case 2: Relevant update
        elif getattr(instance, '_relevant_update', False) and instance.status == 'ATIVA':
            for application in instance.applications.all():
                send_job_update_notification(application)
