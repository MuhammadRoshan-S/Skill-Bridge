from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile with career-related information."""

    EDUCATION_CHOICES = [
        ('high_school', 'High School'),
        ('associate', 'Associate Degree'),
        ('bachelor', "Bachelor's Degree"),
        ('master', "Master's Degree"),
        ('phd', 'PhD'),
        ('bootcamp', 'Bootcamp'),
        ('self_taught', 'Self-Taught'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    location = models.CharField(max_length=100, blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')
    github_url = models.URLField(blank=True, default='')
    portfolio_url = models.URLField(blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    target_role = models.ForeignKey(
        'skills.JobRole', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='targeting_users'
    )
    years_experience = models.PositiveIntegerField(default=0)
    education_level = models.CharField(
        max_length=20, choices=EDUCATION_CHOICES,
        blank=True, default=''
    )
    career_readiness_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        ordering = ['-created_at']


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create a UserProfile when a User is created."""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Auto-save UserProfile when User is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
