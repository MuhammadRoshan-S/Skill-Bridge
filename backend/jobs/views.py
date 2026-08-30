import urllib.parse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Job, JobRecommendation
from .serializers import JobSerializer, JobRecommendationSerializer


class JobRecommendationsView(APIView):
    """Get or generate real AI-powered job recommendations for the user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        recommendations = JobRecommendation.objects.filter(
            user=request.user
        ).select_related('job').order_by('-match_score')
        
        if not recommendations.exists():
            return self._generate_recommendations(request)
            
        serializer = JobRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Generate new job recommendations using Gemini AI."""
        return self._generate_recommendations(request)

    def _generate_recommendations(self, request):
        from ai_service.service import generate_job_recommendations
        from skills.models import UserSkill, JobRole
        from resumes.models import Resume
        
        try:
            # 1. Aggregate skills from UserSkill
            user_skills = list(
                UserSkill.objects.filter(user=request.user)
                .values_list('skill__name', flat=True)
            )
            
            # 2. Also aggregate skills from active resume analysis
            active_resume = Resume.objects.filter(
                user=request.user, is_active=True
            ).select_related('analysis').first()
            
            if active_resume and hasattr(active_resume, 'analysis') and active_resume.analysis.extracted_skills:
                for sk in active_resume.analysis.extracted_skills:
                    if sk not in user_skills:
                        user_skills.append(sk)
            
            # 3. Determine filters from request
            filters = {
                'role': request.data.get('role') or request.data.get('target_role') or request.query_params.get('role') or request.query_params.get('target_role') or '',
                'location': request.data.get('location') or request.query_params.get('location') or 'Kochi, Kerala, India',
                'radius': request.data.get('radius') or request.query_params.get('radius') or '25 km',
                'job_type': request.data.get('job_type') or request.query_params.get('job_type') or 'all',
                'experience_level': request.data.get('experience_level') or request.query_params.get('experience_level') or 'All Levels',
                'work_mode': request.data.get('work_mode') or request.query_params.get('work_mode') or 'All',
                'salary_range': request.data.get('salary_range') or request.query_params.get('salary_range') or 'All',
            }

            custom_role = filters['role']
            target_role = None
            if custom_role:
                target_role, _ = JobRole.objects.get_or_create(
                    title=custom_role.strip(),
                    defaults={'industry': 'Technology', 'description': f'Role for {custom_role}'}
                )
            elif hasattr(request.user, 'profile') and request.user.profile.target_role:
                target_role = request.user.profile.target_role

            jobs_data = generate_job_recommendations(user_skills, target_role, filters=filters)
            
            # Clear old recommendations for fresh alignment
            JobRecommendation.objects.filter(user=request.user).delete()
            
            recommendations = []
            for job_data in jobs_data:
                title = job_data.get('title', 'Software Engineer')
                company = job_data.get('company', 'Tech Company')
                
                # Construct clean direct apply / search URL if missing
                url = job_data.get('url')
                if not url or not url.startswith('http'):
                    query = urllib.parse.quote_plus(f"{title} {company}")
                    url = f"https://www.linkedin.com/jobs/search/?keywords={query}"
                
                job, _ = Job.objects.update_or_create(
                    title=title,
                    company=company,
                    defaults={
                        'location': job_data.get('location', filters['location']),
                        'job_type': job_data.get('job_type', 'full_time'),
                        'work_mode': job_data.get('work_mode', 'On-site'),
                        'experience_level': job_data.get('experience_level', '2-5 Yrs Exp'),
                        'salary_display': job_data.get('salary_display', '₹6 - ₹10 LPA'),
                        'source': job_data.get('source', 'LinkedIn'),
                        'posted_time_text': job_data.get('posted_time_text', 'Just now'),
                        'description': job_data.get('description', ''),
                        'requirements': job_data.get('requirements', []),
                        'salary_min': job_data.get('salary_min', 0),
                        'salary_max': job_data.get('salary_max', 0),
                        'url': url,
                    }
                )
                
                rec = JobRecommendation.objects.create(
                    user=request.user,
                    job=job,
                    match_score=job_data.get('match_score', 85),
                    matching_skills=job_data.get('matching_skills', []),
                    missing_skills=job_data.get('missing_skills', []),
                )
                recommendations.append(rec)
            
            # Sort recommendations by sort preference if requested
            sort_by = request.data.get('sort_by') or request.query_params.get('sort_by')
            if sort_by == 'newest':
                recommendations.sort(key=lambda r: r.job.posted_at, reverse=True)
            elif sort_by == 'salary':
                recommendations.sort(key=lambda r: r.job.salary_max or r.job.salary_min, reverse=True)
            else:
                recommendations.sort(key=lambda r: r.match_score, reverse=True)

            serializer = JobRecommendationSerializer(recommendations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': f'Job recommendation generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class JobDetailView(generics.RetrieveAPIView):
    """Get details for a specific job."""
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    queryset = Job.objects.all()
