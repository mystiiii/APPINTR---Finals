from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    MeView,
    OvertimeListView,
    OvertimeSubmitView,
    OvertimeApproveView,
    OvertimeDisapproveView,
)

urlpatterns = [
    # --- Authentication ---
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # --- Overtime (Protected) ---
    path('overtime/', OvertimeListView.as_view(), name='overtime-list'),
    path('overtime/submit/', OvertimeSubmitView.as_view(), name='overtime-submit'),
    path('overtime/approve/<int:pk>/', OvertimeApproveView.as_view(), name='overtime-approve'),
    path('overtime/disapprove/<int:pk>/', OvertimeDisapproveView.as_view(), name='overtime-disapprove'),
]
