from django.db import models
from django.contrib.auth.models import User


class Job(models.Model):
    """Job listing for recommendations."""

    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('freelance', 'Freelance'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, default='')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    work_mode = models.CharField(max_length=50, blank=True, default='On-site')
    experience_level = models.CharField(max_length=100, blank=True, default='1-3 Yrs Exp')
    salary_display = models.CharField(max_length=100, blank=True, default='')
    source = models.CharField(max_length=50, blank=True, default='LinkedIn')
    posted_time_text = models.CharField(max_length=50, blank=True, default='Just now')
    description = models.TextField(default='')
    requirements = models.JSONField(default=list)
    salary_min = models.PositiveIntegerField(default=0)
    salary_max = models.PositiveIntegerField(default=0)
    url = models.URLField(blank=True, default='')
    posted_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

    class Meta:
        ordering = ['-posted_at']


class JobRecommendation(models.Model):
    """AI-generated job recommendation for a user."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_recommendations')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='recommendations')
    match_score = models.FloatField(default=0.0)
    matching_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    recommended_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.job.title} ({self.match_score}%)"

    class Meta:
        unique_together = ['user', 'job']
        ordering = ['-match_score']
