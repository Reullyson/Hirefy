from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
import secrets

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .serializers import UserSerializer
from apps.jobs.permissions import IsAdminUserType

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]

        if self.action in [
            "invite_admin",
            "list",
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "toggle_active",
        ]:
            return [
                permissions.IsAuthenticated(),
                IsAdminUserType(),
            ]

        return [permissions.IsAuthenticated()]

    @action(
        detail=False,
        methods=["get", "put", "delete"],
        url_path="me",
    )
    def me(self, request):
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == "PUT":
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True,
            )

            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

        elif request.method == "DELETE":
            user.delete()

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

    @action(
        detail=False,
        methods=["post"],
        url_path="invite-admin",
    )
    def invite_admin(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email:
            raise ValidationError({
                "email": "E-mail é obrigatório."
            })

        expected_code = getattr(
            settings,
            "ADMIN_INVITE_CODE",
            "HIREFY-ADMIN-2026",
        )

        if code != expected_code:
            raise ValidationError({
                "code": "Código de validação inválido."
            })

        if User.objects.filter(email=email).exists():
            raise ValidationError({
                "email": "Já existe um usuário com este e-mail."
            })

        nome_base = (
            email
            .split("@")[0]
            .replace(".", " ")
            .title()
        )

        temp_password = secrets.token_urlsafe(10)

        user = User.objects.create_user(
            email=email,
            nome=nome_base,
            password=temp_password,
            user_type="ADMIN",
            is_active=True,
        )

        send_mail(
            subject="Convite para administração do Hirefy",
            message=(
                f"Olá, {nome_base}!\n\n"
                f"Você foi convidado para acessar o painel administrativo do Hirefy.\n\n"
                f"Credenciais de acesso:\n"
                f"E-mail: {email}\n"
                f"Senha temporária: {temp_password}\n\n"
                f"Após entrar no sistema, altere sua senha imediatamente."
            ),
            from_email=getattr(
                settings,
                "DEFAULT_FROM_EMAIL",
                None,
            ),
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": "Administrador convidado com sucesso.",
                "temp_password": temp_password,
                "user": self.get_serializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="toggle-active",
    )
    def toggle_active(self, request, pk=None):
        user = self.get_object()

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        return Response(
            {
                "id": user.id,
                "is_active": user.is_active,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="change-password",
    )
    def change_password(self, request):
        current_password = request.data.get(
            "current_password"
        )

        new_password = request.data.get(
            "new_password"
        )

        confirm_password = request.data.get(
            "confirm_password"
        )

        if not current_password:
            raise ValidationError({
                "current_password": (
                    "Senha atual é obrigatória."
                )
            })

        if not new_password:
            raise ValidationError({
                "new_password": (
                    "Nova senha é obrigatória."
                )
            })

        if not confirm_password:
            raise ValidationError({
                "confirm_password": (
                    "Confirmação de senha é obrigatória."
                )
            })

        if not request.user.check_password(
            current_password
        ):
            raise ValidationError({
                "current_password": (
                    "Senha atual incorreta."
                )
            })

        if new_password != confirm_password:
            raise ValidationError({
                "confirm_password": (
                    "As senhas não coincidem."
                )
            })

        validate_password(
            new_password,
            user=request.user,
        )

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        return Response(
            {
                "detail": (
                    "Senha alterada com sucesso."
                )
            },
            status=status.HTTP_200_OK,
        )