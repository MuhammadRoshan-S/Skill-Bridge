from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Skill, SkillCategory, JobRole, UserSkill, SkillGapAnalysis
from .serializers import (
    SkillSerializer, SkillCategorySerializer, JobRoleSerializer,
    JobRoleListSerializer, UserSkillSerializer, SkillGapAnalysisSerializer
)


class SkillListView(generics.ListAPIView):
    """List all skills, optionally filtered by category."""
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Skill.objects.select_related('category').all()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class SkillCategoryListView(generics.ListAPIView):
    """List all skill categories."""
    serializer_class = SkillCategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = SkillCategory.objects.all()


class JobRoleListView(generics.ListAPIView):
    """List all job roles."""
    serializer_class = JobRoleListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = JobRole.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        industry = self.request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        return queryset


class JobRoleDetailView(generics.RetrieveAPIView):
    """Get details for a specific job role."""
    serializer_class = JobRoleSerializer
    permission_classes = [IsAuthenticated]
    queryset = JobRole.objects.prefetch_related('requirements__skill').all()


class UserSkillsView(generics.ListCreateAPIView):
    """List or add user skills."""
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(
            user=self.request.user
        ).select_related('skill', 'skill__category')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSkillDeleteView(generics.DestroyAPIView):
    """Delete a user skill."""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)


class SkillGapAnalyzeView(APIView):
    """Run AI skill gap analysis for a target role (preset or custom)."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_role_id = request.data.get('target_role_id')
        custom_role = request.data.get('custom_role') or request.data.get('custom_role_title')
        
        target_role = None
        if target_role_id:
            if isinstance(target_role_id, int) or (isinstance(target_role_id, str) and target_role_id.isdigit()):
                target_role = JobRole.objects.filter(pk=int(target_role_id)).first()
            elif isinstance(target_role_id, str) and not target_role_id.isdigit():
                custom_role = target_role_id
                
        if not target_role and custom_role:
            custom_title = str(custom_role).strip()
            from ai_service.validators import is_valid_job_role_title
            is_valid, validation_msg = is_valid_job_role_title(custom_title)
            if not is_valid:
                return Response(
                    {'error': f"Invalid role title: {validation_msg} Please enter a recognized profession (e.g. 'Senior Frontend Engineer')."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            target_role, _ = JobRole.objects.get_or_create(
                title=custom_title,
                defaults={
                    'description': f'Custom targeted role: {custom_title}',
                    'industry': 'Technology',
                    'experience_level': 'mid',
                }
            )
        
        if not target_role:
            return Response(
                {'error': 'A valid target_role_id or custom_role title is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Free-tier quota optimization: check if recent analysis exists for this role
        force_refresh = request.data.get('force_refresh', False)
        existing_gap = SkillGapAnalysis.objects.filter(
            user=request.user,
            target_role=target_role
        ).order_by('-analyzed_at').first()

        if existing_gap and not force_refresh:
            serializer = SkillGapAnalysisSerializer(existing_gap)
            return Response(serializer.data, status=status.HTTP_200_OK)

        from ai_service.service import analyze_skill_gap
        from resumes.models import Resume
        
        try:
            user_skills = list(
                UserSkill.objects.filter(user=request.user)
                .values_list('skill__name', flat=True)
            )
            
            # Aggregate skills from active resume analysis if available
            active_resume = Resume.objects.filter(
                user=request.user, is_active=True
            ).select_related('analysis').first()
            
            if active_resume and hasattr(active_resume, 'analysis') and active_resume.analysis.extracted_skills:
                for sk in active_resume.analysis.extracted_skills:
                    if sk not in user_skills:
                        user_skills.append(sk)
            
            gap_data = analyze_skill_gap(user_skills, target_role)
            
            analysis = SkillGapAnalysis.objects.create(
                user=request.user,
                target_role=target_role,
                **gap_data
            )
            
            # Update user profile target role
            if hasattr(request.user, 'profile'):
                profile = request.user.profile
                profile.target_role = target_role
                profile.save(update_fields=['target_role'])
            
            serializer = SkillGapAnalysisSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Skill gap analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LatestSkillGapView(APIView):
    """Get the latest skill gap analysis for the user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        analysis = SkillGapAnalysis.objects.filter(
            user=request.user
        ).order_by('-analyzed_at').first()
        
        if not analysis:
            return Response(
                {'error': 'No skill gap analysis found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SkillGapAnalysisSerializer(analysis)
        return Response(serializer.data)
