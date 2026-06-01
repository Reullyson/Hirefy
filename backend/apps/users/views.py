from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
import secrets

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError

from .serializers import UserSerializer, InviteRecruiterSerializer, AcceptInviteSerializer
from .google_auth import verify_google_token
from apps.jobs.permissions import IsAdminUserType

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token do Google é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        google_data = verify_google_token(token)
        if not google_data:
            return Response({'detail': 'Token do Google inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        email = google_data.get('email')
        
        # Validar domínio acadêmico
        if not email.endswith('@aluno.ifce.edu.br'):
            return Response({'detail': 'Apenas e-mails @aluno.ifce.edu.br são permitidos.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(email=email)
            
            if not user.is_active:
                return Response({'detail': 'Sua conta está desativada. Entre em contato com o administrador.'}, status=status.HTTP_403_FORBIDDEN)
                
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'detail': 'Usuário não cadastrado. Por favor, realize o cadastro primeiro.',
                'google_data': {
                    'email': email,
                    'nome': google_data.get('name')
                }
            }, status=status.HTTP_404_NOT_FOUND)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == "create":
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
            return [
                permissions.IsAuthenticated(),
                IsAdminUserType(),
            ]

        if self.action == "accept_invite":
            return [permissions.AllowAny()]

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

    @action(detail=False, methods=['post'], url_path='invite-recruiter')
    def invite_recruiter(self, request):
        serializer = InviteRecruiterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Criar o usuário como RECRUTADOR e inativo
        data = serializer.validated_data
        user_data = {
            'email': data['email'],
            'nome': data['nome'],
            'user_type': 'RECRUTADOR',
            'is_active': False,
            'company_name': data['company_name'],
            'cnpj': data['cnpj']
        }
        
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        
        # Gerar token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Enviar email
        invite_link = f"{settings.FRONTEND_URL}/aceitar-convite?uid={uid}&token={token}"
        
        subject = 'Convite para a Plataforma Hirefy'
        message = f'Olá {user.nome},\n\nVocê foi convidado para se cadastrar como recrutador na plataforma Hirefy pela empresa {data["company_name"]}.\n\nPara completar seu cadastro e definir sua senha, acesse o link abaixo:\n\n{invite_link}\n\nAtenciosamente,\nEquipe Hirefy'
        
        try:
            send_mail(
                subject,
                message,
                getattr(settings, "DEFAULT_FROM_EMAIL", None),
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'detail': f'Erro ao enviar e-mail: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'detail': 'Convite enviado com sucesso.'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='accept-invite')
    def accept_invite(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.is_active = True
            user.save()
            return Response({'detail': 'Cadastro finalizado com sucesso. Você já pode fazer login.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Link de convite inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

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
