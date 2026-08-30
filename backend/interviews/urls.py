from django.urls import path
from .views import (
    InterviewSessionCreateView, InterviewSessionListView,
    InterviewSessionDetailView, SubmitAnswerView
)

urlpatterns = [
    path('create-session/', InterviewSessionCreateView.as_view(), name='interview_create'),
    path('sessions/', InterviewSessionListView.as_view(), name='interview_list'),
    path('sessions/<int:pk>/', InterviewSessionDetailView.as_view(), name='interview_detail'),
    path('submit-answer/', SubmitAnswerView.as_view(), name='submit_answer'),
]
