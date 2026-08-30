from django.contrib import admin
from .models import SkillCategory, Skill, JobRole, RoleRequirement, UserSkill, SkillGapAnalysis

@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'difficulty_level']
    list_filter = ['category', 'difficulty_level']
    search_fields = ['name']

@admin.register(JobRole)
class JobRoleAdmin(admin.ModelAdmin):
    list_display = ['title', 'industry', 'experience_level', 'avg_salary_min', 'avg_salary_max']
    list_filter = ['experience_level', 'industry']
    search_fields = ['title']

@admin.register(RoleRequirement)
class RoleRequirementAdmin(admin.ModelAdmin):
    list_display = ['role', 'skill', 'importance', 'proficiency_required']
    list_filter = ['importance']

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'proficiency_level', 'source', 'verified']
    list_filter = ['proficiency_level', 'source', 'verified']

@admin.register(SkillGapAnalysis)
class SkillGapAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_role', 'match_percentage', 'analyzed_at']
