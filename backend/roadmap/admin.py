from django.contrib import admin
from .models import LearningRoadmap, RoadmapMilestone, LearningResource, UserResourceProgress

@admin.register(LearningRoadmap)
class LearningRoadmapAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'target_role', 'estimated_weeks', 'is_active', 'created_at']
    list_filter = ['is_active']

@admin.register(RoadmapMilestone)
class RoadmapMilestoneAdmin(admin.ModelAdmin):
    list_display = ['roadmap', 'title', 'order', 'estimated_hours', 'is_completed']
    list_filter = ['is_completed']

@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'resource_type', 'provider', 'difficulty', 'is_free', 'rating']
    list_filter = ['resource_type', 'difficulty', 'is_free']
    search_fields = ['title']

@admin.register(UserResourceProgress)
class UserResourceProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'status', 'progress_percentage']
    list_filter = ['status']
