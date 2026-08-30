from django.urls import path
from .views import (
    ResumeUploadView, ResumeListView, ResumeDetailView,
    ResumeAnalyzeView, ResumeActivateView, ActiveResumeAnalysisView
)

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume_upload'),
    path('list/', ResumeListView.as_view(), name='resume_list'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume_detail'),
    path('<int:pk>/analyze/', ResumeAnalyzeView.as_view(), name='resume_analyze'),
    path('<int:pk>/activate/', ResumeActivateView.as_view(), name='resume_activate'),
    path('active-analysis/', ActiveResumeAnalysisView.as_view(), name='active_resume_analysis'),
]
