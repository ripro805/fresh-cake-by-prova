from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, CustomerProfile

@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    if created and not hasattr(instance, 'profile'):
        CustomerProfile.objects.create(user=instance)
