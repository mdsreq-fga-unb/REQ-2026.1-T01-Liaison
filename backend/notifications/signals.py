from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from applications.models import Application


@receiver(pre_save, sender=Application)
def _cache_old_status(sender, instance, **kwargs):
    """Guarda o status anterior no objeto para que post_save possa comparar."""
    if instance.pk:
        try:
            instance._old_status = sender.objects.get(pk=instance.pk).status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Application)
def _create_application_notifications(sender, instance, created, **kwargs):
    from notifications.models import Notification

    opportunity = instance.opportunity

    if created:
        student_name = instance.student.user.nome
        Notification.objects.create(
            recipient=opportunity.organization.user,
            type=Notification.Type.NEW_APPLICATION,
            title="Nova candidatura",
            message=f"{student_name} se candidatou para {opportunity.title}",
            related_opportunity=opportunity,
            related_application=instance,
        )
        return

    old_status = getattr(instance, "_old_status", None)
    new_status = instance.status

    if old_status == new_status:
        return

    student_user = instance.student.user

    if new_status == Application.Status.APPROVED:
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_APPROVED,
            title="Candidatura aprovada",
            message=f"Sua candidatura para {opportunity.title} foi aprovada!",
            related_opportunity=opportunity,
            related_application=instance,
        )
    elif new_status == Application.Status.REJECTED:
        Notification.objects.create(
            recipient=student_user,
            type=Notification.Type.APPLICATION_REJECTED,
            title="Candidatura recusada",
            message=f"Sua candidatura para {opportunity.title} foi recusada",
            related_opportunity=opportunity,
            related_application=instance,
        )
