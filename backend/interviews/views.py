from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg
from .models import InterviewSession, InterviewQuestion, InterviewAnswer
from .serializers import (
    InterviewSessionSerializer, InterviewSessionListSerializer,
    SubmitAnswerSerializer, InterviewAnswerSerializer
)


class InterviewSessionCreateView(APIView):
    """Create a new AI-powered interview session."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_type = request.data.get('session_type', 'technical')
        target_role_id = request.data.get('target_role_id')
        num_questions = request.data.get('num_questions', 5)
        
        from skills.models import JobRole, UserSkill
        
        target_role = None
        if target_role_id:
            try:
                target_role = JobRole.objects.get(pk=target_role_id)
            except JobRole.DoesNotExist:
                return Response(
                    {'error': 'Job role not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif hasattr(request.user, 'profile') and request.user.profile.target_role:
            target_role = request.user.profile.target_role
        
        from ai_service.service import generate_interview_questions
        
        try:
            user_skills = list(
                UserSkill.objects.filter(user=request.user)
                .values_list('skill__name', flat=True)
            )
            
            questions_data = generate_interview_questions(
                user_skills, target_role, session_type, num_questions
            )
            
            session = InterviewSession.objects.create(
                user=request.user,
                target_role=target_role,
                session_type=session_type,
                total_questions=len(questions_data),
                status='in_progress'
            )
            
            for i, q_data in enumerate(questions_data):
                InterviewQuestion.objects.create(
                    session=session,
                    question_text=q_data.get('question', ''),
                    question_type=q_data.get('type', session_type),
                    difficulty=q_data.get('difficulty', 'medium'),
                    topic=q_data.get('topic', ''),
                    order=i + 1,
                    hints=q_data.get('hints', []),
                    expected_points=q_data.get('expected_points', []),
                )
            
            serializer = InterviewSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': f'Interview session creation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterviewSessionListView(generics.ListAPIView):
    """List user's interview sessions."""
    serializer_class = InterviewSessionListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return InterviewSession.objects.filter(user=self.request.user)


class InterviewSessionDetailView(generics.RetrieveAPIView):
    """Get a specific interview session with questions."""
    serializer_class = InterviewSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return InterviewSession.objects.filter(
            user=self.request.user
        ).prefetch_related('questions__answer')


class SubmitAnswerView(APIView):
    """Submit an answer to an interview question and get AI feedback."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        question_id = serializer.validated_data['question_id']
        user_answer = serializer.validated_data['user_answer']
        
        try:
            question = InterviewQuestion.objects.get(
                pk=question_id, session__user=request.user
            )
        except InterviewQuestion.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already answered
        if hasattr(question, 'answer'):
            return Response(
                {'error': 'This question has already been answered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from ai_service.service import evaluate_interview_answer
        
        try:
            feedback = evaluate_interview_answer(question, user_answer)
            
            answer = InterviewAnswer.objects.create(
                question=question,
                user_answer=user_answer,
                ai_feedback=feedback.get('feedback', ''),
                score=feedback.get('score', 0),
                strengths=feedback.get('strengths', []),
                improvements=feedback.get('improvements', []),
            )
            
            # Update session progress
            session = question.session
            session.completed_questions += 1
            
            # Recalculate average score
            avg = InterviewAnswer.objects.filter(
                question__session=session
            ).aggregate(avg_score=Avg('score'))
            session.average_score = avg['avg_score'] or 0
            
            if session.completed_questions >= session.total_questions:
                session.status = 'completed'
                session.completed_at = timezone.now()
            
            session.save()
            
            answer_serializer = InterviewAnswerSerializer(answer)
            return Response(answer_serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Answer evaluation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
