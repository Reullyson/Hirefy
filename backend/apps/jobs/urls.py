from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, JobViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'jobs', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
]
