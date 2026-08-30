from rest_framework import serializers
from .models import SkillCategory, Skill, JobRole, RoleRequirement, UserSkill, SkillGapAnalysis


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'icon', 'color']


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_name', 'description', 'difficulty_level']


class RoleRequirementSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    
    class Meta:
        model = RoleRequirement
        fields = ['id', 'skill', 'skill_name', 'importance', 'proficiency_required']


class JobRoleSerializer(serializers.ModelSerializer):
    requirements = RoleRequirementSerializer(many=True, read_only=True)
    requirements_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobRole
        fields = [
            'id', 'title', 'description', 'industry', 'experience_level',
            'avg_salary_min', 'avg_salary_max', 'requirements', 'requirements_count'
        ]
    
    def get_requirements_count(self, obj):
        return obj.requirements.count()


class JobRoleListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    class Meta:
        model = JobRole
        fields = ['id', 'title', 'industry', 'experience_level']


class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category_name = serializers.CharField(source='skill.category.name', read_only=True, default='')
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'skill_name', 'category_name',
            'proficiency_level', 'source', 'verified', 'added_at'
        ]
        read_only_fields = ['id', 'added_at']


class SkillGapAnalysisSerializer(serializers.ModelSerializer):
    target_role_title = serializers.CharField(source='target_role.title', read_only=True)
    
    class Meta:
        model = SkillGapAnalysis
        fields = [
            'id', 'target_role', 'target_role_title', 'matched_skills',
            'missing_skills', 'match_percentage', 'recommendations', 'analyzed_at'
        ]
        read_only_fields = fields
