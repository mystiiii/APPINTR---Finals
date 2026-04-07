from django.urls import path
from .views import (
    UserListView, OvertimeListView, OvertimeSubmitView, OvertimeApproveView, OvertimeDisapproveView
)

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('overtime/', OvertimeListView.as_view(), name='overtime-list'),
    path('overtime/submit/', OvertimeSubmitView.as_view(), name='overtime-submit'),
    path('overtime/approve/<int:pk>/', OvertimeApproveView.as_view(), name='overtime-approve'),
    path('overtime/disapprove/<int:pk>/', OvertimeDisapproveView.as_view(), name='overtime-disapprove'),
]
