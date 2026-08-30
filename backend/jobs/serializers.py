from rest_framework import serializers
from .models import Job, JobRecommendation


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'job_type',
            'work_mode', 'experience_level', 'salary_display', 'source', 'posted_time_text',
            'description', 'requirements', 'salary_min', 'salary_max',
            'url', 'posted_at', 'is_active'
        ]


class JobRecommendationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = JobRecommendation
        fields = [
            'id', 'job', 'match_score', 'matching_skills',
            'missing_skills', 'recommended_at'
        ]
        read_only_fields = fields
