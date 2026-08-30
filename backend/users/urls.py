from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, CurrentUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', csrf_exempt(TokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('refresh/', csrf_exempt(TokenRefreshView.as_view()), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
