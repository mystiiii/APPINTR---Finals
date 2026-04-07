from django.urls import path
from .views import (
    UserListView, OvertimeListView, OvertimeSubmitView, OvertimeApproveView
)

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('overtime/', OvertimeListView.as_view(), name='overtime-list'),
    path('overtime/submit/', OvertimeSubmitView.as_view(), name='overtime-submit'),
    path('overtime/approve/<int:pk>/', OvertimeApproveView.as_view(), name='overtime-approve'),
]
