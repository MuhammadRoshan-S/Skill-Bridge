from rest_framework import serializers
from .models import Resume, ResumeAnalysis


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for resume analysis results."""
    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'extracted_skills', 'experience_summary', 'education_summary',
            'overall_score', 'content_score', 'format_score', 'impact_score',
            'strengths', 'improvements', 'analyzed_at'
        ]
        read_only_fields = fields


class ResumeSerializer(serializers.ModelSerializer):
    """Serializer for resume data."""
    analysis = ResumeAnalysisSerializer(read_only=True)
    has_analysis = serializers.SerializerMethodField()
    
    class Meta:
        model = Resume
        fields = [
            'id', 'original_filename', 'file_type', 'uploaded_at',
            'is_active', 'analysis', 'has_analysis'
        ]
        read_only_fields = ['id', 'original_filename', 'file_type', 'uploaded_at']
    
    def get_has_analysis(self, obj):
        return hasattr(obj, 'analysis') and obj.analysis is not None


class ResumeUploadSerializer(serializers.ModelSerializer):
    """Serializer for resume upload."""
    file = serializers.FileField()
    
    class Meta:
        model = Resume
        fields = ['id', 'file']
    
    def validate_file(self, value):
        # Validate file type
        ext = value.name.split('.')[-1].lower()
        if ext not in ['pdf', 'docx']:
            raise serializers.ValidationError("Only PDF and DOCX files are supported.")
        # Validate file size (10MB max)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be under 10MB.")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        file = validated_data['file']
        ext = file.name.split('.')[-1].lower()
        
        resume = Resume.objects.create(
            user=user,
            file=file,
            original_filename=file.name,
            file_type=ext,
            is_active=True
        )
        return resume
