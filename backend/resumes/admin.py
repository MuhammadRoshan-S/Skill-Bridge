from django.contrib import admin
from .models import Resume, ResumeAnalysis

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'file_type', 'is_active', 'uploaded_at']
    list_filter = ['file_type', 'is_active']
    search_fields = ['user__username', 'original_filename']

@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = ['resume', 'overall_score', 'content_score', 'format_score', 'impact_score', 'analyzed_at']
    list_filter = ['analyzed_at']
