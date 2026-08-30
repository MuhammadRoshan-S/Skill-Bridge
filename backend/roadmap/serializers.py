from rest_framework import serializers
from .models import LearningRoadmap, RoadmapMilestone, LearningResource, UserResourceProgress


class LearningResourceSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True, default='')
    
    class Meta:
        model = LearningResource
        fields = [
            'id', 'title', 'description', 'url', 'resource_type',
            'provider', 'skill', 'skill_name', 'difficulty',
            'estimated_hours', 'is_free', 'rating', 'milestone'
        ]


class UserResourceProgressSerializer(serializers.ModelSerializer):
    resource = LearningResourceSerializer(read_only=True)
    
    class Meta:
        model = UserResourceProgress
        fields = [
            'id', 'resource', 'status', 'progress_percentage',
            'started_at', 'completed_at'
        ]


class RoadmapMilestoneSerializer(serializers.ModelSerializer):
    resources = LearningResourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = RoadmapMilestone
        fields = [
            'id', 'title', 'description', 'order', 'estimated_hours',
            'is_completed', 'completed_at', 'resources'
        ]
        read_only_fields = ['id']


class LearningRoadmapSerializer(serializers.ModelSerializer):
    milestones = RoadmapMilestoneSerializer(many=True, read_only=True)
    target_role_title = serializers.CharField(source='target_role.title', read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = LearningRoadmap
        fields = [
            'id', 'target_role', 'target_role_title', 'title',
            'description', 'estimated_weeks', 'is_active',
            'progress_percentage', 'milestones', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LearningRoadmapListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    target_role_title = serializers.CharField(source='target_role.title', read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = LearningRoadmap
        fields = [
            'id', 'target_role_title', 'title', 'estimated_weeks',
            'is_active', 'progress_percentage', 'created_at'
        ]
