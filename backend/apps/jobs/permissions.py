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

        # Admin pode tudo
        if request.user.user_type == 'ADMIN':
            return True

        # Leitura liberada
        if request.method in permissions.SAFE_METHODS:
            return True

        # Apenas recrutador dono da vaga
        return obj.company.recruiter == request.user


class IsAdminUserType(permissions.BasePermission):
    """
    Permissão exclusiva para administradores.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'ADMIN'
        )