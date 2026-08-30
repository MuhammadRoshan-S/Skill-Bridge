from django.contrib import admin
from .models import Job, JobRecommendation

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'job_type', 'is_active']
    list_filter = ['job_type', 'is_active']
    search_fields = ['title', 'company']

@admin.register(JobRecommendation)
class JobRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'match_score', 'recommended_at']
