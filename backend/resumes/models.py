import os
from django.db import models
from django.contrib.auth.models import User


def resume_upload_path(instance, filename):
    """Upload resumes to user-specific directories."""
    return f'resumes/user_{instance.user.id}/{filename}'


class Resume(models.Model):
    """Uploaded resume file."""

    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to=resume_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"

    def save(self, *args, **kwargs):
        # Deactivate other resumes for this user when a new one is set active
        if self.is_active:
            Resume.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-uploaded_at']


class ResumeAnalysis(models.Model):
    """AI-generated analysis of a resume."""

    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name='analysis')
    raw_text = models.TextField(default='')
    extracted_skills = models.JSONField(default=list)
    experience_summary = models.TextField(default='')
    education_summary = models.TextField(default='')
    overall_score = models.FloatField(default=0.0)
    content_score = models.FloatField(default=0.0)
    format_score = models.FloatField(default=0.0)
    impact_score = models.FloatField(default=0.0)
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis of {self.resume.original_filename} (Score: {self.overall_score})"

    class Meta:
        verbose_name_plural = 'Resume analyses'
