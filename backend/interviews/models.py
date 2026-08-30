from django.db import models
from django.contrib.auth.models import User


class InterviewSession(models.Model):
    """An AI-powered mock interview session."""

    SESSION_TYPE_CHOICES = [
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('system_design', 'System Design'),
        ('mixed', 'Mixed'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interview_sessions')
    target_role = models.ForeignKey(
        'skills.JobRole', on_delete=models.SET_NULL,
        null=True, related_name='interview_sessions'
    )
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default='technical')
    total_questions = models.PositiveIntegerField(default=5)
    completed_questions = models.PositiveIntegerField(default=0)
    average_score = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.session_type} Interview ({self.status})"

    @property
    def progress_percentage(self):
        if self.total_questions == 0:
            return 0
        return round((self.completed_questions / self.total_questions) * 100, 1)

    class Meta:
        ordering = ['-created_at']


class InterviewQuestion(models.Model):
    """A question within an interview session."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, default='technical')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    topic = models.CharField(max_length=100, default='')
    order = models.PositiveIntegerField(default=0)
    hints = models.JSONField(default=list)
    expected_points = models.JSONField(default=list)

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:60]}..."

    class Meta:
        ordering = ['order']


class InterviewAnswer(models.Model):
    """User's answer to an interview question with AI feedback."""

    question = models.OneToOneField(InterviewQuestion, on_delete=models.CASCADE, related_name='answer')
    user_answer = models.TextField()
    ai_feedback = models.TextField(default='')
    score = models.FloatField(default=0.0)
    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to Q{self.question.order} (Score: {self.score})"

    class Meta:
        ordering = ['question__order']
