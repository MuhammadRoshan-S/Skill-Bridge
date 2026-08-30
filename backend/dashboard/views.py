from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Avg, Count

from resumes.models import Resume, ResumeAnalysis
from skills.models import UserSkill, SkillGapAnalysis
from roadmap.models import LearningRoadmap, UserResourceProgress
from interviews.models import InterviewSession
from jobs.models import JobRecommendation


class DashboardView(APIView):
    """Aggregated dashboard data for the current user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Resume data
        active_resume = Resume.objects.filter(user=user, is_active=True).first()
        resume_score = 0
        resume_data = None
        if active_resume and hasattr(active_resume, 'analysis'):
            analysis = active_resume.analysis
            resume_score = analysis.overall_score
            resume_data = {
                'filename': active_resume.original_filename,
                'score': analysis.overall_score,
                'content_score': analysis.content_score,
                'format_score': analysis.format_score,
                'impact_score': analysis.impact_score,
                'skills_count': len(analysis.extracted_skills),
            }
        
        # Profile & target role
        profile = getattr(user, 'profile', None)
        target_role = None
        career_readiness = 0
        if profile:
            career_readiness = profile.career_readiness_score
            if profile.target_role:
                target_role = {
                    'id': profile.target_role.id,
                    'title': profile.target_role.title,
                }
        
        # Skills data
        user_skills = UserSkill.objects.filter(user=user).select_related('skill')
        skills_count = user_skills.count()
        strong_skills = list(
            user_skills.filter(proficiency_level__in=['advanced', 'expert'])
            .values_list('skill__name', flat=True)[:5]
        )
        
        # Skill gap
        latest_gap = SkillGapAnalysis.objects.filter(user=user).order_by('-analyzed_at').first()
        skill_match = None
        missing_skills = []
        if latest_gap:
            skill_match = {
                'percentage': latest_gap.match_percentage,
                'matched': latest_gap.matched_skills[:5],
                'missing': latest_gap.missing_skills[:5],
                'role': latest_gap.target_role.title,
            }
            missing_skills = latest_gap.missing_skills[:5]
        
        # Learning progress
        active_roadmap = LearningRoadmap.objects.filter(
            user=user, is_active=True
        ).first()
        learning_progress = 0
        if active_roadmap:
            learning_progress = active_roadmap.progress_percentage
        
        resources_completed = UserResourceProgress.objects.filter(
            user=user, status='completed'
        ).count()
        resources_in_progress = UserResourceProgress.objects.filter(
            user=user, status='in_progress'
        ).count()
        
        # Interview progress
        interview_sessions = InterviewSession.objects.filter(user=user)
        total_interviews = interview_sessions.count()
        completed_interviews = interview_sessions.filter(status='completed').count()
        avg_interview_score = interview_sessions.filter(
            status='completed'
        ).aggregate(avg=Avg('average_score'))['avg'] or 0
        
        # Job recommendations
        job_recs = JobRecommendation.objects.filter(
            user=user
        ).select_related('job').order_by('-match_score')[:3]
        recommended_jobs = [
            {
                'id': rec.job.id,
                'title': rec.job.title,
                'company': rec.job.company,
                'match_score': rec.match_score,
            }
            for rec in job_recs
        ]
        
        # Calculate career readiness
        readiness_components = []
        if resume_score > 0:
            readiness_components.append(resume_score * 0.25)
        if latest_gap:
            readiness_components.append(latest_gap.match_percentage * 0.30)
        if learning_progress > 0:
            readiness_components.append(learning_progress * 0.25)
        if avg_interview_score > 0:
            readiness_components.append(avg_interview_score * 0.20)
        
        if readiness_components:
            career_readiness = round(sum(readiness_components) / (len(readiness_components) * 0.25) * 25, 1)
            career_readiness = min(career_readiness, 100)
            # Update profile
            if profile:
                profile.career_readiness_score = career_readiness
                profile.save(update_fields=['career_readiness_score'])
        
        return Response({
            'resume': resume_data,
            'resume_score': resume_score,
            'career_readiness': career_readiness,
            'target_role': target_role,
            'skills_count': skills_count,
            'strong_skills': strong_skills,
            'missing_skills': missing_skills,
            'skill_match': skill_match,
            'learning_progress': learning_progress,
            'resources_completed': resources_completed,
            'resources_in_progress': resources_in_progress,
            'total_interviews': total_interviews,
            'completed_interviews': completed_interviews,
            'avg_interview_score': round(avg_interview_score, 1),
            'recommended_jobs': recommended_jobs,
        })
