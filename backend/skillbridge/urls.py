"""
SkillBridge URL Configuration — Main router.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/profile/', include('users.profile_urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/roadmap/', include('roadmap.urls')),
    path('api/interviews/', include('interviews.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
