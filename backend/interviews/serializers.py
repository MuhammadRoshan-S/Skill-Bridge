from rest_framework import serializers
from .models import InterviewSession, InterviewQuestion, InterviewAnswer


class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnswer
        fields = [
            'id', 'user_answer', 'ai_feedback', 'score',
            'strengths', 'improvements', 'submitted_at'
        ]
        read_only_fields = ['id', 'ai_feedback', 'score', 'strengths', 'improvements', 'submitted_at']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    answer = InterviewAnswerSerializer(read_only=True)
    is_answered = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'question_text', 'question_type', 'difficulty',
            'topic', 'order', 'hints', 'expected_points',
            'answer', 'is_answered'
        ]
        read_only_fields = fields
    
    def get_is_answered(self, obj):
        return hasattr(obj, 'answer')


class InterviewSessionSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    target_role_title = serializers.CharField(source='target_role.title', read_only=True, default='')
    progress_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'target_role', 'target_role_title', 'session_type',
            'total_questions', 'completed_questions', 'average_score',
            'status', 'progress_percentage', 'questions',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'total_questions', 'completed_questions', 'average_score',
            'status', 'created_at', 'completed_at'
        ]


class InterviewSessionListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    target_role_title = serializers.CharField(source='target_role.title', read_only=True, default='')
    progress_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'target_role_title', 'session_type', 'total_questions',
            'completed_questions', 'average_score', 'status',
            'progress_percentage', 'created_at'
        ]


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an interview answer."""
    question_id = serializers.IntegerField()
    user_answer = serializers.CharField(min_length=10)
