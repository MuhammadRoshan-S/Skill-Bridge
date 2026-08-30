from django.urls import path
from .views import (
    RoadmapGenerateView, RoadmapListView, RoadmapDetailView,
    ActiveRoadmapView, MilestoneCompleteView, ResourceListView,
    ResourceProgressUpdateView
)

urlpatterns = [
    path('generate/', RoadmapGenerateView.as_view(), name='roadmap_generate'),
    path('list/', RoadmapListView.as_view(), name='roadmap_list'),
    path('active/', ActiveRoadmapView.as_view(), name='active_roadmap'),
    path('<int:pk>/', RoadmapDetailView.as_view(), name='roadmap_detail'),
    path('milestones/<int:pk>/complete/', MilestoneCompleteView.as_view(), name='milestone_complete'),
    path('resources/', ResourceListView.as_view(), name='resource_list'),
    path('resources/<int:pk>/progress/', ResourceProgressUpdateView.as_view(), name='resource_progress'),
]
