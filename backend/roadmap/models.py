from django.db import models
from django.contrib.auth.models import User


class LearningRoadmap(models.Model):
    """AI-generated personalized learning roadmap."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roadmaps')
    target_role = models.ForeignKey(
        'skills.JobRole', on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(default='')
    estimated_weeks = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    @property
    def progress_percentage(self):
        milestones = self.milestones.all()
        if not milestones:
            return 0
        completed = milestones.filter(is_completed=True).count()
        return round((completed / milestones.count()) * 100, 1)

    class Meta:
        ordering = ['-created_at']


class RoadmapMilestone(models.Model):
    """A milestone/phase within a learning roadmap."""

    roadmap = models.ForeignKey(LearningRoadmap, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(default='')
    order = models.PositiveIntegerField(default=0)
    estimated_hours = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.roadmap.title} → {self.title}"

    class Meta:
        ordering = ['order']


class LearningResource(models.Model):
    """A learning resource (course, tutorial, book, etc.)."""

    RESOURCE_TYPE_CHOICES = [
        ('course', 'Online Course'),
        ('book', 'Book'),
        ('tutorial', 'Tutorial'),
        ('project', 'Project'),
        ('video', 'Video'),
        ('article', 'Article'),
        ('documentation', 'Documentation'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(default='')
    url = models.URLField(blank=True, default='')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, default='course')
    provider = models.CharField(max_length=100, blank=True, default='')
    skill = models.ForeignKey(
        'skills.Skill', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='resources'
    )
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_hours = models.PositiveIntegerField(default=0)
    is_free = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    milestone = models.ForeignKey(
        RoadmapMilestone, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='resources'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-rating']


class UserResourceProgress(models.Model):
    """User's progress on a learning resource."""

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resource_progress')
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    progress_percentage = models.FloatField(default=0.0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.resource.title} ({self.status})"

    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-started_at']
