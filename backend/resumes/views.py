from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from .models import Resume, ResumeAnalysis
from .serializers import ResumeSerializer, ResumeUploadSerializer, ResumeAnalysisSerializer


class ResumeUploadView(generics.CreateAPIView):
    """Upload a new resume."""
    serializer_class = ResumeUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume = serializer.save()
        
        output_serializer = ResumeSerializer(resume)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class ResumeListView(generics.ListAPIView):
    """List all resumes for the current user."""
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related('analysis')


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a specific resume."""
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related('analysis')


class ResumeAnalyzeView(APIView):
    """Trigger AI analysis of a resume."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Import and run AI analysis
        from ai_service.service import analyze_resume
        
        try:
            analysis_data = analyze_resume(resume)
            
            # Create or update analysis
            analysis, created = ResumeAnalysis.objects.update_or_create(
                resume=resume,
                defaults=analysis_data
            )
            
            # Update user skills based on extracted skills
            from skills.models import Skill, UserSkill
            for skill_name in analysis_data.get('extracted_skills', []):
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name,
                    defaults={'difficulty_level': 'intermediate'}
                )
                UserSkill.objects.update_or_create(
                    user=request.user,
                    skill=skill,
                    defaults={'source': 'resume', 'proficiency_level': 'intermediate'}
                )
            
            serializer = ResumeAnalysisSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResumeActivateView(APIView):
    """Set a specific resume as the active resume."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {'error': 'Resume not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Activate this resume (model's save handles deactivating others)
        resume.is_active = True
        resume.save()
        
        # If this resume has an analysis, sync user skills with extracted skills
        if hasattr(resume, 'analysis') and resume.analysis.extracted_skills:
            from skills.models import Skill, UserSkill
            for skill_name in resume.analysis.extracted_skills:
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name,
                    defaults={'difficulty_level': 'intermediate'}
                )
                UserSkill.objects.update_or_create(
                    user=request.user,
                    skill=skill,
                    defaults={'source': 'resume', 'proficiency_level': 'intermediate'}
                )
        
        serializer = ResumeSerializer(resume)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ActiveResumeAnalysisView(APIView):
    """Get the analysis of the user's active resume."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        resume = Resume.objects.filter(
            user=request.user, is_active=True
        ).select_related('analysis').first()
        
        if not resume:
            return Response(
                {'error': 'No active resume found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not hasattr(resume, 'analysis'):
            return Response(
                {'error': 'Resume has not been analyzed yet'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ResumeAnalysisSerializer(resume.analysis)
        return Response(serializer.data)
