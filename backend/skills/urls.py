from django.urls import path
from .views import (
    SkillListView, SkillCategoryListView, JobRoleListView,
    JobRoleDetailView, UserSkillsView, UserSkillDeleteView,
    SkillGapAnalyzeView, LatestSkillGapView
)

urlpatterns = [
    path('list/', SkillListView.as_view(), name='skill_list'),
    path('categories/', SkillCategoryListView.as_view(), name='skill_categories'),
    path('roles/', JobRoleListView.as_view(), name='job_role_list'),
    path('roles/<int:pk>/', JobRoleDetailView.as_view(), name='job_role_detail'),
    path('my-skills/', UserSkillsView.as_view(), name='user_skills'),
    path('my-skills/<int:pk>/', UserSkillDeleteView.as_view(), name='user_skill_delete'),
    path('gap-analysis/', SkillGapAnalyzeView.as_view(), name='skill_gap_analyze'),
    path('gap-analysis/latest/', LatestSkillGapView.as_view(), name='latest_skill_gap'),
]
