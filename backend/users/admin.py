from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'target_role', 'years_experience', 'career_readiness_score']
    list_filter = ['education_level', 'years_experience']
    search_fields = ['user__username', 'user__email', 'location']
