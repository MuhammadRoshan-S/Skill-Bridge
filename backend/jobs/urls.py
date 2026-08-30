from django.urls import path
from .views import JobRecommendationsView, JobDetailView

urlpatterns = [
    path('recommendations/', JobRecommendationsView.as_view(), name='job_recommendations'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),
]
