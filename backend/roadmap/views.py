from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from .models import LearningRoadmap, RoadmapMilestone, LearningResource, UserResourceProgress
from .serializers import (
    LearningRoadmapSerializer, LearningRoadmapListSerializer,
    RoadmapMilestoneSerializer, LearningResourceSerializer,
    UserResourceProgressSerializer
)


class RoadmapGenerateView(APIView):
    """Generate an AI-powered learning roadmap."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_role_id = request.data.get('target_role_id')
        custom_role = request.data.get('custom_role') or request.data.get('custom_role_title')
        
        from skills.models import JobRole, UserSkill
        from resumes.models import Resume
        
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
                    {'error': f"Invalid role title: {validation_msg} Please enter a recognized profession."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            target_role, _ = JobRole.objects.get_or_create(
                title=custom_title,
                defaults={
                    'description': f'Custom targeted learning pathway for {custom_title}',
                    'industry': 'Technology',
                    'experience_level': 'mid',
                }
            )

        if not target_role:
            if hasattr(request.user, 'profile') and request.user.profile.target_role:
                target_role = request.user.profile.target_role
            else:
                return Response(
                    {'error': 'A valid target_role_id or custom_role is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Free-tier quota optimization: check if roadmap already exists for this role
        force_refresh = request.data.get('force_refresh', False)
        existing_roadmap = LearningRoadmap.objects.filter(
            user=request.user,
            target_role=target_role,
            is_active=True
        ).prefetch_related('milestones__resources').first()

        if existing_roadmap and not force_refresh:
            serializer = LearningRoadmapSerializer(existing_roadmap)
            return Response(serializer.data, status=status.HTTP_200_OK)

        from ai_service.service import generate_learning_roadmap
        
        try:
            user_skills = list(
                UserSkill.objects.filter(user=request.user)
                .values_list('skill__name', flat=True)
            )
            
            # Aggregate skills from active resume analysis
            active_resume = Resume.objects.filter(
                user=request.user, is_active=True
            ).select_related('analysis').first()
            
            if active_resume and hasattr(active_resume, 'analysis') and active_resume.analysis.extracted_skills:
                for sk in active_resume.analysis.extracted_skills:
                    if sk not in user_skills:
                        user_skills.append(sk)
            
            roadmap_data = generate_learning_roadmap(user_skills, target_role)
            
            # Deactivate old roadmaps
            LearningRoadmap.objects.filter(
                user=request.user, is_active=True
            ).update(is_active=False)
            
            # Create roadmap
            roadmap = LearningRoadmap.objects.create(
                user=request.user,
                target_role=target_role,
                title=roadmap_data.get('title', f'Roadmap to {target_role.title}'),
                description=roadmap_data.get('description', ''),
                estimated_weeks=roadmap_data.get('estimated_weeks', 12),
                is_active=True
            )
            
            # Create milestones and resources
            for i, ms_data in enumerate(roadmap_data.get('milestones', [])):
                milestone = RoadmapMilestone.objects.create(
                    roadmap=roadmap,
                    title=ms_data.get('title', f'Phase {i+1}'),
                    description=ms_data.get('description', ''),
                    order=i,
                    estimated_hours=ms_data.get('estimated_hours', 20),
                )
                
                for res_data in ms_data.get('resources', []):
                    from skills.models import Skill
                    skill = None
                    skill_name = res_data.get('skill_name')
                    if skill_name:
                        skill, _ = Skill.objects.get_or_create(
                            name=skill_name,
                            defaults={'difficulty_level': 'intermediate'}
                        )
                    
                    LearningResource.objects.create(
                        title=res_data.get('title', ''),
                        description=res_data.get('description', ''),
                        url=res_data.get('url', ''),
                        resource_type=res_data.get('resource_type', 'course'),
                        provider=res_data.get('provider', ''),
                        skill=skill,
                        difficulty=res_data.get('difficulty', 'beginner'),
                        estimated_hours=res_data.get('estimated_hours', 5),
                        is_free=res_data.get('is_free', True),
                        rating=res_data.get('rating', 4.0),
                        milestone=milestone,
                    )
            
            serializer = LearningRoadmapSerializer(roadmap)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Roadmap generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RoadmapListView(generics.ListAPIView):
    """List user's roadmaps."""
    serializer_class = LearningRoadmapListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LearningRoadmap.objects.filter(user=self.request.user)


class RoadmapDetailView(generics.RetrieveAPIView):
    """Get a specific roadmap with milestones."""
    serializer_class = LearningRoadmapSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LearningRoadmap.objects.filter(
            user=self.request.user
        ).prefetch_related('milestones__resources')


class ActiveRoadmapView(APIView):
    """Get the active roadmap."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        roadmap = LearningRoadmap.objects.filter(
            user=request.user, is_active=True
        ).prefetch_related('milestones__resources').first()
        
        if not roadmap:
            return Response(
                {'error': 'No active roadmap found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = LearningRoadmapSerializer(roadmap)
        return Response(serializer.data)


class MilestoneCompleteView(APIView):
    """Toggle milestone completion."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            milestone = RoadmapMilestone.objects.get(
                pk=pk, roadmap__user=request.user
            )
        except RoadmapMilestone.DoesNotExist:
            return Response(
                {'error': 'Milestone not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        milestone.is_completed = not milestone.is_completed
        milestone.completed_at = timezone.now() if milestone.is_completed else None
        milestone.save()
        
        serializer = RoadmapMilestoneSerializer(milestone)
        return Response(serializer.data)


class ResourceListView(generics.ListAPIView):
    """List learning resources, optionally filtered."""
    serializer_class = LearningResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = LearningResource.objects.select_related('skill').all()
        skill = self.request.query_params.get('skill')
        if skill:
            queryset = queryset.filter(skill__name__icontains=skill)
        resource_type = self.request.query_params.get('type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        return queryset


class ResourceProgressUpdateView(APIView):
    """Update user progress on a resource."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            resource = LearningResource.objects.get(pk=pk)
        except LearningResource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        progress, created = UserResourceProgress.objects.get_or_create(
            user=request.user,
            resource=resource,
            defaults={'status': 'in_progress', 'started_at': timezone.now()}
        )
        
        new_status = request.data.get('status', progress.status)
        progress_pct = request.data.get('progress_percentage', progress.progress_percentage)
        
        progress.status = new_status
        progress.progress_percentage = progress_pct
        
        if new_status == 'in_progress' and not progress.started_at:
            progress.started_at = timezone.now()
        elif new_status == 'completed':
            progress.completed_at = timezone.now()
            progress.progress_percentage = 100
        
        progress.save()
        
        serializer = UserResourceProgressSerializer(progress)
        return Response(serializer.data)
