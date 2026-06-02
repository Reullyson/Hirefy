from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, GoogleLoginView, ResumeGeneratorView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('profile/resume/', ResumeGeneratorView.as_view(), name='resume_generate'),
    path('', include(router.urls)),
]