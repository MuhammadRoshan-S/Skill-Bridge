from django.contrib import admin
from .models import InterviewSession, InterviewQuestion, InterviewAnswer

@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_type', 'target_role', 'status', 'average_score', 'created_at']
    list_filter = ['session_type', 'status']

@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ['session', 'order', 'question_type', 'difficulty', 'topic']
    list_filter = ['difficulty', 'question_type']

@admin.register(InterviewAnswer)
class InterviewAnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'score', 'submitted_at']
