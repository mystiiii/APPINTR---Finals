from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import User, OvertimeRequest, Log
from .serializers import UserSerializer, OvertimeRequestSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class OvertimeListView(generics.ListAPIView):
    queryset = OvertimeRequest.objects.all().order_by('-created_at')
    serializer_class = OvertimeRequestSerializer

class OvertimeSubmitView(generics.CreateAPIView):
    queryset = OvertimeRequest.objects.all()
    serializer_class = OvertimeRequestSerializer

    def perform_create(self, serializer):
        # The request payload should contain 'employee_id' as per serializer
        instance = serializer.save()
        # Create a log entry
        Log.objects.create(
            user=instance.employee,
            action="Submitted Overtime Request",
            overtime_request=instance,
            details=f"{instance.hours} hours on {instance.date}"
        )

class OvertimeApproveView(APIView):
    def patch(self, request, pk):
        overtime_request = get_object_or_404(OvertimeRequest, pk=pk)
        
        # Approve the request
        overtime_request.status = 'APPROVED'
        overtime_request.save()

        # Try to find a user id in the payload to represent the manager who approved.
        # For simplicity, if not provided, leave user as None.
        manager_id = request.data.get('manager_id')
        manager = None
        if manager_id:
            manager = User.objects.filter(id=manager_id).first()

        Log.objects.create(
            user=manager,
            action="Approved Overtime Request",
            overtime_request=overtime_request,
            details=f"Approved request ID {overtime_request.id}"
        )

        serializer = OvertimeRequestSerializer(overtime_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OvertimeDisapproveView(APIView):
    def patch(self, request, pk):
        overtime_request = get_object_or_404(OvertimeRequest, pk=pk)
        
        # Reject the request
        overtime_request.status = 'REJECTED'
        overtime_request.save()

        manager_id = request.data.get('manager_id')
        manager = None
        if manager_id:
            manager = User.objects.filter(id=manager_id).first()

        Log.objects.create(
            user=manager,
            action="Rejected Overtime Request",
            overtime_request=overtime_request,
            details=f"Rejected request ID {overtime_request.id}"
        )

        serializer = OvertimeRequestSerializer(overtime_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
