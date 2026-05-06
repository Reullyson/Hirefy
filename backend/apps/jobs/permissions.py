from rest_framework import permissions

class IsRecruiterOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.user_type in ['RECRUTADOR', 'ADMIN']
        )

class IsOwnerRecruiterOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.user_type == 'ADMIN':
            return True
        
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner recruiter
        return obj.company.recruiter == request.user
