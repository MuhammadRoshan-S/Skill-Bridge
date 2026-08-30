from django.db import models
from django.contrib.auth.models import User


class SkillCategory(models.Model):
    """Grouping for skills (e.g., Programming Languages, Frameworks)."""

    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, default='')
    color = models.CharField(max_length=7, blank=True, default='#6366f1')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Skill categories'
        ordering = ['name']


class Skill(models.Model):
    """Individual skill (e.g., Python, React, AWS)."""

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(
        SkillCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='skills'
    )
    description = models.TextField(blank=True, default='')
    difficulty_level = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES,
        default='intermediate'
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class JobRole(models.Model):
    """Target job role (e.g., Frontend Developer, Data Scientist)."""

    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead / Principal'),
        ('executive', 'Executive'),
    ]

    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    experience_level = models.CharField(
        max_length=20, choices=EXPERIENCE_CHOICES,
        default='mid'
    )
    avg_salary_min = models.PositiveIntegerField(default=0)
    avg_salary_max = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['title']


class RoleRequirement(models.Model):
    """Skill requirement for a specific job role."""

    IMPORTANCE_CHOICES = [
        ('critical', 'Critical'),
        ('important', 'Important'),
        ('nice_to_have', 'Nice to Have'),
    ]

    role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name='requirements')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='role_requirements')
    importance = models.CharField(
        max_length=20, choices=IMPORTANCE_CHOICES,
        default='important'
    )
    proficiency_required = models.CharField(
        max_length=20, choices=Skill.DIFFICULTY_CHOICES,
        default='intermediate'
    )

    def __str__(self):
        return f"{self.role.title} requires {self.skill.name} ({self.importance})"

    class Meta:
        unique_together = ['role', 'skill']
        ordering = ['importance']


class UserSkill(models.Model):
    """A skill associated with a specific user."""

    SOURCE_CHOICES = [
        ('resume', 'Extracted from Resume'),
        ('manual', 'Manually Added'),
        ('assessment', 'From Assessment'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_skills')
    proficiency_level = models.CharField(
        max_length=20, choices=Skill.DIFFICULTY_CHOICES,
        default='beginner'
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='resume')
    verified = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.proficiency_level})"

    class Meta:
        unique_together = ['user', 'skill']
        ordering = ['-added_at']


class SkillGapAnalysis(models.Model):
    """AI-generated skill gap analysis comparing user skills vs target role."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_gap_analyses')
    target_role = models.ForeignKey(JobRole, on_delete=models.CASCADE, related_name='gap_analyses')
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    match_percentage = models.FloatField(default=0.0)
    recommendations = models.JSONField(default=list)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.target_role.title} ({self.match_percentage}%)"

    class Meta:
        verbose_name_plural = 'Skill gap analyses'
        ordering = ['-analyzed_at']
