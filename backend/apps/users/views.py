from django.contrib.auth import get_user_model
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

import secrets

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError as DjangoValidationError

from .serializers import UserSerializer
from .google_auth import verify_google_token
from apps.jobs.models import Company
from apps.jobs.permissions import IsAdminUserType

User = get_user_model()


def get_frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")


def build_company_kwargs(company_name, cnpj, recruiter, extra_data=None):
    """
    Monta kwargs seguros para Company, sem passar campos que não existam no model.
    """
    extra_data = extra_data or {}
    company_field_names = {
        field.name for field in Company._meta.get_fields()
    }

    kwargs = {
        "name": company_name,
        "cnpj": cnpj,
        "recruiter": recruiter,
    }

    if "status" in company_field_names:
        kwargs["status"] = "PENDENTE"

    for optional_field in ["logo_url", "site_url", "feedback"]:
        if optional_field in company_field_names and extra_data.get(optional_field):
            kwargs[optional_field] = extra_data[optional_field]

    return kwargs


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"detail": "Token do Google é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_data = verify_google_token(token)
        if not google_data:
            return Response(
                {"detail": "Token do Google inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = google_data.get("email")

        if not email:
            return Response(
                {"detail": "E-mail não encontrado no token do Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email.endswith("@aluno.ifce.edu.br"):
            return Response(
                {"detail": "Apenas e-mails @aluno.ifce.edu.br são permitidos."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.get(email=email)

            if not user.is_active:
                return Response(
                    {"detail": "Sua conta está desativada. Entre em contato com o administrador."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {
                    "detail": "Usuário não cadastrado. Por favor, realize o cadastro primeiro.",
                    "google_data": {
                        "email": email,
                        "nome": google_data.get("name"),
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]

        if self.action in ["accept_invite", "reset_password_request", "reset_password_confirm"]:
            return [permissions.AllowAny()]

        if self.action in [
            "invite_admin",
            "invite_recruiter",
            "list",
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "toggle_active",
        ]:
            return [permissions.IsAuthenticated(), IsAdminUserType()]

        if self.action in ["me", "change_password"]:
            return [permissions.IsAuthenticated()]

        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=["get", "put", "delete"], url_path="me")
    def me(self, request):
        user = request.user

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method == "PUT":
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == "DELETE":
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="invite-admin")
    def invite_admin(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email:
            raise ValidationError({"email": "E-mail é obrigatório."})

        expected_code = getattr(settings, "ADMIN_INVITE_CODE", "HIREFY-ADMIN-2026")
        if code != expected_code:
            raise ValidationError({"code": "Código de validação inválido."})

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "Já existe um usuário com este e-mail."})

        nome_base = email.split("@")[0].replace(".", " ").title()
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
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
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

    @action(detail=True, methods=["patch"], url_path="toggle-active")
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

    @action(detail=False, methods=["post"], url_path="invite-recruiter")
    def invite_recruiter(self, request):
        nome = request.data.get("nome")
        email = request.data.get("email")
        company_name = request.data.get("company_name")
        cnpj = request.data.get("cnpj")

        if not nome:
            raise ValidationError({"nome": "Nome é obrigatório."})
        if not email:
            raise ValidationError({"email": "E-mail é obrigatório."})
        if not company_name:
            raise ValidationError({"company_name": "Nome da empresa é obrigatório."})
        if not cnpj:
            raise ValidationError({"cnpj": "CNPJ é obrigatório."})

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "Já existe um usuário com este e-mail."})

        if Company.objects.filter(cnpj=cnpj).exists():
            raise ValidationError({"cnpj": "Já existe uma empresa com este CNPJ."})

        temp_password = secrets.token_urlsafe(10)

        with transaction.atomic():
            recruiter = User.objects.create_user(
                email=email,
                nome=nome,
                password=temp_password,
                user_type="RECRUTADOR",
                is_active=False,
            )

            company_kwargs = build_company_kwargs(
                company_name=company_name,
                cnpj=cnpj,
                recruiter=recruiter,
            )
            company = Company.objects.create(**company_kwargs)

        frontend_url = get_frontend_url()
        uid = urlsafe_base64_encode(force_bytes(recruiter.pk))
        token = default_token_generator.make_token(recruiter)
        invite_link = f"{frontend_url}/aceitar-convite?uid={uid}&token={token}"

        send_mail(
            subject="Convite para a plataforma Hirefy",
            message=(
                f"Olá, {nome}!\n\n"
                f"Sua empresa foi convidada para acessar o Hirefy.\n\n"
                f"Empresa: {company_name}\n"
                f"CNPJ: {cnpj}\n"
                f"E-mail de acesso: {email}\n\n"
                f"Para finalizar o cadastro e criar sua senha, acesse:\n"
                f"{invite_link}\n\n"
                f"Se preferir, você também pode usar a senha temporária abaixo, caso sua tela utilize esse fluxo:\n"
                f"{temp_password}\n"
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": "Convite de empresa enviado com sucesso.",
                "temp_password": temp_password,
                "invite_link": invite_link,
                "user": self.get_serializer(recruiter).data,
                "company": {
                    "id": company.id,
                    "name": company.name,
                    "cnpj": company.cnpj,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="accept-invite")
    def accept_invite(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not uidb64 or not token or not password or not confirm_password:
            raise ValidationError({
                "detail": "Todos os campos são obrigatórios."
            })

        if password != confirm_password:
            raise ValidationError({
                "confirm_password": "As senhas não coincidem."
            })

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            raise ValidationError({
                "detail": "Link de convite inválido ou expirado."
            })

        try:
            validate_password(password, user=user)
        except DjangoValidationError as e:
            raise ValidationError({"password": e.messages})

        user.set_password(password)
        user.is_active = True
        user.save(update_fields=["password", "is_active"])

        return Response(
            {
                "detail": "Cadastro finalizado com sucesso. Você já pode fazer login."
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password:
            raise ValidationError({"current_password": "Senha atual é obrigatória."})

        if not new_password:
            raise ValidationError({"new_password": "Nova senha é obrigatória."})

        if not confirm_password:
            raise ValidationError({"confirm_password": "Confirmação de senha é obrigatória."})

        if not request.user.check_password(current_password):
            raise ValidationError({"current_password": "Senha atual incorreta."})

        if new_password != confirm_password:
            raise ValidationError({"confirm_password": "As senhas não coincidem."})

        try:
            validate_password(new_password, user=request.user)
        except DjangoValidationError as e:
            raise ValidationError({"new_password": e.messages})

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        return Response(
            {"detail": "Senha alterada com sucesso."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="reset-password-request")
    def reset_password_request(self, request):
        email = request.data.get("email")

        if not email:
            raise ValidationError({"email": "O e-mail é obrigatório."})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": "Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve."
                },
                status=status.HTTP_200_OK,
            )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"{get_frontend_url()}/redefinir-senha?uid={uid}&token={token}"

        send_mail(
            subject="Recuperação de senha - Hirefy",
            message=(
                f"Olá, {user.nome}!\n\n"
                f"Recebemos uma solicitação para redefinir sua senha.\n\n"
                f"Use o link abaixo para continuar:\n"
                f"{reset_link}\n\n"
                f"Se você não solicitou isso, ignore esta mensagem."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": "Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve."
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="reset-password-confirm")
    def reset_password_confirm(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")
        confirm_password = request.data.get("confirm_password")

        if not all([uidb64, token, new_password, confirm_password]):
            raise ValidationError({"detail": "Todos os campos são obrigatórios."})

        if new_password != confirm_password:
            raise ValidationError({"detail": "As senhas não coincidem."})

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            raise ValidationError({"detail": "Link de recuperação inválido ou expirado."})

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            raise ValidationError({"password": e.messages})

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"detail": "Senha redefinida com sucesso."},
            status=status.HTTP_200_OK,
        )